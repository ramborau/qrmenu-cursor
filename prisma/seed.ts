import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a sample user/owner
  const owner = await prisma.user.upsert({
    where: { email: "owner@restaurant.com" },
    update: {},
    create: {
      email: "owner@restaurant.com",
      password: "$2b$10$example", // In production, use proper hashing
      name: "Restaurant Owner",
      role: "OWNER",
    },
  });

  console.log("✅ Created owner:", owner.email);

  // Create a sample restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: "sample-restaurant-id" },
    update: {},
    create: {
      id: "sample-restaurant-id",
      name: "Sample Restaurant",
      ownerId: owner.id,
      primaryColor: "#075e54",
      secondaryColor: "#00c307",
      backgroundColor: "#ffffff",
    },
  });

  console.log("✅ Created restaurant:", restaurant.name);

  // Create sample categories
  const foodCategory = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Food",
      description: "Delicious food items",
      icon: "FaUtensils",
      sortOrder: 0,
    },
  });

  const beveragesCategory = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Beverages",
      description: "Refreshing drinks",
      icon: "FaGlassMartini",
      sortOrder: 1,
    },
  });

  console.log("✅ Created categories");

  // Create sample sub-categories
  const startersSubCategory = await prisma.subCategory.create({
    data: {
      categoryId: foodCategory.id,
      name: "Starters",
      description: "Appetizers and starters",
      sortOrder: 0,
    },
  });

  const mainCourseSubCategory = await prisma.subCategory.create({
    data: {
      categoryId: foodCategory.id,
      name: "Main Course",
      description: "Main dishes",
      sortOrder: 1,
    },
  });

  console.log("✅ Created sub-categories");

  // Create sample menu items
  await prisma.menuItem.create({
    data: {
      subCategoryId: startersSubCategory.id,
      name: "Caesar Salad",
      description: "Fresh romaine lettuce with parmesan and croutons",
      price: 12.99,
      currency: "USD",
      tags: ["Vegetarian"],
      allergens: ["Dairy", "Gluten"],
      availabilityStatus: "AVAILABLE",
      sortOrder: 0,
    },
  });

  await prisma.menuItem.create({
    data: {
      subCategoryId: mainCourseSubCategory.id,
      name: "Grilled Salmon",
      description: "Fresh salmon with seasonal vegetables",
      price: 24.99,
      currency: "USD",
      tags: ["Gluten-Free"],
      allergens: [],
      availabilityStatus: "AVAILABLE",
      preparationTime: 20,
      sortOrder: 0,
    },
  });

  console.log("✅ Created menu items");

  // Create sample table
  await prisma.table.create({
    data: {
      restaurantId: restaurant.id,
      tableNumber: "T1",
      qrCodeData: `${process.env.APP_URL || "http://localhost:3000"}/menu/${restaurant.id}/table/T1`,
    },
  });

  console.log("✅ Created sample table");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

