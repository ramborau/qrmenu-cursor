"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loading } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/error-boundary";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, QrCode, Menu, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    totalTables: 0,
    totalScans: 0,
  });

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          // Fetch actual stats from API
          fetch("/api/stats")
            .then((res) => res.json())
            .then((statsData) => {
              setStats(statsData);
            })
            .catch((error) => {
              console.error("Failed to fetch stats:", error);
            });
        } else {
          router.push("/auth/login");
        }
      })
      .catch(() => {
        router.push("/auth/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.name || user?.email}! Here's your overview.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Menu Items"
              value={stats.totalItems}
              description="Total menu items"
              icon={Menu}
            />
            <StatsCard
              title="Categories"
              value={stats.totalCategories}
              description="Menu categories"
              icon={Utensils}
            />
            <StatsCard
              title="QR Codes"
              value={stats.totalTables}
              description="Active table codes"
              icon={QrCode}
            />
            <StatsCard
              title="Total Scans"
              value={stats.totalScans}
              description="QR code scans"
              icon={TrendingUp}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Menu Management</CardTitle>
                <CardDescription>
                  Create and manage your restaurant menu items, categories, and sub-categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/menu">
                  <Button className="w-full">
                    Manage Menu <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Codes</CardTitle>
                <CardDescription>
                  Generate and download QR codes for your restaurant tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/qr-codes">
                  <Button className="w-full">
                    Manage QR Codes <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customization</CardTitle>
                <CardDescription>
                  Customize colors, branding, and menu appearance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/customization">
                  <Button className="w-full">
                    Customize <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
}

