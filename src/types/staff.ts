export interface StaffRegisterData {
  shopId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  password?: string;
  confirmPassword?: string;
  shopPrivateId?: string;
  shopNameVerification?: string;
}