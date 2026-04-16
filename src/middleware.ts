import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type JwtPayload = {
  role?: string;
};

const LOGIN_PATH = "/auth/login";

// Each role can access only these route groups.
const ROLE_ACCESS_MAP: Record<string, string[]> = {
  admin: ["/admin", "/manager", "/reports"],
  manager: ["/manager", "/reports", "/orders", "/suppliers"],
  cashier: ["/cashier", "/sales"],
};

// Reserved for future "redirect to role home" behavior.
const ROLE_HOME_MAP: Record<string, string> = {
  admin: "/admin",
  manager: "/manager",
  cashier: "/cashier",
};

const decodeJwtPayload = (token: string): JwtPayload | null => {
  const parts = token.split(".");

  if (parts.length < 2) {
    return null;
  }

  try {
    // JWT uses base64url, so normalize before decoding.
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decoded = atob(paddedBase64);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
};

const decodeCookieToken = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === LOGIN_PATH;

  // Token is written URL-encoded in the auth slice, so decode before reading JWT.
  const rawToken = request.cookies.get("pos_token")?.value;
  const token = rawToken ? decodeCookieToken(rawToken) : null;

  // Allow login page regardless of auth state
  if (isLoginRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  const payload = decodeJwtPayload(token);
  const role = payload?.role;

  if (!role) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  // Enforce role-based route access with simple prefix matching.
  const allowedPaths = ROLE_ACCESS_MAP[role] ?? [];
  const isAllowed = allowedPaths.some((path) => pathname.startsWith(path));

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/login",
    "/admin",
    "/admin/:path*",
    "/manager",
    "/manager/:path*",
    "/cashier",
    "/cashier/:path*",
    "/reports",
    "/reports/:path*",
    "/orders",
    "/orders/:path*",
    "/suppliers",
    "/suppliers/:path*",
    "/sales",
    "/sales/:path*",
  ],
};
