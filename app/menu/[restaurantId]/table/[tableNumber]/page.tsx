import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MobileMenu } from "./mobile-menu";

export const revalidate = 0; // Always fetch fresh data
export const dynamic = 'force-dynamic'; // Force dynamic rendering

async function getRestaurantMenu(restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      categories: {
        include: {
          subCategories: {
            include: {
              menuItems: {
                where: {
                  availabilityStatus: "AVAILABLE",
                },
                orderBy: {
                  sortOrder: "asc",
                },
              },
            },
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  // Return only the fields we need (filter out sensitive data)
  if (!restaurant) return null;
  
  return {
    id: restaurant.id,
    name: restaurant.name,
    logoUrl: restaurant.logoUrl,
    heroImageUrl: restaurant.heroImageUrl,
    primaryColor: restaurant.primaryColor,
    secondaryColor: restaurant.secondaryColor,
    backgroundColor: restaurant.backgroundColor,
    darkTheme: restaurant.darkTheme ?? false,
    categories: restaurant.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      showImages: cat.showImages ?? true,
      subCategories: cat.subCategories.map(subCat => ({
        id: subCat.id,
        name: subCat.name,
        description: subCat.description,
        icon: subCat.icon,
        menuItems: subCat.menuItems,
      })),
    })),
  };
}

export default async function MenuPage({
  params,
}: {
  params: { restaurantId: string; tableNumber: string };
}) {
  const restaurant = await getRestaurantMenu(params.restaurantId);

  if (!restaurant) {
    notFound();
  }

  return <MobileMenu restaurant={restaurant} tableNumber={params.tableNumber} />;
}

