"use client";
import { toast } from "sonner";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewSubCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/sub-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          categoryId,
        }),
      });

      if (res.ok) {
        router.push(`/dashboard/menu/categories/${categoryId}`);
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to create sub-category");
      }
    } catch (error) {
      console.error("Failed to create sub-category:", error);
      toast.error("Failed to create sub-category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">New Sub-Category</h1>
            <p className="mt-2 text-gray-600">Create a new sub-category</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sub-Category Details</CardTitle>
              <CardDescription>Enter the information for your new sub-category</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Sub-Category Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Starters, Main Course, Desserts"
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

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Sub-Category"}
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

