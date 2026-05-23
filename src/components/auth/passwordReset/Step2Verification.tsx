"use client";

import { Mail, AlertTriangle, Headphones, Loader2 } from "lucide-react";

interface Step2Props {
  email: string;
  code: string;
  onCodeChange: (code: string) => void;
  onNext: () => void;
  onOpenEmailApp: () => void;
  onResend: () => void;
  loading: boolean;
}

export default function Step2Verification({
  email,
  code,
  onCodeChange,
  onNext,
  onOpenEmailApp,
  onResend,
  loading,
}: Step2Props) {
  return (
    <div className="w-full min-h-[80vh] bg-transparent flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Check Your Email
        </h2>
        <p className="text-base text-gray-600 mb-5">
          We've sent a verification link to:
        </p>

        <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 rounded-lg mb-8 border border-blue-100">
          <span className="text-sm font-semibold text-blue-700">
            {email || "john@abchardware.lk"}
          </span>
        </div>

        <p className="text-base text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          Please click the verification link in the email or enter the code here to activate your
          account and start using{" "}
          <span className="font-semibold text-gray-900">Futura Hardware</span>.
        </p>

        {/* Main Action Form */}
        <div className="mx-auto max-w-md mb-6">
          <label
            htmlFor="code"
            className="block text-sm font-semibold text-gray-900 mb-2.5 text-left"
          >
            Verification Code
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            disabled={loading}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all outline-none mb-4 text-center tracking-[0.25em] font-mono"
            placeholder="123456"
            maxLength={6}
            required
          />
          <button
            onClick={() => {
              if (code.length >= 4) {
                onNext();
              }
            }}
            disabled={!code || code.length < 4 || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            <span>Verify Code</span>
          </button>
        </div>

        {/* Resend Link */}
        <div className="text-base text-gray-600 mb-8 mt-6">
          Didn't receive the email?{" "}
          <button
            onClick={onResend}
            disabled={loading}
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors disabled:opacity-50"
          >
            Resend
          </button>
        </div>

        <div className="bg-amber-50 rounded-lg p-4 max-w-md mx-auto flex items-start text-left gap-3 mb-8 border border-amber-100">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed">
            Check your spam or junk folder if you don't see the email within a
            few minutes.
          </p>
        </div>

        <button
          onClick={onOpenEmailApp}
          className="flex items-center justify-center gap-2 mx-auto text-base font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        >
          <Headphones className="w-5 h-5" />
          <span>Need help? Contact support</span>
        </button>
      </div>
    </div>
  );
}