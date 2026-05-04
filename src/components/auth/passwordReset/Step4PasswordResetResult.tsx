"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { PasswordResetStatus } from "@/types/user";

interface Step4Props {
  status: PasswordResetStatus;
}

export default function Step4PasswordResetResult({ status }: Step4Props) {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200/80">
            <Check strokeWidth={3.5} className="w-9 h-9 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Password Reset Successful!
        </h2>
        <p className="text-base text-gray-600 mb-8">
          Your password has been updated. You can now log in with your new
          password.
        </p>

        <div className="mb-10 text-left max-w-md mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What's Next?
          </h3>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center">
                1
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight mb-1">
                  Invite Team Members
                </p>
                <p className="text-xs text-gray-600 leading-snug">
                  Add your staff members as Admin or Cashier
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-green-100 text-green-600 font-bold text-sm flex items-center justify-center">
                2
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight mb-1">
                  Add Your Products
                </p>
                <p className="text-xs text-gray-600 leading-snug">
                  Upload your inventory and product details
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center">
                3
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight mb-1">
                  Start Selling
                </p>
                <p className="text-xs text-gray-600 leading-snug">
                  Open POS and process your first sale
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-md mb-8">
          <Link
            href="/auth/login"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md"
          >
            Back to Login
          </Link>
        </div>

        <div className="text-xs text-gray-600 mt-8">
          Need help? Check our{" "}
          <Link
            href="#"
            className="text-blue-600 font-semibold hover:underline"
          >
            Getting Started Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
