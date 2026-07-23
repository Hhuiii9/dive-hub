import { NextRequest, NextResponse } from "next/server";
import { settingsDB } from "@/lib/db";
import { getAuthenticatedUser, hasPermission } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const currentUser = getAuthenticatedUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(currentUser, "manage_lead_settings")) {
    return NextResponse.json({ error: "Forbidden. You do not have permission to view lead form settings." }, { status: 403 });
  }

  try {
    const config = settingsDB.get();
    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const currentUser = getAuthenticatedUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(currentUser, "manage_lead_settings")) {
    return NextResponse.json({ error: "Forbidden. You do not have permission to edit lead form settings." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { settings, is_active, reset } = body;

    if (reset) {
      const config = settingsDB.resetToDefault();
      return NextResponse.json({
        success: true,
        message: "Settings reset to default successfully.",
        data: config
      });
    }

    if (!settings || !settings.title || !Array.isArray(settings.fields)) {
      return NextResponse.json({ error: "Invalid form configuration format." }, { status: 400 });
    }

    // Save
    const config = settingsDB.save(settings, is_active ?? true, currentUser.name || currentUser.username);
    return NextResponse.json({
      success: true,
      message: "Lead form settings saved successfully.",
      data: config
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
