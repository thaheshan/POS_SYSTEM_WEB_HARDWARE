import axios from "axios";
import { TOKEN_KEY } from "../../lib/store/authSlice";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

const api = axios.create({
  // Use environment API URL when available, otherwise local backend for development.
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// ── Request interceptor: attach JWT & CSRF tokens to every API call
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Extract CSRF token from cookies or localStorage if backend requires it
    const xsrfToken =
      getCookie("XSRF-TOKEN") ||
      getCookie("csrf_token") ||
      getCookie("X-CSRF-TOKEN") ||
      localStorage.getItem("csrf_token") ||
      localStorage.getItem("xsrf_token");

    if (xsrfToken) {
      const decoded = decodeURIComponent(xsrfToken);
      config.headers["X-XSRF-TOKEN"] = decoded;
      config.headers["X-CSRF-TOKEN"] = decoded;
    }
  }
  return config;
});

// ── Response interceptor: log 401 warnings without auto-evicting working users
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error?.response?.status === 401
    ) {
      console.warn("[API] 401 Unauthorized encountered on endpoint:", error?.config?.url);
    }
    return Promise.reject(error);
  }
);

export default api;
