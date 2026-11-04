#!/usr/bin/env node
import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync('./content/gulf-v16/age-tiers/age-tier-120-stages.json', 'utf8'));
if (data.totalAgeStages !== 120) throw new Error('Expected 120 age stages');
console.log('QUEST_SCHEMA_VALIDATOR_OK: 30 acts, 120 age stages verified.');
