"use client";

import { useState } from "react";
import AuthLayout from "@/components/login/auth/auth-layout";
import StepOne from "@/components/staff-register/StepOne";
import StepTwo from "@/components/staff-register/StepTwo";
import StepThree from "@/components/staff-register/StepThree";
import { StaffRegisterData } from "@/types/staff";

const defaultData: StaffRegisterData = {
  shopId: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  role: "",
  shopPrivateId: "",
  shopNameVerification: "",
  password: "",
  confirmPassword: "",
};

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<StaffRegisterData>(defaultData);

  const updateFields = (fields: Partial<StaffRegisterData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = () => {
    // TODO: call your API here
    console.log("Final submission:", data);
    handleNext(); // move to step 3
  };

  return (
    <AuthLayout>
      {currentStep === 1 && (
        <StepOne data={data} updateFields={updateFields} onNext={handleNext} />
      )}
      {currentStep === 2 && (
        <StepTwo data={data} updateFields={updateFields} onNext={handleSubmit} onBack={handleBack} />
      )}
      {currentStep === 3 && (
        <StepThree data={data} />
      )}
    </AuthLayout>
  );
}