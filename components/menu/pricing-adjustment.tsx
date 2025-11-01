"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";
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

interface PricingAdjustmentProps {
  categories: Category[];
  onComplete: () => void;
}

export function PricingAdjustment({ categories, onComplete }: PricingAdjustmentProps) {
  const [selectedScope, setSelectedScope] = useState<"all" | "category" | "subcategory" | "items">("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [percentage, setPercentage] = useState<string>("10");
  const [action, setAction] = useState<"increase" | "decrease">("increase");
  const [loading, setLoading] = useState(false);

  // Get all menu items for selected scope
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

  const handleApply = async () => {
    const percentageNum = parseFloat(percentage);
    if (isNaN(percentageNum) || percentageNum <= 0 || percentageNum > 100) {
      toast.error("Please enter a valid percentage between 1 and 100");
      return;
    }

    const selectedItemIds = getAllSelectedItems();
    if (selectedItemIds.length === 0) {
      toast.error("Please select at least one item to update");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        percentage: percentageNum,
        action,
      };

      if (selectedScope === "category") {
        payload.categoryIds = selectedCategories;
      } else if (selectedScope === "subcategory") {
        payload.subCategoryIds = selectedSubCategories;
      } else if (selectedScope === "items") {
        payload.menuItemIds = selectedItems;
      }

      const res = await fetch("/api/menu-items/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || `Successfully ${action}d prices for ${data.updatedCount} items`);
        onComplete();
      } else {
        toast.error(data.message || "Failed to update prices");
      }
    } catch (error) {
      console.error("Failed to update prices:", error);
      toast.error("Failed to update prices");
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = getAllSelectedItems().length;

  return (
    <div className="space-y-6">
      {/* Scope Selection */}
      <div>
        <Label className="mb-2 block">Apply to:</Label>
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

      {/* Category Selection */}
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

      {/* Sub-Category Selection */}
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

      {/* Menu Items Selection */}
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
                            {item.name} - ${item.price.toFixed(2)}
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

      {/* Adjustment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Adjustment</CardTitle>
          <CardDescription>
            {selectedCount > 0
              ? `${selectedCount} item${selectedCount !== 1 ? "s" : ""} will be updated`
              : "No items selected"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant={action === "increase" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setAction("increase")}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Increase
            </Button>
            <Button
              variant={action === "decrease" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setAction("decrease")}
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              Decrease
            </Button>
          </div>

          <div>
            <Label htmlFor="percentage">Percentage (%)</Label>
            <Input
              id="percentage"
              type="number"
              min="1"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="10"
              className="mt-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              Prices will be {action === "increase" ? "increased" : "decreased"} by {percentage || "0"}%
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleApply}
            disabled={loading || selectedCount === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                {action === "increase" ? (
                  <ArrowUp className="mr-2 h-4 w-4" />
                ) : (
                  <ArrowDown className="mr-2 h-4 w-4" />
                )}
                Apply {action === "increase" ? "Increase" : "Decrease"} to {selectedCount} Items
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
