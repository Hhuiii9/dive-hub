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

// Required environment variables for email sending
export const REQUIRED_EMAIL_ENV_VARS = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_HOST_USER",
  "EMAIL_HOST_PASSWORD",
  "EMAIL_USE_TLS",
  "DEFAULT_FROM_EMAIL",
  "ADMIN_NOTIFICATION_EMAIL",
  "ADMIN_FRONTEND_URL",
] as const;



// Helper to check missing environment variables
export function checkRequiredEnvVars(): { valid: boolean; missing: string[]; envStatus: Record<string, boolean> } {
  const missing: string[] = [];
  const envStatus: Record<string, boolean> = {
    "EMAIL_HOST exists": Boolean(process.env.EMAIL_HOST),
    "EMAIL_HOST_USER exists": Boolean(process.env.EMAIL_HOST_USER),
    "EMAIL_HOST_PASSWORD exists": Boolean(process.env.EMAIL_HOST_PASSWORD),
    "ADMIN_NOTIFICATION_EMAIL exists": Boolean(process.env.ADMIN_NOTIFICATION_EMAIL),
  };

  REQUIRED_EMAIL_ENV_VARS.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
    envStatus,
  };
}

// Helper to safely log env variable presence without printing secrets
export function logEnvExistenceOnly(): void {
  console.log("EMAIL_HOST exists:", Boolean(process.env.EMAIL_HOST));
  console.log("EMAIL_HOST_USER exists:", Boolean(process.env.EMAIL_HOST_USER));
  console.log("EMAIL_HOST_PASSWORD exists:", Boolean(process.env.EMAIL_HOST_PASSWORD));
  console.log("ADMIN_NOTIFICATION_EMAIL exists:", Boolean(process.env.ADMIN_NOTIFICATION_EMAIL));
}

// Helper to categorize SMTP errors cleanly without exposing secrets
export function categorizeSmtpError(error: any): string {
  if (!error) return "Unknown SMTP error occurred.";
  const msg = typeof error === "string" ? error : error.message || String(error);
  const code = error.code || "";
  const responseCode = error.responseCode || 0;

  if (msg.includes("Missing environment variable")) {
    return msg;
  }
  if (code === "EAUTH" || responseCode === 535 || /invalid login|authentication|auth/i.test(msg)) {
    return "Authentication failed";
  }
  if (code === "ETIMEDOUT" || code === "ESOCKET" || /timeout|timed out/i.test(msg)) {
    return "Timeout";
  }
  if (code === "ECONNREFUSED" || code === "EHOSTUNREACH" || code === "ENOTFOUND" || /connection|connect ECONN/i.test(msg)) {
    return "SMTP connection failed";
  }
  if ((responseCode >= 550 && responseCode <= 559) || /recipient|mailbox/i.test(msg)) {
    return "Recipient rejected";
  }
  if (code.startsWith("E") || /network|dns|socket/i.test(msg)) {
    return "Network error";
  }
  return "SMTP connection failed";
}

