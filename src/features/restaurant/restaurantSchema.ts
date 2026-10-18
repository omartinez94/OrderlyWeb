import { z } from "zod";

export const restaurantAddressSchema = z.object({
  line1: z.string().min(1, "Street address is required"),
  line2: z.string().nullable().optional(),
  city: z.string().min(1, "City is required"),
  region: z.string().min(1, "State / Region is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().length(2, "Country must be a 2-letter ISO code"),
});

export const operatingHoursDaySchema = z.object({
  dayOfWeek: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  open: z.string().nullable(),
  close: z.string().nullable(),
});

export const restaurantSchema = z.object({
  name: z.string().min(1, "Enter a restaurant name"),
  brandId: z.string().min(1, "Select a brand"),
  cuisine: z.string().min(1, "Enter a cuisine type"),
  ownerId: z.string().nullable().optional(),
  address: restaurantAddressSchema,
  phone: z.string().nullable().optional(),
  email: z.string().email("Enter a valid email address").or(z.literal("")).nullable().optional(),
  timezone: z.string().min(1, "Enter a valid time zone"),
  currency: z.string().length(3, "Enter a 3-letter currency code"),
  taxRate: z.number().min(0, "Tax rate cannot be negative").max(1, "Tax rate cannot exceed 100%"),
  operatingHours: z.array(operatingHoursDaySchema),
  estimatedTurnoverMinutes: z.number().min(15, "Turnover must be at least 15 minutes"),
  autoConfirmReservations: z.boolean(),
  autoConfirmOrders: z.boolean(),
  allowAutoSubstitute: z.boolean(),
  status: z.enum(["active", "inactive", "archived"]),
});

export type RestaurantFormData = z.infer<typeof restaurantSchema>;
