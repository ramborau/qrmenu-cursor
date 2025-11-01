import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();

    // Verify table belongs to user's restaurant
    const table = await prisma.table.findUnique({
      where: { id: params.id },
      include: {
        restaurant: true,
      },
    });

    if (!table || table.restaurant.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: "QR code not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.table.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "QR code deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to delete QR code" },
      { status: 500 }
    );
  }
}

