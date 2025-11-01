"use client";

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
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<any>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);

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

      // Fetch menu items for each sub-category
      const itemsPromises = data.map((sub: any) =>
        fetch(`/api/menu-items?subCategoryId=${sub.id}`).then((r) => r.json())
      );
      const allItems = await Promise.all(itemsPromises);
      setMenuItems(allItems.flat());
    } catch (error) {
      console.error("Failed to fetch sub-categories:", error);
    }
  };

  const handleDeleteSubCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sub-category?")) return;

    try {
      const res = await fetch(`/api/sub-categories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchSubCategories();
      } else {
        alert("Failed to delete sub-category");
      }
    } catch (error) {
      console.error("Failed to delete sub-category:", error);
      alert("Failed to delete sub-category");
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      const res = await fetch(`/api/menu-items/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchSubCategories();
      } else {
        alert("Failed to delete menu item");
      }
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      alert("Failed to delete menu item");
    }
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
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard/menu" className="text-sm text-gray-600 hover:underline mb-2 inline-block">
                <ArrowLeft className="inline h-4 w-4 mr-1" />
                Back to Menu
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{category?.name}</h1>
              {category?.description && (
                <p className="mt-2 text-gray-600">{category.description}</p>
              )}
            </div>
            <Button asChild>
              <Link href={`/dashboard/menu/categories/${categoryId}/sub-categories/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Sub-Category
              </Link>
            </Button>
          </div>

          {subCategories.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Sub-Categories Yet</CardTitle>
                <CardDescription>
                  Create your first sub-category to organize menu items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href={`/dashboard/menu/categories/${categoryId}/sub-categories/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Sub-Category
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {subCategories.map((subCategory) => (
                <Card key={subCategory.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{subCategory.name}</CardTitle>
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
                    {subCategory.description && (
                      <CardDescription>{subCategory.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-semibold">Menu Items ({menuItems.filter((item: any) => item.subCategoryId === subCategory.id).length})</h4>
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
                      {menuItems
                        .filter((item: any) => item.subCategoryId === subCategory.id)
                        .map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded border p-3"
                          >
                            <div className="flex-1">
                              <h5 className="font-semibold">{item.name}</h5>
                              {item.description && (
                                <p className="text-sm text-gray-600">{item.description}</p>
                              )}
                              <p className="text-sm font-semibold text-primary-dark">
                                ${item.price.toFixed(2)}
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
                        ))}
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

