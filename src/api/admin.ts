const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Helper to get the auth token from cookies
const getToken = () => {
  if (typeof document === "undefined") return null;
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("pos_token="))
    ?.split("=")[1];
  return token;
};

// Types
export interface PendingShop {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  shop: {
    id: string;
    name: string;
    businessRegistration: string;
  };
}

export const adminApi = {
  // Fetch all pending shop registrations
  getPendingShops: async (): Promise<PendingShop[]> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/pending-shops`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to fetch pending shops");
    }

    return response.json();
  },

  // Approve a shop owner
  approveShop: async (userId: string): Promise<{ message: string }> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/approve-shop/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to approve shop");
    }

    return response.json();
  },

  // Reject a shop owner
  rejectShop: async (userId: string): Promise<{ message: string }> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/reject-shop/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to reject shop");
    }

    return response.json();
  },
};
