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

    // Get comprehensive stats
    const [
      totalItems,
      totalCategories,
      totalTables,
      totalSubCategories,
      totalQRScans,
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
      // QR scan tracking would be in analytics table (placeholder for now)
      Promise.resolve(0),
    ]);

    return NextResponse.json({
      totalItems,
      totalCategories,
      totalSubCategories,
      totalTables,
      totalScans: totalQRScans,
      popularItems: [], // Would query from analytics table
      recentActivity: [], // Would query from activity log
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

