#!/usr/bin/env node
/**
 * MiraVerse v1.2 — 50-Agent Control Plane Initializer (`swarm/v12/init-manifest.mjs`)
 * Initializes `swarm/v12/manifest.json` and `swarm/v12/dag.json` with non-overlapping exclusive
 * file ownership across 20 Antigravity (AG01–AG20), 20 DGX Spark (DX01–DX20), 5 Claude (CL01–CL05),
 * and 5 Codex (CX01–CX05) agents.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const SWARM_DIR = path.join(ROOT, 'swarm/v12');
const LOGS_DIR = path.join(SWARM_DIR, 'logs');
fs.mkdirSync(LOGS_DIR, { recursive: true });

const baseSha = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();

const ROSTER = [
  // 20 Antigravity: editorial UX, illustrations, cultural storytelling, world/quest presentation
  { id: 'AG01', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W0', title: 'Country visual knowledge-system art direction', depends_on: [], owned_paths: ['art/v12/direction/'] },
  { id: 'AG02', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W2', title: 'Lebanon storyboards (Byblos harbor, myth vs history, coastal memory)', depends_on: ['AG01', 'CL01', 'DX05'], owned_paths: ['art/v12/countries/LB/storyboards/'] },
  { id: 'AG03', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W2', title: 'Lebanon artifacts/alphabet illustrations (Ahiram sarcophagus, Aleph/Beth/Mem/Resh/Taw)', depends_on: ['AG01', 'DX05'], owned_paths: ['art/v12/countries/LB/artifacts/', 'apps/web/public/art/v12/LB/'] },
  { id: 'AG04', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W3', title: 'Iraq library/translation visual kit (Bayt al-Hikma scholarly tradition, astrolabe, Banu Musa)', depends_on: ['AG01', 'DX06'], owned_paths: ['art/v12/countries/IQ/library/', 'apps/web/public/art/v12/IQ/library/'] },
  { id: 'AG05', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W3', title: 'Iraq bookstreet/diaspora visual kit (Al-Mutanabbi Street, kleicha, plural community memory)', depends_on: ['AG01', 'DX06'], owned_paths: ['art/v12/countries/IQ/bookstreet/', 'apps/web/public/art/v12/IQ/bookstreet/'] },
  { id: 'AG06', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W3', title: 'Egypt lantern craft visual kit (fanous metalwork, colored glass, khayamiya)', depends_on: ['AG01', 'DX07'], owned_paths: ['art/v12/countries/EG/craft/', 'apps/web/public/art/v12/EG/craft/'] },
  { id: 'AG07', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W3', title: 'Egypt festival visual kit (Ramadan neighborhood celebration, musaharati, diaspora heritage)', depends_on: ['AG01', 'DX07'], owned_paths: ['art/v12/countries/EG/festival/', 'apps/web/public/art/v12/EG/festival/'] },
  { id: 'AG08', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W3', title: 'France traboules map/architecture art (Vieux Lyon, Croix-Rousse, Cour des Voraces)', depends_on: ['AG01', 'DX08'], owned_paths: ['art/v12/countries/FR/traboules/', 'apps/web/public/art/v12/FR/traboules/'] },
  { id: 'AG09', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W3', title: 'France silk/kitchen visual kit (canuts jacquard loom, Mères Lyonnaises, Eugénie Brazier)', depends_on: ['AG01', 'DX08'], owned_paths: ['art/v12/countries/FR/kitchen/', 'apps/web/public/art/v12/FR/kitchen/'] },
  { id: 'AG10', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W3', title: 'Korea bibimbap/Obangsaek visual kit (five-color harmony, regional bowls, safe ingredients)', depends_on: ['AG01', 'DX09'], owned_paths: ['art/v12/countries/KR/obangsaek/', 'apps/web/public/art/v12/KR/obangsaek/'] },
  { id: 'AG11', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W3', title: 'Korea hanok/market visual kit (Jeonju Hanok Village, Nambu Market, communal table)', depends_on: ['AG01', 'DX09'], owned_paths: ['art/v12/countries/KR/hanok/', 'apps/web/public/art/v12/KR/hanok/'] },
  { id: 'AG12', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W4', title: 'Website knowledge-card UX (epistemic labels, provenance drawer, age filter)', depends_on: ['CL01', 'CL02', 'AG01'], owned_paths: ['apps/web/src/features/knowledge-cards/'] },
  { id: 'AG13', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W4', title: 'Real-map vs quest-map UX (verified GeoJSON vs in-game map / not to geographic scale)', depends_on: ['CL04', 'DX17'], owned_paths: ['apps/web/src/features/atlas-dual-map/'] },
  { id: 'AG14', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W2', title: 'Age 5–7 narrative presentation (pictorial, low-reading-load, 1–3 min pattern recognition)', depends_on: ['CL03'], owned_paths: ['content/v12/presentations/age-5-7/'] },
  { id: 'AG15', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W2', title: 'Age 8–10 narrative presentation (short dialogue, sorting, guided multi-step craft)', depends_on: ['CL03'], owned_paths: ['content/v12/presentations/age-8-10/'] },
  { id: 'AG16', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W2', title: 'Age 11–13 evidence interactions (evidence comparison, maps, timelines, multiple interpretations)', depends_on: ['CL03'], owned_paths: ['content/v12/presentations/age-11-13/'] },
  { id: 'AG17', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W2', title: 'Age 14–17 source-critical interactions (provenance, contested history, diaspora tradeoffs)', depends_on: ['CL02', 'CL03'], owned_paths: ['content/v12/presentations/age-14-17/'] },
  { id: 'AG18', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W4', title: 'NPC dialogue and mentor visual consistency across 5 countries & 4 age tiers', depends_on: ['CL03', 'CL04'], owned_paths: ['content/v12/npc-enrichment/'] },
  { id: 'AG19', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W4', title: 'Original collectible artifacts and Passport presentation', depends_on: ['AG03', 'AG04', 'AG06', 'AG09', 'AG10'], owned_paths: ['art/v12/passport/', 'apps/web/public/art/v12/passport/'] },
  { id: 'AG20', family: 'Antigravity', backend: 'antigravity', resolved_model: 'Gemini 4 Argon', wave: 'W5', title: 'Independent visual and cultural-appropriateness review', depends_on: ['AG12', 'AG13', 'AG19', 'CX03'], owned_paths: ['reports/v12/visual-review/'] },

  // 20 DGX Spark: local extraction, classification, entity normalization, linguistic QA, deduplication, generated asset processing, consistency checks
  { id: 'DX01', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W0', title: 'Input segmentation and checksum (source registry & passage locators)', depends_on: [], owned_paths: ['content/v12/source-registry/', 'swarm/v12/dgx/'] },
  { id: 'DX02', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W1', title: 'Claim extraction from segmented source passages', depends_on: ['DX01', 'CL01'], owned_paths: ['content/v12/staging/claims/'] },
  { id: 'DX03', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W1', title: 'Entity linking and deduplication against existing v0.8/v1.1 KB', depends_on: ['DX02', 'CL01'], owned_paths: ['content/v12/staging/entity-links/'] },
  { id: 'DX04', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W1', title: 'Source-to-claim provenance indexing (CLAIM_PROVENANCE.jsonl)', depends_on: ['DX02', 'DX03'], owned_paths: ['content/v12/staging/provenance/'] },
  { id: 'DX05', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W1', title: 'Lebanon structured extraction (Byblos, Isis/Osiris, Adonis/Afqa, Ahiram, Phoenician alphabet)', depends_on: ['DX04', 'CL01'], owned_paths: ['content/v12/staging/countries/LB/'] },
  { id: 'DX06', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W1', title: 'Iraq structured extraction (Baghdad, Bayt al-Hikma, scholars, Al-Mutanabbi Street, diaspora)', depends_on: ['DX04', 'CL01'], owned_paths: ['content/v12/staging/countries/IQ/'] },
  { id: 'DX07', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W1', title: 'Egypt structured extraction (fanous origins, metalwork/glass/khayamiya, musaharati, heritage month)', depends_on: ['DX04', 'CL01'], owned_paths: ['content/v12/staging/countries/EG/'] },
  { id: 'DX08', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W1', title: 'France structured extraction (traboules, canuts, Cour des Voraces, Mères Lyonnaises, Eugénie Brazier)', depends_on: ['DX04', 'CL01'], owned_paths: ['content/v12/staging/countries/FR/'] },
  { id: 'DX09', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W1', title: 'Korea structured extraction (bibimbap variants, competing origins, Obangsaek, hanok village)', depends_on: ['DX04', 'CL01'], owned_paths: ['content/v12/staging/countries/KR/'] },
  { id: 'DX10', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W1', title: 'Historical/myth/folklore classification audit across all canonical records', depends_on: ['DX05', 'DX06', 'DX07', 'DX08', 'DX09', 'CL02'], owned_paths: ['content/v12/qa/epistemic-classes/'] },
  { id: 'DX11', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W1', title: 'Contested claim and numerical assertion flags (gold weights, dates, counts, origin anecdotes)', depends_on: ['DX10', 'CL02'], owned_paths: ['content/v12/qa/contested-flags/'] },
  { id: 'DX12', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W2', title: 'Named-entity spelling, transliteration, and date consistency checks', depends_on: ['DX11'], owned_paths: ['content/v12/qa/entity-consistency/'] },
  { id: 'DX13', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W2', title: 'Age-tier language linting (reading load, non-graphic safety, no child PII prompts)', depends_on: ['AG14', 'AG15', 'AG16', 'AG17'], owned_paths: ['content/v12/qa/age-lint/'] },
  { id: 'DX14', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W2', title: 'Lebanese Arabic (ar-LB) localization & dialect preservation checks', depends_on: ['DX05', 'CL04'], owned_paths: ['content/v12/locales/ar-LB/'] },
  { id: 'DX15', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W3', title: 'Egyptian (ar-EG) and Iraqi Arabic (ar-IQ) localization & dialect preservation checks', depends_on: ['DX06', 'DX07', 'CL04'], owned_paths: ['content/v12/locales/ar-EG-IQ/'] },
  { id: 'DX16', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W3', title: 'French (fr) and Korean (ko) localization & cultural terminology checks', depends_on: ['DX08', 'DX09', 'CL04'], owned_paths: ['content/v12/locales/fr-ko/'] },
  { id: 'DX17', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W3', title: 'Atlas coordinate validation and no-invention boundary checks', depends_on: ['DX05', 'DX06', 'DX07', 'DX08', 'DX09'], owned_paths: ['content/v12/geo/'] },
  { id: 'DX18', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W4', title: 'Media rights, metadata, paraphrase-only text enforcement, and asset optimization', depends_on: ['AG03', 'AG04', 'AG05', 'AG06', 'AG07', 'AG08', 'AG09', 'AG10', 'AG11', 'AG19'], owned_paths: ['content/v12/qa/media-rights/'] },
  { id: 'DX19', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W4', title: 'Quest-knowledge coverage matrix and regression vectors (25 acts × 4 tiers)', depends_on: ['CL03', 'CX02'], owned_paths: ['tests/v12/vectors/'] },
  { id: 'DX20', family: 'DGX Spark', backend: 'dgx', resolved_model: 'qwen/qwen3-coder-next', wave: 'W5', title: 'Independent final source traceability and artifact audit', depends_on: ['DX18', 'DX19', 'CX04'], owned_paths: ['reports/v12/traceability-audit/'] },

  // 5 Claude: knowledge ontology, epistemic verification, educational progression, platform content contracts, cultural review
  { id: 'CL01', family: 'Claude', backend: 'claude', resolved_model: 'Claude Sonnet 4.6', wave: 'W0', title: 'Knowledge ontology, reversible merge policy, and canonical IDs', depends_on: [], owned_paths: ['packages/knowledge-v12/'] },
  { id: 'CL02', family: 'Claude', backend: 'claude', resolved_model: 'Claude Sonnet 4.6', wave: 'W0', title: 'Historical epistemology, claim-verification policy, and reviewer workflow', depends_on: ['CL01'], owned_paths: ['content/v12/epistemology/'] },
  { id: 'CL03', family: 'Claude', backend: 'claude', resolved_model: 'Claude Sonnet 4.6', wave: 'W2', title: 'Age-tier educational design and five-act quest alignment across LB, IQ, EG, FR, KR', depends_on: ['CL01', 'CL02', 'DX05', 'DX06', 'DX07', 'DX08', 'DX09'], owned_paths: ['content/v12/quest-enrichment/'] },
  { id: 'CL04', family: 'Claude', backend: 'claude', resolved_model: 'Claude Sonnet 4.6', wave: 'W2', title: 'Cross-platform content contracts and localization/safety constraints', depends_on: ['CL01', 'CL03'], owned_paths: ['packages/contracts/v12/'] },
  { id: 'CL05', family: 'Claude', backend: 'claude', resolved_model: 'Claude Sonnet 4.6', wave: 'W5', title: 'Independent content integrity review, disputed-claim triage, and acceptance decision', depends_on: ['AG20', 'DX20', 'CX04'], owned_paths: ['reports/v12/independent-review/'] },

  // 5 Codex: data migrations, compiler/export integration, atlas, automated testing, CI/release
  { id: 'CX01', family: 'Codex', backend: 'codex', resolved_model: 'gpt-6-astra', wave: 'W0', title: 'Repository inventory, non-destructive migrations, schema, diff preview, and rollback', depends_on: ['CL01'], owned_paths: ['tools/v12/migration/'] },
  { id: 'CX02', family: 'Codex', backend: 'codex', resolved_model: 'gpt-6-astra', wave: 'W2', title: 'Content compiler for Roblox Luau and Minecraft Bedrock JS/JSON', depends_on: ['CL03', 'CL04', 'CX01'], owned_paths: ['tools/v12/compiler/', 'apps/roblox/src/shared/KnowledgeV12.luau', 'apps/minecraft/scripts/generated/knowledgeV12.ts'] },
  { id: 'CX03', family: 'Codex', backend: 'codex', resolved_model: 'gpt-6-astra', wave: 'W4', title: 'Website atlas, encyclopedia, and quest map integration', depends_on: ['AG12', 'AG13', 'CX02', 'DX17'], owned_paths: ['apps/web/src/features/encyclopedia-v12/', 'apps/web/src/generated/knowledgeV12.json'] },
  { id: 'CX04', family: 'Codex', backend: 'codex', resolved_model: 'gpt-6-astra', wave: 'W4', title: 'Automated tests for provenance, localization, map coordinates, schemas, and quest regression', depends_on: ['CX02', 'CX03', 'DX19'], owned_paths: ['tests/v12/suite/'] },
  { id: 'CX05', family: 'Codex', backend: 'codex', resolved_model: 'gpt-6-astra', wave: 'W5', title: 'CI, staged deployment, artifact manifest, release gate, and reconciliation', depends_on: ['CX04', 'AG20', 'DX20', 'CL05'], owned_paths: ['tools/v12/release/'] },
];

// Verify zero ownership collisions
const seen = new Map();
for (const agent of ROSTER) {
  for (const p of agent.owned_paths) {
    if (seen.has(p)) {
      throw new Error(`Ownership collision on ${p} between ${seen.get(p)} and ${agent.id}`);
    }
    seen.set(p, agent.id);
  }
}

const manifest = {
  version: '1.2.0',
  directive: 'MiraVerse v1.2 | Source-Grounded Cultural Knowledge Enrichment',
  source_document: 'The Transnational Quest for Home: Myth, Memory, and Cultural Heritage in the Expatriate Experience (Pasted text(1).txt)',
  country_sequence: ['LB', 'IQ', 'EG', 'FR', 'KR'],
  age_tiers: ['5-7', '8-10', '11-13', '14-17'],
  integration_branch: 'integration/miraverse-v1.2',
  base_sha: baseSha,
  created_at: new Date().toISOString(),
  counts: {
    total: ROSTER.length,
    antigravity: ROSTER.filter((a) => a.backend === 'antigravity').length,
    dgx: ROSTER.filter((a) => a.backend === 'dgx').length,
    claude: ROSTER.filter((a) => a.backend === 'claude').length,
    codex: ROSTER.filter((a) => a.backend === 'codex').length,
  },
  dgx_concurrency_limit: 1,
  agents: ROSTER.map((a) => ({
    ...a,
    branch: `v12/${a.id}`,
    worktree: `/home/wael/Code/mv-wt-v12/${a.id}`,
    status: 'READY',
    attempts: 0,
    base_sha: baseSha,
    commit_sha: null,
    integration_sha: null,
    runtime_environment: null,
    modified_files: [],
    evidence_paths: [],
    blockers: [],
    log_path: `swarm/v12/logs/${a.id}.log`,
  })),
};

const dag = {
  version: '1.2.0',
  waves: {
    W0: ['DX01', 'CL01', 'CL02', 'CX01', 'AG01'],
    W1: ['DX02', 'DX03', 'DX04', 'DX05', 'DX06', 'DX07', 'DX08', 'DX09', 'DX10', 'DX11'],
    W2: ['CL03', 'CL04', 'AG02', 'AG03', 'AG14', 'AG15', 'AG16', 'AG17', 'DX12', 'DX13', 'DX14', 'CX02'],
    W3: ['AG04', 'AG05', 'AG06', 'AG07', 'AG08', 'AG09', 'AG10', 'AG11', 'DX15', 'DX16', 'DX17'],
    W4: ['AG12', 'AG13', 'AG18', 'AG19', 'DX18', 'DX19', 'CX03', 'CX04'],
    W5: ['AG20', 'DX20', 'CL05', 'CX05'],
  },
};

fs.writeFileSync(path.join(SWARM_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(SWARM_DIR, 'dag.json'), JSON.stringify(dag, null, 2) + '\n', 'utf8');

console.log(`Initialized v1.2 manifest: ${manifest.counts.total} agents (${manifest.counts.antigravity} AG, ${manifest.counts.dgx} DX, ${manifest.counts.claude} CL, ${manifest.counts.codex} CX), ${seen.size} unique owned paths.`);
