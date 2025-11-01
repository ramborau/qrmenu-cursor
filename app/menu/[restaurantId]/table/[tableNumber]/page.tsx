import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

  return (
    <div className="min-h-screen bg-white">
      <header
        className="sticky top-0 z-20 border-b bg-white px-4 py-4"
        style={{
          backgroundColor: restaurant.primaryColor || "#075e54",
          color: "#ffffff",
        }}
      >
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <p className="text-sm opacity-90">Table {params.tableNumber}</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {restaurant.categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Menu is being prepared. Please check back soon.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {restaurant.categories.map((category) => (
              <section key={category.id} id={category.id}>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  {category.name}
                </h2>

                {category.subCategories.length === 0 ? (
                  <p className="text-gray-500">No items in this category yet.</p>
                ) : (
                  category.subCategories.map((subCategory) => (
                    <div key={subCategory.id} className="mb-6">
                      <h3 className="mb-3 text-xl font-semibold text-gray-800">
                        {subCategory.name}
                      </h3>

                      {subCategory.menuItems.length === 0 ? (
                        <p className="text-sm text-gray-400">No items available.</p>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                          {subCategory.menuItems.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-lg border bg-white p-4 shadow-sm"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">
                                    {item.name}
                                  </h4>
                                  {item.description && (
                                    <p className="mt-1 text-sm text-gray-600">
                                      {item.description}
                                    </p>
                                  )}
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {item.tags.map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                  {item.allergens.length > 0 && (
                                    <p className="mt-2 text-xs text-red-600">
                                      Allergens: {item.allergens.join(", ")}
                                    </p>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <p className="text-lg font-bold text-gray-900">
                                    {new Intl.NumberFormat("en-US", {
                                      style: "currency",
                                      currency: item.currency || "USD",
                                    }).format(item.price)}
                                  </p>
                                </div>
                              </div>
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="mt-3 h-32 w-full rounded object-cover"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </section>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-white px-4 py-2">
        <div className="mx-auto max-w-4xl">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {restaurant.categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: restaurant.primaryColor
                    ? `${restaurant.primaryColor}20`
                    : "#075e5420",
                  color: restaurant.primaryColor || "#075e54",
                }}
              >
                {category.name}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

