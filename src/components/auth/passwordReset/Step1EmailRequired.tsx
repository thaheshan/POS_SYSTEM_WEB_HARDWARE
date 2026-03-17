"use client";

import { useState } from "react";
import { Mail, KeyRound, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface Step1Props {
  email: string;
  onEmailChange: (email: string) => void;
  onNext: () => void;
}

export default function Step1EmailRequired({
  email,
  onEmailChange,
  onNext,
}: Step1Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    // Simulate API call to send verification code
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    onNext();
  };

  return (
    <div className="w-full text-center px-4">
      {/* Key icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center">
          <KeyRound
            strokeWidth={2.5}
            className="w-8 h-8 text-blue-600 rotate-[45deg]"
          />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-3">
        Forgot your password?
      </h2>
      <p className="text-sm text-gray-500 mb-8 mx-auto leading-relaxed max-w-sm">
        Enter your email address and we'll send you a link to reset your
        password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-left w-full mx-auto max-w-sm">
          <label
            htmlFor="email"
            className="block text-[13px] font-medium text-gray-700 mb-2"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail strokeWidth={2} className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="block w-full pl-11 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="mx-auto max-w-sm pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1855e3] hover:bg-[#1447c2] text-white py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending link...
              </>
            ) : (
              <>
                Send Verification Link <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 text-sm text-gray-500">
        Don't have an account?{" "}
        <Link
          href="/auth/register/staff"
          className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
