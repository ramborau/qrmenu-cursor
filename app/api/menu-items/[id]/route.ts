import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
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
    });

    if (!menuItem) {
      return NextResponse.json(
        { message: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(menuItem);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch menu item" },
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

    // Verify menu item belongs to user's restaurant
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
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
    });

    if (!menuItem || menuItem.subCategory.category.restaurant.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Menu item not found or unauthorized" },
        { status: 404 }
      );
    }

    const updated = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.allergens !== undefined && { allergens: body.allergens }),
        ...(body.availabilityStatus !== undefined && { availabilityStatus: body.availabilityStatus }),
        ...(body.preparationTime !== undefined && { preparationTime: body.preparationTime ? parseInt(body.preparationTime) : null }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
      include: {
        subCategory: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update menu item" },
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

    // Verify menu item belongs to user's restaurant
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
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
    });

    if (!menuItem || menuItem.subCategory.category.restaurant.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Menu item not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.menuItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Menu item deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to delete menu item" },
      { status: 500 }
    );
  }
}

