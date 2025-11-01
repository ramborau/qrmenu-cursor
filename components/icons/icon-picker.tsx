"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import * as Icons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as HiIcons from "react-icons/hi";
import * as FiIcons from "react-icons/fi";

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
}

const iconLibraries = {
  fa: Icons,
  md: MdIcons,
  hi: HiIcons,
  fi: FiIcons,
};

const popularFoodIcons = [
  "FaUtensils",
  "FaHamburger",
  "FaPizzaSlice",
  "FaDrumstickBite",
  "FaFish",
  "FaBreadSlice",
  "FaWineGlass",
  "FaCoffee",
  "FaCocktail",
  "MdLocalRestaurant",
  "MdFastfood",
  "MdIcecream",
  "HiCake",
  "FiCoffee",
];

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(value);

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    onChange(iconName);
  };

  const filteredIcons = searchQuery
    ? Object.entries(iconLibraries)
        .flatMap(([prefix, lib]: [string, any]) =>
          Object.keys(lib)
            .filter((name) =>
              name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((name) => `${prefix}:${name}`)
        )
        .slice(0, 20)
    : popularFoodIcons.map((name) => {
        if (name.startsWith("Fa")) return `fa:${name}`;
        if (name.startsWith("Md")) return `md:${name}`;
        if (name.startsWith("Hi")) return `hi:${name}`;
        if (name.startsWith("Fi")) return `fi:${name}`;
        return `fa:${name}`;
      });

  const renderIcon = (iconPath: string) => {
    const [prefix, iconName] = iconPath.split(":");
    const IconLib = iconLibraries[prefix as keyof typeof iconLibraries];
    if (!IconLib || !IconLib[iconName as keyof typeof IconLib]) return null;
    const Icon = IconLib[iconName as keyof typeof IconLib] as React.ComponentType<any>;
    return <Icon className="h-6 w-6" />;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Icon</Label>
        <div className="mt-2 flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search icons..."
            className="flex-1"
          />
          <Search className="h-4 w-4 text-gray-400 mt-2" />
        </div>
        {selectedIcon && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-600">Selected:</span>
            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {selectedIcon}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedIcon(undefined);
                onChange("");
              }}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
        {filteredIcons.map((iconPath) => {
          const [prefix, iconName] = iconPath.split(":");
          const isSelected = selectedIcon === iconPath;
          
          return (
            <Card
              key={iconPath}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? "border-primary-dark border-2 bg-primary-dark/10"
                  : "hover:border-gray-300"
              }`}
              onClick={() => handleIconSelect(iconPath)}
            >
              <CardContent className="p-3 flex flex-col items-center justify-center gap-1">
                {renderIcon(iconPath)}
                <span className="text-xs text-gray-500 truncate w-full text-center">
                  {iconName}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-gray-500">
        Icons from{" "}
        <a
          href="https://react-icons.github.io/react-icons"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-dark hover:underline"
        >
          React Icons
        </a>
      </p>
    </div>
  );
}

