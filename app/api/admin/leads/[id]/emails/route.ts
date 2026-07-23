import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { leadsDB, emailsDB } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;
    const currentUser = getAuthenticatedUser(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const lead = leadsDB.getById(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const emails = emailsDB.getByLeadId(leadId);

    return NextResponse.json({
      success: true,
      data: emails
    });
  } catch (error: any) {
    console.error("GET lead emails history error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
