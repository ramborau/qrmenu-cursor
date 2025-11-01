"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";
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
  icon?: string | null;
  menuItems: MenuItem[];
}

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  subCategories: SubCategory[];
}

interface MobileMenuProps {
  restaurant: {
    id: string;
    name: string;
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    backgroundColor?: string | null;
    categories: Category[];
  };
  tableNumber: string;
}

export function MobileMenu({ restaurant, tableNumber }: MobileMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // Group categories into Food, Drinks, Shisha
  const highLevelCategories = useMemo(() => {
    const food = restaurant.categories.find((c) => c.name === "Food");
    const drinks = restaurant.categories.find((c) => c.name === "Drinks");
    const shisha = restaurant.categories.find((c) => c.name === "Shisha");

    // If high-level categories don't exist, use existing structure
    if (!food && !drinks && !shisha) {
      return restaurant.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        subCategories: cat.subCategories,
      }));
    }

    return [
      food && { id: food.id, name: "Food", icon: food.icon, subCategories: food.subCategories },
      drinks && { id: drinks.id, name: "Drinks", icon: drinks.icon, subCategories: drinks.subCategories },
      shisha && { id: shisha.id, name: "Shisha", icon: shisha.icon, subCategories: shisha.subCategories },
    ].filter(Boolean) as Category[];
  }, [restaurant.categories]);

  // Set default selected category
  useEffect(() => {
    if (!selectedCategory && highLevelCategories.length > 0) {
      setSelectedCategory(highLevelCategories[0].id);
    }
  }, [selectedCategory, highLevelCategories]);

  const currentCategory = highLevelCategories.find((cat) => cat.id === selectedCategory);
  const subCategories = currentCategory?.subCategories || [];

  // Filter menu items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery) {
      return subCategories;
    }

    const query = searchQuery.toLowerCase();
    return subCategories.map((subCat) => ({
      ...subCat,
      menuItems: subCat.menuItems.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      ),
    })).filter((subCat) => subCat.menuItems.length > 0);
  }, [subCategories, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchInput(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchInput("");
    setShowSearch(false);
  };

  const primaryColor = restaurant.primaryColor || "#075e54";
  const secondaryColor = restaurant.secondaryColor || "#00c307";
  const bgColor = restaurant.backgroundColor || "#ffffff";

  return (
    <div className="min-h-screen bg-white" style={{ backgroundColor: bgColor }}>
      {/* Sticky Header */}
      <header
        className="sticky top-0 z-30 border-b shadow-sm"
        style={{ backgroundColor: primaryColor, color: "#ffffff" }}
      >
        {/* Restaurant Name & Table */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {restaurant.logoUrl && (
                <img
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-lg font-bold leading-tight">{restaurant.name}</h1>
                <p className="text-xs opacity-90">Table {tableNumber}</p>
              </div>
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="rounded-full p-2 hover:bg-white/20 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search Bar (when shown) */}
        {showSearch && (
          <div className="px-4 pb-3">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search menu items..."
                className="w-full rounded-full bg-white/20 px-4 py-2 pl-10 pr-10 text-white placeholder:text-white/70 focus:outline-none focus:bg-white/30"
                style={{ border: "1px solid rgba(255,255,255,0.3)" }}
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* High-Level Categories (Food, Drinks, Shisha) */}
        <div className="flex border-t border-white/20 overflow-x-auto scrollbar-hide">
          {highLevelCategories.map((category) => {
            const isActive = category.id === selectedCategory;
            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSearchQuery(""); // Clear search when switching categories
                  setSearchInput("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "border-b-2 border-white text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                style={{
                  borderBottomColor: isActive ? "white" : "transparent",
                }}
              >
                {category.icon && (
                  <CategoryIcon iconPath={category.icon} className="h-4 w-4" />
                )}
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <p className="text-gray-500 text-center">
              {searchQuery
                ? `No items found for "${searchQuery}"`
                : "No items available in this category"}
            </p>
          </div>
        ) : (
          <div className="space-y-6 px-4 py-6">
            {filteredItems.map((subCategory) => (
              <div key={subCategory.id} className="space-y-4">
                {/* Sub-Category Header */}
                <div id={`subcat-${subCategory.id}`} className="scroll-mt-4">
                  {subCategory.name && (
                    <div className="flex items-center gap-2 mb-3">
                      {subCategory.icon && (
                        <CategoryIcon
                          iconPath={subCategory.icon}
                          className="h-5 w-5 text-gray-600"
                        />
                      )}
                      <h2 className="text-xl font-bold text-gray-900">{subCategory.name}</h2>
                    </div>
                  )}

                  {/* Menu Items */}
                  <div className="grid gap-4">
                    {subCategory.menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-white p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100 active:scale-[0.98]"
                    >
                        <div className="flex gap-4">
                        {/* Item Image */}
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-24 w-24 rounded-xl object-cover flex-shrink-0 shadow-sm"
                          />
                        ) : (
                          <div 
                            className="h-24 w-24 rounded-xl flex-shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: `${primaryColor}10` }}
                          >
                            <CategoryIcon iconPath="FaUtensils" className="h-8 w-8" style={{ color: primaryColor }} />
                          </div>
                        )}

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-base leading-tight">
                                  {item.name}
                                </h3>
                                {item.description && (
                                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                <p
                                  className="text-lg font-bold whitespace-nowrap"
                                  style={{ color: primaryColor }}
                                >
                                  {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: item.currency || "BHD",
                                  }).format(item.price)}
                                </p>
                              </div>
                            </div>

                            {/* Tags */}
                            {item.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {item.tags.slice(0, 3).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Allergens */}
                            {item.allergens.length > 0 && (
                              <p className="mt-2 text-xs text-red-600">
                                ⚠️ Contains: {item.allergens.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Sticky Footer with Sub-Categories */}
      {!searchQuery && currentCategory && subCategories.length > 1 && (
        <footer className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white/95 backdrop-blur-sm shadow-2xl">
          <div className="overflow-x-auto scrollbar-hide pb-safe">
            <div className="flex gap-2 px-4 py-3">
              {subCategories.map((subCat) => (
                <button
                  key={subCat.id}
                  onClick={() => {
                    const element = document.getElementById(`subcat-${subCat.id}`);
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all active:scale-95"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                  }}
                >
                  {subCat.icon && (
                    <CategoryIcon
                      iconPath={subCat.icon}
                      className="inline h-4 w-4 mr-1"
                    />
                  )}
                  {subCat.name}
                </button>
              ))}
            </div>
          </div>
        </footer>
      )}

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .pb-safe {
            padding-bottom: calc(1rem + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </div>
  );
}

