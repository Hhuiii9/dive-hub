import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, ROLE_PERMISSIONS } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const permissions = ROLE_PERMISSIONS[user.role] || [];

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions
      }
    });
  } catch (error: any) {
    console.error("Auth me check error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
