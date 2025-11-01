import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a sample user/owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      name: 'John Doe',
      role: 'OWNER',
    },
  });

  console.log('✅ Created owner:', owner.email);

  // Create a sample restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 'sample-restaurant-id' },
    update: {},
    create: {
      id: 'sample-restaurant-id',
      name: 'Sample Restaurant',
      ownerId: owner.id,
      primaryColor: '#075e54',
      secondaryColor: '#00c307',
      backgroundColor: '#ffffff',
    },
  });

  console.log('✅ Created restaurant:', restaurant.name);

  // Create sample categories
  const foodCategory = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Food',
      description: 'Delicious food items',
      icon: 'FaUtensils',
      sortOrder: 1,
      subCategories: {
        create: [
          {
            name: 'Starters',
            description: 'Appetizers and starters',
            sortOrder: 1,
            menuItems: {
              create: [
                {
                  name: 'Caesar Salad',
                  description: 'Fresh romaine lettuce with parmesan',
                  price: 12.99,
                  currency: 'USD',
                  tags: ['Vegetarian'],
                  allergens: ['Dairy', 'Gluten'],
                  availabilityStatus: 'AVAILABLE',
                  sortOrder: 1,
                },
                {
                  name: 'Spring Rolls',
                  description: 'Crispy vegetable rolls with sweet chili sauce',
                  price: 8.99,
                  currency: 'USD',
                  tags: ['Vegetarian', 'Vegan'],
                  allergens: [],
                  availabilityStatus: 'AVAILABLE',
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            name: 'Main Course',
            description: 'Main dishes',
            sortOrder: 2,
            menuItems: {
              create: [
                {
                  name: 'Grilled Salmon',
                  description: 'Fresh Atlantic salmon with herbs',
                  price: 24.99,
                  currency: 'USD',
                  tags: ['Gluten-Free'],
                  allergens: ['Fish'],
                  availabilityStatus: 'AVAILABLE',
                  sortOrder: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Created category:', foodCategory.name);

  const beveragesCategory = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Beverages',
      description: 'Drinks and beverages',
      icon: 'FaGlassWater',
      sortOrder: 2,
      subCategories: {
        create: [
          {
            name: 'Hot Beverages',
            description: 'Coffee, tea, and hot drinks',
            sortOrder: 1,
            menuItems: {
              create: [
                {
                  name: 'Espresso',
                  description: 'Strong Italian coffee',
                  price: 3.50,
                  currency: 'USD',
                  tags: [],
                  allergens: [],
                  availabilityStatus: 'AVAILABLE',
                  sortOrder: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Created category:', beveragesCategory.name);

  // Create sample table with QR code
  const table = await prisma.table.create({
    data: {
      restaurantId: restaurant.id,
      tableNumber: 'T-01',
      qrCodeData: `https://menu.app/${restaurant.id}/table/T-01`,
      brandingSettings: {
        primaryColor: '#075e54',
        secondaryColor: '#00c307',
      },
    },
  });

  console.log('✅ Created table:', table.tableNumber);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
