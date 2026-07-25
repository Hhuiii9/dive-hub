import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDatabase } from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import SessionModel from "@/lib/models/Session";
import { hashPassword, seedSuperAdmin } from "@/lib/seed";

export async function POST(request: NextRequest) {
  try {
    await connectDatabase();
    await seedSuperAdmin();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });

    const invalidResponse = () => {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    };

    if (!user || user.role !== "super_admin") {
      return invalidResponse();
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Your account is inactive." },
        { status: 403 }
      );
    }

    const hashedInput = hashPassword(password);
    if (user.passwordHash !== hashedInput) {
      return invalidResponse();
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Create session token in MongoDB
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await SessionModel.create({
      userId: user._id,
      token,
      expiresAt,
      ipAddress: request.headers.get("x-forwarded-for") || "",
      userAgent: request.headers.get("user-agent") || "",
    });

    const isProd = process.env.NODE_ENV === "production";

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        access_token: token,
        refresh_token: token,
      },
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("[Login API] Error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during authentication." },
      { status: 500 }
    );
  }
}
