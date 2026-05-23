"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/login/auth/auth-layout";
import { authApi } from "@/api/auth";

const POLL_INTERVAL_MS = 5000; // poll every 5 seconds

export default function ApprovalWaitingPage() {
  const router = useRouter();
  const [dots, setDots] = useState(".");
  const [isCancelling, setIsCancelling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate the "waiting..." dots
  useEffect(() => {
    const dotsTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 600);
    return () => clearInterval(dotsTimer);
  }, []);

  // Poll the backend for status changes
  useEffect(() => {
    const email =
      typeof window !== "undefined"
        ? localStorage.getItem("pendingEmail")
        : null;

    if (!email) return; // No email stored — can't poll

    const poll = async () => {
      try {
        const result = await authApi.checkStatus(email);
        console.log("Polling result:", result);
        
        // Handle potential nested data wrappers just in case
        const currentStatus = result.status || result.data?.status;

        if (currentStatus === "APPROVED" || currentStatus === "ACTIVE") {
          // Admin approved → go to request successful screen
          console.log("Redirecting to request-successful");
          if (intervalRef.current) clearInterval(intervalRef.current);
          window.location.href = "/auth/request-successful";
        } else if (currentStatus === "REJECTED") {
          // Admin rejected → go to rejected screen
          console.log("Redirecting to request-rejected");
          if (intervalRef.current) clearInterval(intervalRef.current);
          localStorage.removeItem("registrationStatus");
          localStorage.removeItem("pendingEmail");
          window.location.href = "/auth/request-rejected";
        }
        // PENDING_APPROVAL → keep polling
      } catch (e) {
        console.error("Polling error:", e);
        // Silently ignore network errors — will retry next interval
      }
    };

    poll(); // immediate first check
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [router]);

  return (
    <AuthLayout>
      <div className="w-full text-center">
        {/* Animated Clock Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-4 border-blue-100 shadow-inner">
            <svg
              className="w-10 h-10 text-blue-500 animate-pulse"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {/* Pulsing outer ring */}
            <div className="absolute inset-0 rounded-full border border-blue-300 animate-ping opacity-20"></div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
          Approval Pending
        </h1>
        <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto mb-2">
          Your account has been registered successfully but is currently{" "}
          <span className="font-semibold text-gray-700">
            awaiting administration approval
          </span>.
          You will be notified once your account is activated.
        </p>

        {/* Live status indicator */}
        <p className="text-blue-500 text-sm font-medium mb-8">
          Checking for updates{dots}
        </p>

        {/* Back to Login */}
        <div className="space-y-3">
          <Link href="/auth/login" className="block w-full">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
              Back to Login
            </button>
          </Link>
          
          <button 
            onClick={async () => {
              const email = localStorage.getItem("pendingEmail");
              if (!email) {
                localStorage.removeItem("registrationStatus");
                router.push("/auth/register/shop-owner");
                return;
              }
              if (confirm("Are you sure you want to cancel your pending registration and start over?")) {
                try {
                  setIsCancelling(true);
                  await authApi.cancelRegistration(email);
                  localStorage.removeItem("registrationStatus");
                  localStorage.removeItem("pendingEmail");
                  router.push("/auth/register/shop-owner");
                } catch (e) {
                  alert("Failed to cancel registration. Please try again.");
                  setIsCancelling(false);
                }
              }
            }}
            disabled={isCancelling}
            className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {isCancelling ? "Cancelling..." : "Cancel & Start Fresh"}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
