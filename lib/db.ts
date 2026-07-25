import crypto from "crypto";
import { connectDatabase } from "./mongodb";
import UserModel, { IUser } from "./models/User";
import LeadModel, { ILead } from "./models/Lead";
import LeadFormSettingsModel from "./models/LeadFormSettings";
import EmailHistoryModel from "./models/EmailHistory";
import PasswordResetTokenModel from "./models/PasswordResetToken";
import SessionModel from "./models/Session";

export function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT || "divehub_salt_123_abc";
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

export interface FormField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox";
  required: boolean;
  enabled: boolean;
  order: number;
  options?: string[];
  is_custom?: boolean;
}

export interface LeadFormSettingsData {
  title: string;
  subtitle: string;
  submit_text: string;
  success_message: string;
  whatsapp_number: string;
  notification_email: string;
  redirect_url?: string;
  privacy_consent_text?: string;
  send_lead_confirmation_email?: boolean;
  confirmation_email_subject?: string;
  confirmation_email_message?: string;
  fields: FormField[];
}

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  company_name: string;
  location: string;
  service_interested: string;
  message: string;
  preferred_contact_method: string;
  form_data: Record<string, any>;
  status: "new" | "contacted" | "qualified" | "converted" | "closed" | "spam";
  source: string;
  page_url: string;
  ip_address: string;
  user_agent: string;
  admin_notes: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  last_contacted_at?: string | null;
  last_contacted_by?: string | null;
}

export interface LeadEmail {
  id: string;
  lead_id: string;
  sent_by?: string | null;
  email_type: string;
  recipient: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  status: "pending" | "sent" | "failed";
  provider_message_id?: string;
  safe_error_message?: string;
  sent_at?: string | null;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  password_hash: string;
  role: "super_admin";
  is_active: boolean;
  created_at: string;
  last_login_at?: string | null;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  token_hash: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

// Settings MongoDB API
export const settingsDB = {
  async getAsync() {
    await connectDatabase();
    let settingsDoc = await LeadFormSettingsModel.findOne({ name: "default" });
    if (!settingsDoc) {
      settingsDoc = await LeadFormSettingsModel.create({
        name: "default",
        is_active: true,
        settings: {
          title: "Get In Touch",
          subtitle: "Start your diving journey today. Send us a message and our team will get back to you shortly.",
          submit_text: "Send Message",
          success_message: "Thank you. We have received your query and will contact you shortly.",
          whatsapp_number: "916235107072",
          notification_email: process.env.ADMIN_NOTIFICATION_EMAIL || "divehub@divehubmarineservices.com",
          redirect_url: "",
          privacy_consent_text: "I agree to the privacy policy and terms of service.",
          send_lead_confirmation_email: true,
          confirmation_email_subject: "Thank you for contacting us",
          confirmation_email_message: "We received your enquiry and will contact you shortly.",
          fields: [
            { key: "full_name", label: "Full Name", placeholder: "Your Name", type: "text", required: true, enabled: true, order: 1 },
            { key: "email", label: "Email Address", placeholder: "Email Address", type: "email", required: true, enabled: true, order: 2 },
            { key: "phone", label: "Phone Number", placeholder: "Phone Number", type: "text", required: true, enabled: true, order: 3 },
            { key: "service_interested", label: "Service Interested In", placeholder: "Select Service", type: "select", required: false, enabled: true, order: 4, options: ["Scuba Diving Courses", "Commercial Diver Training", "Industrial Marine Operations", "Other"] },
            { key: "message", label: "Your Message", placeholder: "Your Message", type: "textarea", required: true, enabled: true, order: 5 },
          ],
        },
      });
    }
    return settingsDoc.toObject();
  },

  get() {
    return {
      title: "Get In Touch",
      subtitle: "Start your diving journey today. Send us a message and our team will get back to you shortly.",
      submit_text: "Send Message",
      success_message: "Thank you. We have received your query and will contact you shortly.",
      whatsapp_number: "916235107072",
      notification_email: process.env.ADMIN_NOTIFICATION_EMAIL || "divehub@divehubmarineservices.com",
      redirect_url: "",
      privacy_consent_text: "I agree to the privacy policy and terms of service.",
      send_lead_confirmation_email: true,
      confirmation_email_subject: "Thank you for contacting us",
      confirmation_email_message: "We received your enquiry and will contact you shortly.",
      fields: [
        { key: "full_name", label: "Full Name", placeholder: "Your Name", type: "text", required: true, enabled: true, order: 1 },
        { key: "email", label: "Email Address", placeholder: "Email Address", type: "email", required: true, enabled: true, order: 2 },
        { key: "phone", label: "Phone Number", placeholder: "Phone Number", type: "text", required: true, enabled: true, order: 3 },
        { key: "service_interested", label: "Service Interested In", placeholder: "Select Service", type: "select", required: false, enabled: true, order: 4, options: ["Scuba Diving Courses", "Commercial Diver Training", "Industrial Marine Operations", "Other"] },
        { key: "message", label: "Your Message", placeholder: "Your Message", type: "textarea", required: true, enabled: true, order: 5 },
      ],
    };
  },
};
