"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Play,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Cookies from "js-cookie";

type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "PAID"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

interface Booking {
  id: string;
  service: {
    name: string;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  timeSlot: string;
  bookingDate: string;
  status: BookingStatus;
  totalAmount: number;
}

export default function TechnicianBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const getApiUrl = (endpoint: string) => {
    const baseUrl = (
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    ).replace(/\/$/, "");
    const cleanEndpoint = endpoint.replace(/^\//, "");
    return baseUrl.endsWith("/api")
      ? `${baseUrl}/${cleanEndpoint}`
      : `${baseUrl}/api/${cleanEndpoint}`;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchBookings = async () => {
      try {
        const token =
          Cookies.get("accessToken") ||
          Cookies.get("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token");

        const res = await fetch(getApiUrl("technicians/bookings"), {
          headers: {
            Authorization: token
              ? token.startsWith("Bearer ")
                ? token
                : `Bearer ${token}`
              : "",
          },
          credentials: "include",
        });

        const data = await res.json();

        if (isMounted) {
          if (data.success) {
            setBookings(data.data || []);
          } else {
            toast.error(data.message || "Failed to fetch bookings.");
          }
        }
      } catch (error) {
        console.error("Fetch bookings error:", error);
        if (isMounted) {
          toast.error("Could not load bookings.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBookings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusUpdate = async (
    bookingId: string,
    newStatus: BookingStatus,
  ) => {
    setActionLoadingId(bookingId);

    try {
      const token =
        Cookies.get("accessToken") ||
        Cookies.get("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      const res = await fetch(getApiUrl(`technicians/bookings/${bookingId}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
            ? token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`
            : "",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Booking status updated to ${newStatus}`);
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: newStatus } : b,
          ),
        );
      } else {
        toast.error(data.message || "Failed to update booking status.");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // UI Status Badges
  const renderStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "REQUESTED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            REQUESTED
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            ACCEPTED
          </span>
        );
      case "DECLINED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            DECLINED
          </span>
        );
      case "PAID":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            PAID
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            IN PROGRESS
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            COMPLETED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-200">
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Booking Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage incoming customer service requests and update job progress.
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            No Bookings Found
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            You don&apos;t have any booking requests at the moment.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 uppercase text-xs font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {booking.customer.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {booking.customer.phone || booking.customer.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                      {booking.service.name}
                    </td>

                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {booking.timeSlot}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                      TK{booking.totalAmount}
                    </td>

                    <td className="p-4">{renderStatusBadge(booking.status)}</td>

                    <td className="p-4 text-right">
                      {actionLoadingId === booking.id ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary ml-auto" />
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {booking.status === "REQUESTED" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs gap-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                                onClick={() =>
                                  handleStatusUpdate(booking.id, "ACCEPTED")
                                }
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs gap-1 border-red-500 text-red-600 hover:bg-red-50"
                                onClick={() =>
                                  handleStatusUpdate(booking.id, "DECLINED")
                                }
                              >
                                <XCircle className="h-3.5 w-3.5" /> Decline
                              </Button>
                            </>
                          )}

                          {booking.status === "PAID" && (
                            <Button
                              size="sm"
                              className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() =>
                                handleStatusUpdate(booking.id, "IN_PROGRESS")
                              }
                            >
                              <Play className="h-3.5 w-3.5 fill-current" />{" "}
                              Start Job
                            </Button>
                          )}

                          {booking.status === "IN_PROGRESS" && (
                            <Button
                              size="sm"
                              className="text-xs gap-1 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                              onClick={() =>
                                handleStatusUpdate(booking.id, "COMPLETED")
                              }
                            >
                              <Check className="h-3.5 w-3.5" /> Complete Job
                            </Button>
                          )}

                          {[
                            "ACCEPTED",
                            "DECLINED",
                            "COMPLETED",
                            "CANCELLED",
                          ].includes(booking.status) && (
                            <span className="text-xs text-slate-400 italic">
                              No action needed
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
