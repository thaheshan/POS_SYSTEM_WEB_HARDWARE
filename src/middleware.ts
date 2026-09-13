import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOGIN_PATH = "/auth/login";

// Definitive Role Access Map
// Staff can only access the POS and Customer portal.
// Managers can access management tools but NOT core settings or staff management.
// Admins have full access.
const ROLE_ACCESS_MAP: Record<string, string[]> = {
  super_admin: [
    "/admin"
  ],
  owner: [
    "/dashboard", 
    "/pos", 
    "/inventory", 
    "/customers", 
    "/suppliers", 
    "/sales", 
    "/reports", 
    "/staff-management", 
    "/activity-log",
    "/settings",
    "/payment"
  ],
  admin: [
    "/dashboard", 
    "/pos", 
    "/inventory", 
    "/customers", 
    "/suppliers", 
    "/sales", 
    "/reports", 
    "/staff-management", 
    "/activity-log",
    "/settings",
    "/payment"
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
  super_admin: "/admin/dashboard",
  owner: "/dashboard",
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
    // Allow root (/), login, register, forgot-password, approval-waiting, request-successful, request-rejected without authentication
    const isPublicRoute = isLoginRoute || pathname === "/" || pathname.startsWith("/auth/register") || pathname.startsWith("/auth/forgot-password") || pathname.startsWith("/auth/approval-waiting") || pathname.startsWith("/auth/request-successful") || pathname.startsWith("/auth/request-rejected") || pathname.startsWith("/payment") || pathname.startsWith("/receipt") || pathname.startsWith("/unauthorized");
    if (isPublicRoute) return NextResponse.next();
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  // 2. Authenticated users
  const payload = decodeJwtPayload(token);
  let role = payload?.role?.toLowerCase() || "";

  if (role === "shop_owner" || role === "shopowner") role = "owner";
  if (role === "superadmin") role = "super_admin";
  if (role === "user" || role === "cashier_user") role = "cashier";

  if (!role) {
    const response = NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    response.cookies.delete("pos_token");
    return response;
  }

  if (pathname.startsWith("/unauthorized")) {
    return NextResponse.next();
  }

  const home = ROLE_HOME_MAP[role] || "/dashboard";

  // 3. Prevent logged-in users from seeing login page
  if (isLoginRoute) {
    if (pathname === home) return NextResponse.next();
    return NextResponse.redirect(new URL(home, request.url));
  }

  // 4. Role Isolation
  // Root path handling
  if (pathname === "/") {
    if (pathname === home) return NextResponse.next();
    return NextResponse.redirect(new URL(home, request.url));
  }

  const allowedPaths = ROLE_ACCESS_MAP[role] ?? ["/dashboard"];
  const isAllowed = allowedPaths.some((path) => pathname.startsWith(path));

  // 4a. Specific Isolation for Sales Categories
  // Only Owners and Admins can see Category A/B and detailed reports.
  const isSensitiveSalesRoute = 
    pathname.startsWith("/sales/category-a") || 
    pathname.startsWith("/sales/category-b") ||
    pathname.startsWith("/sales/dashboard") ||
    pathname.startsWith("/reports/sales") ||
    pathname.startsWith("/reports/tax") ||
    pathname.startsWith("/reports/inventory");

  if (isSensitiveSalesRoute && role !== "admin" && role !== "owner") {
    if (pathname === home) return NextResponse.next();
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (!isAllowed) {
    if (pathname === home) return NextResponse.next();
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
