import { NextRequest, NextResponse } from "next/server";
import { usersDB, resetTokensDB } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email address is required." },
        { status: 400 }
      );
    }

    const user = usersDB.getByEmail(email);
    
    // Always return success message for security
    const successResponse = () => {
      return NextResponse.json({
        success: true,
        message: "If an account exists, password reset instructions have been sent."
      });
    };

    if (!user || !user.is_active) {
      // Still return success to prevent email verification probing
      return successResponse();
    }

    // Generate reset token
    const reset = resetTokensDB.create(user.email);
    
    const domain = process.env.ADMIN_FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${domain}/admin/reset-password/${reset.token}`;

    console.log(`[AUTH] Generated reset password link for ${user.email}: ${resetUrl}`);

    // Try sending email via nodemailer
    const backend = process.env.EMAIL_BACKEND || "console";
    const defaultFrom = process.env.DEFAULT_FROM_EMAIL || "no-reply@divehubmarineservices.com";

    if (backend === "smtp") {
      const port = parseInt(process.env.EMAIL_PORT || "587", 10);
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "",
        port,
        secure: process.env.EMAIL_USE_TLS === "true" ? (port === 465) : false,
        auth: process.env.EMAIL_HOST_USER && process.env.EMAIL_HOST_PASSWORD ? {
          user: process.env.EMAIL_HOST_USER,
          pass: process.env.EMAIL_HOST_PASSWORD
        } : undefined,
        tls: { rejectUnauthorized: false }
      });

      await transporter.sendMail({
        from: defaultFrom,
        to: user.email,
        subject: "Password Reset Instructions - Dive Hub Admin",
        text: `Hello ${user.name},\n\nYou requested to reset your password. Please click on the link below or copy it to your browser to set a new password:\n\n${resetUrl}\n\nThis link is valid for 15 minutes.\n\nRegards,\nDive Hub Marine Services`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Password Reset Request</h2>
            <p>Hello ${user.name},</p>
            <p>We received a request to reset the password for your Dive Hub Admin account. Click the button below to set a new password:</p>
            <p style="margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #06b6d4; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px;">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
            <p>This link is only valid for 15 minutes. If you did not request this, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
            <p style="font-size: 11px; color: #999;">Dive Hub Marine Services</p>
          </div>
        `
      });
    }

    return successResponse();
  } catch (error: any) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
