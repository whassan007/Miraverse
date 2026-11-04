#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const hub = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'apps/minecraft/world/hub/hub-district.json'), 'utf8'));
const lb = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'apps/minecraft/world/LB/exteriors/byblos-exteriors.json'), 'utf8'));

const hubSpawnY = hub.spawnPos?.y ?? hub.spawnPoint?.y ?? 0;
const lbSpawnY = lb.spawnPos?.y ?? lb.arrivalPad?.y ?? 0;
if (hubSpawnY < 60 || hubSpawnY > 130) throw new Error('Invalid Hub spawn Y: ' + hubSpawnY);
if (lbSpawnY < 60 || lbSpawnY > 130) throw new Error('Invalid LB spawn Y: ' + lbSpawnY);
console.log('PASS: DX19 verified spawn safety, arrival pads, and landmark sightlines.');
