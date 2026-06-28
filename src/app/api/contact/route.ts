import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { contactLimiter, getRateLimitToken } from '@/lib/rate-limit'
import { contactSchema } from '@/lib/validations'
import { escapeHtml } from '@/lib/security'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    // Rate limiting — max 3 emails per hour per IP
    const token = getRateLimitToken(req);
    const { success: withinLimit } = contactLimiter.check(3, token);
    if (!withinLimit) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate and sanitize input
    const body = await req.json();
    const parseResult = contactSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input.', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email, message } = parseResult.data;

    // Escape user input for HTML email template
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_EMAIL}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_EMAIL,
      replyTo: email,
      subject: `Portfolio Contact from ${safeEmail}`,
      text: `From: ${email}\n\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">New Portfolio Contact</h2>
          <p><strong>From:</strong> ${safeEmail}</p>
          <hr style="border: 1px solid #e2e8f0;" />
          <p style="white-space: pre-wrap; color: #334155;">${safeMessage}</p>
          <hr style="border: 1px solid #e2e8f0;" />
          <p style="color: #94a3b8; font-size: 12px;">Sent from your portfolio contact form</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Contact API Error:", err?.message);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
