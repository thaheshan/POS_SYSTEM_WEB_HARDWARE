import axios from "axios";
import { TOKEN_KEY } from "../../lib/store/authSlice";

const api = axios.create({
  // Use environment API URL when available, otherwise local backend for development.
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1",
});

api.interceptors.request.use((config) => {
  // Attach JWT to every API call when the user is authenticated.
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) {
    // Backend expects token in Authorization header.
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
