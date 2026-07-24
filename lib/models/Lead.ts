import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * MongoDB Lead document interface.
 * Mirrors all fields from the existing flat-file Lead interface in lib/db.ts.
 */
export interface ILead extends Document {
  // Source reference (ID from JSON file store, for cross-referencing)
  jsonId?: string;

  // Core contact fields
  fullName: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  companyName: string;
  location: string;
  serviceInterested: string;
  message: string;
  preferredContactMethod: string;

  // All submitted form values (including custom fields)
  formData: Record<string, unknown>;

  // Lead lifecycle
  status: "new" | "contacted" | "qualified" | "converted" | "closed" | "spam";
  source: string;

  // Request metadata
  pageUrl: string;
  ipAddress: string;
  userAgent: string;

  // Admin fields
  adminNotes: string;
  assignedTo?: mongoose.Types.ObjectId | string;
  lastContactedAt?: Date | null;
  lastContactedBy?: string | null;

  // Timestamps (managed by Mongoose)
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    jsonId: {
      type: String,
      index: true,
      sparse: true,
    },

    fullName: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    whatsappNumber: {
      type: String,
      default: "",
      trim: true,
    },
    companyName: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    serviceInterested: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    preferredContactMethod: {
      type: String,
      default: "",
      trim: true,
    },

    formData: {
      type: Schema.Types.Mixed,
      default: {},
    },

    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "converted", "closed", "spam"],
      default: "new",
    },
    source: {
      type: String,
      default: "website",
      trim: true,
    },

    pageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    ipAddress: {
      type: String,
      default: "",
      trim: true,
    },
    userAgent: {
      type: String,
      default: "",
      trim: true,
    },

    adminNotes: {
      type: String,
      default: "",
      trim: true,
    },
    assignedTo: {
      type: Schema.Types.Mixed,
      default: null,
    },
    lastContactedAt: {
      type: Date,
      default: null,
    },
    lastContactedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt + updatedAt
    collection: "leads",
  }
);

// Indexes for common admin queries
LeadSchema.index({ email: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ source: 1 });

/**
 * Avoid OverwriteModelError during Next.js hot reload in development.
 * Re-use the existing model if already compiled.
 */
const LeadModel: Model<ILead> =
  (mongoose.models.Lead as Model<ILead>) ||
  mongoose.model<ILead>("Lead", LeadSchema);

export default LeadModel;
