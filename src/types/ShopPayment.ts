export interface RegistrationDetails {
  planName: string;
  trialPeriod: number;
  trialEndDate: string;
  price: string;
  currency: string;
  nextPaymentDate: string;
  shopId: string;
  userEmail: string;
}

export interface PaymentErrorDetails {
  errorCode: string;
  errorMessage: string;
  commonIssues: string[];
}