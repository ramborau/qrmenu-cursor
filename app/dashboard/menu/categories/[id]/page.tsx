"use client";
import { toast } from "sonner";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ArrowLeft, Search, Settings } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/menu/category-icon";
import { PricingAdjustment } from "@/components/menu/pricing-adjustment";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<any>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
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
      });
  }, [router]);

  useEffect(() => {
    if (user && categoryId) {
      fetchCategory();
      fetchSubCategories();
    }
  }, [user, categoryId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSubCategories(subCategories);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = subCategories.map((sub) => {
        const filteredItems = sub.menuItems?.filter(
          (item: any) =>
            item.name.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
        ) || [];
        return {
          ...sub,
          menuItems: filteredItems,
        };
      }).filter((sub) => sub.menuItems.length > 0 || sub.name.toLowerCase().includes(query));
      setFilteredSubCategories(filtered);
    }
  }, [searchQuery, subCategories]);

  const fetchCategory = async () => {
    try {
      const res = await fetch(`/api/categories/${categoryId}`);
      const data = await res.json();
      setCategory(data);
    } catch (error) {
      console.error("Failed to fetch category:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await fetch(`/api/sub-categories?categoryId=${categoryId}`);
      const data = await res.json();
      setSubCategories(data);
      setFilteredSubCategories(data);

      // Fetch menu items for each sub-category
      const itemsPromises = data.map((sub: any) =>
        fetch(`/api/menu-items?subCategoryId=${sub.id}`).then((r) => r.json())
      );
      const allItems = await Promise.all(itemsPromises);

      // Attach menu items to subcategories
      const subCategoriesWithItems = data.map((sub: any, index: number) => ({
        ...sub,
        menuItems: allItems[index] || [],
      }));

      setSubCategories(subCategoriesWithItems);
      setMenuItems(allItems.flat());
    } catch (error) {
      console.error("Failed to fetch sub-categories:", error);
    }
  };

  const handleDeleteSubCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sub-category?")) return;

    try {
      const res = await fetch(`/api/sub-categories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Sub-category deleted successfully");
        fetchSubCategories();
      } else {
        toast.error("Failed to delete sub-category");
      }
    } catch (error) {
      console.error("Failed to delete sub-category:", error);
      toast.error("Failed to delete sub-category");
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;

    try {
      const res = await fetch(`/api/menu-items/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Menu item deleted successfully");
        fetchSubCategories();
      } else {
        toast.error("Failed to delete menu item");
      }
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      toast.error("Failed to delete menu item");
    }
  };

  const refreshData = () => {
    fetchSubCategories();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  const allCategories = category ? [category] : [];

  return (
    <ErrorBoundary>
      <DashboardLayout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link href="/dashboard/menu" className="text-sm text-gray-600 hover:underline mb-2 inline-block">
                <ArrowLeft className="inline h-4 w-4 mr-1" />
                Back to Menu
              </Link>
              <div className="flex items-center gap-3">
                {category?.icon && (
                  <CategoryIcon iconPath={category.icon} className="h-8 w-8 text-primary-dark" />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{category?.name}</h1>
                  {category?.description && (
                    <p className="mt-2 text-gray-600">{category.description}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Pricing
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Bulk Price Adjustment</DialogTitle>
                    <DialogDescription>
                      Adjust prices for subcategories or specific menu items
                    </DialogDescription>
                  </DialogHeader>
                  <PricingAdjustment
                    categories={allCategories}
                    onComplete={() => {
                      setShowPricingDialog(false);
                      refreshData();
                    }}
                  />
                </DialogContent>
              </Dialog>
              <Button asChild>
                <Link href={`/dashboard/menu/categories/${categoryId}/sub-categories/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Sub-Category
                </Link>
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search subcategories or menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sub-Categories */}
          {filteredSubCategories.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Sub-Categories Found</CardTitle>
                <CardDescription>
                  {searchQuery
                    ? "Try a different search term"
                    : "Create your first sub-category to organize menu items"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!searchQuery && (
                  <Button asChild>
                    <Link href={`/dashboard/menu/categories/${categoryId}/sub-categories/new`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Sub-Category
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredSubCategories.map((subCategory) => (
                <Card key={subCategory.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {subCategory.icon && (
                          <CategoryIcon
                            iconPath={subCategory.icon}
                            className="h-5 w-5 text-primary-dark"
                          />
                        )}
                        <div>
                          <CardTitle>{subCategory.name}</CardTitle>
                          {subCategory.description && (
                            <CardDescription className="mt-1">{subCategory.description}</CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/dashboard/menu/sub-categories/${subCategory.id}/edit`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSubCategory(subCategory.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-semibold">
                        Menu Items ({subCategory.menuItems?.length || 0})
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/menu/sub-categories/${subCategory.id}/items/new`)
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {subCategory.menuItems?.length > 0 ? (
                        subCategory.menuItems.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded border p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1">
                              <h5 className="font-semibold">{item.name}</h5>
                              {item.description && (
                                <p className="text-sm text-gray-600">{item.description}</p>
                              )}
                              <p className="text-sm font-semibold text-primary-dark mt-1">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: item.currency || "USD",
                                }).format(item.price)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  router.push(`/dashboard/menu/items/${item.id}/edit`)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteMenuItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No menu items in this sub-category
                        </p>
                      )}
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