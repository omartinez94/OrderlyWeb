/**
 * safeReturnPath — open-redirect defense for `returnTo` query params.
 *
 * Threat model: an attacker crafts a URL like
 * `/login?returnTo=https://evil.com` and the login page obediently
 * redirects the user to that host after success. This helper returns
 * the input only when it is unambiguously a same-origin absolute path
 * (`/foo`, `/foo?bar`, `/foo#x`), and the fallback otherwise.
 *
 * Rules:
 *   - `undefined`, `null`, empty string  → `fallback`
 *   - Anything that does not start with `/`  → `fallback` (rejects
 *     `home`, `./home`, `home/x`)
 *   - Starts with `//`  → `fallback` (rejects `//evil.com`)
 *   - Starts with `/\\`  → `fallback` (rejects `/\evil.com`)
 *   - Contains `:` before any `/`  → `fallback` (rejects `javascript:`, `data:`)
 *   - Otherwise  → `input` (it is a same-origin path)
 */

export function safeReturnPath(input: string | null | undefined, fallback: string): string {
  if (!input) return fallback;
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//") || input.startsWith("/\\")) return fallback;
  // Block protocol-relative (`/foo:bar`) by checking the first
  // path segment for a colon. Anything past the first `/` is fine.
  const firstSegment = input.slice(1).split("/")[0] ?? "";
  if (firstSegment.includes(":")) return fallback;
  return input;
}
