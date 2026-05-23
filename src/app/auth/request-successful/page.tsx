"use client";

import React from "react";
import Link from "next/link";
import AuthLayout from "@/components/login/auth/auth-layout";
import { CheckCircle } from "lucide-react";

export default function RequestSuccessfulPage() {
  return (
    <AuthLayout>
      <div className="w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100 shadow-inner">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <div className="absolute inset-0 rounded-full border border-green-300 animate-ping opacity-20"></div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
          Request Approved!
        </h1>
        <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto mb-8">
          Congratulations! Your shop registration has been approved by the administration. 
          Please proceed to complete your subscription payment to activate your account.
        </p>

        <Link href="/payment" className="block w-full">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-98">
            Proceed to Payment
          </button>
        </Link>
      </div>
    </AuthLayout>
  );
}
