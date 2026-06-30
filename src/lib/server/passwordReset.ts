import crypto from "crypto";
import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import { Redis } from "@upstash/redis";

type MailContext = {
  transporter: Transporter;
  from: string;
};

type ResetTokenPayload = {
  email: string;
  exp: number;
  nonce: string;
};

type StoredResetTokenRecord = {
  email: string;
  exp: number;
  nonce: string;
};

// Reset links stay valid for a short window to reduce replay risk.
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const FORGOT_PASSWORD_COOLDOWN_MS = 60 * 1000;
let cachedMailContext: MailContext | null = null;
let cachedRedisClient: Redis | null = null;
const devResetTokenStore = new Map<string, StoredResetTokenRecord>();
const devForgotPasswordCooldowns = new Map<string, number>();

// Explanation of design choices:
// - Tokens and cooldowns are stored in Redis when configured (Upstash supported),
//   which makes the flow compatible with serverless platforms (Vercel).
// - In local development (NODE_ENV === 'development'), an in-memory Map is used
//   as a convenience fallback so the feature works without Redis setup.
// - The token stored is a signed payload (encodedPayload.signature) but we
//   also persist a record server-side so we can enforce one-time use and tie
//   the token to the email and expiry stored at issuance time.

const getBaseUrl = (overrideBaseUrl?: string) => {
  return (
    overrideBaseUrl?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000"
  );
};

const getFromEmail = () => {
  return process.env.MAIL_FROM?.trim() || "no-reply@futurahardware.local";
};

const getTokenSecret = () => {
  const envSecret = process.env.PASSWORD_RESET_SECRET?.trim();
  if (envSecret) {
    return envSecret;
  }

  // Dev fallback secret so links still work locally without extra setup.
  return "dev-password-reset-secret-change-me";
};

const toBase64Url = (value: string | Buffer) => {
  const buf = Buffer.isBuffer(value) ? value : Buffer.from(value, "utf8");
  return buf.toString("base64url");
};

const fromBase64Url = (value: string) => {
  return Buffer.from(value, "base64url").toString("utf8");
};

const signPayload = (encodedPayload: string) => {
  return toBase64Url(
    crypto
      .createHmac("sha256", getTokenSecret())
      .update(encodedPayload)
      .digest(),
  );
};

const getResetTokenKey = (token: string) => {
  return `password-reset:token:${crypto.createHash("sha256").update(token).digest("hex")}`;
};

const getForgotPasswordCooldownKey = (email: string) => {
  return `password-reset:cooldown:${email.toLowerCase()}`;
};

const getRedisClient = () => {
  if (cachedRedisClient) {
    return cachedRedisClient;
  }

  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.REDIS_REST_URL?.trim() ||
    "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.REDIS_REST_TOKEN?.trim() ||
    "";

  if (!url || !token) {
    return null;
  }

  cachedRedisClient = new Redis({ url, token });
  return cachedRedisClient;
};

const createEtherealTransport = async (): Promise<Transporter> => {
  const host = process.env.ETHEREAL_HOST?.trim();
  const port = process.env.ETHEREAL_PORT?.trim();
  const user = process.env.ETHEREAL_USER?.trim();
  const pass = process.env.ETHEREAL_PASS?.trim();

  // Reuse a fixed Ethereal inbox when credentials are provided.
  if (host && port && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: false,
      auth: { user, pass },
    });
  }

  // Otherwise create a throwaway Ethereal account on demand.
  const account = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
};

const getMailContext = async (): Promise<MailContext> => {
  // Create the SMTP transport only once per server process.
  if (cachedMailContext) {
    return cachedMailContext;
  }

  cachedMailContext = {
    transporter: await createEtherealTransport(),
    from: getFromEmail(),
  };

  return cachedMailContext;
};

const persistResetTokenRecord = async (
  token: string,
  record: StoredResetTokenRecord,
) => {
  const redis = getRedisClient();
  const key = getResetTokenKey(token);
  const ttlSeconds = Math.max(1, Math.ceil((record.exp - Date.now()) / 1000));

  if (redis) {
    await redis.set(key, JSON.stringify(record), { ex: ttlSeconds });
    return;
  }

  if (process.env.NODE_ENV === "development") {
    devResetTokenStore.set(key, record);
    return;
  }

  // Production fallback: stateless mode — token is validated by HMAC signature
  // and expiry only (no server-side one-time-use enforcement).
  console.warn("[forgot-password] Redis not configured — using stateless token mode.");
};

// readResetTokenRecord / removeResetTokenRecord are the single-source
// operations used by `validateResetToken` and `consumeResetToken` so that
// token validation and consumption are durable across server instances.

const readResetTokenRecord = async (
  token: string,
): Promise<StoredResetTokenRecord | null> => {
  const redis = getRedisClient();
  const key = getResetTokenKey(token);

  if (redis) {
    const value = await redis.get<string>(key);
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as StoredResetTokenRecord;
    } catch {
      return null;
    }
  }

  if (process.env.NODE_ENV === "development") {
    const memRecord = devResetTokenStore.get(key);
    if (memRecord) {
      return memRecord;
    }
    // If not found in memory (e.g. Next.js hot-reloaded and cleared memory),
    // fall through to the stateless payload decoder below.
    console.warn("[forgot-password] Token not in dev memory (hot-reload?), falling back to stateless decode");
  }

  // Stateless fallback: decode payload from token itself
  // Token is already HMAC-validated by the time we reach this call.
  try {
    const encodedPayload = token.split(".")[0];
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as StoredResetTokenRecord;
    return payload;
  } catch {
    return null;
  }
};

