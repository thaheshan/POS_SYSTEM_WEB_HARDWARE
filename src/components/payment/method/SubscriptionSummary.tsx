import React from "react";
import { Info } from "lucide-react";

export default function SubscriptionSummary() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700 font-medium">Professional Plan</span>
          <span className="text-gray-900 font-bold">Rs. 25,000</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400 text-sm">Billing Period</span>
          <span className="text-gray-700 text-sm font-medium">Monthly</span>
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
          <span className="text-gray-900 font-bold text-lg">Due Today</span>
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
  );
}
