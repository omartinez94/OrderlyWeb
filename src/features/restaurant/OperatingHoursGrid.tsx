/**
 * OperatingHoursGrid — 7-day controlled operating schedule component.
 * Supports read-only display and interactive editing modes.
 */

import { useTranslation } from "react-i18next";
import type { OperatingHoursDay } from "./api";
import { Input, Switch } from "../../components/ui";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export interface OperatingHoursGridProps {
  hours: OperatingHoursDay[];
  onChange?: (hours: OperatingHoursDay[]) => void;
  readOnly?: boolean;
}

export function OperatingHoursGrid({ hours, onChange, readOnly = false }: OperatingHoursGridProps) {
  const { t } = useTranslation("admin");

  // Ensure all 7 days (0..6) are present
  const fullHours: OperatingHoursDay[] = Array.from({ length: 7 }, (_, day) => {
    const existing = hours.find((h) => h.dayOfWeek === day);
    return (
      existing ?? { dayOfWeek: day as OperatingHoursDay["dayOfWeek"], open: null, close: null }
    );
  });

  const handleToggle = (day: number, checked: boolean) => {
    if (!onChange) return;
    const next = fullHours.map((h) => {
      if (h.dayOfWeek === day) {
        return checked
          ? { ...h, open: "09:00", close: "22:00" }
          : { ...h, open: null, close: null };
      }
      return h;
    });
    onChange(next);
  };

  const handleTimeChange = (day: number, field: "open" | "close", val: string) => {
    if (!onChange) return;
    const next = fullHours.map((h) => {
      if (h.dayOfWeek === day) {
        return { ...h, [field]: val || null };
      }
      return h;
    });
    onChange(next);
  };

  return (
    <div className="border-border-subtle bg-surface-elevated rounded-control divide-border-subtle divide-y border">
      {fullHours.map((h) => {
        const dayName = DAYS_OF_WEEK[h.dayOfWeek];
        const isOpen = h.open !== null && h.close !== null;

        if (readOnly) {
          return (
            <div
              key={h.dayOfWeek}
              className="flex items-center justify-between px-4 py-2.5 text-xs"
            >
              <span className="text-ink w-24 font-medium">{dayName}</span>
              <span className={isOpen ? "text-ink font-mono" : "text-ink-subtle italic"}>
                {isOpen ? `${h.open} – ${h.close}` : t("restaurantForm.hoursEditor.closed")}
              </span>
            </div>
          );
        }

        return (
          <div
            key={h.dayOfWeek}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs"
          >
            <div className="flex w-28 items-center gap-3">
              <Switch
                id={`day-switch-${h.dayOfWeek}`}
                checked={isOpen}
                onCheckedChange={(checked) => handleToggle(h.dayOfWeek, checked)}
                aria-label={`${dayName} open status`}
              />
              <label
                htmlFor={`day-switch-${h.dayOfWeek}`}
                className="text-ink cursor-pointer font-medium select-none"
              >
                {dayName}
              </label>
            </div>

            {isOpen ? (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  aria-label={`${dayName} ${t("restaurantForm.hoursEditor.open")}`}
                  value={h.open ?? ""}
                  onChange={(e) => handleTimeChange(h.dayOfWeek, "open", e.target.value)}
                  className="h-8 w-28 font-mono text-xs"
                />
                <span className="text-ink-subtle">–</span>
                <Input
                  type="time"
                  aria-label={`${dayName} ${t("restaurantForm.hoursEditor.close")}`}
                  value={h.close ?? ""}
                  onChange={(e) => handleTimeChange(h.dayOfWeek, "close", e.target.value)}
                  className="h-8 w-28 font-mono text-xs"
                />
              </div>
            ) : (
              <span className="text-ink-subtle py-1 italic">
                {t("restaurantForm.hoursEditor.closed")}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
