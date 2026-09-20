import { execSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

if (process.env.CI || process.env.VERCEL) {
  process.exit(0);
}

function gitRoot() {
  for (const cwd of [ROOT, join(ROOT, 'website')]) {
    try {
      return execSync('git rev-parse --show-toplevel', { encoding: 'utf8', cwd }).trim();
    } catch {
      // try next
    }
  }
  return null;
}

const repoRoot = gitRoot();
if (!repoRoot) {
  process.exit(0);
}

const huskyBin = join(ROOT, 'node_modules', 'husky', 'bin.js');
if (existsSync(huskyBin)) {
  spawnSync(process.execPath, [huskyBin], { cwd: repoRoot, stdio: 'inherit' });
}

const rootHuskyDir = join(ROOT, '.husky');
const rootHuskyInternal = join(rootHuskyDir, '_');
const sourceInternal = join(repoRoot, '.husky', '_');

if (existsSync(sourceInternal)) {
  mkdirSync(rootHuskyDir, { recursive: true });
  cpSync(sourceInternal, rootHuskyInternal, { recursive: true, force: true });
}

const hooksPath = repoRoot === ROOT ? '.husky/_' : join('..', '.husky', '_');
execSync(`git config core.hooksPath "${hooksPath.replace(/\\/g, '/')}"`, {
  cwd: repoRoot,
  stdio: 'inherit',
});
