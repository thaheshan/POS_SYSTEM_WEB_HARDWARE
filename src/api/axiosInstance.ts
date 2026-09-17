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

// ── Response interceptor: retry transient network/timeout errors & log warnings
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;

    // Retry transient GET request failures (network errors, timeouts, 502/503/504) up to 2 times
    if (
      config &&
      (config.method?.toLowerCase() === "get" || !config.method) &&
      (!config._retryCount || config._retryCount < 2) &&
      (!error.response || [502, 503, 504, 408].includes(error.response.status) || error.code === "ECONNABORTED" || error.message?.includes("timeout"))
    ) {
      config._retryCount = (config._retryCount || 0) + 1;
      console.warn(`[API] Retrying GET request (${config._retryCount}/2):`, config.url);
      await new Promise((res) => setTimeout(res, config._retryCount * 600));
      return api(config);
    }

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
