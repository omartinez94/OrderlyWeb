#!/usr/bin/env node
// .claude/hooks/format-on-write.mjs
// Format-on-write hook for Claude Code agents.
// Reads PostToolUse JSON from stdin, extracts the file path, and runs oxfmt --write on it.
// Best-effort: exits 0 on any failure so formatting never blocks the agent.
//
// Plan: .agents/plans/shared-conventions/formatting-and-shared-conventions.md §6.2

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const IGNORE_PREFIXES = [
  "node_modules/",
  "dist/",
  "coverage/",
  ".harness/",
  ".agents/",
  ".claude/skills/",
  "docs/wireframes/",
];

const SUPPORTED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  ".html",
  ".json",
  ".md",
]);

function normalizePath(p) {
  return p.replace(/\\/g, "/");
}

function shouldSkip(filePath) {
  const normalized = normalizePath(filePath);
  for (const prefix of IGNORE_PREFIXES) {
    if (normalized.startsWith(prefix)) return true;
  }
  const dot = normalized.lastIndexOf(".");
  if (dot === -1) return true;
  const ext = normalized.slice(dot);
  return !SUPPORTED_EXTENSIONS.has(ext);
}

let payload;
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const filePath = payload?.tool_input?.file_path;
if (typeof filePath !== "string" || filePath.length === 0) {
  process.exit(0);
}
if (shouldSkip(filePath)) {
  process.exit(0);
}

try {
  execFileSync("pnpm", ["exec", "oxfmt", "--write", filePath], {
    cwd: process.env.CLAUDE_PROJECT_DIR,
    stdio: "pipe",
  });
} catch {
  // best-effort: never block the agent on a format error
  process.exit(0);
}
