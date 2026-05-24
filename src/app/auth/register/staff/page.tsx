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
  shopVerificationCode: "",
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

  const handleSubmit = async () => {
    try {
      const payload = {
        shopId: data.shopId,
        shopVerificationCode: data.shopVerificationCode,
        firstName: data.fullName.split(' ')[0],
        lastName: data.fullName.split(' ').slice(1).join(' ') || data.fullName.split(' ')[0],
        email: data.email,
        phone: data.phoneNumber,
        role: data.role || 'CASHIER',
        password: data.password,
      };

      // @ts-ignore
      const { authApi } = await import('@/api/auth');
      await authApi.registerStaff(payload);
      
      // Redirect to approval waiting
      window.location.href = '/auth/approval-waiting';
    } catch (error: any) {
      console.error("Staff registration failed:", error);
      alert(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <AuthLayout>
      {currentStep === 1 && (
        <StepOne data={data} updateFields={updateFields} onNext={handleNext} />
      )}
      {currentStep === 2 && (
        <StepTwo data={data} updateFields={updateFields} onNext={handleSubmit} onBack={handleBack} selectedShopId={data.shopId} />
      )}
      {currentStep === 3 && (
        <StepThree data={data} />
      )}
    </AuthLayout>
  );
}