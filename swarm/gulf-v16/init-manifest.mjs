#!/usr/bin/env node
/**
 * MiraVerse v1.6 — Arabian Peninsula and Gulf Diaspora Expansion
 * 50-Agent Control Plane Initializer (`swarm/gulf-v16/init-manifest.mjs`)
 *
 * Allocates the exact 50-agent roster:
 * - 20 Gemini / Antigravity workers (`GM01`–`GM20`)
 * - 20 DGX Spark local LLM workers (`DX01`–`DX20`)
 * - 5 Claude reviewers/owners (`CL01`–`CL05`)
 * - 5 Codex implementation owners (`CX01`–`CX05`)
 *
 * Enforces strict non-overlapping file ownership (`ownership.json`), wave execution DAG (`dag.json`),
 * and full swarm ledger (`manifest.json`).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const SWARM_DIR = path.join(ROOT, 'swarm/gulf-v16');
const LOGS_DIR = path.join(SWARM_DIR, 'logs');
const AGENTS_REPORT_DIR = path.join(ROOT, 'reports/gulf-v16/agents');

fs.mkdirSync(SWARM_DIR, { recursive: true });
fs.mkdirSync(LOGS_DIR, { recursive: true });
fs.mkdirSync(AGENTS_REPORT_DIR, { recursive: true });

const baseSha = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();

export const ROSTER = [
  // =========================================================================
  // 20 Gemini / Antigravity workers (GM01–GM20)
  // =========================================================================
  {
    id: 'GM01',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W1',
    title: 'Gulf Art Director: shared game-visual system, environment art bible, reference validity, art approval gates',
    depends_on: ['CL01', 'CL04'],
    owned_paths: ['art/gulf-v16/direction/', 'apps/web/public/art/gulf-v16/direction/'],
  },
  {
    id: 'GM02',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W1',
    title: 'Regional Atlas Creative Lead: illustrated Gulf portal, geographic vs fantasy distinctions, atlas layouts',
    depends_on: ['GM01', 'CL01'],
    owned_paths: ['art/gulf-v16/atlas/', 'apps/web/public/art/gulf-v16/atlas/'],
  },
  {
    id: 'GM03',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W1',
    title: 'Qatar Environment: Doha coastal heritage & Al Zubarah-inspired learning area, original approved key art, 5 visual scene briefs',
    depends_on: ['GM01', 'DX03'],
    owned_paths: ['art/gulf-v16/countries/QA/environment/', 'apps/web/public/art/gulf-v16/countries/QA/environment/'],
  },
  {
    id: 'GM04',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W1',
    title: 'Qatar Quests: 5-act scripts, NPC visual sheets, age-tailored storyboard, map',
    depends_on: ['GM01', 'GM03', 'DX03'],
    owned_paths: ['content/gulf-v16/quests/QA/', 'art/gulf-v16/countries/QA/quests/'],
  },
  {
    id: 'GM05',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W2',
    title: 'UAE Environment: coastal quarter and Al Ain-type oasis, verified reference art, 5 scenes',
    depends_on: ['GM01', 'DX04'],
    owned_paths: ['art/gulf-v16/countries/AE/environment/', 'apps/web/public/art/gulf-v16/countries/AE/environment/'],
  },
  {
    id: 'GM06',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W2',
    title: 'UAE Quests: 5 acts, wind-tower/oasis engineering storyboards and objects',
    depends_on: ['GM01', 'GM05', 'DX04'],
    owned_paths: ['content/gulf-v16/quests/AE/', 'art/gulf-v16/countries/AE/quests/'],
  },
  {
    id: 'GM07',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W3',
    title: 'Kuwait Environment: old Kuwait City maritime quarter, trading alleys & dhows, original art, historically scoped props',
    depends_on: ['GM01', 'DX05'],
    owned_paths: ['art/gulf-v16/countries/KW/environment/', 'apps/web/public/art/gulf-v16/countries/KW/environment/'],
  },
  {
    id: 'GM08',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W3',
    title: 'Kuwait Quests: 5 acts, optional gentle Bu Darya interpretation for ages 5–10, accessibility',
    depends_on: ['GM01', 'GM07', 'DX05'],
    owned_paths: ['content/gulf-v16/quests/KW/', 'art/gulf-v16/countries/KW/quests/'],
  },
  {
    id: 'GM09',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W3',
    title: 'Saudi Environment: regionally scoped Najd/interior caravan and poetry courtyard art, no generic conflation',
    depends_on: ['GM01', 'DX06'],
    owned_paths: ['art/gulf-v16/countries/SA/environment/', 'apps/web/public/art/gulf-v16/countries/SA/environment/'],
  },
  {
    id: 'GM10',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W3',
    title: 'Saudi Quests: 5 acts based on reviewed Antarah literary frame, story/dialogue without combat or reenacted slavery',
    depends_on: ['GM01', 'GM09', 'DX06'],
    owned_paths: ['content/gulf-v16/quests/SA/', 'art/gulf-v16/countries/SA/quests/'],
  },
  {
    id: 'GM11',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W4',
    title: 'Oman Environment: UNESCO aflaj landscape, mountain oasis, frankincense route art',
    depends_on: ['GM01', 'DX07'],
    owned_paths: ['art/gulf-v16/countries/OM/environment/', 'apps/web/public/art/gulf-v16/countries/OM/environment/'],
  },
  {
    id: 'GM12',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W4',
    title: 'Oman Quests: 5 acts, functional irrigation/block interactions, storyboard',
    depends_on: ['GM01', 'GM11', 'DX07'],
    owned_paths: ['content/gulf-v16/quests/OM/', 'art/gulf-v16/countries/OM/quests/'],
  },
  {
    id: 'GM13',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W4',
    title: 'Bahrain Environment: separate UNESCO Qal\'at al-Bahrain Dilmun archaeology and later Muharraq pearling district',
    depends_on: ['GM01', 'DX08'],
    owned_paths: ['art/gulf-v16/countries/BH/environment/', 'apps/web/public/art/gulf-v16/countries/BH/environment/'],
  },
  {
    id: 'GM14',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W4',
    title: 'Bahrain Quests: 5 acts, artifact stratigraphy, evidence-versus-myth UI',
    depends_on: ['GM01', 'GM13', 'DX08'],
    owned_paths: ['content/gulf-v16/quests/BH/', 'art/gulf-v16/countries/BH/quests/'],
  },
  {
    id: 'GM15',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W1',
    title: 'Cross-Country NPC Character Lead: 6 fictional Gulf mentors, safe/consistent character silhouettes, expressions',
    depends_on: ['GM01'],
    owned_paths: ['art/gulf-v16/mentors/', 'apps/web/public/art/gulf-v16/mentors/'],
  },
  {
    id: 'GM16',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W1',
    title: 'Gulf Quest Map Illustrator: 30 quest maps with navigable markers and accessible legend',
    depends_on: ['GM01', 'GM02'],
    owned_paths: ['art/gulf-v16/quest-maps/', 'apps/web/public/art/gulf-v16/quest-maps/'],
  },
  {
    id: 'GM17',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W1',
    title: 'Gulf Collectible/Passport Illustrator: 6 stamps, 48+ artifact illustrations, rights manifest',
    depends_on: ['GM01'],
    owned_paths: ['art/gulf-v16/artifacts/', 'art/gulf-v16/stamps/', 'apps/web/public/art/gulf-v16/artifacts/', 'apps/web/public/art/gulf-v16/stamps/'],
  },
  {
    id: 'GM18',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W1',
    title: 'Localization UX Design: RTL Arabic and LTR Arabizi/English interactions, عالم يرا / Mira\'s World branding, mobile/gamepad readability',
    depends_on: ['CL04'],
    owned_paths: ['apps/web/src/features/gulf-localization-ux/'],
  },
  {
    id: 'GM19',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W5',
    title: 'Roblox Environment/Animation Art: engine-compatible meshes, textures, rigs and animations for 6 Gulf worlds',
    depends_on: ['GM03', 'GM05', 'GM07', 'GM09', 'GM11', 'GM13'],
    owned_paths: ['apps/roblox/assets/gulf-v16/'],
  },
  {
    id: 'GM20',
    family: 'Gemini',
    backend: 'antigravity',
    resolved_model: 'Gemini 4 Argon',
    wave: 'W5',
    title: 'Minecraft Voxel/Blockbench Art: world block palettes, models, structure assembly guidance, screenshots for 6 Gulf worlds',
    depends_on: ['GM03', 'GM05', 'GM07', 'GM09', 'GM11', 'GM13'],
    owned_paths: ['apps/minecraft/assets-src/gulf-v16/'],
  },

  // =========================================================================
  // 20 DGX Spark local LLM workers (DX01–DX20)
  // =========================================================================
  {
    id: 'DX01',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W0',
    title: 'Repository Inventory: actual implemented country count, current quests, game integrations, dead code',
    depends_on: [],
    owned_paths: ['reports/gulf-v16/inventory/', 'swarm/gulf-v16/dgx/'],
  },
  {
    id: 'DX02',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W0',
    title: 'Source Extractor: parse attached Gulf section into structured candidate claims with traceable offsets',
    depends_on: ['DX01'],
    owned_paths: ['content/gulf-v16/source-registry/', 'content/gulf-v16/provenance/'],
  },
  {
    id: 'DX03',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W1',
    title: 'Qatar Research/Glossary: sources, names, geographic landmarks (Doha, Al Zubarah), Al Fisaikra oral-story variations',
    depends_on: ['DX02', 'CL01'],
    owned_paths: ['content/gulf-v16/countries/QA/'],
  },
  {
    id: 'DX04',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W2',
    title: 'UAE Research/Glossary: architectural, maritime (Dubai/Sharjah/Abu Dhabi) and Al Ain oasis/falaj precision',
    depends_on: ['DX02', 'CL01'],
    owned_paths: ['content/gulf-v16/countries/AE/'],
  },
  {
    id: 'DX05',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W3',
    title: 'Kuwait Research/Glossary: Bu Darya folklore and Kuwait City maritime history provenance',
    depends_on: ['DX02', 'CL01'],
    owned_paths: ['content/gulf-v16/countries/KW/'],
  },
  {
    id: 'DX06',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W3',
    title: 'Saudi Research/Glossary: Antarah ibn Shaddad & Mu\'allaqat literary-historical fact/legend separation',
    depends_on: ['DX02', 'CL01'],
    owned_paths: ['content/gulf-v16/countries/SA/'],
  },
  {
    id: 'DX07',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W4',
    title: 'Oman Research/Glossary: UNESCO aflaj (#1207), frankincense, water-sharing and Solomon/jinn/Ubar folklore',
    depends_on: ['DX02', 'CL01'],
    owned_paths: ['content/gulf-v16/countries/OM/'],
  },
  {
    id: 'DX08',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W4',
    title: 'Bahrain Research/Glossary: UNESCO Qal\'at al-Bahrain (#1192) Dilmun archaeology vs Muharraq pearling, time periods',
    depends_on: ['DX02', 'CL01'],
    owned_paths: ['content/gulf-v16/countries/BH/'],
  },
  {
    id: 'DX09',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W1',
    title: 'Modern Standard Arabic Dataset: educational Arabic for six countries, sources, translation memory',
    depends_on: ['DX02', 'CL04'],
    owned_paths: ['content/gulf-v16/locales/msa/'],
  },
  {
    id: 'DX10',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W1',
    title: 'Gulf Dialects Dataset: six reviewer-ready dialogue vocabularies (ar-QA, ar-AE, ar-KW, ar-SA, ar-OM, ar-BH), register and orthography notes',
    depends_on: ['DX09', 'CL04'],
    owned_paths: ['content/gulf-v16/locales/dialects/'],
  },
  {
    id: 'DX11',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W1',
    title: 'Arabizi Transliteration: Arabic↔Latin display mapping and child-friendly pronunciation (phonetic 5–7 vs optional 3/7/5 in 11–17)',
    depends_on: ['DX10', 'CL04'],
    owned_paths: ['content/gulf-v16/locales/arabizi/'],
  },
  {
    id: 'DX12',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W1',
    title: 'Four Age-Tier Conversion: step validation, reading time, scaffolding, harm minimization for 30 acts (120 stage specs)',
    depends_on: ['CL01', 'DX03'],
    owned_paths: ['content/gulf-v16/age-tiers/'],
  },
  {
    id: 'DX13',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W1',
    title: 'Quest Schema Validator: IDs, prerequisites, item types, reward idempotency and state graph',
    depends_on: ['DX12', 'CL01'],
    owned_paths: ['tools/gulf-v16/quest-validator/'],
  },
  {
    id: 'DX14',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W5',
    title: 'Real Geography QA: site metadata, WGS84 coordinate precision, attribution, temporal/geographic notes',
    depends_on: ['DX03', 'DX04', 'DX05', 'DX06', 'DX07', 'DX08'],
    owned_paths: ['content/gulf-v16/geo-qa/'],
  },
  {
    id: 'DX15',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W1',
    title: 'Visual Asset Pipeline: image compression, variants, sprite manifest, alpha/rights checks',
    depends_on: ['GM01', 'GM15', 'GM16', 'GM17'],
    owned_paths: ['tools/gulf-v16/asset-pipeline/'],
  },
  {
    id: 'DX16',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W1',
    title: 'Roblox Content Build QA: source-data-to-Luau consistency, ar-001 localization tables, toolchain lint',
    depends_on: ['CX03'],
    owned_paths: ['tools/gulf-v16/roblox-qa/'],
  },
  {
    id: 'DX17',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W1',
    title: 'Bedrock Content Build QA: .lang, packs, scripts, Blockbench structures, module compatibility',
    depends_on: ['CX04'],
    owned_paths: ['tools/gulf-v16/bedrock-qa/'],
  },
  {
    id: 'DX18',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W1',
    title: 'Localization Automated QA: Arabic shaping fixtures, Unicode normalization, bidi punctuation, truncation, script toggles',
    depends_on: ['DX09', 'DX10', 'DX11', 'GM18'],
    owned_paths: ['tools/gulf-v16/localization-qa/'],
  },
  {
    id: 'DX19',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W5',
    title: 'Playwright/Screenshot Comparison: 6 country flows x 3 script modes x viewport matrix; no placeholding',
    depends_on: ['CX01', 'CX02'],
    owned_paths: ['tests/web/e2e/gulf-v16/', 'reports/gulf-v16/screens/'],
  },
  {
    id: 'DX20',
    family: 'DGX Spark',
    backend: 'dgx',
    resolved_model: 'qwen/qwen3-coder-next',
    wave: 'W5',
    title: 'Evidence/Release Manifest: checksums, build IDs, source licensing, platform verification matrix',
    depends_on: ['DX14', 'DX19', 'GM19', 'GM20'],
    owned_paths: ['reports/gulf-v16/manifest/'],
  },

  // =========================================================================
  // 5 Claude reviewers/owners (CL01–CL05)
  // =========================================================================
  {
    id: 'CL01',
    family: 'Claude',
    backend: 'claude',
    resolved_model: 'Claude Sonnet 4.6',
    wave: 'W0',
    title: 'Shared Architecture: review existing integration contracts; no duplicate websites/game engines, v1.6 schema design',
    depends_on: ['DX01'],
    owned_paths: ['packages/contracts/v16/'],
  },
  {
    id: 'CL02',
    family: 'Claude',
    backend: 'claude',
    resolved_model: 'Claude Sonnet 4.6',
    wave: 'W5',
    title: 'Gulf Cultural/Historical Review: test factual claims and cultural variation; identify human review gates',
    depends_on: ['DX03', 'DX04', 'DX05', 'DX06', 'DX07', 'DX08'],
    owned_paths: ['reports/gulf-v16/cultural-review/'],
  },
  {
    id: 'CL03',
    family: 'Claude',
    backend: 'claude',
    resolved_model: 'Claude Sonnet 4.6',
    wave: 'W5',
    title: 'Pedagogy and Child Safety: ages 5–17, optional religion/folklore, sensible story safety, accessibility',
    depends_on: ['DX12', 'GM04', 'GM06', 'GM08', 'GM10', 'GM12', 'GM14'],
    owned_paths: ['reports/gulf-v16/pedagogy-safety/'],
  },
  {
    id: 'CL04',
    family: 'Claude',
    backend: 'claude',
    resolved_model: 'Claude Sonnet 4.6',
    wave: 'W0',
    title: 'Arabic/Arabizi Language Design: platform capability matrix, reviewer workflow, fallback semantic integrity',
    depends_on: ['CL01'],
    owned_paths: ['content/gulf-v16/language-architecture/', 'reports/gulf-v16/bedrock-language-test-report.md'],
  },
  {
    id: 'CL05',
    family: 'Claude',
    backend: 'claude',
    resolved_model: 'Claude Sonnet 4.6',
    wave: 'W5',
    title: 'Independent Release Audit: challenge all unsupported claims, require native gameplay/screenshots, sign off SHIP/SHIP-WITH-LIMITATIONS/NO-GO',
    depends_on: ['CL02', 'CL03', 'DX19', 'DX20', 'CX05'],
    owned_paths: ['reports/gulf-v16/independent-audit/'],
  },

  // =========================================================================
  // 5 Codex implementation owners (CX01–CX05)
  // =========================================================================
  {
    id: 'CX01',
    family: 'Codex',
    backend: 'codex',
    resolved_model: 'gpt-6-astra',
    wave: 'W0',
    title: 'Website/Atlas Integrator: routes, 6 interactive pages, art assets, map coordinates versus quest map, LTR/RTL & Arabizi',
    depends_on: ['CL01', 'CL04'],
    owned_paths: ['apps/web/src/features/gulf-atlas-v16/'],
  },
  {
    id: 'CX02',
    family: 'Codex',
    backend: 'codex',
    resolved_model: 'gpt-6-astra',
    wave: 'W1',
    title: 'Shared Data, Localization, Passport Integrator: stable schema, content/build exports, preferences, validation',
    depends_on: ['CL01', 'CL04', 'DX03', 'DX09', 'DX10', 'DX11', 'DX12'],
    owned_paths: ['packages/content/gulf-v16/', 'apps/web/src/generated/gulfV16.json'],
  },
  {
    id: 'CX03',
    family: 'Codex',
    backend: 'codex',
    resolved_model: 'gpt-6-astra',
    wave: 'W0',
    title: 'Roblox Game Integrator: Luau mechanics, content imports, ar-001 localization integration, savegame and co-op tests',
    depends_on: ['CL01', 'CL04'],
    owned_paths: ['apps/roblox/src/shared/GulfV16.luau', 'apps/roblox/src/server/GulfWorldsV16.luau', 'apps/roblox/localization/gulf-v16/'],
  },
  {
    id: 'CX04',
    family: 'Codex',
    backend: 'codex',
    resolved_model: 'gpt-6-astra',
    wave: 'W0',
    title: 'Bedrock Game Integrator: behavior/resource packs, actual placed worlds, quests, packaging, language capability test & Arabizi fallback',
    depends_on: ['CL01', 'CL04'],
    owned_paths: ['apps/minecraft/scripts/gulf-v16/', 'apps/minecraft/world/gulf-v16/', 'apps/minecraft/structures/gulf-v16/'],
  },
  {
    id: 'CX05',
    family: 'Codex',
    backend: 'codex',
    resolved_model: 'gpt-6-astra',
    wave: 'W0',
    title: 'Full-stack Verification and Release: CI, staged deployment, screenshot comparisons, real device evidence, parent-regression tests',
    depends_on: ['CL01', 'CX01', 'CX03', 'CX04'],
    owned_paths: ['tools/gulf-v16/release/', 'dist/gulf-v16/', 'tests/gulf-v16/'],
  },
];

// Verify zero ownership collisions across all 50 agents
const ownershipMap = {};
for (const agent of ROSTER) {
  for (const p of agent.owned_paths) {
    if (ownershipMap[p]) {
      throw new Error(`Ownership collision on ${p} between ${ownershipMap[p]} and ${agent.id}`);
    }
    ownershipMap[p] = agent.id;
  }
}

const manifest = {
  version: '1.6.0',
  directive: 'MiraVerse v1.6 — Arabian Peninsula and Gulf Diaspora Expansion (Website + Roblox + Minecraft Bedrock)',
  source_document: 'Mythic Anchors in the Diaspora: How Cultural Quests and Legends Shape Transnational Identity — Section: The Arabian Peninsula and the Gulf: Desert Epics, Pearl Divers, and the Ancient Sea',
  mandatory_countries: ['QA', 'AE', 'KW', 'SA', 'OM'],
  sixth_added_country: 'BH',
  future_unreleased_candidates: ['YE'],
  gulf_country_sequence: ['QA', 'AE', 'KW', 'SA', 'OM', 'BH'],
  stable_country_ids: ['country.qa', 'country.ae', 'country.kw', 'country.sa', 'country.om', 'country.bh'],
  age_tiers: ['5-7', '8-10', '11-13', '14-17'],
  supported_dialects: ['ar-QA', 'ar-AE', 'ar-KW', 'ar-SA', 'ar-OM', 'ar-BH'],
  supported_scripts: ['Arab', 'Latn'],
  integration_branch: 'integration/gulf-v16',
  base_sha: baseSha,
  created_at: new Date().toISOString(),
  counts: {
    total: ROSTER.length,
    gemini: ROSTER.filter((a) => a.family === 'Gemini').length,
    dgx: ROSTER.filter((a) => a.family === 'DGX Spark').length,
    claude: ROSTER.filter((a) => a.family === 'Claude').length,
    codex: ROSTER.filter((a) => a.family === 'Codex').length,
  },
  dgx_concurrency_limit: 1,
  agents: ROSTER.map((a) => ({
    ...a,
    branch: `gulf-v16/${a.id}`,
    worktree: `/home/wael/Code/mv-wt-gulf16/${a.id}`,
    status: 'READY',
    attempts: 0,
    base_sha: baseSha,
    commit_sha: null,
    integration_sha: null,
    runtime_environment: null,
    modified_files: [],
    evidence_paths: [],
    blockers: [],
    log_path: `swarm/gulf-v16/logs/${a.id}.log`,
  })),
};

const dag = {
  version: '1.6.0',
  waves: {
    W0: ['DX01', 'DX02', 'CL01', 'CL04', 'CX01', 'CX03', 'CX04', 'CX05'],
    W1: ['DX03', 'DX09', 'DX10', 'DX11', 'DX12', 'DX13', 'GM01', 'GM02', 'GM03', 'GM04', 'GM15', 'GM16', 'GM17', 'GM18', 'DX15', 'CX02', 'DX16', 'DX17', 'DX18'],
    W2: ['DX04', 'GM05', 'GM06'],
    W3: ['DX05', 'DX06', 'GM07', 'GM08', 'GM09', 'GM10'],
    W4: ['DX07', 'DX08', 'GM11', 'GM12', 'GM13', 'GM14'],
    W5: ['GM19', 'GM20', 'DX14', 'CL02', 'CL03', 'DX19', 'DX20', 'CL05'],
  },
  integration_merges_serialized_by: ['CX01', 'CX02', 'CX03', 'CX04', 'CX05'],
};

const ownership = {
  version: '1.6.0',
  integration_owners: ['CX01', 'CX02', 'CX03', 'CX04', 'CX05'],
  shared_files_serialized_by_cx: [
    'packages/contracts/index.ts',
    'packages/content/schema.ts',
    'packages/shared/stamp.ts',
    'apps/web/src/App.tsx',
    'apps/web/src/i18n/index.ts',
    'apps/web/src/portal/v13/CulturalPortalPages.tsx',
    'apps/web/src/marketing/worlds-v06/ExploreAtlasPages.tsx',
    'apps/web/src/pages/Passport.tsx',
    'apps/web/src/launch/RobloxLaunchPage.tsx',
    'apps/roblox/src/server/MapBuilder.luau',
    'apps/minecraft/scripts/main.ts',
    'apps/minecraft/rp/texts/en_US.lang',
    'apps/minecraft/rp/texts/fr_FR.lang',
  ],
  path_owners: ownershipMap,
};

fs.writeFileSync(path.join(SWARM_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(SWARM_DIR, 'dag.json'), JSON.stringify(dag, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(SWARM_DIR, 'ownership.json'), JSON.stringify(ownership, null, 2) + '\n', 'utf8');

console.log(
  `Initialized Gulf v1.6 manifest: ${manifest.counts.total} agents (${manifest.counts.gemini} GM, ${manifest.counts.dgx} DX, ${manifest.counts.claude} CL, ${manifest.counts.codex} CX), ${Object.keys(ownershipMap).length} exclusive owned paths.`
);
