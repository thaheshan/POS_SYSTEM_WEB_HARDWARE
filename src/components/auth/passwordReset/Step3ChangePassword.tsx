"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Link from "next/link";

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

interface Rule {
  label: string;
  test: (p: string) => boolean;
}

const RULES: Rule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "At least one uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "At least one number", test: (p) => /\d/.test(p) },
  {
    label: "At least one special character",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

function strengthScore(pw: string) {
  const n = RULES.filter((r) => r.test(pw)).length;
  if (!pw) return 0;
  return n;
}

export default function Step3ChangePassword({ onNext }: Step3Props) {
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const score = strengthScore(newPw);

  const barColor =
    score <= 1
      ? "bg-red-500"
      : score === 2
        ? "bg-amber-500"
        : score === 3
          ? "bg-blue-500"
          : "bg-blue-600";
  const barWidth =
    score === 0
      ? "w-0"
      : score === 1
        ? "w-1/4"
        : score === 2
          ? "w-2/4"
          : score === 3
            ? "w-3/4"
            : "w-full";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    RULES.forEach((r) => {
      if (!r.test(newPw)) errs.push(r.label);
    });
    if (newPw !== confirmPw) errs.push("Passwords do not match.");
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsLoading(false);
    onNext();
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full text-center">
        {/* Lock icon */}
        <div className="flex justify-center mb-6">
          <Lock strokeWidth={2.5} className="w-12 h-12 text-blue-600" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Create new password
        </h2>
        <p className="text-base text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
          Please enter a strong password for your account
        </p>

        <form
          onSubmit={handleSubmit}
          className="text-left space-y-6 w-full max-w-md mx-auto"
        >
          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2.5">
              New Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <Lock strokeWidth={2} className="w-5 h-5" />
              </span>
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => {
                  setNewPw(e.target.value);
                  setErrors([]);
                }}
                placeholder="Enter new password"
                autoFocus
                className="w-full pl-11 pr-11 py-3 text-base border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                tabIndex={-1}
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? (
                  <EyeOff strokeWidth={2} className="w-5 h-5 text-gray-500" />
                ) : (
                  <Eye strokeWidth={2} className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2.5">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <Lock strokeWidth={2} className="w-5 h-5" />
              </span>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => {
                  setConfirmPw(e.target.value);
                  setErrors([]);
                }}
                placeholder="Re-enter new password"
                className="w-full pl-11 pr-11 py-3 text-base border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff strokeWidth={2} className="w-5 h-5 text-gray-500" />
                ) : (
                  <Eye strokeWidth={2} className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Password strength bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-900">
                Password strength
              </p>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${barColor} ${barWidth}`}
              />
            </div>
          </div>

          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {errors.map((err) => (
                <p key={err} className="text-red-700 text-sm font-medium">
                  • {err}
                </p>
              ))}
            </div>
          )}

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-base font-semibold hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <Link
            href="/auth/login"
            className="text-sm text-gray-600 font-medium hover:text-gray-900 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
