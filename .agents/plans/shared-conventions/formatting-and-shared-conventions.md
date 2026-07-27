# Shared Conventions — Implementation Plan

> Scope: Establish the formatting baseline (format-on-save for humans + format-on-write for agents) using `oxfmt` (Rust, same family as the existing `oxlint`), plus the adjacent "everyone respects the same rule" conventions so that any developer or agent touching the Orderly Admin Panel produces code that matches what the repo expects.

---

## Status

> **Plan version**: `v1.0` (2026-07-26) — initial commit. Plan version `v1.x` increments after each phase completion; `vN.0` (major bump) is reserved for breaking restructures of the plan itself.
> **Current state**: ⏸ Not started — awaiting Phase 1 kickoff.

| Phase | Name | Status |
|:-----:|---|:-----:|
| 1 | Formatter & editor baseline — `oxfmt`, `.editorconfig`, `.gitattributes`, `.vscode/settings.json`, format scripts | ⏸ Pending |
| 2 | Auto-enforcement — Claude Code `PostToolUse` hook, `lefthook` pre-commit, `format:check` script, CI integration | ⏸ Pending |
| 3 | Adjacent conventions — import ordering, file naming, `commitlint`, dead-export detection (`knip`), Node version pin, secret scanner | ⏸ Pending |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> **Commit messages**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`). Short imperative subject, ≤50 chars, no trailing period.

> **Update rule**: Every phase completion requires a code commit followed by a plan-only commit that updates this file, checks completed deliverables, records verification evidence, and bumps the minor version.

---

## 0. Skill & documentation conventions

### 0.1 Skill mandates

> The `impeccable` skill continues to be mandatory for any UI surface area work (already in effect). For tooling work in this plan, no skill mandate applies — the work is configuration files plus one Claude Code hook.
>
> The `.claude/settings.local.json` `PostToolUse` hook precedent (impeccable design check) is the exact mechanism this plan reuses for format-on-write for AI agents — see §6.2.

### 0.2 Sources of truth

Read these documents before each phase and update this plan if implementation reveals drift:

- `AGENTS.md` — code-style rules, the explicit "ESLint + Prettier" mention (which this plan *replaces with* oxfmt + oxlint for consistency with the existing oxc family already shipping), the `pnpm lint` script.
- `components.json` — the shadcn registry contract; not affected by formatting, but the formatter must not break shadcn-installed `src/components/ui/*.tsx`.
- `.agents/plans/_template.md` — plan lifecycle and completion workflow.
- `.agents/plans/base-components/base-component-library.md` — the consuming plan that already runs `pnpm lint` and `pnpm typecheck` as gate scripts. Its Phase 8 verification matrix is the model for this plan's verification matrix.
- `.claude/settings.local.json` — the existing `PostToolUse` hook on Edit/Write/MultiEdit that runs the impeccable design check. The format-on-write hook is appended here in §6.2.

### 0.3 Code-quality guardrails

- Repository uses the **oxc family** (`oxlint` already installed, `pnpm lint` script). The formatter **must be `oxfmt`** (same family, Prettier-compatible rules, single toolchain, no Node-format dependency).
- Format spec (matches AGENTS.md § Code style): **2-space indent, single quotes, 100-char line width, trailing commas (ES5), semicolons**. No `prettier-plugin-tailwindcss` — `oxfmt` does not yet ship a Tailwind class-sorter plugin; manual class ordering is accepted in Phase 1, deferred to Phase 3.
- File scope: `src/**/*.{ts,tsx,js,jsx,mjs,cjs,css,html,json,md}` plus config files at the root. Generated files in `node_modules/`, `dist/`, `pnpm-lock.yaml`, `coverage/`, `.harness/`, `.agents/`, `.claude/skills/` are excluded.
- Strict TypeScript settings from `tsconfig.app.json` stay untouched.
- No new top-level runtime dependency. `oxfmt` is a **devDependency** (so `pnpm format` works in CI and pre-commit), or invoked via `pnpm dlx oxfmt` if the team prefers zero-install.

---

## 1. Context

`AGENTS.md` declares `pnpm lint` as the canonical format/lint pass and asserts an ESLint + Prettier stack with 2-space indent, single quotes, 100-char line width, and trailing commas. Neither tool is installed: the only linter today is `oxlint`, declared in `package.json: devDependencies` and run by `pnpm lint`. There is no `.editorconfig`, no `.gitattributes`, no Node version pin, no Git hooks manager, no CI workflow, no commit-message linter, and no `.vscode/settings.json` — every developer's editor and shell environment is free to disagree.

This causes three concrete problems today:

1. **Inconsistent whitespace and line endings.** Files saved on Windows differ from files saved on macOS/Linux; editor defaults disagree on tab vs. 2-space, on `LF` vs. `CRLF`, and on the trailing newline. There is no rule of record.
2. **No format-on-save.** A developer who forgets to run `pnpm lint --fix` (or the equivalent) before pushing can land unformatted code, and the PR diff is contaminated with whitespace. An AI agent that writes a `.tsx` file with three-space indent ships the same way.
3. **No shared commit / branch / dependency conventions enforcement.** Conventional Commits is declared in `AGENTS.md` but unenforced; branch-from-main is declared but unverified; a `package.json` `engines.node` is missing so the wrong Node version silently produces different `dist/` output.

The goal of this plan is to ship the missing tooling in three phases:

- **Phase 1 — formatter baseline**: pick a formatter, commit its config, add editor-side defaults so `Cmd+S` (or the agent's Write tool) produces formatted output.
- **Phase 2 — auto-enforcement**: hook the formatter to editor save (VS Code), agent write (Claude Code `PostToolUse`), git commit (`lefthook` pre-commit), and CI (`pnpm format:check`). Anyone who forgets is caught automatically.
- **Phase 3 — adjacent conventions**: fill the remaining "everyone must respect" gaps — import ordering, file naming, commit messages, dead-export detection, Node version, secret scanning.

The expected outcome: every committed file (regardless of which human or agent wrote it) is formatted consistently, imports are ordered the same way, commits follow Conventional Commits, dead exports don't accumulate, and CI rejects drift.

---

## 2. Goal

Deliver the shared-conventions baseline with these user-visible outcomes:

- **One canonical formatter** — `oxfmt`, configured at `.oxfmtrc.json` with the rules from AGENTS.md § Code style. Added as a devDependency so `pnpm format` and `pnpm format:check` work without `dlx`.
- **Format-on-save for humans** — `.vscode/settings.json` recommends `editor.formatOnSave: true` and sets `"[typescript]": { "editor.defaultFormatter": "oxc.oxfmt-vscode" }` (or whichever VS Code extension surfaces the bundled oxc formatter). Git's CRLF handling is enforced via `.gitattributes` (LF-only for code, CRLF allowed for `*.bat`, `*.ps1`).
- **Format-on-write for agents** — `.claude/settings.json` (shared, not local) adds a `PostToolUse` hook that matches `Edit|Write|MultiEdit` and runs `oxfmt --write <changed-file>` after every agent file mutation. The hook reuses the same hook entry point already wired in `.claude/settings.local.json` for impeccable.
- **Pre-commit hook** — `lefthook.yml` runs `oxfmt --check` on staged files and rejects the commit if formatting is off. `lefthook` is preferred over `husky + lint-staged` because it is a single Go binary (no Node bootstrap), runs ~10× faster, and has a declarative YAML config that lives in one place.
- **CI gate** — `.github/workflows/ci.yml` runs `pnpm format:check`, `pnpm typecheck`, `pnpm lint`, `pnpm ui:lint`, `pnpm test:run` on every PR. Future changes that land unformatted code fail the build.
- **Conventional Commits enforcement** — `commitlint.config.ts` plus a `commit-msg` lefthook hook. `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `perf:`, `build:`, `ci:`, `revert:`, `style:`.
- **Import ordering** — `oxlint`'s `import/order` rule (or a separate `eslint-plugin-import` lane if oxlint lacks it — see §10.1) rejects same-package files imported out of order. Style: external → `@/...` → relative; alphabetized within each group.
- **File naming lint** — `oxlint` rule (or a custom rule if oxlint lacks one) rejects PascalCase `.ts` (without `.tsx`) and PascalCase component filenames with non-PascalCase default exports. Mirrors the base-components plan's existing filename discipline.
- **Dead-export detection** — `knip` runs in `pnpm lint` (or a new `pnpm dead-check` script). Unused exports and untouched files are flagged.
- **Node version pin** — `.nvmrc` with the exact Node version used in CI; `package.json#engines.node` set to `>=20.x` to match. `pnpm-lock.yaml`'s `pnpm` version pinned via `packageManager`.
- **Secret scanner** — `gitleaks` pre-commit hook (optional — Phase 3 deliverable that the user can opt out of if they prefer a backend-only secrets story).

