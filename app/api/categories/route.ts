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

    // Get all categories for user's restaurants
    const categories = await prisma.category.findMany({
      where: {
        restaurantId: { in: restaurantIds },
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
        subCategories: {
          include: {
            menuItems: true,
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { name, description, icon, restaurantId, sortOrder } = body;

    if (!name || !restaurantId) {
      return NextResponse.json(
        { message: "Name and restaurantId are required" },
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

    // Check for duplicate name
    const existing = await prisma.category.findFirst({
      where: {
        restaurantId,
        name,
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Category with this name already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        icon,
        restaurantId,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        restaurant: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}

