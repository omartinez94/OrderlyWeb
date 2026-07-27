import { useForm, type FieldValues, type UseFormProps, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

/**
 * `useZodForm` — a thin wrapper around `react-hook-form`'s `useForm` that
 * binds a Zod schema as the resolver. The schema is the single source of
 * truth for field types, validation, and error messages.
 *
 * Why a wrapper:
 *   - Centralizes the resolver choice so every form in the app uses the
 *     same Zod integration; swapping resolvers later is a one-line change.
 *   - Types flow through: the form fields are inferred from `schema`'s
 *     output type, so `useZodForm(loginSchema)` produces a
 *     `UseFormReturn<LoginInput>`.
 *
 * Note on Zod 4:
 *   The current `@hookform/resolvers` (v5.5) expects a Zod schema whose
 *   *input* type is `FieldValues`-compatible. We pass `z.ZodType<T, T>` so
 *   the input matches the output. For object schemas produced by
 *   `z.object({...})` this is always safe.
 *
 * Usage:
 *   const schema = z.object({
 *     email: z.string().email(),
 *     password: z.string().min(8),
 *   });
 *
 *   function LoginForm() {
 *     const form = useZodForm(schema, { defaultValues: { email: '', password: '' } });
 *     ...
 *   }
 */
export function useZodForm<T extends FieldValues>(
  schema: z.ZodType<T, T>,
  options?: Omit<UseFormProps<T>, "resolver">,
): UseFormReturn<T> {
  return useForm<T>({
    ...(options ?? {}),
    resolver: zodResolver(schema),
  });
}

export type { z };
