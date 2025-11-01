import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function requireAuth(
  request: NextRequest,
  allowedRoles?: string[]
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role || "")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return null; // User is authenticated and has required role
}

export async function getSession(request: NextRequest) {
  return await auth.api.getSession({
    headers: request.headers,
  });
}

