"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { User } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { axiosInstance } from "@/lib/axios";

export default function Navbar() {
    const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          return;
        } catch {
  
          localStorage.removeItem("user");
        }
      }
      const token = Cookies.get("token");
      if (token) {
        try {
          const res = await axiosInstance.get("/auth/me");
          if (res.data?.data) {
            setUser(res.data.data);
            localStorage.setItem("user", JSON.stringify(res.data.data));
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();

    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("refreshToken");

    setUser(null);
    toast.success("Logged out successfully");
    router.push("/login");
    router.refresh();
  };

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }
  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-primary">
              FixItNow
            </span>
            <Badge variant="secondary" className="font-semibold">
              Services
            </Badge>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link
              href="/services"
              className="hover:text-primary transition-colors"
            >
              Browse Services
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth Buttons / Profile */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium hidden sm:inline">
                  Hi, {user.name || "User"} ({user.role})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
