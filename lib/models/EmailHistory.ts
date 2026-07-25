import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmailHistory extends Document {
  leadId?: mongoose.Types.ObjectId | string | null;
  emailType: "admin_notification" | "lead_confirmation" | "admin_reply" | "forgot_password" | "test";
  recipient: string;
  cc?: string;
  bcc?: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  status: "pending" | "sent" | "failed";
  providerMessageId?: string;
  safeErrorMessage?: string;
  sentBy?: string;
  sentAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const EmailHistorySchema = new Schema<IEmailHistory>(
  {
    leadId: {
      type: Schema.Types.Mixed,
      default: null,
      index: true,
    },
    emailType: {
      type: String,
      enum: ["admin_notification", "lead_confirmation", "admin_reply", "forgot_password", "test"],
      required: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    cc: {
      type: String,
      default: "",
    },
    bcc: {
      type: String,
      default: "",
    },
    subject: {
      type: String,
      default: "",
    },
    htmlBody: {
      type: String,
      default: "",
    },
    textBody: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
      index: true,
    },
    providerMessageId: {
      type: String,
      default: "",
    },
    safeErrorMessage: {
      type: String,
      default: "",
    },
    sentBy: {
      type: String,
      default: "system",
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "email_history",
  }
);

EmailHistorySchema.index({ createdAt: -1 });

const EmailHistoryModel: Model<IEmailHistory> =
  (mongoose.models.EmailHistory as Model<IEmailHistory>) ||
  mongoose.model<IEmailHistory>("EmailHistory", EmailHistorySchema);

export default EmailHistoryModel;
