import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { Button } from "../../../components/ui";
import { ZoneSplash } from "../../../components/Layout/ZoneSplash";
import { openVirtualBumpBar } from "../../../features/kitchen/hardware";

export function KitchenDashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end px-5 pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => openVirtualBumpBar()}
          className="gap-2 font-mono text-xs"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          {t("kds:bumpBar.openVirtual", "Open Virtual Bump Bar")}
        </Button>
      </div>
      <ZoneSplash
        zone="kitchen"
        title="Order queue"
        subtitle="Real-time order queue. Mark items ready, bump tickets."
      />
    </div>
  );
}
