import { NextRequest, NextResponse } from "next/server";
import { testEmailConnectionAndSend } from "@/lib/emailService";

export async function GET(request: NextRequest) {
  try {
    const result = await testEmailConnectionAndSend();

    if (result.success) {
      return NextResponse.json({
        status: "success",
        message: result.message,
        smtpVerified: result.smtpVerified,
        envStatus: result.envStatus,
        missingVars: result.missingVars,
      });
    } else {
      return NextResponse.json(
        {
          status: "error",
          error: result.message,
          smtpVerified: result.smtpVerified,
          envStatus: result.envStatus,
          missingVars: result.missingVars,
        },
        { status: result.smtpVerified ? 500 : 400 }
      );
    }
  } catch (error: any) {
    console.error("Email test endpoint error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: "An unexpected error occurred during email health check.",
      },
      { status: 500 }
    );
  }
}
