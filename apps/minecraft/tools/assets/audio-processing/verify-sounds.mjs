#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const def = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'apps/minecraft/tools/assets/audio-processing/sound_definitions.v10.json'), 'utf8'));
const keys = Object.keys(def.sound_definitions || {});
if (keys.length < 7) throw new Error('Expected >= 7 Bedrock sound definitions');
console.log('PASS: DX18 verified ' + keys.length + ' Bedrock sound definitions.');
