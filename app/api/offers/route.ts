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

    const offers = await prisma.offer.findMany({
      where: {
        restaurantId: { in: restaurantIds },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(offers);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch offers" },
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
      offerType,
      discountValue,
      targetType,
      targetIds,
      startDate,
      endDate,
      isForever,
      daysOfWeek,
      startTime,
      endTime,
      isActive,
    } = body;

    if (!restaurantId || !name) {
      return NextResponse.json(
        { message: "restaurantId and name are required" },
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

    const offer = await prisma.offer.create({
      data: {
        restaurantId,
        name,
        description,
        offerType: offerType || "DISCOUNT",
        discountValue: discountValue ? parseFloat(discountValue) : null,
        targetType: targetType || "ALL",
        targetIds: targetIds || [],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isForever: isForever || false,
        daysOfWeek: daysOfWeek || [],
        startTime: startTime || null,
        endTime: endTime || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to create offer" },
      { status: 500 }
    );
  }
}
