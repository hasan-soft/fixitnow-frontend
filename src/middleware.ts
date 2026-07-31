import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/register") && token) {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    if (role === "TECHNICIAN") {
      return NextResponse.redirect(
        new URL("/dashboard/technician", request.url),
      );
    }
    return NextResponse.redirect(new URL("/dashboard/customer", request.url));
  }

  if (token) {
    // Admin route check
    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return NextResponse.redirect(
        new URL(getRoleDefaultDashboard(role), request.url),
      );
    }

    // Technician route check
    if (pathname.startsWith("/dashboard/technician") && role !== "TECHNICIAN") {
      return NextResponse.redirect(
        new URL(getRoleDefaultDashboard(role), request.url),
      );
    }

    if (pathname.startsWith("/dashboard/customer") && role !== "CUSTOMER") {
      return NextResponse.redirect(
        new URL(getRoleDefaultDashboard(role), request.url),
      );
    }
  }

  return NextResponse.next();
}

function getRoleDefaultDashboard(role?: string) {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "TECHNICIAN") return "/dashboard/technician";
  return "/dashboard/customer";
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
