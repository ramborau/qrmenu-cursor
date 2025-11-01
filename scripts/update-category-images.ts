import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { join } from 'path';
import { searchUnsplashImages } from '../lib/unsplash';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function getUnsplashImage(itemName: string, category?: string): Promise<string | null> {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";

  if (!UNSPLASH_ACCESS_KEY) {
    return null;
  }

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
  console.log('🚀 Updating category image settings and adding Unsplash images...');

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

  // Find Food category
  const foodCategory = await prisma.category.findFirst({
    where: {
      restaurantId: restaurant.id,
      name: 'Food',
    },
    include: {
      subCategories: {
        include: {
          menuItems: {
            where: {
              OR: [
                { imageUrl: null },
                { imageUrl: '' },
              ],
            },
          },
        },
      },
    },
  });

  // Find Drinks category
  const drinksCategory = await prisma.category.findFirst({
    where: {
      restaurantId: restaurant.id,
      name: 'Drinks',
    },
  });

  if (drinksCategory) {
    // Disable images for Drinks category
    await prisma.category.update({
      where: { id: drinksCategory.id },
      data: { showImages: false },
    });
    console.log('✅ Disabled images for Drinks category');
  }

  if (foodCategory && foodCategory.subCategories.length > 0) {
    console.log(`📋 Found Food category with ${foodCategory.subCategories.length} subcategories`);

    // Ensure Food category has showImages enabled
    await prisma.category.update({
      where: { id: foodCategory.id },
      data: { showImages: true },
    });
    console.log('✅ Enabled images for Food category');

    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";
    if (!UNSPLASH_ACCESS_KEY) {
      console.log('⚠️  UNSPLASH_ACCESS_KEY not found. Skipping image updates.');
      return;
    }

    let totalUpdated = 0;
    let totalItems = 0;

    // Add images from Unsplash for Food items
    for (const subCategory of foodCategory.subCategories) {
      for (const item of subCategory.menuItems) {
        totalItems++;
        console.log(`  📝 Processing: ${item.name} (${subCategory.name})`);

        try {
          const imageUrl = await getUnsplashImage(item.name, subCategory.name);

          if (imageUrl) {
            await prisma.menuItem.update({
              where: { id: item.id },
              data: { imageUrl },
            });
            totalUpdated++;
            console.log(`    ✅ Added image from Unsplash`);
          } else {
            console.log(`    ⚠️  No image found on Unsplash`);
          }

          // Delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`    ❌ Error:`, error);
        }
      }
    }

    console.log('\n🎉 Process completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Items processed: ${totalItems}`);
    console.log(`   - Images added: ${totalUpdated}`);
    console.log(`   - Items without images: ${totalItems - totalUpdated}`);
  } else {
    console.log('⚠️  Food category not found or has no items');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

