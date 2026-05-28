"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/api/auth";
import ProcessingBackground from "./ProcessingBackground";
import PulsatingLock from "./PulsatingLock";
import ProcessingSteps from "./ProcessingSteps";
import SecurityBadge from "./SecurityBadge";

interface ProcessingPageProps {
  onComplete: (success: boolean) => void;
}

export default function ProcessingPage({ onComplete }: ProcessingPageProps) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    "Validating card details",
    "Contacting payment gateway",
    "Activating your account",
  ];

  useEffect(() => {
    if (activeStep < steps.length) {
      const timer = setTimeout(
        () => {
          setActiveStep((prev) => prev + 1);
        },
        1500 + Math.random() * 1000,
      );

      return () => clearTimeout(timer);
    }

    const processPayment = async () => {
      try {
        // Simulate payment gateway delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Use email from localStorage (set during registration) to complete payment
        const email = typeof window !== "undefined"
          ? localStorage.getItem("pendingEmail")
          : null;

        if (!email) {
          throw new Error("No pending email found. Please try again.");
        }

        await authApi.completePaymentByEmail(email);

        // Clear registration state now that payment is done
        localStorage.removeItem("registrationStatus");
        localStorage.removeItem("pendingEmail");

        onComplete(true);
      } catch (error) {
        console.error("Payment failed:", error);
        onComplete(false);
      }
    };

    processPayment();
  }, [activeStep, onComplete, steps.length]);

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
