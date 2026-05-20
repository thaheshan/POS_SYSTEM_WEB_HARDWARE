import crypto from "crypto";
import nodemailer, { type Transporter } from "nodemailer";
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

  throw new Error("Reset token storage requires Redis or a database.");
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
    return devResetTokenStore.get(key) ?? null;
  }

  throw new Error("Reset token storage requires Redis or a database.");
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

  throw new Error("Reset token storage requires Redis or a database.");
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

  throw new Error(
    "Forgot-password cooldown storage requires Redis or a database.",
  );
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

  throw new Error(
    "Forgot-password cooldown storage requires Redis or a database.",
  );
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
): Promise<boolean> => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return false;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = signPayload(encodedPayload);
  if (!safeCompare(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      fromBase64Url(encodedPayload),
    ) as ResetTokenPayload;

    if (!payload.email || !payload.exp) {
      return false;
    }

    if (payload.exp <= Date.now()) {
      return false;
    }

    if (payload.email !== normalizedEmail) {
      return false;
    }

    const storedRecord = await readResetTokenRecord(token);
    // Ensure the token exists server-side and matches the expected payload.
    // This prevents stateless replay of a token that was not recorded,
    // and allows us to check one-time-use semantics.
    if (!storedRecord) {
      return false;
    }

    if (storedRecord.email !== normalizedEmail) {
      return false;
    }

    if (storedRecord.exp !== payload.exp) {
      return false;
    }

    return true;
  } catch {
    return false;
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
  const { transporter, from } = await getMailContext();
  // Keep reset on the existing forgot-password route with a token query.
  const resetLink = `${getBaseUrl(baseUrl)}/auth/forgot-password?token=${encodeURIComponent(token)}`;

  const info = await transporter.sendMail({
    from,
    to: email,
    subject: "Reset your password",
    text: `Use this link to reset your password: ${resetLink}`,
    html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Reset Password</a></p><p>This link expires in 15 minutes.</p>`,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    // Preview URL lets developers open the email in Ethereal UI quickly.
    console.log("[forgot-password] Ethereal preview URL:", previewUrl);
  }

  return { previewUrl, resetLink };
};
