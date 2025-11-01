import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const dynamicPricing = await prisma.dynamicPricing.findUnique({
      where: { id: params.id },
      include: {
        restaurant: true,
      },
    });

    if (!dynamicPricing) {
      return NextResponse.json(
        { message: "Dynamic pricing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(dynamicPricing);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch dynamic pricing" },
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

    // Verify dynamic pricing belongs to user's restaurant
    const dynamicPricing = await prisma.dynamicPricing.findUnique({
      where: { id: params.id },
      include: {
        restaurant: true,
      },
    });

    if (!dynamicPricing || dynamicPricing.restaurant.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Dynamic pricing not found or unauthorized" },
        { status: 404 }
      );
    }

    const updated = await prisma.dynamicPricing.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.daysOfWeek !== undefined && { daysOfWeek: body.daysOfWeek }),
        ...(body.startTime !== undefined && { startTime: body.startTime }),
        ...(body.endTime !== undefined && { endTime: body.endTime }),
        ...(body.adjustmentType !== undefined && { adjustmentType: body.adjustmentType }),
        ...(body.adjustmentValue !== undefined && { adjustmentValue: parseFloat(body.adjustmentValue) }),
        ...(body.targetType !== undefined && { targetType: body.targetType }),
        ...(body.targetIds !== undefined && { targetIds: body.targetIds }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update dynamic pricing" },
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

    // Verify dynamic pricing belongs to user's restaurant
    const dynamicPricing = await prisma.dynamicPricing.findUnique({
      where: { id: params.id },
      include: {
        restaurant: true,
      },
    });

    if (!dynamicPricing || dynamicPricing.restaurant.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Dynamic pricing not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.dynamicPricing.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Dynamic pricing deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to delete dynamic pricing" },
      { status: 500 }
    );
  }
}
