import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to get session" },
      { status: 401 }
    );
  }
}

