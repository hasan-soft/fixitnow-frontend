"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Wrench,
  Users,
  User as UserIcon,
  Home,
  Menu,
  X,
  ShieldCheck,
  Clock,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { User as UserType } from "@/types/auth";
import Cookies from "js-cookie";
import { toast } from "sonner";

const roleMenus = {
  CUSTOMER: [
    { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { title: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
    { title: "Profile", href: "/dashboard/profile", icon: UserIcon },
  ],
  TECHNICIAN: [
    { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
    {
      title: "Assigned Jobs",
      href: "/dashboard/technician",
      icon: Wrench,
    },
    {
      title: "Manage Bookings",
      href: "/dashboard/technician/bookings",
      icon: Calendar,
    },
    { title: "My Availability", href: "/dashboard/availability", icon: Clock },
    { title: "Profile", href: "/dashboard/profile", icon: UserIcon },
  ],
  ADMIN: [
    { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { title: "Manage Users", href: "/dashboard/admin/users", icon: Users },
    {
      title: "All Bookings",
      href: "/dashboard/admin/bookings",
      icon: Calendar,
    },
    {
      title: "Categories",
      href: "/dashboard/admin/categories",
      icon: ShieldCheck,
    },
  ],
};

const subscribeStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getStoredUserSnapshot = (): string | null => {
  return localStorage.getItem("user");
};

const getServerSnapshot = (): string | null => {
  return null;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const rawUser = useSyncExternalStore(
    subscribeStorage,
    getStoredUserSnapshot,
    getServerSnapshot,
  );

  const user: UserType | null = React.useMemo(() => {
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  }, [rawUser]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("refreshToken");

    window.dispatchEvent(new Event("storage"));

    toast.success("Logged out successfully");
    router.push("/login");
    router.refresh();
  };

  const userRole = (user?.role as keyof typeof roleMenus) || "CUSTOMER";
  const currentMenuItems = roleMenus[userRole] || roleMenus.CUSTOMER;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* DYNAMIC SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <Link
            href="/"
            className="font-bold text-xl text-primary flex items-center gap-2"
          >
            <Wrench className="h-5 w-5" />
            <span>FixItNow</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {userRole} Menu
          </p>
          {currentMenuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 capitalize">
              {userRole.toLowerCase()} Dashboard
            </h1>
          </div>

          {/* DYNAMIC USER HEADER SECTION */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {user.email}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
