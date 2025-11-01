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
import { Save, Upload, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    heroImageUrl: "",
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);

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
          name: restaurantData.name || "",
          logoUrl: restaurantData.logoUrl || "",
          heroImageUrl: restaurantData.heroImageUrl || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "logo");

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setFormData({ ...formData, logoUrl: data.url });
        toast.success("Logo uploaded successfully");
      } else {
        toast.error(data.message || "Failed to upload logo");
      }
    } catch (error) {
      console.error("Failed to upload logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setHeroUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "logo"); // Using same upload type

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setFormData({ ...formData, heroImageUrl: data.url });
        toast.success("Hero image uploaded successfully");
      } else {
        toast.error(data.message || "Failed to upload hero image");
      }
    } catch (error) {
      console.error("Failed to upload hero image:", error);
      toast.error("Failed to upload hero image");
    } finally {
      setHeroUploading(false);
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

      if (res.ok) {
        toast.error("Settings saved successfully!");
        fetchRestaurant();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
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
      <DashboardLayout user={user}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">
              Manage your restaurant profile and settings
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Restaurant Profile</CardTitle>
              <CardDescription>
                Update your restaurant information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="My Restaurant"
                  />
                </div>

                <div>
                  <Label htmlFor="logoUrl">Logo</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="logoUrl"
                        type="url"
                        value={formData.logoUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, logoUrl: e.target.value })
                        }
                        placeholder="https://example.com/logo.png"
                        className="flex-1"
                      />
                      <input
                        ref={logoFileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => logoFileRef.current?.click()}
                        disabled={logoUploading}
                      >
                        {logoUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {formData.logoUrl && (
                      <div className="relative inline-block">
                        <img
                          src={formData.logoUrl}
                          alt="Logo"
                          className="h-20 w-20 rounded object-cover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData({ ...formData, logoUrl: "" })}
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="heroImageUrl">Hero Image</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="heroImageUrl"
                        type="url"
                        value={formData.heroImageUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, heroImageUrl: e.target.value })
                        }
                        placeholder="https://example.com/hero.jpg"
                        className="flex-1"
                      />
                      <input
                        ref={heroFileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleHeroUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => heroFileRef.current?.click()}
                        disabled={heroUploading}
                      >
                        {heroUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {formData.heroImageUrl && (
                      <div className="relative inline-block">
                        <img
                          src={formData.heroImageUrl}
                          alt="Hero"
                          className="h-32 w-full max-w-md rounded object-cover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData({ ...formData, heroImageUrl: "" })}
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
}

