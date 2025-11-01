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
    console.warn('⚠️  UNSPLASH_ACCESS_KEY not set. Skipping image fetch.');
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
  console.log('🚀 Starting to add Unsplash images to menu items...');

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

  // Get all menu items without images
  const menuItems = await prisma.menuItem.findMany({
    where: {
      subCategory: {
        category: {
          restaurantId: restaurant.id,
        },
      },
      OR: [
        { imageUrl: null },
        { imageUrl: '' },
      ],
    },
    include: {
      subCategory: {
        include: {
          category: true,
        },
      },
    },
  });

  console.log(`📋 Found ${menuItems.length} menu items without images`);

  if (menuItems.length === 0) {
    console.log('✅ All items already have images!');
    return;
  }

  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";
  if (!UNSPLASH_ACCESS_KEY) {
    console.log('⚠️  UNSPLASH_ACCESS_KEY not found in environment variables.');
    console.log('   Please add UNSPLASH_ACCESS_KEY to .env.local');
    console.log('   You can get a free API key from: https://unsplash.com/developers');
    return;
  }

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];
    const categoryName = item.subCategory.category.name;
    
    console.log(`\n📝 Processing ${i + 1}/${menuItems.length}: ${item.name} (${categoryName})`);

    try {
      const imageUrl = await getUnsplashImage(item.name, categoryName);
      
      if (imageUrl) {
        await prisma.menuItem.update({
          where: { id: item.id },
          data: { imageUrl },
        });
        updated++;
        console.log(`  ✅ Added image: ${imageUrl.substring(0, 50)}...`);
      } else {
        failed++;
        console.log(`  ⚠️  No image found`);
      }

      // Delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      failed++;
      console.error(`  ❌ Error:`, error);
    }
  }

  console.log('\n🎉 Process completed!');
  console.log(`📊 Summary:`);
  console.log(`   - Items updated with images: ${updated}`);
  console.log(`   - Items without images: ${failed}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

