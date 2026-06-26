"use client";

import React, { Suspense } from "react";
import AuthLayout from "@/components/login/auth/auth-layout";
import LoginForm from "@/components/login/auth/login-form";

export default function LoginPage() {
  return (
    // Shared auth layout keeps login/register screens visually consistent.
    <AuthLayout>
      {/* LoginForm handles submit, thunk dispatch, and redirect logic. */}
      <Suspense fallback={
        <div className="flex items-center justify-center p-6 text-white/50">
          Loading login...
        </div>
      }>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
