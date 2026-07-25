import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDatabase } from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import PasswordResetTokenModel from "@/lib/models/PasswordResetToken";
import SessionModel from "@/lib/models/Session";
import { hashPassword } from "@/lib/seed";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.token;
    const newPassword = body.newPassword || body.password;

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Token and new password are required." },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    await connectDatabase();

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const resetRecord = await PasswordResetTokenModel.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(resetRecord.userId);
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "User account not found or inactive." },
        { status: 400 }
      );
    }

    // Update password hash
    user.passwordHash = hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();

    // Mark token as used
    resetRecord.usedAt = new Date();
    await resetRecord.save();

    // Invalidate existing sessions
    await SessionModel.deleteMany({ userId: user._id });

    return NextResponse.json({
      success: true,
      message: "Password reset successful. Please log in with your new password.",
    });
  } catch (error: any) {
    console.error("[Reset Password API] Error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during password reset." },
      { status: 500 }
    );
  }
}
