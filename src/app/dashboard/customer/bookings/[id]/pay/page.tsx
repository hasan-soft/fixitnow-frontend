"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PaymentButton from "@/components/PaymentButton";

export default function BookingPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <Card className="shadow-lg border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Checkout & Pay</CardTitle>
          <CardDescription>
            Complete your home service payment securely via Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-sm space-y-2 border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Booking Reference:</span>
              <span className="font-mono font-medium">
                #{bookingId.slice(-8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Gateway:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Stripe Hosted Checkout
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <PaymentButton bookingId={bookingId} bookingStatus="ACCEPTED" />

            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
