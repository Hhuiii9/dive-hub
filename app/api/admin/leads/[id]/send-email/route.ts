import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { leadsDB, emailsDB } from "@/lib/db";
import { sendEmailTask } from "@/lib/emailService";

// Simple HTML sanitizer to prevent XSS in email preview
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*(['"])(.*?)\1/gi, "")
    .replace(/javascript\s*:\s*/gi, "no-js:");
}

// Basic email regex validator
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Verify addresses (e.g. CC/BCC might be comma-separated list)
function validateEmailList(listStr: string): { valid: boolean; errors: string[] } {
  if (!listStr) return { valid: true, errors: [] };
  const emails = listStr.split(",").map(e => e.trim()).filter(Boolean);
  const errors: string[] = [];
  
  for (const email of emails) {
    if (!isValidEmail(email)) {
      errors.push(`"${email}" is not a valid email address.`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;
    const currentUser = getAuthenticatedUser(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const lead = leadsDB.getById(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const body = await request.json();
    const { to, cc = "", bcc = "", subject, message } = body;

    // Validation
    const validationErrors: Record<string, string> = {};

    if (!to || !isValidEmail(to)) {
      validationErrors.to = "A valid recipient email is required.";
    }

    if (!subject || subject.trim() === "") {
      validationErrors.subject = "Subject is required.";
    } else if (subject.includes("\n") || subject.includes("\r")) {
      validationErrors.subject = "Subject must not contain newline characters (header injection protection).";
    }

    if (!message || message.trim() === "") {
      validationErrors.message = "Message body is required.";
    }

    // CC/BCC validation & injection check
    if (cc) {
      if (cc.includes("\n") || cc.includes("\r")) {
        validationErrors.cc = "CC must not contain newline characters.";
      } else {
        const ccVal = validateEmailList(cc);
        if (!ccVal.valid) validationErrors.cc = ccVal.errors.join(" ");
      }
    }

    if (bcc) {
      if (bcc.includes("\n") || bcc.includes("\r")) {
        validationErrors.bcc = "BCC must not contain newline characters.";
      } else {
        const bccVal = validateEmailList(bcc);
        if (!bccVal.valid) validationErrors.bcc = bccVal.errors.join(" ");
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json({ 
        error: "Validation failed.", 
        fields: validationErrors 
      }, { status: 400 });
    }

    // Sanitize HTML body
    const sanitizedMessage = sanitizeHtml(message);

    // Create log record
    const emailLog = emailsDB.create({
      lead_id: leadId,
      sent_by: currentUser.name || currentUser.username,
      email_type: "admin_reply",
      recipient: to.trim(),
      cc: cc.trim(),
      bcc: bcc.trim(),
      subject: subject.trim(),
      message: sanitizedMessage,
      status: "pending"
    });

    // Send email synchronously to return immediate result
    const sentSuccessfully = await sendEmailTask(emailLog.id);

    if (sentSuccessfully) {
      // Update Lead contact tracking info
      const updateData: any = {
        last_contacted_at: new Date().toISOString(),
        last_contacted_by: currentUser.name || currentUser.username
      };

      // Change status to contacted if it was new
      if (lead.status === "new") {
        updateData.status = "contacted";
      }

      leadsDB.update(leadId, updateData);

      return NextResponse.json({
        success: true,
        message: "Email sent successfully."
      });
    } else {
      const failedLog = emailsDB.getById(emailLog.id);
      return NextResponse.json({
        success: false,
        error: "Failed to send email. Please check your SMTP configuration.",
        details: failedLog?.error_message || "SMTP server failed to accept the message."
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Admin send email API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while sending the email." },
      { status: 500 }
    );
  }
}
