"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutHeader from "@/components/payment/CheckoutHeader";
import {
  CreditCard,
  User,
  Calendar,
  Lock,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function CardDetailsPage() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState("1234 5678 9012 3456");
  const [cardName, setCardName] = useState("JOHN SILVA");
  const [expiry, setExpiry] = useState("12/26");
  const [cvv, setCvv] = useState("123");

  const [sameAddress, setSameAddress] = useState(true);
  const [saveCard, setSaveCard] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/payment/processing");
  };

  // Utility to format card number for display
  const displayCardNumber = cardNumber
    .padEnd(19, "•")
    .replace(/ /g, " • ")
    .substring(0, 31);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans mb-10">
      <CheckoutHeader step={3} totalSteps={4} backLink="/payment/method" />

      <main className="flex-grow flex flex-col items-center py-10 px-4 sm:px-6 w-full max-w-3xl mx-auto">
        {/* Card Mockup */}
        <div className="w-full max-w-sm mb-10 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden bg-gradient-to-tr from-[#1E3A8A] via-[#2563EB] to-[#3B82F6]">
          {/* Chip */}
          <div className="w-12 h-9 bg-yellow-400 rounded-md mb-8 flex -space-x-1 opacity-90 overflow-hidden">
            <div className="w-1/3 h-full border-r border-yellow-500"></div>
            <div className="w-1/3 h-full border-r border-yellow-500"></div>
            <div className="w-1/3 h-full"></div>
          </div>

          <div className="font-mono text-xl tracking-widest mb-6 opacity-90">
            {cardNumber || "•••• •••• •••• ••••"}
          </div>

          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">
                Card Holder
              </div>
              <div className="font-bold text-sm tracking-wide bg-transparent uppercase">
                {cardName || "YOUR NAME"}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">
                Valid Thru
              </div>
              <div className="font-bold text-sm tracking-wide">
                {expiry || "MM/YY"}
              </div>
            </div>

            {/* Visa Logo Mock */}
            <div className="bg-white/20 px-3 py-1 rounded bg-opacity-20 backdrop-blur-sm">
              <span className="font-extrabold italic text-lg tracking-tighter">
                VISA
              </span>
            </div>
          </div>
        </div>

        {/* Card Form */}
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4 tracking-tight">
                Card Information
              </h3>

              <div className="space-y-4">
                {/* Card Number */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Card Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <CreditCard className="absolute left-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full pl-11 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-medium text-gray-900"
                      required
                    />
                    <div className="absolute right-3 bg-gray-200 px-2 py-0.5 rounded text-xs font-bold text-gray-600">
                      VISA
                    </div>
                  </div>
                </div>

                {/* Card Name */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Cardholder Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) =>
                        setCardName(e.target.value.toUpperCase())
                      }
                      placeholder="JOHN SILVA"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-medium text-gray-900 uppercase"
                      required
                    />
                  </div>
                </div>

                {/* Expiry and CVV Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Calendar className="absolute left-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-medium text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      CVV <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        maxLength={3}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-medium text-gray-900 tracking-widest"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-base font-bold text-gray-900 mb-4 tracking-tight">
                Billing Address
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                      sameAddress
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300 bg-white group-hover:border-blue-500"
                    }`}
                  >
                    {sameAddress && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Same as shop address
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={sameAddress}
                    onChange={() => setSameAddress(!sameAddress)}
                  />
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                      saveCard
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300 bg-white group-hover:border-blue-500"
                    }`}
                  >
                    {saveCard && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Save card for future payments
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={saveCard}
                    onChange={() => setSaveCard(!saveCard)}
                  />
                </label>

                <div className="bg-[#F8FAFC] rounded-lg p-3 flex items-center gap-2 border border-gray-100 mt-2 text-green-700 text-xs font-medium">
                  <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Your card details are encrypted using 256-bit SSL.
                </div>

                <label className="flex items-center gap-3 cursor-pointer group mt-4">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                      termsAgreed
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300 bg-white group-hover:border-blue-500"
                    }`}
                  >
                    {termsAgreed && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    I agree to the{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={termsAgreed}
                    onChange={() => setTermsAgreed(!termsAgreed)}
                  />
                </label>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-medium text-sm">
                  Amount to Pay
                </span>
                <span className="text-blue-600 font-bold text-lg">
                  Rs. 0 (Trial)
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Lock className="w-5 h-5" />
                Confirm & Start Trial
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
