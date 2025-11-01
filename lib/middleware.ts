import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function authMiddleware(request: NextRequest) {
  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/api/menu", "/api/qr-codes"];
  const publicRoutes = ["/", "/auth", "/menu"];

  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Allow public routes and API auth routes
  if (isPublicRoute || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // For protected routes, check session in API call
  // This is a basic check - actual session validation happens in API routes
  if (isProtectedRoute) {
    // Session check will be handled in server components/API routes
    return NextResponse.next();
  }

  return NextResponse.next();
}

