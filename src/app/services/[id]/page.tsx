"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AvailabilitySlot {
  id: string;
  slot: string;
}

interface Service {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  technicianProfileId?: string;
  technicianProfile?: {
    id: string;
    availabilitySlots?: AvailabilitySlot[];
  };
  category?: {
    name: string;
  };
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Booking Form States
  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await axiosInstance.get(`/services/${serviceId}`);
        const serviceData = res.data?.data || res.data;

        if (serviceData) {
          setService(serviceData);
          const availableSlots: AvailabilitySlot[] =
            serviceData.technicianProfile?.availabilitySlots || [];

          setTimeSlot(availableSlots.length > 0 ? availableSlots[0].slot : "");
        }
      } catch (error: unknown) {
        let errorMessage = "Failed to load service details";
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || errorMessage;
        }
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const slots = service?.technicianProfile?.availabilitySlots || [];
  const hasSlots = slots.length > 0;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingDate) {
      toast.error("Please select a date for booking");
      return;
    }

    if (!hasSlots) {
      toast.error("This technician has no available time slots right now");
      return;
    }

    if (!timeSlot) {
      toast.error("Please select an available time slot");
      return;
    }
    const isStillValid = slots.some((s) => s.slot === timeSlot);
    if (!isStillValid) {
      toast.error(
        "Selected time slot is no longer available. Please choose another.",
      );
      setTimeSlot(slots[0]?.slot || "");
      return;
    }

    const techId =
      service?.technicianProfileId || service?.technicianProfile?.id;

    if (!techId) {
      toast.error("Technician profile not associated with this service.");
      return;
    }

    setBookingLoading(true);

    try {
      const res = await axiosInstance.post("/bookings", {
        serviceId: service?.id || service?._id || serviceId,
        technicianProfileId: techId,
        bookingDate,
        timeSlot,
      });

      if (res.data.success) {
        toast.success("Booking request created successfully!");
        router.push("/dashboard/customer");
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to create booking";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
        <Button variant="outline" onClick={() => router.push("/services")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Services
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.push("/services")}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Services
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Service Overview */}
        <div className="md:col-span-2 space-y-6">
          <div>
            {service.category?.name && (
              <Badge variant="secondary" className="mb-2">
                {service.category.name}
              </Badge>
            )}
            <h1 className="text-3xl font-extrabold tracking-tight">
              {service.name}
            </h1>
            <p className="text-2xl font-bold text-primary mt-2">
              ৳{service.price}
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-semibold">Service Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {service.description ||
                "Get top-notch home maintenance and repair services handled by certified professionals."}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border space-y-2 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> Professional
              & Certified Technicians
            </div>
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> Transparent
              Pricing with No Hidden Charges
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div>
          <Card className="shadow-md sticky top-24">
            <CardHeader>
              <CardTitle>Schedule Appointment</CardTitle>
              <CardDescription>Select date & time for service</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slot" className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> Time Slot
                  </Label>

                  {hasSlots ? (
                    <select
                      id="slot"
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    >
                      {slots.map((s) => (
                        <option key={s.id} value={s.slot}>
                          {s.slot}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground border rounded-md px-3 py-2.5 bg-slate-50 dark:bg-slate-900">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      No available time slots for this technician right now.
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={bookingLoading || !hasSlots}
                >
                  {bookingLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : !hasSlots ? (
                    "No Slots Available"
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
