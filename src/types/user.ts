export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "cashier" | "manager" | "staff";
  phone?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type PasswordResetStep = 1 | 2 | 3 | 4;
export type PasswordResetStatus = "success" | "failure" | null;

export interface PasswordResetState {
  step: PasswordResetStep;
  email: string;
  code: string;
  status: PasswordResetStatus;
}
