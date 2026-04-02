"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegistration } from "@/lib/register/registration-context";
import {
  ownerDataSchema,
  OwnerDataForm,
} from "@/lib/register/validation-schemas";
import { Button } from "@/components/auth/register/ui/button";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface Step2OwnerInfoProps {
  onNext: () => void;
}

const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", regex: /.{8,}/ },
  { id: "uppercase", label: "One uppercase letter", regex: /[A-Z]/ },
  { id: "number", label: "One number", regex: /[0-9]/ },
  { id: "special", label: "One special character", regex: /[!@#$%^&*]/ },
];

export function Step2OwnerInfo({ onNext }: Step2OwnerInfoProps) {
  const router = useRouter(); 
  const { data, updateOwnerData } = useRegistration();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<
    Record<string, boolean>
  >({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
    watch,
    setValue,
  } = useForm<OwnerDataForm>({
    resolver: zodResolver(ownerDataSchema),
    defaultValues: data.owner as OwnerDataForm,
    mode: "onBlur",
  });

  const password = watch("password");

  useEffect(() => {
    if (data.owner) {
      Object.entries(data.owner).forEach(([key, value]) => {
        setValue(key as any, value);
      });
    }
  }, []);

  useEffect(() => {
    const requirements: Record<string, boolean> = {};
    PASSWORD_REQUIREMENTS.forEach(({ id, regex }) => {
      requirements[id] = regex.test(password || "");
    });
    setPasswordRequirements(requirements);
  }, [password]);

  const onSubmit = (formData: OwnerDataForm) => {
    updateOwnerData(formData);
    onNext();
    router.push('/auth/register/subscription'); 
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Owner Information
          </h1>
          <p className="text-gray-600 text-lg">
            Tell us about yourself as the shop owner
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Details Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Personal Details
            </h2>

            {/* Full Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="John Silva"
                  {...register("fullName")}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-600 text-sm font-medium mt-1.5">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  placeholder="john@abchardware.lk"
                  {...register("email")}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm font-medium mt-1.5">
                  {errors.email.message}
                </p>
              )}
              <p className="text-gray-600 text-xs mt-1.5">
                We'll send verification link to this email
              </p>
            </div>

            {/* Mobile Number */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="tel"
                  placeholder="+94 77 123 4567"
                  {...register("mobileNumber")}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
                />
              </div>
              {errors.mobileNumber && (
                <p className="text-red-600 text-sm font-medium mt-1.5">
                  {errors.mobileNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Account Security Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Account Security
            </h2>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  {...register("password")}
                  className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm font-medium mt-1.5">
                  {errors.password.message}
                </p>
              )}

              {/* Password Strength Requirements */}
              <div className="mt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-900">
                  Password strength
                </p>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${(Object.values(passwordRequirements).filter(Boolean).length / 4) * 100}%`,
                    }}
                  />
                </div>
                <div className="space-y-2">
                  {PASSWORD_REQUIREMENTS.map(({ id, label }) => (
                    <div key={id} className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          passwordRequirements[id]
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300"
                        }`}
                      >
                        {passwordRequirements[id] && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          passwordRequirements[id]
                            ? "text-gray-600"
                            : "text-gray-500"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  {...register("confirmPassword")}
                  className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm font-medium mt-1.5">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold text-base transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : (
              <>
                <span>Continue to Subscription</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
