import { NextRequest, NextResponse } from "next/server";
import { sessionsDB, usersDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        { success: false, message: "Refresh token is required." },
        { status: 400 }
      );
    }

    const session = sessionsDB.getByRefreshToken(refresh_token);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Invalid refresh token." },
        { status: 401 }
      );
    }

    // Check if refresh token is expired
    if (new Date(session.refresh_expires_at).getTime() < Date.now()) {
      sessionsDB.deleteByToken(session.token);
      return NextResponse.json(
        { success: false, message: "Refresh token has expired. Please log in again." },
        { status: 401 }
      );
    }

    const user = usersDB.getById(session.user_id);
    if (!user || !user.is_active) {
      sessionsDB.deleteByToken(session.token);
      return NextResponse.json(
        { success: false, message: "User account is disabled." },
        { status: 401 }
      );
    }

    // Invalidate old session and create a new one
    sessionsDB.deleteByToken(session.token);
    const newSession = sessionsDB.create(user.id);

    const response = NextResponse.json({
      success: true,
      message: "Token refreshed successfully.",
      data: {
        access_token: newSession.token,
        refresh_token: newSession.refresh_token
      }
    });

    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("admin_token", newSession.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60
    });

    return response;
  } catch (error: any) {
    console.error("Token refresh API error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
