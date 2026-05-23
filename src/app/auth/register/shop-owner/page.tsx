"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Step1ShopInfo } from "@/components/auth/register/registration/step1-shop-info";
import { Step2OwnerInfo } from "@/components/auth/register/registration/step2-owner-info";
import { Step3Pricing } from "@/components/auth/register/registration/step3-pricing";

export default function ShopRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const status = localStorage.getItem('registrationStatus');
    if (status === 'pending_approval') {
      router.replace('/auth/approval-waiting');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleComplete = () => setCurrentStep(4);

  if (isChecking) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <>
      {currentStep === 1 && <Step1ShopInfo onNext={handleNext} />}
      {currentStep === 2 && <Step2OwnerInfo onNext={handleNext} />}
      {currentStep === 3 && <Step3Pricing onComplete={handleComplete} />}
    </>
  );
}