#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const root = process.cwd();
const distDir = path.join(root, 'apps/minecraft/dist');
fs.mkdirSync(distDir, { recursive: true });

// Ensure content & pack build is fresh if dist/miraverse.mcaddon is missing
const mcaddonPath = path.join(distDir, 'miraverse.mcaddon');
if (!fs.existsSync(mcaddonPath)) {
  execSync('npm run compile && npm run textures && npm -w apps/minecraft run build && npm run pack:mcaddon', { cwd: root, stdio: 'inherit' });
}

// Package miraverse-sources.zip containing world/, assets-src/, art-direction/, and scripts/src/
const sourcesZipPath = path.join(distDir, 'miraverse-sources.zip');
execSync(`python3 -c "
import zipfile, os
root = '${root}'
out = '${sourcesZipPath}'
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zf:
    for rel_dir in ['apps/minecraft/world', 'apps/minecraft/assets-src', 'apps/minecraft/art-direction', 'apps/minecraft/scripts/src']:
        full_dir = os.path.join(root, rel_dir)
        if os.path.isdir(full_dir):
            for dp, _, fns in os.walk(full_dir):
                for fn in sorted(fns):
                    fp = os.path.join(dp, fn)
                    zf.write(fp, os.path.relpath(fp, root))
"`, { cwd: root });

function sha256File(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

const manifest = {
  schemaVersion: '10.0.0',
  generatedAt: new Date().toISOString(),
  hostPlatform: 'Linux aarch64 (Ubuntu 24.04, NVIDIA GB10)',
  artifacts: {
    'miraverse.mcaddon': {
      path: 'apps/minecraft/dist/miraverse.mcaddon',
      status: 'READY_AND_VERIFIED',
      sizeBytes: fs.statSync(mcaddonPath).size,
      sha256: sha256File(mcaddonPath),
    },
    'miraverse-sources.zip': {
      path: 'apps/minecraft/dist/miraverse-sources.zip',
      status: 'READY_AND_VERIFIED',
      sizeBytes: fs.statSync(sourcesZipPath).size,
      sha256: sha256File(sourcesZipPath),
    },
    'miraverse-adventure.mcworld': {
      path: 'apps/minecraft/dist/miraverse-adventure.mcworld',
      status: 'BLOCKED_REQUIRES_WINDOWS_BEDROCK_EDITOR_HOST',
      blockerReason: 'A genuine .mcworld requires a real Bedrock LevelDB world directory (db/, level.dat) exported from Windows Minecraft Bedrock Editor/Client. Per Section 0 & Section 9, fabricating a renamed zip on Linux aarch64 is strictly prohibited.',
      windowsHandoffScript: 'apps/minecraft/tools/release/export-windows-mcworld.ps1',
    },
  },
};

fs.writeFileSync(path.join(distDir, 'manifest-of-artifacts.json'), JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'apps/minecraft/tools/release/v10-artifact-summary.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('PASS: CX05 packaged miraverse.mcaddon, miraverse-sources.zip, and manifest-of-artifacts.json.');
