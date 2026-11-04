#!/usr/bin/env node
/**
 * MiraVerse v1.0 Minecraft Bedrock — Worktree & Manifest Ownership Verifier
 * (`apps/minecraft/tools/integration/verify-ownership.mjs`)
 * Owner: CX01 (Wave W0)
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'swarm/minecraft-v10/manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('Missing swarm/minecraft-v10/manifest.json');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const agents = manifest.agents || [];
const counts = {
  total: agents.length,
  antigravity: agents.filter((a) => a.backend === 'antigravity').length,
  dgx: agents.filter((a) => a.backend === 'dgx').length,
  claude: agents.filter((a) => a.backend === 'claude').length,
  codex: agents.filter((a) => a.backend === 'codex').length,
};

if (counts.total !== 50 || counts.antigravity !== 20 || counts.dgx !== 20 || counts.claude !== 5 || counts.codex !== 5) {
  console.error('Invalid agent counts:', counts);
  process.exit(1);
}

// Verify exclusive primary owned_paths across all 50 agents
const seenPaths = new Map();
for (const a of agents) {
  if (!Array.isArray(a.owned_paths) || a.owned_paths.length === 0) {
    console.error(`Agent ${a.id} has no owned_paths`);
    process.exit(1);
  }
  for (const p of a.owned_paths) {
    if (seenPaths.has(p)) {
      console.error(`Ownership collision on ${p} between ${seenPaths.get(p)} and ${a.id}`);
      process.exit(1);
    }
    seenPaths.set(p, a.id);
  }
}

console.log(JSON.stringify({ ok: true, counts, uniqueOwnedRoots: seenPaths.size }));
