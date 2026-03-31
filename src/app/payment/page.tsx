"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import CheckoutHeader from "@/components/payment/CheckoutHeader";
import SubscriptionSummary from "@/components/payment/method/SubscriptionSummary";
import PaymentMethodOptions from "@/components/payment/method/PaymentMethodOptions";
import SecurityFooter from "@/components/payment/method/SecurityFooter";
import CardMockup from "@/components/payment/card/CardMockup";
import CardForm from "@/components/payment/card/CardForm";
import BillingAddress from "@/components/payment/card/BillingAddress";
import OrderSummary from "@/components/payment/card/OrderSummary";
import ProcessingBackground from "@/components/payment/processing/ProcessingBackground";
import PulsatingLock from "@/components/payment/processing/PulsatingLock";
import ProcessingSteps from "@/components/payment/processing/ProcessingSteps";
import SecurityBadge from "@/components/payment/processing/SecurityBadge";
import { useEffect } from "react";

type Screen = "method" | "card" | "processing" | "success";

export default function PaymentPage() {
  const [screen, setScreen] = useState<Screen>("method");

  // ─── Method Screen State ───────────────────────────────────────────
  const [selectedMethod, setSelectedMethod] = useState<string>("card");

  // ─── Card Screen State ─────────────────────────────────────────────
  const [cardNumber, setCardNumber] = useState("1234 5678 9012 3456");
  const [cardName, setCardName] = useState("JOHN SILVA");
  const [expiry, setExpiry] = useState("12/26");
  const [cvv, setCvv] = useState("123");
  const [sameAddress, setSameAddress] = useState(true);
  const [saveCard, setSaveCard] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // ─── Processing Screen State ───────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    "Validating card details",
    "Contacting payment gateway",
    "Creating your account",
  ];

  // Drive processing steps forward automatically
  useEffect(() => {
    if (screen !== "processing") return;

    if (activeStep < steps.length) {
      const timer = setTimeout(
        () => setActiveStep((prev) => prev + 1),
        1500 + Math.random() * 1000
      );
      return () => clearTimeout(timer);
    } else {
      const redirectTimer = setTimeout(() => {
        setScreen("success");
      }, 1000);
      return () => clearTimeout(redirectTimer);
    }
  }, [screen, activeStep, steps.length]);

  // Reset processing state every time user reaches that screen
  useEffect(() => {
    if (screen === "processing") {
      setActiveStep(0);
    }
  }, [screen]);

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    if (method === "card") setScreen("card");
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScreen("processing");
  };

  const backLink: Record<Screen, Screen | null> = {
    method: null,
    card: "method",
    processing: null,
    success: null,
  };

  const stepNumber: Record<Screen, number> = {
    method: 2,
    card: 3,
    processing: 4,
    success: 4,
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">

      {/* ── Payment Method Screen ───────────────────────────────────── */}
      {screen === "method" && (
        <>
          <CheckoutHeader
            step={stepNumber.method}
            totalSteps={4}
            backLink="/dashboard"
          />
          <main className="flex-grow flex flex-col items-center py-10 px-4 sm:px-6 w-full max-w-2xl mx-auto">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-[#128C7E] rounded-full flex items-center justify-center mb-4 shadow-sm">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                Payment Method
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Choose how you&apos;d like to pay
              </p>
            </div>

            <div className="w-full space-y-6">
              <SubscriptionSummary />
              <PaymentMethodOptions
                selectedMethod={selectedMethod}
                onMethodSelect={handleMethodSelect}
              />
            </div>

            <SecurityFooter />
          </main>
        </>
      )}

      {/* ── Card Details Screen ─────────────────────────────────────── */}
      {screen === "card" && (
        <>
          <CheckoutHeader
            step={stepNumber.card}
            totalSteps={4}
            backLink="#"
          />
          <main className="flex-grow flex flex-col items-center py-10 px-4 sm:px-6 w-full max-w-2xl mx-auto mb-10">
            <CardMockup
              cardNumber={cardNumber}
              cardName={cardName}
              expiry={expiry}
            />

            <div className="w-full">
              <form onSubmit={handleCardSubmit} className="space-y-6">
                <CardForm
                  cardNumber={cardNumber}
                  setCardNumber={setCardNumber}
                  cardName={cardName}
                  setCardName={setCardName}
                  expiry={expiry}
                  setExpiry={setExpiry}
                  cvv={cvv}
                  setCvv={setCvv}
                />

                <BillingAddress
                  sameAddress={sameAddress}
                  setSameAddress={setSameAddress}
                  saveCard={saveCard}
                  setSaveCard={setSaveCard}
                  termsAgreed={termsAgreed}
                  setTermsAgreed={setTermsAgreed}
                />

                <OrderSummary
                  amount="Rs. 0 (Trial)"
                  buttonText="Confirm & Start Trial"
                />
              </form>
            </div>
          </main>
        </>
      )}

      {/* ── Processing Screen ───────────────────────────────────────── */}
      {screen === "processing" && (
        <div className="min-h-screen bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] flex flex-col items-center justify-center p-4 text-white overflow-hidden relative">
          <ProcessingBackground />

          <div className="z-10 flex flex-col items-center w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">
              Processing Payment
            </h1>
            <p className="text-blue-100/80 mb-16 text-sm">
              Please wait while we securely process your payment...
            </p>

            <PulsatingLock />

            <ProcessingSteps steps={steps} activeStep={activeStep} />

            <SecurityBadge />

            <p className="text-xs text-white/60">
              Do not close or refresh this page
            </p>
          </div>
        </div>
      )}

      {/* ── Success Screen ──────────────────────────────────────────── */}
      {screen === "success" && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Payment Successful!
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Your 30-day free trial has started. Welcome aboard!
          </p>
          <button
            onClick={() => setScreen("method")}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}