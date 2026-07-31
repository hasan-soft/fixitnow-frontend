"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { axiosInstance } from "@/lib/axios";
import { Booking } from "@/types/booking";
import BookingStatusBadge from "@/components/shared/BookingStatusBadge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Calendar, Users, Wrench } from "lucide-react";

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAllBookings = async () => {
      try {
        const res = await axiosInstance.get("/bookings/admin/all");
        if (isMounted && res.data.success) {
          setBookings(res.data.data);
        }
      } catch (error: unknown) {
        if (isMounted) {
          let errorMessage = "Failed to load all bookings";
          if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.message || errorMessage;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          toast.error(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAllBookings();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(
    (b) => b.status === "REQUESTED",
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === "COMPLETED",
  ).length;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">
          System-wide performance and booking management
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingBookings}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Jobs
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {completedBookings}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Booking Requests</CardTitle>
          <CardDescription>
            All customer bookings across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const bookingId = booking.id || booking._id || "";
                  return (
                    <TableRow key={bookingId}>
                      <TableCell className="font-medium">
                        {booking.service?.name || "Service"}
                      </TableCell>
                      <TableCell>
                        <div>
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.slotTime}
                        </div>
                      </TableCell>
                      <TableCell>৳{booking.totalAmount}</TableCell>
                      <TableCell>
                        <BookingStatusBadge status={booking.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
