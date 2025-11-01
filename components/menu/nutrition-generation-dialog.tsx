"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  subCategories: Array<{
    id: string;
    name: string;
    menuItems: Array<{
      id: string;
      name: string;
      price: number;
    }>;
  }>;
}

interface NutritionGenerationDialogProps {
  categories: Category[];
  onComplete: () => void;
}

export function NutritionGenerationDialog({
  categories,
  onComplete,
}: NutritionGenerationDialogProps) {
  const [selectedScope, setSelectedScope] = useState<"all" | "category" | "subcategory" | "items">("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleSubCategoryToggle = (subCategoryId: string) => {
    if (selectedSubCategories.includes(subCategoryId)) {
      setSelectedSubCategories(selectedSubCategories.filter((id) => id !== subCategoryId));
    } else {
      setSelectedSubCategories([...selectedSubCategories, subCategoryId]);
    }
  };

  const handleItemToggle = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSelectAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((cat) => cat.id));
    }
  };

  const getAllSelectedItems = () => {
    if (selectedScope === "all") {
      return categories.flatMap((cat) =>
        (cat.subCategories || []).flatMap((sub) =>
          (sub.menuItems || []).map((item: any) => item.id)
        )
      );
    } else if (selectedScope === "category") {
      return categories
        .filter((cat) => selectedCategories.includes(cat.id))
        .flatMap((cat) =>
          (cat.subCategories || []).flatMap((sub) => (sub.menuItems || []).map((item: any) => item.id))
        );
    } else if (selectedScope === "subcategory") {
      return categories
        .flatMap((cat) => cat.subCategories || [])
        .filter((sub) => selectedSubCategories.includes(sub.id))
        .flatMap((sub) => (sub.menuItems || []).map((item: any) => item.id));
    } else {
      return selectedItems;
    }
  };

  const handleGenerate = async () => {
    const selectedItemIds = getAllSelectedItems();
    if (selectedItemIds.length === 0) {
      toast.error("Please select at least one item to generate nutrition facts for");
      return;
    }

    setGenerating(true);
    try {
      const payload: any = {};

      if (selectedScope === "category" && selectedCategories.length > 0) {
        payload.categoryIds = selectedCategories;
      } else if (selectedScope === "subcategory" && selectedSubCategories.length > 0) {
        payload.subCategoryIds = selectedSubCategories;
      } else if (selectedScope === "items" && selectedItems.length > 0) {
        payload.menuItemIds = selectedItems;
      }
      // If scope is "all", payload remains empty {} which will fetch all items

      console.log("Generating nutrition for payload:", payload, "selectedCount:", selectedItemIds.length);

      const res = await fetch("/api/gemini/generate-nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Successfully generated nutrition facts for ${data.updatedCount} items`);
        onComplete();
      } else {
        toast.error(data.message || "Failed to generate nutrition facts");
      }
    } catch (error) {
      console.error("Failed to generate nutrition facts:", error);
      toast.error("Failed to generate nutrition facts");
    } finally {
      setGenerating(false);
    }
  };

  const selectedCount = getAllSelectedItems().length;

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block">Generate for:</Label>
        <Select value={selectedScope} onValueChange={(value: any) => setSelectedScope(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Menu Items</SelectItem>
            <SelectItem value="category">Selected Categories</SelectItem>
            <SelectItem value="subcategory">Selected Sub-Categories</SelectItem>
            <SelectItem value="items">Selected Menu Items</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedScope === "category" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Select Categories</CardTitle>
              <Button variant="outline" size="sm" onClick={handleSelectAllCategories}>
                {selectedCategories.length === categories.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <label
                    htmlFor={`cat-${category.id}`}
                    className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name} ({category.subCategories?.reduce((total, sub) => total + (sub.menuItems?.length || 0), 0) || 0} items)
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedScope === "subcategory" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Sub-Categories</CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id}>
                  <h4 className="font-semibold mb-2 text-sm text-gray-700">{category.name}</h4>
                  <div className="space-y-2 pl-4">
                    {category.subCategories.map((subCategory) => (
                      <div key={subCategory.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sub-${subCategory.id}`}
                          checked={selectedSubCategories.includes(subCategory.id)}
                          onCheckedChange={() => handleSubCategoryToggle(subCategory.id)}
                        />
                        <label
                          htmlFor={`sub-${subCategory.id}`}
                          className="flex-1 cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {subCategory.name} ({subCategory.menuItems?.length || 0} items)
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedScope === "items" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Menu Items</CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            <div className="space-y-3">
              {categories.map((category) =>
                category.subCategories.map((subCategory) => (
                  <div key={subCategory.id}>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">
                      {category.name} → {subCategory.name}
                    </h4>
                    <div className="space-y-2 pl-4">
                      {(subCategory.menuItems || []).map((item: any) => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => handleItemToggle(item.id)}
                          />
                          <label
                            htmlFor={`item-${item.id}`}
                            className="flex-1 cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {item.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Nutrition Facts</CardTitle>
          <CardDescription>
            {selectedCount > 0
              ? `${selectedCount} item${selectedCount !== 1 ? "s" : ""} will have nutrition facts generated`
              : "No items selected"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={generating || selectedCount === 0}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI ({selectedCount} items)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
