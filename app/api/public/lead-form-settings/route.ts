import { NextResponse } from "next/server";
import { settingsDB } from "@/lib/db";

export async function GET() {
  try {
    const config = settingsDB.get();
    // Return settings safely (public route)
    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to load lead form settings" }, { status: 500 });
  }
}
