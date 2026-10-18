import { z } from "zod";

export const adminSettingsSchema = z.object({
  defaultTimezone: z.string().min(1, "Enter a valid time zone."),
  defaultCurrency: z.string().length(3, "Enter a three-letter currency code."),
  defaultTaxRate: z
    .number()
    .min(0, "Tax rate cannot be negative")
    .max(1, "Tax rate cannot exceed 100%"),
  reservationReminderMinutes: z.number().min(5, "Reminder must be at least 5 minutes"),
  maxReservationPartySize: z.number().min(1, "Maximum party size must be at least 1"),
  enableAutoSubstitute: z.boolean(),
  emailFromAddress: z.string().email("Enter a valid email address"),
  supportContactUrl: z.string().url("Enter a valid support URL"),
  featureFlags: z.record(z.string(), z.boolean()),
});

export type AdminSettingsFormData = z.infer<typeof adminSettingsSchema>;
