import { useTranslation } from "react-i18next";
import { BumpBarSettingsWidget } from "../../../features/kitchen/components/BumpBarSettingsWidget";

export function KitchenSettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6">
      <div>
        <h1 className="font-display text-ink text-3xl font-bold">
          {t("kds:settings.title", "KDS settings")}
        </h1>
        <p className="text-ink-muted text-sm">
          {t(
            "kds:settings.subtitle",
            "Station hardware profiles, bump bar calibration, and audio feedback.",
          )}
        </p>
      </div>

      <BumpBarSettingsWidget />
    </div>
  );
}

export default KitchenSettingsPage;
