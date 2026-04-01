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
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Check Your Email
        </h2>
        <p className="text-base text-gray-600 mb-5">
          We've sent a verification link to:
        </p>

        {/* Email Badge */}
        <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 rounded-lg mb-8 border border-blue-100">
          <span className="text-sm font-semibold text-blue-700">
            {email || "john@abchardware.lk"}
          </span>
        </div>

        <p className="text-base text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          Please click the verification link in the email to activate your
          account and start using{" "}
          <span className="font-semibold text-gray-900">Futura Hardware</span>.
        </p>

        {/* Main Action Button */}
        <div className="mx-auto max-w-md">
          <button
            onClick={onNext}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 mb-6"
          >
            <Mail className="w-5 h-5" />
            <span>Open Email App</span>
          </button>
        </div>

        {/* Resend Link */}
        <div className="text-base text-gray-600 mb-8">
          Didn't receive the email?{" "}
          <button className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
            Resend
          </button>
        </div>

        {/* Warning Box */}
        <div className="bg-amber-50 rounded-lg p-4 max-w-md mx-auto flex items-start text-left gap-3 mb-8 border border-amber-100">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed">
            Check your spam or junk folder if you don't see the email within a
            few minutes.
          </p>
        </div>

        {/* Contact Support */}
        <button className="flex items-center justify-center gap-2 mx-auto text-base font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
          <Headphones className="w-5 h-5" />
          <span>Need help? Contact support</span>
        </button>
      </div>
    </div>
  );
}
