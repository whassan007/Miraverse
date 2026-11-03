import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pack } from '../../packages/content/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '../../apps/web/src/generated/packs.json');

export default async (packs: Pack[]) => {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const sorted = [...packs].sort((a, b) => a.country.localeCompare(b.country));
  fs.writeFileSync(outPath, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
};
