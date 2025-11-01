"use client";
import { toast } from "sonner";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, QrCode, Download, Trash2 } from "lucide-react";
import { BrandingForm } from "@/components/qr/branding-form";

export default function QRCodesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    tableNumber: "",
    count: 1,
  });
  const [brandingSettings, setBrandingSettings] = useState<any>(null);
  const [showBranding, setShowBranding] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);

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
      fetchQRCodes();
    }
  }, [user]);

  const fetchRestaurant = async () => {
    try {
      const res = await fetch("/api/restaurants");
      const data = await res.json();
      if (data.length > 0) {
        setRestaurantId(data[0].id);
        setRestaurant(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch restaurant:", error);
    }
  };

  const fetchQRCodes = async () => {
    try {
      const res = await fetch("/api/qr-codes");
      const data = await res.json();
      setQrCodes(data);
    } catch (error) {
      console.error("Failed to fetch QR codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) {
      toast.error("Please wait for restaurant to load");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/qr-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          ...formData,
          brandingSettings: brandingSettings || undefined,
        }),
      });

      if (res.ok) {
        fetchQRCodes();
        setFormData({ tableNumber: "", count: 1 });
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to generate QR codes");
      }
    } catch (error) {
      console.error("Failed to generate QR codes:", error);
      toast.error("Failed to generate QR codes");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (qrCode: any, format: "svg" | "png") => {
    const url = format === "svg" ? qrCode.qrCodeUrlSvg : qrCode.qrCodeUrlPng;
    if (!url) return;

    if (format === "png") {
      const link = document.createElement("a");
      link.href = url;
      link.download = `table-${qrCode.tableNumber}.png`;
      link.click();
    } else {
      const blob = new Blob([url], { type: "image/svg+xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `table-${qrCode.tableNumber}.svg`;
      link.click();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this QR code?")) return;

    try {
      const res = await fetch(`/api/qr-codes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchQRCodes();
      } else {
        toast.error("Failed to delete QR code");
      }
    } catch (error) {
      console.error("Failed to delete QR code:", error);
      toast.error("Failed to delete QR code");
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">QR Codes</h1>
              <p className="mt-2 text-gray-600">
                Generate and manage QR codes for your restaurant tables
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Generate QR Codes</CardTitle>
              <CardDescription>
                Create QR codes for your restaurant tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="tableNumber">Table Number (Optional)</Label>
                    <Input
                      id="tableNumber"
                      value={formData.tableNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, tableNumber: e.target.value })
                      }
                      placeholder="e.g., T-01, Table-1, Patio-3"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty for auto-numbering (T-01, T-02, etc.)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="count">Number of QR Codes</Label>
                    <Input
                      id="count"
                      type="number"
                      min="1"
                      max="500"
                      value={formData.count}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          count: parseInt(e.target.value) || 1,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBranding(!showBranding)}
                    className="w-full"
                  >
                    {showBranding ? "Hide" : "Show"} Branding Options
                  </Button>
                </div>

                {showBranding && restaurant && (
                  <BrandingForm
                    restaurant={restaurant}
                    initialBranding={brandingSettings}
                    onChange={setBrandingSettings}
                  />
                )}

                <Button type="submit" disabled={generating || !restaurantId}>
                  <Plus className="mr-2 h-4 w-4" />
                  {generating ? "Generating..." : "Generate QR Codes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {qrCodes.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No QR Codes Yet</CardTitle>
                <CardDescription>
                  Generate your first QR code to get started
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {qrCodes.map((qrCode) => (
                <Card key={qrCode.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        {qrCode.tableNumber}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(qrCode.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {qrCode.qrCodeUrlPng && (
                        <img
                          src={qrCode.qrCodeUrlPng}
                          alt={`QR Code for ${qrCode.tableNumber}`}
                          className="mx-auto h-48 w-48 rounded border"
                        />
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDownload(qrCode, "svg")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          SVG
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDownload(qrCode, "png")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          PNG
                        </Button>
                      </div>
                      <p className="text-xs text-center text-gray-500">
                        {qrCode.qrCodeData}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
}

