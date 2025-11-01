import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MobileMenu } from "./mobile-menu";

export const revalidate = 0; // Always fetch fresh data
export const dynamic = 'force-dynamic'; // Force dynamic rendering

async function getRestaurantMenu(restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      heroImageUrl: true,
      primaryColor: true,
      secondaryColor: true,
      backgroundColor: true,
      darkTheme: true,
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

  return restaurant;
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

