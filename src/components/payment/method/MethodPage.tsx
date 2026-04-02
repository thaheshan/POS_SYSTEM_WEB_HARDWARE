"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import CheckoutHeader from "@/components/payment/CheckoutHeader";
import PaymentMethodOptions from "@/components/payment/method/PaymentMethodOptions";
import SecurityFooter from "@/components/payment/method/SecurityFooter";
import SubscriptionSummary from "@/components/payment/method/SubscriptionSummary";

export default function PaymentMethodPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string>("card");

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    if (method === "card") {
      router.push("/payment/card");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <CheckoutHeader step={2} totalSteps={4} backLink="/dashboard" />

      <main className="flex-grow flex flex-col items-center py-10 px-4 sm:px-6 w-full max-w-2xl mx-auto">
        {/* Top Icon and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#128C7E] rounded-full flex items-center justify-center mb-4 shadow-sm">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Payment Method
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Choose how you&apos;d like to pay
          </p>
        </div>

        <div className="w-full space-y-6">
          <SubscriptionSummary />

          <PaymentMethodOptions
            selectedMethod={selectedMethod}
            onMethodSelect={handleMethodSelect}
          />
        </div>

        <SecurityFooter />
      </main>
    </div>
  );
}