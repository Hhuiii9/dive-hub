import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth";
import EmailHistoryModel from "@/lib/models/EmailHistory";

export async function GET(
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

    const email = {
      id: String(emailDoc._id),
      lead_id: String(emailDoc.leadId),
      sent_by: emailDoc.sentBy || "System",
      email_type: emailDoc.emailType,
      recipient: emailDoc.recipient,
      cc: emailDoc.cc || "",
      bcc: emailDoc.bcc || "",
      subject: emailDoc.subject,
      body: emailDoc.htmlBody || emailDoc.textBody || "",
      status: emailDoc.status,
      provider_message_id: emailDoc.providerMessageId || "",
      safe_error_message: emailDoc.safeErrorMessage || "",
      sent_at: emailDoc.sentAt ? emailDoc.sentAt.toISOString() : null,
      created_at: emailDoc.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: email,
    });
  } catch (error: any) {
    console.error("[Admin GET Email Detail API] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
