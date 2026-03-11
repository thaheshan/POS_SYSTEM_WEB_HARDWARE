import React from "react";
import {
  CreditCard,
  Landmark,
  Smartphone,
  FileText,
  ShieldCheck,
} from "lucide-react";

interface PaymentMethodOptionsProps {
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
}

export default function PaymentMethodOptions({
  selectedMethod,
  onMethodSelect,
}: PaymentMethodOptionsProps) {
  return (
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
            onChange={() => onMethodSelect("card")}
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
            onChange={() => onMethodSelect("bank")}
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
            onChange={() => onMethodSelect("mobile")}
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
            onChange={() => onMethodSelect("invoice")}
            className="sr-only"
          />
        </label>
      </div>

      {/* Encryption Alert */}
      <div className="mt-6 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-4 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-[#059669] flex-shrink-0" />
        <p className="text-[#065F46] text-xs font-medium">
          Your payment information is encrypted and secure. We never store your
          card details.
        </p>
      </div>
    </div>
  );
}
