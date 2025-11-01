import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, restaurantId, tableNumber, menuItemId } = body;

    // Basic analytics tracking
    // In production, this would store in database or analytics service
    console.log("Analytics Event:", {
      type,
      restaurantId,
      tableNumber,
      menuItemId,
      timestamp: new Date().toISOString(),
    });

    // TODO: Store in database analytics table
    // For now, just log the event

    return NextResponse.json({ message: "Event tracked" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to track event" },
      { status: 500 }
    );
  }
}

