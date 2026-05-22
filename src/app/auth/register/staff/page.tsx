"use client";

import { useState } from "react";
import axios from "axios";
import AuthLayout from "@/components/login/auth/auth-layout";
import StepOne from "@/components/staff-register/StepOne";
import StepTwo from "@/components/staff-register/StepTwo";
import StepThree from "@/components/staff-register/StepThree";
import { useAppDispatch } from "@/store/hooks";
import { useForm } from "react-hook-form";
import {
  StaffRegistrationFormValues,
  staffRegistrationSchema,
} from "@/lib/validation/staffRegistration.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerStaff } from "@/store/slices/staffSlice";

type ServerValidation = { errors: Record<string, string | string[]> };

function isServerValidation(obj: unknown): obj is ServerValidation {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "errors" in obj &&
    typeof (obj as any).errors === "object"
  );
}

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues,
    setError,
  } = useForm<StaffRegistrationFormValues>({
    resolver: zodResolver(staffRegistrationSchema),
    mode: "onChange",
  });

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  function getErrorMessage(
    error: unknown,
    fallback = "Registration failed. This email might already be in use."
  ): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    if (error !== null && typeof error === "object" && "message" in error) {
      return String((error as any).message);
    }
    return fallback;
  }

  const onSubmitFinal = async (data: StaffRegistrationFormValues) => {
    const payload = {
      full_name: data.full_name,
      email: data.email,
      mobile_number: data.phone,
      shop_id: data.shop_id,
      role: data.role,
      password: data.password,
    };
    try {
      await dispatch(registerStaff(payload)).unwrap();
      setCurrentStep(3);
    } catch (error: unknown) {
      console.error("Error registering staff:", error);

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        if (isServerValidation(responseData)) {
          Object.entries(responseData.errors).forEach(([field, msg]) =>
            setError(field as keyof StaffRegistrationFormValues, {
              type: "server",
              message: Array.isArray(msg) ? String(msg[0]) : String(msg),
            })
          );
          setCurrentStep(1);
          return;
        }
      }

      if (isServerValidation(error)) {
        Object.entries(error.errors).forEach(([field, msg]) =>
          setError(field as keyof StaffRegistrationFormValues, {
            type: "server",
            message: Array.isArray(msg) ? String(msg[0]) : String(msg),
          })
        );
        setCurrentStep(1);
        return;
      }
      
      const errorMessage = getErrorMessage(error);
      if (errorMessage.toLowerCase().includes("email")) {
        setError("email", { type: "server", message: errorMessage });
        setCurrentStep(1);
        return;
      }

      setError("root.serverError", { type: "server", message: errorMessage });
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit(onSubmitFinal)} className="w-full">
        {currentStep === 1 && (
          <StepOne
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            trigger={trigger}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <StepTwo
            register={register}
            errors={errors}
            watch={watch}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && <StepThree formValues={getValues()} />}
      </form>
    </AuthLayout>
  );
}