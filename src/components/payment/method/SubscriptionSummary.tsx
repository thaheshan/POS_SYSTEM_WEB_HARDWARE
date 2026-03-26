import React from "react";
import { Info } from "lucide-react";

export default function SubscriptionSummary() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
          Order Summary
        </h2>

        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-700 font-medium text-sm sm:text-base">
            Professional Plan
          </span>
          <span className="text-slate-900 font-bold text-sm sm:text-base">
            Rs. 25,000
          </span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-400 text-xs sm:text-sm">
            Billing Period
          </span>
          <span className="text-slate-700 text-xs sm:text-sm font-medium">
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

        <hr className="border-slate-100 mb-4" />

        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-900 font-bold text-base sm:text-lg">
            Due Today
          </span>
          <span className="text-blue-600 font-bold text-lg sm:text-xl">
            Rs. 0
          </span>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-xs sm:text-sm font-medium leading-relaxed">
            First payment of Rs. 25,000 due on Feb 19, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
