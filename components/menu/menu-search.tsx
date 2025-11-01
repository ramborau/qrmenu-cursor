"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MenuSearchProps {
  onSearch: (query: string) => void;
  onFilter: (filters: {
    tags?: string[];
    allergens?: string[];
    priceRange?: { min?: number; max?: number };
  }) => void;
}

export function MenuSearch({ onSearch, onFilter }: MenuSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const commonTags = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Spicy"];
  const commonAllergens = ["Dairy", "Nuts", "Gluten", "Eggs", "Fish", "Shellfish"];

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onFilter({
      tags: newTags.length > 0 ? newTags : undefined,
      allergens: selectedAllergens.length > 0 ? selectedAllergens : undefined,
      priceRange: priceMin || priceMax ? { min: priceMin ? parseFloat(priceMin) : undefined, max: priceMax ? parseFloat(priceMax) : undefined } : undefined,
    });
  };

  const handleAllergenToggle = (allergen: string) => {
    const newAllergens = selectedAllergens.includes(allergen)
      ? selectedAllergens.filter((a) => a !== allergen)
      : [...selectedAllergens, allergen];
    setSelectedAllergens(newAllergens);
    onFilter({
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      allergens: newAllergens.length > 0 ? newAllergens : undefined,
      priceRange: priceMin || priceMax ? { min: priceMin ? parseFloat(priceMin) : undefined, max: priceMax ? parseFloat(priceMax) : undefined } : undefined,
    });
  };

  const handlePriceFilter = () => {
    onFilter({
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      allergens: selectedAllergens.length > 0 ? selectedAllergens : undefined,
      priceRange: priceMin || priceMax ? { min: priceMin ? parseFloat(priceMin) : undefined, max: priceMax ? parseFloat(priceMax) : undefined } : undefined,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSelectedAllergens([]);
    setPriceMin("");
    setPriceMax("");
    onSearch("");
    onFilter({});
  };

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <div>
        <Label>Search Menu Items</Label>
        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search items, descriptions..."
              className="pl-10"
            />
          </div>
          {(searchQuery || selectedTags.length > 0 || selectedAllergens.length > 0 || priceMin || priceMax) && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Dietary Tags</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {commonTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                size="sm"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label>Allergens (Exclude)</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {commonAllergens.map((allergen) => (
              <Button
                key={allergen}
                variant={selectedAllergens.includes(allergen) ? "default" : "outline"}
                size="sm"
                onClick={() => handleAllergenToggle(allergen)}
              >
                {allergen}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label>Price Range</Label>
          <div className="mt-2 flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              onBlur={handlePriceFilter}
              className="w-24"
            />
            <Input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              onBlur={handlePriceFilter}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

