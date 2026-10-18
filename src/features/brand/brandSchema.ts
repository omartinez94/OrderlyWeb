/**
 * Brand schemas and typed forms using Zod.
 */

import { z } from "zod";
import type { CuisineType } from "../../types/catalog";

export const CUISINE_TYPES: readonly CuisineType[] = [
  "Italian",
  "Mexican",
  "Japanese",
  "American",
  "Other",
];

export const brandSchema = z.object({
  name: z.string().min(1, "Enter a brand name.").max(128),
  slug: z
    .string()
    .min(1, "Enter a slug.")
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens."),
  description: z.string().max(500).optional().nullable(),
  contactEmail: z.string().email("Enter a valid email address."),
  contactPhone: z.string().max(32).optional().nullable(),
  cuisineType: z.enum(["Italian", "Mexican", "Japanese", "American", "Other"] as const),
  websiteUrl: z.string().url("Enter a valid URL.").or(z.literal("")).optional().nullable(),
  logoUrl: z.string().url("Enter a valid URL.").or(z.literal("")).optional().nullable(),
});

export type BrandFormData = z.infer<typeof brandSchema>;