All of the above are recorded in `AGENTS.md` under a new "Shared conventions" section so future agents and humans read the rules and the commands in one place.

---

## 3. Out of scope

- **Migrating `oxlint` rules to ESLint.** The current `oxlint` setup is intentional and lean; this plan does not touch it. If a future rule is missing in `oxlint` (e.g. `import/order`), the plan adds a separate tool rather than migrating the whole stack.
- **Replacing `oxfmt` with Prettier mid-plan.** Once chosen, `oxfmt` stays. Prettier remains an option for users who specifically want the larger plugin ecosystem; it is not a path this plan walks.
- **Visual regression testing.** Not a "convention" — handled by the base-components plan via `playwright.config.ts` + axe-core.
- **Renaming files to enforce naming convention retroactively.** The new file-naming lint applies to *new* files; an existing `src/utils/formatDate.ts` (camelCase) is allowed to stay until someone touches it, at which point they normalize it. A separate rename PR is a follow-up.
- **Branch protection rules / GitHub settings.** Out of repo scope; documented in this plan as recommended Settings → Branches configuration.
- **Automated Dependabot/Renovate config.** Phase 3 notes the recommendation; the actual `.github/dependabot.yml` is a follow-up plan because dependency updates touch feature code, not conventions.
- **i18n string-extraction conventions.** Outside this plan's lens.
- **Visual style tokens / dark-mode switch.** Already covered by `DESIGN.md` and the base-components plan.

---

## 4. Tech decisions

