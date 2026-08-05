"use client";

import { useState } from "react";
import axios from "axios";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentButtonProps {
  bookingId: string;
  bookingStatus: string;
}

export default function PaymentButton({
  bookingId,
  bookingStatus,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  if (bookingStatus !== "ACCEPTED") return null;

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/payments/create", {
        bookingId,
      });

      const checkoutUrl: string | undefined = res.data?.data;

      if (res.data?.success && checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Failed to generate Stripe checkout link.");
      }
    } catch (error: unknown) {
      console.error("Payment error:", error);
      let errorMessage = "Something went wrong initiating payment.";

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

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium"
      size="sm"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <CreditCard className="h-4 w-4" /> Pay Now
        </>
      )}
    </Button>
  );
}
