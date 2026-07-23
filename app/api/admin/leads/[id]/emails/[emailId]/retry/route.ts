import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { leadsDB, emailsDB } from "@/lib/db";
import { sendEmailTask } from "@/lib/emailService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; emailId: string }> }
) {
  try {
    const { id: leadId, emailId } = await params;
    const currentUser = getAuthenticatedUser(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const lead = leadsDB.getById(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const email = emailsDB.getById(emailId);
    if (!email || email.lead_id !== leadId) {
      return NextResponse.json({ error: "Email log not found." }, { status: 404 });
    }

    if (email.status !== "failed") {
      return NextResponse.json({ error: "Only failed emails can be retried." }, { status: 400 });
    }

    // Trigger retry
    const success = await sendEmailTask(emailId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Email resent successfully."
      });
    } else {
      const updatedLog = emailsDB.getById(emailId);
      return NextResponse.json({
        success: false,
        error: "Resending failed again. Please verify SMTP details.",
        details: updatedLog?.error_message || "SMTP error"
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("POST retry email error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during retry." },
      { status: 500 }
    );
  }
}
