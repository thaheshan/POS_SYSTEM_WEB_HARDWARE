"use client";

import React, { useState } from "react";
import StepOne from "@/components/staff-register/StepOne";
import StepTwo from "@/components/staff-register/StepTwo";
import StepThree from "@/components/staff-register/StepThree";
import ProgressBar from "@/components/staff-register/ProgressBar";
import { StaffRegisterData } from "@/types/staff";

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

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setError(null);
      console.log("Sending data to database:", { ...formData });
      // TODO: Replace with actual API call
      setCurrentStep(3);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Registration failed. Please try again.");
    }
  };

  const updateFields = (fields: Partial<StaffRegisterData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () => setCurrentStep((i) => Math.min(i + 1, 3));
  const prevStep = () => setCurrentStep((i) => Math.max(i - 1, 1));

  return (
    <main className="min-h-screen bg-white flex flex-col items-center">
      <div className="w-full">
        <ProgressBar
          currentStep={currentStep}
          totalSteps={3}
          onBack={currentStep > 1 ? prevStep : undefined}
        />
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
            onNext={handleSubmit}
            onBack={prevStep}
          />
        )}
        {currentStep === 3 && <StepThree data={formData} />}
      </div>
    </main>
  );
}
