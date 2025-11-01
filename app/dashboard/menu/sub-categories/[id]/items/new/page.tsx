"use client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePicker } from "@/components/menu/image-picker";
import { Sparkles } from "lucide-react";

export default function NewMenuItemPage() {
  const params = useParams();
  const router = useRouter();
  const subCategoryId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [calculatingNutrition, setCalculatingNutrition] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "USD",
    imageUrl: "",
    tags: [] as string[],
    allergens: [] as string[],
    availabilityStatus: "AVAILABLE",
    preparationTime: "",
    nutritionalValues: null as any,
  });
  const [tagInput, setTagInput] = useState("");
  const [allergenInput, setAllergenInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleAddAllergen = () => {
    if (allergenInput.trim() && !formData.allergens.includes(allergenInput.trim())) {
      setFormData({
        ...formData,
        allergens: [...formData.allergens, allergenInput.trim()],
      });
      setAllergenInput("");
    }
  };

  const handleRemoveAllergen = (allergen: string) => {
    setFormData({
      ...formData,
      allergens: formData.allergens.filter((a) => a !== allergen),
    });
  };

  const handleCalculateNutrition = async () => {
    if (!formData.name) {
      toast.error("Please enter item name first");
      return;
    }

    setCalculatingNutrition(true);
    try {
      const res = await fetch("/api/nutritional-values", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFormData({
          ...formData,
          nutritionalValues: data,
        });
        toast.success("Nutritional values calculated successfully");
      } else {
        toast.error(data.message || "Failed to calculate nutritional values");
      }
    } catch (error) {
      console.error("Failed to calculate nutritional values:", error);
      toast.error("Failed to calculate nutritional values");
    } finally {
      setCalculatingNutrition(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          subCategoryId,
          preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : null,
          nutritionalValues: formData.nutritionalValues,
        }),
      });

      if (res.ok) {
        router.back();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to create menu item");
      }
    } catch (error) {
      console.error("Failed to create menu item:", error);
      toast.error("Failed to create menu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">New Menu Item</h1>
            <p className="mt-2 text-gray-600">Create a new menu item</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Menu Item Details</CardTitle>
              <CardDescription>Enter the information for your new menu item</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Caesar Salad"
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="12.99"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) =>
                        setFormData({ ...formData, currency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="BHD">BHD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Image</Label>
                  <ImagePicker
                    value={formData.imageUrl}
                    onChange={(url) =>
                      setFormData({ ...formData, imageUrl: url })
                    }
                    menuItemName={formData.name}
                  />
                </div>

                <div>
                  <Label htmlFor="availabilityStatus">Availability Status</Label>
                  <Select
                    value={formData.availabilityStatus}
                    onValueChange={(value) =>
                      setFormData({ ...formData, availabilityStatus: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                      <SelectItem value="SEASONAL">Seasonal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Dietary Tags</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="e.g., Vegetarian, Vegan, Gluten-Free"
                    />
                    <Button type="button" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 rounded-full bg-primary-dark px-3 py-1 text-xs text-white"
                        >
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveTag(tag)}
                            className="h-4 w-4 p-0 hover:opacity-70"
                          >
                            ×
                          </Button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Allergens</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={allergenInput}
                      onChange={(e) => setAllergenInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddAllergen();
                        }
                      }}
                      placeholder="e.g., Dairy, Nuts, Gluten"
                    />
                    <Button type="button" onClick={handleAddAllergen}>
                      Add
                    </Button>
                  </div>
                  {formData.allergens.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.allergens.map((allergen) => (
                        <span
                          key={allergen}
                          className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs text-red-700"
                        >
                          {allergen}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveAllergen(allergen)}
                            className="h-4 w-4 p-0 hover:opacity-70"
                          >
                            ×
                          </Button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
                  <Input
                    id="preparationTime"
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) =>
                      setFormData({ ...formData, preparationTime: e.target.value })
                    }
                    placeholder="15"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label>Nutritional Values (AI Generated)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCalculateNutrition}
                      disabled={calculatingNutrition || !formData.name}
                    >
                      {calculatingNutrition ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Calculate
                        </>
                      )}
                    </Button>
                  </div>
                  {formData.nutritionalValues && (
                    <div className="mt-2 rounded-md border p-3 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        {formData.nutritionalValues.calories && (
                          <div>
                            <strong>Calories:</strong> {formData.nutritionalValues.calories} kcal
                          </div>
                        )}
                        {formData.nutritionalValues.protein && (
                          <div>
                            <strong>Protein:</strong> {formData.nutritionalValues.protein}g
                          </div>
                        )}
                        {formData.nutritionalValues.carbohydrates && (
                          <div>
                            <strong>Carbs:</strong> {formData.nutritionalValues.carbohydrates}g
                          </div>
                        )}
                        {formData.nutritionalValues.fat && (
                          <div>
                            <strong>Fat:</strong> {formData.nutritionalValues.fat}g
                          </div>
                        )}
                        {formData.nutritionalValues.fiber && (
                          <div>
                            <strong>Fiber:</strong> {formData.nutritionalValues.fiber}g
                          </div>
                        )}
                        {formData.nutritionalValues.sugar && (
                          <div>
                            <strong>Sugar:</strong> {formData.nutritionalValues.sugar}g
                          </div>
                        )}
                        {formData.nutritionalValues.sodium && (
                          <div>
                            <strong>Sodium:</strong> {formData.nutritionalValues.sodium}mg
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Menu Item"}
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

