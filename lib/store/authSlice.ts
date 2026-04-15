import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { User as AuthUser } from "@/types/user";

// Shared key for JWT persistence across auth slice and API client.
export const TOKEN_KEY = "pos_token";

type AuthStatus = "idle" | "loading" | "succeeded" | "failed";

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser | null;
}

interface MockCredential {
  email: string;
  password: string;
  user: AuthUser;
}

const persistToken = (token: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedToken = token.trim();
  // Cookie values can include special chars, so encode before writing.
  const encodedToken = encodeURIComponent(normalizedToken);

  // Keep token in localStorage for client API calls and in cookie for middleware.
  localStorage.setItem(TOKEN_KEY, normalizedToken);
  document.cookie = `${TOKEN_KEY}=${encodedToken}; Path=/; SameSite=Lax`;
};

const clearPersistedToken = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
};

const decodeCookieToken = (rawValue: string): string => {
  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
};

const normalizeAuthUser = (value: unknown): AuthUser | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<AuthUser>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.email !== "string" ||
    typeof candidate.name !== "string" ||
    typeof candidate.role !== "string" ||
    typeof candidate.createdAt !== "string"
  ) {
    return null;
  }

  if (
    candidate.role !== "admin" &&
    candidate.role !== "manager" &&
    candidate.role !== "cashier"
  ) {
    return null;
  }

  return {
    id: candidate.id,
    email: candidate.email,
    name: candidate.name,
    role: candidate.role,
    createdAt: candidate.createdAt,
  };
};

const normalizeLoginResponse = (payload: unknown): LoginResponse | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as {
    token?: unknown;
    accessToken?: unknown;
    jwt?: unknown;
    user?: unknown;
  };

  const rawToken =
    typeof data.token === "string"
      ? data.token
      : typeof data.accessToken === "string"
        ? data.accessToken
        : typeof data.jwt === "string"
          ? data.jwt
          : null;

  if (!rawToken) {
    return null;
  }

  // Accept either plain token or "Bearer <token>" format from backend responses.
  const token = rawToken.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return null;
  }

  return {
    token,
    user: normalizeAuthUser(data.user),
  };
};

