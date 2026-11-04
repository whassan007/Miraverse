import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(__dirname, 'bp/scripts/main.js');
fs.mkdirSync(path.dirname(outFile), { recursive: true });

await esbuild.build({
  entryPoints: [path.join(__dirname, 'scripts/main.ts')],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  external: ['@minecraft/server', '@minecraft/server-ui'],
  outfile: outFile,
});