// Create nodemailer transporter
export function getTransporter() {
  const host = process.env.EMAIL_HOST || "";
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const user = process.env.EMAIL_HOST_USER || "";
  const pass = process.env.EMAIL_HOST_PASSWORD || "";
  const secure = port === 465;

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

// Main helper to process and send a single email record
export async function sendEmailTask(emailLogId: string): Promise<boolean> {
  const emailLog = emailsDB.getById(emailLogId);
  if (!emailLog) {
    console.error(`Email log with ID ${emailLogId} not found.`);
    return false;
  }

  // Update status to pending if not already
  emailsDB.update(emailLogId, { status: "pending" });

  // Log env existence safely
  logEnvExistenceOnly();

  // Check required env vars
  const envCheck = checkRequiredEnvVars();
  if (!envCheck.valid) {
    const errorMsg = `Missing environment variable: ${envCheck.missing.join(", ")}`;
    console.error(`Failed to send email ${emailLogId}: ${errorMsg}`);
    emailsDB.update(emailLogId, {
      status: "failed",
      error_message: errorMsg
    });
    return false;
  }

  // Default backend to smtp if process.env.EMAIL_HOST exists
  const backend = process.env.EMAIL_BACKEND || (process.env.EMAIL_HOST ? "smtp" : "console");
  const defaultFrom = process.env.DEFAULT_FROM_EMAIL || "no-reply@divehubmarineservices.com";

  try {
    if (backend === "smtp") {
      const transporter = getTransporter();

      // Verify connection before sending
      try {
        await transporter.verify();
      } catch (verifyErr: any) {
        const safeError = categorizeSmtpError(verifyErr);
        console.error(`SMTP verification failed before sending email ${emailLogId}:`, safeError);
        emailsDB.update(emailLogId, {
          status: "failed",
          error_message: safeError
        });
        return false;
      }

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
    const safeError = categorizeSmtpError(error);
    console.error(`Failed to send email ${emailLogId}:`, safeError);
    emailsDB.update(emailLogId, {
      status: "failed",
      error_message: safeError
    });
    return false;
  }
}

// Synchronously send lead-related emails and return delivery status
export async function sendLeadNotificationEmails(lead: Lead): Promise<{ adminSent: boolean; customerSent?: boolean }> {
  let adminSent = false;
  let customerSent = false;

  try {
    const config = settingsDB.get();
    const settings = config.settings;
    const adminRecipient = process.env.ADMIN_NOTIFICATION_EMAIL || settings.notification_email || "divehub@divehubmarineservices.com";
    const frontUrl = process.env.ADMIN_FRONTEND_URL || "http://localhost:3000";
    const detailsUrl = `${frontUrl}/admin/leads/${lead.id}`;

    // A. Admin notification email
    const adminSubject = `New Lead Received – ${lead.full_name || "Enquiry"}`;
    const adminHtmlTable = generateAdminLeadHtmlTable(lead);
    const adminHtmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Lead Received</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
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
                <tr>
                  <td style="padding: 30px 40px;">
                    <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700;">
                      New Lead Received
                    </h2>
                    ${adminHtmlTable}
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 35px; margin-bottom: 10px;">
                      <tr>
                        <td align="center">
                          <a href="${detailsUrl}" target="_blank" style="background-color: #06b6d4; color: #ffffff; padding: 12px 30px; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 4px 10px rgba(6,182,212,0.25); display: inline-block;">
                            View Lead
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
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

    const adminEmailLog = emailsDB.create({
      lead_id: lead.id,
      email_type: "admin_notification",
      recipient: adminRecipient,
      subject: adminSubject,
      message: adminHtmlBody,
      status: "pending"
    });

    adminSent = await sendEmailTask(adminEmailLog.id);

    // B. Customer confirmation email
    const sendCustomerConf = process.env.SEND_LEAD_CONFIRMATION_EMAIL === "true" || settings.send_lead_confirmation_email;
    if (sendCustomerConf && lead.email && lead.email.trim() !== "") {
      const confSubject = "Thank you for contacting Dive Hub Marine";
      const confMessage = `Hello ${lead.full_name || "Valued Customer"},\n\nThank you for contacting Dive Hub Marine.\n\nWe have received your enquiry regarding ${lead.service_interested || "our services"}. Our team will contact you shortly.\n\nReference ID: ${lead.id}\n\nLocation:\nNear Angamaly Railway Station\nAngamaly, Kerala\n\nRegards,\nDive Hub Marine`;

      const confEmailLog = emailsDB.create({
        lead_id: lead.id,
        email_type: "lead_confirmation",
        recipient: lead.email,
        subject: confSubject,
        message: confMessage,
        status: "pending"
      });

      try {
        customerSent = await sendEmailTask(confEmailLog.id);
      } catch (custErr) {
        console.error("Customer confirmation email failed silently:", custErr);
      }
    }
  } catch (err: any) {
    console.error("Error sending lead notification emails:", err.message || err);
  }

  return { adminSent, customerSent };
}

// Alias for requirement 10 compliance
export const sendLeadNotification = sendLeadNotificationEmails;

export function queueLeadSubmissionEmails(lead: Lead) {
  setImmediate(() => {
    sendLeadNotificationEmails(lead).catch((err) => {
      console.error("Background lead email error:", err);
    });
  });
}

// Health check function to test SMTP verification and send test email
export async function testEmailConnectionAndSend(): Promise<{
  success: boolean;
  message: string;
  envStatus: Record<string, boolean>;
  missingVars: string[];
  smtpVerified: boolean;
}> {
  logEnvExistenceOnly();
  const envCheck = checkRequiredEnvVars();

  if (!envCheck.valid) {
    const errorMsg = `Missing environment variable: ${envCheck.missing.join(", ")}`;
    return {
      success: false,
      message: errorMsg,
      envStatus: envCheck.envStatus,
      missingVars: envCheck.missing,
      smtpVerified: false,
    };
  }

  const transporter = getTransporter();

  // Step 1: Verify SMTP Connection
  try {
    await transporter.verify();
  } catch (verifyErr: any) {
    const safeError = categorizeSmtpError(verifyErr);
    return {
      success: false,
      message: safeError,
      envStatus: envCheck.envStatus,
      missingVars: [],
      smtpVerified: false,
    };
  }

  // Step 2: Send Test Email
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || "";
  const defaultFrom = process.env.DEFAULT_FROM_EMAIL || recipient;

  try {
    await transporter.sendMail({
      from: defaultFrom,
      to: recipient,
      subject: "Dive Hub Marine - Email Health Check Test",
      text: "This is a test email sent from the Dive Hub Marine email health-check endpoint to verify production SMTP configuration.",
      html: "<p>This is a test email sent from the Dive Hub Marine email health-check endpoint to verify production SMTP configuration.</p>",
    });

    return {
      success: true,
      message: `Test email sent successfully to ${recipient}`,
      envStatus: envCheck.envStatus,
      missingVars: [],
      smtpVerified: true,
    };
  } catch (sendErr: any) {
    const safeError = categorizeSmtpError(sendErr);
    return {
      success: false,
      message: safeError,
      envStatus: envCheck.envStatus,
      missingVars: [],
      smtpVerified: true,
    };
  }
}


