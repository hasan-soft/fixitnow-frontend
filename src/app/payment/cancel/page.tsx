"use client";

import { useRouter } from "next/navigation";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-950 border rounded-2xl p-8 text-center shadow-xl space-y-6">
        <div className="h-20 w-20 bg-rose-100 dark:bg-rose-950/50 text-rose-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-rose-50 dark:ring-rose-900/20">
          <XCircle className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Payment Cancelled</h1>
          <p className="text-sm text-muted-foreground">
            The checkout session was cancelled. You can safely retry payment
            from your dashboard.
          </p>
        </div>

        <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/customer")}
            className="flex-1 gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Button>
          <Button
            onClick={() => router.push("/dashboard/customer")}
            className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
