"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Check, Shield } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] flex flex-col items-center justify-center p-4 font-sans text-white overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="z-10 flex flex-col items-center w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">
          Processing Payment
        </h1>
        <p className="text-blue-100/80 mb-16 text-sm">
          Please wait while we securely process your payment...
        </p>

        {/* Pulsating Lock Icon */}
        <div className="relative mb-20 flex items-center justify-center">
          {/* Inner pulsating ring */}
          <div className="absolute w-24 h-24 bg-white/10 rounded-full animate-ping opacity-75"></div>
          {/* Middle ring */}
          <div className="absolute w-32 h-32 border border-white/20 rounded-full"></div>
          {/* Outer ring */}
          <div className="absolute w-40 h-40 border border-white/10 rounded-full"></div>

          <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center z-10 shadow-xl border border-white/30">
            <Lock className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Steps */}
        <div className="w-full space-y-4 mb-16 px-8">
          {steps.map((text, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;
            const isPending = index > activeStep;

            return (
              <div
                key={text}
                className={`flex items-center gap-4 transition-all duration-500 ${
                  isPending ? "opacity-40" : "opacity-100"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                    isCompleted
                      ? "bg-[#10B981] text-white"
                      : isActive
                        ? "border-2 border-[#10B981] border-l-transparent animate-spin"
                        : "border-2 border-white/20"
                  }`}
                >
                  {isCompleted && (
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${isCompleted ? "text-white" : "text-blue-50"}`}
                >
                  {text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-8">
          <Shield className="w-4 h-4 text-white/80" />
          <span className="text-xs font-semibold text-white/90">
            256-bit SSL Encrypted
          </span>
        </div>

        <p className="text-xs text-white/60">
          Do not close or refresh this page
        </p>
      </div>
    </div>
  );
}
