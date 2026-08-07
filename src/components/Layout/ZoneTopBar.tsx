/**
 * ZoneTopBar — the global top bar inside every zone layout.
 *
 * Phase 4 wiring: consumes live Redux selectors (user, restaurants,
 * notifications, unreadCount, opsCount) instead of MOCK_* constants.
 * The Header is still a controlled component — this file owns the
 * callbacks (logout, restaurant change, profile, mark-all-read).
 *
 * Cross-cutting Vercel rules:
 *   - `rerender-memo` — `currentRestaurant` and `currentOpsCount`
 *     are derived via `useMemo`. The Header re-renders only when
 *     the active restaurant or zone changes.
 *   - `rerender-transitions` — restaurant switching wraps the
 *     cache-invalidation + navigation in `startTransition` so the
 *     next user interaction isn't blocked by the catalog refetch.
 */

import { useCallback, useMemo, useTransition } from "react";
import { Header } from "../Header/Header";
import { openSignIn } from "../SignInDialog";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { clearCredentials } from "../../app/session/sessionSlice";
import {
  selectAccessibleRestaurants,
  selectNotifications,
  selectOpsCountForZone,
  selectUser,
} from "../../app/session/headerSelectors";
import { useRestaurantContext } from "../RestaurantContext/useRestaurantContext";
import { useLogoutMutation } from "../../app/api/identity";
import { useMarkReadMutation, useMarkAllReadMutation } from "../../app/api/notifications";
import { catalogApi } from "../../app/api/catalog";
import { ordersApi } from "../../app/api/orders";
import { kitchenApi } from "../../app/api/kitchen";
import { useNavigateWithTransition } from "../../hooks/useNavigateWithTransition";
import { PATH } from "../../router/pathNames";
import { toast } from "../ui/sonner";
import type { Zone } from "../Header/types";

export function ZoneTopBar({ zone }: { zone: Zone }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigateWithTransition();
  const [, startTransition] = useTransition();

  const user = useAppSelector(selectUser);
  const restaurants = useAppSelector(selectAccessibleRestaurants);
  const notifications = useAppSelector(selectNotifications);
  const { restaurantId, setRestaurantId } = useRestaurantContext();
  const opsCount = useAppSelector((state) => selectOpsCountForZone(state, zone, restaurantId));

  const [logout] = useLogoutMutation();
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();

  const currentRestaurant = useMemo(
    () => restaurants.find((r) => r.id === restaurantId),
    [restaurants, restaurantId],
  );
  const currentRestaurantId = currentRestaurant?.id ?? restaurants[0]?.id ?? "r-001";

  const handleRestaurantChange = useCallback(
    (id: string) => {
      if (id === currentRestaurantId) return;
      // Update URL state and invalidate the per-restaurant caches.
      // startTransition keeps the click responsive while the
      // refetch + nav settle.
      startTransition(() => {
        setRestaurantId(id);
        dispatch(catalogApi.util.invalidateTags([{ type: "Restaurants", id: "LIST" }]));
        dispatch(ordersApi.util.invalidateTags([{ type: "Orders", id: `LIST-${id}` }]));
        dispatch(kitchenApi.util.invalidateTags([{ type: "KitchenQueue", id: `LIST-${id}` }]));
      });
    },
    [currentRestaurantId, dispatch, setRestaurantId],
  );

  const handleNotificationClick = useCallback(
    (id: string) => {
      const target = notifications.find((n) => n.id === id);
      if (target?.link) {
        navigate(target.link);
      }
      void markRead(id);
    },
    [markRead, navigate, notifications],
  );

  const handleMarkAllRead = useCallback(() => {
    void markAllRead();
  }, [markAllRead]);

  const handleProfile = useCallback(() => {
    navigate(PATH.PROFILE);
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await logout().unwrap();
    } catch {
      // Logout endpoint failed — fall through to clearing the
      // session anyway so the user isn't stuck logged in.
    }
    dispatch(clearCredentials());
    // The kitchen SignalR hub stops automatically: SignalRBootGate
    // re-renders with enabled=false when selectIsAuthenticated
    // flips, and the effect's cleanup calls hub.stop().
    navigate(PATH.HOME);
  }, [dispatch, logout, navigate]);

  // If no user is signed in, fall back to the marketing dialog path
  // so the slot buttons stay clickable in dev/test.
  const onProfile = user
    ? handleProfile
    : () => {
        openSignIn();
      };
  const onLogout = user
    ? handleLogout
    : () => {
        toast.info("Sign in to access your profile.", {
          description: "Sessions ship with the auth slice.",
        });
        openSignIn();
      };
  const onNotificationClick = user ? handleNotificationClick : () => openSignIn();
  const onMarkAllRead = user ? handleMarkAllRead : () => openSignIn();
  const onRestaurantChange = user ? handleRestaurantChange : () => openSignIn();

  return (
    <Header
      zone={zone}
      currentRestaurantId={currentRestaurantId}
      restaurants={restaurants}
      notifications={notifications}
      opsCount={opsCount}
      user={user ?? { id: "guest", name: "Guest", email: "", initials: "G" }}
      onRestaurantChange={onRestaurantChange}
      onNotificationClick={onNotificationClick}
      onMarkAllRead={onMarkAllRead}
      onProfile={onProfile}
      onLogout={onLogout}
    />
  );
}
