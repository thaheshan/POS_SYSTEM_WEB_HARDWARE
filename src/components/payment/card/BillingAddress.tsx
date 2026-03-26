import React from "react";
import { Check, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface BillingAddressProps {
  sameAddress: boolean;
  setSameAddress: (val: boolean) => void;
  saveCard: boolean;
  setSaveCard: (val: boolean) => void;
  termsAgreed: boolean;
  setTermsAgreed: (val: boolean) => void;
}

export default function BillingAddress({
  sameAddress,
  setSameAddress,
  saveCard,
  setSaveCard,
  termsAgreed,
  setTermsAgreed,
}: BillingAddressProps) {
  return (
    <div className="pt-4">
      <h3 className="text-base font-bold text-slate-900 mb-4 tracking-tight">
        Billing Address
      </h3>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group select-none">
          <div
            className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
              sameAddress
                ? "bg-blue-600 border-blue-600"
                : "border-slate-300 bg-white group-hover:border-blue-500"
            }`}
          >
            {sameAddress && (
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            )}
          </div>
          <span className="text-sm font-medium text-slate-700">
            Same as shop address
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={sameAddress}
            onChange={() => setSameAddress(!sameAddress)}
          />
        </label>

        <label className="flex items-center gap-3 cursor-pointer group select-none">
          <div
            className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
              saveCard
                ? "bg-blue-600 border-blue-600"
                : "border-slate-300 bg-white group-hover:border-blue-500"
            }`}
          >
            {saveCard && (
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            )}
          </div>
          <span className="text-sm font-medium text-slate-700">
            Save card for future payments
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={saveCard}
            onChange={() => setSaveCard(!saveCard)}
          />
        </label>

        <div className="bg-[#F8FAFC] rounded-lg p-3 flex items-center gap-2 border border-slate-100 mt-2 text-green-700 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
          Your card details are encrypted using 256-bit SSL.
        </div>

        <label className="flex items-start gap-3 cursor-pointer group mt-4 select-none">
          <div
            className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center border transition-all ${
              termsAgreed
                ? "bg-blue-600 border-blue-600"
                : "border-slate-300 bg-white group-hover:border-blue-500"
            }`}
          >
            {termsAgreed && (
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            )}
          </div>
          <span className="text-sm font-medium text-slate-700 leading-relaxed">
            I agree to the{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={termsAgreed}
            onChange={() => setTermsAgreed(!termsAgreed)}
          />
        </label>
      </div>
    </div>
  );
}
