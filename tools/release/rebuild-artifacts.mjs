#!/usr/bin/env node
/**
 * Rebuilds every Roblox and Minecraft build artifact from the current source and
 * refreshes the checksums in apps/minecraft/dist/manifest-of-artifacts.json.
 * Run through `npm run artifacts`.
 */
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
process.chdir(ROOT);

const run = (command) => {
  console.log(`> ${command}`);
  execSync(command, { stdio: 'inherit' });
};

run('npm run -s compile');
run('npm run -s textures');
run('npm run -s build:roblox');
run('npm run -s build:phoenicia:roblox');
run('npm run -s build:phoenicia:minecraft'); // Finishes by rebuilding the default add-on.
run('node apps/minecraft/tools/build/build-global-mcaddon.mjs');

const { buildDeterministicZipSync } = await import(
  path.join(ROOT, 'apps/minecraft/tools/build/build-global-mcaddon.mjs')
);

// The same source set the Minecraft Global release packages.
const SOURCE_DIRS = [
  'apps/minecraft/world',
  'apps/minecraft/assets-src',
  'apps/minecraft/scripts',
  'apps/minecraft/tools',
  'apps/minecraft/editor',
  'packages/content/minecraft-global',
  'packages/content/locales',
  'docs/minecraft-global',
];
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const child = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return walk(child);
    return entry.isFile() ? [child] : [];
  });
buildDeterministicZipSync(
  ROOT,
  SOURCE_DIRS.filter((dir) => fs.existsSync(dir)).flatMap(walk),
  path.join(ROOT, 'apps/minecraft/dist/miraverse-global-sources.zip')
);

const manifestPath = 'apps/minecraft/dist/manifest-of-artifacts.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
for (const [file, entry] of Object.entries(manifest.deliverables)) {
  if (entry.sha256 === undefined || entry.sha256 === null || !fs.existsSync(file)) continue;
  const bytes = fs.readFileSync(file);
  entry.sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  if (entry.bytes !== undefined) entry.bytes = bytes.length;
}
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log('All artifacts rebuilt.');
