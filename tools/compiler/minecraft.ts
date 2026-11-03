import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pack } from '../../packages/content/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '../../apps/minecraft/scripts/generated/packs.ts');

export default async (packs: Pack[]) => {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const sorted = [...packs].sort((a, b) => a.country.localeCompare(b.country));
  const content = `// GENERATED FILE - DO NOT EDIT\nimport type { Pack } from '../../../../packages/content/schema.js';\nexport const PACKS: Pack[] = ${JSON.stringify(sorted, null, 2)};\n`;
  fs.writeFileSync(outPath, content, 'utf-8');
};
