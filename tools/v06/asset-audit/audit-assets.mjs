#!/usr/bin/env node
/**
 * MiraVerse v0.7 (Option A) — Geometry, Rig, Animation & Avatar Marketplace Candidate Auditor (`DX04`)
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const colPath = path.join(root, 'art/v06/characters/avatar-marketplace/collection-manifest.json');
const col = JSON.parse(fs.readFileSync(colPath, 'utf-8'));

for (const item of col.avatarMarketplaceCollection) {
  if (item.triangleCount > 4000) {
    console.error('Triangle budget exceeded for', item.itemId);
    process.exit(1);
  }
  if (!item.humanApprovalRequiredToPublish) {
    console.error('Missing human approval gate on', item.itemId);
    process.exit(1);
  }
}

console.log(JSON.stringify({ status: 'PASS', auditedItems: col.avatarMarketplaceCollection.length }));
