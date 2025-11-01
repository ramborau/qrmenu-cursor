import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getSession() {
  try {
    // Get session token from cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!sessionToken) {
      return null;
    }

    // Find session in database
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: true,
      },
    });

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expires < new Date()) {
      // Delete expired session
      await prisma.session.delete({
        where: { id: session.id },
      });
      return null;
    }

    // Return session with user data in Better Auth format
    return {
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
    };
  } catch (error) {
    console.error("getSession error:", error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getUser() {
  const session = await getSession();
  return session?.user || null;
}

