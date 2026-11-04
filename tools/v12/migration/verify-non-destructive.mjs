#!/usr/bin/env node
/**
 * Verifies that zero preexisting pack, quest, dialogue, or story files were destructively modified.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const snap = JSON.parse(fs.readFileSync(path.join(root, 'tools/v12/migration/baseline-snapshot.json'), 'utf8'));

let failures = 0;
for (const [rel, meta] of Object.entries(snap.preserved_files)) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.error('MISSING PRESERVED FILE:', rel);
    failures++;
    continue;
  }
  const currentSha = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
  if (currentSha !== meta.sha256) {
    console.error('DESTRUCTIVE MODIFICATION DETECTED:', rel, 'expected', meta.sha256, 'got', currentSha);
    failures++;
  }
}

if (failures > 0) {
  process.exit(1);
}
console.log('CX01 non-destructive integrity check PASSED across all', Object.keys(snap.preserved_files).length, 'canonical baseline files.');
