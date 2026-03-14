"use client";
import ShopRegistraionComplete from "@/components/auth/register/registration/RegistraionComplete";
import { RegistrationHeader } from "@/components/auth/register/registration/registration-header";
import { RegistrationProvider } from "@/lib/register/registration-context";
import { useRouter } from "next/navigation";
import React from "react";

export default function Page() {
  const router = useRouter();
  return (
    <RegistrationProvider>
      <RegistrationHeader onBack={() => router.back()} />
      <ShopRegistraionComplete />
    </RegistrationProvider>
  );
}
