"use client";

import AuthLayout from "@/components/login/auth/auth-layout";
import LoginForm from "@/components/login/auth/login-form";

export default function LoginPage() {
  return (
    // Shared auth layout keeps login/register screens visually consistent.
    <AuthLayout>
      {/* LoginForm handles submit, thunk dispatch, and redirect logic. */}
      <LoginForm />
    </AuthLayout>
  );
}
