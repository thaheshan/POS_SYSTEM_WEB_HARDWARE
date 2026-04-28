"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { loginThunk } from "../../../../lib/store/authSlice";
import FormInput from "./form-input";
import AuthHeader from "./auth-header";

export default function LoginForm() {
  // Local UI state for the form; auth/session state lives in Redux.
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("admin@abchardware.lk");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Redux dispatch for login thunk (typed for thunk support).
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const dashboardMap: Record<string, string> = {
    admin: "/dashboard",
    manager: "/dashboard",
    cashier: "/dashboard",
    staff: "/dashboard",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log("[LoginForm] Submitting login with email:", email);

    try {
      // Dispatch login thunk with form credentials.
      console.log("[LoginForm] Dispatching loginThunk...");
      const result = await dispatch(loginThunk({ email, password })).unwrap();

      console.log("[LoginForm] Login successful! User:", result.user);
      if (!result.user) {
        throw new Error("Login succeeded but user profile is missing.");
      }

      // Redirect each role to its dedicated dashboard/area.
      const dashboardPath = dashboardMap[result.user.role] || "/dashboard";
      console.log("[LoginForm] Redirecting to:", dashboardPath);

      // Force a full navigation so middleware always sees the latest cookie.
      if (typeof window !== "undefined") {
        window.location.assign(dashboardPath);
        return;
      }

      router.push(dashboardPath);
    } catch (err: any) {
      // Surface backend rejection message (including private-tab block reason).
      console.error("[LoginForm] Login error:", err);
      const errorMessage =
        err?.message ||
        (typeof err === "string" ? err : "Login failed. Please try again.");
      setError(errorMessage);
    } finally {
      // Always release loading state so redirect bounces don't leave UI spinning.
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <AuthHeader
        title="Welcome Back"
        subtitle="Sign in to your shop account"
      />

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {/* Error Message Display */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4">
            <p className="text-sm font-medium text-red-800 leading-relaxed">
              {error}
            </p>
          </div>
        )}

        <FormInput
          label="Email Address"
          type="email"
          icon="email"
          placeholder="admin@abchardware.lk"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />

        <FormInput
          label="Password"
          type="password"
          icon="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showPasswordToggle
          isPasswordVisible={isPasswordVisible}
          onPasswordToggle={() => setIsPasswordVisible(!isPasswordVisible)}
          required
          disabled={isLoading}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <label className="flex items-center gap-2 cursor-pointer group min-w-0">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all disabled:opacity-50"
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              Remember me
            </span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200 self-start sm:self-auto"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 w-full rounded-lg bg-blue-600 py-2.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-400 active:scale-98 sm:mt-8 sm:py-3"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing In...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6 sm:my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-600 font-medium">OR</span>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-gray-700 text-sm">
          Don't have an account?{" "}
          <Link
            href="/auth/register/role"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
