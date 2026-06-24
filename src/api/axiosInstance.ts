import axios from "axios";
import { TOKEN_KEY } from "../../lib/store/authSlice";

const api = axios.create({
  // Use environment API URL when available, otherwise local backend for development.
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
});

// ── Request interceptor: attach JWT to every API call
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle expired / invalid token (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error?.response?.status === 401
    ) {
      console.warn("[API] Token expired or unauthorized — clearing session and redirecting to login.");
      // Clear all stored auth data
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("pos_user");
      // Remove cookie
      document.cookie = "pos_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      // Redirect to login only if not already there
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
