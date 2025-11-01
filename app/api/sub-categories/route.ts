import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const subCategories = await prisma.subCategory.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: {
        category: {
          include: {
            restaurant: true,
          },
        },
        menuItems: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json(subCategories);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch sub-categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { name, description, icon, categoryId, sortOrder } = body;

    if (!name || !categoryId) {
      return NextResponse.json(
        { message: "Name and categoryId are required" },
        { status: 400 }
      );
    }

    // Verify category belongs to user's restaurant
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        restaurant: true,
      },
    });

    if (!category || category.restaurant.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Category not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check for duplicate name
    const existing = await prisma.subCategory.findFirst({
      where: {
        categoryId,
        name,
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Sub-category with this name already exists" },
        { status: 400 }
      );
    }

    const subCategory = await prisma.subCategory.create({
      data: {
        name,
        description,
        icon: icon || null,
        categoryId,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(subCategory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to create sub-category" },
      { status: 500 }
    );
  }
}

