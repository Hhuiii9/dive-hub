import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import SessionModel from "@/lib/models/Session";

export async function POST(request: NextRequest) {
  try {
    let token = "";
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    if (!token) {
      token = request.cookies.get("admin_token")?.value || "";
    }

    if (token) {
      await connectDatabase();
      await SessionModel.deleteOne({ token });
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    response.cookies.set("admin_token", "", {
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error: any) {
    console.error("[Logout API] Error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
