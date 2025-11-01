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
  showImages?: boolean;
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
    darkTheme?: boolean;
    categories: Category[];
  };
  tableNumber: string;
}

export function MobileMenu({ restaurant, tableNumber }: MobileMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [activeSubCategory, setActiveSubCategory] = useState<string>("");

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
        showImages: cat.showImages,
        subCategories: cat.subCategories,
      }));
    }

    return [
      food && { id: food.id, name: "Food", icon: food.icon, showImages: food.showImages, subCategories: food.subCategories },
      drinks && { id: drinks.id, name: "Drinks", icon: drinks.icon, showImages: drinks.showImages, subCategories: drinks.subCategories },
      shisha && { id: shisha.id, name: "Shisha", icon: shisha.icon, showImages: shisha.showImages, subCategories: shisha.subCategories },
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
  const showImages = currentCategory?.showImages !== false; // Default to true

  // Scroll-based active subcategory detection
  useEffect(() => {
    if (!currentCategory || subCategories.length <= 1) return;

    const handleScroll = () => {
      const subCategoryElements = subCategories.map((subCat) => ({
        id: subCat.id,
        element: document.getElementById(`subcat-${subCat.id}`),
      })).filter((item) => item.element);

      const scrollPosition = window.scrollY + 160; // Account for header height

      for (let i = subCategoryElements.length - 1; i >= 0; i--) {
        const item = subCategoryElements[i];
        if (item.element) {
          const elementTop = item.element.offsetTop;
          if (scrollPosition >= elementTop) {
            setActiveSubCategory(item.id);
            break;
          }
        }
      }

      // If scrolled to top, set first subcategory as active
      if (scrollPosition < 200) {
        if (subCategoryElements[0]) {
          setActiveSubCategory(subCategoryElements[0].id);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentCategory, subCategories]);

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

  const isDarkTheme = restaurant.darkTheme || false;
  const primaryColor = restaurant.primaryColor || "#075e54";
  const secondaryColor = restaurant.secondaryColor || "#00c307";
  const bgColor = restaurant.backgroundColor || (isDarkTheme ? "#1a1a1a" : "#ffffff");
  const textColor = isDarkTheme ? "#ffffff" : "#111827";
  const textColorSecondary = isDarkTheme ? "#9ca3af" : "#6b7280";
  const cardBg = isDarkTheme ? "#2d2d2d" : "#ffffff";
  const borderColor = isDarkTheme ? "#3d3d3d" : "#e5e7eb";

  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: bgColor, color: textColor }}>
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
            <p className="text-center" style={{ color: textColorSecondary }}>
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
                          className="h-5 w-5"
                          style={{ color: isDarkTheme ? '#d1d5db' : '#4b5563' }}
                        />
                      )}
                      <h2 className="text-xl font-bold" style={{ color: textColor }}>{subCategory.name}</h2>
                    </div>
                  )}

                  {/* Menu Items */}
                  <div className="grid gap-4">
                    {subCategory.menuItems.map((item) => {
                      const hasImage = showImages && item.imageUrl;
                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl shadow-md hover:shadow-lg transition-shadow active:scale-[0.98] overflow-hidden ${
                            hasImage ? '' : 'p-4 border'
                          }`}
                          style={{
                            backgroundColor: cardBg,
                            borderColor: hasImage ? 'transparent' : borderColor,
                          }}
                        >
                          {hasImage ? (
                            // Layout with image touching edges
                            <div className="flex items-center">
                              {/* Image - touches top, left, bottom */}
                              <img
                                src={item.imageUrl!}
                                alt={item.name}
                                className="h-28 w-28 object-cover flex-shrink-0"
                                style={{ minHeight: '7rem' }}
                              />
                              {/* Content with padding */}
                              <div className="flex-1 min-w-0 p-4 flex items-center">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-base leading-tight" style={{ color: textColor }}>
                                        {item.name}
                                      </h3>
                                      {item.description && (
                                        <p className="mt-1 text-sm line-clamp-2" style={{ color: textColorSecondary }}>
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex-shrink-0 ml-2">
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
                                          className="rounded-full px-2 py-0.5 text-xs"
                                          style={{
                                            backgroundColor: isDarkTheme ? '#3d3d3d' : '#f3f4f6',
                                            color: isDarkTheme ? '#d1d5db' : '#374151',
                                          }}
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {/* Allergens */}
                                  {item.allergens.length > 0 && (
                                    <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                                      ⚠️ Contains: {item.allergens.join(", ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Layout without image - vertically centered
                            <div className="flex items-center gap-4">
                              {/* Item Details - centered vertically */}
                              <div className="flex-1 min-w-0 flex items-center">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-base leading-tight" style={{ color: textColor }}>
                                        {item.name}
                                      </h3>
                                      {item.description && (
                                        <p className="mt-1 text-sm line-clamp-2" style={{ color: textColorSecondary }}>
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex-shrink-0 ml-2">
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
                                          className="rounded-full px-2 py-0.5 text-xs"
                                          style={{
                                            backgroundColor: isDarkTheme ? '#3d3d3d' : '#f3f4f6',
                                            color: isDarkTheme ? '#d1d5db' : '#374151',
                                          }}
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {/* Allergens */}
                                  {item.allergens.length > 0 && (
                                    <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                                      ⚠️ Contains: {item.allergens.join(", ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Sticky Footer with Sub-Categories */}
      {!searchQuery && currentCategory && subCategories.length > 1 && (
        <footer
          className="fixed bottom-0 left-0 right-0 z-20 border-t backdrop-blur-sm shadow-2xl"
          style={{
            backgroundColor: isDarkTheme ? 'rgba(29, 29, 29, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderTopColor: borderColor,
          }}
        >
          <div className="overflow-x-auto scrollbar-hide pb-safe">
            <div className="flex gap-2 px-4 py-3">
              {subCategories.map((subCat) => (
                <button
                  key={subCat.id}
                  onClick={() => {
                    const element = document.getElementById(`subcat-${subCat.id}`);
                    if (element) {
                      // Add offset for sticky header
                      const headerHeight = 140; // Approximate header height
                      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                      const offsetPosition = elementPosition - headerHeight;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                      });
                      setActiveSubCategory(subCat.id);
                    }
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all active:scale-95 hover:scale-105 ${
                    activeSubCategory === subCat.id ? 'ring-2 ring-offset-2' : ''
                  }`}
                  style={{
                    backgroundColor: activeSubCategory === subCat.id ? primaryColor : `${primaryColor}20`,
                    color: activeSubCategory === subCat.id ? '#ffffff' : primaryColor,
                    border: `1px solid ${primaryColor}40`,
                    ringColor: primaryColor,
                  }}
                >
                  {subCat.icon && (
                    <CategoryIcon
                      iconPath={subCat.icon}
                      className="inline h-3.5 w-3.5 mr-1.5"
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

