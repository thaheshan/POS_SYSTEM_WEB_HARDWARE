import React from "react";
import { Lock } from "lucide-react";

interface OrderSummaryProps {
  amount: string;
  buttonText: string;
  disabled?: boolean;
}

export default function OrderSummary({
  amount,
  buttonText,
  disabled = false,
}: OrderSummaryProps) {
  return (
    <div className="pt-6 mt-4 border-t border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-500 font-medium text-sm">Amount to Pay</span>
        <span className="text-blue-600 font-bold text-lg">{amount}</span>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-4 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] disabled:shadow-none transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <Lock className="w-5 h-5" />
        {buttonText}
      </button>
    </div>
  );
}
