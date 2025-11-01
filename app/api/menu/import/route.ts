import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { parseMenuFile } from "@/lib/file-parsers";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Get user's restaurant
    const restaurants = await prisma.restaurant.findMany({
      where: { ownerId: session.user.id },
    });

    if (restaurants.length === 0) {
      return NextResponse.json(
        { message: "No restaurant found. Please create a restaurant first." },
        { status: 400 }
      );
    }

    const restaurant = restaurants[0];

    // Parse the file
    const importResult = await parseMenuFile(file);

    if (!importResult || importResult.categories.length === 0) {
      return NextResponse.json(
        { message: "No valid menu data found in file" },
        { status: 400 }
      );
    }

    // Import categories and items
    const importedData = {
      categories: 0,
      subCategories: 0,
      items: 0,
    };

    for (const categoryData of importResult.categories) {
      // Create or find category
      let category = await prisma.category.findFirst({
        where: {
          restaurantId: restaurant.id,
          name: categoryData.name,
        },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            restaurantId: restaurant.id,
            name: categoryData.name,
            icon: categoryData.icon,
            sortOrder: importedData.categories,
          },
        });
      }

      importedData.categories++;

      for (const subCategoryData of categoryData.subCategories) {
        // Create or find sub-category
        let subCategory = await prisma.subCategory.findFirst({
          where: {
            categoryId: category.id,
            name: subCategoryData.name,
          },
        });

        if (!subCategory) {
          subCategory = await prisma.subCategory.create({
            data: {
              categoryId: category.id,
              name: subCategoryData.name,
              description: subCategoryData.description,
              sortOrder: importedData.subCategories,
            },
          });
        }

        importedData.subCategories++;

        // Create menu items
        for (const itemData of subCategoryData.items) {
          await prisma.menuItem.create({
            data: {
              subCategoryId: subCategory.id,
              name: itemData.name,
              description: itemData.description || "",
              price: itemData.price,
              currency: itemData.currency || "USD",
              imageUrl: itemData.imageUrl || null,
              tags: itemData.tags || [],
              allergens: itemData.allergens || [],
              availabilityStatus: (itemData.availabilityStatus || "AVAILABLE") as any,
              preparationTime: itemData.preparationTime || null,
              sortOrder: importedData.items,
            },
          });

          importedData.items++;
        }
      }
    }

    return NextResponse.json({
      message: "Import successful",
      imported: importedData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to import menu" },
      { status: 500 }
    );
  }
}

