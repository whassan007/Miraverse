// Phase 1 scaffold (replaced by G7)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../../apps/minecraft/rp/textures/items');
fs.mkdirSync(outDir, { recursive: true });
console.log('Texture generator scaffold ready.');
