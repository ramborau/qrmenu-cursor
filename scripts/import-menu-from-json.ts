import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { searchUnsplashImages } from '../lib/unsplash';

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

interface MenuItem {
  category: string;
  name: string;
  description: string;
  price: number;
}

async function getUnsplashImage(itemName: string, category?: string): Promise<string | null> {
  try {
    // Try multiple search strategies
    const searchTerms = [
      itemName,
      `${itemName} food`,
      `${itemName} dish`,
      itemName.split(' ')[0], // First word
      category ? `${category} ${itemName.split(' ')[0]}` : null,
      category ? `${category} food` : null,
    ].filter(Boolean) as string[];

    for (const term of searchTerms) {
      try {
        const images = await searchUnsplashImages(term, 1, 1);
        if (images.length > 0) {
          return images[0].urls.regular;
        }
        // Small delay between searches
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        // Continue to next search term
        continue;
      }
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch Unsplash image for ${itemName}:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting menu import from menu.json...');

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: 'rahul@botpe.com' },
  });

  if (!user) {
    console.error('❌ User rahul@botpe.com not found. Please create the user first.');
    process.exit(1);
  }

  console.log('✅ Found user:', user.email);

  // Get or create restaurant
  let restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: user.id },
  });

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: 'My Restaurant',
        ownerId: user.id,
        primaryColor: '#075e54',
        secondaryColor: '#00c307',
        backgroundColor: '#ffffff',
      },
    });
    console.log('✅ Created restaurant:', restaurant.name);
  } else {
    console.log('✅ Found restaurant:', restaurant.name);
  }

  // Read menu.json file
  const menuFilePath = join(process.cwd(), 'menu.json');
  const menuContent = readFileSync(menuFilePath, 'utf-8');
  const menuItems: MenuItem[] = JSON.parse(menuContent);

  console.log(`📋 Found ${menuItems.length} menu items to import`);

  // Group items by category
  const categoriesMap = new Map<string, MenuItem[]>();
  menuItems.forEach((item) => {
    const categoryName = item.category.trim();
    if (!categoriesMap.has(categoryName)) {
      categoriesMap.set(categoryName, []);
    }
    categoriesMap.get(categoryName)!.push(item);
  });

  console.log(`📂 Found ${categoriesMap.size} categories`);

  let totalImported = 0;
  let totalWithImages = 0;

  // Process each category
  for (const [categoryName, items] of categoriesMap.entries()) {
    console.log(`\n📁 Processing category: ${categoryName} (${items.length} items)`);

    // Find or create category
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
          sortOrder: categoriesMap.size,
        },
      });
      console.log(`  ✅ Created category: ${categoryName}`);
    } else {
      console.log(`  ✅ Found existing category: ${categoryName}`);
    }

    // Find or create "Default" subcategory
    let subCategory = await prisma.subCategory.findFirst({
      where: {
        categoryId: category.id,
        name: 'Default',
      },
    });

    if (!subCategory) {
      subCategory = await prisma.subCategory.create({
        data: {
          categoryId: category.id,
          name: 'Default',
          description: `Default subcategory for ${categoryName}`,
          sortOrder: 0,
        },
      });
      console.log(`  ✅ Created subcategory: Default`);
    }

    // Import items in this category
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`  📝 Processing item ${i + 1}/${items.length}: ${item.name}`);

      // Check if item already exists
      const existingItem = await prisma.menuItem.findFirst({
        where: {
          subCategoryId: subCategory.id,
          name: item.name,
        },
      });

      if (existingItem) {
        console.log(`    ⏭️  Skipping (already exists): ${item.name}`);
        continue;
      }

      // Fetch image from Unsplash
      let imageUrl: string | null = null;
      try {
        console.log(`    🖼️  Fetching image from Unsplash for: ${item.name}`);
        imageUrl = await getUnsplashImage(item.name, categoryName);
        if (imageUrl) {
          totalWithImages++;
          console.log(`    ✅ Got image from Unsplash`);
        } else {
          console.log(`    ⚠️  No image found on Unsplash`);
        }
        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`    ❌ Error fetching image:`, error);
      }

      // Create menu item
      try {
        await prisma.menuItem.create({
          data: {
            subCategoryId: subCategory.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            currency: 'BHD', // Using BHD as requested
            imageUrl: imageUrl,
            tags: [],
            allergens: [],
            availabilityStatus: 'AVAILABLE',
            sortOrder: i,
          },
        });
        totalImported++;
        console.log(`    ✅ Created: ${item.name} (${item.price} BHD)`);
      } catch (error) {
        console.error(`    ❌ Failed to create item ${item.name}:`, error);
      }
    }
  }

  console.log('\n🎉 Import completed!');
  console.log(`📊 Summary:`);
  console.log(`   - Categories: ${categoriesMap.size}`);
  console.log(`   - Items imported: ${totalImported}`);
  console.log(`   - Items with images: ${totalWithImages}`);
  console.log(`   - Items without images: ${totalImported - totalWithImages}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

