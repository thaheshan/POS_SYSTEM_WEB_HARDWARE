export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'cashier' | 'manager';
  phone?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
