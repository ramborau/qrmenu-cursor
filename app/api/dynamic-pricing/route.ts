import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Get user's restaurants
    const restaurants = await prisma.restaurant.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    const restaurantIds = restaurants.map((r) => r.id);

    const dynamicPricing = await prisma.dynamicPricing.findMany({
      where: {
        restaurantId: { in: restaurantIds },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(dynamicPricing);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch dynamic pricing" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const {
      restaurantId,
      name,
      description,
      daysOfWeek,
      startTime,
      endTime,
      adjustmentType,
      adjustmentValue,
      targetType,
      targetIds,
      isActive,
    } = body;

    if (!restaurantId || !name || !adjustmentValue) {
      return NextResponse.json(
        { message: "restaurantId, name, and adjustmentValue are required" },
        { status: 400 }
      );
    }

    // Verify restaurant belongs to user
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        ownerId: session.user.id,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { message: "Restaurant not found or unauthorized" },
        { status: 404 }
      );
    }

    const dynamicPricing = await prisma.dynamicPricing.create({
      data: {
        restaurantId,
        name,
        description,
        daysOfWeek: daysOfWeek || [],
        startTime: startTime || "00:00",
        endTime: endTime || "23:59",
        adjustmentType: adjustmentType || "PERCENTAGE",
        adjustmentValue: parseFloat(adjustmentValue),
        targetType: targetType || "ALL",
        targetIds: targetIds || [],
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(dynamicPricing, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to create dynamic pricing" },
      { status: 500 }
    );
  }
}
