import axios from "axios";
import { TOKEN_KEY } from "../../lib/store/authSlice";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

// ── In-memory GET cache (session-level, 5-minute TTL) ──────────────────────
// Prevents duplicate Supabase egress when multiple pages call the same endpoints.
// Endpoints: /stock, /products, /customers, /categories, /warehouses, /branches, /suppliers
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHEABLE_PATTERNS = ['/stock', '/products', '/customers', '/categories', '/suppliers', '/warehouses', '/branches', '/units'];
interface CacheEntry { data: any; expiry: number; }
const _cache = new Map<string, CacheEntry>();

export function clearApiCache(urlFragment?: string) {
  if (!urlFragment) { _cache.clear(); return; }
  for (const key of _cache.keys()) {
    if (key.includes(urlFragment)) _cache.delete(key);
  }
}

const api = axios.create({
  // Use environment API URL when available, otherwise local backend for development.
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  headers: {
    'Accept-Encoding': 'gzip, deflate, br',
  },
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// ── Request interceptor: serve from cache for eligible GETs; attach JWT & CSRF tokens
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

    // ── Cache lookup: serve cached GET if fresh (avoids Supabase egress) ──
    const isGet = !config.method || config.method.toLowerCase() === 'get';
    const url = config.url || '';
    if (isGet && CACHEABLE_PATTERNS.some(p => url.includes(p))) {
      const key = url + JSON.stringify(config.params || {});
      const cached = _cache.get(key);
      if (cached && cached.expiry > Date.now()) {
        // Return a resolved promise that looks like an axios response
        config.adapter = () => Promise.resolve({ data: cached.data, status: 200, statusText: 'OK (cached)', headers: {}, config });
      }
    }
  }
  return config;
});

// ── Response interceptor: populate cache; retry transient errors; auto-clear cache on mutations
api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    const url = response.config.url || '';

    // Populate cache for successful cacheable GETs
    if ((!method || method === 'get') && CACHEABLE_PATTERNS.some(p => url.includes(p))) {
      const key = url + JSON.stringify(response.config.params || {});
      const adapterObj = response.config.adapter as any;
      if (!adapterObj || adapterObj.name !== 'bound adapter') { // don't re-cache an already-cached response
        _cache.set(key, { data: response.data, expiry: Date.now() + CACHE_TTL_MS });
      }
    }

    // Auto-clear cache for mutating requests so next GET fetches fresh data
    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
      // Clear cache entries related to the same resource type
      const segments = url.split('/').filter(Boolean);
      const resource = segments[segments.length - 2] || segments[segments.length - 1] || '';
      if (resource) clearApiCache(resource);
    }

    return response;
  },
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
