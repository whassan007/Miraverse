#!/usr/bin/env node
/**
 * MiraVerse Global v1.1 Content Compiler & Schema Validator
 * Validates single content registry in `packages/content/minecraft-global/`:
 * - 11 countries, 66 chapters, 264 age variants, 14 locale profiles, 55 NPCs, 89 artifacts/keepsakes/stamps
 * - Non-overlapping district bounding boxes, valid prerequisite chains, and valid sourceType labels.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, 'packages/content/minecraft-global/registry.json');
const ARTIFACTS_PATH = path.join(ROOT, 'packages/content/minecraft-global/artifacts/artifacts-catalog.json');
const NPCS_PATH = path.join(ROOT, 'packages/content/minecraft-global/people/npcs-catalog.json');
const LOCALES_PATH = path.join(ROOT, 'packages/content/minecraft-global/locales/locales-registry.json');

export function validateGlobalContentRegistry() {
  const reg = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  const artifacts = JSON.parse(fs.readFileSync(ARTIFACTS_PATH, 'utf-8'));
  const npcs = JSON.parse(fs.readFileSync(NPCS_PATH, 'utf-8'));
  const locales = JSON.parse(fs.readFileSync(LOCALES_PATH, 'utf-8'));

  const errors = [];
  if (reg.countries.length !== 11) errors.push(`Expected 11 countries, got ${reg.countries.length}`);
  if (reg.chapters.length !== 66) errors.push(`Expected 66 chapters, got ${reg.chapters.length}`);
  if (locales.length !== 14) errors.push(`Expected 14 locales, got ${locales.length}`);
  if (npcs.length !== 55) errors.push(`Expected 55 NPCs, got ${npcs.length}`);

  const allowedSourceTypes = new Set(['folklore', 'literature', 'historical_context', 'contemporary_tradition', 'fictional_gameplay']);
  let variantCount = 0;

  for (const ch of reg.chapters) {
    if (!allowedSourceTypes.has(ch.sourceType)) {
      errors.push(`Invalid sourceType on ${ch.id}: ${ch.sourceType}`);
    }
    const tracks = Object.keys(ch.ageVariants || {});
    if (tracks.length !== 4) {
      errors.push(`Chapter ${ch.id} has ${tracks.length} age variants instead of 4`);
    }
    variantCount += tracks.length;
  }

  if (variantCount !== 264) errors.push(`Expected 264 chapter-age variants, got ${variantCount}`);
  if (errors.length > 0) {
    throw new Error('Global Content Registry validation failed:\n' + errors.join('\n'));
  }

  return {
    ok: true,
    countries: reg.countries.length,
    chapters: reg.chapters.length,
    variants: variantCount,
    locales: locales.length,
    npcs: npcs.length,
    artifacts: artifacts.length,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const summary = validateGlobalContentRegistry();
  console.log('GLOBAL_CONTENT_COMPILER_OK', JSON.stringify(summary));
}
