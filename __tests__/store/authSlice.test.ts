/**
 * __tests__/store/authSlice.test.ts
 *
 * Unit tests for the authSlice Redux module.
 *
 * Covers:
 *  - loginThunk.fulfilled → sets token, user, isAuthenticated in state
 *  - loginThunk.rejected  → clears state on bad credentials
 *  - logout               → clears token, user, isAuthenticated from state AND localStorage
 *  - localStorage token persistence on successful login
 *  - localStorage cleanup on logout
 *  - setCredentials manual restore helper
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  loginThunk,
  logout,
  setCredentials,
  TOKEN_KEY,
} from '../../lib/store/authSlice';

// ─── Mock fixtures ─────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: 'usr-001',
  email: 'owner@futurahardware.lk',
  name: 'Suresh Thaheshan',
  role: 'owner' as const,
  tenantId: '09e63916-587a-4d8b-920b-e43a5580c9d8',
  logoUrl: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  paymentStatus: 'ACTIVE',
  subscriptionPlan: 'PRO',
};

const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.signature';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Create a fresh store instance for every test to avoid state leakage. */
function makeStore() {
  return configureStore({ reducer: { auth: authReducer } });
}

// ─── localStorage mock ────────────────────────────────────────────────────────
// jsdom provides a real in-memory localStorage – we spy on it so we can assert
// calls without touching the real storage between tests.

let store: ReturnType<typeof makeStore>;

beforeEach(() => {
  localStorage.clear();
  // Spy but still use the real implementation so state actually persists
  jest.spyOn(Storage.prototype, 'setItem');
  jest.spyOn(Storage.prototype, 'removeItem');
  jest.spyOn(Storage.prototype, 'getItem');

  // Set NEXT_PUBLIC_API_URL so loginThunk attempts a real fetch
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080/api/v1';

  store = makeStore();
});

afterEach(() => {
  jest.restoreAllMocks();
  delete process.env.NEXT_PUBLIC_API_URL;
});

// ─── loginThunk.fulfilled ─────────────────────────────────────────────────────

describe('loginThunk', () => {
  it('sets isAuthenticated, token and user in Redux state on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        // Match the backend shape the thunk unwraps
        access_token: MOCK_TOKEN,
        user: {
          id: MOCK_USER.id,
          email: MOCK_USER.email,
          first_name: 'Suresh',
          last_name: 'Thaheshan',
          role: MOCK_USER.role,
          tenant_id: MOCK_USER.tenantId,
          logoUrl: null,
          createdAt: MOCK_USER.createdAt,
          paymentStatus: MOCK_USER.paymentStatus,
          subscriptionPlan: MOCK_USER.subscriptionPlan,
        },
      }),
    } as Response);

    await store.dispatch(loginThunk({ email: MOCK_USER.email, password: 'Secret@123' }));

    const authState = store.getState().auth;
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.token).toBe(MOCK_TOKEN);
    expect(authState.user).not.toBeNull();
    expect(authState.user?.email).toBe(MOCK_USER.email);
    expect(authState.status).toBe('succeeded');
    expect(authState.error).toBeNull();
  });

  it('writes the JWT to localStorage under TOKEN_KEY on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: MOCK_TOKEN,
        user: {
          id: MOCK_USER.id,
          email: MOCK_USER.email,
          first_name: 'Suresh',
          last_name: 'Thaheshan',
          role: MOCK_USER.role,
          tenant_id: MOCK_USER.tenantId,
          createdAt: MOCK_USER.createdAt,
        },
      }),
    } as Response);

    await store.dispatch(loginThunk({ email: MOCK_USER.email, password: 'Secret@123' }));

    expect(localStorage.getItem(TOKEN_KEY)).toBe(MOCK_TOKEN);
  });

  it('sets status to failed and clears state on backend 401', async () => {
    // NODE_ENV is 'test', so mock credentials are disabled — backend rejection
    // must not fall back to any mock account
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' }),
    } as Response);

    await store.dispatch(loginThunk({ email: 'wrong@user.com', password: 'badpassword' }));

    const authState = store.getState().auth;
    expect(authState.isAuthenticated).toBe(false);
    expect(authState.token).toBeNull();
    expect(authState.user).toBeNull();
    expect(authState.status).toBe('failed');
    expect(authState.error).toMatch(/invalid credentials/i);
  });

  it('sets status to failed when fetch throws a network error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    await store.dispatch(loginThunk({ email: MOCK_USER.email, password: 'Secret@123' }));

    const authState = store.getState().auth;
    expect(authState.isAuthenticated).toBe(false);
    expect(authState.status).toBe('failed');
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────

describe('logout', () => {
  it('clears token and user from Redux state', () => {
    // Pre-populate state via setCredentials
    store.dispatch(setCredentials({ token: MOCK_TOKEN, user: MOCK_USER }));
    expect(store.getState().auth.isAuthenticated).toBe(true);

    store.dispatch(logout());

    const authState = store.getState().auth;
    expect(authState.isAuthenticated).toBe(false);
    expect(authState.token).toBeNull();
    expect(authState.user).toBeNull();
    expect(authState.status).toBe('idle');
    expect(authState.error).toBeNull();
  });

  it('removes the JWT from localStorage on logout', () => {
    localStorage.setItem(TOKEN_KEY, MOCK_TOKEN);
    expect(localStorage.getItem(TOKEN_KEY)).toBe(MOCK_TOKEN);

    store.dispatch(setCredentials({ token: MOCK_TOKEN, user: MOCK_USER }));
    store.dispatch(logout());

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
  });

  it('also removes persisted user from localStorage on logout', () => {
    localStorage.setItem('user', JSON.stringify(MOCK_USER));

    store.dispatch(setCredentials({ token: MOCK_TOKEN, user: MOCK_USER }));
    store.dispatch(logout());

    expect(localStorage.getItem('user')).toBeNull();
  });
});

// ─── setCredentials ───────────────────────────────────────────────────────────

describe('setCredentials', () => {
  it('manually restores session from a known token + user pair', () => {
    store.dispatch(setCredentials({ token: MOCK_TOKEN, user: MOCK_USER }));

    const authState = store.getState().auth;
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.token).toBe(MOCK_TOKEN);
    expect(authState.user?.role).toBe('owner');
    expect(authState.status).toBe('succeeded');
  });

  it('persists token to localStorage via setCredentials', () => {
    store.dispatch(setCredentials({ token: MOCK_TOKEN, user: MOCK_USER }));

    expect(localStorage.getItem(TOKEN_KEY)).toBe(MOCK_TOKEN);
  });
});
