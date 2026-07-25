import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth";
import LeadModel from "@/lib/models/Lead";
import EmailHistoryModel from "@/lib/models/EmailHistory";
import { sendEmail } from "@/lib/emailService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*(['"])(.*?)\1/gi, "")
    .replace(/javascript\s*:\s*/gi, "no-js:");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getAuthenticatedUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id: leadId } = await params;
    await connectDatabase();

    let lead = await LeadModel.findById(leadId);
    if (!lead) {
      lead = await LeadModel.findOne({ jsonId: leadId });
    }

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const body = await request.json();
    const { to, cc = "", bcc = "", subject, message } = body;

    if (!to || !isValidEmail(to)) {
      return NextResponse.json({ error: "A valid recipient email is required." }, { status: 400 });
    }
    if (!subject || subject.trim() === "") {
      return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    }
    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message body is required." }, { status: 400 });
    }

    const sanitizedMessage = sanitizeHtml(message);

    const emailLog = await EmailHistoryModel.create({
      leadId: lead._id,
      sentBy: currentUser.name,
      emailType: "admin_reply",
      recipient: to.trim(),
      cc: cc.trim(),
      bcc: bcc.trim(),
      subject: subject.trim(),
      htmlBody: sanitizedMessage,
      status: "pending",
    });

    const result = await sendEmail({
      emailLogId: String(emailLog._id),
      recipient: to.trim(),
      subject: subject.trim(),
      html: sanitizedMessage,
      cc: cc.trim() || undefined,
      bcc: bcc.trim() || undefined,
    });

    if (result.success) {
      lead.lastContactedAt = new Date();
      lead.lastContactedBy = currentUser.name;
      if (lead.status === "new") {
        lead.status = "contacted";
      }
      await lead.save();

      return NextResponse.json({
        success: true,
        message: "Email sent successfully.",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send email.",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[Admin Send Email API] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while sending the email." },
      { status: 500 }
    );
  }
}
