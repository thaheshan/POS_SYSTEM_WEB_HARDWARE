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
    // Simulate progression of steps
    if (activeStep < steps.length) {
      const timer = setTimeout(
        () => {
          setActiveStep((prev) => prev + 1);
        },
        1500 + Math.random() * 1000,
      ); // 1.5 - 2.5 seconds per step
      return () => clearTimeout(timer);
    } else {
      // After all steps complete, redirect to success
      const redirectTimer = setTimeout(() => {
        router.push("/payment/success");
      }, 1000);
      return () => clearTimeout(redirectTimer);
    }
  }, [activeStep, router, steps.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E40AF] via-[#1D4ED8] to-[#1E3A8A] flex flex-col items-center justify-center p-4 sm:p-6 font-sans text-white overflow-hidden relative">
      <ProcessingBackground />

      <div className="z-10 flex flex-col items-center w-full max-w-md rounded-3xl border border-white/20 bg-white/5 backdrop-blur-md px-5 sm:px-7 py-10 sm:py-12 animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight text-center">
          Processing Payment
        </h1>
        <p className="text-blue-100/80 mb-10 sm:mb-12 text-sm text-center leading-relaxed">
          Please wait while we securely process your payment...
        </p>

        <PulsatingLock />

        <ProcessingSteps steps={steps} activeStep={activeStep} />

        <SecurityBadge />

        <p className="text-xs text-white/70 text-center">
          Do not close or refresh this page
        </p>
      </div>
    </div>
  );
}
