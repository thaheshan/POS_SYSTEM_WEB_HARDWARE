"use client";

import { useState } from "react";
import { Step1ShopInfo } from "@/components/auth/register/registration/step1-shop-info";
import { Step2OwnerInfo } from "@/components/auth/register/registration/step2-owner-info";


export default function ShopRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleComplete = () => setCurrentStep(4);

  return (
    <>
      {currentStep === 1 && <Step1ShopInfo onNext={handleNext} />}
      {currentStep === 2 && <Step2OwnerInfo onNext={handleNext} />}
   
    </>
  );
}