import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { join } from 'path';
import { processMenuWithGemini } from '../lib/gemini';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

// Mapping of existing categories to high-level categories
const categoryMapping: Record<string, 'Food' | 'Drinks' | 'Shisha'> = {
  // Food categories
  'Starters': 'Food',
  'Cheese & Fruit': 'Food',
  'Cheese And Fruit': 'Food',
  'Salads': 'Food',
  'Pizza': 'Food',
  'Pasta': 'Food',
  'Main': 'Food',
  'Mains': 'Food',
  'Sides': 'Food',
  'Dessert': 'Food',
  'Desserts': 'Food',

  // Drinks categories
  'Vodka': 'Drinks',
  'Gin': 'Drinks',
  'Rum': 'Drinks',
  'Tequila': 'Drinks',
  'Scotch Whisky': 'Drinks',
  'Scotch Whiskey': 'Drinks',
  'American Whiskey': 'Drinks',
  'Irish Whiskey': 'Drinks',
  'Cognac And Brandy': 'Drinks',
  'Cognac': 'Drinks',
  'Brandy': 'Drinks',
  'Aperitifs': 'Drinks',
  'Liqueurs': 'Drinks',
  'Shots': 'Drinks',
  'Classic Cocktails': 'Drinks',
  'Signature Cocktails': 'Drinks',
  'Bottled Beer': 'Drinks',
  'White Wine': 'Drinks',
  'Red Wine': 'Drinks',
  'Rose Wine': 'Drinks',
  'Roses Wine': 'Drinks',
  'Champagne': 'Drinks',
  'Prosecco': 'Drinks',
  'Sparkling Wine': 'Drinks',
  'Mocktails': 'Drinks',
  'Soft Drinks': 'Drinks',

  // Shisha categories
  'Shisha Flavors': 'Shisha',
  'Shisha': 'Shisha',
  'Shisha Flavor': 'Shisha',
};

