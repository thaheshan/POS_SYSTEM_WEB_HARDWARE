"use client";

import { useEffect, useState } from "react";
import CheckoutHeader from "../CheckoutHeader";
import CardMockup from "./CardMockup";
import CardForm from "./CardForm";
import BillingAddress from "./BillingAddress";
import OrderSummary from "./OrderSummary";

interface CardPageProps {
  onSubmit: () => void;
  onBack: () => void;
}

export default function CardPage({ onSubmit, onBack }: CardPageProps) {
  const [cardNumber, setCardNumber] = useState("1234 5678 9012 3456");
  const [cardName, setCardName] = useState("JOHN SILVA");
  const [expiry, setExpiry] = useState("12/26");
  const [cvv, setCvv] = useState("123");

  const [sameAddress, setSameAddress] = useState(true);
  const [saveCard, setSaveCard] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isCardFormValid, setIsCardFormValid] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errorAttemptCount, setErrorAttemptCount] = useState(0);

  useEffect(() => {
    if (termsAgreed && isCardFormValid && submitError) {
      setSubmitError("");
    }
  }, [termsAgreed, isCardFormValid, submitError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCardFormValid) {
      setSubmitError("Please complete all required card fields correctly.");
      setErrorAttemptCount((prev) => prev + 1);
      return;
    }

    if (!termsAgreed) {
      setSubmitError("");
      setErrorAttemptCount((prev) => prev + 1);
      return;
    }

    setSubmitError("");
    onSubmit();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <CheckoutHeader step={2} totalSteps={4} onBack={onBack} />

      <main className="flex-grow flex flex-col items-center py-8 md:py-10 px-4 sm:px-6 w-full max-w-3xl mx-auto">
        <CardMockup
          cardNumber={cardNumber}
          cardName={cardName}
          expiry={expiry}
        />

        <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6 md:p-7 mb-8">
          <form onSubmit={handleSubmit} className="space-y-7">
            <CardForm
              cardNumber={cardNumber}
              setCardNumber={setCardNumber}
              cardName={cardName}
              setCardName={setCardName}
              expiry={expiry}
              setExpiry={setExpiry}
              cvv={cvv}
              setCvv={setCvv}
              onValidationChange={setIsCardFormValid}
            />

            <BillingAddress
              sameAddress={sameAddress}
              setSameAddress={setSameAddress}
              saveCard={saveCard}
              setSaveCard={setSaveCard}
              termsAgreed={termsAgreed}
              setTermsAgreed={setTermsAgreed}
            />

            {errorAttemptCount > 0 && !termsAgreed && (
              <p
                key={`terms-error-${errorAttemptCount}`}
                className="text-sm text-red-600 font-medium inline-error-animate"
                role="alert"
              >
                Please agree to the Terms of Service and Privacy Policy to
                continue.
              </p>
            )}

            {submitError && (
              <p
                key={`submit-error-${errorAttemptCount}`}
                className="text-sm text-red-600 font-medium inline-error-animate"
                role="alert"
              >
                {submitError}
              </p>
            )}

            <OrderSummary
              amount="Rs. 0 (Trial)"
              buttonText="Confirm & Start Trial"
            />
          </form>
        </div>
      </main>
    </div>
  );
}
