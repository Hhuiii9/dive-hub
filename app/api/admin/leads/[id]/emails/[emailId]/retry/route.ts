import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth";
import EmailHistoryModel from "@/lib/models/EmailHistory";
import { sendEmail } from "@/lib/emailService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; emailId: string }> }
) {
  try {
    const currentUser = await getAuthenticatedUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { emailId } = await params;
    await connectDatabase();

    const emailDoc = await EmailHistoryModel.findById(emailId);
    if (!emailDoc) {
      return NextResponse.json({ error: "Email log not found." }, { status: 404 });
    }

    if (emailDoc.status !== "failed") {
      return NextResponse.json({ error: "Only failed emails can be retried." }, { status: 400 });
    }

    const result = await sendEmail({
      emailLogId: String(emailDoc._id),
      recipient: emailDoc.recipient,
      subject: emailDoc.subject,
      html: emailDoc.htmlBody,
      cc: emailDoc.cc || undefined,
      bcc: emailDoc.bcc || undefined,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email resent successfully.",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Resending failed again. Please verify SMTP details.",
          details: result.error || "SMTP error",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[Admin Retry Email API] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during retry." },
      { status: 500 }
    );
  }
}
