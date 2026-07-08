import { NextResponse } from "next/server";
import {
  consumeResetToken,
  validateResetToken,
} from "@/lib/server/passwordReset";

const MIN_PASSWORD_LENGTH = 8;

// Token validation runs server-side in Node.js runtime.
export const runtime = "nodejs";

const getUpstreamAuthBaseUrl = () => {
  return (
    process.env.AUTH_BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    ""
  );
};

// NOTE: This route does extra work compared to a simple token validator:
// - It requires `email` to avoid passing `undefined` into token validation.
// - It will forward the actual password update to an upstream auth service
//   (when `AUTH_BACKEND_URL` or `NEXT_PUBLIC_API_BASE_URL` is set) so that
//   the user's password is actually changed in the canonical backend.
// - Only after a successful upstream update do we consume the reset token
//   from the durable token store to enforce one-time use.

const forwardPasswordReset = async ({
  email,
  token,
  newPassword,
  requestUrl,
}: {
  email: string;
  token: string;
  newPassword: string;
  requestUrl: string;
}) => {
  const upstreamBaseUrl = getUpstreamAuthBaseUrl();
  if (!upstreamBaseUrl) {
    return { proxied: false };
  }

  const normalizedUpstreamBaseUrl = upstreamBaseUrl.replace(/\/$/, "");
  const upstreamOrigin = new URL(normalizedUpstreamBaseUrl, requestUrl).origin;
  const currentOrigin = new URL(requestUrl).origin;

  if (upstreamOrigin === currentOrigin) {
    return { proxied: false };
  }

  try {
    const response = await fetch(
      `${normalizedUpstreamBaseUrl}/auth/password-reset-external`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword }),
      },
    );

    if (!response.ok) {
      let message = `Upstream backend failed with status ${response.status}.`;
      try {
        const payload = (await response.json()) as { message?: string };
        if (typeof payload.message === "string" && payload.message.trim()) {
          message = payload.message;
        }
      } catch {
        // Keep fallback message.
      }

      console.error("[reset-password] Upstream returned error:", response.status, message);
      return {
        proxied: true,
        ok: false,
        status: response.status,
        message,
      };
    }

    return { proxied: true, ok: true };
  } catch (err: any) {
    console.error("[reset-password] Failed to connect to upstream auth backend:", err.message);
    return {
      proxied: true,
      ok: false,
      status: 502,
      message: "Unable to contact the authentication server. Please try again later.",
    };
  }
};

async function handlePasswordReset(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      token?: string;
      newPassword?: string;
    };

    const email = body.email?.trim().toLowerCase() ?? "";
    const token = body.token?.trim() ?? "";
    const newPassword = body.newPassword?.trim() ?? "";

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 },
      );
    }

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
    const validation = await validateResetToken(token, email);
    if (!validation.valid) {
      console.error("[reset-password] Token validation failed:", validation.reason);
      return NextResponse.json(
        { message: `Token validation failed: ${validation.reason}` },
        { status: 400 },
      );
    }

    const upstreamResult = await forwardPasswordReset({
      email,
      token,
      newPassword,
      requestUrl: req.url,
    });

    if (upstreamResult.proxied && upstreamResult.ok === false) {
      return NextResponse.json(
        { message: upstreamResult.message },
        { status: upstreamResult.status },
      );
    }

    // Enforce one-time use once the password update has been accepted.
    await consumeResetToken(token);

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

export async function POST(req: Request) {
  return handlePasswordReset(req);
}

export async function PATCH(req: Request) {
  return handlePasswordReset(req);
}
