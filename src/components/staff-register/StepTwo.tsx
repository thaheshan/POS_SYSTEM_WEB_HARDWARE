"use client";
import {
  CheckCircle,
  Eye,
  EyeOff,
  Info,
  Lock,
  Mail,
  Phone,
  Store,
  User,
} from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import { StaffRegistrationFormValues } from "@/lib/validation/staffRegistration.schema";
import { SHOP_OPTIONS } from "@/utils/StaffRegisterData";
import { useAppSelector } from "@/store/hooks";

interface StepTwoProps {
  register: UseFormRegister<StaffRegistrationFormValues>;
  errors: FieldErrors<StaffRegistrationFormValues>;
  watch: UseFormWatch<StaffRegistrationFormValues>;
  onBack: () => void;
}

const StepTwo = ({ register, errors, watch, onBack }: StepTwoProps) => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const currentPassword = watch("password") || "";
  const currentConfirm = watch("confirmPassword") || "";
  const currentTerms = watch("acceptTerms");
  const currentShopId = watch("shop_id");
  const selectedShop = SHOP_OPTIONS.find((s) => s.id === currentShopId);

  const fullName = watch("full_name");
  const email = watch("email");
  const phone = watch("phone");
  const currentVerificationId = watch("shop_verification_id") || "";
 
  const hasMinLength = currentPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(currentPassword);
  const hasLowercase = /[a-z]/.test(currentPassword);
  const hasNumber = /[0-9]/.test(currentPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(currentPassword);
  const isPasswordStrong =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  const passwordsMatch =
    (currentConfirm ?? "").length > 0 && currentPassword === currentConfirm;

  const canSubmit = Boolean(
    currentVerificationId && isPasswordStrong && passwordsMatch && currentTerms
  );

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
          Tell us about yourself and request to join a shop
        </p>
      </div>

      <div className="w-full space-y-6">
        {/* Personal Information */}
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
                  value={fullName || ""}
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
                  value={email || ""}
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
                  value={phone || ""}
                  className="w-full pl-12 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Shop Details */}
        <section className="space-y-4 border-b-2 border-slate-200 pb-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Shop Details
          </h3>
          <div className="flex items-center justify-start p-4 bg-[#FEFCE8] border border-[#FEF08A] rounded-lg">
            <Info className="md:w-[16px] md:h-[16px] text-[#CA8A04] mr-2 shrink-0" />
            <p className="text-[#713F12] text-[12px]">
              Ask your shop owner for the Shop Private ID
            </p>
          </div>
          <div className="opacity-60">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Selected Shop
            </label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
              <input
                readOnly
                value={selectedShop?.name || "Unknown Shop"}
                className="w-full pl-12 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-not-allowed text-slate-600 font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Shop Private ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
              <input
                type="text"
                {...register("shop_verification_id")}
                placeholder="Ask owner for the 36-character Shop ID"
                className={`w-full pl-12 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-700 ${
                  errors.shop_verification_id
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            {errors.shop_verification_id ? (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.shop_verification_id.message}
              </p>
            ) : (
              <p className="text-slate-500 text-xs mt-1">
                Unique identifier provided by your shop owner
              </p>
            )}
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
              {...register("password", { required: true })}
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
                  className={`size-4 ${
                    rule.met ? "text-green-500" : "text-slate-300"
                  }`}
                />
                <span
                  className={rule.met ? "text-slate-700" : "text-slate-400"}
                >
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
                errors.confirmPassword
                  ? "text-red-500"
                  : "text-slate-400 group-focus-within:text-blue-600"
              }`}
            />
            <input
              type={showConfirm ? "text" : "password"}
              {...register("confirmPassword", { required: true })}
              placeholder="Re-enter your password"
              className={`w-full pl-12 pr-12 py-3 bg-white border rounded-xl outline-none transition-all ${
                errors.confirmPassword
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
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              {errors.confirmPassword.message}
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
            {...register("acceptTerms", { required: true })}
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
        type="submit"
        disabled={!canSubmit}
        className={`w-full mt-5 py-4 rounded-xl font-bold transition-all duration-200 ${
          canSubmit
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-[0.98]"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        Next
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
