#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const checks = [
  'content/v12/source-registry/SOURCE_REGISTRY.json',
  'content/v12/staging/provenance/CLAIM_PROVENANCE.jsonl',
  'apps/roblox/src/shared/KnowledgeV12.luau',
  'apps/minecraft/scripts/generated/knowledgeV12.ts',
  'apps/web/src/generated/knowledgeV12.json',
  'tests/v12/suite/v12-enrichment.test.ts',
];

for (const rel of checks) {
  if (!fs.existsSync(path.join(ROOT, rel))) {
    console.error('Missing required v1.2 artifact:', rel);
    process.exit(1);
  }
}
console.log('MiraVerse v1.2 Release Gate: ALL REQUIRED ARTIFACTS PRESENT.');
