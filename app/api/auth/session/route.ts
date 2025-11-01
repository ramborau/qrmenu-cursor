import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get("better-auth.session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { message: "No session found" },
        { status: 401 }
      );
    }

    // Find session in database
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { message: "Invalid session" },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (session.expires < new Date()) {
      // Delete expired session
      await prisma.session.delete({
        where: { id: session.id },
      });

      return NextResponse.json(
        { message: "Session expired" },
        { status: 401 }
      );
    }

    // Return session with user data
    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        emailVerified: session.user.emailVerified,
        role: session.user.role,
      },
      session: {
        id: session.id,
        expires: session.expires,
      },
    });
  } catch (error: any) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to get session" },
      { status: 401 }
    );
  }
}