| Decision | Choice | Reason |
| :--- | :--- | :--- |
| Formatter | `oxfmt` (1.x, latest stable) | Same Rust/oxc family as `oxlint`, which is already shipping; Prettier-compatible output; one toolchain. |
| Formatter invocation | devDependency, not `dlx` | Lets `pnpm format` work in CI and pre-commit without a network round-trip; matches how `oxlint` is installed today. |
| Git hooks manager | `lefthook` (single Go binary) | One declarative YAML config; ~10× faster than husky + lint-staged; runs without Node; no `package.json#scripts.prepare` magic. |
| Agent-side formatter hook | Claude Code `PostToolUse` on `Edit\|Write\|MultiEdit` | Reuses the existing hook pattern in `.claude/settings.local.json` (impeccable design check); runs `oxfmt --write` on the touched file. |
| VS Code formatter binding | Default-formatter recommendation in `.vscode/settings.json` | The VS Code marketplace ships an `oxc` extension that surfaces oxfmt; binding it as `editor.defaultFormatter` makes `Shift+Alt+F` and `Cmd+S` use it. |
| Commit linter | `commitlint` + `@commitlint/config-conventional` | The de facto standard for Conventional Commits enforcement; works with lefthook's `commit-msg` hook. |
| Lint for import order | `oxlint`'s `import/order` (if available in the installed version) | First choice — no new dep. If the installed `oxlint@1.71` does not expose `import/order`, fall back to a small standalone `eslint-plugin-import` lane (Phase 3 § technical considerations). |
| Dead-export detector | `knip` | Lean, fast, supports TS + React out of the box; runs in `pnpm lint` via a small script. |
| Secret scanner | `gitleaks` | Best-in-class pre-commit scanner; runs via lefthook; no Node dependency. *Optional in Phase 3 — defer if the team opts out.* |
| Node version pin | `.nvmrc` + `package.json#engines.node` + `packageManager` in `package.json` | The three together pin Node, fail-fast on bad installs, and pin pnpm itself. |
| Lint script name | `pnpm lint` already exists (runs `oxlint`) | **No rename.** `pnpm format` (write) and `pnpm format:check` (verify) are new sibling scripts. `pnpm lint` stays the single command for linting so AGENTS.md's existing `pnpm lint` reference keeps working. |
| Editor config | `.editorconfig` at the repo root | Universal, IDE-agnostic; defines indent, EOL, charset, final-newline for every file type. |

---

## 5. Folder layout

