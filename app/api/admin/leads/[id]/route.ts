import { NextRequest, NextResponse } from "next/server";
import { leadsDB } from "@/lib/db";
import { getAuthenticatedUser, hasPermission } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getAuthenticatedUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const lead = leadsDB.getById(id);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // Staff permission check: can only view if assigned to them
  if (currentUser.role === "staff") {
    const isAssigned = 
      lead.assigned_to === currentUser.id || 
      lead.assigned_to === currentUser.username || 
      lead.assigned_to === currentUser.name;
    if (!isAssigned) {
      return NextResponse.json({ error: "Forbidden. This lead is not assigned to you." }, { status: 403 });
    }
  }

  return NextResponse.json({ success: true, data: lead });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getAuthenticatedUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const lead = leadsDB.getById(id);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // Staff permission check: can only update if assigned to them
  if (currentUser.role === "staff") {
    const isAssigned = 
      lead.assigned_to === currentUser.id || 
      lead.assigned_to === currentUser.username || 
      lead.assigned_to === currentUser.name;
    if (!isAssigned) {
      return NextResponse.json({ error: "Forbidden. This lead is not assigned to you." }, { status: 403 });
    }
  }

  try {
    const body = await request.json();

    // Staff can only update status and notes (admin_notes)
    if (currentUser.role === "staff") {
      const allowedKeys = ["status", "admin_notes"];
      const forbiddenKeys = Object.keys(body).filter(k => !allowedKeys.includes(k));
      if (forbiddenKeys.length > 0) {
        return NextResponse.json({ 
          error: `Forbidden. Staff can only update status and notes. Unsupported: ${forbiddenKeys.join(", ")}` 
        }, { status: 403 });
      }
    }

    const updatedLead = leadsDB.update(id, body);

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully.",
      data: updatedLead,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getAuthenticatedUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check delete permission (only super_admin)
  if (!hasPermission(currentUser, "delete_leads")) {
    return NextResponse.json({ error: "Forbidden. Only Super Admins can delete leads." }, { status: 403 });
  }

  const { id } = await params;
  const success = leadsDB.delete(id);

  if (!success) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: "Lead deleted successfully.",
  });
}
