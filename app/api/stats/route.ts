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

    // Get stats
    const [
      totalItems,
      totalCategories,
      totalTables,
      totalSubCategories,
    ] = await Promise.all([
      prisma.menuItem.count({
        where: {
          subCategory: {
            category: {
              restaurantId: { in: restaurantIds },
            },
          },
        },
      }),
      prisma.category.count({
        where: {
          restaurantId: { in: restaurantIds },
        },
      }),
      prisma.table.count({
        where: {
          restaurantId: { in: restaurantIds },
        },
      }),
      prisma.subCategory.count({
        where: {
          category: {
            restaurantId: { in: restaurantIds },
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalItems,
      totalCategories,
      totalSubCategories,
      totalTables,
      totalScans: 0, // Placeholder - would need analytics tracking
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

