export interface StaffRegisterData {
  shopId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  password?: string;
  confirmPassword?: string;
  shopVerificationCode?: string;
  shopNameVerification?: string;
  shopPrivateId?: string;
}