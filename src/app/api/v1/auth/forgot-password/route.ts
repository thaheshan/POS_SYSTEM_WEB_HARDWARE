import { NextResponse } from "next/server";
import {
  createResetToken,
  isForgotPasswordCoolingDown,
  markForgotPasswordCooldown,
  sendResetEmail,
} from "@/lib/server/passwordReset";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Nodemailer/Ethereal requires a Node.js runtime (not edge).
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() ?? "";

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (await isForgotPasswordCoolingDown(email)) {
      return NextResponse.json(
        {
          message:
            "Please wait before requesting another password reset email.",
        },
        { status: 429 },
      );
    }

    // Generate and persist a short-lived reset token before sending.
    // Persisted token: `createResetToken` will store the token in Redis
    // (or a development in-memory fallback). This ensures serverless
    // environments can validate/consume the token across invocations.
    const token = await createResetToken(email);
    const requestOrigin = new URL(req.url).origin;
    const mailResult = await sendResetEmail(email, token, requestOrigin);

    await markForgotPasswordCooldown(email);

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
