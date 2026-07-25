import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDatabase } from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import PasswordResetTokenModel from "@/lib/models/PasswordResetToken";
import { sendEmail } from "@/lib/emailService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const genericResponse = NextResponse.json({
    success: true,
    message: "If an account exists, password reset instructions have been sent.",
  });

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return genericResponse;
    }

    await connectDatabase();

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail, role: "super_admin", isActive: true });

    if (!user) {
      return genericResponse;
    }

    // Invalidate existing unused tokens for this user
    await PasswordResetTokenModel.updateMany(
      { userId: user._id, usedAt: null },
      { usedAt: new Date() }
    );

    // Generate random raw token & hashed token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await PasswordResetTokenModel.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    const frontendUrl = process.env.ADMIN_FRONTEND_URL || "https://dive-hub.vercel.app";
    const resetUrl = `${frontendUrl}/admin/reset-password/${rawToken}`;

    const htmlBody = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Dive Hub Super Admin account.</p>
        <p>Click the link below to set a new password (link expires in 30 minutes):</p>
        <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #06b6d4; color: #fff; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail({
      recipient: user.email,
      subject: "Password Reset Instructions - Dive Hub",
      html: htmlBody,
    });

    return genericResponse;
  } catch (error: any) {
    console.error("[Forgot Password API] Error:", error);
    return genericResponse;
  }
}
