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
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {resetState.step === 1 && (
            <Step1EmailRequired
              email={resetState.email}
              onEmailChange={setEmail}
              onNext={goToNextStep}
            />
          )}

          {resetState.step === 2 && (
            <Step2Verification
              email={resetState.email}
              code={resetState.code}
              onCodeChange={setCode}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
            />
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
  );
}
