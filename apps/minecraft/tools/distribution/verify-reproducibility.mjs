#!/usr/bin/env node
/**
 * MiraVerse Global v1.1 — Deterministic Packaging & SHA-256 Reproducibility Verifier
 * (`apps/minecraft/tools/distribution/verify-reproducibility.mjs`)
 * Owner: DX20 (Wave W4)
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import { buildGlobalMcaddon } from '../build/build-global-mcaddon.mjs';

export function verifyDeterministicGlobalMcaddon() {
  const run1 = buildGlobalMcaddon();
  const sha1 = crypto.createHash('sha256').update(fs.readFileSync(run1.outPath)).digest('hex');

  const run2 = buildGlobalMcaddon();
  const sha2 = crypto.createHash('sha256').update(fs.readFileSync(run2.outPath)).digest('hex');

  if (sha1 !== sha2) {
    throw new Error(`Non-deterministic miraverse-global.mcaddon build: ${sha1} !== ${sha2}`);
  }

  return {
    ok: true,
    archivePath: run1.outPath,
    sha256: sha1,
    fileCount: run1.fileCount,
    nativeLanguagesCount: run1.nativeLanguages.length,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = verifyDeterministicGlobalMcaddon();
  console.log('DETERMINISTIC_MCADDON_OK', JSON.stringify(res));
}
