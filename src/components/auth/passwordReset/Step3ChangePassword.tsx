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
      ? "bg-red-400"
      : score === 2
        ? "bg-amber-400"
        : score === 3
          ? "bg-blue-500"
          : "bg-[#1855e3]";
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
    <div className="w-full text-center px-4">
      {/* Lock icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#1855e3] flex items-center justify-center">
            <Lock strokeWidth={2.5} className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Create new password
      </h2>
      <p className="text-xs text-gray-500 mb-8 font-medium">
        Please enter a strong password for your account
      </p>

      <form
        onSubmit={handleSubmit}
        className="text-left space-y-5 mx-auto max-w-sm"
      >
        {/* New Password */}
        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-2">
            New Password
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Lock strokeWidth={2} className="w-4 h-4" />
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
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showNew ? (
                <EyeOff strokeWidth={2} className="w-4 h-4" />
              ) : (
                <Eye strokeWidth={2} className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Lock strokeWidth={2} className="w-4 h-4" />
            </span>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPw}
              onChange={(e) => {
                setConfirmPw(e.target.value);
                setErrors([]);
              }}
              placeholder="Re-enter new password"
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showConfirm ? (
                <EyeOff strokeWidth={2} className="w-4 h-4" />
              ) : (
                <Eye strokeWidth={2} className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Password strength bar */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-blue-600">
              Password strength
            </p>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${barColor} ${barWidth}`}
            />
          </div>
        </div>

        {/* Validation errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {errors.map((err) => (
              <p key={err} className="text-red-500 text-xs">
                {err}
              </p>
            ))}
          </div>
        )}

        {/* Submit */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1855e3] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1447c2] active:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          className="text-[13px] text-gray-500 font-medium hover:text-gray-800 transition"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
