import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Protected routes
  const protectedRoutes = ["/dashboard"];
  const authRoutes = ["/auth/login", "/auth/signup"];

  const { pathname } = request.nextUrl;

  // Allow API routes, auth routes, and public routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname === "/" ||
    pathname.startsWith("/menu")
  ) {
    return NextResponse.next();
  }

  // Redirect to login if accessing protected route (session check in components)
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

