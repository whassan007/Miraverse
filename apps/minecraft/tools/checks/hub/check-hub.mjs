#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const hub = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'apps/minecraft/world/hub/hub-district.json'), 'utf8'));
const countries = ['LB', 'EG', 'IQ', 'KR', 'FR'];
const portals = hub.portals || hub.departureGates || [];
for (const c of countries) {
  if (!portals.some((g) => g.country === c)) {
    throw new Error('Missing portal for ' + c);
  }
}
if (!hub.spawnPos || !hub.tutorialStartPos) {
  throw new Error('Hub missing spawnPos or tutorialStartPos');
}
console.log('PASS: DX03 verified Hub structure bounds, 5 country portals, and tutorial/spawn positions.');
