"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { IconPicker } from "@/components/icons/icon-picker";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    showImages: true,
  });

  useEffect(() => {
    fetch(`/api/categories/${categoryId}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          name: data.name || "",
          description: data.description || "",
          icon: data.icon || "",
          showImages: data.showImages !== false,
        });
      })
      .catch((error) => {
        console.error("Failed to fetch category:", error);
        toast.error("Failed to load category");
      })
      .finally(() => setLoading(false));
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/dashboard/menu");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update category");
      }
    } catch (error) {
      console.error("Failed to update category:", error);
      toast.error("Failed to update category");
    } finally {
      setSaving(false);
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
      <DashboardLayout>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
            <p className="mt-2 text-gray-600">Update category information</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>Update the information for this category</CardDescription>
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
                  <Label>Icon (Optional)</Label>
                  <div className="mt-2">
                    <IconPicker
                      value={formData.icon}
                      onChange={(iconName) =>
                        setFormData({ ...formData, icon: iconName })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex-1">
                    <Label htmlFor="showImages">Show Images</Label>
                    <p className="text-sm text-gray-500">Display images for menu items in this category</p>
                  </div>
                  <Switch
                    id="showImages"
                    checked={formData.showImages}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, showImages: checked })
                    }
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
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

