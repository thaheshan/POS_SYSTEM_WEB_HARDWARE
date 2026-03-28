"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import CheckoutHeader from "@/components/payment/CheckoutHeader";
import SubscriptionSummary from "@/components/payment/method/SubscriptionSummary";
import PaymentMethodOptions from "@/components/payment/method/PaymentMethodOptions";
import SecurityFooter from "@/components/payment/method/SecurityFooter";

export default function PaymentMethodPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState("");
  const [errorAttemptCount, setErrorAttemptCount] = useState(0);

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    if (selectionError) {
      setSelectionError("");
    }
  };

  const handleContinue = () => {
    if (!selectedMethod) {
      setSelectionError("Please select a payment method to continue.");
      setErrorAttemptCount((prev) => prev + 1);
      return;
    }

    if (selectedMethod === "card") {
      router.push("/payment/card");
      return;
    }

    router.push("/payment/processing");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <CheckoutHeader step={3} totalSteps={4} backLink="/dashboard" />

      <main className="flex-grow flex flex-col items-center py-8 md:py-10 px-4 sm:px-6">
        {/* Top Icon and Title */}
        <div className="flex flex-col items-center mb-8 md:mb-10 text-center">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-[#128C7E] rounded-full flex items-center justify-center mb-4 shadow-md shadow-emerald-500/25">
            <CreditCard className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight leading-tight">
            Payment Method
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium">
            Choose how you&apos;d like to pay
          </p>
        </div>

        <div className="w-full max-w-3xl space-y-6">
          <SubscriptionSummary />

          <PaymentMethodOptions
            selectedMethod={selectedMethod}
            onMethodSelect={handleMethodSelect}
          />

          <button
            type="button"
            onClick={handleContinue}
            className="w-full h-12 md:h-14 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-sm md:text-base font-semibold shadow-[0_8px_24px_rgba(5,150,105,0.28)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 active:scale-[0.99]"
          >
            Continue
          </button>

          {selectionError && (
            <p
              key={`selection-error-${errorAttemptCount}`}
              className="text-sm text-red-600 font-medium inline-error-animate"
              role="alert"
            >
              {selectionError}
            </p>
          )}
        </div>

        <SecurityFooter />
      </main>
    </div>
  );
}
