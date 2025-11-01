"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loading } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Utensils, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/menu/category-icon";
import { DraggableCategoryList } from "@/components/menu/draggable-category-list";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

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

  const fetchRestaurant = async () => {
    try {
      const res = await fetch("/api/restaurants");
      const data = await res.json();
      if (data.length > 0) {
        setRestaurantId(data[0].id);
      } else {
        // Create default restaurant if none exists
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
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.window.confirm("Are you sure you want to delete this category?")) return;

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

  const handleReorder = async (newOrder: Category[]) => {
    try {
      const categoryOrders = newOrder.map((cat, index) => ({
        id: cat.id,
        sortOrder: index,
      }));

      const res = await fetch("/api/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryOrders }),
      });

      if (res.ok) {
        toast.success("Categories reordered successfully");
        setCategories(newOrder);
      } else {
        toast.error("Failed to reorder categories");
        fetchCategories(); // Revert on error
      }
    } catch (error) {
      console.error("Failed to reorder categories:", error);
      toast.error("Failed to reorder categories");
      fetchCategories(); // Revert on error
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
              <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your restaurant menu categories and items
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/menu/categories/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Link>
            </Button>
          </div>

          {categories.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Categories Yet</CardTitle>
                <CardDescription>
                  Get started by creating your first menu category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/dashboard/menu/categories/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Category
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DraggableCategoryList
              categories={categories}
              onReorder={handleReorder}
              onEdit={(id) => router.push(`/dashboard/menu/categories/${id}/edit`)}
              onDelete={handleDelete}
              onManage={(id) => router.push(`/dashboard/menu/categories/${id}`)}
            />
          )}
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
}

