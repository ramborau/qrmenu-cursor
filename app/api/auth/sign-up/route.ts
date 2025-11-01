import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    try {
      const result = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
        headers: request.headers,
      });

      return NextResponse.json(result);
    } catch (signupError: any) {
      // Better Auth is trying to create account with accountId/providerId
      // Extract password hash from error and create manually
      const errorMessage = signupError.message || '';
      
      // Extract password hash if present in error
      const passwordMatch = errorMessage.match(/password:\s*"([^"]+)"/);
      
      if (passwordMatch && errorMessage.includes('accountId')) {
        // User was created but account creation failed
        const passwordHash = passwordMatch[1];
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          // Create account manually with correct field mapping
          await prisma.account.create({
            data: {
              userId: user.id,
              type: 'credential',
              provider: 'credential',
              providerAccountId: user.id,
              password: passwordHash,
            },
          });

          return NextResponse.json({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
          });
        }
      }

      // If we can't fix it, return the error
      return NextResponse.json(
        { message: signupError.message || "Sign up failed" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Sign up failed" },
      { status: 400 }
    );
  }
}