async function categorizeWithGemini(categoryName: string): Promise<'Food' | 'Drinks' | 'Shisha' | null> {
  try {
    const prompt = `Categorize the following restaurant menu category into one of these three high-level categories: Food, Drinks, or Shisha.

Category: "${categoryName}"

Respond with ONLY one word: "Food", "Drinks", or "Shisha".`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBZKaIkDD5E-2rxluU7xVUb3IQCalVz-Yw`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (text === 'Food' || text === 'Drinks' || text === 'Shisha') {
      return text as 'Food' | 'Drinks' | 'Shisha';
    }

    return null;
  } catch (error) {
    console.error('GEMINI categorization error:', error);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting menu reorganization...');

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: 'rahul@botpe.com' },
  });

  if (!user) {
    console.error('❌ User rahul@botpe.com not found.');
    process.exit(1);
  }

  // Get restaurant
  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: user.id },
  });

  if (!restaurant) {
    console.error('❌ Restaurant not found.');
    process.exit(1);
  }

  // Get all existing categories
  const existingCategories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id },
    include: {
      subCategories: {
        include: {
          menuItems: true,
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  console.log(`📋 Found ${existingCategories.length} existing categories`);

  // Create or get high-level categories
  const highLevelCategories = ['Food', 'Drinks', 'Shisha'];
  const highLevelCategoryMap = new Map<string, string>();

  for (let i = 0; i < highLevelCategories.length; i++) {
    const categoryName = highLevelCategories[i];
    let category = await prisma.category.findFirst({
      where: {
        restaurantId: restaurant.id,
        name: categoryName,
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          restaurantId: restaurant.id,
          name: categoryName,
          sortOrder: i,
          icon: categoryName === 'Food' ? 'FaUtensils' : categoryName === 'Drinks' ? 'FaGlassWater' : 'FaSmoking',
        },
      });
      console.log(`✅ Created high-level category: ${categoryName}`);
    } else {
      console.log(`✅ Found existing high-level category: ${categoryName}`);
      // Update sort order to ensure correct order
      await prisma.category.update({
        where: { id: category.id },
        data: { sortOrder: i },
      });
    }

    highLevelCategoryMap.set(categoryName, category.id);
  }

  // Process each existing category
  for (const existingCat of existingCategories) {
    // Skip if it's already a high-level category
    if (highLevelCategories.includes(existingCat.name)) {
      console.log(`⏭️  Skipping high-level category: ${existingCat.name}`);
      continue;
    }

    // Determine which high-level category it belongs to
    let targetCategory: 'Food' | 'Drinks' | 'Shisha' = categoryMapping[existingCat.name] ||
      categoryMapping[existingCat.name.replace(/&/g, 'And')] ||
      categoryMapping[existingCat.name.replace(/And/g, '&')];

    // If not in mapping, use GEMINI
    if (!targetCategory) {
      console.log(`🤖 Using GEMINI to categorize: ${existingCat.name}`);
      const geminiResult = await categorizeWithGemini(existingCat.name);
      if (geminiResult) {
        targetCategory = geminiResult;
        console.log(`✅ GEMINI categorized "${existingCat.name}" as "${targetCategory}"`);
      } else {
        // Default to Food if GEMINI fails
        targetCategory = 'Food';
        console.log(`⚠️  GEMINI failed, defaulting to Food for: ${existingCat.name}`);
      }
      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const targetCategoryId = highLevelCategoryMap.get(targetCategory);
    if (!targetCategoryId) {
      console.error(`❌ Target category not found: ${targetCategory}`);
      continue;
    }

    console.log(`📦 Moving "${existingCat.name}" → "${targetCategory}"`);

    // Check if subcategory already exists in target category
    let targetSubCategory = await prisma.subCategory.findFirst({
      where: {
        categoryId: targetCategoryId,
        name: existingCat.name,
      },
    });

    if (!targetSubCategory) {
      // Create subcategory with same name as the old category
      targetSubCategory = await prisma.subCategory.create({
        data: {
          categoryId: targetCategoryId,
          name: existingCat.name,
          description: existingCat.description,
          icon: existingCat.icon,
          sortOrder: 0,
        },
      });
      console.log(`  ✅ Created subcategory: ${existingCat.name}`);
    }

    // Move all subcategories from old category to new structure
    for (const oldSubCat of existingCat.subCategories) {
      // If subcategory is "Default", use the category name as subcategory name
      const subCategoryName = oldSubCat.name === 'Default' ? existingCat.name : oldSubCat.name;

      // Check if subcategory with same name exists in target category
      let targetSubCat = await prisma.subCategory.findFirst({
        where: {
          categoryId: targetCategoryId,
          name: subCategoryName,
        },
      });

      if (!targetSubCat) {
        // Create new subcategory in target category
        targetSubCat = await prisma.subCategory.create({
          data: {
            categoryId: targetCategoryId,
            name: subCategoryName,
            description: oldSubCat.description || existingCat.description,
            icon: oldSubCat.icon || existingCat.icon,
            sortOrder: oldSubCat.sortOrder,
          },
        });
        console.log(`  ✅ Created subcategory: ${subCategoryName}`);
      }

      // Move all menu items to the target subcategory
      await prisma.menuItem.updateMany({
        where: { subCategoryId: oldSubCat.id },
        data: { subCategoryId: targetSubCat.id },
      });
      console.log(`  📝 Moved ${oldSubCat.menuItems.length} items to subcategory: ${subCategoryName}`);
    }

    // Delete the old category (this will cascade delete empty subcategories)
    // But first, make sure all subcategories are moved
    const remainingSubCats = await prisma.subCategory.findMany({
      where: { categoryId: existingCat.id },
    });

    if (remainingSubCats.length === 0) {
      await prisma.category.delete({
        where: { id: existingCat.id },
      });
      console.log(`  🗑️  Deleted old category: ${existingCat.name}`);
    }
  }

  console.log('\n🎉 Reorganization completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during reorganization:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

