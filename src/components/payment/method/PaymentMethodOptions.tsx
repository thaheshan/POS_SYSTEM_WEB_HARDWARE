import React from "react";
import {
  CreditCard,
  Landmark,
  Smartphone,
  FileText,
  ShieldCheck,
} from "lucide-react";

interface PaymentMethodOptionsProps {
  selectedMethod: string | null;
  onMethodSelect: (method: string) => void;
}

export default function PaymentMethodOptions({
  selectedMethod,
  onMethodSelect,
}: PaymentMethodOptionsProps) {
  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 mb-3 px-1">
        Select Payment Method
      </h3>

      <div className="space-y-3">
        {/* Credit / Debit Card */}
        <label
          className={`relative flex items-center p-4 sm:p-5 border rounded-xl cursor-pointer transition-all duration-200 ${
            selectedMethod === "card"
              ? "border-blue-600 bg-white ring-2 ring-blue-100 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
          }`}
        >
          <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 bg-[#2563EB] rounded-lg flex items-center justify-center mr-3 sm:mr-4">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div className="flex-grow">
            <div className="font-bold text-slate-900 text-sm sm:text-base">
              Credit / Debit Card
            </div>
            <div className="text-slate-500 text-xs mb-2 mt-0.5">
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
                  : "border-slate-300"
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
            onChange={() => onMethodSelect("card")}
            className="sr-only"
          />
        </label>

        {/* Bank Transfer */}
        <label
          className={`relative flex items-center p-4 sm:p-5 border rounded-xl transition-all duration-200 opacity-50 cursor-not-allowed ${
            selectedMethod === "bank"
              ? "border-blue-600 bg-white ring-2 ring-blue-100 shadow-sm"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 bg-[#059669] rounded-lg flex items-center justify-center mr-3 sm:mr-4">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div className="flex-grow">
            <div className="font-bold text-slate-900 text-sm sm:text-base">
              Bank Transfer
            </div>
            <div className="text-slate-500 text-xs mt-0.5">
              Direct bank deposit
            </div>
            <div className="mt-2">
              <span className="px-3 py-1 text-xs font-bold text-amber-600 bg-amber-100 rounded-full">
                Coming soon
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === "bank"
                  ? "border-blue-600"
                  : "border-slate-300"
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
            onChange={() => onMethodSelect("bank")}
            disabled={true}
            className="sr-only"
          />
        </label>

        {/* Mobile Payment */}
        <label
          className={`relative flex items-center p-4 sm:p-5 border rounded-xl transition-all duration-200 opacity-50 cursor-not-allowed ${
            selectedMethod === "mobile"
              ? "border-blue-600 bg-white ring-2 ring-blue-100 shadow-sm"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 bg-[#FF5722] rounded-lg flex items-center justify-center mr-3 sm:mr-4">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-grow">
            <div className="font-bold text-slate-900 text-sm sm:text-base">
              Mobile Payment
            </div>
            <div className="text-slate-500 text-xs mt-0.5">
              FriMi, eZ Cash, genie
            </div>
            <div className="mt-2">
              <span className="px-3 py-1 text-xs font-bold text-amber-600 bg-amber-100 rounded-full">
                Coming soon
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === "mobile"
                  ? "border-blue-600"
                  : "border-slate-300"
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
            onChange={() => onMethodSelect("mobile")}
            disabled={true}
            className="sr-only"
          />
        </label>

        {/* Pay by Invoice */}
        <label
          className={`relative flex items-center p-4 sm:p-5 border rounded-xl transition-all duration-200 opacity-50 cursor-not-allowed ${
            selectedMethod === "invoice"
              ? "border-blue-600 bg-white ring-2 ring-blue-100 shadow-sm"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 bg-[#64748B] rounded-lg flex items-center justify-center mr-3 sm:mr-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-grow">
            <div className="font-bold text-slate-900 text-sm sm:text-base">
              Pay by Invoice
            </div>
            <div className="text-slate-500 text-xs mt-0.5">
              Receive invoice via email
            </div>
            <div className="mt-2">
              <span className="px-3 py-1 text-xs font-bold text-amber-600 bg-amber-100 rounded-full">
                Coming soon
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === "invoice"
                  ? "border-blue-600"
                  : "border-slate-300"
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
            onChange={() => onMethodSelect("invoice")}
            disabled={true}
            className="sr-only"
          />
        </label>
      </div>

      {/* Encryption Alert */}
      <div className="mt-6 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#059669] flex-shrink-0" />
        <p className="text-[#065F46] text-xs sm:text-sm font-medium leading-relaxed">
          Your payment information is encrypted and secure. We never store your
          card details.
        </p>
      </div>
    </div>
  );
}
