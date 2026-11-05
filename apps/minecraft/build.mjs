import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(__dirname, 'bp/scripts/main.js');
fs.mkdirSync(path.dirname(outFile), { recursive: true });

const phoeniciaEnabled = process.env.MV_PHOENICIA === '1';

// With the flag off, the Phoenicia entry resolves to empty stubs, so none of its code ships.
const phoeniciaFlagPlugin = {
  name: 'phoenicia-flag',
  setup(build) {
    if (phoeniciaEnabled) return;
    build.onResolve({ filter: /phoenicia\/bedrock\.js$/ }, () => ({
      path: path.join(__dirname, 'scripts/src/phoenicia/disabled.ts'),
    }));
  },
};

await esbuild.build({
  entryPoints: [path.join(__dirname, 'scripts/main.ts')],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  external: ['@minecraft/server', '@minecraft/server-ui'],
  // Phoenicia stays out of default builds. Set MV_PHOENICIA=1 for a staging build.
  define: { __MV_PHOENICIA__: phoeniciaEnabled ? 'true' : 'false' },
  plugins: [phoeniciaFlagPlugin],
  outfile: outFile,
});
