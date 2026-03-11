"use client";

import ProgressBar from "@/components/staff-register/ProgressBar";
import { ChartBar, Check, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function ShopRegistraionComplete() {
  const router = useRouter();
  const handleActionClick = () => {
    router.push("/login");
  };

  return (
    <div className="w-full flex flex-col items-center ">
      <div className="w-full flex flex-col mb-14">
        <ProgressBar currentStep={4} totalSteps={4} />
      </div>
      <div className="w-full flex md:max-w-[448px] h-auto flex-col items-center text-center mt-10 bg-no-repeat bg-center">
        <div className="flex items-center justify-center w-[100px] h-[100px] bg-gradient-to-bl from-[#046C4E] to-[#0E9F6E] rounded-full shadow-md shadow-green-500/20 mb-2">
          <Check className="w-10 h-10 text-white stroke-[3.75px]" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          You&apos;re All Set!
        </h1>
        <p className="text-[#0E9F6E] mt-2 text-sm lg:text-base mb-6">
          {" "}
          Your email has been verified successfully!{" "}
        </p>
        <p className="text-gray-600 text-sm lg:text-base mb-10">
          Welcome to Futura Hardware! Your shop management system is ready.
          Let&apos;s get started with setting up your dashboard.{" "}
        </p>
      </div>

      {/* Feature List */}
      <div className="w-full max-w-80 md:max-w-md space-y-4 mb-8">
        {/* Item 1 */}
        <div className="flex items-center p-2 bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mr-4">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
          </div>
          <span className="font-semibold text-slate-700 text-sm">
            Start selling with POS system
          </span>
        </div>

        {/* Item 2 */}
        <div className="flex items-center p-2 bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mr-4">
            <Package className="w-5 h-5 text-green-500" />
          </div>
          <span className="font-semibold text-slate-700 text-sm">
            Manage your inventory efficiently
          </span>
        </div>

        {/* Item 3 */}
        <div className="flex items-center p-2 bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mr-4">
            <ChartBar className="w-5 h-5 text-red-500 " />
          </div>
          <span className="font-semibold text-slate-700 text-sm">
            Track sales and performance
          </span>
        </div>
      </div>
      <button
        onClick={handleActionClick}
        className="w-full max-w-md bg-gradient-to-br from-[#0E9F6E] to-[#046C4E] hover:bg-[#0a5c34] text-white font-bold py-4 rounded-xl transition-colors shadow-md mt-3"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
