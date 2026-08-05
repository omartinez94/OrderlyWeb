import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// Patterns for filenames that should not be committed (private keys, env files, config files with secrets)
const SUSPICIOUS_FILENAMES = [
  /\.env(?:\..*)?$/i,                // matches .env, .env.local, .env.production, etc. (except .env.example)
  /id_rsa/i,                         // private SSH keys
  /id_dsa/i,
  /id_ecdsa/i,
  /id_ed25519/i,
  /\.pem$/i,                         // PEM certificates/keys
  /\.pkcs12$/i,
  /\.pfx$/i,
  /\.p12$/i,
  /\.key$/i,                         // Private key extensions
];

// Allowlist for filenames that are allowed to match the filename rules (e.g. .env.example is allowed, source files are allowed)
const ALLOWED_FILENAMES = [
  /\.env\.example$/i,
  /CredentialForm\.tsx$/i,           // UI components
  /SecretPage\.tsx$/i,
  /types\/.*\.ts$/i,
];

// Patterns for contents that look like secrets
const SECRET_PATTERNS = [
  {
    name: 'Private Key',
    regex: /-----BEGIN[ A-Z0-9_]*PRIVATE KEY-----/
  },
  {
    name: 'Generic API Key / Token / Secret / Password',
    // Looks for key assignment to a string of at least 12 chars (excluding quotes)
    // Matches: secret = "...", password: '...', etc.
    regex: /(?:secret|password|passwd|private_key|api_key|apikey|token|client_secret|token_secret|db_password)\s*[:=]\s*['"`]([a-zA-Z0-9_\-\.\~\+\/=]{12,})['"`]/i
  },
  {
    name: 'AWS Access Key ID',
    regex: /AKIA[0-9A-Z]{16}/
  },
  {
    name: 'Google API Key',
    regex: /AIza[0-9A-Za-z-_]{35}/
  },
  {
    name: 'Slack Token',
    regex: /xox[bapr]-[0-9]{12}/
  },
  {
    name: 'GitHub Token',
    regex: /gh[pousr]_[A-Za-z0-9_]{36,255}/
  },
  {
    name: 'Stripe API Key',
    regex: /sk_live_[0-9a-zA-Z]{24}/
  },
  {
    name: 'JWT Token',
    regex: /eyJ[a-zA-Z0-9-_]+\.eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+/
  },
  {
    name: 'Database URL with Credentials',
    regex: /[a-zA-Z+]+:\/\/[^/:]+:([^/:\s]+)@[^/\s]+/
  }
];

// Common mock/placeholder values that should not trigger warnings
const PLACEHOLDER_KEYWORDS = [
  /mock/i,
  /placeholder/i,
  /dummy/i,
  /test/i,
  /example/i,
  /your_secret/i,
  /your_api_key/i,
  /change_me/i,
  /change-me/i,
  /demo/i,
  /default/i,
  /local/i,
  /temp/i,
  /unused/i,
  /fake/i,
  /testing/i,
  /<.*>/, // e.g. <your-api-key>
  /\$\{.*\}/, // e.g. ${JWT_SECRET} (environment variable interpolation)
];

// Extensions and paths to ignore during content scanning
const IGNORED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.pdf', '.zip', '.tar', '.gz'
]);

const IGNORED_PATHS = [
  /node_modules/i,
  /dist/i,
  /build/i,
  /\.next/i,
  /\.git/i,
  /pnpm-lock\.yaml$/i,
  /package-lock\.json$/i,
  /yarn\.lock$/i
];

function isPathIgnored(filePath) {
  return IGNORED_PATHS.some(p => p.test(filePath)) || IGNORED_EXTENSIONS.has(path.extname(filePath));
}

function getStagedFiles() {
  try {
    const stdout = execSync('git diff --cached --name-only --diff-filter=d', { encoding: 'utf8' });
    return stdout.split('\n').map(line => line.trim()).filter(Boolean);
  } catch (err) {
    console.error('Failed to get staged files from Git:', err.message);
    return [];
  }
}

function maskSecret(val) {
  if (val.length <= 8) return '****';
  return val.substring(0, 4) + '****' + val.substring(val.length - 4);
}

function scanFile(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) return [];

  const findings = [];

  // Check filename first
  const fileName = path.basename(filePath);
  const isAllowedFile = ALLOWED_FILENAMES.some(p => p.test(filePath));

  if (!isAllowedFile) {
    for (const pattern of SUSPICIOUS_FILENAMES) {
      if (pattern.test(fileName)) {
        findings.push({
          type: 'FILENAME',
          message: `Suspicious file name detected: "${fileName}". Sensitive files like keys/certificates or configuration with secrets should not be committed.`
        });
        return findings; // Stop scanning contents if file shouldn't exist
      }
    }
  }

  // If path is completely ignored or has binary ext, don't scan content
  if (isPathIgnored(filePath)) return findings;

  try {
    const content = fs.readFileSync(absolutePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Skip comments that explicitly tell us to ignore this line
      if (line.includes('secret-ignore') || line.includes('gitleaks:allow')) {
        continue;
      }

      for (const pattern of SECRET_PATTERNS) {
        const match = line.match(pattern.regex);
        if (match) {
          // If we matched the second capture group (the actual secret value) or the whole match
          const secretValue = match[1] || match[0];

          // Check if the secret value looks like a placeholder
          const isPlaceholder = PLACEHOLDER_KEYWORDS.some(kw => kw.test(secretValue));
          if (isPlaceholder) continue;

          // Double check entropy / generic length check to make sure it's not a short variable name
          if (pattern.name.includes('Generic') && secretValue.length < 12) {
            continue;
          }

          findings.push({
            type: 'CONTENT',
            line: lineNum,
            rule: pattern.name,
            matchedText: line.trim(),
            secretValue: secretValue
          });
        }
      }
    }
  } catch (err) {
    // Skip files we fail to read (e.g. binary files or permissions issues)
  }

  return findings;
}

function main() {
  const stagedFiles = getStagedFiles();
  if (stagedFiles.length === 0) {
    process.exit(0);
  }

  let totalFindings = 0;

  for (const file of stagedFiles) {
    const findings = scanFile(file);
    if (findings.length > 0) {
      console.error(`\x1b[31m[Security Audit] Potential credentials or secrets found in: ${file}\x1b[0m`);
      for (const finding of findings) {
        if (finding.type === 'FILENAME') {
          console.error(`  \x1b[33m- ${finding.message}\x1b[0m`);
        } else {
          const masked = maskSecret(finding.secretValue);
          const displayLine = finding.matchedText.replace(finding.secretValue, masked);
          console.error(`  \x1b[33m- Line ${finding.line}: [${finding.rule}] detected. Line preview:\x1b[0m`);
          console.error(`      \x1b[90m${finding.line}: ${displayLine}\x1b[0m`);
        }
        totalFindings++;
      }
      console.error('');
    }
  }

  if (totalFindings > 0) {
    console.error('\x1b[41m\x1b[37m COMMIT BLOCKED \x1b[0m');
    console.error('\x1b[31mGit commit blocked because potential secrets or credentials were detected.\x1b[0m');
    console.error('\x1b[32mIf this is a false positive, you can bypass this check by:\x1b[0m');
    console.error('\x1b[32m  1. Appending "// secret-ignore" or "// gitleaks:allow" to the end of the line.\x1b[0m');
    console.error('\x1b[32m  2. Committing with the "--no-verify" flag (only for authorized local testing).\x1b[0m');
    process.exit(1);
  }

  process.exit(0);
}

main();
