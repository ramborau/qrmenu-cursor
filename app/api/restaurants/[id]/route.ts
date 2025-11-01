import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      include: {
        categories: {
          include: {
            subCategories: {
              include: {
                menuItems: true,
              },
            },
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { message: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch restaurant" },
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

    // Verify restaurant belongs to user
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
    });

    if (!restaurant || restaurant.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Restaurant not found or unauthorized" },
        { status: 404 }
      );
    }

    // Build update data object - only include fields that are provided
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl;
    if (body.heroImageUrl !== undefined) updateData.heroImageUrl = body.heroImageUrl;
    if (body.primaryColor !== undefined) updateData.primaryColor = body.primaryColor;
    if (body.secondaryColor !== undefined) updateData.secondaryColor = body.secondaryColor;
    if (body.backgroundColor !== undefined) updateData.backgroundColor = body.backgroundColor;
    if (body.darkTheme !== undefined) updateData.darkTheme = Boolean(body.darkTheme);
    if (body.typographySettings !== undefined) updateData.typographySettings = body.typographySettings;

    const updated = await prisma.restaurant.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Restaurant update error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update restaurant", error: String(error) },
      { status: 500 }
    );
  }
}

