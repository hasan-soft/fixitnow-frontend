"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/auth";
import { Loader2 } from "lucide-react";

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
  const router = useRouter();

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

  useEffect(() => {
    if (!user) return;

    const role = user.role?.toUpperCase();

    if (role === "CUSTOMER") {
      router.replace("/dashboard/customer");
    } else if (role === "TECHNICIAN") {
      router.replace("/dashboard/technician");
    } else if (role === "ADMIN") {
      router.replace("/dashboard/admin");
    }
  }, [user, router]);

  return (
    <div className="flex h-[60vh] w-full items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span>Redirecting to your dashboard...</span>
    </div>
  );
}
