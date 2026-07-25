import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import LeadModel from "@/lib/models/Lead";
import { getAuthenticatedUser, hasPermission } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAuthenticatedUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDatabase();
    const { id } = await params;

    let lead = await LeadModel.findById(id);
    if (!lead) {
      lead = await LeadModel.findOne({ jsonId: id });
    }

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const leadData = {
      id: String(lead._id),
      full_name: lead.fullName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      whatsapp_number: lead.whatsappNumber || "",
      company_name: lead.companyName || "",
      location: lead.location || "",
      service_interested: lead.serviceInterested || "",
      message: lead.message || "",
      preferred_contact_method: lead.preferredContactMethod || "",
      form_data: lead.formData || {},
      status: lead.status || "new",
      source: lead.source || "website",
      page_url: lead.pageUrl || "",
      ip_address: lead.ipAddress || "",
      user_agent: lead.userAgent || "",
      admin_notes: lead.adminNotes || "",
      assigned_to: "",
      created_at: lead.createdAt ? lead.createdAt.toISOString() : "",
      updated_at: lead.updatedAt ? lead.updatedAt.toISOString() : "",
    };

    return NextResponse.json({ success: true, data: leadData });
  } catch (error: any) {
    console.error("[Admin Lead Detail GET API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch lead details" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAuthenticatedUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDatabase();
    const { id } = await params;
    const body = await request.json();

    let lead = await LeadModel.findById(id);
    if (!lead) {
      lead = await LeadModel.findOne({ jsonId: id });
    }

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (body.status !== undefined) lead.status = body.status;
    if (body.admin_notes !== undefined) lead.adminNotes = body.admin_notes;
    if (body.adminNotes !== undefined) lead.adminNotes = body.adminNotes;
    if (body.full_name !== undefined) lead.fullName = body.full_name;
    if (body.email !== undefined) lead.email = body.email;
    if (body.phone !== undefined) lead.phone = body.phone;

    await lead.save();

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully.",
      data: lead,
    });
  } catch (error: any) {
    console.error("[Admin Lead Detail PATCH API] Error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAuthenticatedUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(currentUser, "delete_leads")) {
    return NextResponse.json({ error: "Forbidden. Only Super Admins can delete leads." }, { status: 403 });
  }

  try {
    await connectDatabase();
    const { id } = await params;

    let res = await LeadModel.findByIdAndDelete(id);
    if (!res) {
      res = await LeadModel.findOneAndDelete({ jsonId: id });
    }

    if (!res) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully.",
    });
  } catch (error: any) {
    console.error("[Admin Lead Detail DELETE API] Error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
