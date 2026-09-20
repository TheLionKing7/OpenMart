import { copyFile, mkdir, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'assets');
const destDir = path.join(root, 'website', 'public', 'assets');

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG']);

async function main() {
  await mkdir(destDir, { recursive: true });
  const files = await readdir(srcDir);
  let copied = 0;

  for (const file of files) {
    const ext = path.extname(file);
    if (!IMAGE_EXT.has(ext)) continue;
    await copyFile(path.join(srcDir, file), path.join(destDir, file));
    copied++;
    console.log(`  ${file}`);
  }

  console.log(`\nSynced ${copied} market image(s) → website/public/assets/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
