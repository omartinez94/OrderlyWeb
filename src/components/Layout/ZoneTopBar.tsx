/**
 * ZoneTopBar — the global top bar inside every zone layout.
 *
 * Wraps the existing `Header` component with zone-specific stubs
 * (current restaurant, notifications, ops count, user). When the
 * auth slice lands, these props are wired to live data; in this
 * commit they consume the showcase mocks so the chrome renders.
 *
 * The zone label appears on the left so the user always knows which
 * context they're in. The breadcrumb slot is reserved for deep
 * links (e.g. `/admin/staff/:id`).
 */

import { Header } from "../Header/Header";
import { MOCK_CURRENT_USER, MOCK_NOTIFICATIONS, MOCK_RESTAURANTS } from "../Header/mockData";
import { toast } from "../ui/sonner";
import { SignInDialog } from "../SignInDialog/SignInDialog";
import { useState } from "react";
import type { Zone } from "../Header/types";

export function ZoneTopBar({ zone }: { zone: Zone }) {
  const [signInOpen, setSignInOpen] = useState(false);
  const openSignIn = (): void => setSignInOpen(true);

  return (
    <>
      <Header
        zone={zone}
        currentRestaurantId="r-001"
        restaurants={MOCK_RESTAURANTS}
        notifications={MOCK_NOTIFICATIONS}
        user={MOCK_CURRENT_USER}
        onRestaurantChange={() => {
          toast.info("Restaurant switching lands with the auth slice.", {
            description: "Sign in to choose a restaurant.",
          });
        }}
        onNotificationClick={openSignIn}
        onMarkAllRead={openSignIn}
        onProfile={openSignIn}
        onLogout={openSignIn}
      />
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
    </>
  );
}
