"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPicker } from "@/components/icons/icon-picker";
import { toast } from "sonner";

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
  });
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setRestaurantId(data[0].id);
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) {
      toast.error("Please wait for restaurant to load");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          restaurantId,
        }),
      });

      if (res.ok) {
        toast.success("Category created successfully");
        router.push("/dashboard/menu");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to create category");
      }
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">New Category</h1>
            <p className="mt-2 text-gray-600">Create a new menu category</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>
                Enter the information for your new menu category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Food, Beverages, Desserts"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <IconPicker
                    value={formData.icon}
                    onChange={(iconName) =>
                      setFormData({ ...formData, icon: iconName })
                    }
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Category"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
}

