"use client";

import CheckoutHeader from "@/components/payment/CheckoutHeader";
import { ShopPaymentDetails } from "@/utils/ShopPaymentDetails";
import { Check, GiftIcon, Mail } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import CelebrationConfetti from "./CelebrationConfetti";

const NEXT_STEPS = [
  "Set up your shop profile and inventory",
  "Import existing products or add new items",
  "Start managing sales and tracking inventory",
];

export default function PaymentSuccessContent() {
  const router = useRouter();
  const data = ShopPaymentDetails;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.push("/auth/login");
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] font-sans">
      <CheckoutHeader step={4} totalSteps={4} backLink="/payment/processing" />

      <main className="relative z-10 mx-auto w-full max-w-[780px] px-4 sm:px-6 pt-7 pb-12">
        <section className="relative text-center pb-2">
          <CelebrationConfetti />

          <div className="relative z-10 mx-auto mb-4 flex h-[94px] w-[94px] items-center justify-center rounded-full bg-gradient-to-br from-[#0E9F6E] to-[#0A8F63] shadow-[0_18px_30px_rgba(16,185,129,0.25)]">
            <Check className="h-11 w-11 text-white stroke-[3]" />
          </div>

          <h1 className="relative z-10 text-[30px] leading-[1.08] font-extrabold text-[#0E9F6E] tracking-tight sm:text-[34px]">
            Payment Successful!
          </h1>
          <p className="relative z-10 mt-2 text-[16px] leading-[1.35] font-medium text-slate-600 sm:text-[17px]">
            Welcome to Futura Hardware!
          </p>
        </section>

        <section className="mx-auto mt-7 w-full max-w-[510px] rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-[0_8px_18px_rgba(16,185,129,0.16)]">
          <div className="mb-4 flex items-center gap-2">
            <GiftIcon className="h-6 w-6 text-[#0E9F6E]" />
            <h2 className="text-[18px] leading-[1.2] font-extrabold text-slate-900 tracking-tight sm:text-[19px]">
              Your 30-Day Trial Starts Now
            </h2>
          </div>

          <div className="divide-y divide-slate-200 px-2">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-slate-600">Plan</span>
              <span className="text-sm font-semibold text-slate-900">
                {data.planName}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-slate-600">Trial Ends</span>
              <span className="text-sm font-semibold text-slate-900">
                {data.trialEndDate}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-slate-600">First Payment</span>
              <span className="text-sm font-bold text-[#1A56DB]">
                {data.currency} {data.price} on {data.nextPaymentDate}
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 w-full max-w-[510px] text-left">
          <h3 className="text-[28px] leading-[1.1] font-extrabold text-slate-900 tracking-tight sm:text-[30px]">
            Account Information
          </h3>
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-slate-600">
              Shop ID:{" "}
              <span className="ml-2 font-semibold text-slate-900">
                {data.shopId}
              </span>
            </p>
            <p className="text-slate-600">
              Email:{" "}
              <span className="ml-2 font-semibold text-slate-900">
                {data.userEmail}
              </span>
            </p>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-3">
            <div className="flex items-center gap-2 text-[#1A56DB]">
              <Mail className="h-4 w-4" />
              <span className="text-sm font-medium">
                Confirmation email sent to your inbox
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 w-full max-w-[510px] text-left">
          <h3 className="text-center text-[30px] leading-[1.1] font-extrabold text-slate-900 tracking-tight sm:text-[32px]">
            What&apos;s Next?
          </h3>
          <div className="mt-5 space-y-4">
            {NEXT_STEPS.map((text, index) => (
              <div key={text} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A56DB] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-sm text-slate-700">{text}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="mx-auto mt-8 w-full max-w-[510px]">
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="h-14 w-full rounded-xl bg-[#1E4DB7] text-white text-lg font-semibold shadow-[0_8px_18px_rgba(30,77,183,0.35)] transition-colors hover:bg-[#1A56DB]"
          >
            Complete
          </button>

          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500">Need help?</p>
            <Link
              href="/support"
              className="mt-2 inline-block text-sm font-semibold text-[#1A56DB] hover:underline"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
