import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const { email, message } = await req.json()

    if (!email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Email and message are required.' }, { status: 400 })
    }

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
      subject: `Portfolio Contact from ${email}`,
      text: `From: ${email}\n\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">New Portfolio Contact</h2>
          <p><strong>From:</strong> ${email}</p>
          <hr style="border: 1px solid #e2e8f0;" />
          <p style="white-space: pre-wrap; color: #334155;">${message}</p>
          <hr style="border: 1px solid #e2e8f0;" />
          <p style="color: #94a3b8; font-size: 12px;">Sent from your portfolio contact form</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send message. Please try again later.' }, { status: 500 })
  }
}
