import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const {
      categoryIds,
      subCategoryIds,
      menuItemIds,
      percentage,
      action, // "increase" or "decrease"
    } = body;

    if (percentage === undefined || !action) {
      return NextResponse.json(
        { message: "Percentage and action are required" },
        { status: 400 }
      );
    }

    if (percentage <= 0 || percentage > 100) {
      return NextResponse.json(
        { message: "Percentage must be between 1 and 100" },
        { status: 400 }
      );
    }

    // Get user's restaurants
    const restaurants = await prisma.restaurant.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    const restaurantIds = restaurants.map((r) => r.id);

    // Build where clause
    const whereClause: any = {
      subCategory: {
        category: {
          restaurantId: { in: restaurantIds },
        },
      },
    };

    // If specific menu items are selected
    if (menuItemIds && Array.isArray(menuItemIds) && menuItemIds.length > 0) {
      whereClause.id = { in: menuItemIds };
    } else if (subCategoryIds && Array.isArray(subCategoryIds) && subCategoryIds.length > 0) {
      // If sub-categories are selected
      whereClause.subCategoryId = { in: subCategoryIds };
    } else if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
      // If categories are selected
      whereClause.subCategory = {
        ...whereClause.subCategory,
        categoryId: { in: categoryIds },
      };
    }

    // Get all menu items to update
    const menuItems = await prisma.menuItem.findMany({
      where: whereClause,
    });

    if (menuItems.length === 0) {
      return NextResponse.json(
        { message: "No menu items found to update" },
        { status: 404 }
      );
    }

    // Calculate new prices
    const updatePromises = menuItems.map((item) => {
      const multiplier = action === "increase" ? 1 + percentage / 100 : 1 - percentage / 100;
      const newPrice = Math.round((item.price * multiplier) * 100) / 100; // Round to 2 decimals

      return prisma.menuItem.update({
        where: { id: item.id },
        data: { price: newPrice },
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: `Successfully ${action}d prices for ${menuItems.length} menu items by ${percentage}%`,
      updatedCount: menuItems.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update prices" },
      { status: 500 }
    );
  }
}
