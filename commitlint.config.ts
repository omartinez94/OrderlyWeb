// commitlint.config.ts
// Conventional Commits enforcement for Orderly Admin Panel.
// Plan: .agents/plans/shared-conventions/formatting-and-shared-conventions.md §6.3

import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 72],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "refactor",
        "test",
        "chore",
        "perf",
        "build",
        "ci",
        "revert",
        "style",
      ],
    ],
  },
};

export default config;
