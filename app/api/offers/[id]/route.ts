import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: {
        restaurant: true,
      },
    });

    if (!offer) {
      return NextResponse.json(
        { message: "Offer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(offer);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch offer" },
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

    // Verify offer belongs to user's restaurant
    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: {
        restaurant: true,
      },
    });

    if (!offer || offer.restaurant.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Offer not found or unauthorized" },
        { status: 404 }
      );
    }

    const updated = await prisma.offer.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.offerType !== undefined && { offerType: body.offerType }),
        ...(body.discountValue !== undefined && { discountValue: body.discountValue ? parseFloat(body.discountValue) : null }),
        ...(body.targetType !== undefined && { targetType: body.targetType }),
        ...(body.targetIds !== undefined && { targetIds: body.targetIds }),
        ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.isForever !== undefined && { isForever: body.isForever }),
        ...(body.daysOfWeek !== undefined && { daysOfWeek: body.daysOfWeek }),
        ...(body.startTime !== undefined && { startTime: body.startTime }),
        ...(body.endTime !== undefined && { endTime: body.endTime }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update offer" },
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

    // Verify offer belongs to user's restaurant
    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: {
        restaurant: true,
      },
    });

    if (!offer || offer.restaurant.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "Offer not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.offer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Offer deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to delete offer" },
      { status: 500 }
    );
  }
}
