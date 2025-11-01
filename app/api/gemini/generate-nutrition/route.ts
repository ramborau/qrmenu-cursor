import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "AIzaSyBZKaIkDD5E-2rxluU7xVUb3IQCalVz-Yw"
);

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { categoryIds, subCategoryIds, menuItemIds } = body;

    // Get user's restaurants
    const restaurants = await prisma.restaurant.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    const restaurantIds = restaurants.map((r) => r.id);

    // Build where clause to get menu items
    const whereClause: any = {
      subCategory: {
        category: {
          restaurantId: { in: restaurantIds },
        },
      },
    };

    if (menuItemIds && Array.isArray(menuItemIds) && menuItemIds.length > 0) {
      whereClause.id = { in: menuItemIds };
    } else if (subCategoryIds && Array.isArray(subCategoryIds) && subCategoryIds.length > 0) {
      whereClause.subCategoryId = { in: subCategoryIds };
    } else if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
      whereClause.subCategory = {
        ...whereClause.subCategory,
        categoryId: { in: categoryIds },
      };
    }

    // Get all menu items
    const menuItems = await prisma.menuItem.findMany({
      where: whereClause,
      include: {
        subCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    if (menuItems.length === 0) {
      return NextResponse.json(
        { message: "No menu items found to generate nutrition facts for" },
        { status: 404 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const results: Array<{ itemId: string; nutritionalValues: any }> = [];

    // Process items in batches to avoid rate limits
    for (const item of menuItems) {
      try {
        const prompt = `Generate accurate nutritional information for this menu item. Return ONLY valid JSON in this exact format:
{
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams),
  "sugar": number (grams),
  "sodium": number (milligrams),
  "cholesterol": number (milligrams)
}

Menu Item:
- Name: ${item.name}
- Description: ${item.description || "No description"}
${item.tags.length > 0 ? `- Tags: ${item.tags.join(", ")}` : ""}

Provide realistic nutritional values based on the item name and description. Return ONLY the JSON, no other text.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text().trim();

        // Extract JSON
        if (text.startsWith("```json")) {
          text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (text.startsWith("```")) {
          text = text.replace(/```\n?/g, "");
        }

        const nutritionalValues = JSON.parse(text);

        results.push({
          itemId: item.id,
          nutritionalValues,
        });

        // Update menu item with nutrition facts
        await prisma.menuItem.update({
          where: { id: item.id },
          data: { nutritionalValues },
        });

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`Failed to generate nutrition for item ${item.id}:`, error);
        // Continue with next item
      }
    }

    return NextResponse.json({
      message: `Generated nutrition facts for ${results.length} menu items`,
      updatedCount: results.length,
      results,
    });
  } catch (error: any) {
    console.error("Nutrition generation error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to generate nutrition facts" },
      { status: 500 }
    );
  }
}
