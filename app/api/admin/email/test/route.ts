import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth";
import EmailHistoryModel from "@/lib/models/EmailHistory";
import { getTransporter, sendEmail, categorizeSmtpError } from "@/lib/emailService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const currentUser = await getAuthenticatedUser(request);
  if (!currentUser) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "divehub@divehubmarineservices.com";

    await connectDatabase();

    // 1. SMTP Transporter verification
    const transporter = getTransporter();
    await transporter.verify();

    // 2. Log test email to MongoDB
    const testLog = await EmailHistoryModel.create({
      emailType: "test",
      recipient: adminNotificationEmail,
      subject: "Dive Hub SMTP System Diagnostic Test",
      htmlBody: "<p>This is a diagnostic test email sent from Dive Hub Admin portal.</p>",
      status: "pending",
      sentBy: currentUser.name,
    });

    // 3. Send test email
    const sendResult = await sendEmail({
      emailLogId: String(testLog._id),
      recipient: adminNotificationEmail,
      subject: "Dive Hub SMTP System Diagnostic Test",
      html: "<p>This is a diagnostic test email sent from Dive Hub Admin portal to verify production email delivery.</p>",
    });

    if (sendResult.success) {
      return NextResponse.json({
        success: true,
        smtpVerified: true,
        emailSent: true,
      });
    } else {
      return NextResponse.json({
        success: false,
        smtpVerified: true,
        emailSent: false,
        errorCode: sendResult.error || "EMAIL_SEND_FAILED",
      });
    }
  } catch (error: any) {
    const safeError = categorizeSmtpError(error);
    console.error("[Email Test API] Diagnostic failure:", safeError);
    return NextResponse.json({
      success: false,
      smtpVerified: false,
      emailSent: false,
      errorCode: safeError,
    });
  }
}
