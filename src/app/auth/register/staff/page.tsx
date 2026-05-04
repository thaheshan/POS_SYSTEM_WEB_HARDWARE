"use client";

import { useActionState, useState } from "react";
import AuthLayout from "@/components/login/auth/auth-layout";
import StepOne from "@/components/staff-register/StepOne";
import StepTwo from "@/components/staff-register/StepTwo";
import StepThree from "@/components/staff-register/StepThree";
import { useAppDispatch } from "@/store/hooks";
import { Form, useForm } from "react-hook-form";
import {
  StaffRegistrationFormValues,
  staffRegistrationSchema,
} from "@/lib/validation/staffRegistration.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerStaff } from "@/store/slices/staffSlice";

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
  } = useForm<StaffRegistrationFormValues>({
    resolver: zodResolver(staffRegistrationSchema),
    mode: "onChange",
  });

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const onSubmitFinal = async (data: StaffRegistrationFormValues) => {
    const nameParts = data.full_name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email: data.email,
      phone: data.phone,
      tenant_id: data.shop_id,
      shop_id: data.shop_id,
      role: data.role,
      password: data.password,
    };

    try {
      await dispatch(registerStaff(payload)).unwrap();
      setCurrentStep(3);
    } catch (error) {
      console.error("Error registering staff:", error);
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

        {currentStep === 3 && (
          <StepThree
            formValues={getValues()}
          />
        )}
      </form>
    </AuthLayout>
  );
}
