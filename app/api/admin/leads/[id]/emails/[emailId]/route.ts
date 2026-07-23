import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { leadsDB, emailsDB } from "@/lib/db";

export async function GET(
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

    return NextResponse.json({
      success: true,
      data: email
    });
  } catch (error: any) {
    console.error("GET single email log error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
