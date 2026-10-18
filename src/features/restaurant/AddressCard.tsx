/**
 * AddressCard — read-only display component for structured restaurant addresses.
 */

import { MapPin } from "lucide-react";
import type { AdminRestaurantAddress } from "./api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui";

export interface AddressCardProps {
  address: AdminRestaurantAddress;
}

export function AddressCard({ address }: AddressCardProps) {
  return (
    <Card className="p-4">
      <CardHeader className="p-0 pb-3">
        <CardTitle className="font-display text-ink flex items-center gap-2 text-sm font-semibold">
          <MapPin className="text-primary size-4" />
          Location & Address
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 text-xs">
        <p className="text-ink font-medium">{address.line1}</p>
        {address.line2 && <p className="text-ink-subtle">{address.line2}</p>}
        <p className="text-ink-subtle mt-1">
          {address.city}, {address.region} {address.postalCode}
        </p>
        <p className="text-ink-subtle font-mono uppercase">{address.country}</p>
      </CardContent>
    </Card>
  );
}
