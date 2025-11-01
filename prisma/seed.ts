import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Note: Better Auth handles user creation differently
  // We'll check if user exists, if not, provide instructions
  let owner = await prisma.user.findUnique({
    where: { email: 'rahul@botpe.com' },
  });

  if (!owner) {
    console.log('\n⚠️  Admin user not found.');
    console.log('📝 Please create the admin user using the signup page:');
    console.log('   1. Start the app: npm run dev');
    console.log('   2. Go to: http://localhost:3000/auth/signup');
    console.log('   3. Sign up with:');
    console.log('      Email: rahul@botpe.com');
    console.log('      Password: Ramborau46**');
    console.log('      Name: Rahul Admin');
    console.log('   4. After signup, run this seed again to create sample data.');
    console.log('   5. Or manually update the user role to OWNER in the database.');
    return;
  }

  // Update user role to OWNER if not already
  if (owner.role !== 'OWNER') {
    owner = await prisma.user.update({
      where: { id: owner.id },
      data: { role: 'OWNER' },
    });
    console.log('✅ Updated user role to OWNER');
  } else {
    console.log('✅ Admin user found:', owner.email);
  }

  // Create a sample restaurant for the admin
  const restaurant = await prisma.restaurant.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      name: 'My Restaurant',
      ownerId: owner.id,
      primaryColor: '#075e54',
      secondaryColor: '#00c307',
      backgroundColor: '#ffffff',
    },
  });

  console.log('✅ Created restaurant:', restaurant.name);

  // Create sample categories
  const foodCategory = await prisma.category.upsert({
    where: {
      restaurantId_name: {
        restaurantId: restaurant.id,
        name: 'Food',
      },
    },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: 'Food',
      description: 'Delicious food items',
      icon: 'fa:FaUtensils',
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

  const beveragesCategory = await prisma.category.upsert({
    where: {
      restaurantId_name: {
        restaurantId: restaurant.id,
        name: 'Beverages',
      },
    },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: 'Beverages',
      description: 'Drinks and beverages',
      icon: 'fa:FaGlassWater',
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
  const table = await prisma.table.upsert({
    where: {
      restaurantId_tableNumber: {
        restaurantId: restaurant.id,
        tableNumber: 'T-01',
      },
    },
    update: {},
    create: {
      restaurantId: restaurant.id,
      tableNumber: 'T-01',
      qrCodeData: `http://localhost:3000/menu/${restaurant.id}/table/T-01`,
      brandingSettings: {
        primaryColor: '#075e54',
        secondaryColor: '#00c307',
      },
    },
  });

  console.log('✅ Created table:', table.tableNumber);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Admin Credentials:');
  console.log('   Email: rahul@botpe.com');
  console.log('   Password: Ramborau46**');
  console.log('\n🚀 You can now start the app with: npm run dev');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
