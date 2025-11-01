import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        restaurant: true,
        subCategories: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { name, description, icon, sortOrder, showImages } = body;

    // Verify category belongs to user's restaurant
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        restaurant: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    if (category.restaurant.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check for duplicate name if name changed
    if (name && name !== category.name) {
      const existing = await prisma.category.findFirst({
        where: {
          restaurantId: category.restaurantId,
          name,
          id: { not: params.id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { message: "Category with this name already exists" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(showImages !== undefined && { showImages }),
      },
      include: {
        restaurant: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();

    // Verify category belongs to user's restaurant
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        restaurant: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    if (category.restaurant.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}

