/**
 * Phase 3 proof — the auth round-trip.
 *
 * Exercises:
 *   1. `useLoginMutation` hits MSW at `/identity-api/api/auth/login`.
 *   2. The mutation's `onQueryStarted` dispatches `setCredentials`.
 *   3. `selectIsAuthenticated` flips true.
 *   4. `selectDefaultZone` resolves for the Manager role the MSW
 *      identity handler returns (`["Manager"]` → `/site/restaurant`).
 *
 * Verifies the live Phase 3 exit criteria:
 *   - `useAuthPredicate().isAuthenticated === true` after login.
 *   - The session slice is fully populated by the mutation listener.
 */

import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { store } from "../store";
import { useLoginMutation } from "../api/identity";
import { useAppSelector } from "../hooks";
import {
  selectIsAuthenticated,
  selectDefaultZone,
  selectRoles,
} from "./sessionSelectors";
import {
  setCredentials,
  setStatus,
  clearCredentials,
  type CredentialsPayload,
} from "./sessionSlice";
import type { Role, Permission } from "../../types/auth";

const CREDENTIALS: CredentialsPayload = {
  accessToken: "test-access-token",
  expiresAt: Date.now() + 15 * 60 * 1000,
  user: { id: "u-001", name: "Test User", email: "test@example.com", initials: "TU" },
  roles: ["Manager"] as readonly Role[],
  permissions: [] as readonly Permission[],
};

function Probe({
  onSession,
}: {
  onSession: (s: ReturnType<typeof store.getState>["session"]) => void;
}) {
  const session = useAppSelector((s) => s.session);
  const [login] = useLoginMutation();
  const isAuth = useAppSelector(selectIsAuthenticated);
  const defaultZone = useAppSelector(selectDefaultZone);
  const roles = useAppSelector(selectRoles);

  useEffect(() => {
    onSession(session);
  }, [session, onSession]);

  useEffect(() => {
    void login({ email: "manager@acme.com", password: "hunter2" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <span data-testid="isAuth">{String(isAuth)}</span>
      <span data-testid="defaultZone">{defaultZone ?? "null"}</span>
      <span data-testid="roles">{roles.join(",")}</span>
    </div>
  );
}

describe("session round-trip", () => {
  it("login → setCredentials → selectIsAuthenticated === true", async () => {
    let last: ReturnType<typeof store.getState>["session"] | undefined;
    const utils = render(
      <Provider store={store}>
        <Probe
          onSession={(s) => {
            last = s;
          }}
        />
      </Provider>,
    );

    await waitFor(() => {
      expect(last).toBeDefined();
      expect(last?.status).toBe("authenticated");
    });

    expect(utils.getByTestId("isAuth").textContent).toBe("true");
    expect(utils.getByTestId("defaultZone").textContent).toBe("/site/restaurant");
    expect(utils.getByTestId("roles").textContent).toBe("Manager");
    expect(last?.accessToken).toBe("test-access-token");
    expect(last?.user?.email).toBe("manager@acme.com");
  });

  it("selectIsAuthenticated === false when status is 'authenticated' but user is null", () => {
    // Regression: the derivation must require BOTH status and a
    // populated user. A reducer that flips status without populating
    // user must NOT make the user "authenticated".
    const before = store.getState().session;
    expect(before.status).toBe("authenticated");
    expect(before.user).not.toBeNull();

    // Simulate the degenerate state directly: status='authenticated'
    // but user null (this can only happen via direct setStatus — it
    // exists as a regression scenario for future reducers).
    store.dispatch(setStatus("authenticated"));
    // Force user back to null while leaving status — the slice
    // doesn't allow this via setStatus alone, so reset via
    // clearCredentials and then manually re-set status.
    store.dispatch(clearCredentials());
    store.dispatch(setStatus("authenticated"));

    expect(selectIsAuthenticated(store.getState())).toBe(false);

    // Sanity: re-seeding credentials flips it back to true.
    store.dispatch(setCredentials(CREDENTIALS));
    expect(selectIsAuthenticated(store.getState())).toBe(true);
  });
});
