import crypto from "crypto";
import nodemailer, { type Transporter } from "nodemailer";

type MailContext = {
  transporter: Transporter;
  from: string;
};

type ResetTokenPayload = {
  email: string;
  exp: number;
  nonce: string;
};

// Reset links stay valid for a short window to reduce replay risk.
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
let cachedMailContext: MailContext | null = null;

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

export const createResetToken = (email: string): string => {
  const payload: ResetTokenPayload = {
    email: email.toLowerCase(),
    exp: Date.now() + RESET_TOKEN_TTL_MS,
    nonce: crypto.randomBytes(8).toString("hex"),
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
};

const safeCompare = (a: string, b: string) => {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
};

export const validateResetToken = (token: string, email?: string): boolean => {
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

    if (email && payload.email !== email.toLowerCase()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

export const consumeResetToken = (_token: string) => {
  // Stateless token mode: no server-side token registry to delete.
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
