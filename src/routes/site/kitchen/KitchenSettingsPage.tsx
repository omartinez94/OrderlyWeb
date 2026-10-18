import { useTranslation } from "react-i18next";
import { BumpBarSettingsWidget } from "../../../features/kitchen/components/BumpBarSettingsWidget";

export function KitchenSettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
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
