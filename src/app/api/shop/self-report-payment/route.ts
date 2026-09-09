import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const TEXT_LK_API_URL = "https://app.text.lk/api/v3/sms/send";
const TEXT_LK_API_TOKEN = "5712|3BWcH4C9bFA69kplnjXmXlauJmxG1HIsPuXef5RF1eafd116";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Server-to-server text.lk SMS proxy (bypasses browser CORS & CSRF token checks)
    if (body?.action === "send-sms" || (body?.recipient && body?.message)) {
      const recipient = body.recipient;
      const senderId = body.sender_id || "TextLKDemo";
      const message = body.message;

      console.log("[SMS Server Proxy] Sending SMS server-to-server:", { recipient, senderId });

      let res = await fetch(TEXT_LK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${TEXT_LK_API_TOKEN}`,
        },
        body: JSON.stringify({
          recipient,
          sender_id: senderId,
          type: "plain",
          message,
        }),
        cache: "no-store",
      });

      let json = await res.json().catch(() => ({}));
      console.log("[SMS Server Proxy Result]", res.status, json);

      // Fallback: If custom sender ID failed, retry with TextLKDemo
      if (!res.ok || json?.status === "error" || json?.errors) {
        if (senderId !== "TextLKDemo") {
          console.warn("[SMS Server Proxy] Retrying with TextLKDemo...", json);
          res = await fetch(TEXT_LK_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${TEXT_LK_API_TOKEN}`,
            },
            body: JSON.stringify({
              recipient,
              sender_id: "TextLKDemo",
              type: "plain",
              message,
            }),
            cache: "no-store",
          });
          json = await res.json().catch(() => ({}));
          console.log("[SMS Server Proxy Fallback Result]", res.status, json);
        }
      }

      return NextResponse.json(json, { status: res.status });
    }

    // Default self report payment logic
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const token = req.cookies.get("pos_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${backendUrl}/shops/self-report-payment`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("[SMS Server Proxy Error]", err);
    return NextResponse.json({ message: err?.message || "Internal server error" }, { status: 500 });
  }
}
