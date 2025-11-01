"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface BrandingSettings {
  foregroundColor?: string;
  backgroundColor?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  margin?: number;
  logoUrl?: string;
  logoSize?: number;
}

interface BrandingFormProps {
  restaurant?: {
    primaryColor?: string | null;
    secondaryColor?: string | null;
    backgroundColor?: string | null;
    logoUrl?: string | null;
  };
  initialBranding?: BrandingSettings | null;
  onChange: (branding: BrandingSettings) => void;
}

export function BrandingForm({ restaurant, initialBranding, onChange }: BrandingFormProps) {
  const [branding, setBranding] = useState<BrandingSettings>({
    foregroundColor: initialBranding?.foregroundColor || restaurant?.primaryColor || "#075e54",
    backgroundColor: initialBranding?.backgroundColor || restaurant?.backgroundColor || "#ffffff",
    errorCorrectionLevel: initialBranding?.errorCorrectionLevel || "M",
    margin: initialBranding?.margin || 1,
    logoUrl: initialBranding?.logoUrl || restaurant?.logoUrl || undefined,
    logoSize: initialBranding?.logoSize || 60,
  });

  useEffect(() => {
    onChange(branding);
  }, [branding, onChange]);

  const updateBranding = (updates: Partial<BrandingSettings>) => {
    const newBranding = { ...branding, ...updates };
    setBranding(newBranding);
    onChange(newBranding);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Branding</CardTitle>
        <CardDescription>
          Customize your QR code appearance with colors and logo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="foregroundColor">Foreground Color</Label>
            <div className="mt-2 flex gap-2">
              <Input
                id="foregroundColor"
                type="color"
                value={branding.foregroundColor || "#075e54"}
                onChange={(e) =>
                  updateBranding({ foregroundColor: e.target.value })
                }
                className="h-12 w-20"
              />
              <Input
                type="text"
                value={branding.foregroundColor || "#075e54"}
                onChange={(e) =>
                  updateBranding({ foregroundColor: e.target.value })
                }
                placeholder="#075e54"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="backgroundColor">Background Color</Label>
            <div className="mt-2 flex gap-2">
              <Input
                id="backgroundColor"
                type="color"
                value={branding.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  updateBranding({ backgroundColor: e.target.value })
                }
                className="h-12 w-20"
              />
              <Input
                type="text"
                value={branding.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  updateBranding({ backgroundColor: e.target.value })
                }
                placeholder="#ffffff"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input
            id="logoUrl"
            type="url"
            value={branding.logoUrl || ""}
            onChange={(e) =>
              updateBranding({ logoUrl: e.target.value || undefined })
            }
            placeholder="https://example.com/logo.png"
            className="mt-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional: Add your restaurant logo to the center of the QR code
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="logoSize">Logo Size</Label>
            <Input
              id="logoSize"
              type="number"
              min="30"
              max="100"
              value={branding.logoSize || 60}
              onChange={(e) =>
                updateBranding({ logoSize: parseInt(e.target.value) || 60 })
              }
              className="mt-2"
            />
            <p className="mt-1 text-xs text-gray-500">Logo size in pixels (30-100)</p>
          </div>

          <div>
            <Label htmlFor="errorCorrection">Error Correction Level</Label>
            <Select
              value={branding.errorCorrectionLevel || "M"}
              onValueChange={(value: "L" | "M" | "Q" | "H") =>
                updateBranding({ errorCorrectionLevel: value })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">L - Low (~7%)</SelectItem>
                <SelectItem value="M">M - Medium (~15%)</SelectItem>
                <SelectItem value="Q">Q - Quarter (~25%)</SelectItem>
                <SelectItem value="H">H - High (~30%)</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-gray-500">
              Higher levels recommended with logo
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="margin">Margin</Label>
          <Input
            id="margin"
            type="number"
            min="0"
            max="4"
            value={branding.margin || 1}
            onChange={(e) =>
              updateBranding({ margin: parseInt(e.target.value) || 1 })
            }
            className="mt-2"
          />
          <p className="mt-1 text-xs text-gray-500">Margin size (0-4)</p>
        </div>
      </CardContent>
    </Card>
  );
}

