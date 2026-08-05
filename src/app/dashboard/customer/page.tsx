"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { axiosInstance } from "@/lib/axios";
import { Booking } from "@/types/booking";
import BookingStatusBadge from "@/components/shared/BookingStatusBadge";
import { Button } from "@/components/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CustomerDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const loadData = async () => {
    try {
      const res = await axiosInstance.get("/bookings");
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to load bookings";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchMyBookings = async () => {
      try {
        const res = await axiosInstance.get("/bookings");
        if (isMounted && res.data.success) {
          setBookings(res.data.data);
        }
      } catch (error: unknown) {
        if (isMounted) {
          let errorMessage = "Failed to load bookings";
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

    fetchMyBookings();

    return () => {
      isMounted = false;
    };
  }, []);

  const requestCancelBooking = (id: string) => {
    setCancelTargetId(id);
  };

  const confirmCancelBooking = async () => {
    if (!cancelTargetId) return;

    setCancelling(true);
    try {
      const res = await axiosInstance.patch(
        `/bookings/${cancelTargetId}/cancel`,
      );
      if (res.data.success) {
        toast.success("Booking cancelled successfully!");
        loadData();
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to cancel booking";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setCancelling(false);
      setCancelTargetId(null);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track and manage your requested home services
          </p>
        </div>
        <Button asChild>
          <Link href="/services">Book New Service</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>
            A list of all your scheduled and completed service appointments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                No bookings found yet.
              </p>
              <Button asChild variant="outline">
                <Link href="/services">Browse Services</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => {
                    const bookingId = booking.id || booking._id || "";
                    const canCancel =
                      booking.status === "REQUESTED" ||
                      booking.status === "ACCEPTED";

                    return (
                      <TableRow key={bookingId}>
                        <TableCell className="font-medium">
                          {booking.service?.name || "Home Service"}
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
                          {booking.service?.price
                            ? `$${booking.service.price.toLocaleString()}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <BookingStatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {booking.status === "ACCEPTED" && (
                            <Button size="sm" variant="default" asChild>
                              <Link
                                href={`/dashboard/customer/bookings/${bookingId}/pay`}
                              >
                                Pay Now
                              </Link>
                            </Button>
                          )}

                          {booking.status === "COMPLETED" && (
                            <Button size="sm" variant="secondary" asChild>
                              <Link
                                href={`/dashboard/customer/reviews?bookingId=${bookingId}`}
                              >
                                Review
                              </Link>
                            </Button>
                          )}

                          {canCancel && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => requestCancelBooking(bookingId)}
                            >
                              Cancel
                            </Button>
                          )}
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

   
      <AlertDialog
        open={!!cancelTargetId}
        onOpenChange={(open) => {
          if (!open) setCancelTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your service request will be marked
              as cancelled and the technician will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelBooking}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Yes, Cancel Booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
