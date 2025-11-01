"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Sparkles, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Offer {
  id: string;
  name: string;
  description?: string | null;
  offerType: "DISCOUNT" | "BUY_ONE_GET_ONE" | "FIXED_PRICE";
  discountValue?: number | null;
  targetType: "ALL" | "CATEGORY" | "SUBCATEGORY" | "MENU_ITEM";
  targetIds: string[];
  startDate?: string | null;
  endDate?: string | null;
  isForever: boolean;
  daysOfWeek: number[];
  startTime?: string | null;
  endTime?: string | null;
  isActive: boolean;
}

export default function OffersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    offerType: "DISCOUNT" as "DISCOUNT" | "BUY_ONE_GET_ONE" | "FIXED_PRICE",
    discountValue: "10",
    targetType: "ALL" as "ALL" | "CATEGORY" | "SUBCATEGORY" | "MENU_ITEM",
    targetIds: [] as string[],
    startDate: "",
    endDate: "",
    isForever: false,
    daysOfWeek: [] as number[],
    startTime: "",
    endTime: "",
    isActive: true,
  });
  const [aiInput, setAiInput] = useState("");

  const days = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
  ];

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          router.push("/auth/login");
        }
      });
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchRestaurant();
      fetchOffers();
      fetchCategories();
    }
  }, [user]);

  const fetchRestaurant = async () => {
    try {
      const res = await fetch("/api/restaurants");
      const data = await res.json();
      if (data.length > 0) {
        setRestaurantId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch restaurant:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await fetch("/api/offers");
      const data = await res.json();
      setOffers(data);
    } catch (error) {
      console.error("Failed to fetch offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiProcess = async () => {
    if (!aiInput.trim()) {
      toast.error("Please enter a description of your offer");
      return;
    }

    setAiProcessing(true);
    try {
      const res = await fetch("/api/gemini/process-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: aiInput }),
      });

      const data = await res.json();

      if (res.ok) {
        // Populate form with AI-processed data
        setFormData({
          name: data.name || "",
          description: data.description || "",
          offerType: data.offerType || "DISCOUNT",
          discountValue: String(data.discountValue || 10),
          targetType: data.targetType || "ALL",
          targetIds: data.targetIds || [],
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          isForever: data.isForever || false,
          daysOfWeek: data.daysOfWeek || [],
          startTime: data.startTime || "",
          endTime: data.endTime || "",
          isActive: true,
        });
        toast.success("AI processed your offer. Review and adjust if needed.");
      } else {
        toast.error(data.message || "Failed to process with AI");
      }
    } catch (error) {
      console.error("Failed to process with AI:", error);
      toast.error("Failed to process with AI");
    } finally {
      setAiProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) {
      toast.error("Please wait for restaurant to load");
      return;
    }

    try {
      const url = editingOffer
        ? `/api/offers/${editingOffer.id}`
        : "/api/offers";
      const method = editingOffer ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          ...formData,
          discountValue: formData.discountValue
            ? parseFloat(formData.discountValue)
            : null,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          startTime: formData.startTime || null,
          endTime: formData.endTime || null,
        }),
      });

      if (res.ok) {
        toast.success(
          editingOffer ? "Offer updated successfully" : "Offer created successfully"
        );
        setShowDialog(false);
        setEditingOffer(null);
        setFormData({
          name: "",
          description: "",
          offerType: "DISCOUNT",
          discountValue: "10",
          targetType: "ALL",
          targetIds: [],
          startDate: "",
          endDate: "",
          isForever: false,
          daysOfWeek: [],
          startTime: "",
          endTime: "",
          isActive: true,
        });
        setAiInput("");
        fetchOffers();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save offer");
      }
    } catch (error) {
      console.error("Failed to save offer:", error);
      toast.error("Failed to save offer");
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name,
      description: offer.description || "",
      offerType: offer.offerType,
      discountValue: offer.discountValue ? String(offer.discountValue) : "10",
      targetType: offer.targetType,
      targetIds: offer.targetIds,
      startDate: offer.startDate
        ? new Date(offer.startDate).toISOString().split("T")[0]
        : "",
      endDate: offer.endDate
        ? new Date(offer.endDate).toISOString().split("T")[0]
        : "",
      isForever: offer.isForever,
      daysOfWeek: offer.daysOfWeek,
      startTime: offer.startTime || "",
      endTime: offer.endTime || "",
      isActive: offer.isActive,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    try {
      const res = await fetch(`/api/offers/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Offer deleted successfully");
        fetchOffers();
      } else {
        toast.error("Failed to delete offer");
      }
    } catch (error) {
      console.error("Failed to delete offer:", error);
      toast.error("Failed to delete offer");
    }
  };

  const handleDayToggle = (dayValue: number) => {
    if (formData.daysOfWeek.includes(dayValue)) {
      setFormData({
        ...formData,
        daysOfWeek: formData.daysOfWeek.filter((d) => d !== dayValue),
      });
    } else {
      setFormData({
        ...formData,
        daysOfWeek: [...formData.daysOfWeek, dayValue],
      });
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
              <h1 className="text-3xl font-bold text-gray-900">Offers & Promotions</h1>
              <p className="mt-2 text-gray-600">
                Create time-based offers and promotions for your menu items
              </p>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingOffer(null);
                    setFormData({
                      name: "",
                      description: "",
                      offerType: "DISCOUNT",
                      discountValue: "10",
                      targetType: "ALL",
                      targetIds: [],
                      startDate: "",
                      endDate: "",
                      isForever: false,
                      daysOfWeek: [],
                      startTime: "",
                      endTime: "",
                      isActive: true,
                    });
                    setAiInput("");
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Offer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingOffer ? "Edit Offer" : "New Offer"}
                  </DialogTitle>
                  <DialogDescription>
                    Create a promotional offer for your menu items
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* AI Input Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        AI Assistant
                      </CardTitle>
                      <CardDescription>
                        Describe your offer in plain English, and AI will help you set it up
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="e.g., 20% discount on all food items every Friday from 5 PM to 9 PM, valid forever"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        rows={3}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAiProcess}
                        disabled={aiProcessing || !aiInput.trim()}
                        className="w-full"
                      >
                        {aiProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Process with AI
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Offer Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g., Friday Happy Hour"
                      />
                    </div>
                    <div>
                      <Label htmlFor="offerType">Offer Type *</Label>
                      <Select
                        value={formData.offerType}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, offerType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DISCOUNT">Discount</SelectItem>
                          <SelectItem value="BUY_ONE_GET_ONE">Buy One Get One</SelectItem>
                          <SelectItem value="FIXED_PRICE">Fixed Price</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.offerType !== "BUY_ONE_GET_ONE" && (
                    <div>
                      <Label htmlFor="discountValue">
                        Discount Value ({formData.offerType === "DISCOUNT" ? "%" : "Amount"}) *
                      </Label>
                      <Input
                        id="discountValue"
                        type="number"
                        step={formData.offerType === "DISCOUNT" ? "0.1" : "0.01"}
                        required
                        value={formData.discountValue}
                        onChange={(e) =>
                          setFormData({ ...formData, discountValue: e.target.value })
                        }
                        placeholder={formData.offerType === "DISCOUNT" ? "20" : "10.00"}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="targetType">Target *</Label>
                    <Select
                      value={formData.targetType}
                      onValueChange={(value: any) =>
                        setFormData({
                          ...formData,
                          targetType: value,
                          targetIds: [],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Menu Items</SelectItem>
                        <SelectItem value="CATEGORY">Specific Categories</SelectItem>
                        <SelectItem value="SUBCATEGORY">Specific Sub-Categories</SelectItem>
                        <SelectItem value="MENU_ITEM">Specific Menu Items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.targetType !== "ALL" && (
                    <div>
                      <Label>Select Targets</Label>
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded p-3">
                        {formData.targetType === "CATEGORY" &&
                          categories.map((cat) => (
                            <div key={cat.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`target-${cat.id}`}
                                checked={formData.targetIds.includes(cat.id)}
                                onCheckedChange={() => {
                                  if (formData.targetIds.includes(cat.id)) {
                                    setFormData({
                                      ...formData,
                                      targetIds: formData.targetIds.filter(
                                        (id) => id !== cat.id
                                      ),
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      targetIds: [...formData.targetIds, cat.id],
                                    });
                                  }
                                }}
                              />
                              <label
                                htmlFor={`target-${cat.id}`}
                                className="text-sm cursor-pointer"
                              >
                                {cat.name}
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isForever"
                        checked={formData.isForever}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isForever: checked as boolean })
                        }
                      />
                      <Label htmlFor="isForever" className="text-sm cursor-pointer">
                        Valid Forever
                      </Label>
                    </div>

                    {!formData.isForever && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) =>
                              setFormData({ ...formData, startDate: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) =>
                              setFormData({ ...formData, endDate: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Days of Week (Optional - leave empty for all days)</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {days.map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={formData.daysOfWeek.includes(day.value)}
                            onCheckedChange={() => handleDayToggle(day.value)}
                          />
                          <Label
                            htmlFor={`day-${day.value}`}
                            className="text-sm cursor-pointer"
                          >
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="startTime">Start Time (Optional)</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({ ...formData, startTime: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time (Optional)</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Optional description"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: checked as boolean })
                      }
                    />
                    <Label htmlFor="isActive" className="text-sm cursor-pointer">
                      Active
                    </Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingOffer ? "Update Offer" : "Create Offer"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowDialog(false);
                        setEditingOffer(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {offers.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Offers Yet</CardTitle>
                <CardDescription>
                  Create your first offer to attract more customers
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {offers.map((offer) => (
                <Card key={offer.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{offer.name}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(offer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(offer.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    {offer.description && (
                      <CardDescription>{offer.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-semibold">Type:</span> {offer.offerType.replace("_", " ")}
                      </p>
                      {offer.discountValue && (
                        <p>
                          <span className="font-semibold">Discount:</span>{" "}
                          {offer.offerType === "DISCOUNT"
                            ? `${offer.discountValue}%`
                            : `$${offer.discountValue}`}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">Target:</span> {offer.targetType}
                      </p>
                      {offer.isForever ? (
                        <p>
                          <span className="font-semibold">Valid:</span> Forever
                        </p>
                      ) : (
                        <>
                          {offer.startDate && (
                            <p>
                              <span className="font-semibold">Start:</span>{" "}
                              {new Date(offer.startDate).toLocaleDateString()}
                            </p>
                          )}
                          {offer.endDate && (
                            <p>
                              <span className="font-semibold">End:</span>{" "}
                              {new Date(offer.endDate).toLocaleDateString()}
                            </p>
                          )}
                        </>
                      )}
                      {(offer.startTime || offer.endTime) && (
                        <p>
                          <span className="font-semibold">Time:</span>{" "}
                          {offer.startTime || "00:00"} - {offer.endTime || "23:59"}
                        </p>
                      )}
                      {offer.daysOfWeek.length > 0 && (
                        <p>
                          <span className="font-semibold">Days:</span>{" "}
                          {offer.daysOfWeek
                            .map((d) => days.find((day) => day.value === d)?.label)
                            .join(", ")}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">Status:</span>{" "}
                        <span
                          className={
                            offer.isActive
                              ? "text-green-600 font-semibold"
                              : "text-gray-500"
                          }
                        >
                          {offer.isActive ? "Active" : "Inactive"}
                        </span>
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
