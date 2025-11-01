import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Better Auth handles password reset internally
    const result = await auth.api.forgetPassword({
      body: { email },
      headers: request.headers,
    });

    return NextResponse.json({
      message: "Password reset email sent if account exists",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Request failed" },
      { status: 400 }
    );
  }
}

