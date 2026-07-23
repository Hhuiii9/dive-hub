import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { name, email, phone, message } = await request.json();

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: "All fields (name, email, phone, message) are required." },
        { status: 400 }
      );
    }

    // Configure the transporter.
    // Gmail/Google Workspace works best with these settings.
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      text: `You have received a new message from your website contact form.

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
          <h2 style="color: #03131d; border-bottom: 2px solid #67e8f9; padding-bottom: 10px;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
          <div style="margin-top: 20px; padding: 15px; bg-color: #f9f9f9; border-left: 4px solid #67e8f9; background: #f9f9f9;">
            <p style="margin: 0; font-weight: bold; color: #555;">Message:</p>
            <p style="margin: 5px 0 0 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Email sent successfully!" });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
