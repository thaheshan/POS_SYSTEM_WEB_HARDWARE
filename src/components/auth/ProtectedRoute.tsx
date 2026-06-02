"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { logout as logoutAction } from "../../../lib/store/authSlice";
import {
  checkStaffStatus,
  resolveStaffApprovalDecision,
  resolveStaffApprovalDecisionFromError,
} from "@/store/slices/staffSlice";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const router = useRouter();

  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const statusCheckedRef = useRef(false);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated || !user) {
      router.push("/auth/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
      return;
    }

    if (!statusCheckedRef.current) {
      statusCheckedRef.current = true;
      (async () => {
        try {
          const statusRes = await dispatch(
            checkStaffStatus(String(user.id))
          ).unwrap();

          const decision = resolveStaffApprovalDecision(statusRes);

          if (decision === "approved") {
            return;
          }

          if (decision === "pending") {
            if (typeof window !== "undefined") {
              sessionStorage.setItem("allowPendingAccess", "true");
              localStorage.setItem("pendingStaffId", String(user.id));
            }
            router.replace("/auth/pending");
            return;
          }

          if (decision === "rejected") {
            dispatch(logoutAction());
            router.replace("/auth/request-rejected");
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
            router.replace("/auth/pending");
            return;
          }

          if (decision === "rejected") {
            dispatch(logoutAction());
            router.replace("/auth/request-rejected");
            return;
          }

          console.warn("[ProtectedRoute] staff status check failed", e);
        }
      })();
    }
  }, [
    isAuthenticated,
    isAuthLoading,
    user,
    allowedRoles,
    router,
    dispatch,
  ]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-blue-600 font-bold">
        Authenticating...
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
