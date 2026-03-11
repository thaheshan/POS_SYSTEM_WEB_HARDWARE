import { PaymentErrorDetails, RegistrationDetails } from "@/types/ShopPayment";

export const ShopPaymentDetails: RegistrationDetails = {
  planName: "Professional",
  trialPeriod: 30,
  trialEndDate: "April 09, 2026",
  price: "25,000",
  currency: "Rs.",
  nextPaymentDate: "Apr 09",
  shopId: "SHOP-000001",
  userEmail: "john@abchardware.lk",
};

export const MockPaymentErrors: PaymentErrorDetails = {
  errorCode: "PAYMENT_DECLINED_001",
  errorMessage: "Your card was declined by your bank.",
  commonIssues: [
    "Insufficient funds",
    "Incorrect card details",
    "Card expired",
    "Limit exceeded"
  ]
};