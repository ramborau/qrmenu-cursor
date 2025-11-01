"use client";

import { useState, useMemo } from "react";
import { MenuSearch } from "@/components/menu/menu-search";
import { CategoryIcon } from "@/components/menu/category-icon";

interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  imageUrl?: string | null;
  tags: string[];
  allergens: string[];
  availabilityStatus: string;
}

interface SubCategory {
  id: string;
  name: string;
  description?: string | null;
  menuItems: MenuItem[];
}

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  subCategories: SubCategory[];
}

interface ClientMenuProps {
  restaurant: {
    id: string;
    name: string;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    backgroundColor?: string | null;
    categories: Category[];
  };
  tableNumber: string;
}

export function ClientMenu({ restaurant, tableNumber }: ClientMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    tags?: string[];
    allergens?: string[];
    priceRange?: { min?: number; max?: number };
  }>({});

  const filteredCategories = useMemo(() => {
    let filtered = [...restaurant.categories];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered
        .map((category) => ({
          ...category,
          subCategories: category.subCategories
            .map((subCat) => ({
              ...subCat,
              menuItems: subCat.menuItems.filter(
                (item) =>
                  item.name.toLowerCase().includes(query) ||
                  item.description?.toLowerCase().includes(query)
              ),
            }))
            .filter((subCat) => subCat.menuItems.length > 0),
        }))
        .filter((category) => category.subCategories.length > 0);
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered
        .map((category) => ({
          ...category,
          subCategories: category.subCategories
            .map((subCat) => ({
              ...subCat,
              menuItems: subCat.menuItems.filter((item) =>
                filters.tags!.some((tag) => item.tags.includes(tag))
              ),
            }))
            .filter((subCat) => subCat.menuItems.length > 0),
        }))
        .filter((category) => category.subCategories.length > 0);
    }

    // Filter by allergens (exclude items with selected allergens)
    if (filters.allergens && filters.allergens.length > 0) {
      filtered = filtered
        .map((category) => ({
          ...category,
          subCategories: category.subCategories
            .map((subCat) => ({
              ...subCat,
              menuItems: subCat.menuItems.filter(
                (item) =>
                  !filters.allergens!.some((allergen) =>
                    item.allergens.includes(allergen)
                  )
              ),
            }))
            .filter((subCat) => subCat.menuItems.length > 0),
        }))
        .filter((category) => category.subCategories.length > 0);
    }

    // Filter by price range
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      filtered = filtered
        .map((category) => ({
          ...category,
          subCategories: category.subCategories
            .map((subCat) => ({
              ...subCat,
              menuItems: subCat.menuItems.filter((item) => {
                const price = item.price;
                return (!min || price >= min) && (!max || price <= max);
              }),
            }))
            .filter((subCat) => subCat.menuItems.length > 0),
        }))
        .filter((category) => category.subCategories.length > 0);
    }

    return filtered;
  }, [searchQuery, filters, restaurant.categories]);

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
          <p className="text-sm opacity-90">Table {tableNumber}</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <MenuSearch
            onSearch={setSearchQuery}
            onFilter={setFilters}
          />
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchQuery || Object.keys(filters).length > 0
                ? "No items match your search/filters"
                : "Menu is being prepared. Please check back soon."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <section
                key={category.id}
                id={category.id}
                className="scroll-mt-20"
              >
                <div className="sticky top-16 z-10 mb-4 bg-white pb-2 pt-2">
                  <h2
                    className="text-2xl font-bold text-gray-900"
                    style={{
                      color: restaurant.primaryColor || "#075e54",
                    }}
                  >
                    {category.icon && (
                      <CategoryIcon iconPath={category.icon} className="inline h-6 w-6 mr-2" />
                    )}
                    {category.name}
                  </h2>
                </div>

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

      <nav className="sticky bottom-0 left-0 right-0 z-10 border-t bg-white px-4 py-2 shadow-lg">
        <div className="mx-auto max-w-4xl">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {restaurant.categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: restaurant.primaryColor
                    ? `${restaurant.primaryColor}20`
                    : "#075e5420",
                  color: restaurant.primaryColor || "#075e54",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(category.id);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              >
                {category.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

