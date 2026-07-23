import { NextRequest, NextResponse } from "next/server";
import { sessionsDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Read token from headers or cookies
    const authHeader = request.headers.get("Authorization");
    let token = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    if (!token) {
      token = request.cookies.get("admin_token")?.value || "";
    }

    if (token && token !== "mock-admin-token") {
      sessionsDB.deleteByToken(token);
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully."
    });

    // Expire the cookie
    response.cookies.set("admin_token", "", {
      path: "/",
      expires: new Date(0)
    });

    return response;
  } catch (error: any) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
