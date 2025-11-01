"use client";
import { toast } from "sonner";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Palette, Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function CustomizationPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [formData, setFormData] = useState({
    primaryColor: "#075e54",
    secondaryColor: "#00c307",
    backgroundColor: "#ffffff",
    darkTheme: false,
  });
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          router.push("/auth/login");
        }
      })
      .catch(() => {
        router.push("/auth/login");
      });
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchRestaurant();
    }
  }, [user]);

  const fetchRestaurant = async () => {
    try {
      const res = await fetch("/api/restaurants");
      const data = await res.json();
      if (data.length > 0) {
        const restaurantData = data[0];
        setRestaurant(restaurantData);
        setFormData({
          primaryColor: restaurantData.primaryColor || "#075e54",
          secondaryColor: restaurantData.secondaryColor || "#00c307",
          backgroundColor: restaurantData.backgroundColor || "#ffffff",
          darkTheme: restaurantData.darkTheme || false,
        });
        if (restaurantData.id) {
          setPreviewUrl(`/menu/${restaurantData.id}/table/T-01`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || `Failed to save settings (${res.status})`);
        return;
      }

      const data = await res.json();
      setRestaurant(data);
      setFormData({
        primaryColor: data.primaryColor || "#075e54",
        secondaryColor: data.secondaryColor || "#00c307",
        backgroundColor: data.backgroundColor || "#ffffff",
        darkTheme: data.darkTheme || false,
      });
      
      toast.success("Settings saved successfully!");
      console.log("Settings saved:", data);
    } catch (error) {
      console.error("Failed to save colors:", error);
      toast.error("Failed to save colors");
    } finally {
      setSaving(false);
    }
  };

  const checkContrast = (foreground: string, background: string) => {
    // Simple contrast check - returns ratio
    const getLuminance = (hex: string) => {
      const rgb = hex.match(/[A-Za-z0-9]{2}/g)?.map((x) => parseInt(x, 16) / 255) || [0, 0, 0];
      return rgb.map((val) =>
        val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      );
    };

    const lum1 = getLuminance(foreground).reduce((a, b) => a + b);
    const lum2 = getLuminance(background).reduce((a, b) => a + b);
    const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
    return ratio;
  };

  const contrastRatio = checkContrast(formData.primaryColor, formData.backgroundColor);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout user={user}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customization</h1>
            <p className="mt-2 text-gray-600">
              Customize colors and branding for your menu
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Settings
                </CardTitle>
                <CardDescription>
                  Customize your menu's color scheme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          setFormData({ ...formData, primaryColor: e.target.value })
                        }
                        className="h-12 w-20"
                      />
                      <Input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          setFormData({ ...formData, primaryColor: e.target.value })
                        }
                        placeholder="#075e54"
                        pattern="^#[0-9A-Fa-f]{6}$"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) =>
                          setFormData({ ...formData, secondaryColor: e.target.value })
                        }
                        className="h-12 w-20"
                      />
                      <Input
                        type="text"
                        value={formData.secondaryColor}
                        onChange={(e) =>
                          setFormData({ ...formData, secondaryColor: e.target.value })
                        }
                        placeholder="#00c307"
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
                        value={formData.backgroundColor}
                        onChange={(e) =>
                          setFormData({ ...formData, backgroundColor: e.target.value })
                        }
                        className="h-12 w-20"
                        disabled={formData.darkTheme}
                      />
                      <Input
                        type="text"
                        value={formData.backgroundColor}
                        onChange={(e) =>
                          setFormData({ ...formData, backgroundColor: e.target.value })
                        }
                        placeholder="#ffffff"
                        pattern="^#[0-9A-Fa-f]{6}$"
                        disabled={formData.darkTheme}
                      />
                    </div>
                    {formData.darkTheme && (
                      <p className="mt-1 text-xs text-gray-500">
                        Background color is set to black when dark theme is enabled
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label htmlFor="darkTheme" className="flex items-center gap-2">
                          {formData.darkTheme ? (
                            <Moon className="h-4 w-4" />
                          ) : (
                            <Sun className="h-4 w-4" />
                          )}
                          Dark Theme
                        </Label>
                        <p className="text-sm text-gray-500">
                          Enable dark mode with black background and smart color adjustments
                        </p>
                      </div>
                      <Switch
                        id="darkTheme"
                        checked={formData.darkTheme}
                        onCheckedChange={(checked) => {
                          setFormData({ 
                            ...formData, 
                            darkTheme: checked,
                            backgroundColor: checked ? "#000000" : "#ffffff",
                          });
                        }}
                      />
                    </div>
                  </div>

                  {!formData.darkTheme && contrastRatio < 3 && (
                    <div className="rounded-md bg-yellow-100 p-3 text-sm text-yellow-800">
                      Warning: Contrast ratio ({contrastRatio.toFixed(2)}) is below recommended minimum (3:1). Text may be hard to read.
                    </div>
                  )}
                  
                  {formData.darkTheme && (
                    <div className="rounded-md bg-green-100 p-3 text-sm text-green-800">
                      ✓ Dark theme enabled: Black background with automatic text color adjustments for optimal readability.
                    </div>
                  )}

                  <Button type="submit" disabled={saving} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Colors"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  See how your colors will look on the menu
                </CardDescription>
              </CardHeader>
              <CardContent>
                {previewUrl && (
                  <div className="space-y-4">
                    <iframe
                      src={previewUrl}
                      className="h-96 w-full rounded border"
                      title="Menu Preview"
                    />
                    <p className="text-xs text-gray-500">
                      Preview updates in real-time. Open menu in new tab for full preview.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.open(previewUrl, "_blank")}
                      className="w-full"
                    >
                      Open Full Preview
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
}

