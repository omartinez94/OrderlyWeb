/**
 * AdminSettingsForm — form for configuring global platform CRM defaults
 * and feature flags.
 * Gated by settings:edit permission.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, Switch } from "../../components/ui";
import { SettingsSection } from "../../components/Admin";
import { adminSettingsSchema, type AdminSettingsFormData } from "./settingsSchema";
import type { AdminSettings } from "../../types/catalog";

export interface AdminSettingsFormProps {
  initialData: AdminSettings;
  onSubmit: (data: AdminSettingsFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function AdminSettingsForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: AdminSettingsFormProps) {
  const { t } = useTranslation("admin");

  const [formData, setFormData] = useState<AdminSettingsFormData>({
    defaultTimezone: initialData.defaultTimezone,
    defaultCurrency: initialData.defaultCurrency,
    defaultTaxRate: initialData.defaultTaxRate,
    reservationReminderMinutes: initialData.reservationReminderMinutes,
    maxReservationPartySize: initialData.maxReservationPartySize,
    enableAutoSubstitute: initialData.enableAutoSubstitute,
    emailFromAddress: initialData.emailFromAddress,
    supportContactUrl: initialData.supportContactUrl,
    featureFlags: { ...initialData.featureFlags },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFlagToggle = (key: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      featureFlags: { ...prev.featureFlags, [key]: checked },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = adminSettingsSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    await onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {/* Defaults Section */}
      <SettingsSection
        title={t("settings.sections.defaults")}
        description="Global time zone, currency, and tax rate defaults for newly onboarded restaurants."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-tz" className="text-ink text-xs font-medium">
              Time zone *
            </label>
            <Input
              id="settings-tz"
              type="text"
              value={formData.defaultTimezone}
              onChange={(e) => setFormData((p) => ({ ...p, defaultTimezone: e.target.value }))}
              className="text-xs"
            />
            {errors["defaultTimezone"] && (
              <span className="text-danger text-xs">{errors["defaultTimezone"]}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-curr" className="text-ink text-xs font-medium">
              Currency *
            </label>
            <Input
              id="settings-curr"
              type="text"
              maxLength={3}
              value={formData.defaultCurrency}
              onChange={(e) =>
                setFormData((p) => ({ ...p, defaultCurrency: e.target.value.toUpperCase() }))
              }
              className="font-mono text-xs uppercase"
            />
            {errors["defaultCurrency"] && (
              <span className="text-danger text-xs">{errors["defaultCurrency"]}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-tax" className="text-ink text-xs font-medium">
              Default tax rate *
            </label>
            <Input
              id="settings-tax"
              type="number"
              step="0.001"
              min="0"
              max="1"
              value={formData.defaultTaxRate}
              onChange={(e) =>
                setFormData((p) => ({ ...p, defaultTaxRate: parseFloat(e.target.value) || 0 }))
              }
              className="font-mono text-xs"
            />
            {errors["defaultTaxRate"] && (
              <span className="text-danger text-xs">{errors["defaultTaxRate"]}</span>
            )}
          </div>
        </div>
      </SettingsSection>

      {/* Reservations Section */}
      <SettingsSection
        title={t("settings.sections.reservations")}
        description="Booking rules and customer reminder intervals."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-remind" className="text-ink text-xs font-medium">
              Reminder minutes before booking *
            </label>
            <Input
              id="settings-remind"
              type="number"
              min="5"
              value={formData.reservationReminderMinutes}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  reservationReminderMinutes: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="font-mono text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-party" className="text-ink text-xs font-medium">
              Maximum online party size *
            </label>
            <Input
              id="settings-party"
              type="number"
              min="1"
              value={formData.maxReservationPartySize}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  maxReservationPartySize: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="font-mono text-xs"
            />
          </div>
        </div>
      </SettingsSection>

      {/* Email & Contact Section */}
      <SettingsSection
        title={t("settings.sections.email")}
        description="System sender identity and help desk destination."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-from" className="text-ink text-xs font-medium">
              System sender email *
            </label>
            <Input
              id="settings-from"
              type="email"
              value={formData.emailFromAddress}
              onChange={(e) => setFormData((p) => ({ ...p, emailFromAddress: e.target.value }))}
              className="text-xs"
            />
            {errors["emailFromAddress"] && (
              <span className="text-danger text-xs">{errors["emailFromAddress"]}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-support" className="text-ink text-xs font-medium">
              Support contact URL *
            </label>
            <Input
              id="settings-support"
              type="url"
              value={formData.supportContactUrl}
              onChange={(e) => setFormData((p) => ({ ...p, supportContactUrl: e.target.value }))}
              className="text-xs"
            />
            {errors["supportContactUrl"] && (
              <span className="text-danger text-xs">{errors["supportContactUrl"]}</span>
            )}
          </div>
        </div>
      </SettingsSection>

      {/* Feature Flags Section */}
      <SettingsSection
        title={t("settings.sections.flags")}
        description="Toggle platform-wide capabilities and experimental modules."
      >
        <div className="divide-border-subtle flex flex-col divide-y">
          {Object.entries(formData.featureFlags).map(([flagKey, enabled]) => (
            <div
              key={flagKey}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-ink font-mono text-xs font-medium">{flagKey}</p>
                <p className="text-ink-subtle text-xs">Platform capability toggle.</p>
              </div>
              <Switch
                id={`flag-${flagKey}`}
                checked={enabled}
                onCheckedChange={(checked) => handleFlagToggle(flagKey, checked)}
                aria-label={`Toggle ${flagKey}`}
              />
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Submit Action */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : t("actions.save")}
        </Button>
      </div>
    </form>
  );
}
