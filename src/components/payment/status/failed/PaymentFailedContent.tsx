"use client";

import CheckoutHeader from "@/components/payment/CheckoutHeader";
import { MockPaymentErrors } from "@/utils/ShopPaymentDetails";
import { AlertCircle, Headphones, X } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PaymentFailedContentProps {
  onTryAgain?: () => void;
  onDifferentMethod?: () => void;
  onBack?: () => void;
}

export default function PaymentFailedContent({
  onTryAgain,
  onDifferentMethod,
  onBack,
}: PaymentFailedContentProps) {
  const router = useRouter();
  const error = MockPaymentErrors;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <CheckoutHeader
        step={4}
        totalSteps={4}
        backLink="/payment"
        onBack={onBack}
      />

      <main className="mx-auto w-full max-w-[780px] px-4 sm:px-6 pt-7 pb-12">
        <section className="text-center">
          <div className="mx-auto mb-4 flex h-[94px] w-[94px] items-center justify-center rounded-full bg-gradient-to-br from-[#B91C1C] to-[#991B1B] shadow-[0_18px_28px_rgba(185,28,28,0.2)]">
            <X className="h-11 w-11 text-white stroke-[3]" />
          </div>

          <h1 className="text-[30px] leading-[1.08] font-extrabold text-[#B91C1C] tracking-tight sm:text-[34px]">
            Payment Failed
          </h1>
          <p className="mt-2 text-[16px] leading-[1.35] font-medium text-slate-600 sm:text-[17px]">
            We couldn&apos;t process your payment
          </p>
        </section>

        <section className="mx-auto mt-8 w-full max-w-[510px] rounded-2xl border border-red-200 bg-white p-6">
          <p className="text-sm text-slate-700">
            Error Code:{" "}
            <span className="font-mono font-semibold text-[#B91C1C]">
              {error.errorCode}
            </span>
          </p>

          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#B91C1C]" />
            <p className="text-sm text-red-700">
              {error.errorMessage} Please check your card details or try a
              different payment method.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-8 w-full max-w-[510px] text-left">
          <h2 className="text-center text-[28px] leading-[1.1] font-extrabold text-slate-900 tracking-tight sm:text-[30px]">
            Common Issues
          </h2>
          <ul className="mt-5 space-y-3">
            {error.commonIssues.map((issue) => (
              <li key={issue} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1A56DB]" />
                <span className="text-sm text-slate-700">{issue}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mx-auto mt-10 w-full max-w-[510px] space-y-3">
          <button
            type="button"
            onClick={() => {
              if (onTryAgain) {
                onTryAgain();
                return;
              }

              router.push("/payment");
            }}
            className="h-14 w-full rounded-xl bg-[#1E4DB7] text-white text-lg font-semibold shadow-[0_8px_18px_rgba(30,77,183,0.35)] transition-colors hover:bg-[#1A56DB]"
          >
            Try Again
          </button>

          <button
            type="button"
            onClick={() => {
              if (onDifferentMethod) {
                onDifferentMethod();
                return;
              }

              router.push("/payment");
            }}
            className="h-14 w-full rounded-xl border border-slate-300 bg-white text-slate-700 text-base font-semibold transition-colors hover:bg-slate-50"
          >
            Use Different Payment Method
          </button>

          <div className="pt-2 text-center">
            <Link
              href="/support"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A56DB] hover:underline"
            >
              <Headphones className="h-4 w-4" />
              Contact Support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
