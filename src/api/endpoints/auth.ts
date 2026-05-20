import api from "../axiosInstance";

export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (payload: {
    email: string;
    token: string;
    newPassword: string;
  }) =>
    // NOTE: use PATCH for idempotent update semantics on the backend reset
    // endpoint. The backend should actually update the user's password.
    api.patch("/auth/reset-password", payload),
};
