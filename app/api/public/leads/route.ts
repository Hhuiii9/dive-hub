import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import LeadModel from "@/lib/models/Lead";
import LeadFormSettingsModel from "@/lib/models/LeadFormSettings";
import { handleLeadEmails } from "@/lib/emailService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await connectDatabase();

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";

    const settingsDoc = await LeadFormSettingsModel.findOne({ name: "default" });
    const isActive = settingsDoc ? settingsDoc.is_active : true;
    const fields = settingsDoc?.settings?.fields || [
      { key: "full_name", label: "Full Name", type: "text", required: true, enabled: true },
      { key: "email", label: "Email Address", type: "email", required: true, enabled: true },
      { key: "phone", label: "Phone Number", type: "text", required: true, enabled: true },
      { key: "service_interested", label: "Service Interested In", type: "select", required: false, enabled: true },
      { key: "message", label: "Your Message", type: "textarea", required: true, enabled: true },
    ];

    if (!isActive) {
      return NextResponse.json({ error: "Submissions are temporarily disabled." }, { status: 403 });
    }

    const body = await request.json();
    const formData: Record<string, any> = {};
    const validationErrors: Record<string, string> = {};

    for (const field of fields) {
      if (!field.enabled) continue;
      const value = body[field.key];

      if (field.required && (value === undefined || value === null || value === "")) {
        validationErrors[field.key] = `${field.label} is required.`;
        continue;
      }

      if (value !== undefined && value !== null && value !== "") {
        if (field.type === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value))) {
            validationErrors[field.key] = "Please enter a valid email address.";
          }
        }
        formData[field.key] = value;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json({ error: "Validation failed", fields: validationErrors }, { status: 400 });
    }

    const isEnabled = (key: string) => fields.some((f) => f.key === key && f.enabled);

    const fullName = isEnabled("full_name") ? (body.full_name || body.name || formData.full_name || "") : "";
    const email = isEnabled("email") ? (body.email || formData.email || "") : "";
    const phone = isEnabled("phone") ? (body.phone || formData.phone || "") : "";
    const whatsappNumber = isEnabled("whatsapp_number") ? (body.whatsapp_number || formData.whatsapp_number || "") : "";
    const companyName = isEnabled("company_name") ? (body.company_name || formData.company_name || "") : "";
    const location = isEnabled("location") ? (body.location || formData.location || "") : "";
    const serviceInterested = isEnabled("service_interested") ? (body.service_interested || formData.service_interested || "") : "";
    const message = isEnabled("message") ? (body.message || formData.message || "") : "";
    const preferredContactMethod = isEnabled("preferred_contact_method") ? (body.preferred_contact_method || formData.preferred_contact_method || "") : "";

    if (!fullName && !email && !phone) {
      return NextResponse.json({ error: "Invalid submission data" }, { status: 400 });
    }

    // Save lead to MongoDB
    const createdLead = await LeadModel.create({
      fullName,
      email,
      phone,
      whatsappNumber,
      companyName,
      location,
      serviceInterested,
      message,
      preferredContactMethod,
      formData,
      status: "new",
      source: body.source || "website",
      pageUrl: body.page_url || request.headers.get("referer") || "",
      ipAddress: ip,
      userAgent,
      adminNotes: "",
    });

    // Send notifications after lead is saved in database
    let emailNotification = "sent";
    try {
      await handleLeadEmails({ lead: createdLead });
    } catch (err: any) {
      console.error("[Public Leads API] Saved lead, but email notification failed:", err.message || err);
      emailNotification = "failed";
    }

    return NextResponse.json({
      success: true,
      message: "Lead submitted successfully.",
      leadId: String(createdLead._id),
      emailNotification,
    });
  } catch (error: any) {
    console.error("[Public Leads API] Error submitting lead:", error);
    return NextResponse.json(
      { error: "Database error. Could not process lead submission." },
      { status: 500 }
    );
  }
}
