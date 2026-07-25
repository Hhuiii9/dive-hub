import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDatabase } from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import SessionModel from "@/lib/models/Session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const refreshToken = body.refresh_token || body.refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Refresh token is required." },
        { status: 400 }
      );
    }

    await connectDatabase();

    const session = await SessionModel.findOne({ token: refreshToken });
    if (!session || new Date(session.expiresAt).getTime() < Date.now()) {
      if (session) await SessionModel.deleteOne({ _id: session._id });
      return NextResponse.json(
        { success: false, message: "Invalid or expired refresh token." },
        { status: 401 }
      );
    }

    const user = await UserModel.findById(session.userId);
    if (!user || !user.isActive || user.role !== "super_admin") {
      await SessionModel.deleteOne({ _id: session._id });
      return NextResponse.json(
        { success: false, message: "User account is disabled or unauthorized." },
        { status: 401 }
      );
    }

    await SessionModel.deleteOne({ _id: session._id });

    const newToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await SessionModel.create({
      userId: user._id,
      token: newToken,
      expiresAt,
      ipAddress: request.headers.get("x-forwarded-for") || "",
      userAgent: request.headers.get("user-agent") || "",
    });

    const isProd = process.env.NODE_ENV === "production";
    const response = NextResponse.json({
      success: true,
      message: "Token refreshed successfully.",
      data: {
        access_token: newToken,
        refresh_token: newToken,
      },
    });

    response.cookies.set("admin_token", newToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("[Refresh API] Error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