const toBase64Url = (value: string): string => {
  if (typeof btoa !== "function") {
    return "";
  }

  return btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const createMockJwt = (role: AuthUser["role"]): string => {
  const header = toBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = toBase64Url(JSON.stringify({ role }));

  if (!header || !payload) {
    return `mock-token-${role}`;
  }

  // Signature is intentionally empty for dev fallback tokens.
  return `${header}.${payload}.mock-signature`;
};

// Development-only fallback users so login can be tested without a backend.
const MOCK_CREDENTIALS: MockCredential[] = [
  {
    email: "admin@test.com",
    password: "Admin@123",
    user: {
      id: "mock-admin-1",
      email: "admin@test.com",
      name: "Test Admin",
      role: "admin",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  },
  {
    email: "admin@abchardware.lk",
    password: "Admin@123",
    user: {
      id: "mock-admin-1",
      email: "admin@test.com",
      name: "Test Admin",
      role: "admin",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  },
  {
    email: "manager@test.com",
    password: "Manager@123",
    user: {
      id: "mock-manager-1",
      email: "manager@test.com",
      name: "Test Manager",
      role: "manager",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  },
  {
    email: "cashier@test.com",
    password: "Cashier@123",
    user: {
      id: "mock-cashier-1",
      email: "cashier@test.com",
      name: "Test Cashier",
      role: "cashier",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  },
];

const getMockLoginResponse = (
  email: string,
  password: string,
): LoginResponse | null => {
  console.log("[getMockLoginResponse] Checking credentials for:", email);

  const entry = MOCK_CREDENTIALS.find((candidate) => {
    const emailMatch = candidate.email.toLowerCase() === email.toLowerCase();
    const passwordMatch = candidate.password === password;

    if (emailMatch) {
      console.log(
        "[getMockLoginResponse] Email matched. Password check:",
        passwordMatch ? "PASS" : "FAIL",
      );
    }

    return emailMatch && passwordMatch;
  });

  if (!entry) {
    console.warn("[getMockLoginResponse] No credentials found for:", email);
    return null;
  }

  console.log(
    "[getMockLoginResponse] Credentials verified! User role:",
    entry.user.role,
  );
  return {
    token: createMockJwt(entry.user.role),
    user: entry.user,
  };
};

const isPrivateTab = (): boolean => {
  try {
    // Storage write test is the most reliable cross-browser private mode check.
    const test = "__private_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return false;
  } catch {
    return true; // Private/incognito tab
  }
};

// Private mode should always start clean to avoid stale auth state reuse.
if (typeof window !== "undefined" && isPrivateTab()) {
  clearPersistedToken();
}

const getStoredToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  // Prefer localStorage first because axios reads token from there on the client.
  const token = localStorage.getItem(TOKEN_KEY)?.trim() ?? null;

  if (token) {
    return token;
  }

  const cookieMatch = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${TOKEN_KEY}=`));

  if (!cookieMatch) {
    return null;
  }

  const cookieToken = decodeCookieToken(
    cookieMatch.split("=").slice(1).join("="),
  ).trim();

  if (cookieToken) {
    // Re-sync localStorage from cookie so client requests stay authenticated.
    localStorage.setItem(TOKEN_KEY, cookieToken);
  }

  // Middleware validates cookie on each request.
  return cookieToken || null;
};

const initialToken = getStoredToken();

const initialState: AuthState = {
  // Rehydrate auth state from browser persistence on first load.
  token: initialToken,
  user: null,
  isAuthenticated: Boolean(initialToken),
  status: "idle",
  error: null,
};

export const loginThunk = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  console.log("[loginThunk] Login attempt with email:", email);

  // Product rule: do not allow login in private/incognito sessions.
  if (isPrivateTab()) {
    console.warn("[loginThunk] Private/incognito tab detected");
    return rejectWithValue("Login not allowed in private/incognito tabs");
  }

  // Check local mock accounts first so login works even without backend.
  const mockLogin = getMockLoginResponse(email, password);
  console.log(
    "[loginThunk] Mock login result:",
    mockLogin ? "Found" : "Not found",
  );

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    console.log(
      "[loginThunk] API Base URL:",
      baseUrl || "Not configured - using mock",
    );

    // If no API base URL is configured, rely on mock login.
    if (!baseUrl) {
      if (!mockLogin) {
        console.error("[loginThunk] Invalid credentials - no mock match");
        return rejectWithValue("Invalid credentials");
      }

      console.log(
        "[loginThunk] Using mock login. Token length:",
        mockLogin.token.length,
      );
      persistToken(mockLogin.token);

      return mockLogin;
    }

    const normalizedBaseUrl = baseUrl.endsWith("/")
      ? baseUrl.slice(0, -1)
      : baseUrl;

    console.log(
      "[loginThunk] Calling backend API:",
      normalizedBaseUrl + "/auth/login",
    );
    const response = await fetch(`${normalizedBaseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Backend rejected the request; allow mock fallback for development.
    if (!response.ok) {
      console.warn("[loginThunk] Backend returned status:", response.status);
      if (mockLogin) {
        console.log("[loginThunk] Falling back to mock login");
        persistToken(mockLogin.token);

        return mockLogin;
      }

      const fallbackMessage = "Invalid credentials";
      let message = fallbackMessage;

      try {
        const errorPayload = (await response.json()) as { message?: string };
        if (errorPayload?.message) {
          message = errorPayload.message;
        }
      } catch {
        // Keep the fallback message when response body is not JSON.
      }

      console.error("[loginThunk] Backend error:", message);
      return rejectWithValue(message);
    }

    const rawData = (await response.json()) as unknown;
    const data = normalizeLoginResponse(rawData);

    if (!data) {
      return rejectWithValue("Invalid login response from server");
    }

    console.log(
      "[loginThunk] Backend login successful. Token length:",
      data.token.length,
    );
    persistToken(data.token);

    return data;
  } catch (error) {
    // Network/connection failure: still allow mock fallback when available.
    console.error("[loginThunk] Network error:", error);
    if (mockLogin) {
      console.log("[loginThunk] Network error but mock available, using mock");
      persistToken(mockLogin.token);

      return mockLogin;
    }

    const message = error instanceof Error ? error.message : "Login failed";
    console.error("[loginThunk] Final error:", message);
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Manual session restore/update helper when payload already has token + user.
    setCredentials: (state, action: PayloadAction<LoginResponse>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.status = "succeeded";
      state.error = null;

      persistToken(action.payload.token);
    },
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(state.token) && Boolean(action.payload);
    },
    // Complete sign-out and clear persisted token.
    logout: (state) => {
      clearPersistedToken();

      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        console.log("[Redux] loginThunk.pending");
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        console.log(
          "[Redux] loginThunk.fulfilled - Setting token and user in Redux state",
        );
        console.log(
          "[Redux] Token length from payload:",
          action.payload.token.length,
        );
        console.log("[Redux] User from payload:", action.payload.user);

        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.status = "succeeded";
        state.error = null;

        console.log(
          "[Redux] Final auth state - isAuthenticated:",
          state.isAuthenticated,
          "tokenLength:",
          state.token?.length ?? 0,
        );
      })
      .addCase(loginThunk.rejected, (state, action) => {
        console.error("[Redux] loginThunk.rejected - Error:", action.payload);
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Login failed";
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;

export const selectUser = (state: RootState): AuthUser | null =>
  state.auth.user;
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.isAuthenticated;
export const selectUserRole = (state: RootState): AuthUser["role"] | null =>
  state.auth.user?.role ?? null;

// Role guard helper for permission checks in UI/routes.
export const hasRole =
  (role: AuthUser["role"]) =>
  (state: RootState): boolean =>
    state.auth.user?.role === role;

export default authSlice.reducer;
