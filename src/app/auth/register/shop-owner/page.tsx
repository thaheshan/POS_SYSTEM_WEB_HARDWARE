"use client";

import { useState } from "react";
import { Step1ShopInfo } from "@/components/auth/register/registration/step1-shop-info";
import { Step2OwnerInfo } from "@/components/auth/register/registration/step2-owner-info";
import { Step3Pricing } from "@/components/auth/register/registration//step3-pricing";
import ShopRegistrationComplete from "@/components/auth/register/registration//RegistraionComplete";

export default function ShopRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleComplete = () => setCurrentStep(4);

  return (
    <>
      {currentStep === 1 && <Step1ShopInfo onNext={handleNext} />}
      {currentStep === 2 && <Step2OwnerInfo onNext={handleNext} />}
      {currentStep === 3 && <Step3Pricing onComplete={handleComplete} />}
      {currentStep === 4 && <ShopRegistrationComplete />}
    </>
  );
}