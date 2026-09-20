import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const CHECKS = [
  { dir: 'website', cmd: 'npm run typecheck' },
  { dir: 'merchant-app', cmd: 'npm run typecheck' },
  { dir: 'distributor-app', cmd: 'npm run typecheck' },
  { dir: 'affiliate-app', cmd: 'npm run typecheck' },
  { dir: 'logistics-app', cmd: 'npm run typecheck' },
  { dir: 'manufacturer-app', cmd: 'npm run typecheck' },
  {
    dir: 'backend',
    cmd: 'node --check server.mjs && node --check extensions.mjs && node --check payments.mjs',
  },
];

let failed = false;

for (const { dir, cmd } of CHECKS) {
  const cwd = join(ROOT, dir);
  if (!existsSync(cwd)) continue;
  if (dir !== 'backend' && !existsSync(join(cwd, 'package.json'))) continue;
  if (dir !== 'backend' && !existsSync(join(cwd, 'node_modules'))) {
    console.log(`\n▶ ${dir} (skipped — run npm install)`);
    continue;
  }

  process.stdout.write(`\n▶ ${dir}\n`);
  try {
    execSync(cmd, { cwd, stdio: 'inherit', shell: true });
  } catch {
    failed = true;
  }
}

if (failed) {
  console.error('\nPre-commit checks failed.');
  process.exit(1);
}

console.log('\nAll pre-commit checks passed.');
