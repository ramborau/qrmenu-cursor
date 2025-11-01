import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "better-auth/utils";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user and account
    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Find credential account
    const account = user.accounts.find(
      (acc) => acc.provider === "credential" && acc.providerAccountId === user.id
    );

    if (!account || !account.password) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Manually verify password using Better Auth's verification
    const passwordHash = account.password;
    
    if (!passwordHash || typeof passwordHash !== 'string') {
      console.error("Password hash is not a string:", { type: typeof passwordHash, value: passwordHash });
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    const isValid = await verifyPassword(passwordHash, password);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Password is valid, now use Better Auth to create session
    // We need to patch the accounts array to include providerId
    // so Better Auth can find the account
    const accountsWithProviderId = user.accounts.map((acc) => ({
      ...acc,
      providerId: acc.provider,
      accountId: acc.id,
    }));

    // Try Better Auth sign-in with patched context
    try {
      const result = await auth.api.signInEmail({
        body: {
          email,
          password,
        },
        headers: request.headers,
      });

      if (result && !result.error) {
        return NextResponse.json(result);
      }
    } catch (authError: any) {
      // If Better Auth fails due to field mapping, manually create session
      console.error("Better Auth sign-in failed, but password is valid:", authError.message);
      
      // Create session manually
      const sessionToken = crypto.randomUUID();
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // 7 days

      await prisma.session.create({
        data: {
          sessionToken,
          userId: user.id,
          expires,
        },
      });

      // Set session cookie
      const response = NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });

      response.cookies.set("better-auth.session_token", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires,
      });

      return response;
    }

    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Sign-in error:", error.message);
    return NextResponse.json(
      { message: error.message || "Login failed" },
      { status: 401 }
    );
  }
}

