import { NextResponse } from "next/server";
import {
  consumeResetToken,
  validateResetToken,
} from "@/lib/server/passwordReset";

const MIN_PASSWORD_LENGTH = 8;

// Token validation runs server-side in Node.js runtime.
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      token?: string;
      newPassword?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const token = body.token?.trim() ?? "";
    const newPassword = body.newPassword?.trim() ?? "";

    if (!token) {
      return NextResponse.json(
        { message: "Reset token is required." },
        { status: 400 },
      );
    }

    if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { message: "New password must be at least 8 characters." },
        { status: 400 },
      );
    }

    // Validate token ownership/expiry before consuming it.
    const valid = validateResetToken(token, email);
    if (!valid) {
      return NextResponse.json(
        { message: "The reset token is invalid or expired." },
        { status: 400 },
      );
    }

    // Enforce one-time use once reset is accepted.
    consumeResetToken(token);

    return NextResponse.json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("[reset-password] Failed to reset password", error);
    return NextResponse.json(
      { message: "The reset token is invalid or expired." },
      { status: 500 },
    );
  }
}
