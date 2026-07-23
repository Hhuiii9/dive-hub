import { NextRequest, NextResponse } from "next/server";
import { usersDB, resetTokensDB, sessionsDB, hashPassword } from "@/lib/db";

// Helper to check password strength
function isPasswordStrong(password: string): boolean {
  if (password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);
  return hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, password_confirmation } = body;

    if (!token || !password || !password_confirmation) {
      return NextResponse.json(
        { success: false, message: "Token, password, and password confirmation are required." },
        { status: 400 }
      );
    }

    if (password !== password_confirmation) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match." },
        { status: 400 }
      );
    }

    if (!isPasswordStrong(password)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." 
        },
        { status: 400 }
      );
    }

    // Retrieve reset token
    const reset = resetTokensDB.getByToken(token);
    if (!reset || reset.used || new Date(reset.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, message: "Invalid, expired, or already used reset token." },
        { status: 400 }
      );
    }

    // Retrieve user
    const user = usersDB.getByEmail(reset.email);
    if (!user || !user.is_active) {
      return NextResponse.json(
        { success: false, message: "User account is no longer active." },
        { status: 400 }
      );
    }

    // Update password
    const newHash = hashPassword(password);
    usersDB.update(user.id, {
      password_hash: newHash
    });

    // Mark reset token as used
    resetTokensDB.use(token);

    // Invalidate all previous sessions/tokens for this user
    const allSessions = sessionsDB.getAll();
    const cleanSessions = allSessions.filter(s => s.user_id !== user.id);
    // Write them back to sessions DB
    const fs = require("fs");
    const path = require("path");
    fs.writeFileSync(path.join(process.cwd(), "data", "sessions.json"), JSON.stringify(cleanSessions, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      message: "Password reset successful. Please log in with your new password."
    });
  } catch (error: any) {
    console.error("Reset password API error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