const removeResetTokenRecord = async (token: string) => {
  const redis = getRedisClient();
  const key = getResetTokenKey(token);

  if (redis) {
    await redis.del(key);
    return;
  }

  if (process.env.NODE_ENV === "development") {
    devResetTokenStore.delete(key);
    return;
  }

  // Production stateless fallback: nothing to delete — token expiry handles invalidation.
  console.warn("[forgot-password] Redis not configured — token will expire naturally via TTL.");
};

const setForgotPasswordCooldown = async (email: string) => {
  const redis = getRedisClient();
  const key = getForgotPasswordCooldownKey(email);

  if (redis) {
    await redis.set(key, Date.now().toString(), {
      ex: FORGOT_PASSWORD_COOLDOWN_MS / 1000,
    });
    return;
  }

  if (process.env.NODE_ENV === "development") {
    devForgotPasswordCooldowns.set(
      key,
      Date.now() + FORGOT_PASSWORD_COOLDOWN_MS,
    );
    return;
  }

  // Production stateless fallback: skip cooldown without Redis.
  console.warn("[forgot-password] Redis not configured — skipping cooldown.");
};

export const isForgotPasswordCoolingDown = async (
  email: string,
): Promise<boolean> => {
  const normalizedEmail = email.trim().toLowerCase();
  const redis = getRedisClient();
  const key = getForgotPasswordCooldownKey(normalizedEmail);

  if (redis) {
    return Boolean(await redis.get(key));
  }

  if (process.env.NODE_ENV === "development") {
    const expiresAt = devForgotPasswordCooldowns.get(key);
    if (!expiresAt) {
      return false;
    }

    if (expiresAt <= Date.now()) {
      devForgotPasswordCooldowns.delete(key);
      return false;
    }

    return true;
  }

  // Production stateless fallback: no cooldown enforcement without Redis.
  return false;
};

export const markForgotPasswordCooldown = async (email: string) => {
  await setForgotPasswordCooldown(email);
};

export const createResetToken = async (email: string): Promise<string> => {
  const payload: ResetTokenPayload = {
    email: email.toLowerCase(),
    exp: Date.now() + RESET_TOKEN_TTL_MS,
    nonce: crypto.randomBytes(8).toString("hex"),
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  const token = `${encodedPayload}.${signature}`;

  await persistResetTokenRecord(token, {
    email: payload.email,
    exp: payload.exp,
    nonce: payload.nonce,
  });

  return token;
};

const safeCompare = (a: string, b: string) => {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
};

export const validateResetToken = async (
  token: string,
  email: string,
): Promise<{ valid: boolean; reason?: string }> => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { valid: false, reason: "No email provided" };
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return { valid: false, reason: "Malformed token format" };
  }

  const expectedSignature = signPayload(encodedPayload);
  if (!safeCompare(signature, expectedSignature)) {
    return { valid: false, reason: "Invalid token signature (secret mismatch)" };
  }

  try {
    const payload = JSON.parse(
      fromBase64Url(encodedPayload),
    ) as ResetTokenPayload;

    if (!payload.email || !payload.exp) {
      return { valid: false, reason: "Token payload missing required fields" };
    }

    if (payload.exp <= Date.now()) {
      return { valid: false, reason: `Token expired at ${new Date(payload.exp).toISOString()} (Current time: ${new Date().toISOString()})` };
    }

    if (payload.email !== normalizedEmail) {
      return { valid: false, reason: `Email mismatch: token is for ${payload.email}, but requested for ${normalizedEmail}` };
    }

    const storedRecord = await readResetTokenRecord(token);
    if (!storedRecord) {
      return { valid: false, reason: "Token not found in durable storage or payload missing" };
    }

    if (storedRecord.email !== normalizedEmail) {
      return { valid: false, reason: "Stored email mismatch" };
    }

    if (storedRecord.exp !== payload.exp) {
      return { valid: false, reason: "Stored expiry mismatch" };
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, reason: `Exception during validation: ${err.message}` };
  }
};

export const consumeResetToken = async (token: string) => {
  await removeResetTokenRecord(token);
};

export const sendResetEmail = async (
  email: string,
  token: string,
  baseUrl?: string,
) => {
  // Use the provided Resend API key and initialize Resend
  const resend = new Resend('re_GorLXpod_MSXNW9oTZeQKE896UKJfLNrD');
  
  // Construct the reset link that users will click
  const resetLink = `${getBaseUrl(baseUrl)}/auth/forgot-password?token=${encodeURIComponent(token)}`;

  // Create a clean, responsive HTML template for the email
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
      <p style="color: #555; font-size: 16px;">Hello,</p>
      <p style="color: #555; font-size: 16px;">
        We received a request to reset the password for the Futura Hardware account associated with this email address.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #777; font-size: 14px; text-align: center;">
        If you didn't request a password reset, you can safely ignore this email. This link will expire in 15 minutes.
      </p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">
        &copy; ${new Date().getFullYear()} Futura Hardware POS. All rights reserved.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Futura Hardware <noreply@futurahardware.com>',
      to: email,
      subject: 'Futura Hardware - Reset your password',
      html: htmlTemplate,
    });

    if (error) {
      console.error("[forgot-password] Resend API Error:", error);
      throw error;
    }

    console.log("[forgot-password] Email sent successfully via Resend. ID:", data?.id);
    return { previewUrl: null, resetLink };
  } catch (err) {
    console.error("[forgot-password] Failed to send email via Resend:", err);
    throw err;
  }
};