```text
.vscode/
  settings.json                       # NEW — workspace defaults; recommends formatOnSave
  extensions.json                     # NEW — extension recommendations (oxc, vitest, playwright, commitlint)
.editorconfig                         # NEW — universal editor config (indent, EOL, charset)
.gitattributes                        # NEW — EOL normalization per file type, lock LF for code
.gitignore                            # MODIFIED — `.vscode/settings.json` needs a `!.vscode/settings.json` exception (today `.vscode/*` is ignored with only `!.vscode/extensions.json` exempted); add `.lefthook/` cache, `.knip.cache/`, `.gitleaks/`
.oxfmtrc.json                         # NEW — oxfmt config (extends Prettier defaults)
.oxlintrc.json                        # existing — extend with import/order, naming rules
lefthook.yml                          # NEW — git hooks: pre-commit (format+lint), commit-msg (commitlint)
commitlint.config.ts                  # NEW — Conventional Commits config
.github/
  workflows/
    ci.yml                            # NEW — CI: format:check, typecheck, lint, ui:lint, test:run
package.json                          # MODIFIED — engines.node, packageManager, scripts (format, format:check, dead-check)
pnpm-lock.yaml                        # regenerated by `pnpm install`
AGENTS.md                             # MODIFIED — new "Shared conventions" section
.harness/reins/developer/agent.md     # MODIFIED — run `pnpm format` before commit
.harness/reins/code-reviewer/agent.md # MODIFIED — format-check step in review checklist
.nvmrc                                # NEW — Node version (matches CI)
scripts/
  format-staged.mjs                   # NEW — invoked by lefthook to format only staged files (alternative to oxfmt --check)
```

The `scripts/format-staged.mjs` is **only added if** `oxfmt --check <staged-files>` proves slow or has edge cases. Default path is `oxfmt --write <staged-files>` invoked directly from `lefthook.yml`.

---

## 6. Shared Conventions Specification

### 6.1 Formatter configuration

- `.oxfmtrc.json` (oxfmt's JSON config, Prettier-compatible):
  ```json
  {
    "printWidth": 100,
    "tabWidth": 2,
    "useTabs": false,
    "semi": true,
    "singleQuote": true,
    "trailingComma": "all",
    "bracketSpacing": true,
    "arrowParens": "always",
    "endOfLine": "lf",
    "ignorePatterns": ["node_modules", "dist", "coverage", ".harness", ".agents", ".claude/skills", "pnpm-lock.yaml", "**/*.min.js", "**/*.generated.*"]
  }
  ```
  - These values mirror `AGENTS.md` § Code style verbatim. Any future drift requires updating both files in the same commit.
  - `endOfLine: "lf"` is enforced regardless of OS — `.gitattributes` complements this so Git never introduces CRLF even on Windows checkouts.
- DevDependency: `oxfmt` (latest stable). Add via `pnpm add -D oxfmt`.
- `package.json#scripts` additions:
  - `"format": "oxfmt --write ."` — write changes everywhere; safe to run from the repo root.
  - `"format:check": "oxfmt --check ."` — read-only; used by CI and lefthook.
  - `"format:staged": "oxfmt --write"` — invoked by lefthook with the staged-file list as args.
- Tailwind class ordering: **deferred to Phase 3**. Documented in §10.1 as a known caveat.

### 6.2 Editor-side enforcement (humans + agents)

- **`.editorconfig`** (universal):
  ```ini
  root = true

  [*]
  charset = utf-8
  end_of_line = lf
  indent_style = space
  indent_size = 2
  insert_final_newline = true
  trim_trailing_whitespace = true

  [*.md]
  trim_trailing_whitespace = false

  [Makefile]
  indent_style = tab
  ```

  This applies even to editors that don't have an oxfmt plugin — a developer who opens the repo in WebStorm, Sublime, Vim, or Helix gets correct indent and EOL by default. Combined with oxfmt, the result is consistent without any editor-specific work.

- **`.gitattributes`**:
  ```gitattributes
  *             text=auto eol=lf

  *.bat         text eol=crlf
  *.ps1         text eol=crlf
  *.sh          text eol=lf

  *.png         binary
  *.jpg         binary
  *.jpeg        binary
  *.gif         binary
  *.ico         binary
  *.webp        binary
  *.woff        binary
  *.woff2       binary
  *.ttf         binary

  pnpm-lock.yaml      merge=bundle
  ```

  `eol=lf` on `*` is the rule; the explicit CRLF overrides for `*.bat` / `*.ps1` document Windows tooling exceptions. `pnpm-lock.yaml merge=bundle` matches the default pnpm setup so future merges reduce churn.

- **`.vscode/settings.json`** (workspace defaults — applies to humans opening the repo in VS Code):
  ```json
  {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "oxc.oxc-vscode",
    "[typescript]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
    "[typescriptreact]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
    "[javascript]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
    "[json]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
    "[jsonc]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
    "[css]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
    "[html]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
    "[markdown]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
    "files.eol": "\n",
    "files.insertFinalNewline": true,
    "files.trimTrailingWhitespace": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.oxc": "explicit",
      "source.organizeImports.oxc": "explicit"
    }
  }
  ```
  - The `"oxc.oxc-vscode"` identifier is replaced with the actual published VS Code extension ID once confirmed in Phase 1. (The exact identifier resolves during Phase 1 implementation; this file is otherwise locked.)
  - `editor.formatOnSave: true` is the human-side equivalent of "format on save" — every `Cmd+S` triggers `oxfmt` on the file.

- **`.vscode/extensions.json`** (recommend the team installs the same toolset):
  ```json
  {
    "recommendations": [
      "oxc.oxc-vscode",            // oxfmt + oxlint bindings
      "vitest.explorer",
      "playwright.playwright",
      "dbaeumer.vscode-eslint",    // commitlint hints via ESLint
      "editorconfig.editorconfig"
    ]
  }
  ```

- **`.claude/settings.json`** (shared, version-controlled) — the agent-side equivalent of format-on-save:
  ```json
  {
    "hooks": {
      "PostToolUse": [
        {
          "matcher": "Edit|Write|MultiEdit",
          "hooks": [
            {
              "type": "command",
              "command": "node -e \"const fs=require('fs');const p=process.env.CLAUDE_TOOL_FILE_PATH;if(!p||p.startsWith('node_modules/')||p.includes('/dist/'))process.exit(0);try{require('child_process').execSync(`pnpm exec oxfmt --write \\\"${p}\\\"`,{stdio:'pipe'});}catch(e){process.exit(0)}\"",
              "timeout": 10,
              "statusMessage": "Formatting with oxfmt"
            }
          ]
        }
      ]
    }
  }
  ```
  - The hook resolves the touched file path from `CLAUDE_TOOL_FILE_PATH` (or equivalent Claude Code hook env var) and runs `oxfmt --write` on it. If the path is not in scope (e.g. `node_modules/`) or the hook errors, it exits 0 silently — formatting is best-effort, never blocks the agent.
  - The hook is appended to the **shared** `.claude/settings.json`, not the `.local` variant, so every contributor (and every agent run) gets the same behavior.
  - This is the agent-side equivalent of "format on save." The post-write hook is fired *every time an agent uses Write/Edit/MultiEdit*, so the file is formatted before any other agent step reads it.

### 6.3 Pre-commit hook (lefthook)

- `lefthook.yml`:
  ```yaml
  pre-commit:
    parallel: true
    commands:
      format-staged:
        glob: "*.{ts,tsx,js,jsx,mjs,cjs,json,css,html,md}"
        run: pnpm exec oxfmt --write {staged_files}
        stage_fixed: true
      lint-staged:
        glob: "*.{ts,tsx}"
        run: pnpm exec oxlint {staged_files}
        stage_fixed: true

  commit-msg:
    commands:
      commitlint:
        run: pnpm exec commitlint --edit {1}
  ```

  - `parallel: true` runs format + lint together; each command operates on its own files.
  - `stage_fixed: true` re-stages any file oxfmt rewrote, so the commit reflects the formatted version.
  - `commitlint` enforces Conventional Commits on every commit.
  - lefthook itself is installed via `pnpm add -D @evilmartians/lefthook` then `pnpm lefthook install` once to register the git hook.

- `commitlint.config.ts`:
  ```ts
  import type { UserConfig } from '@commitlint/types';

  const config: UserConfig = {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'header-max-length': [2, 'always', 72],
      'type-enum': [2, 'always', [
        'feat', 'fix', 'docs', 'refactor', 'test', 'chore',
        'perf', 'build', 'ci', 'revert', 'style',
      ]],
    },
  };

  export default config;
  ```

### 6.4 CI integration

- `.github/workflows/ci.yml` (skeleton — actual task list mirrors the base-components plan's verification matrix):
  ```yaml
  name: ci

  on:
    pull_request:
    push:
      branches: [main]

  jobs:
    check:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v4
          with: { version: 9 }
        - uses: actions/setup-node@v4
          with:
            node-version-file: .nvmrc
            cache: pnpm
        - run: pnpm install --frozen-lockfile
        - run: pnpm format:check
        - run: pnpm typecheck
        - run: pnpm lint
        - run: pnpm ui:lint
        - run: pnpm test:run
        - run: pnpm build
        - run: pnpm dead-check    # knip (Phase 3)
        - run: pnpm test:e2e      # Playwright (existing)
  ```
  - The matrix is additive: existing `pnpm typecheck`, `pnpm lint`, `pnpm ui:lint`, `pnpm test:run`, `pnpm test:e2e` keep working; this plan adds `pnpm format:check` and (Phase 3) `pnpm dead-check`.
  - PR- and main-push only. Tag pushes go through a separate workflow later.

### 6.5 Import ordering, file naming, and dead-export detection (Phase 3)

- **Import ordering** — extend `.oxlintrc.json` with `import/order` rules:
  ```json
  {
    "rules": {
      "import/order": ["warn", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }],
      "no-unused-vars": "off"   // oxlint default is fine; knip is the load-bearing dead-code detector
    }
  }
  ```
  If oxlint's stable release does not ship `import/order`, Phase 3 implementation notes capture the fallback (a thin `eslint --rule '{"import/order": ...}' --no-eslintrc --plugin import` step in lefthook — uglier, but works).

- **File naming** — declare the rule in `AGENTS.md`:
  - Component files: `PascalCase.tsx` exporting a React component (default or named).
  - All other source files: `camelCase.ts` (or `.tsx` if JSX is present).
  - Test files: `<source>.test.ts` or `<source>.test.tsx`, colocated.
  - The new lint rule rejects mixed cases; Phase 3 implementation notes record the exact rule.
  - Existing files keep their names until they are next edited, at which point the developer normalizes them. A bulk-rename PR is not in scope.

- **Dead-export detection** — `knip`:
  - Add `knip` as a devDependency.
  - `pnpm dead-check` script: `knip --production --strict`.
  - Output reports unused files, unused exports, unused dependencies, unused devDependencies.
  - In Phase 3, the **first run** generates a baseline report so the team can decide what is intentionally unused (e.g. entry components) — anything flagged after a year of follow-up cleanup is clearly dead.
  - The `knip.json` config lives at the repo root and lists the entry files (`src/main.tsx`, `src/App.tsx`, etc.) so the report's false-positive surface stays small.

- **Node version pin** — `.nvmrc`:
  ```
  20.18.1
  ```
  - `package.json` additions:
    ```json
    {
      "engines": { "node": ">=20.18.1", "pnpm": ">=9.0.0" },
      "packageManager": "pnpm@9.15.4"
    }
    ```
  - `pnpm` warning for engine mismatch is treated as an error in CI (`engine-strict=true` in `.npmrc`).
  - Local installs: `nvm use` (or `fnm use`, `volta pin`) auto-selects the right Node from `.nvmrc`.

- **Secret scanner** — `gitleaks`:
  - Add `gitleaks` to the `lefthook.yml` `pre-commit` step (after format and lint, before commit).
  - `gitleaks protect --staged --redact --no-banner`.
  - Phase 3 ships the integration as *opt-in*: enabled by default, but the developer can skip with `LEFTHOOK=skip-secret-scan git commit ...` for one-off cases (e.g. shipping a fixture that intentionally looks like a key but is documented as fake).

### 6.6 Documentation update (AGENTS.md + harness reins)

- `AGENTS.md` § Code style gains a new sub-section "Shared conventions":
  ```markdown
  ## Shared conventions

  Every developer and every agent working on this repo must respect these rules.
  The exact commands and config live in `.oxfmtrc.json`, `.oxlintrc.json`,
  `lefthook.yml`, and `.claude/settings.json`; this section is the *contract*,
  the configs are the *implementation*.

  - **Formatting**: `oxfmt` with 2-space indent, single quotes, 100-char width,
    trailing commas, LF line endings. Run `pnpm format` to apply,
    `pnpm format:check` to verify.
  - **Editor defaults**: `.editorconfig` enforces the rule even outside VS Code.
    `.vscode/settings.json` enables `editor.formatOnSave` and sets the oxc
    formatter as the default for `*.ts`/`*.tsx`/`*.json`/`*.css`/`*.html`/`*.md`.
  - **Git hooks**: `lefthook` runs `oxfmt` + `oxlint` on staged files
    (`pnpm dlx lefthook run pre-commit` is invoked automatically by `git commit`).
  - **Agent-side**: every agent file mutation is formatted by the Claude Code
    `PostToolUse` hook in `.claude/settings.json`.
  - **CI gate**: PRs that are not formatted, linted, type-checked, and tested
    fail the `ci` workflow (`.github/workflows/ci.yml`).
  - **Commits**: Conventional Commits — `feat:`, `fix:`, `docs:`, `refactor:`,
    `test:`, `chore:`, plus the extensions in `commitlint.config.ts`.
    `commitlint` runs on every commit (`commit-msg` hook).
  - **Imports**: external → `@/...` → relative, alphabetized within group
    (`oxlint` `import/order`).
  - **File naming**: components `PascalCase.tsx`; everything else `camelCase.{ts,tsx}`;
    test files colocated `<source>.test.{ts,tsx}`.
  - **Node version**: 20.18.1 via `.nvmrc`; `pnpm dlx nvm use` to align.
  - **Dead code**: `knip` flags unused exports; `pnpm dead-check`.
  - **Secrets**: pre-commit `gitleaks` scan blocks secret leaks.
  ```

- `.harness/reins/developer/agent.md` — add an explicit pre-commit step:
  > "8. Run before commit: `pnpm format:check`, `pnpm typecheck`, `pnpm lint` (the last three are unchanged). The pre-commit hook via `lefthook` auto-formats and lints staged files; if it auto-fixed a file, re-review the diff before committing."

- `.harness/reins/code-reviewer/agent.md` — add `pnpm format:check` and `pnpm dead-check` to the review checklist:
  > "Review checklist additions: (a) `pnpm format:check` exits 0; (b) `pnpm dead-check` produces no new unused exports vs the baseline; (c) commit subject line matches Conventional Commits."

### 6.7 Verification matrix (cross-cutting)

Every phase ships when **all** of the following pass on a fresh clone, on both Linux and Windows runners:

1. `pnpm install` succeeds (Node 20.18.1, pnpm 9.15.4).
2. `pnpm format` runs on the existing tree; the diff is empty (formatting is already correct).
3. `pnpm format:check` exits 0.
4. `pnpm typecheck` exits 0.
5. `pnpm lint` exits 0.
6. `pnpm ui:lint` exits 0.
7. `pnpm test:run` exits 0 with all existing tests passing.
8. `pnpm build` exits 0.
9. `pnpm dead-check` exits 0 (Phase 3 onward).
10. `pnpm test:e2e` exits 0 (existing Playwright suite).
11. `lefthook run pre-commit` produces no errors on a staged edited file (Phase 2 onward).
12. Manual verification: opening a `.tsx` file in VS Code and saving produces the same output as `pnpm format`.
13. Manual verification: running Claude Code (or the equivalent) in the repo and asking the agent to write a deliberately misformatted `.tsx` file results in a formatted file on disk after the agent's Edit/Write tool returns.

---

## 7. Cross-plan adoption

This plan is consumed by:

- `.agents/plans/base-components/base-component-library.md` — its Phase 8 verification matrix already runs `pnpm lint`, `pnpm typecheck`, `pnpm test:run`, `pnpm ui:check`. Phase 2 of this plan adds `pnpm format:check` to that matrix; the base-components plan's next version bumps its verification matrix accordingly.
- `.agents/plans/authentication-and-profile/auth-state-foundation.md` — its pre-commit step mirrors the developer rein's checklist. The adoption note points at the new format:check script.
- Future plans (staff management, orders, KDS, analytics) inherit the convention for free because the config files are in the repo root.

The adoption contract:

- Any plan that adds a new file type or new top-level directory must update `.oxfmtrc.json#ignorePatterns`, `.editorconfig`, and `.gitattributes` in the same commit. Documenting a new convention without wiring the tooling is a phase that drifted.

---

## 8. Security guardrails

| Risk | Mitigation |
|---|---|
| Formatter changes fail loudly and block agents | The Claude Code `PostToolUse` hook wraps `oxfmt --write` in a try/catch and exits 0 on any failure. The formatter is best-effort for agents; the pre-commit hook and CI are the hard gate. |
| Pre-commit hook leaks secrets in the working tree | `gitleaks` scans staged content only; leaks are caught before the commit lands. |
| Lefthook auto-fixes staged files without the developer noticing | `stage_fixed: true` combined with `git diff --staged` between the prompt and the commit message is documented in the AGENTS.md update; `git status` immediately before commit reveals any auto-fixed file. |
| Format-on-save in VS Code conflicts with the user's installed Prettier extension | The `.vscode/settings.json` explicitly sets `"editor.defaultFormatter": "oxc.oxc-vscode"` for every relevant language; Prettier (if installed) is **not** auto-bound. Developers who want Prettier can opt in per-file via the command palette. |
| `knip` produces a flood of false positives | Phase 3 ships a `knip.json` with explicit `entry` and `ignore` lists calibrated against the base-components plan's known exported primitives. The baseline run is the explicit "false-positive budget." |

---

## 9. Development Phases

### Phase overview

| Phase | Name | Tool groups delivered | Goal |
|:---:|---|---|---|
| **1** | Formatter & editor baseline | `oxfmt`, `.editorconfig`, `.gitattributes`, `.vscode/settings.json`, `.vscode/extensions.json`, `format` + `format:check` + `format:staged` scripts | One canonical formatter + editor defaults so even an unmodified IDE produces formatted output. |
| **2** | Auto-enforcement | Claude Code `PostToolUse` hook, `lefthook` (pre-commit), `.github/workflows/ci.yml`, `AGENTS.md` Shared conventions section, harness rein updates | The formatter is *unavoidable* — agents, humans, and CI all run it; no commit lands unformatted. |
| **3** | Adjacent conventions | `import/order`, file naming lint, `commitlint`, `knip` (`dead-check`), Node version pin, optional `gitleaks`, `AGENTS.md` updates | The remaining "everyone respects the same rule" gaps are filled. |

### Phase 1 — Formatter & editor baseline

**Goal**: Pick `oxfmt` as the formatter, commit its config, wire the editor-agnostic defaults, and add the format scripts so `pnpm format`, `pnpm format:check`, and `pnpm format:staged` work.

**Status**: ⏸ Pending

**Deliverables**:

- [ ] Add `oxfmt` to `package.json#devDependencies` via `pnpm add -D oxfmt`. Pin to a known good version (≥1.x latest stable).
- [ ] Create `.oxfmtrc.json` matching AGENTS.md § Code style (2-space, single quotes, 100-char, trailing commas, LF).
- [ ] Create `.editorconfig` with the values in §6.2.
- [ ] Create `.gitattributes` with the values in §6.2.
- [ ] Create `.vscode/settings.json` and `.vscode/extensions.json` matching §6.2.
- [ ] Update `.gitignore` to add any tool caches (none expected; verified by run).
- [ ] Add the `format`, `format:check`, and `format:staged` scripts to `package.json#scripts`.
- [ ] Update `AGENTS.md` § Code style to **delete** the "ESLint + Prettier" reference and replace it with "oxfmt + oxlint" (mirroring what actually ships). Update "Setup commands" to use `pnpm format` / `pnpm format:check`.
- [ ] Run `pnpm format` on the entire tree. The diff (if any) is committed in the same PR; the formatter's output becomes the new baseline.
- [ ] Verify `pnpm format:check` exits 0 on the formatted tree.
- [ ] Manually verify VS Code workspace settings apply: open `src/main.tsx`, type a deliberate misformat (extra space, single-line if-branch), save — the file is rewritten.

**Exit criteria**: `pnpm format:check` exits 0 on the entire repo. `pnpm typecheck`, `pnpm build`, `pnpm lint`, `pnpm test:run` still pass. A developer opening the repo in any common editor (VS Code, WebStorm, Vim, Sublime) gets consistent formatting without local config.

### Phase 2 — Auto-enforcement

**Goal**: Wire format-on-commit (humans outside VS Code), format-on-write (AI agents), and format-on-merge (CI), so a commit that slips through any single layer is caught by the next.

**Status**: ⏸ Pending

**Deliverables**:

- [ ] Add `lefthook` and `@commitlint/config-conventional` to devDependencies.
- [ ] Create `lefthook.yml` matching §6.3.
- [ ] Run `pnpm exec lefthook install` to register the hook with the local repo (note for contributors in `AGENTS.md`).
- [ ] Create `commitlint.config.ts` matching §6.3.
- [ ] Add `pnpm dlx lefthook install` to `AGENTS.md` Setup commands.
- [ ] Create `.github/workflows/ci.yml` matching §6.4 with `format:check`, `typecheck`, `lint`, `ui:lint`, `test:run`, `build`, `test:e2e` jobs.
- [ ] Create `.claude/settings.json` (shared) with the format-on-write `PostToolUse` hook from §6.2.
- [ ] Update `.harness/reins/developer/agent.md` and `.harness/reins/code-reviewer/agent.md` per §6.6.
- [ ] Add the "Shared conventions" section to `AGENTS.md` per §6.6.
- [ ] Manually verify the lefthook flow: create a deliberate misformat, `git add`, `git commit -m "chore: verify pre-commit hook"` — the commit fails (or auto-fixes the file and asks for review).
- [ ] Manually verify the agent hook: ask Claude Code (or the equivalent) to write `src/_temp.tsx` with deliberately broken formatting — the file on disk is formatted.
- [ ] Manually verify CI: open a PR that contains an unformatted file (temporarily bypass left hook with `--no-verify` to land a single bad file), watch `pnpm format:check` fail in GitHub Actions.

**Exit criteria**: A deliberately unformatted commit fails the pre-commit hook. An agent-written unformatted file is formatted on write. A PR with an unformatted file fails the CI workflow. `pnpm typecheck`, `pnpm lint`, `pnpm ui:lint`, `pnpm test:run`, `pnpm build`, `pnpm test:e2e` still pass.

### Phase 3 — Adjacent conventions

**Goal**: Fill the remaining "everyone must respect the same rule" gaps so the conventions baseline is complete.

**Status**: ⏸ Pending

**Deliverables**:

- [ ] Extend `.oxlintrc.json` with `import/order` rules per §6.5; verify on the existing tree.
- [ ] If oxlint 1.x does not export `import/order`, add an ESLint + `eslint-plugin-import` dependency with a minimal `eslint.config.js` that only runs the import-order rule in `pnpm lint`. Document the rationale in §10.1.
- [ ] Add a file-naming lint rule (or an entry-time naming check via a small `scripts/check-filenames.mjs` invoked from lefthook) per §6.5.
- [ ] Add `@commitlint/cli` and `@commitlint/types` as devDependencies. Wire the `commit-msg` lefthook hook from Phase 2 (already configured; verify works here).
- [ ] Add `knip` as a devDependency. Create `knip.json` with explicit entry and ignore lists. Add `"dead-check": "knip --production --strict"` to `package.json#scripts`.
- [ ] Run `pnpm dead-check` once on the existing tree; capture the output as a baseline file (`docs/knip-baseline.md` or a top-level `knip-baseline.json`); commit it. Subsequent PRs that introduce new dead exports are flagged against the baseline.
- [ ] Create `.nvmrc` with `20.18.1`. Update `package.json#engines` and `packageManager`. Create or extend `.npmrc` with `engine-strict=true`.
- [ ] Add `gitleaks` to the lefthook `pre-commit` step per §6.5 (optional — the user can mark as `[optional]`). Document the opt-out in `AGENTS.md`.
- [ ] Update `AGENTS.md` "Shared conventions" section to mention `import/order`, file naming, commit lint, `knip`, `.nvmrc`, `gitleaks`.
- [ ] Update `.harness/reins/code-reviewer/agent.md` to run `pnpm dead-check` during review.

**Exit criteria**: A PR that introduces an unused export fails `pnpm dead-check`. A PR that imports a relative path before an `@/...` import fails `pnpm lint`. A commit message that does not match Conventional Commits fails the `commit-msg` hook. An engineer running `node` 18.x fails `pnpm install` with a clear engine-mismatch error. All previous phase exit criteria still hold.

---

## 10. Technical considerations

### 10.1 Cross-cutting

> **Phase 1 adoption (target):** items marked `[P1 ✅]` will be implemented in the foundation. Items without a marker remain pending for the phase that introduces them.

- **Format-on-save is the universal requirement.** The plan layers four independent mechanisms (formatter, editor defaults, agent hook, Git hook, CI) so even when one is misconfigured, the others catch the gap. `[target P2 ✅]` — the four layers ship in Phase 2.
- **`oxfmt` does not yet ship a Tailwind class-sorting plugin.** `prettier-plugin-tailwindcss` does, but using it would require switching the formatter to Prettier or wiring a separate class-sort post-step. Phase 1 ships without class ordering; Phase 3 adds a follow-up `eslint-plugin-tailwindcss` or `prettier-plugin-tailwindcss` step in lefthook *only if* the team wants ordered classes. Document the inconsistency in `AGENTS.md` until resolved. `[P1 noted]`
- **`oxlint` import/order support depends on the installed version.** Phase 3 implementation notes capture the fallback. The fallback is minimal — an ESLint install with just `eslint-plugin-import`, run in a separate `pnpm lint:imports` script. The repo's lint script (`pnpm lint`) stays on oxlint.
- **The Claude Code `PostToolUse` hook runs even when the file is outside scope.** The Node one-liner filters by path prefix (`node_modules/`, `dist/`, etc.) before invoking `oxfmt`. If oxfmt exits non-zero (the file is already formatted, or the formatter fails on a syntax error), the hook swallows it. Format-on-save for agents is best-effort. `[P2 ✅]`
- **`lefthook` install is a contributor step.** `pnpm dlx lefthook install` only registers the hook in the local `.git/`; it does not propagate to other clones. Phase 2's `AGENTS.md` update makes this step visible in the Setup commands list and a contributor who skips it lands unformatted code only until CI catches it. Document the warning. `[P2 ✅]`
- **Conventional Commits enforces the **subject**, not the **body**. Phase 3 leaves the body free-form; the developer rein already lists the one-paragraph handoff as the standard. No `commitlint` body rule is needed. `[P3 ✅]`
- **`knip` baseline lives in the repo.** The first run writes the "currently known unused" list to `docs/knip-baseline.md` (a single small file) so future PRs that introduce new dead exports are flagged against it. A PR that *removes* a dead export updates the baseline in the same commit. `[P3 ✅]`

### 10.2 Risks specific to this plan

- **oxfmt version churn.** The oxc project iterates fast; pinning via `package.json` devDependency `^` ranges keeps the lockfile deterministic. If a breaking change ships, the next phase bumps and the plan notes the breaking change with the version pin.
- **CLI-vs-extension inconsistency on VS Code.** The `oxc.oxc-vscode` identifier resolves during Phase 1; if the extension marketplace listing has not adopted oxfmt at the time of Phase 1 implementation, the fallback is to set `"editor.defaultFormatter": "null"` (rely on `.editorconfig` + manual `Shift+Alt+F` via oxfmt CLI) and document the workaround in `AGENTS.md`.
- **Mixed-CRLF in pnpm-lock.yaml on Windows.** `.gitattributes` `eol=lf` on `pnpm-lock.yaml` overrides Windows defaults. If a developer accidentally re-introduces CRLF, the next commit's diff shows the change and the formatter's diff flips it back.
- **CI runner install time.** `pnpm install` for the existing tree is the slow step in CI; the new jobs (`format:check`, `dead-check`) add only seconds. No budget impact.
- **Agent hook side-effect on file mtime.** Formatting changes mtime; the next git operation sees the file as modified. This is correct behavior — the developer is expected to see the diff and stage the change. Documented in AGENTS.md.

### 10.3 Performance acceptance

- `oxfmt --check` on the existing tree (target ~5,000 source files by the end of Phase 3) completes in <2 s on a developer laptop and <10 s in CI.
- `lefthook run pre-commit` adds <1 s to a commit (format + lint on staged files only, parallel).
- `knip --production --strict` on the existing tree completes in <5 s (warm cache).
- `pnpm format:check` and `pnpm dead-check` are added to CI as separate jobs so they can run in parallel with `pnpm typecheck` (no sequential dependency).

### 10.4 Out-of-band considerations (deferred to follow-up plans)

- **Dependabot config** — Phase 3 mentions `.github/dependabot.yml` as a recommendation; the actual config file is not added in this plan.
- **Branch protection rules** — recommended in §3 Out of scope; configured via GitHub Settings, not repo files.
- **Visual regression tests for formatters** — not a thing. Format output is deterministic; the verification matrix's `pnpm format:check` exit code is the test.
- **Editor extensions for non-VS-Code users** — out of scope. The `.editorconfig` and `lefthook` layers give Vim / Sublime / WebStorm / Helix enough rules to converge.

---

## Changelog

### v1.0 (2026-07-26) — initial plan committed

- Plan added to `.agents/plans/shared-conventions/formatting-and-shared-conventions.md`.
- Three phases scoped: (1) formatter & editor baseline, (2) auto-enforcement (agent + pre-commit + CI), (3) adjacent conventions.
- Chose `oxfmt` for format-on-save (consistent with the existing `oxlint`; both Rust, same oxc family).
- Chose `lefthook` over `husky + lint-staged` for pre-commit (single Go binary, no Node bootstrap, ~10× faster).
- Chose Claude Code `PostToolUse` hook for agent-side format-on-write (reuses the existing `.claude/settings.local.json` impeccable precedent).
- Enumerated the "adjacent" conventions: import ordering, file naming, `commitlint`, `knip`, Node pin, `gitleaks`.
- AGENTS.md gains a new "Shared conventions" section that links every config file to its rule.
- Two-commit rule per phase is preserved; the minor version bumps on each phase completion.

<!-- legacy proposal draft entries (kept for context, do NOT bump v on typo-only edits) -->

### v0.1 (2026-07-26) — proposal draft (pre-commit)

- Initial proposal reviewed and approved during the planning session.
- The same content was committed at `~/.claude/plans/structured-imagining-cascade.md` before promotion to the project tree.
