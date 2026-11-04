#!/usr/bin/env node
/**
 * MiraVerse v1.2 — Cross-Platform Knowledge & Quest Enrichment Compiler (`tools/v12/compiler/compile-v12.mjs`)
 * Owner: CX02 (Wave W2)
 * Compiles staged canonical knowledge records (LB, IQ, EG, FR, KR) and 25 enriched quest acts (100 age variations)
 * into:
 *   1. Roblox Luau module (`apps/roblox/src/shared/KnowledgeV12.luau`)
 *   2. Minecraft Bedrock TypeScript/JSON module (`apps/minecraft/scripts/generated/knowledgeV12.ts`)
 * Never overwrites existing `Packs.luau` or `packs.ts`.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const countries = ['LB', 'IQ', 'EG', 'FR', 'KR'];

const recordsByCountry = {};
for (const c of countries) {
  const p = path.join(root, `content/v12/staging/countries/${c}/records.json`);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  recordsByCountry[c] = data.records;
}

const questActsData = JSON.parse(fs.readFileSync(path.join(root, 'content/v12/quest-enrichment/quest-acts-v12.json'), 'utf8'));

function luauQuote(str) {
  return '"' + String(str).replace(/["\\\u0000-\u001f\u007f]/g, (ch) => {
    if (ch === '"') return '\\"';
    if (ch === '\\') return '\\\\';
    return '\\' + ch.charCodeAt(0).toString(10).padStart(3, '0');
  }) + '"';
}

function toLuau(val, depth = 0) {
  if (val === null || val === undefined) return 'nil';
  if (typeof val === 'string') return luauQuote(val);
  if (typeof val === 'boolean' || typeof val === 'number') return String(val);
  const pad = '  '.repeat(depth);
  if (Array.isArray(val)) {
    if (val.length === 0) return '{}';
    return '{\n' + val.map((v) => `${pad}  ${toLuau(v, depth + 1)},`).join('\n') + `\n${pad}}`;
  }
  const entries = Object.entries(val).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  if (entries.length === 0) return '{}';
  return '{\n' + entries.map(([k, v]) => `${pad}  [${luauQuote(k)}] = ${toLuau(v, depth + 1)},`).join('\n') + `\n${pad}}`;
}

const robloxPayload = {
  version: '1.2.0',
  crossPlatformSyncPromised: false,
  serverAuthoritativeRewards: true,
  countrySequence: countries,
  knowledgeByCountry: Object.fromEntries(
    countries.map((c) => [
      c,
      recordsByCountry[c].map((r) => ({
        id: r.id,
        country: r.country,
        titleEn: r.title.en,
        entityType: r.entity_type,
        knowledgeClass: r.knowledge_class,
        claimStatus: r.claim_status,
        confidence: r.confidence,
        summary: r.summary,
        ageExplanations: r.age_tier_explanations,
        questLinks: r.quest_links,
      })),
    ])
  ),
  questActs: questActsData.acts.map((a) => ({
    actId: a.act_id,
    country: a.country,
    actNumber: a.act_number,
    titleEn: a.title.en,
    mentorId: a.mentor_id,
    enrichmentHook: a.enrichment_hook,
    paidRewardRequired: a.paid_reward_required,
    variations: a.variations,
  })),
};

const luauOut = '-- GENERATED FILE (MiraVerse v1.2 CX02) - DO NOT EDIT\nreturn ' + toLuau(robloxPayload) + '\n';
const luauPath = path.join(root, 'apps/roblox/src/shared/KnowledgeV12.luau');
fs.mkdirSync(path.dirname(luauPath), { recursive: true });
fs.writeFileSync(luauPath, luauOut, 'utf8');

const mcOut = `// GENERATED FILE (MiraVerse v1.2 CX02) - DO NOT EDIT
export const KNOWLEDGE_V12_VERSION = '1.2.0';
export const KNOWLEDGE_V12_RECORDS = ${JSON.stringify(recordsByCountry, null, 2)} as const;
export const QUEST_ACTS_V12 = ${JSON.stringify(questActsData.acts, null, 2)} as const;
`;
const mcPath = path.join(root, 'apps/minecraft/scripts/generated/knowledgeV12.ts');
fs.mkdirSync(path.dirname(mcPath), { recursive: true });
fs.writeFileSync(mcPath, mcOut, 'utf8');

const geo = JSON.parse(fs.readFileSync(path.join(root, 'content/v12/geo/atlas-v12-geodata.json'), 'utf8'));
const webOut = {
  version: '1.2.0',
  records: Object.values(recordsByCountry).flat(),
  quest_acts: questActsData.acts,
  real_world_places: geo.real_world_places,
  in_game_quest_markers: geo.in_game_quest_markers,
};
const webPath = path.join(root, 'apps/web/src/generated/knowledgeV12.json');
fs.mkdirSync(path.dirname(webPath), { recursive: true });
fs.writeFileSync(webPath, JSON.stringify(webOut, null, 2) + '\n', 'utf8');

console.log('CX02 compiled v1.2 knowledge base (25 records, 25 acts, 100 age variations) to Roblox Luau and Minecraft Bedrock TS.');
