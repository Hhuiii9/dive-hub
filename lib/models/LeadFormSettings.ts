import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFormField {
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

export interface ILeadFormSettingsData {
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
  fields: IFormField[];
}

export interface ILeadFormSettings extends Document {
  name: string;
  is_active: boolean;
  settings: ILeadFormSettingsData;
  updated_by?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema<IFormField>({
  key: { type: String, required: true },
  label: { type: String, required: true },
  placeholder: { type: String, default: "" },
  type: { type: String, enum: ["text", "email", "textarea", "select", "checkbox"], required: true },
  required: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  options: [{ type: String }],
  is_custom: { type: Boolean, default: false },
});

const LeadFormSettingsSchema = new Schema<ILeadFormSettings>(
  {
    name: {
      type: String,
      default: "default",
      unique: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    settings: {
      title: { type: String, default: "Get In Touch" },
      subtitle: { type: String, default: "Start your diving journey today. Send us a message and our team will get back to you shortly." },
      submit_text: { type: String, default: "Send Message" },
      success_message: { type: String, default: "Thank you. We have received your query and will contact you shortly." },
      whatsapp_number: { type: String, default: "916235107072" },
      notification_email: { type: String, default: "divehub@divehubmarineservices.com" },
      redirect_url: { type: String, default: "" },
      privacy_consent_text: { type: String, default: "I agree to the privacy policy and terms of service." },
      send_lead_confirmation_email: { type: Boolean, default: true },
      confirmation_email_subject: { type: String, default: "Thank you for contacting us" },
      confirmation_email_message: { type: String, default: "We received your enquiry and will contact you shortly." },
      fields: [FormFieldSchema],
    },
    updated_by: { type: String, default: "system" },
  },
  {
    timestamps: true,
    collection: "lead_form_settings",
  }
);

const LeadFormSettingsModel: Model<ILeadFormSettings> =
  (mongoose.models.LeadFormSettings as Model<ILeadFormSettings>) ||
  mongoose.model<ILeadFormSettings>("LeadFormSettings", LeadFormSettingsSchema);

export default LeadFormSettingsModel;
