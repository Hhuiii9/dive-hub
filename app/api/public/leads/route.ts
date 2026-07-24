import { NextRequest, NextResponse } from "next/server";
import { settingsDB, FormField } from "@/lib/db";
import { sendLeadNotificationEmails } from "@/lib/emailService";
import { connectDatabase } from "@/lib/mongodb";
import LeadModel from "@/lib/models/Lead";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";
    
    // 1. Get active settings
    const config = settingsDB.get();
    if (!config.is_active) {
      return NextResponse.json({ error: "Submissions are temporarily disabled." }, { status: 403 });
    }

    const body = await request.json();

    // 2. Perform dynamic validation based on settings
    const fields: FormField[] = config.settings.fields || [];
    const formData: Record<string, any> = {};
    const validationErrors: Record<string, string> = {};

    for (const field of fields) {
      if (!field.enabled) continue;

      const value = body[field.key];

      // Check required
      if (field.required && (value === undefined || value === null || value === "")) {
        validationErrors[field.key] = `${field.label} is required.`;
        continue;
      }

      if (value !== undefined && value !== null && value !== "") {
        // Basic type validation
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
      return NextResponse.json({ 
        error: "Validation failed", 
        fields: validationErrors 
      }, { status: 400 });
    }

    // Check if fields are enabled in settings before mapping
    const isEnabled = (key: string) => fields.some(f => f.key === key && f.enabled);

    // 3. Map values ONLY for enabled fields
    const leadRecord: any = {
      full_name: isEnabled("full_name") ? (body.full_name || body.name || formData.full_name || "") : "",
      email: isEnabled("email") ? (body.email || formData.email || "") : "",
      phone: isEnabled("phone") ? (body.phone || formData.phone || "") : "",
      whatsapp_number: isEnabled("whatsapp_number") ? (body.whatsapp_number || formData.whatsapp_number || "") : "",
      company_name: isEnabled("company_name") ? (body.company_name || formData.company_name || "") : "",
      location: isEnabled("location") ? (body.location || formData.location || "") : "",
      service_interested: isEnabled("service_interested") ? (body.service_interested || formData.service_interested || "") : "",
      message: isEnabled("message") ? (body.message || formData.message || "") : "",
      preferred_contact_method: isEnabled("preferred_contact_method") ? (body.preferred_contact_method || formData.preferred_contact_method || "") : "",
      form_data: formData,
      source: body.source || "website",
      page_url: body.page_url || request.headers.get("referer") || "",
      ip_address: ip,
      user_agent: userAgent
    };

    // Spam filter / protection: quick check if enabled fields are all empty
    if (!leadRecord.full_name && !leadRecord.email && !leadRecord.phone) {
      return NextResponse.json({ error: "Invalid submission data" }, { status: 400 });
    }

    // 4. Save lead directly to MongoDB database
    let createdMongoLead: any = null;
    try {
      await connectDatabase();
      const generatedId = "lead_" + Math.random().toString(36).substr(2, 9);
      const now = new Date();
      
      createdMongoLead = await LeadModel.create({
        jsonId: generatedId,
        fullName: leadRecord.full_name,
        email: leadRecord.email,
        phone: leadRecord.phone,
        whatsappNumber: leadRecord.whatsapp_number,
        companyName: leadRecord.company_name,
        location: leadRecord.location,
        serviceInterested: leadRecord.service_interested,
        message: leadRecord.message,
        preferredContactMethod: leadRecord.preferred_contact_method,
        formData: leadRecord.form_data,
        status: "new",
        source: leadRecord.source,
        pageUrl: leadRecord.page_url,
        ipAddress: leadRecord.ip_address,
        userAgent: leadRecord.user_agent,
        adminNotes: "",
        createdAt: now,
        updatedAt: now,
      });
      console.log(`[MongoDB] Lead saved directly to DB: ${generatedId}`);
    } catch (mongoErr: any) {
      console.error("[MongoDB] Database error while saving lead:", mongoErr);
      return NextResponse.json(
        { error: "Database error. Could not save lead submission." },
        { status: 500 }
      );
    }

    const newLead = {
      id: createdMongoLead.jsonId || createdMongoLead._id.toString(),
      full_name: createdMongoLead.fullName || "",
      email: createdMongoLead.email || "",
      phone: createdMongoLead.phone || "",
      whatsapp_number: createdMongoLead.whatsappNumber || "",
      company_name: createdMongoLead.companyName || "",
      location: createdMongoLead.location || "",
      service_interested: createdMongoLead.serviceInterested || "",
      message: createdMongoLead.message || "",
      preferred_contact_method: createdMongoLead.preferredContactMethod || "",
      form_data: createdMongoLead.formData || {},
      status: createdMongoLead.status || "new",
      source: createdMongoLead.source || "website",
      page_url: createdMongoLead.pageUrl || "",
      ip_address: createdMongoLead.ipAddress || "",
      user_agent: createdMongoLead.userAgent || "",
      admin_notes: "",
      assigned_to: "",
      created_at: createdMongoLead.createdAt.toISOString(),
      updated_at: createdMongoLead.updatedAt.toISOString(),
    };

    // 5. Send notification email after MongoDB save
    let emailStatus = "sent";
    try {
      const emailResult = await sendLeadNotificationEmails(newLead);
      if (!emailResult.adminSent) {
        emailStatus = "failed";
      }
    } catch (emailErr) {
      console.error("[Email] Failed to deliver admin notification:", emailErr);
      emailStatus = "failed";
    }

    return NextResponse.json({
      success: true,
      message: "Lead submitted successfully.",
      leadId: newLead.id,
      emailNotification: emailStatus
    });

  } catch (error: any) {
    console.error("Error submitting lead:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}

