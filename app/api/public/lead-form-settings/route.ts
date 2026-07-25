import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import LeadFormSettingsModel from "@/lib/models/LeadFormSettings";

export async function GET() {
  try {
    await connectDatabase();
    let doc = await LeadFormSettingsModel.findOne({ name: "default" });

    if (!doc) {
      doc = await LeadFormSettingsModel.create({
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

    return NextResponse.json({
      success: true,
      data: doc.toObject(),
    });
  } catch (error: any) {
    console.error("[Public Lead Settings API] Error:", error);
    return NextResponse.json({ error: "Failed to load lead form settings" }, { status: 500 });
  }
}
