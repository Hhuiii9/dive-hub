import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth";
import EmailHistoryModel from "@/lib/models/EmailHistory";

export async function GET(
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

    const emailsDocs = await EmailHistoryModel.find({ leadId })
      .sort({ createdAt: -1 });

    const emails = emailsDocs.map((doc) => ({
      id: String(doc._id),
      lead_id: String(doc.leadId),
      sent_by: doc.sentBy || "System",
      email_type: doc.emailType,
      recipient: doc.recipient,
      cc: doc.cc || "",
      bcc: doc.bcc || "",
      subject: doc.subject,
      body: doc.htmlBody || doc.textBody || "",
      status: doc.status,
      provider_message_id: doc.providerMessageId || "",
      safe_error_message: doc.safeErrorMessage || "",
      sent_at: doc.sentAt ? doc.sentAt.toISOString() : null,
      created_at: doc.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: emails,
    });
  } catch (error: any) {
    console.error("[Admin GET Lead Emails API] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
