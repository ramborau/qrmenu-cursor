import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Debug: Check if user and account exist
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

    const account = user.accounts.find(
      (acc) => acc.provider === "credential" && acc.providerAccountId === user.id
    );

    if (!account || !account.password) {
      console.error("Account not found or missing password:", {
        userId: user.id,
        email,
        accounts: user.accounts.map((a) => ({
          provider: a.provider,
          providerAccountId: a.providerAccountId,
          hasPassword: !!a.password,
        })),
      });
    }

    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: request.headers,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Sign-in error:", error.message);
    return NextResponse.json(
      { message: error.message || "Login failed" },
      { status: 401 }
    );
  }
}

