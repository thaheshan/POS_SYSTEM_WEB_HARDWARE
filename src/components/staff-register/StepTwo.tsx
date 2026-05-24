"use client";
import {
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Store,
  User,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { StaffRegisterData } from "@/types/staff";
import Link from "next/link";

interface StepTwoProps {
  data: StaffRegisterData;
  updateFields: (fields: Partial<StaffRegisterData>) => void;
  onNext: () => void;
  onBack: () => void;
  selectedShopId: string; // first 8 chars used for verification
}

const StepTwo = ({ data, updateFields, onNext, selectedShopId }: StepTwoProps) => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const hasMinLength = (data.password ?? "").length >= 8;
  const hasUppercase = /[A-Z]/.test(data.password ?? "");
  const hasLowercase = /[a-z]/.test(data.password ?? "");
  const hasNumber = /[0-9]/.test(data.password ?? "");
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(data.password ?? "");
  const isPasswordStrong =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  const passwordsMatch =
    (data.confirmPassword ?? "").length > 0 &&
    data.password === data.confirmPassword;

  // Verify the code: must match first 8 characters of the selected shop id
  const expectedCode = selectedShopId ? selectedShopId.substring(0, 8) : "";
  const verificationCode = data.shopVerificationCode ?? "";
  const isCodeCorrect =
    expectedCode.length > 0 &&
    verificationCode.toLowerCase() === expectedCode.toLowerCase();
  const isCodeEmpty = verificationCode.length === 0;
  const isCodeWrong = !isCodeEmpty && !isCodeCorrect;

  const canGoNext =
    isCodeCorrect &&
    isPasswordStrong &&
    passwordsMatch &&
    agreedToTerms;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10 mt-10">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-bl from-[#1E429F] to-[#1A56DB] rounded-xl shadow-md shadow-blue-500/20 mb-6">
          <Store className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Join Your Shop
        </h1>
        <p className="text-slate-500 mt-2 text-sm lg:text-base">
          Enter your shop's verification code to confirm access
        </p>
      </div>

      <div className="w-full space-y-6">
        {/* Personal Information - Read-only summary */}
        <section className="space-y-4 border-b-2 border-slate-200 pb-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 gap-4 opacity-60">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <input
                  readOnly
                  value={data.fullName}
                  className="w-full pl-12 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <input
                  readOnly
                  value={data.email}
                  className="w-full pl-12 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <input
                  readOnly
                  value={data.phoneNumber}
                  className="w-full pl-12 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Shop Verification Code */}
        <section className="space-y-4 border-b-2 border-slate-200 pb-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Shop Verification
          </h3>

          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-blue-800 text-sm leading-relaxed">
              Ask your <span className="font-semibold">shop owner</span> for the{" "}
              <span className="font-semibold">Shop Verification Code</span>. They
              can find it displayed at the top of their dashboard.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Shop Verification Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
              <input
                type="text"
                value={data.shopVerificationCode ?? ""}
                onChange={(e) =>
                  updateFields({ shopVerificationCode: e.target.value })
                }
                placeholder="e.g. 30d5c1b6"
                maxLength={8}
                className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none transition-all font-mono tracking-widest text-base ${
                  isCodeWrong
                    ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
                    : isCodeCorrect
                    ? "border-green-400 bg-green-50 focus:ring-2 focus:ring-green-100"
                    : "border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                }`}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isCodeCorrect && (
                  <CheckCircle className="size-5 text-green-500" />
                )}
                {isCodeWrong && <X className="size-5 text-red-500" />}
              </div>
            </div>
            {isCodeWrong && (
              <p className="text-xs text-red-500 mt-1.5 font-medium">
                Incorrect code. Please check with your shop owner.
              </p>
            )}
            {isCodeCorrect && (
              <p className="text-xs text-green-600 mt-1.5 font-medium">
                ✓ Shop verified successfully!
              </p>
            )}
            <p className="text-slate-400 text-xs mt-1">
              8-character code shown on the owner's dashboard header
            </p>
          </div>
        </section>
      </div>

      {/* Account Security */}
      <section className="w-full space-y-4 mt-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Account Security
        </h3>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors size-5" />
            <input
              type={showPass ? "text" : "password"}
              value={data.password}
              onChange={(e) => updateFields({ password: e.target.value })}
              className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 font-medium"
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 mb-1">Password strength</p>
          <ul className="space-y-1 ml-1">
            {[
              { label: "At least 8 characters", met: hasMinLength },
              { label: "One uppercase letter (A-Z)", met: hasUppercase },
              { label: "One lowercase letter (a-z)", met: hasLowercase },
              { label: "One number (0-9)", met: hasNumber },
              { label: "One special character (!@#$%)", met: hasSpecialChar },
            ].map((rule) => (
              <li key={rule.label} className="flex items-center gap-2 text-sm">
                <CheckCircle
                  className={`size-4 ${rule.met ? "text-green-500" : "text-slate-300"}`}
                />
                <span className={rule.met ? "text-slate-700" : "text-slate-400"}>
                  {rule.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Lock
              className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 transition-colors ${
                (data.confirmPassword ?? "").length > 0 && !passwordsMatch
                  ? "text-red-500"
                  : "text-slate-400 group-focus-within:text-blue-600"
              }`}
            />
            <input
              type={showConfirm ? "text" : "password"}
              value={data.confirmPassword}
              onChange={(e) => updateFields({ confirmPassword: e.target.value })}
              placeholder="Re-enter your password"
              className={`w-full pl-12 pr-12 py-3 bg-white border rounded-xl outline-none transition-all ${
                (data.confirmPassword ?? "").length > 0 && !passwordsMatch
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/10"
                  : "border-slate-200 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirm ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          {(data.confirmPassword ?? "").length > 0 && !passwordsMatch && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              Passwords do not match
            </p>
          )}
        </div>
      </section>

      {/* Terms and Conditions */}
      <section className="w-full space-y-4">
        <div className="flex max-w-[250px] items-start gap-3 my-8">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
          />
          <label
            htmlFor="terms"
            className="text-sm text-slate-600 leading-relaxed cursor-pointer"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              className="text-blue-600 font-medium hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="text-blue-600 font-medium hover:underline"
            >
              Privacy Policy
            </Link>
          </label>
        </div>
      </section>

      {/* Next Button */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className={`w-full mt-5 py-4 rounded-xl font-bold transition-all duration-200 ${
          canGoNext
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-[0.98]"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        Create Account
      </button>

      {/* Sign In Link */}
      <div className="flex flex-col items-center mt-10 gap-1">
        <p className="text-sm text-slate-500">Already have an account?</p>
        <Link
          href="/auth/login"
          className="text-sm text-blue-600 font-semibold hover:underline"
        >
          Sign In to Your Account
        </Link>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center mt-8 gap-0.5 text-xs text-slate-400">
        <span>v1.0.0</span>
        <span>&copy; {new Date().getFullYear()} Futura Solutions PVT LTD</span>
      </div>
    </div>
  );
};

export default StepTwo;