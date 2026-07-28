/**
 * sessionSlice — the auth state for the Orderly Web app.
 *
 * Single source of truth for the authenticated user. The JWT access
 * token lives in Redux memory only (per `AGENTS.md` §Security); the
 * refresh token is an httpOnly cookie set by the Identity Service and
 * is never visible to JS.
 *
 * State shape:
 *   - status:        'idle' | 'authenticating' | 'authenticated' | 'expired'
 *   - accessToken:   the bearer token (memory only)
 *   - expiresAt:     epoch ms when the token expires (15-min TTL)
 *   - user:          { id, name, email, initials } | null
 *   - roles:         readonly Role[]  — drives RequireRole / RootRedirect
 *   - permissions:   readonly Permission[]
 *
 * Reducers:
 *   - setStatus(status)            — flips the auth lifecycle state
 *   - setCredentials(payload)      — stores token + user + roles
 *   - clearCredentials()           — wipes everything; used by logout
 *
 * The slice is intentionally tiny. Async work (login / refresh) lives
 * in `identityApi` (RTK Query); this slice is the destination.
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role, Permission } from "../../types/auth";

export type SessionStatus = "idle" | "authenticating" | "authenticated" | "expired";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  initials: string;
}

export interface SessionState {
  status: SessionStatus;
  accessToken: string | null;
  expiresAt: number | null;
  user: SessionUser | null;
  roles: Role[];
  permissions: Permission[];
}

export interface CredentialsPayload {
  accessToken: string;
  expiresAt: number;
  user: SessionUser;
  roles: readonly Role[];
  permissions: readonly Permission[];
}

const initialState: SessionState = {
  status: "idle",
  accessToken: null,
  expiresAt: null,
  user: null,
  roles: [],
  permissions: [],
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<SessionStatus>) {
      state.status = action.payload;
    },
    setCredentials(state, action: PayloadAction<CredentialsPayload>) {
      const { accessToken, expiresAt, user, roles, permissions } = action.payload;
      state.accessToken = accessToken;
      state.expiresAt = expiresAt;
      state.user = user;
      // Copy out of the readonly payload into the mutable Immer draft.
      state.roles = [...roles];
      state.permissions = [...permissions];
      state.status = "authenticated";
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.expiresAt = null;
      state.user = null;
      state.roles = [];
      state.permissions = [];
      state.status = "idle";
    },
  },
});

export const { setStatus, setCredentials, clearCredentials } = sessionSlice.actions;
export default sessionSlice.reducer;
