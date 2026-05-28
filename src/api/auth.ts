const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const authApi = {
  async checkStatus(email: string): Promise<{ status: string; paymentStatus: string | null }> {
    const response = await fetch(`${API_URL}/auth/check-status?email=${encodeURIComponent(email)}`);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Status check failed');
    }
    // Unwrap the response.interceptor.ts format
    return json.data || json;
  },
  async getActiveShops(): Promise<{ id: string; name: string }[]> {
    const response = await fetch(`${API_URL}/system/shops`);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Failed to fetch shops');
    }
    return json.data || json;
  },
  async cancelRegistration(email: string) {
    const response = await fetch(`${API_URL}/auth/cancel-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Cancellation failed');
    }
    return json.data || json;
  },
  async registerShopOwner(data: any) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    return response.json();
  },

  async registerStaff(data: any) {
    const response = await fetch(`${API_URL}/auth/register/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    return response.json();
  },

  async requestPasswordReset(email: string) {
    const response = await fetch(`${API_URL}/auth/password-reset-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  },

  async resetPassword(data: any) {
    const response = await fetch(`${API_URL}/auth/password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Reset failed');
    }
    return response.json();
  },

  async completePayment(token: string) {
    const response = await fetch(`${API_URL}/auth/complete-payment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment completion failed');
    }
    return response.json();
  },

  async completePaymentByEmail(email: string) {
    const response = await fetch(`${API_URL}/auth/complete-payment-by-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Payment completion failed');
    }
    return json.data || json;
  },
};
