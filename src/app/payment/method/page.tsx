"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Landmark,
  Smartphone,
  FileText,
  Info,
  ShieldCheck,
  Shield,
  RotateCcw,
  Headset,
} from "lucide-react";
import CheckoutHeader from "@/components/payment/CheckoutHeader";

export default function PaymentMethodPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string>("card");

  const handleContinue = () => {
    if (selectedMethod === "card") {
      router.push("/payment/card");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <CheckoutHeader step={3} totalSteps={4} backLink="/dashboard" />

      <main className="flex-grow flex flex-col items-center py-10 px-4 sm:px-6">
        {/* Top Icon and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#128C7E] rounded-full flex items-center justify-center mb-4 shadow-sm">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 font-sans tracking-tight">
            Payment Method
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Choose how you&apos;d like to pay
          </p>
        </div>

        <div className="w-full max-w-2xl space-y-6">
          {/* Order Summary Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">
                  Professional Plan
                </span>
                <span className="text-gray-900 font-bold">Rs. 25,000</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-sm">Billing Period</span>
                <span className="text-gray-700 text-sm font-medium">
                  Monthly
                </span>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-[#128C7E] font-medium text-sm">
                  30-Day Free Trial
                </span>
                <span className="text-[#128C7E] font-medium text-sm">
                  -Rs. 25,000
                </span>
              </div>

              <hr className="border-gray-100 mb-4" />

              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-900 font-bold text-lg">
                  Due Today
                </span>
                <span className="text-blue-600 font-bold text-xl">Rs. 0</span>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800 text-sm font-medium">
                  First payment of Rs. 25,000 due on Feb 19, 2026
                </p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3 px-1">
              Select Payment Method
            </h3>

            <div className="space-y-3">
              {/* Credit / Debit Card */}
              <label
                className={`relative flex items-center p-5 border rounded-xl cursor-pointer transition-all ${
                  selectedMethod === "card"
                    ? "border-blue-600 bg-white ring-1 ring-blue-600 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-[#2563EB] rounded-lg flex items-center justify-center mr-4">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-grow">
                  <div className="font-bold text-gray-900 text-base">
                    Credit / Debit Card
                  </div>
                  <div className="text-gray-500 text-xs mb-2 mt-0.5">
                    Visa, Mastercard, Amex
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold text-[#1434CB] bg-[#F0F4FF] rounded">
                      VISA
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold text-[#EB001B] bg-[#FFF0F0] rounded">
                      MC
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold text-[#006FCF] bg-[#F0F8FF] rounded">
                      AMEX
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === "card"
                        ? "border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedMethod === "card" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment_method"
                  value="card"
                  checked={selectedMethod === "card"}
                  onChange={() => {
                    setSelectedMethod("card");
                    router.push("/payment/card");
                  }}
                  className="sr-only"
                />
              </label>

              {/* Bank Transfer */}
              <label
                className={`relative flex items-center p-5 border rounded-xl cursor-pointer transition-all ${
                  selectedMethod === "bank"
                    ? "border-blue-600 bg-white ring-1 ring-blue-600 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-[#059669] rounded-lg flex items-center justify-center mr-4">
                  <Landmark className="w-6 h-6 text-white" />
                </div>
                <div className="flex-grow">
                  <div className="font-bold text-gray-900 text-base">
                    Bank Transfer
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    Direct bank deposit
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === "bank"
                        ? "border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedMethod === "bank" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment_method"
                  value="bank"
                  checked={selectedMethod === "bank"}
                  onChange={() => setSelectedMethod("bank")}
                  className="sr-only"
                />
              </label>

              {/* Mobile Payment */}
              <label
                className={`relative flex items-center p-5 border rounded-xl cursor-pointer transition-all ${
                  selectedMethod === "mobile"
                    ? "border-blue-600 bg-white ring-1 ring-blue-600 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-[#FF5722] rounded-lg flex items-center justify-center mr-4">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-grow">
                  <div className="font-bold text-gray-900 text-base">
                    Mobile Payment
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    FriMi, eZ Cash, genie
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === "mobile"
                        ? "border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedMethod === "mobile" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment_method"
                  value="mobile"
                  checked={selectedMethod === "mobile"}
                  onChange={() => setSelectedMethod("mobile")}
                  className="sr-only"
                />
              </label>

              {/* Pay by Invoice */}
              <label
                className={`relative flex items-center p-5 border rounded-xl cursor-pointer transition-all ${
                  selectedMethod === "invoice"
                    ? "border-blue-600 bg-white ring-1 ring-blue-600 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-[#64748B] rounded-lg flex items-center justify-center mr-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-grow">
                  <div className="font-bold text-gray-900 text-base">
                    Pay by Invoice
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    Receive invoice via email
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === "invoice"
                        ? "border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedMethod === "invoice" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment_method"
                  value="invoice"
                  checked={selectedMethod === "invoice"}
                  onChange={() => setSelectedMethod("invoice")}
                  className="sr-only"
                />
              </label>
            </div>

            {selectedMethod === "card" && (
              <div className="mt-6 flex justify-end">
              
              </div>
            )}

            {/* Encryption Alert */}
            <div className="mt-6 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-4 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#059669] flex-shrink-0" />
              <p className="text-[#065F46] text-xs font-medium">
                Your payment information is encrypted and secure. We never store
                your card details.
              </p>
            </div>
          </div>
        </div>

        {/* Footer features */}
        <div className="mt-12 flex justify-center gap-8 text-xs font-semibold text-gray-600 pb-8">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#059669]" />
            <span>30-Day Money Back</span>
          </div>
          <div className="flex items-center gap-2">
            <Headset className="w-4 h-4 text-[#FF5722]" />
            <span>24/7 Support</span>
          </div>
        </div>
      </main>
    </div>
  );
}
