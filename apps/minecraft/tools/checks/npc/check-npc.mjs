#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'apps/minecraft/assets-src/mentors/rig/miraverse_npc_base.bbmodel'), 'utf8'));
const spec = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'apps/minecraft/assets-src/mentors/rig/rig-spec.json'), 'utf8'));
const lb = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'apps/minecraft/assets-src/mentors/LB/mentor_lb.bbmodel'), 'utf8'));

if (!rig.outliner || rig.outliner.length === 0) throw new Error('Rig missing outliner bones');
const states = spec.states || [];
for (const req of ['idle', 'walk', 'greeting', 'celebrate']) {
  if (!states.includes(req)) throw new Error('Missing animation state: ' + req);
}
if (!lb.name) throw new Error('Missing LB mentor bbmodel name');
console.log(`PASS: DX10 verified Blockbench rigs and ${states.length} animation states.`);
