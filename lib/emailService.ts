import nodemailer from "nodemailer";
import { Lead, LeadEmail, emailsDB, settingsDB } from "./db";

// Interface for template placeholders
interface PlaceholderData {
  full_name?: string;
  first_name?: string;
  email?: string;
  phone?: string;
  service_interested?: string;
  company_name?: string;
  lead_id?: string;
  submitted_at?: string;
  admin_name?: string;
  [key: string]: any;
}

// Function to compile template
export function compileTemplate(text: string, data: PlaceholderData): string {
  if (!text) return "";
  let compiled = text;
  
  // Custom first_name extraction if not present
  const placeholders: PlaceholderData = { ...data };
  if (!placeholders.first_name && placeholders.full_name) {
    placeholders.first_name = placeholders.full_name.split(" ")[0];
  }
  
  Object.entries(placeholders).forEach(([key, val]) => {
    const placeholder = `{{${key}}}`;
    const stringVal = val !== undefined && val !== null ? String(val) : "";
    compiled = compiled.replaceAll(placeholder, stringVal);
  });
  
  return compiled;
}

// Create nodemailer transporter
function getTransporter() {
  const host = process.env.EMAIL_HOST || "";
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const user = process.env.EMAIL_HOST_USER || "";
  const pass = process.env.EMAIL_HOST_PASSWORD || "";
  const secure = process.env.EMAIL_USE_TLS === "true" ? (port === 465) : false;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Format lead details for Admin Notification HTML Table
function generateAdminLeadHtmlTable(lead: Lead): string {
  const rows = [
    { label: "Lead ID", val: lead.id },
    { label: "Full Name", val: lead.full_name },
    { label: "Email", val: lead.email },
    { label: "Phone Number", val: lead.phone },
    { label: "WhatsApp Number", val: lead.whatsapp_number },
    { label: "Company", val: lead.company_name },
    { label: "Location", val: lead.location },
    { label: "Interested Service", val: lead.service_interested },
    { label: "Preferred Contact Method", val: lead.preferred_contact_method },
    { label: "Source", val: lead.source },
    { label: "Submitted Page URL", val: lead.page_url },
    { label: "Submission Date & Time", val: new Date(lead.created_at).toLocaleString() },
    { label: "Message / Enquiry", val: lead.message },
  ];

  // Add custom form fields
  if (lead.form_data) {
    Object.entries(lead.form_data).forEach(([key, value]) => {
      // Avoid duplicate keys
      const standardKeys = ["full_name", "email", "phone", "whatsapp_number", "company_name", "location", "service_interested", "message", "preferred_contact_method"];
      if (!standardKeys.includes(key)) {
        rows.push({ label: `Custom Field (${key})`, val: String(value) });
      }
    });
  }

  // Filter out empty or N/A values
  const filteredRows = rows.filter(row => {
    if (!row.val) return false;
    const clean = String(row.val).trim();
    return clean !== "" && clean.toLowerCase() !== "n/a";
  });

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-family: sans-serif; font-size: 14px; color: #333;">
      <thead>
        <tr style="background-color: #041a27; color: white;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Field</th>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Details</th>
        </tr>
      </thead>
      <tbody>
        ${filteredRows
          .map(
            (row, idx) => `
          <tr style="background-color: ${idx % 2 === 0 ? "#f8f9fa" : "#ffffff"};">
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 35%;">${row.label}</td>
            <td style="padding: 10px; border: 1px solid #ddd; word-break: break-all;">${row.val}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

// Generate Admin Notification Plain Text
function generateAdminLeadPlainText(lead: Lead, detailsUrl: string): string {
  let text = `New Lead Received:\n\n`;
  const rows = [
    { label: "Lead ID", val: lead.id },
    { label: "Full Name", val: lead.full_name },
    { label: "Email", val: lead.email },
    { label: "Phone Number", val: lead.phone },
    { label: "WhatsApp Number", val: lead.whatsapp_number },
    { label: "Company", val: lead.company_name },
    { label: "Location", val: lead.location },
    { label: "Interested Service", val: lead.service_interested },
    { label: "Preferred Contact Method", val: lead.preferred_contact_method },
    { label: "Source", val: lead.source },
    { label: "Submitted Page URL", val: lead.page_url },
    { label: "Submission Date", val: new Date(lead.created_at).toLocaleString() },
    { label: "Message", val: lead.message },
  ];

  if (lead.form_data) {
    Object.entries(lead.form_data).forEach(([key, value]) => {
      const standardKeys = ["full_name", "email", "phone", "whatsapp_number", "company_name", "location", "service_interested", "message", "preferred_contact_method"];
      if (!standardKeys.includes(key)) {
        rows.push({ label: key, val: String(value) });
      }
    });
  }

  // Filter and build plain text
  rows.forEach(row => {
    if (row.val) {
      const clean = String(row.val).trim();
      if (clean !== "" && clean.toLowerCase() !== "n/a") {
        text += `${row.label}: ${row.val}\n`;
      }
    }
  });

  text += `\nView details in Admin Dashboard: ${detailsUrl}\n`;
  return text;
}

// Main helper to process and send a single email record
export async function sendEmailTask(emailLogId: string): Promise<boolean> {
  const emailLog = emailsDB.getById(emailLogId);
  if (!emailLog) {
    console.error(`Email log with ID ${emailLogId} not found.`);
    return false;
  }

  // Update status to pending if not already
  emailsDB.update(emailLogId, { status: "pending" });

  const backend = process.env.EMAIL_BACKEND || "console";
  const defaultFrom = process.env.DEFAULT_FROM_EMAIL || "no-reply@divehubmarineservices.com";

  try {
    if (backend === "smtp") {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: defaultFrom,
        to: emailLog.recipient,
        cc: emailLog.cc || undefined,
        bcc: emailLog.bcc || undefined,
        subject: emailLog.subject,
        html: emailLog.message.includes("<html") || emailLog.message.includes("<div") || emailLog.message.includes("<p") ? emailLog.message : `<div style="font-family: sans-serif; font-size: 15px; line-height: 1.5; color: #333; white-space: pre-line;">${emailLog.message}</div>`,
        text: emailLog.message.replace(/<[^>]*>/g, ""), // simple fallback text strips HTML tags
      });
    } else {
      // Simulate console log
      console.log(`[EMAIL SEND SIMULATION]`);
      console.log(`From: ${defaultFrom}`);
      console.log(`To: ${emailLog.recipient}`);
      console.log(`CC: ${emailLog.cc}`);
      console.log(`BCC: ${emailLog.bcc}`);
      console.log(`Subject: ${emailLog.subject}`);
      console.log(`Body:\n${emailLog.message}`);
      console.log(`[END SIMULATION]`);
    }

    emailsDB.update(emailLogId, {
      status: "sent",
      sent_at: new Date().toISOString(),
      error_message: ""
    });
    return true;
  } catch (error: any) {
    console.error(`Failed to send email ${emailLogId}:`, error);
    emailsDB.update(emailLogId, {
      status: "failed",
      error_message: error.message || "Unknown SMTP error occurred."
    });
    return false;
  }
}

// Queue lead-related emails in the background (swallowing errors so lead creation isn't blocked)
export function queueLeadSubmissionEmails(lead: Lead) {
  // Use a promise to keep this non-blocking
  Promise.resolve().then(async () => {
    try {
      const config = settingsDB.get();
      const settings = config.settings;
      const frontUrl = process.env.ADMIN_FRONTEND_URL || "http://localhost:3000";
      const detailsUrl = `${frontUrl}/admin/leads/${lead.id}`;

      // A. Admin notification email
      const adminRecipient = settings.notification_email || "admin@example.com";
      const adminSubject = `New Lead Received – ${lead.full_name}`;
      
      const adminHtmlTable = generateAdminLeadHtmlTable(lead);
      const adminHtmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Lead Received</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 30px 10px;">
            <tr>
              <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                  <!-- Header with Logo -->
                  <tr>
                    <td align="center" style="background-color: #03131d; padding: 25px 20px; border-bottom: 3px solid #22d3ee;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">
                        DIVE HUB MARINE
                      </h1>
                      <span style="color: #22d3ee; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.25em;">
                        Lead Notification
                      </span>
                    </td>
                  </tr>
                  <!-- Body Content -->
                  <tr>
                    <td style="padding: 30px 40px;">
                      <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700;">
                        Hello Admin,
                      </h2>
                      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
                        A new lead form submission has been captured. Below are the submission details:
                      </p>
                      
                      ${adminHtmlTable}

                      <!-- CTA Button -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 35px; margin-bottom: 10px;">
                        <tr>
                          <td align="center">
                            <a href="${detailsUrl}" target="_blank" style="background-color: #06b6d4; color: #ffffff; padding: 12px 30px; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 4px 10px rgba(6,182,212,0.25); display: inline-block;">
                              View Lead Details
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td align="center" style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 40px; text-align: center;">
                      <p style="color: #64748b; font-size: 11px; line-height: 1.5; margin: 0;">
                        &copy; ${new Date().getFullYear()} Dive Hub Marine Services. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const adminPlainTextBody = generateAdminLeadPlainText(lead, detailsUrl);

      const adminEmailLog = emailsDB.create({
        lead_id: lead.id,
        email_type: "admin_notification",
        recipient: adminRecipient,
        subject: adminSubject,
        message: adminHtmlBody,
        status: "pending"
      });

      // Trigger admin email send
      await sendEmailTask(adminEmailLog.id);

      // B. Confirmation email to the lead
      if (settings.send_lead_confirmation_email && lead.email) {
        const placeholderValues: PlaceholderData = {
          full_name: lead.full_name,
          first_name: lead.full_name.split(" ")[0],
          email: lead.email,
          phone: lead.phone,
          service_interested: lead.service_interested,
          company_name: lead.company_name,
          lead_id: lead.id,
          submitted_at: new Date(lead.created_at).toLocaleString()
        };

        const subjectTemplate = settings.confirmation_email_subject || "Thank you for contacting us";
        const messageTemplate = settings.confirmation_email_message || "We received your enquiry and will contact you shortly.";

        const confSubject = compileTemplate(subjectTemplate, placeholderValues);
        const confMessage = compileTemplate(messageTemplate, placeholderValues);

        const confEmailLog = emailsDB.create({
          lead_id: lead.id,
          email_type: "lead_confirmation",
          recipient: lead.email,
          subject: confSubject,
          message: confMessage,
          status: "pending"
        });

        // Trigger lead email send
        await sendEmailTask(confEmailLog.id);
      }
    } catch (err) {
      console.error("Error in background email sender helper:", err);
    }
  });
}
