import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pack } from '../../packages/content/schema.js';
import compileWeb from './web.js';
import compileRoblox from './roblox.js';
import compileMinecraft from './minecraft.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const packsDir = path.join(root, 'packages/content/packs');

async function main() {
  const packs: Pack[] = [];
  if (fs.existsSync(packsDir)) {
    const files = fs.readdirSync(packsDir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const data = JSON.parse(fs.readFileSync(path.join(packsDir, f), 'utf-8'));
      packs.push(data);
    }
  }

  await compileWeb(packs);
  await compileRoblox(packs);
  await compileMinecraft(packs);
  console.log(`Compiled ${packs.length} packs.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
