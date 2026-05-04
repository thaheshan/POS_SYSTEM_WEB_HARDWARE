"use client";

import { useEffect, useState } from "react";
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

export default function ForgotPasswordPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const forgotPassword = useSelector(selectForgotPassword);

  const tokenFromQuery = searchParams.get("token")?.trim() ?? "";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(tokenFromQuery ? 3 : 1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(
    tokenFromQuery || null,
  );

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
    await dispatch(
      resetPassword({
        email: email || undefined,
        resetToken: tokenFromQuery || resetToken || undefined,
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
    <>
      {step === 1 && (
        <Step1EmailRequired
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleRequestReset}
          loading={forgotPassword.loading}
          error={forgotPassword.error}
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
        />
      )}

      {step === 4 && <Step4PasswordResetResult status="success" />}
    </>
  );
}
