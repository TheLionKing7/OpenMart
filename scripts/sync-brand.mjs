import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'brand', 'logo.png');

if (!fs.existsSync(src)) {
  console.error('Missing brand/logo.png — add your logo file first.');
  process.exit(1);
}

const targets = [
  'merchant-app/assets/logo.png',
  'merchant-app/assets/icon.png',
  'merchant-app/assets/favicon.png',
  'distributor-app/assets/logo.png',
  'distributor-app/assets/icon.png',
  'affiliate-app/assets/logo.png',
  'affiliate-app/assets/icon.png',
];

for (const rel of targets) {
  const dest = path.join(root, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('Copied →', rel);
}

console.log('Brand sync complete.');
