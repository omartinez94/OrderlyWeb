import { execSync } from "node:child_process";

// Color definitions for terminal output
const COLORS = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m",
  bgRed: "\x1b[41m\x1b[37m",
  bgGreen: "\x1b[42m\x1b[30m",
};

const checks = [
  {
    name: "Secrets Audit",
    cmd: "node scripts/check-secrets.js",
    failMsg: "Secrets or credentials detected in staged files. Commit aborted.",
  },
  {
    name: "TypeScript Compilation",
    cmd: "pnpm typecheck",
    failMsg: "TypeScript compilation failed. Fix type errors before proceeding.",
  },
  {
    name: "Formatting Compliance",
    cmd: "pnpm format:check",
    failMsg: "Formatting check failed. Run 'pnpm format' to clean up styling.",
  },
  {
    name: "Linter Checks",
    cmd: "pnpm lint",
    failMsg: "Linter found errors. Fix lints before proceeding.",
  },
  {
    name: "Vitest Unit Tests",
    cmd: "pnpm test:run",
    failMsg: "One or more unit tests failed.",
  },
];

console.log(`${COLORS.cyan}==================================================${COLORS.reset}`);
console.log(`${COLORS.cyan}         Orderly Phase Verification Tool          ${COLORS.reset}`);
console.log(`${COLORS.cyan}==================================================${COLORS.reset}\n`);

let passedCount = 0;
const results = [];

for (const check of checks) {
  process.stdout.write(`${COLORS.gray}[RUN]${COLORS.reset} ${check.name}... `);
  try {
    // Run synchronously, buffering stderr/stdout
    execSync(check.cmd, { stdio: "pipe" });
    console.log(`${COLORS.green}PASSED${COLORS.reset}`);
    passedCount++;
    results.push({ name: check.name, status: "PASSED", color: COLORS.green });
  } catch (err) {
    console.log(`${COLORS.red}FAILED${COLORS.reset}`);
    results.push({ name: check.name, status: "FAILED", color: COLORS.red });

    console.error(
      `\n${COLORS.bgRed} CHECK FAILED ${COLORS.reset} ${COLORS.red}${check.failMsg}${COLORS.reset}`,
    );
    if (err.stdout && err.stdout.toString().trim()) {
      console.error(`\n${COLORS.gray}--- stdout ---${COLORS.reset}`);
      console.error(err.stdout.toString());
    }
    if (err.stderr && err.stderr.toString().trim()) {
      console.error(`\n${COLORS.gray}--- stderr ---${COLORS.reset}`);
      console.error(err.stderr.toString());
    }
    console.log(`\n${COLORS.red}Phase verification failed.${COLORS.reset}\n`);
    process.exit(1);
  }
}

console.log(`\n${COLORS.bgGreen} PHASE VERIFIED ${COLORS.reset}`);
console.log(
  `${COLORS.green}All ${passedCount}/${checks.length} phase checks passed successfully!${COLORS.reset}\n`,
);
process.exit(0);
