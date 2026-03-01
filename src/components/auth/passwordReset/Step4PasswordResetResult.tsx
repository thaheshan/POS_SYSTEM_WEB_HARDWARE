"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { PasswordResetStatus } from "@/types/user";

interface Step4Props {
  status: PasswordResetStatus;
}

export default function Step4PasswordResetResult({ status }: Step4Props) {
  const isSuccess = status === "success";

  return (
    <div className="w-full text-center px-4 pb-4">
      {/* Result icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-[#059669] flex items-center justify-center shadow-sm">
          <Check strokeWidth={3} className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Result message */}
      <h2 className="text-xl font-bold text-gray-900 mb-8">
        Password Reset Successful!
      </h2>

      {/* What's Next List */}
      <div className="mb-10 text-left max-w-[280px] mx-auto">
        <h3 className="text-sm font-bold text-gray-900 mb-6 text-center">
          What's Next?
        </h3>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="w-7 h-7 rounded-sm flex-shrink-0 bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center">
              1
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900 leading-tight mb-1">
                Invite Team Members
              </p>
              <p className="text-[11px] text-gray-500 leading-snug">
                Add your staff members as Admin or Cashier
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="w-7 h-7 rounded-sm flex-shrink-0 bg-green-100 text-green-600 font-bold text-sm flex items-center justify-center">
              2
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900 leading-tight mb-1">
                Add Your Products
              </p>
              <p className="text-[11px] text-gray-500 leading-snug">
                Upload your inventory and product details
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="w-7 h-7 rounded-sm flex-shrink-0 bg-orange-100 text-orange-500 font-bold text-sm flex items-center justify-center">
              3
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900 leading-tight mb-1">
                Start Selling
              </p>
              <p className="text-[11px] text-gray-500 leading-snug">
                Open POS and process your first sale
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mx-auto max-w-sm mb-6">
        <Link
          href="/auth/login"
          className="block w-full bg-[#1855e3] hover:bg-[#1447c2] text-white py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        >
          Back to Login
        </Link>
      </div>

      {/* Help text */}
      <div className="text-[11px] text-gray-500 mt-8">
        Need help? Check our <br />
        <Link href="#" className="flex justify-center mt-1">
          <span className="text-[#1855e3] font-semibold hover:underline">
            Getting Started Guide
          </span>
        </Link>
      </div>
    </div>
  );
}
