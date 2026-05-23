"use client";

import React from "react";
import Link from "next/link";
import AuthLayout from "@/components/login/auth/auth-layout";
import { XCircle } from "lucide-react";

export default function RequestRejectedPage() {
  return (
    <AuthLayout>
      <div className="w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100 shadow-inner">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
          Registration Rejected
        </h1>
        <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto mb-8">
          We're sorry, but your shop registration request has been declined by the administration. If you believe this is an error, please contact support.
        </p>

        <Link href="/auth/login" className="block w-full">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-98">
            Back to Login
          </button>
        </Link>
      </div>
    </AuthLayout>
  );
}
