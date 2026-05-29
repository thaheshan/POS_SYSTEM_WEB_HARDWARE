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

// --- HELPER FUNCTIONS (Hoisted to top to avoid ReferenceErrors) ---

const decodeCookieToken = (rawValue: string): string => {
  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
};

const normalizeAuthUser = (value: unknown): AuthUser | null => {
  if (!value || typeof value !== "object") return null;

  const candidate = value as any;
  const id = candidate.id || candidate.user_id;
  const name =
    candidate.name ||
    (candidate.first_name
      ? `${candidate.first_name} ${candidate.last_name || ""}`.trim()
      : null);

  if (!id || !candidate.email || !name || !candidate.role) {
    return null;
  }

  const role = candidate.role.toLowerCase();
  if (!["admin", "manager", "cashier", "staff", "owner"].includes(role)) {
    return null;
  }

  return {
    id: id as string,
    email: candidate.email as string,
    name: name as string,
    role: role as AuthUser["role"],
    tenantId: candidate.tenant_id || candidate.tenantId,
    createdAt:
      typeof candidate.createdAt === "string"
        ? candidate.createdAt
        : new Date().toISOString(),
    paymentStatus: candidate.paymentStatus,
    subscriptionPlan: candidate.subscriptionPlan,
  };
};

const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY)?.trim() ?? null;
  if (token) return token;

  const cookieMatch = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${TOKEN_KEY}=`));

  if (!cookieMatch) return null;
  const cookieToken = decodeCookieToken(
    cookieMatch.split("=").slice(1).join("="),
  ).trim();

  if (cookieToken) localStorage.setItem(TOKEN_KEY, cookieToken);
  return cookieToken || null;
};

const getStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const rawUser = localStorage.getItem("user");
  if (!rawUser) return null;
  try {
    return normalizeAuthUser(JSON.parse(rawUser));
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const persistToken = (token: string): void => {
  if (typeof window === "undefined") return;
  const normalizedToken = token.trim();
  const encodedToken = encodeURIComponent(normalizedToken);
  localStorage.setItem(TOKEN_KEY, normalizedToken);
  document.cookie = `${TOKEN_KEY}=${encodedToken}; Path=/; SameSite=Lax`;
};

const persistUser = (user: AuthUser | null): void => {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
};

const clearPersistedToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
};

const clearPersistedAuth = (): void => {
  clearPersistedToken();
  persistUser(null);
};

// --- INITIAL STATE ---

const initialToken = getStoredToken();
const initialUser = getStoredUser();

const normalizeLoginResponse = (payload: unknown): LoginResponse | null => {
  if (!payload || typeof payload !== "object") return null;

  // Handle backend wrapper { data: { access_token, user } }
  let data: any = payload;
  if ("data" in data && data.data) {
    data = data.data;
  }

  const rawToken =
    typeof data.token === "string"
      ? data.token
      : typeof data.accessToken === "string"
        ? data.accessToken
        : typeof data.access_token === "string"
          ? data.access_token
          : typeof data.jwt === "string"
            ? data.jwt
            : null;

  if (!rawToken) return null;
  const token = rawToken.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  return { token, user: normalizeAuthUser(data.user) };
};

const toBase64Url = (value: string): string => {
  if (typeof btoa !== "function") return "";
  return btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const createMockJwt = (role: AuthUser["role"]): string => {
  const header = toBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = toBase64Url(JSON.stringify({ role }));
  return header && payload
    ? `${header}.${payload}.mock-signature`
    : `mock-token-${role}`;
};

const MOCK_CREDENTIALS =
  process.env.NODE_ENV === "development"
    ? ([
        {
          email: "admin@abchardware.lk",
          password: "Admin@123",
          user: {
            id: "mock-admin-1",
            email: "admin@abchardware.lk",
            name: "Shop Owner",
            role: "admin",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        },
        {
          email: "owner@abchardware.lk",
          password: "Owner@123",
          user: {
            id: "mock-owner-1",
            email: "owner@abchardware.lk",
            name: "Shop Owner",
            role: "owner",
            paymentStatus: "PENDING",
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
          email: "staff@test.com",
          password: "Staff@123",
          user: {
            id: "mock-staff-1",
            email: "staff@test.com",
            name: "Test Staff",
            role: "staff",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        },
      ] as const)
    : ([] as const);

const getMockLoginResponse = (
  email: string,
  password: string,
): LoginResponse | null => {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // NOTE: mock credentials are deliberately only available in development
  // to avoid accidental use of factory accounts in production builds.
  const entry = MOCK_CREDENTIALS.find(
    (c) =>
      c.email.toLowerCase() === email.toLowerCase() && c.password === password,
  );
  if (!entry) return null;
  return {
    token: createMockJwt(entry.user.role as AuthUser["role"]),
    user: entry.user as any,
  };
};

const isPrivateTab = (): boolean => {
  try {
    const test = "__private_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return false;
  } catch {
    return true;
  }
};

if (typeof window !== "undefined" && isPrivateTab()) {
  clearPersistedAuth();
}

const initialState: AuthState = {
  token: initialToken,
  user: initialUser,
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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
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
      persistUser(mockLogin.user);

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
        persistUser(mockLogin.user);

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

    const rawData = (await response.json()) as any;
    console.log(
      "[loginThunk] Raw response from backend:",
      JSON.stringify(rawData).substring(0, 200),
    );

    // Directly handle the known backend shape which might be double-wrapped by interceptors:
    // { success: true, data: { statusCode: 200, data: { access_token, user } } }
    let actualData = rawData;
    if (
      actualData?.data &&
      typeof actualData.data === "object" &&
      !actualData.access_token
    ) {
      actualData = actualData.data;
    }
    if (
      actualData?.data &&
      typeof actualData.data === "object" &&
      !actualData.access_token
    ) {
      actualData = actualData.data;
    }

    const token: string | null =
      actualData?.access_token ??
      actualData?.token ??
      actualData?.accessToken ??
      null;
    const userPayload = actualData?.user ?? null;

    console.log(
      "[loginThunk] Extracted token exists:",
      !!token,
      "| user exists:",
      !!userPayload,
    );

    if (!token) {
      console.error(
        "[loginThunk] Could not extract token from response:",
        rawData,
      );
      return rejectWithValue("Invalid login response from server");
    }

    const normalizedUser = normalizeAuthUser(userPayload);
    console.log("[loginThunk] Normalized user:", normalizedUser);
    const data: LoginResponse = {
      token: token.replace(/^Bearer\s+/i, "").trim(),
      user: normalizedUser,
    };

    console.log(
      "[loginThunk] Backend login successful. Token length:",
      data.token.length,
    );
    persistToken(data.token);
    persistUser(data.user);

    return data;
  } catch (error) {
    // Network/connection failure: still allow mock fallback when available.
    console.error("[loginThunk] Network error:", error);
    if (mockLogin) {
      console.log("[loginThunk] Network error but mock available, using mock");
      persistToken(mockLogin.token);
      persistUser(mockLogin.user);

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
      persistUser(action.payload.user);
    },
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(state.token) && Boolean(action.payload);
    },
    // Complete sign-out and clear persisted token.
    logout: (state) => {
      clearPersistedAuth();

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