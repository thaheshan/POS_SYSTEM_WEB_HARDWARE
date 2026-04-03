"use client";

import { useState } from "react";
import MethodPage from "@/components/payment/method/MethodPage";
import CardPage from "@/components/payment/card/CardPage";
import ProcessingPage from "@/components/payment/processing/ProcessingPage";
import PaymentSuccessContent from "@/components/payment/status/success/PaymentSuccessContent";
import PaymentFailedContent from "@/components/payment/status/failed/PaymentFailedContent";

type PaymentStep = "method" | "card" | "processing" | "success" | "failed";

export default function PaymentPage() {
  const [step, setStep] = useState<PaymentStep>("method");

  if (step === "card") {
    return (
      <CardPage
        onBack={() => setStep("method")}
        onSubmit={() => setStep("processing")}
      />
    );
  }

  if (step === "processing") {
    return (
      <ProcessingPage
        onComplete={(success) => setStep(success ? "success" : "failed")}
      />
    );
  }

  if (step === "success") {
    return <PaymentSuccessContent onBack={() => setStep("method")} />;
  }

  if (step === "failed") {
    return (
      <PaymentFailedContent
        onBack={() => setStep("card")}
        onTryAgain={() => setStep("card")}
        onDifferentMethod={() => setStep("method")}
      />
    );
  }

  return (
    <MethodPage
      onContinue={(method) => {
        if (method === "card") {
          setStep("card");
          return;
        }

        setStep("processing");
      }}
    />
  );
}
