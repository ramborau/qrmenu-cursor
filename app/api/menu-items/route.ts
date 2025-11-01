import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const subCategoryId = searchParams.get("subCategoryId");

    const menuItems = await prisma.menuItem.findMany({
      where: subCategoryId ? { subCategoryId } : undefined,
      include: {
        subCategory: {
          include: {
            category: {
              include: {
                restaurant: true,
              },
            },
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json(menuItems);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const {
      name,
      description,
      price,
      currency,
      imageUrl,
      tags,
      allergens,
      availabilityStatus,
      preparationTime,
      subCategoryId,
      sortOrder,
    } = body;

    if (!name || !price || !subCategoryId) {
      return NextResponse.json(
        { message: "Name, price, and subCategoryId are required" },
        { status: 400 }
      );
    }

    // Verify sub-category belongs to user's restaurant
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
      include: {
        category: {
          include: {
            restaurant: true,
          },
        },
      },
    });

    if (!subCategory || subCategory.category.restaurant.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Sub-category not found or unauthorized" },
        { status: 404 }
      );
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        currency: currency || "USD",
        imageUrl,
        tags: tags || [],
        allergens: allergens || [],
        availabilityStatus: availabilityStatus || "AVAILABLE",
        preparationTime: preparationTime ? parseInt(preparationTime) : null,
        subCategoryId,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        subCategory: true,
      },
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to create menu item" },
      { status: 500 }
    );
  }
}

