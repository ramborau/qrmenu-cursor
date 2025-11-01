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

    const updated = await prisma.restaurant.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
        ...(body.heroImageUrl !== undefined && { heroImageUrl: body.heroImageUrl }),
        ...(body.primaryColor !== undefined && { primaryColor: body.primaryColor }),
        ...(body.secondaryColor !== undefined && { secondaryColor: body.secondaryColor }),
        ...(body.backgroundColor !== undefined && { backgroundColor: body.backgroundColor }),
        ...(body.typographySettings !== undefined && { typographySettings: body.typographySettings }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update restaurant" },
      { status: 500 }
    );
  }
}

