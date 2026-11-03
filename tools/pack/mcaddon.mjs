// Phase 1 scaffold (replaced by X10)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const mcDir = path.join(root, 'apps/minecraft');
const distDir = path.join(mcDir, 'dist');
fs.mkdirSync(distDir, { recursive: true });
const outAddon = path.join(distDir, 'miraverse.mcaddon');
if (fs.existsSync(outAddon)) fs.unlinkSync(outAddon);
execFileSync('zip', ['-r', '-q', outAddon, 'bp', 'rp'], { cwd: mcDir });
console.log(`Packaged ${outAddon}`);
