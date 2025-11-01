import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { categoryOrders } = body;

    if (!Array.isArray(categoryOrders)) {
      return NextResponse.json(
        { message: "categoryOrders must be an array" },
        { status: 400 }
      );
    }

    // Get user's restaurants
    const restaurants = await prisma.restaurant.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    const restaurantIds = restaurants.map((r) => r.id);

    // Update sortOrder for each category
    const updates = await Promise.all(
      categoryOrders.map(({ id, sortOrder }: { id: string; sortOrder: number }) =>
        prisma.category.updateMany({
          where: {
            id,
            restaurantId: { in: restaurantIds },
          },
          data: {
            sortOrder,
          },
        })
      )
    );

    return NextResponse.json({
      message: "Categories reordered successfully",
      updated: updates.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to reorder categories" },
      { status: 500 }
    );
  }
}

