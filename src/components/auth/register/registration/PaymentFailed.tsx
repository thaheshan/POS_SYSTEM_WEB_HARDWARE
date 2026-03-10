'use client';
import ProgressBar from "@/components/staff-register/ProgressBar";
import { AlertCircle, Headphones, X } from "lucide-react";
import React from "react";

interface PaymentFailedProps {
  errorCode?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onChangePaymentMethod?: () => void;
}

const PaymentFailed = ({
  errorCode = "PAYMENT_DECLINED_001",
  errorMessage = "Your card was declined by your bank. Please check your card details or try a different payment method.",
  onRetry,
  onChangePaymentMethod,
}: PaymentFailedProps) => {
  const commonIssues = [
    "Insufficient funds in your account",
    "Incorrect card details entered",
    "Card expired or blocked",
    "Transaction limit exceeded",
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex flex-col mb-14">
        <ProgressBar currentStep={4} totalSteps={4} />
      </div>

      {/* Failure Hero Section */}
      <div
        className="w-full flex md:max-w-[448px] h-auto flex-col items-center text-center mt-10 bg-no-repeat bg-center"
      >
        {/* Failure Icon */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-[90px] h-[90px] bg-gradient-to-bl from-[#B91C1C] to-[#991B1B] rounded-full shadow-md shadow-red-500/20 mb-2">
            <X className="w-10 h-10 text-white stroke-[3.75px]" />
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-[#991B1B]">
            Payment Failed
          </h1>
          <p className="text-slate-500 mt-2 text-sm lg:text-base">
            We couldn&apos;t process your payment
          </p>
        </div>

        {/* Error Details Card */}
        <div className="w-full max-w-[300px] md:max-w-[400px] bg-white border border-slate-200 rounded-xl p-5 shadow-md mt-10 text-left">
          <p className="text-sm text-slate-600 mb-3">
            Error Code:{" "}
            <span className="font-mono font-semibold text-[#B91C1C]">
              {errorCode}
            </span>
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#B91C1C] mt-0.5 flex-shrink-0" />
            <span className="text-sm text-slate-700">{errorMessage}</span>
          </div>
        </div>
      </div>

      {/* Common Issues */}
      <div className="w-full max-w-[300px] md:max-w-[448px] text-center mt-6 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Common Issues</h2>
        <ul className="space-y-3 text-left">
          {commonIssues.map((issue, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A56DB] flex-shrink-0" />
              <span className="text-sm text-slate-600">{issue}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-[300px] md:max-w-[448px] flex flex-col gap-3 mb-4">
        <button
          onClick={onRetry}
          className="w-full py-2.5 bg-gradient-to-tr from-[#1E429F] to-[#1A56DB] hover:bg-[#1648c0] text-white font-semibold rounded-full transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onChangePaymentMethod}
          className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-full transition-colors"
        >
          Use Different Payment Method
        </button>
      </div>

      {/* Contact Support */}
      <div className="flex items-center justify-center gap-2 mb-10 mt-2">
        <Headphones className="w-4 h-4 text-[#1A56DB]" />
        <a
          href="/support"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-[#1A56DB] hover:underline"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default PaymentFailed;