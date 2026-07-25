import nodemailer from "nodemailer";
import { connectDatabase } from "./mongodb";
import EmailHistoryModel from "./models/EmailHistory";
import LeadFormSettingsModel from "./models/LeadFormSettings";

export interface PlaceholderData {
  full_name?: string;
  first_name?: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  service_interested?: string;
  company_name?: string;
  location?: string;
  message?: string;
  lead_id?: string;
  submitted_at?: string;
  reset_link?: string;
  [key: string]: any;
}

export function compileTemplate(text: string, data: PlaceholderData): string {
  if (!text) return "";
  let compiled = text;

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

export function getTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const user = process.env.EMAIL_HOST_USER;
  const pass = process.env.EMAIL_HOST_PASSWORD;
  const useTls = process.env.EMAIL_USE_TLS === "true" || process.env.EMAIL_USE_TLS === "1";

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP server environment variables (EMAIL_HOST, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: useTls,
    },
  });
}

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
  return "Email delivery failed";
}

export async function sendEmail({
  emailLogId,
  recipient,
  subject,
  html,
  text,
  cc,
  bcc,
}: {
  emailLogId?: string;
  recipient: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string;
  bcc?: string;
}) {
  await connectDatabase();
  const from = process.env.DEFAULT_FROM_EMAIL || "Dive Hub <divehub@divehubmarineservices.com>";

  let emailLog;
  if (emailLogId) {
    emailLog = await EmailHistoryModel.findById(emailLogId);
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to: recipient,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ""),
      html,
    });

    if (emailLog) {
      emailLog.status = "sent";
      emailLog.providerMessageId = info.messageId || "";
      emailLog.sentAt = new Date();
      await emailLog.save();
    }

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    const safeMsg = categorizeSmtpError(error);
    if (emailLog) {
      emailLog.status = "failed";
      emailLog.safeErrorMessage = safeMsg;
      await emailLog.save();
    }
    console.error("[EmailService] Failed to send email:", safeMsg);
    return { success: false, error: safeMsg };
  }
}

export async function handleLeadEmails({ lead }: { lead: any }) {
  await connectDatabase();

  const settingsDoc = await LeadFormSettingsModel.findOne({ name: "default" });
  const settings = settingsDoc?.settings || {
    notification_email: process.env.ADMIN_NOTIFICATION_EMAIL || "divehub@divehubmarineservices.com",
    send_lead_confirmation_email: true,
    confirmation_email_subject: "Thank you for contacting us",
    confirmation_email_message: "We received your enquiry and will contact you shortly.",
  };

  const adminRecipient = settings.notification_email || process.env.ADMIN_NOTIFICATION_EMAIL || "divehub@divehubmarineservices.com";
  const frontendUrl = process.env.ADMIN_FRONTEND_URL || "https://dive-hub.vercel.app";

  const placeholderData: PlaceholderData = {
    full_name: lead.fullName || lead.full_name || "",
    email: lead.email || "",
    phone: lead.phone || "",
    whatsapp_number: lead.whatsappNumber || lead.whatsapp_number || "",
    service_interested: lead.serviceInterested || lead.service_interested || "",
    company_name: lead.companyName || lead.company_name || "",
    location: lead.location || "",
    message: lead.message || "",
    lead_id: String(lead._id || lead.id || ""),
    submitted_at: new Date().toLocaleString(),
  };

  // 1. Admin Notification Email
  const adminSubject = `New Lead Submission: ${placeholderData.full_name || "Website Visitor"}`;
  const adminHtml = `
    <h2>New Lead Received</h2>
    <p><strong>Name:</strong> ${placeholderData.full_name}</p>
    <p><strong>Email:</strong> ${placeholderData.email}</p>
    <p><strong>Phone:</strong> ${placeholderData.phone}</p>
    <p><strong>WhatsApp:</strong> ${placeholderData.whatsapp_number}</p>
    <p><strong>Service Interested:</strong> ${placeholderData.service_interested}</p>
    <p><strong>Location:</strong> ${placeholderData.location}</p>
    <p><strong>Message:</strong> ${placeholderData.message}</p>
    <p><a href="${frontendUrl}/admin/leads/${placeholderData.lead_id}">View Lead Details in Admin Portal</a></p>
  `;

  const adminEmailLog = await EmailHistoryModel.create({
    leadId: lead._id || lead.id,
    emailType: "admin_notification",
    recipient: adminRecipient,
    subject: adminSubject,
    htmlBody: adminHtml,
    status: "pending",
  });

  await sendEmail({
    emailLogId: String(adminEmailLog._id),
    recipient: adminRecipient,
    subject: adminSubject,
    html: adminHtml,
  });

  // 2. Customer Confirmation Email
  if (settings.send_lead_confirmation_email && lead.email) {
    const customerSubject = compileTemplate(settings.confirmation_email_subject || "Thank you for contacting Dive Hub", placeholderData);
    const customerBody = compileTemplate(settings.confirmation_email_message || "We received your enquiry and will contact you shortly.", placeholderData);

    const customerHtml = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Thank You for Reaching Out!</h2>
        <p>${customerBody.replace(/\n/g, "<br/>")}</p>
        <hr />
        <p><strong>Dive Hub & Marine Services</strong></p>
      </div>
    `;

    const confEmailLog = await EmailHistoryModel.create({
      leadId: lead._id || lead.id,
      emailType: "lead_confirmation",
      recipient: lead.email,
      subject: customerSubject,
      htmlBody: customerHtml,
      status: "pending",
    });

    await sendEmail({
      emailLogId: String(confEmailLog._id),
      recipient: lead.email,
      subject: customerSubject,
      html: customerHtml,
    });
  }
}
