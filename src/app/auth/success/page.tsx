"use client";

import React from "react";
import Link from "next/link";
import AuthLayout from "@/components/login/auth/auth-layout";

export default function SuccessPage() {
  return (
    <AuthLayout>
      <div className="w-full text-center">
        {/* Animated Checkmark Icon Container */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100 shadow-inner">
            <svg
              className="w-10 h-10 text-green-500 animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            <div className="absolute inset-0 rounded-full border border-green-300 animate-ping opacity-20"></div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
          Success!
        </h1>
        <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto mb-8">
          Your account has been fully approved and activated. You can now access the POS system and start managing your operations.
        </p>

        {/* Action Button */}
        <Link href="/auth/login" className="block w-full">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-98">
            Go to Login
          </button>
        </Link>
      </div>
    </AuthLayout>
  );
}
