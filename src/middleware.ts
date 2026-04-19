import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOGIN_PATH = "/auth/login";

// Definitive Role Access Map
// Staff can only access the POS and Customer portal.
// Managers can access management tools but NOT core settings or staff management.
// Admins have full access.
const ROLE_ACCESS_MAP: Record<string, string[]> = {
  admin: [
    "/dashboard", 
    "/pos", 
    "/inventory", 
    "/customers", 
    "/suppliers", 
    "/sales", 
    "/reports", 
    "/staff-management", 
    "/settings"
  ],
  manager: [
    "/dashboard", 
    "/pos", 
    "/inventory", 
    "/customers", 
    "/suppliers", 
    "/sales",
    "/staff-management"
  ],
  cashier: ["/dashboard", "/pos", "/customers", "/labour-services"],
  staff: ["/dashboard", "/pos", "/customers", "/labour-services"],
};

// Default entry point for each role after login
const ROLE_HOME_MAP: Record<string, string> = {
  admin: "/dashboard",
  manager: "/dashboard",
  cashier: "/dashboard",
  staff: "/dashboard",
};

const decodeJwtPayload = (token: string): any => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname.startsWith(LOGIN_PATH);
  const isPublicAsset = pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".");

  if (isPublicAsset) return NextResponse.next();

  const rawToken = request.cookies.get("pos_token")?.value;
  const token = rawToken ? decodeURIComponent(rawToken) : null;

  // 1. Unauthenticated users
  if (!token) {
    // Allow root (/), login, register, and forgot-password without authentication
    const isPublicRoute = isLoginRoute || pathname === "/" || pathname.startsWith("/auth/register") || pathname.startsWith("/auth/forgot-password");
    if (isPublicRoute) return NextResponse.next();
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  // 2. Authenticated users
  const payload = decodeJwtPayload(token);
  const role = payload?.role;

  if (!role) {
    const response = NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    response.cookies.delete("pos_token");
    return response;
  }

  // 3. Prevent logged-in users from seeing login page
  if (isLoginRoute) {
    const home = ROLE_HOME_MAP[role] || "/dashboard";
    return NextResponse.redirect(new URL(home, request.url));
  }

  // 4. Role Isolation
  // Root path handling
  if (pathname === "/") {
    const home = ROLE_HOME_MAP[role] || "/dashboard";
    return NextResponse.redirect(new URL(home, request.url));
  }

  const allowedPaths = ROLE_ACCESS_MAP[role] ?? [];
  const isAllowed = allowedPaths.some((path) => pathname.startsWith(path));

  // 4a. Specific Isolation for Sales Categories
  // Only Admins can see Category A and B. Others (Managers, etc.) are blocked.
  const isSensitiveSalesRoute = 
    pathname.startsWith("/sales/category-a") || 
    pathname.startsWith("/sales/category-b") ||
    pathname.startsWith("/sales/dashboard") ||
    pathname.startsWith("/reports/sales"); // Hide full reports too

  if (isSensitiveSalesRoute && role !== "admin") {
    const home = ROLE_HOME_MAP[role] || "/dashboard";
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (!isAllowed) {
    // If not allowed, redirect to their home page or unauthorized
    const home = ROLE_HOME_MAP[role] || "/unauthorized";
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
