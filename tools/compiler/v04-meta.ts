/**
 * MiraVerse v0.4 Shared Content Hash & Cross-Platform Quest Bundle Compiler
 * (`tools/compiler/v04-meta.ts`)
 * Owner: CX10
 * Emits deterministic v0.4 quest/level bundles with sourceContentHash, compilerVersion,
 * and schemaVersion for Babylon Web, Roblox Luau, and Minecraft Bedrock.
 */
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pack } from '../../packages/content/schema.js';
import { migratePackToQuestSpec } from '../../packages/content/migrations/index.js';
import { writeAtomic } from './web.js';

const rootDir = fileURLToPath(new URL('../../', import.meta.url));
export const COMPILER_VERSION = '0.4.0';
export const SCHEMA_VERSION = 4;

export async function compileV04Bundles(packs: Pack[]): Promise<{ sourceContentHash: string }> {
  const sortedPacks = [...packs].sort((a, b) => (a.country < b.country ? -1 : 1));
  const canonicalPayload = JSON.stringify(sortedPacks);
  const sourceContentHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex').slice(0, 16);

  const quests = sortedPacks.map((p) => migratePackToQuestSpec(p as any));
  const bundle = {
    schemaVersion: SCHEMA_VERSION,
    compilerVersion: COMPILER_VERSION,
    sourceContentHash,
    quests,
  };

  // 1. Web v0.4 bundle
  const webOut = path.join(rootDir, 'apps/web/src/generated/v04-bundle.json');
  await writeAtomic(webOut, JSON.stringify(bundle, null, 2) + '\n');

  // 2. Roblox Luau v0.4 bundle
  const robloxOut = path.join(rootDir, 'apps/roblox/src/shared/V04Bundle.luau');
  const luauQuests = quests
    .map(
      (q) =>
        `    ["${q.country}"] = { questId = "${q.questId}", mentorId = "${q.mentorId}", mentorName = "${q.mentorName}", objectiveIds = { ${q.objectives.map((o) => `"${o.objectiveId}"`).join(', ')} } }`
    )
    .join(',\n');
  const luauContent = [
    '-- GENERATED FILE - DO NOT EDIT',
    'return {',
    `  schemaVersion = ${SCHEMA_VERSION},`,
    `  compilerVersion = "${COMPILER_VERSION}",`,
    `  sourceContentHash = "${sourceContentHash}",`,
    '  quests = {',
    luauQuests,
    '  },',
    '}',
    '',
  ].join('\n');
  await writeAtomic(robloxOut, luauContent);

  // 3. Minecraft Bedrock TS v0.4 bundle
  const mcOut = path.join(rootDir, 'apps/minecraft/scripts/generated/v04-bundle.ts');
  const mcContent = [
    '// GENERATED FILE - DO NOT EDIT',
    `export const V04_SCHEMA_VERSION = ${SCHEMA_VERSION} as const;`,
    `export const V04_COMPILER_VERSION = "${COMPILER_VERSION}" as const;`,
    `export const V04_SOURCE_CONTENT_HASH = "${sourceContentHash}" as const;`,
    `export const V04_QUESTS = ${JSON.stringify(quests, null, 2)} as const;`,
    '',
  ].join('\n');
  await writeAtomic(mcOut, mcContent);

  return { sourceContentHash };
}
