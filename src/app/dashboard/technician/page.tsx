"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { axiosInstance } from "@/lib/axios";
import { Booking, BookingStatus } from "@/types/booking";
import BookingStatusBadge from "@/components/shared/BookingStatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Play, CheckCheck } from "lucide-react";

export default function TechnicianDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadBookings = async (isMounted = true) => {
    try {
      const res = await axiosInstance.get("/technicians/bookings");
      if (isMounted && res.data.success) {
        setBookings(res.data.data);
      }
    } catch (error: unknown) {
      if (isMounted) {
        let errorMessage = "Failed to load assigned bookings";
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

  useEffect(() => {
    let isMounted = true;

    const initFetch = async () => {
      await loadBookings(isMounted);
    };

    initFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: BookingStatus) => {
    setUpdatingId(id);
    try {
      const res = await axiosInstance.patch(`/technicians/bookings/${id}`, {
        status: newStatus,
      });
      if (res.data.success) {
        toast.success(`Booking status updated to ${newStatus}`);
        await loadBookings();
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to update status";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setUpdatingId(null);
    }
  };

  
  const renderActionButtons = (
    bookingId: string,
    currentStatus: BookingStatus,
  ) => {
    const isUpdating = updatingId === bookingId;

    switch (currentStatus) {
      case "REQUESTED":
        return (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs gap-1"
              disabled={isUpdating}
              onClick={() =>
                handleStatusUpdate(bookingId, "ACCEPTED" as BookingStatus)
              }
            >
              {isUpdating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs gap-1"
              disabled={isUpdating}
              onClick={() =>
                handleStatusUpdate(bookingId, "DECLINED" as BookingStatus)
              }
            >
              {isUpdating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              Decline
            </Button>
          </div>
        );

      case "ACCEPTED":
        return (
          <span className="text-xs text-amber-600 font-medium italic">
            Waiting for Customer Payment
          </span>
        );

      case "PAID":
        return (
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 h-8 text-xs gap-1"
            disabled={isUpdating}
            onClick={() =>
              handleStatusUpdate(bookingId, "IN_PROGRESS" as BookingStatus)
            }
          >
            {isUpdating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            Start Job
          </Button>
        );

      case "IN_PROGRESS":
        return (
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 h-8 text-xs gap-1"
            disabled={isUpdating}
            onClick={() =>
              handleStatusUpdate(bookingId, "COMPLETED" as BookingStatus)
            }
          >
            {isUpdating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Complete Job
          </Button>
        );

      case "COMPLETED":
        return (
          <span className="text-xs text-muted-foreground font-medium">
            Job Finished
          </span>
        );

      case "DECLINED":
      case "CANCELLED":
        return <span className="text-xs text-red-500 font-medium">Closed</span>;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Technician Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your assigned service jobs and update work status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Jobs</CardTitle>
          <CardDescription>
            List of tasks assigned to you by the platform customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                No jobs assigned to you yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Current Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => {
                    const bookingId = booking.id || booking._id || "";

                    return (
                      <TableRow key={bookingId}>
                        <TableCell className="font-medium">
                          {booking.service?.name || "Home Service Job"}
                        </TableCell>
                        <TableCell>
                          <div>
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {booking.timeSlot}
                          </div>
                        </TableCell>
                        <TableCell>
                          <BookingStatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          {renderActionButtons(bookingId, booking.status)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
