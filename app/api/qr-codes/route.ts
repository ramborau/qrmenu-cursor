import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { generateQRCodeWithBranding } from "@/lib/qr-code-with-branding";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Get user's restaurants
    const restaurants = await prisma.restaurant.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    const restaurantIds = restaurants.map((r) => r.id);

    const tables = await prisma.table.findMany({
      where: {
        restaurantId: { in: restaurantIds },
      },
      include: {
        restaurant: true,
      },
      orderBy: {
        tableNumber: "asc",
      },
    });

    return NextResponse.json(tables);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch QR codes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { restaurantId, tableNumber, count = 1, brandingSettings } = body;

    if (!restaurantId) {
      return NextResponse.json(
        { message: "Restaurant ID is required" },
        { status: 400 }
      );
    }

    // Verify restaurant belongs to user
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        ownerId: session.user.id,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { message: "Restaurant not found or unauthorized" },
        { status: 404 }
      );
    }

    const tables = [];
    const baseUrl = process.env.APP_URL || "http://localhost:3000";

    for (let i = 0; i < count; i++) {
      const tableNum = tableNumber || `T-${String(i + 1).padStart(2, "0")}`;
      const qrUrl = `${baseUrl}/menu/${restaurantId}/table/${tableNum}`;
      
      // Generate QR code with branding
      const { svg: qrCodeSvg, png: qrCodePng } = await generateQRCodeWithBranding(qrUrl, {
        foregroundColor: brandingSettings?.foregroundColor || restaurant.primaryColor || "#075e54",
        backgroundColor: brandingSettings?.backgroundColor || restaurant.backgroundColor || "#ffffff",
        logoUrl: brandingSettings?.logoUrl || restaurant.logoUrl || undefined,
        logoSize: brandingSettings?.logoSize || 60,
        errorCorrectionLevel: brandingSettings?.errorCorrectionLevel || "M",
        margin: brandingSettings?.margin || 1,
      });

      // Check if table already exists
      const existing = await prisma.table.findFirst({
        where: {
          restaurantId,
          tableNumber: tableNum,
        },
      });

      if (existing) {
        // Update existing table
        const updated = await prisma.table.update({
          where: { id: existing.id },
          data: {
            qrCodeData: qrUrl,
            qrCodeUrlSvg: qrCodeSvg,
            qrCodeUrlPng: qrCodePng,
            brandingSettings: brandingSettings || null,
          },
        });
        tables.push(updated);
      } else {
        // Create new table
        const table = await prisma.table.create({
          data: {
            restaurantId,
            tableNumber: tableNum,
            qrCodeData: qrUrl,
            qrCodeUrlSvg: qrCodeSvg,
            qrCodeUrlPng: qrCodePng,
            brandingSettings: brandingSettings || null,
          },
        });
        tables.push(table);
      }
    }

    return NextResponse.json(tables, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to generate QR codes" },
      { status: 500 }
    );
  }
}

