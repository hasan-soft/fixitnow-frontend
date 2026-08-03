"use client";

import React, { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import {
  Users,
  Search,
  Loader2,
  AlertCircle,
  ShieldCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AxiosError } from "axios";

type UserStatus = "ACTIVE" | "BLOCKED";

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
  isBanned?: boolean;
  status?: UserStatus;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        const response = await axiosInstance.get("/admin/users");
        const fetchedData = response.data?.data || response.data || [];
        if (isMounted) {
          setUsers(Array.isArray(fetchedData) ? fetchedData : []);
        }
      } catch (error: unknown) {
        console.error("Fetch users error:", error);
        const err = error as AxiosError<{ message?: string }>;
        if (isMounted) {
          toast.error(
            err.response?.data?.message || "Failed to load registered users.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Ban/Unban Handler
  const handleToggleBan = async (user: User) => {
    const userId = user.id || user._id;
    if (!userId) return;

    setActionLoadingId(userId);

    const isCurrentlyBlocked = user.isBanned || user.status === "BLOCKED";

    const nextStatus: UserStatus = isCurrentlyBlocked ? "ACTIVE" : "BLOCKED";

    try {
      const response = await axiosInstance.patch(`/admin/users/${userId}`, {
        status: nextStatus,
      });

      if (response.data?.success || response.status === 200) {
        toast.success(`User status updated to ${nextStatus}!`);

        // UI Update
        setUsers((prev) =>
          prev.map((u) => {
            if ((u.id || u._id) === userId) {
              return {
                ...u,
                isBanned: nextStatus === "BLOCKED",
                status: nextStatus,
              };
            }
            return u;
          }),
        );
      }
    } catch (error: unknown) {
      console.error("Ban toggle error:", error);
      const err = error as AxiosError<{ message?: string }>;
      toast.error(
        err.response?.data?.message || "Could not update user status.",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Search Filter
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> User Moderation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage user roles, monitor accounts, and toggle ban permissions.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <span className="text-xs text-slate-500">
          Total Users:{" "}
          <strong className="text-slate-800 dark:text-slate-200">
            {filteredUsers.length}
          </strong>
        </span>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            No Users Found
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Try searching with a different name or email address.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 uppercase text-xs font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedUsers.map((user) => {
                  const uId = user.id || user._id || "";
                  const isBlocked = user.isBanned || user.status === "BLOCKED";

                  return (
                    <tr
                      key={uId}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              : user.role === "TECHNICIAN"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="p-4">
                        {isBlocked ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                            BLOCKED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            ACTIVE
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-xs text-slate-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td className="p-4 text-right">
                        {user.role === "ADMIN" ? (
                          <span className="text-xs text-slate-400 italic">
                            Protected
                          </span>
                        ) : actionLoadingId === uId ? (
                          <Loader2 className="h-5 w-5 animate-spin text-primary ml-auto" />
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className={`text-xs gap-1 ${
                              isBlocked
                                ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                : "border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            }`}
                            onClick={() => handleToggleBan(user)}
                          >
                            {isBlocked ? (
                              <>
                                <ShieldCheck className="h-3.5 w-3.5" /> Unban
                              </>
                            ) : (
                              <>
                                <UserX className="h-3.5 w-3.5" /> Ban User
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
