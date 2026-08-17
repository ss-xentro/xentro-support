import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return new NextResponse("Email is required", { status: 400 })
    }

    // Generate a 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store in DB, expires in 10 minutes
    await prisma.oTP.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    })

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Support" <support@xentro.in>',
      to: email,
      subject: "Your Login Code",
      text: `Your login code is: ${code}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Your Support Login Code</h2>
          <p>Please use the following 6-digit code to log in:</p>
          <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;">
            ${code}
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">This code is valid for 10 minutes.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SEND_OTP]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
