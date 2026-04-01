"use client";

import { useState } from "react";
import { PasswordResetState } from "@/types/user";
import Step1EmailRequired from "@/components/auth/passwordReset/Step1EmailRequired";
import Step2Verification from "@/components/auth/passwordReset/Step2Verification";
import Step3ChangePassword from "@/components/auth/passwordReset/Step3ChangePassword";
import Step4PasswordResetResult from "@/components/auth/passwordReset/Step4PasswordResetResult";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [resetState, setResetState] = useState<PasswordResetState>({
    step: 1,
    email: "",
    code: "",
    status: null,
  });

  const updateState = (partial: Partial<PasswordResetState>) => {
    setResetState((prev) => ({ ...prev, ...partial }));
  };

  const goToNextStep = () => {
    updateState({ step: (resetState.step + 1) as any });
  };

  const goToPreviousStep = () => {
    updateState({ step: (resetState.step - 1) as any });
  };

  const setEmail = (email: string) => {
    updateState({ email });
  };

  const setCode = (code: string) => {
    updateState({ code });
  };

  const setStatus = (status: "success" | "failure") => {
    updateState({ status });
  };

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      // <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Render Current Step */}
          {resetState.step === 1 && (
            <Step1EmailRequired
              email={resetState.email}
              onEmailChange={setEmail}
              onNext={goToNextStep}
            />
          )}

          {resetState.step === 2 && (
            <Step2Verification email={resetState.email} onNext={goToNextStep} code={""} onCodeChange={function (code: string): void {
              throw new Error("Function not implemented.");
            } } onBack={function (): void {
              throw new Error("Function not implemented.");
            } } />
          )}

          {resetState.step === 3 && (
            <Step3ChangePassword
              onNext={() => {
                setStatus("success");
                goToNextStep();
              }}
              onBack={goToPreviousStep}
            />
          )}

          {resetState.step === 4 && (
            <Step4PasswordResetResult status={resetState.status} />
          )}
        </div>
      // </div>
    // </div>
  );
}
