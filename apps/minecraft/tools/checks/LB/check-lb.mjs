#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ext = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'apps/minecraft/world/LB/exteriors/byblos-exteriors.json'), 'utf8'));
const int = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'apps/minecraft/world/LB/interiors/byblos-interiors.json'), 'utf8'));

const buildings = ext.exteriors || ext.buildings || [];
const stages = ext.restorationStages || ext.landmarkRestoration?.stages || [];
const interiors = int.interiors || [];
const anchors = int.anchors || int.questAnchors || [];
const npcs = int.npcs || [];

if (buildings.length < 5) throw new Error('Expected >= 5 Byblos exterior buildings');
if (stages.length !== 3) throw new Error('Expected 3 restoration stages');
if (interiors.length < 3) throw new Error('Expected >= 3 furnished Byblos interiors');
if (anchors.length < 11) throw new Error('Expected >= 11 Byblos quest anchors');
if (npcs.length < 4) throw new Error('Expected >= 4 Byblos NPCs');
console.log(`PASS: DX04 verified Lebanon Byblos exteriors (${buildings.length}), interiors (${interiors.length}), anchors (${anchors.length}), and restoration (${stages.length} stages).`);
