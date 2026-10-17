import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { VirtualBumpBarPad } from "../../../features/kitchen/components/VirtualBumpBarPad";

export function VirtualBumpBarPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("kds:bumpBar.virtualTitle", "KB9000 Bump Bar Simulator")} | Orderly KDS`;
  }, [t]);

  return (
    <main
      className="box-border flex h-screen min-h-[210px] w-screen flex-col items-center justify-center overflow-hidden bg-slate-950 p-2 select-none"
      aria-label={t("kds:bumpBar.virtualTitle", "KB9000 Bump Bar Simulator")}
    >
      <VirtualBumpBarPad className="h-full max-h-[210px] w-full max-w-[830px]" />
    </main>
  );
}

export default VirtualBumpBarPage;
