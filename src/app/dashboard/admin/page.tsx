"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { axiosInstance } from "@/lib/axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  LayoutGrid,
  CalendarCheck,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBookings: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        // একাধিক API নিরাপদভাবে ডাকার জন্য Promise.allSettled
        const [usersRes, categoriesRes, bookingsRes] = await Promise.allSettled(
          [
            axiosInstance.get("/admin/users"),
            axiosInstance.get("/categories"),
            axiosInstance.get("/bookings"),
          ],
        );

        if (isMounted) {
          const uCount =
            usersRes.status === "fulfilled" && usersRes.value.data?.data
              ? usersRes.value.data.data.length
              : 0;

          const cCount =
            categoriesRes.status === "fulfilled" &&
            categoriesRes.value.data?.data
              ? categoriesRes.value.data.data.length
              : 0;

          const bCount =
            bookingsRes.status === "fulfilled" && bookingsRes.value.data?.data
              ? bookingsRes.value.data.data.length
              : 0;

          setStats({
            totalUsers: uCount,
            activeBookings: bCount,
            totalCategories: cCount,
          });
        }
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Admin Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Global performance metrics and platform moderation management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" /> System Active
          </span>
        </div>
      </div>

      {/* Required Metric Cards (Requirement অনুযায়ী) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? "..." : stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered customers & technicians
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Active Bookings
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {loading ? "..." : stats.activeBookings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ongoing and requested jobs
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Service Categories
            </CardTitle>
            <LayoutGrid className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {loading ? "..." : stats.totalCategories}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active marketplace modules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Direct Action Hub Cards (User & Category Moderation) */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5 text-primary" /> User Moderation
            </CardTitle>
            <CardDescription>
              View all registered accounts, manage roles, and control access
              permissions (Ban/Unban users).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/users">
              <Button className="gap-2">
                Manage Users <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LayoutGrid className="w-5 h-5 text-indigo-600" /> Category
              Management
            </CardTitle>
            <CardDescription>
              Create, edit, or clean up service categories to keep marketplace
              listings organized.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/categories">
              <Button variant="outline" className="gap-2">
                Manage Categories <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
