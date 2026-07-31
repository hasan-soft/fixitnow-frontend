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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function TechnicianDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadBookings = async (isMounted = true) => {
    try {
      const res = await axiosInstance.get("/bookings/technician");
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
      const res = await axiosInstance.patch(`/bookings/${id}/status`, {
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
            List of tasks assigned to you by the administration.
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
                    <TableHead className="text-right">Update Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => {
                    const bookingId = booking.id || booking._id || "";

                    return (
                      <TableRow key={bookingId}>
                        <TableCell className="font-medium">
                          {booking.service?.name || "Service Job"}
                        </TableCell>
                        <TableCell>
                          <div>
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {booking.slotTime}
                          </div>
                        </TableCell>
                        <TableCell>
                          <BookingStatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Select
                              disabled={
                                updatingId === bookingId ||
                                booking.status === "COMPLETED" ||
                                booking.status === "CANCELLED"
                              }
                              onValueChange={(val) =>
                                handleStatusUpdate(
                                  bookingId,
                                  val as BookingStatus,
                                )
                              }
                              defaultValue={booking.status}
                            >
                              <SelectTrigger className="w-35">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ACCEPTED">Accept</SelectItem>
                                <SelectItem value="DECLINED">
                                  Decline
                                </SelectItem>
                                <SelectItem value="IN_PROGRESS">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="COMPLETED">
                                  Completed
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            {updatingId === bookingId && (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            )}
                          </div>
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
