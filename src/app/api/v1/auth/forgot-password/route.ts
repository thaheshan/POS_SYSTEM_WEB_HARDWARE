import { NextResponse } from "next/server";
import { createResetToken, sendResetEmail } from "@/lib/server/passwordReset";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Nodemailer/Ethereal requires a Node.js runtime (not edge).
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() ?? "";

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: "Enter a valid email address." },
        { status: 400 },
      );
    }

    // Generate and persist a short-lived reset token before sending.
    const token = createResetToken(email);
    const requestOrigin = new URL(req.url).origin;
    const mailResult = await sendResetEmail(email, token, requestOrigin);

    return NextResponse.json({
      message: "If the account exists, reset instructions have been sent.",
      // Expose debug mail links only in development.
      ...(process.env.NODE_ENV !== "production"
        ? { previewUrl: mailResult.previewUrl, resetLink: mailResult.resetLink }
        : {}),
    });
  } catch (error) {
    console.error("[forgot-password] Failed to send reset email", error);
    return NextResponse.json(
      { message: "Unable to request a password reset." },
      { status: 500 },
    );
  }
}
