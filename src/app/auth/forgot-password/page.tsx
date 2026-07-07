"use client";

import { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Step1EmailRequired from "@/components/auth/passwordReset/Step1EmailRequired";
import Step2Verification from "@/components/auth/passwordReset/Step2Verification";
import Step3ChangePassword from "@/components/auth/passwordReset/Step3ChangePassword";
import Step4PasswordResetResult from "@/components/auth/passwordReset/Step4PasswordResetResult";
import type { AppDispatch } from "@/store";
import {
  clearForgotPasswordFlow,
  requestPasswordReset,
  resetPassword,
  selectForgotPassword,
} from "@/store/slices/forgotPasswordSlice";
import AuthLayout from "@/components/login/auth/auth-layout";

const decodeResetTokenEmail = (token: string): string => {
  const encodedPayload = token.split(".")[0];
  if (!encodedPayload) {
    return "";
  }

  try {
    const normalizedPayload = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "=",
    );
    const parsed = JSON.parse(atob(paddedPayload)) as { email?: unknown };
    // The token encodes the original email at issuance time; decode it here
    // so the UI can pre-fill the email field when the reset link is used.
    return typeof parsed.email === "string"
      ? parsed.email.trim().toLowerCase()
      : "";
  } catch {
    return "";
  }
};

function ForgotPasswordPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const forgotPassword = useSelector(selectForgotPassword);

  const tokenFromQuery = searchParams.get("token")?.trim() ?? "";
  const tokenEmailFromQuery = tokenFromQuery
    ? decodeResetTokenEmail(tokenFromQuery)
    : "";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(tokenFromQuery ? 3 : 1);
  const [email, setEmail] = useState(tokenEmailFromQuery);
  const [resetToken, setResetToken] = useState<string | null>(
    tokenFromQuery || null,
  );
  const [code, setCode] = useState("");

  useEffect(() => {
    dispatch(clearForgotPasswordFlow());

    return () => {
      dispatch(clearForgotPasswordFlow());
    };
  }, [dispatch]);

  useEffect(() => {
    if (step !== 4) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.replace("/auth/login?reset=success");
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [router, step]);

  const handleRequestReset = async () => {
    const result = await dispatch(requestPasswordReset({ email })).unwrap();
    setResetToken(result.resetToken);
    setStep(2);
  };

  const handleResetPassword = async (newPassword: string) => {
    // If we have a code from step 2, use it as the token
    const finalToken = tokenFromQuery || code || resetToken || "";
    await dispatch(
      resetPassword({
        email: email || tokenEmailFromQuery,
        resetToken: finalToken,
        newPassword,
      }),
    ).unwrap();
    setStep(4);
  };

  const handleResend = async () => {
    await dispatch(requestPasswordReset({ email })).unwrap();
  };

  const handleOpenEmailApp = () => {
    if (typeof window !== "undefined") {
      window.location.href = "mailto:";
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        {step === 1 && (
          <Step1EmailRequired
            email={email}
            onEmailChange={setEmail}
            onSubmit={handleRequestReset}
            loading={forgotPassword.loading}
            error={forgotPassword.error || ""}
          />
        )}

        {step === 2 && (
          <Step2Verification
            email={email}
            onOpenEmailApp={handleOpenEmailApp}
            onResend={handleResend}
            loading={forgotPassword.loading}
          />
        )}

        {step === 3 && (
          <Step3ChangePassword
            onNext={handleResetPassword}
            loading={forgotPassword.loading}
            error={forgotPassword.error || ""}
          />
        )}

        {step === 4 && <Step4PasswordResetResult status="success" />}
      </div>
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div />}>
      <ForgotPasswordPageContent />
    </Suspense>
  );
}