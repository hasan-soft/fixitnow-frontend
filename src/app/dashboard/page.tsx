"use client";

import React, { useSyncExternalStore } from "react";
import { User } from "@/types/auth";
import TechnicianDashboardPage from "@/app/dashboard/technician/page";

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

export default function DashboardPage() {
  const rawUser = useSyncExternalStore(
    subscribeStorage,
    getStoredUserSnapshot,
    getServerSnapshot,
  );

  const user: User | null = React.useMemo(() => {
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  }, [rawUser]);

  if (!user) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div>
      {user.role === "TECHNICIAN" && <TechnicianDashboardPage />}

      {user.role === "CUSTOMER" && (
        <div className="p-6 bg-white dark:bg-slate-950 rounded-xl border shadow-sm">
          <h2 className="text-2xl font-bold">Welcome, {user.name}!</h2>
          <p className="text-muted-foreground mt-1">
            Manage your service bookings and view current job status from the
            sidebar.
          </p>
        </div>
      )}

      {user.role === "ADMIN" && (
        <div className="p-6 bg-white dark:bg-slate-950 rounded-xl border shadow-sm">
          <h2 className="text-2xl font-bold">Welcome, Admin ({user.name})!</h2>
          <p className="text-muted-foreground mt-1">
            Manage system services, categories, and users from the sidebar menu.
          </p>
        </div>
      )}
    </div>
  );
}
