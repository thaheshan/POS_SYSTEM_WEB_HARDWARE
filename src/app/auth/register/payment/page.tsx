"use client";

import React, { useState } from "react";
import CheckoutHeader from "@/components/payment/CheckoutHeader";
import PaymentMethodOptions from "@/components/payment/method/PaymentMethodOptions";
import CardForm from "@/components/payment/card/CardForm";
import CardMockup from "@/components/payment/card/CardMockup";
import BillingAddress from "@/components/payment/card/BillingAddress";
import OrderSummary from "@/components/payment/card/OrderSummary";
import SubscriptionSummary from "@/components/payment/method/SubscriptionSummary";
import SecurityFooter from "@/components/payment/processing/SecurityBadge";
import ProcessingBackground from "@/components/payment/processing/ProcessingBackground";
import ProcessingSteps from "@/components/payment/processing/ProcessingSteps";
import PulsatingLock from "@/components/payment/processing/PulsatingLock";
import SecurityBadge from "@/components/payment/processing/SecurityBadge";
import { useRouter } from "next/navigation";

const PROCESSING_STEPS = [
  "Verifying payment details",
  "Processing transaction",
  "Setting up your account",
  "Activating subscription",
];

export default function PaymentPage() {
  const router = useRouter();

  // Payment method
  const [selectedMethod, setSelectedMethod] = useState("card");

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Billing state
  const [sameAddress, setSameAddress] = useState(true);
  const [saveCard, setSaveCard] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAgreed) {
      alert("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsProcessing(true);

    // Simulate processing steps
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      setActiveStep(i);
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    // Navigate to success page after processing
    router.push("/auth/register/success");
  };

  // Processing overlay
  if (isProcessing) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#1D4ED8] flex flex-col items-center justify-center overflow-hidden">
        <ProcessingBackground />
        <SecurityBadge />
        <PulsatingLock />
        <h2 className="text-2xl font-bold text-white mb-2">
          Processing Payment
        </h2>
        <p className="text-blue-200 text-sm mb-10">
          Please don't close this window
        </p>
        <ProcessingSteps steps={PROCESSING_STEPS} activeStep={activeStep} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutHeader step={3} totalSteps={4} backLink="/auth/register" />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Subscription
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Start your 30-day free trial — no charge today
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Method */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <PaymentMethodOptions
                  selectedMethod={selectedMethod}
                  onMethodSelect={setSelectedMethod}
                />
              </div>

              {/* Card Details (only shown when card is selected) */}
              {selectedMethod === "card" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex justify-center">
                    <CardMockup
                      cardNumber={cardNumber}
                      cardName={cardName}
                      expiry={expiry}
                    />
                  </div>
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
                </div>
              )}

              {/* Billing Address & Terms */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <BillingAddress
                  sameAddress={sameAddress}
                  setSameAddress={setSameAddress}
                  saveCard={saveCard}
                  setSaveCard={setSaveCard}
                  termsAgreed={termsAgreed}
                  setTermsAgreed={setTermsAgreed}
                />
                <OrderSummary amount="Rs. 0 Today" buttonText="Start Free Trial" />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <SubscriptionSummary />
                <SecurityFooter />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}