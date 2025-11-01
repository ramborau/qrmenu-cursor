"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loading } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Upload, Search, ChevronRight, Settings, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/menu/category-icon";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PricingAdjustment } from "@/components/menu/pricing-adjustment";

interface Category {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  sortOrder: number;
  subCategories: any[];
}

export default function MenuManagementPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPricingDialog, setShowPricingDialog] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          router.push("/auth/login");
        }
      })
      .catch(() => {
        router.push("/auth/login");
      });
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchRestaurant();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.description?.toLowerCase().includes(query) ||
        cat.subCategories.some((sub) =>
          sub.name.toLowerCase().includes(query) ||
          sub.menuItems?.some((item: any) =>
            item.name.toLowerCase().includes(query)
          )
        )
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  const fetchRestaurant = async () => {
    try {
      const res = await fetch("/api/restaurants");
      const data = await res.json();
      if (data.length > 0) {
        setRestaurantId(data[0].id);
      } else {
        const createRes = await fetch("/api/restaurants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "My Restaurant" }),
        });
        const newRestaurant = await createRes.json();
        setRestaurantId(newRestaurant.id);
      }
    } catch (error) {
      console.error("Failed to fetch restaurant:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        toast.error("Failed to delete category");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete category");
    }
  };

  const getTotalItems = (category: Category) => {
    return category.subCategories.reduce(
      (total, sub) => total + (sub.menuItems?.length || 0),
      0
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your restaurant menu categories and items
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Pricing Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Bulk Price Adjustment</DialogTitle>
                    <DialogDescription>
                      Adjust prices for categories, subcategories, or specific menu items
                    </DialogDescription>
                  </DialogHeader>
                  <PricingAdjustment
                    categories={categories}
                    onComplete={() => {
                      setShowPricingDialog(false);
                      fetchCategories();
                    }}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="outline" asChild>
                <Link href="/dashboard/menu/import">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Menu
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/menu/categories/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Link>
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search categories, subcategories, or menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories Grid */}
          {filteredCategories.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Categories Found</CardTitle>
                <CardDescription>
                  {searchQuery
                    ? "Try a different search term"
                    : "Get started by creating your first menu category"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!searchQuery && (
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/menu/import">
                        <Upload className="mr-2 h-4 w-4" />
                        Import Menu
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/dashboard/menu/categories/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Category
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCategories.map((category) => (
                <Card
                  key={category.id}
                  className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                  onClick={() => router.push(`/dashboard/menu/categories/${category.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {category.icon && (
                          <CategoryIcon
                            iconPath={category.icon}
                            className="h-8 w-8 flex-shrink-0 text-primary-dark"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl truncate">{category.name}</CardTitle>
                          {category.description && (
                            <CardDescription className="mt-1 line-clamp-2">
                              {category.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/menu/categories/${category.id}/edit`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(category.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          {category.subCategories.length} Sub-categor
                          {category.subCategories.length !== 1 ? "ies" : "y"}
                        </span>
                        <span>{getTotalItems(category)} Menu Items</span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full group-hover:bg-primary-dark group-hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/menu/categories/${category.id}`);
                        }}
                      >
                        Manage Category
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
}