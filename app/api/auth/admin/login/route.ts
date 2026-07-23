import { NextRequest, NextResponse } from "next/server";
import { usersDB, sessionsDB, hashPassword } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email/username and password are required." },
        { status: 400 }
      );
    }

    // Try finding user by email or username
    const user = usersDB.getByEmail(email);

    // Generic response for security to not reveal if user exists
    const invalidResponse = () => {
      console.warn(`[AUTH] Failed login attempt for user: ${email}`);
      return NextResponse.json(
        { success: false, message: "Invalid email/username or password." },
        { status: 401 }
      );
    };

    if (!user) {
      return invalidResponse();
    }

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, message: "Your account is inactive. Please contact support." },
        { status: 403 }
      );
    }

    // Hash the input password and compare
    const hashed = hashPassword(password);
    if (user.password_hash !== hashed) {
      return invalidResponse();
    }

    // Update last login info
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    usersDB.update(user.id, {
      last_login_at: new Date().toISOString(),
      last_login_ip: ip
    });

    // Create a new session
    const session = sessionsDB.create(user.id);

    // Prepare response
    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        access_token: session.token,
        refresh_token: session.refresh_token
      }
    });

    // Set cookie for browser session authentication
    // Determine cookie parameters
    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("admin_token", session.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 // 1 hour
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
