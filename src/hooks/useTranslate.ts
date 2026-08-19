/**
 * useTranslate — thin wrapper around `react-i18next`'s `useTranslation` that
 * returns the translation function directly, so call sites can skip the
 * `const { t: translate } = useTranslation(...)` destructure.
 *
 * @example
 *   const translate = useTranslate("common");
 *   return <h1>{translate("home.title")}</h1>;
 *
 * Notes:
 *  - Components that only need to read or switch the active language should
 *    use `useLanguage()` instead.
 *  - `react-i18next` still returns its function as `t` internally; this hook
 *    just unwraps it for ergonomic naming at the call site.
 */

import { useTranslation } from "react-i18next";

type NamespaceArg = Parameters<typeof useTranslation>[0];

export function useTranslate(namespace?: NamespaceArg) {
  const { t } = useTranslation(namespace);
  return t;
}
