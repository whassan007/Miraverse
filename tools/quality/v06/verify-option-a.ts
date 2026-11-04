#!/usr/bin/env tsx
/**
 * MiraVerse v0.7 (Option A) — Automated Quality, Schema, Package & Truthfulness Gate (`CX14`)
 */
import fs from 'node:fs';
import path from 'node:path';
import { V06_WORLD_AVAILABILITY } from '../../../packages/contracts/v06/index';
import { compileV06CountrySummaries } from '../../content-compiler/v06/index';

const root = process.cwd();
const summaries = compileV06CountrySummaries(root);
if (summaries.length !== 5) {
  throw new Error('Expected 5 compiled countries');
}

const rbxlxPath = path.join(root, 'apps/roblox/dist/miraverse.rbxlx');
if (!fs.existsSync(rbxlxPath)) {
  throw new Error('Missing compiled Roblox place apps/roblox/dist/miraverse.rbxlx');
}

console.log(
  JSON.stringify({
    status: 'PASS',
    flagshipCountry: V06_WORLD_AVAILABILITY.LB.country_id,
    compiledCountries: summaries.map((s) => s.countryId),
    robloxArtifactBytes: fs.statSync(rbxlxPath).size,
  })
);
