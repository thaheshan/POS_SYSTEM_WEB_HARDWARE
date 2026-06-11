"use client";

import { useState } from "react";
import { Mail, KeyRound, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface Step1Props {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
}

export default function Step1EmailRequired({
  email,
  onEmailChange,
  onSubmit,
  loading,
  error: serverError,
}: Step1Props) {
  const [localError, setLocalError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setLocalError("Please enter a valid email address");
      return;
    }

    onSubmit();
  };

  const displayError = localError || serverError;

  return (
    <div className="w-full min-h-[80vh] bg-transparent flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Forgot your password?
        </h2>
        <p className="text-base text-gray-600 mb-8 mx-auto leading-relaxed max-w-md">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 w-full max-w-md mx-auto"
        >
          <div className="text-left w-full">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-900 mb-2.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail strokeWidth={2} className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  onEmailChange(e.target.value);
                  setLocalError("");
                }}
                className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all outline-none"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>
            {displayError && (
              <p className="mt-1.5 text-sm font-medium text-red-600">
                {displayError}
              </p>
            )}
          </div>

          <div className="mx-auto max-w-sm pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending link...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Link</span>{" "}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/auth/register/staff"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}