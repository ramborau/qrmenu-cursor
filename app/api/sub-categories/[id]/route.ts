import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: params.id },
      include: {
        category: {
          include: {
            restaurant: true,
          },
        },
        menuItems: true,
      },
    });

    if (!subCategory) {
      return NextResponse.json(
        { message: "Sub-category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subCategory);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch sub-category" },
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
    const { name, description, sortOrder } = body;

    // Verify sub-category belongs to user's restaurant
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: params.id },
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

    // Check for duplicate name if name changed
    if (name && name !== subCategory.name) {
      const existing = await prisma.subCategory.findFirst({
        where: {
          categoryId: subCategory.categoryId,
          name,
          id: { not: params.id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { message: "Sub-category with this name already exists" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.subCategory.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update sub-category" },
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

    // Verify sub-category belongs to user's restaurant
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: params.id },
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

    await prisma.subCategory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Sub-category deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to delete sub-category" },
      { status: 500 }
    );
  }
}

