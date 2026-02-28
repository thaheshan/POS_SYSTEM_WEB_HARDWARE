"use client";

import React, { useState } from "react";
import StepOne from "./componets/StepOne";
import StepThree from "./componets/StepThree";
import StepTwo from "./componets/StepTwo";
import ProgressBar from "@/components/staff/ProgressBar";

export interface StaffRegisterData {
  shopId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  password: string;
  confirmPassword: string;
  shopPrivateId: string;
  shopNameVerification: string;
}

export default function StaffRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<StaffRegisterData>({
    shopId: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "",
    password: "",
    confirmPassword: "",
    shopPrivateId: "",
    shopNameVerification: "",
  });

  const updateFields = (fields: Partial<StaffRegisterData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () => setCurrentStep((i) => i + 1);
  const prevStep = () => setCurrentStep((i) => i - 1);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center">
     
        <div className="w-full">
          <ProgressBar currentStep={currentStep} totalSteps={3} />
        </div>
        <div className="w-full max-w-[540px] px-6 py-12 lg:py-20 flex flex-col items-center">
          {" "}
          {currentStep === 1 && (
            <StepOne
              data={formData}
              updateFields={updateFields}
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <StepTwo
              data={formData}
              updateFields={updateFields}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 3 && <StepThree data={formData} />}
        </div>
    </main>
  );
}
