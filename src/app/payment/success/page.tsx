"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("booking_id");

  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId || !bookingId) {
        setIsVerifying(false);
        return;
      }

      try {
        await axiosInstance.post("/payments/confirm", {
          sessionId,
          bookingId,
        });
      } catch (err) {
        console.error("Error confirming payment:", err);
      } finally {
        setIsVerifying(false);
      }
    };

    confirmPayment();
  }, [sessionId, bookingId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-950 border rounded-2xl p-8 text-center shadow-xl space-y-6">
        {isVerifying ? (
          <div className="space-y-4 py-8">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Verifying payment status...
            </p>
          </div>
        ) : (
          <>
            <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Payment Successful!</h1>
              <p className="text-sm text-muted-foreground">
                Thank you! Your payment is processed and booking status is
                updated to <strong>PAID</strong>.
              </p>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={() => router.push("/dashboard/customer")}
                className="w-full gap-2 font-semibold"
              >
                Go to Customer Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
