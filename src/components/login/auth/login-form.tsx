"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { loginThunk, logout } from "../../../../lib/store/authSlice";
import { checkStaffStatus, resolveStaffApprovalDecision, resolveStaffApprovalDecisionFromError } from "@/store/slices/staffSlice";
import FormInput from "./form-input";
import AuthHeader from "./auth-header";

export default function LoginForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("admin@abchardware.lk");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("error") === "rejected") {
      setError(
        "Access Denied: Your application to join this shop was declined by the owner."
      );
    }
  }, [searchParams]);

  const dashboardMap: Record<string, string> = {
    admin: "/dashboard",
    owner: "/dashboard",
    manager: "/dashboard",
    cashier: "/dashboard",
    staff: "/dashboard",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await dispatch(loginThunk({ email, password })).unwrap();

      const user = result.user;
      if (!user) {
        throw new Error("Login succeeded but user profile is missing.");
      }

      // Clear any temporary registration flags
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("allowPendingAccess");
        localStorage.removeItem("registrationStatus");
      }

      // Enforce staff status (is_active / is_verified)
      try {
        const statusRes = await dispatch(
          checkStaffStatus(String(user.id))
        ).unwrap();

        const decision = resolveStaffApprovalDecision(statusRes);

        if (decision === "approved") {
          // approved — proceed to dashboard
        } else if (decision === "pending") {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("allowPendingAccess", "true");
            localStorage.setItem("pendingStaffId", String(user.id));
          }
          router.push("/auth/pending");
          return;
        } else if (decision === "rejected") {
          dispatch(logout());
          router.push("/auth/request-rejected");
          return;
        }
      } catch (e: any) {
        const errorStatus = e?.status ?? e?.response?.status;
        const decision = resolveStaffApprovalDecisionFromError(e);

        if (decision === "pending" || errorStatus === 403) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("allowPendingAccess", "true");
            localStorage.setItem("pendingStaffId", String(user.id));
          }
          router.push("/auth/pending");
          return;
        }

        if (decision === "rejected") {
          dispatch(logout());
          router.push("/auth/request-rejected");
          return;
        }

        // If the status check failed for another reason, keep the existing flow.
        console.warn("[LoginForm] staff status check failed, continuing login", e);
      }

      const roleKey = String(user.role ?? "").toLowerCase();
      const dashboardPath = dashboardMap[roleKey] || "/dashboard";

      // Force full navigation so middleware sees fresh cookies
      if (typeof window !== "undefined") {
        console.log("[LoginForm] Redirecting to:", dashboardPath);
        window.location.assign(dashboardPath);
        return;
      }

      router.push(dashboardPath);
    } catch (err: any) {
      const backendStatus =
        err?.response?.data?.status ||
        err?.response?.data?.backendStatus ||
        err?.status;

      const errorMessage =
        err?.message ||
        err?.response?.data?.message ||
        err?.error ||
        (typeof err === "string" ? err : "Login failed. Please try again.");

      const normalizedMessage = String(errorMessage).toLowerCase();

      // Pending approval
      if (
        backendStatus === "PENDING_APPROVAL" ||
        normalizedMessage.includes("pending approval") ||
        normalizedMessage.includes("waiting approval") ||
        normalizedMessage.includes("approval_waiting")
      ) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("allowPendingAccess", "true");
        }
        router.push("/auth/pending");
        return;
      }

      // Rejected/suspended flows
      if (
        backendStatus === "REJECTED" ||
        normalizedMessage.includes("rejected") ||
        normalizedMessage.includes("declined") ||
        normalizedMessage.includes("contact support") ||
        normalizedMessage.includes("inactive")
      ) {
        if (normalizedMessage.includes("rejected by administration")) {
          router.push("/auth/request-rejected");
          return;
        }
        setError(
          "Access Denied: Your application was rejected by the shop owner."
        );
        return;
      }

      if (
        backendStatus === "ACCOUNT_SUSPENDED" ||
        normalizedMessage.includes("account_suspended") ||
        normalizedMessage.includes("suspended")
      ) {
        router.push("/suspended");
        return;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <AuthHeader
        title="Welcome Back"
        subtitle="Sign in to your shop account"
      />

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
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

      <div className="relative my-6 sm:my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-600 font-medium">OR</span>
        </div>
      </div>

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
