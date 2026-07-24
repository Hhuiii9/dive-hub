import { NextRequest, NextResponse } from "next/server";
import { settingsDB, leadsDB, FormField } from "@/lib/db";
import { queueLeadSubmissionEmails } from "@/lib/emailService";
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

    // 4. Create Lead in JSON file DB (primary store — keeps admin dashboard working)
    const newLead = leadsDB.create(leadRecord);

    // 5. Also save to MongoDB (non-blocking — failure does not affect the response)
    Promise.resolve().then(async () => {
      try {
        await connectDatabase();
        await LeadModel.create({
          jsonId: newLead.id,
          fullName: newLead.full_name,
          email: newLead.email,
          phone: newLead.phone,
          whatsappNumber: newLead.whatsapp_number,
          companyName: newLead.company_name,
          location: newLead.location,
          serviceInterested: newLead.service_interested,
          message: newLead.message,
          preferredContactMethod: newLead.preferred_contact_method,
          formData: newLead.form_data,
          status: newLead.status,
          source: newLead.source,
          pageUrl: newLead.page_url,
          ipAddress: newLead.ip_address,
          userAgent: newLead.user_agent,
          adminNotes: "",
          createdAt: new Date(newLead.created_at),
          updatedAt: new Date(newLead.updated_at),
        });
        console.log(`[MongoDB] Lead saved: ${newLead.id}`);
      } catch (mongoErr: any) {
        // Log MongoDB errors without exposing them to the client
        console.error(`[MongoDB] Failed to save lead ${newLead.id}:`, mongoErr.message);
      }
    });

    // 6. Trigger background emails
    queueLeadSubmissionEmails(newLead);

    return NextResponse.json({
      success: true,
      message: config.settings.success_message || "Thank you. We will contact you shortly.",
      lead_id: newLead.id
    });

  } catch (error: any) {
    console.error("Error submitting lead:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
