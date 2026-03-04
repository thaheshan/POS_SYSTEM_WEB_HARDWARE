"use client";

import { Mail, AlertTriangle, Headphones } from "lucide-react";

interface Step2Props {
  email: string;
  code: string;
  onCodeChange: (code: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Verification({ email, onNext }: Step2Props) {
  return (
    <div className="w-full text-center px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Check Your Email
      </h2>
      <p className="text-[13px] text-gray-500 mb-4">
        We've sent a verification link to:
      </p>

      {/* Email Badge */}
      <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 rounded-md mb-8">
        <span className="text-sm font-semibold text-blue-600">
          {email || "john@abchardware.lk"}
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
        Please click the verification link in the email to activate your account
        and start using{" "}
        <span className="font-semibold text-gray-900">Futura Hardware</span>.
      </p>

      {/* Main Action Button */}
      <div className="mx-auto max-w-sm">
        <button
          onClick={onNext}
          className="w-full bg-[#1855e3] hover:bg-[#1447c2] text-white py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 mb-4"
        >
          <Mail className="w-4 h-4" />
          Open Email App
        </button>
      </div>

      {/* Resend Link */}
      <div className="text-[13px] text-gray-500 mb-8">
        Didn't receive the email?{" "}
        <button className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
          Resend
        </button>
      </div>

      {/* Warning Box */}
      <div className="bg-amber-50 rounded-lg p-3 max-w-sm mx-auto flex items-start text-left gap-3 mb-8">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Check your spam or junk folder if you don't see the email within a few
          minutes.
        </p>
      </div>

      {/* Contact Support */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-700 cursor-pointer">
        <Headphones className="w-4 h-4" />
        Need help? Contact support
      </div>
    </div>
  );
}
