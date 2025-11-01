import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidate } from "@/lib/performance";
import { ClientMenu } from "./client-menu";

export const revalidate = 3600; // Revalidate every hour

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

  return <ClientMenu restaurant={restaurant} tableNumber={params.tableNumber} />;
}

