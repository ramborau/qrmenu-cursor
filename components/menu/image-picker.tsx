"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Image as ImageIcon, Loader2 } from "lucide-react";

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    thumb: string;
  };
  alt_description?: string;
  user: {
    name: string;
    username: string;
  };
}

interface ImagePickerProps {
  value?: string;
  onChange: (url: string) => void;
  menuItemName?: string;
}

export function ImagePicker({ value, onChange, menuItemName }: ImagePickerProps) {
  const [searchQuery, setSearchQuery] = useState(menuItemName || "");
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState(value || "");

  useEffect(() => {
    if (menuItemName && !searchQuery) {
      setSearchQuery(menuItemName);
      handleSearch(menuItemName);
    }
  }, [menuItemName]);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/unsplash/search?query=${encodeURIComponent(searchTerm)}&per_page=9`
      );
      const data = await res.json();
      setImages(data || []);
    } catch (error) {
      console.error("Failed to search Unsplash:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setCustomUrl(imageUrl);
    onChange(imageUrl);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          value={customUrl}
          onChange={(e) => {
            setCustomUrl(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="https://example.com/image.jpg"
          className="mt-2"
        />
      </div>

      <div>
        <Label>Search Unsplash</Label>
        <div className="mt-2 flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Search for images..."
          />
          <Button
            type="button"
            onClick={() => handleSearch()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {images.length > 0 && (
        <div>
          <Label>Unsplash Suggestions</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {images.map((image) => (
              <Card
                key={image.id}
                className="cursor-pointer overflow-hidden transition-opacity hover:opacity-75"
                onClick={() => handleImageSelect(image.urls.regular)}
              >
                <CardContent className="p-0">
                  <img
                    src={image.urls.thumb}
                    alt={image.alt_description || "Unsplash image"}
                    className="h-24 w-full object-cover"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Images from{" "}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-dark hover:underline"
            >
              Unsplash
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

