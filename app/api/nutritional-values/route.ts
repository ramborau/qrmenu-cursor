import { NextRequest, NextResponse } from "next/server";
import { calculateNutritionalValues } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Menu item name is required" },
        { status: 400 }
      );
    }

    const nutritionalValues = await calculateNutritionalValues({
      name,
      description: description || undefined,
    });

    if (!nutritionalValues) {
      return NextResponse.json(
        { message: "Failed to calculate nutritional values" },
        { status: 500 }
      );
    }

    return NextResponse.json(nutritionalValues);
  } catch (error: any) {
    console.error("Error calculating nutritional values:", error);
    return NextResponse.json(
      { message: error.message || "Failed to calculate nutritional values" },
      { status: 500 }
    );
  }
}

