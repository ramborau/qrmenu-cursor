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
import { Plus, Edit, Trash2, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DynamicPricing {
  id: string;
  name: string;
  description?: string | null;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  adjustmentType: "PERCENTAGE" | "FIXED";
  adjustmentValue: number;
  targetType: "ALL" | "CATEGORY" | "SUBCATEGORY" | "MENU_ITEM";
  targetIds: string[];
  isActive: boolean;
}

export default function DynamicPricingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pricingRules, setPricingRules] = useState<DynamicPricing[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<DynamicPricing | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    daysOfWeek: [] as number[],
    startTime: "00:00",
    endTime: "23:59",
    adjustmentType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    adjustmentValue: "10",
    targetType: "ALL" as "ALL" | "CATEGORY" | "SUBCATEGORY" | "MENU_ITEM",
    targetIds: [] as string[],
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
      fetchPricingRules();
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

  const fetchPricingRules = async () => {
    try {
      const res = await fetch("/api/dynamic-pricing");
      const data = await res.json();
      setPricingRules(data);
    } catch (error) {
      console.error("Failed to fetch pricing rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiProcess = async () => {
    if (!aiInput.trim()) {
      toast.error("Please enter a description of your pricing rule");
      return;
    }

    setAiProcessing(true);
    try {
      const res = await fetch("/api/gemini/process-pricing", {
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
          daysOfWeek: data.daysOfWeek || [],
          startTime: data.startTime || "00:00",
          endTime: data.endTime || "23:59",
          adjustmentType: data.adjustmentType || "PERCENTAGE",
          adjustmentValue: String(data.adjustmentValue || 10),
          targetType: data.targetType || "ALL",
          targetIds: data.targetIds || [],
          isActive: true,
        });
        toast.success("AI processed your pricing rule. Review and adjust if needed.");
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
      const url = editingRule
        ? `/api/dynamic-pricing/${editingRule.id}`
        : "/api/dynamic-pricing";
      const method = editingRule ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          ...formData,
          adjustmentValue: parseFloat(formData.adjustmentValue),
        }),
      });

      if (res.ok) {
        toast.success(
          editingRule
            ? "Pricing rule updated successfully"
            : "Pricing rule created successfully"
        );
        setShowDialog(false);
        setEditingRule(null);
        setFormData({
          name: "",
          description: "",
          daysOfWeek: [],
          startTime: "00:00",
          endTime: "23:59",
          adjustmentType: "PERCENTAGE",
          adjustmentValue: "10",
          targetType: "ALL",
          targetIds: [],
          isActive: true,
        });
        setAiInput("");
        fetchPricingRules();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save pricing rule");
      }
    } catch (error) {
      console.error("Failed to save pricing rule:", error);
      toast.error("Failed to save pricing rule");
    }
  };

  const handleEdit = (rule: DynamicPricing) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || "",
      daysOfWeek: rule.daysOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
      adjustmentType: rule.adjustmentType,
      adjustmentValue: String(rule.adjustmentValue),
      targetType: rule.targetType,
      targetIds: rule.targetIds,
      isActive: rule.isActive,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this pricing rule?")) return;

    try {
      const res = await fetch(`/api/dynamic-pricing/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Pricing rule deleted successfully");
        fetchPricingRules();
      } else {
        toast.error("Failed to delete pricing rule");
      }
    } catch (error) {
      console.error("Failed to delete pricing rule:", error);
      toast.error("Failed to delete pricing rule");
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
              <h1 className="text-3xl font-bold text-gray-900">Dynamic Pricing</h1>
              <p className="mt-2 text-gray-600">
                Set time-based price adjustments for your menu items
              </p>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingRule(null);
                    setFormData({
                      name: "",
                      description: "",
                      daysOfWeek: [],
                      startTime: "00:00",
                      endTime: "23:59",
                      adjustmentType: "PERCENTAGE",
                      adjustmentValue: "10",
                      targetType: "ALL",
                      targetIds: [],
                      isActive: true,
                    });
                    setAiInput("");
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Pricing Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRule ? "Edit Pricing Rule" : "New Pricing Rule"}
                  </DialogTitle>
                  <DialogDescription>
                    Create a time-based price adjustment rule
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
                        Describe your pricing rule in plain English, and AI will help you set it up
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="e.g., Increase prices by 15% on weekends (Saturday and Sunday) from 6 PM to 10 PM for all food items"
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
                      <Label htmlFor="name">Rule Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g., Weekend Dinner Surcharge"
                      />
                    </div>
                    <div>
                      <Label htmlFor="adjustmentType">Adjustment Type *</Label>
                      <Select
                        value={formData.adjustmentType}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, adjustmentType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                          <SelectItem value="FIXED">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="adjustmentValue">
                      Adjustment Value ({formData.adjustmentType === "PERCENTAGE" ? "%" : "Currency"}) *
                    </Label>
                    <Input
                      id="adjustmentValue"
                      type="number"
                      step={formData.adjustmentType === "PERCENTAGE" ? "0.1" : "0.01"}
                      required
                      value={formData.adjustmentValue}
                      onChange={(e) =>
                        setFormData({ ...formData, adjustmentValue: e.target.value })
                      }
                      placeholder={
                        formData.adjustmentType === "PERCENTAGE" ? "15" : "5.00"
                      }
                    />
                  </div>

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
                        {/* Add subcategory and menu item selection similarly */}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Days of Week</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {days.map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={formData.daysOfWeek.includes(day.value)}
                            onCheckedChange={() => handleDayToggle(day.value)}
                          />
                          <label
                            htmlFor={`day-${day.value}`}
                            className="text-sm cursor-pointer"
                          >
                            {day.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input
                        id="startTime"
                        type="time"
                        required
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({ ...formData, startTime: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time *</Label>
                      <Input
                        id="endTime"
                        type="time"
                        required
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
                    <label htmlFor="isActive" className="text-sm cursor-pointer">
                      Active
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingRule ? "Update Rule" : "Create Rule"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowDialog(false);
                        setEditingRule(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {pricingRules.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Pricing Rules Yet</CardTitle>
                <CardDescription>
                  Create your first dynamic pricing rule to adjust prices based on time
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pricingRules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{rule.name}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(rule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(rule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    {rule.description && (
                      <CardDescription>{rule.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-semibold">Adjustment:</span>{" "}
                        {rule.adjustmentType === "PERCENTAGE"
                          ? `${rule.adjustmentValue}%`
                          : `$${rule.adjustmentValue}`}
                      </p>
                      <p>
                        <span className="font-semibold">Target:</span> {rule.targetType}
                      </p>
                      <p>
                        <span className="font-semibold">Time:</span> {rule.startTime} - {rule.endTime}
                      </p>
                      <p>
                        <span className="font-semibold">Days:</span>{" "}
                        {rule.daysOfWeek.length === 0
                          ? "All days"
                          : rule.daysOfWeek
                              .map((d) => days.find((day) => day.value === d)?.label)
                              .join(", ")}
                      </p>
                      <p>
                        <span className="font-semibold">Status:</span>{" "}
                        <span
                          className={
                            rule.isActive
                              ? "text-green-600 font-semibold"
                              : "text-gray-500"
                          }
                        >
                          {rule.isActive ? "Active" : "Inactive"}
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
