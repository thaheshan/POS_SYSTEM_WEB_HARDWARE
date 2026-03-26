"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutHeader from "@/components/payment/CheckoutHeader";
import CardMockup from "@/components/payment/card/CardMockup";
import CardForm from "@/components/payment/card/CardForm";
import BillingAddress from "@/components/payment/card/BillingAddress";
import OrderSummary from "@/components/payment/card/OrderSummary";

export default function CardDetailsPage() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState("1234 5678 9012 3456");
  const [cardName, setCardName] = useState("JOHN SILVA");
  const [expiry, setExpiry] = useState("12/26");
  const [cvv, setCvv] = useState("123");

  const [sameAddress, setSameAddress] = useState(true);
  const [saveCard, setSaveCard] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAgreed) {
      return;
    }

    router.push("/payment/processing");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <CheckoutHeader step={3} totalSteps={4} backLink="/payment/method" />

      <main className="flex-grow flex flex-col items-center py-8 md:py-10 px-4 sm:px-6 w-full max-w-3xl mx-auto">
        {/* Card Mockup */}
        <CardMockup
          cardNumber={cardNumber}
          cardName={cardName}
          expiry={expiry}
        />

        {/* Card Form */}
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
              disabled={!termsAgreed}
            />
          </form>
        </div>
      </main>
    </div>
  );
}
