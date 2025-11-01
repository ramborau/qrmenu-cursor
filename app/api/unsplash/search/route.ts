import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { searchUnsplashImages } from "@/lib/unsplash";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "10");

    if (!query) {
      return NextResponse.json(
        { message: "Query parameter is required" },
        { status: 400 }
      );
    }

    const images = await searchUnsplashImages(query, page, perPage);

    return NextResponse.json(images);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to search Unsplash" },
      { status: 500 }
    );
  }
}

