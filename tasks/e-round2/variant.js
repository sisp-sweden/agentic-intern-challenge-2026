// Usage: node variant.js <email>
// Picks your data set (1-3) from your email address and unpacks it into data/.
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const email = process.argv[2];
if (!email) {
  console.error('usage: node variant.js <email>');
  process.exit(1);
}

const hex = createHash('sha256').update(email.trim().toLowerCase(), 'utf8').digest('hex').slice(0, 10);
const variant = (parseInt(hex, 16) % 3) + 1;
console.log(`data set ${variant}`);

const root = fileURLToPath(new URL('./', import.meta.url));
const source = join(root, 'data', 'variants', String(variant));
if (!existsSync(source)) {
  console.error(`data set ${variant} is missing from ${source}`);
  process.exit(1);
}

const target = join(root, 'data');
mkdirSync(target, { recursive: true });
for (const file of readdirSync(source)) {
  if (file.endsWith('.gz')) {
    writeFileSync(join(target, basename(file, '.gz')), gunzipSync(readFileSync(join(source, file))));
  } else if (file.endsWith('.csv')) {
    copyFileSync(join(source, file), join(target, file));
  } else continue;
  console.log(`  data/${file.endsWith('.gz') ? basename(file, '.gz') : file}`);
}
