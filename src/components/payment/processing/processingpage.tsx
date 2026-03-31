"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProcessingBackground from "@/components/payment/processing/ProcessingBackground";
import PulsatingLock from "@/components/payment/processing/PulsatingLock";
import ProcessingSteps from "@/components/payment/processing/ProcessingSteps";
import SecurityBadge from "@/components/payment/processing/SecurityBadge";

export default function ProcessingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    "Validating card details",
    "Contacting payment gateway",
    "Creating your account",
  ];

  useEffect(() => {
    if (activeStep < steps.length) {
      const timer = setTimeout(
        () => setActiveStep((prev) => prev + 1),
        1500 + Math.random() * 1000
      );
      return () => clearTimeout(timer);
    } else {
      const redirectTimer = setTimeout(() => {
        router.push("/payment/success");
      }, 1000);
      return () => clearTimeout(redirectTimer);
    }
  }, [activeStep, router, steps.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] flex flex-col items-center justify-center p-4 font-sans text-white overflow-hidden relative">
      <ProcessingBackground />

      <div className="z-10 flex flex-col items-center w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">
          Processing Payment
        </h1>
        <p className="text-blue-100/80 mb-16 text-sm">
          Please wait while we securely process your payment...
        </p>

        <PulsatingLock />

        <ProcessingSteps steps={steps} activeStep={activeStep} />

        <SecurityBadge />

        <p className="text-xs text-white/60">
          Do not close or refresh this page
        </p>
      </div>
    </div>
  );
}