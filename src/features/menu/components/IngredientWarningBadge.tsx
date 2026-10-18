import { useTranslation } from "react-i18next";
import { AlertTriangle, Sparkles } from "lucide-react";
import { Badge } from "../../../components/ui";

export interface IngredientWarningBadgeProps {
  warning?: string;
  autoSubstituted?: boolean;
}

export function IngredientWarningBadge({ warning, autoSubstituted }: IngredientWarningBadgeProps) {
  const { t } = useTranslation("restaurant");

  if (!warning && !autoSubstituted) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {autoSubstituted && (
        <Badge
          variant="outline"
          className="gap-1 border-sky-500/30 bg-sky-500/10 text-[11px] font-medium text-sky-700 dark:text-sky-300"
        >
          <Sparkles className="size-3" />
          {t("menu.autoSubstituted")}
        </Badge>
      )}
      {warning && (
        <Badge
          variant="outline"
          className="gap-1 border-amber-500/30 bg-amber-500/10 text-[11px] font-medium text-amber-700 dark:text-amber-300"
        >
          <AlertTriangle className="size-3" />
          {warning}
        </Badge>
      )}
    </div>
  );
}
