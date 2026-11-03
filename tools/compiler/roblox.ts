import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pack } from '../../packages/content/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '../../apps/roblox/src/shared/Packs.luau');

export default async (packs: Pack[]) => {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const sorted = [...packs].sort((a, b) => a.country.localeCompare(b.country));
  const lines = ['-- GENERATED FILE - DO NOT EDIT', 'return {'];
  for (const p of sorted) {
    lines.push(`  [${JSON.stringify(p.country)}] = { country = ${JSON.stringify(p.country)}, name_en = ${JSON.stringify(p.name_en)} },`);
  }
  lines.push('}');
  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf-8');
};
