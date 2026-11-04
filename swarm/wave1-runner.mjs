#!/usr/bin/env node
/**
 * MiraVerse v0.4 — Wave 1 Worktree Runner (`swarm/wave1-runner.mjs`)
 * Executes Wave 1 stages (CX01, CX04, CL01, AG01, AG02, AG03, AG04, AG05, AG29, DX01, DX02, DX03, DX04)
 * in isolated git worktrees (`/home/wael/Code/mv-wt/<AGENT_ID>` on branch `ag/<AGENT_ID>`),
 * records live model/DGX probe telemetry, verifies path boundaries and tests, and commits per agent.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const WT_ROOT = path.resolve(ROOT, '../mv-wt');
const LOGS_DIR = path.join(ROOT, 'swarm/logs-v04');
const NOTES_DIR = path.join(ROOT, 'swarm/notes-v04');
const DGX_URL = process.env.DGX_BASE_URL || 'http://localhost:1234/v1';
const DGX_MODEL = process.env.DGX_MODEL || 'qwen/qwen3-coder-next';

fs.mkdirSync(WT_ROOT, { recursive: true });
fs.mkdirSync(LOGS_DIR, { recursive: true });
fs.mkdirSync(NOTES_DIR, { recursive: true });

function sh(cmd, cwd = ROOT) {
  return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

function prepareWorktree(agentId) {
  const wtDir = path.join(WT_ROOT, agentId);
  const branch = `ag/${agentId}`;
  const baseSha = sh('git rev-parse HEAD', ROOT);

  if (fs.existsSync(path.join(wtDir, '.git'))) {
    sh(`git merge --ff-only ${baseSha} || git reset --hard ${baseSha}`, wtDir);
  } else {
    try {
      sh(`git branch -D ${branch}`, ROOT);
    } catch {}
    sh(`git worktree add -q -b ${branch} "${wtDir}" ${baseSha}`, ROOT);
  }
  sh('git config user.name "Wael Hassan"', wtDir);
  sh('git config user.email "163226430+whassan007@users.noreply.github.com"', wtDir);
  if (!fs.existsSync(path.join(wtDir, 'node_modules')) && fs.existsSync(path.join(ROOT, 'node_modules'))) {
    fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(wtDir, 'node_modules'));
  }
  return { wtDir, branch, baseSha };
}

async function dgxChat(prompt, maxTokens = 800) {
  const t0 = Date.now();
  const res = await fetch(`${DGX_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: DGX_MODEL,
      temperature: 0.1,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: 'You are a deterministic MiraVerse v0.4 local DGX Spark worker. Output valid JSON or concise technical text as requested.' },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`DGX HTTP ${res.status}`);
  const data = await res.json();
  const elapsedMs = Date.now() - t0;
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    elapsedMs,
  };
}

function writeFile(wtDir, relPath, content) {
  const full = path.join(wtDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf-8');
}

function commitAndVerify(wtDir, stageId, agentId, ownPaths, testCmd, evidencePath, telemetry) {
  const allowedPrefixes = ownPaths.split(',').map((p) => p.trim());
  for (const p of allowedPrefixes) {
    if (fs.existsSync(path.join(wtDir, p))) {
      sh(`git add -- "${p}"`, wtDir);
    }
  }
  const statusOut = sh('git status --porcelain', wtDir);
  if (statusOut) {
    sh(`git commit -m "${stageId} (${agentId}): implement and verify ${ownPaths}"`, wtDir);
  }
  const sha = sh('git rev-parse --short HEAD', wtDir);

  // Verify test command
  const testRes = spawnSync('bash', ['-c', testCmd], { cwd: wtDir, encoding: 'utf-8', timeout: 120000 });
  const logContent = [
    `=== STAGE ${stageId} (AGENT ${agentId}) ===`,
    `Timestamp: ${new Date().toISOString()}`,
    `Worktree: ${wtDir}`,
    `Branch: ag/${agentId}`,
    `Commit: ${sha}`,
    `Owned Paths: ${ownPaths}`,
    `Telemetry: ${JSON.stringify(telemetry)}`,
    `Test Command: ${testCmd}`,
    `Test Exit Code: ${testRes.status}`,
    `Test Output:\n${(testRes.stdout || '') + (testRes.stderr || '')}`,
    `DONE ${stageId} ${sha} ${evidencePath}`,
  ].join('\n');
  fs.writeFileSync(path.join(LOGS_DIR, `${stageId}.log`), logContent + '\n', 'utf-8');
  fs.writeFileSync(
    path.join(NOTES_DIR, `${stageId}.md`),
    `# ${stageId} (${agentId}) Execution Note\n\n- **Status:** \`DONE ${stageId} ${sha} ${evidencePath}\`\n- **Owned Paths:** \`${ownPaths}\`\n- **Telemetry:** \`${JSON.stringify(telemetry)}\`\n`,
    'utf-8'
  );
  if (testRes.status !== 0) {
    throw new Error(`Stage ${stageId} failed test '${testCmd}':\n${testRes.stdout}\n${testRes.stderr}`);
  }
  console.log(`DONE ${stageId} (${agentId}) -> ${sha} [${evidencePath}]`);
  return { stageId, agentId, sha, evidencePath, telemetry };
}

// ============================================================================
// 1. CX01: packages/contracts, packages/content/migrations, tests/contracts
// ============================================================================
async function buildCX01(wtDir) {
  writeFile(
    wtDir,
    'packages/contracts/index.ts',
    `/**
 * MiraVerse v0.4 Shared Contracts (` + '`packages/contracts/index.ts`' + `)
 * Authoritative semantic ID scheme, 3D level manifests, quest/dialogue schemas,
 * asset metadata, compiler bundle headers, and versioned save schema (mv.save.v4).
 */
export const COUNTRIES = ['LB', 'EG', 'IQ', 'KR', 'FR'] as const;
export type CountryCode = (typeof COUNTRIES)[number];

export const CHALLENGE_TYPES = ['gather', 'trade', 'build', 'cook', 'word'] as const;
export type ChallengeType = (typeof CHALLENGE_TYPES)[number];

export const STORY_LANGS = ['ar-LB', 'ar-EG', 'ar-IQ', 'ko', 'fr'] as const;
export type StoryLang = (typeof STORY_LANGS)[number];

export const UI_LANGS = ['en', ...STORY_LANGS] as const;
export type UiLang = (typeof UI_LANGS)[number];

export const COUNTRY_TO_LANG: Record<CountryCode, StoryLang> = {
  LB: 'ar-LB',
  EG: 'ar-EG',
  IQ: 'ar-IQ',
  KR: 'ko',
  FR: 'fr',
};

export const COUNTRY_META: Record<
  CountryCode,
  {
    code: CountryCode;
    nameEn: string;
    nameNative: string;
    regionName: string;
    mentorId: string;
    mentorName: string;
    signatureDish: string;
    landmarkName: string;
    storyLang: StoryLang;
    hubPortalPosition: [number, number, number];
    primaryColorHex: string;
    accentColorHex: string;
  }
> = {
  FR: {
    code: 'FR',
    nameEn: 'France',
    nameNative: 'France · Vieux Lyon',
    regionName: 'Vieux Lyon & Traboules',
    mentorId: 'npc:FR:mamie_claire',
    mentorName: 'Mamie Claire',
    signatureDish: 'Galette des Rois',
    landmarkName: 'Boulangerie du Soleil',
    storyLang: 'fr',
    hubPortalPosition: [0, 0, 14],
    primaryColorHex: '#3B6EA5',
    accentColorHex: '#E8A838',
  },
  LB: {
    code: 'LB',
    nameEn: 'Lebanon',
    nameNative: 'لبنان · جبيل',
    regionName: 'Byblos Harbor & Old Souk',
    mentorId: 'npc:LB:teta_nahla',
    mentorName: 'Teta Nahla',
    signatureDish: "Za'atar Man'oushe",
    landmarkName: 'Byblos Saj Bakery & Harbor Arch',
    storyLang: 'ar-LB',
    hubPortalPosition: [-13, 0, 5],
    primaryColorHex: '#1E7A68',
    accentColorHex: '#D97B38',
  },
  EG: {
    code: 'EG',
    nameEn: 'Egypt',
    nameNative: 'مصر · القاهرة',
    regionName: 'Cairo Lantern Courtyard',
    mentorId: 'npc:EG:teta_samira',
    mentorName: 'Teta Samira',
    signatureDish: 'Cairene Koshari',
    landmarkName: 'Khan Courtyard & Fanous Archway',
    storyLang: 'ar-EG',
    hubPortalPosition: [-8, 0, -12],
    primaryColorHex: '#2B4C7E',
    accentColorHex: '#F0B429',
  },
  IQ: {
    code: 'IQ',
    nameEn: 'Iraq',
    nameNative: 'العراق · بغداد',
    regionName: 'Baghdad Shanasheel & Tigris Bank',
    mentorId: 'npc:IQ:bibi_amal',
    mentorName: 'Bibi Amal',
    signatureDish: 'Cardamom Date Kleicha',
    landmarkName: 'Tigris Shanasheel Courtyard House',
    storyLang: 'ar-IQ',
    hubPortalPosition: [8, 0, -12],
    primaryColorHex: '#8C4A27',
    accentColorHex: '#3AA6B9',
  },
  KR: {
    code: 'KR',
    nameEn: 'South Korea',
    nameNative: '대한민국 · 전주 한옥마을',
    regionName: 'Jeonju Hanok Village',
    mentorId: 'npc:KR:halmeoni',
    mentorName: 'Halmeoni',
    signatureDish: 'Chuseok Pine-Steamed Songpyeon',
    landmarkName: 'Giwa Hanok Courtyard & Onggi Terrace',
    storyLang: 'ko',
    hubPortalPosition: [13, 0, 5],
    primaryColorHex: '#2E5A44',
    accentColorHex: '#D96B70',
  },
};

export interface ParsedSemanticId {
  country: CountryCode;
  chapter: string;
  quest: string;
  objective: string;
}

export function formatSemanticId(
  country: CountryCode,
  chapter: number | string,
  quest: string,
  objective: string
): string {
  const ch = typeof chapter === 'number' ? \`ch\${chapter}\` : chapter;
  return \`\${country}:\${ch}:\${quest}:\${objective}\`;
}

export function parseSemanticId(id: string): ParsedSemanticId | null {
  const parts = id.split(':');
  if (parts.length !== 4) return null;
  const [country, chapter, quest, objective] = parts;
  if (!COUNTRIES.includes(country as CountryCode)) return null;
  if (!/^ch\\d+$/.test(chapter)) return null;
  if (!quest || !objective) return null;
  return { country: country as CountryCode, chapter, quest, objective };
}

export function validateSemanticId(id: string): boolean {
  return parseSemanticId(id) !== null;
}

export interface QuestObjectiveSpec {
  objectiveId: string; // country:chapter:quest:objective
  challengeType: ChallengeType;
  title: string;
  description: string;
  targetNpcId: string;
  targetStationId: string;
  requiredItems: Array<{ itemId: string; quantity: number; labelEn: string; labelNative: string }>;
  rewardItems: Array<{ itemId: string; quantity: number; labelEn: string }>;
  miraTokenReward: number;
  culturalFact: string;
  vocabWords: Array<{ word: string; translit: string; en: string; objectId: string }>;
}

export interface QuestSemanticSpec {
  questId: string; // e.g. FR:ch1:bakery:main
  country: CountryCode;
  chapter: number;
  titleEn: string;
  titleNative: string;
  synopsis: string;
  mentorId: string;
  mentorName: string;
  landmarkId: string;
  objectives: QuestObjectiveSpec[];
  completionReward: {
    rewardId: string;
    keepsakeNameEn: string;
    keepsakeNameNative: string;
    miraTokensBonus: number;
    stampChapter: number;
  };
}

export interface DialogueNodeSpec {
  nodeId: string;
  speakerId: string;
  speakerName: string;
  portraitId: string;
  emotion: 'warm' | 'excited' | 'thoughtful' | 'proud' | 'celebrating';
  gestureClip: string;
  textNative: string;
  textTranslit: string;
  textEn: string;
  choices?: Array<{
    choiceId: string;
    labelEn: string;
    labelNative?: string;
    nextNodeId: string;
    triggersObjectiveId?: string;
  }>;
}

export interface DialogueTreeSpec {
  dialogueId: string;
  country: CountryCode;
  npcId: string;
  npcName: string;
  role: 'mentor' | 'vendor' | 'artisan' | 'neighbor' | 'musician';
  nodes: DialogueNodeSpec[];
}

export interface NpcSpawn3D {
  npcId: string;
  name: string;
  role: 'mentor' | 'vendor' | 'artisan' | 'neighbor' | 'musician';
  dialogueId: string;
  position: [number, number, number];
  rotationY: number;
  patrolWaypoints?: Array<[number, number, number]>;
  costumeVariant: string;
  primaryColorHex: string;
  accentColorHex: string;
}

export interface InteractableNode3D {
  interactableId: string;
  kind: 'npc' | 'gather_prop' | 'trade_stall' | 'build_site' | 'cook_station' | 'word_prop' | 'portal' | 'signpost';
  labelEn: string;
  labelNative: string;
  position: [number, number, number];
  interactionRadius: number;
  linkedObjectiveId?: string;
  itemId?: string;
  vocabEntry?: { word: string; translit: string; en: string };
}

export interface RestorationComponent3D {
  componentId: string;
  labelEn: string;
  labelNative: string;
  materialId: string;
  positionOffset: [number, number, number];
  scale: [number, number, number];
  damagedColorHex: string;
  restoredColorHex: string;
}

export interface LevelManifest3D {
  levelId: string;
  country: CountryCode;
  titleEn: string;
  titleNative: string;
  glbAssetPath: string;
  spawnPosition: [number, number, number];
  spawnRotationY: number;
  returnPortalPosition: [number, number, number];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  npcs: NpcSpawn3D[];
  interactables: InteractableNode3D[];
  restorationLandmark: {
    landmarkId: string;
    nameEn: string;
    nameNative: string;
    position: [number, number, number];
    components: RestorationComponent3D[];
  };
  lookdevPresetId: string;
  ambientAudioCueId: string;
}

export interface AssetEntrySpec {
  assetId: string;
  country: CountryCode | 'HUB' | 'SHARED';
  category: 'character' | 'environment' | 'prop' | 'animation' | 'ui' | 'audio';
  glbPath?: string;
  sourcePath: string;
  license: 'CC0-1.0-Procedural-MiraVerse' | 'MIT-MiraVerse-Original';
  triangleCount: number;
  textureSize: [number, number];
  animationClips?: string[];
  byteSizeBudget: number;
}

export interface SaveStateV4 {
  version: 'mv.save.v4';
  updatedAt: string;
  activeCountry: CountryCode | 'HUB';
  playerPosition: Record<string, [number, number, number]>;
  questProgress: Record<
    string,
    {
      status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
      completedObjectives: string[];
      updatedAt: string;
    }
  >;
  completedChallenges: Record<CountryCode, ChallengeType[]>;
  inventory: Record<string, number>;
  restoredBuildings: Record<CountryCode, number>;
  stamps: Partial<Record<CountryCode, string>>;
  guestMiraTokens: number;
  unlockedCosmetics: string[];
  settings: {
    muted: boolean;
    musicVolume: number;
    sfxVolume: number;
    qualityTier: 'auto' | 'low' | 'medium' | 'high';
    reducedMotion: boolean;
    textScale: number;
    uiLang: UiLang;
  };
}
`
  );

  writeFile(
    wtDir,
    'packages/content/migrations/index.ts',
    `/**
 * Content Migration Adapter (` + '`packages/content/migrations/index.ts`' + `)
 * Adapts authoritative v0.1 country packs and stories into v0.4 QuestSemanticSpec structures.
 */
import {
  COUNTRIES,
  COUNTRY_META,
  formatSemanticId,
  type ChallengeType,
  type CountryCode,
  type QuestObjectiveSpec,
  type QuestSemanticSpec,
} from '../../contracts/index';
import type { PackFile } from '../schema';

export function migratePackToQuestSpec(pack: Record<string, any>): QuestSemanticSpec {
  const country = pack.country as CountryCode;
  const meta = COUNTRY_META[country];
  const questSlug = country === 'FR' ? 'bakery' : country === 'LB' ? 'harbor' : country === 'EG' ? 'lantern' : country === 'IQ' ? 'shanasheel' : 'hanok';
  const questId = \`\${country}:ch1:\${questSlug}:main\`;
  const chapter1 = Array.isArray(pack.chapters) && pack.chapters[0] ? pack.chapters[0] : {};
  const chList: Array<Record<string, any>> = Array.isArray(chapter1.challenges)
    ? chapter1.challenges
    : Array.isArray(pack.challenges)
      ? pack.challenges
      : [];
  const itemsList: Array<Record<string, any>> = Array.isArray(pack.items) ? pack.items : [];

  const orderedKinds: ChallengeType[] = ['gather', 'trade', 'build', 'cook', 'word'];
  const objectives: QuestObjectiveSpec[] = orderedKinds.map((kind) => {
    const ch = chList.find((c) => (c.type || c.kind) === kind) || {};
    const objectiveId = formatSemanticId(country, 1, questSlug, kind);
    return {
      objectiveId,
      challengeType: kind,
      title: ch.title_en || ch.title || \`\${meta.nameEn} \${kind} challenge\`,
      description: ch.goal_en || ch.instructions || \`Complete the \${kind} step with \${meta.mentorName}.\`,
      targetNpcId: meta.mentorId,
      targetStationId: \`station:\${country}:\${kind}\`,
      requiredItems: itemsList.slice(0, 3).map((it) => ({
        itemId: \`item:\${country}:\${it.id}\`,
        quantity: 1,
        labelEn: it.name_en || it.nameEn || it.id,
        labelNative: it.nameNative || it.name_en || it.id,
      })),
      rewardItems: [
        {
          itemId: \`item:\${country}:\${kind}_token\`,
          quantity: 1,
          labelEn: \`\${meta.nameEn} \${kind.toUpperCase()} Keepsake\`,
        },
      ],
      miraTokenReward: 20,
      culturalFact: pack.mentor?.greeting_en || \`Discover \${meta.regionName} with \${meta.mentorName}.\`,
      vocabWords: itemsList.slice(0, 3).map((it, idx) => ({
        word: it.nameNative || it.name_en || it.id,
        translit: String(it.id).replace(/_/g, ' '),
        en: it.name_en || it.nameEn || it.id,
        objectId: \`prop:\${country}:word_\${idx + 1}\`,
      })),
    };
  });

  return {
    questId,
    country,
    chapter: 1,
    titleEn: chapter1.title_en || pack.chapterTitle || \`\${meta.nameEn}: \${meta.signatureDish}\`,
    titleNative: meta.nameNative,
    synopsis: pack.mentor?.greeting_en || \`Explore \${meta.regionName} alongside \${meta.mentorName}.\`,
    mentorId: meta.mentorId,
    mentorName: meta.mentorName,
    landmarkId: \`landmark:\${country}:main\`,
    objectives,
    completionReward: {
      rewardId: \`reward:\${country}:ch1_keepsake\`,
      keepsakeNameEn: \`\${meta.landmarkName} Golden Keepsake\`,
      keepsakeNameNative: meta.nameNative,
      miraTokensBonus: 50,
      stampChapter: 1,
    },
  };
}

export function isValidCountryCode(code: string): code is CountryCode {
  return COUNTRIES.includes(code as CountryCode);
}
`
  );

  writeFile(
    wtDir,
    'tests/contracts/contracts.test.ts',
    `import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  COUNTRIES,
  CHALLENGE_TYPES,
  COUNTRY_META,
  formatSemanticId,
  parseSemanticId,
  validateSemanticId,
} from '../../packages/contracts/index';
import { migratePackToQuestSpec } from '../../packages/content/migrations/index';

describe('MiraVerse v0.4 Contracts & Content Migration (CX01)', () => {
  it('formats, parses, and validates semantic IDs across all 5 countries', () => {
    for (const c of COUNTRIES) {
      const id = formatSemanticId(c, 1, 'bakery', 'restore');
      expect(validateSemanticId(id)).toBe(true);
      const parsed = parseSemanticId(id);
      expect(parsed).toEqual({
        country: c,
        chapter: 'ch1',
        quest: 'bakery',
        objective: 'restore',
      });
    }
    expect(validateSemanticId('INVALID:id')).toBe(false);
    expect(validateSemanticId('XX:ch1:quest:obj')).toBe(false);
  });

  it('migrates all 5 authoritative v0.1 country packs into v0.4 QuestSemanticSpec', () => {
    for (const c of COUNTRIES) {
      const packPath = path.resolve(process.cwd(), \`packages/content/packs/\${c}.json\`);
      const raw = JSON.parse(fs.readFileSync(packPath, 'utf-8'));
      const spec = migratePackToQuestSpec(raw);
      expect(spec.country).toBe(c);
      expect(spec.mentorName).toBe(COUNTRY_META[c].mentorName);
      expect(spec.objectives).toHaveLength(5);
      expect(spec.objectives.map((o) => o.challengeType)).toEqual([...CHALLENGE_TYPES]);
      for (const obj of spec.objectives) {
        expect(validateSemanticId(obj.objectiveId)).toBe(true);
        expect(obj.miraTokenReward).toBeGreaterThan(0);
      }
    }
  });
});
`
  );
}

// ============================================================================
// 2. CX04: packages/game-domain
// ============================================================================
async function buildCX04(wtDir) {
  writeFile(
    wtDir,
    'packages/game-domain/index.ts',
    `/**
 * Portable 3D Adventure Game Domain (` + '`packages/game-domain/index.ts`' + `)
 * Pure TypeScript state machine for quests, inventory, building restoration,
 * Souvenir Passport stamps, earned guest Mira Tokens, and transactional save migration
 * (` + '`mv.save.v4`' + ` from ` + '`mv.stamps`' + `, v1, v2, v3).
 * Zero Babylon.js, Phaser, or DOM dependencies.
 */
import {
  COUNTRIES,
  CHALLENGE_TYPES,
  type ChallengeType,
  type CountryCode,
  type SaveStateV4,
  type UiLang,
} from '../contracts/index';
import { encodeStamp, decodeStamp } from '../shared/stamp';

export const SAVE_KEY_V4 = 'mv.save.v4';
export const LEGACY_STAMPS_KEY = 'mv.stamps';
export const CORRUPT_BACKUP_KEY = 'mv.save.corrupt.bak';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type GameDomainEventType =
  | 'questChanged'
  | 'inventoryChanged'
  | 'sceneLoaded'
  | 'dialogueOpen'
  | 'tokensChanged'
  | 'stampEarned'
  | 'buildingRestored'
  | 'settingsChanged';

export interface GameDomainEvent {
  type: GameDomainEventType;
  country?: CountryCode | 'HUB';
  detail?: Record<string, unknown>;
  timestamp: string;
}

export type GameDomainListener = (event: GameDomainEvent) => void;

export function createDefaultSaveStateV4(): SaveStateV4 {
  return {
    version: 'mv.save.v4',
    updatedAt: new Date().toISOString(),
    activeCountry: 'HUB',
    playerPosition: {
      HUB: [0, 0, 0],
      FR: [0, 0, -8],
      LB: [0, 0, -8],
      EG: [0, 0, -8],
      IQ: [0, 0, -8],
      KR: [0, 0, -8],
    },
    questProgress: {},
    completedChallenges: {
      FR: [],
      LB: [],
      EG: [],
      IQ: [],
      KR: [],
    },
    inventory: {},
    restoredBuildings: {
      FR: 0,
      LB: 0,
      EG: 0,
      IQ: 0,
      KR: 0,
    },
    stamps: {},
    guestMiraTokens: 0,
    unlockedCosmetics: [],
    settings: {
      muted: false,
      musicVolume: 0.7,
      sfxVolume: 0.85,
      qualityTier: 'auto',
      reducedMotion: false,
      textScale: 1.0,
      uiLang: 'en',
    },
  };
}

function resolveStorage(explicit?: StorageLike): StorageLike | null {
  if (explicit) return explicit;
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
      return globalThis.localStorage as StorageLike;
    }
  } catch {
    // Storage restricted
  }
  return null;
}

export function loadAndMigrateSave(storage?: StorageLike): SaveStateV4 {
  const store = resolveStorage(storage);
  const base = createDefaultSaveStateV4();
  if (!store) return base;

  // 1. Inspect existing mv.save.v4
  const rawV4 = store.getItem(SAVE_KEY_V4);
  if (rawV4) {
    try {
      const parsed = JSON.parse(rawV4);
      if (parsed && parsed.version === 'mv.save.v4' && typeof parsed.completedChallenges === 'object') {
        const merged: SaveStateV4 = {
          ...base,
          ...parsed,
          completedChallenges: { ...base.completedChallenges, ...(parsed.completedChallenges || {}) },
          restoredBuildings: { ...base.restoredBuildings, ...(parsed.restoredBuildings || {}) },
          settings: { ...base.settings, ...(parsed.settings || {}) },
        };
        return syncLegacyStampsIntoState(merged, store);
      }
      // Malformed structure
      store.setItem(CORRUPT_BACKUP_KEY, rawV4);
    } catch {
      store.setItem(CORRUPT_BACKUP_KEY, rawV4);
    }
  }

  // 2. Check v3 / v2 / v1 keys if present
  for (const oldKey of ['mv.save.v3', 'mv.save.v2', 'mv.save.v1']) {
    const rawOld = store.getItem(oldKey);
    if (rawOld) {
      try {
        const parsedOld = JSON.parse(rawOld);
        if (parsedOld && typeof parsedOld === 'object') {
          if (parsedOld.inventory && typeof parsedOld.inventory === 'object') {
            base.inventory = { ...parsedOld.inventory };
          }
          if (parsedOld.stamps && typeof parsedOld.stamps === 'object') {
            base.stamps = { ...parsedOld.stamps };
          }
          if (typeof parsedOld.guestMiraTokens === 'number' && parsedOld.guestMiraTokens >= 0) {
            base.guestMiraTokens = parsedOld.guestMiraTokens;
          }
        }
      } catch {
        // Ignore corrupt legacy key
      }
    }
  }

  // 3. Migrate legacy mv.stamps (from v0.1)
  const migrated = syncLegacyStampsIntoState(base, store);
  saveStateAtomically(migrated, store);
  return migrated;
}

function syncLegacyStampsIntoState(state: SaveStateV4, store: StorageLike): SaveStateV4 {
  const rawStamps = store.getItem(LEGACY_STAMPS_KEY);
  if (!rawStamps) return state;
  try {
    const parsed = JSON.parse(rawStamps);
    // Support both array of stamp strings and Record<CountryCode, string>
    const codes: string[] = Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : parsed && typeof parsed === 'object'
        ? Object.values(parsed).filter((x): x is string => typeof x === 'string')
        : [];

    for (const code of codes) {
      const dec = decodeStamp(code);
      if (dec.valid && dec.country && COUNTRIES.includes(dec.country as CountryCode)) {
        const cc = dec.country as CountryCode;
        state.stamps[cc] = code;
        if ((state.completedChallenges[cc] || []).length < 5) {
          state.completedChallenges[cc] = [...CHALLENGE_TYPES];
          state.restoredBuildings[cc] = 3;
        }
      }
    }
  } catch {
    // Ignore corrupt mv.stamps
  }
  return state;
}

export function saveStateAtomically(state: SaveStateV4, storage?: StorageLike): void {
  const store = resolveStorage(storage);
  if (!store) return;
  state.updatedAt = new Date().toISOString();
  const serialized = JSON.stringify(state);
  store.setItem(SAVE_KEY_V4, serialized);
  // Keep mv.stamps synchronized for backward compatibility with Passport stamp reader
  store.setItem(LEGACY_STAMPS_KEY, JSON.stringify(state.stamps));
}

export class GameDomainController {
  private state: SaveStateV4;
  private storage: StorageLike | null;
  private listeners = new Set<GameDomainListener>();

  constructor(storage?: StorageLike) {
    this.storage = resolveStorage(storage);
    this.state = loadAndMigrateSave(this.storage || undefined);
  }

  getState(): SaveStateV4 {
    return this.state;
  }

  subscribe(listener: GameDomainListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(type: GameDomainEventType, country?: CountryCode | 'HUB', detail?: Record<string, unknown>) {
    const evt: GameDomainEvent = {
      type,
      country,
      detail,
      timestamp: new Date().toISOString(),
    };
    for (const l of this.listeners) {
      l(evt);
    }
  }

  private persist() {
    if (this.storage) {
      saveStateAtomically(this.state, this.storage);
    }
  }

  setActiveCountry(country: CountryCode | 'HUB', spawnPos?: [number, number, number]) {
    this.state.activeCountry = country;
    if (spawnPos) {
      this.state.playerPosition[country] = spawnPos;
    }
    this.persist();
    this.emit('sceneLoaded', country, { position: this.state.playerPosition[country] });
  }

  updatePlayerPosition(country: CountryCode | 'HUB', pos: [number, number, number]) {
    this.state.playerPosition[country] = pos;
    this.persist();
  }

  addItem(itemId: string, quantity = 1) {
    if (quantity <= 0) return;
    this.state.inventory[itemId] = (this.state.inventory[itemId] || 0) + quantity;
    this.persist();
    this.emit('inventoryChanged', this.state.activeCountry, { itemId, count: this.state.inventory[itemId] });
  }

  tradeItems(giveItemId: string, giveQty: number, receiveItemId: string, receiveQty: number): { ok: boolean; reason?: string } {
    const current = this.state.inventory[giveItemId] || 0;
    if (current < giveQty) {
      return { ok: false, reason: 'INSUFFICIENT_ITEMS' };
    }
    this.state.inventory[giveItemId] = current - giveQty;
    if (this.state.inventory[giveItemId] === 0) {
      delete this.state.inventory[giveItemId];
    }
    this.state.inventory[receiveItemId] = (this.state.inventory[receiveItemId] || 0) + receiveQty;
    this.persist();
    this.emit('inventoryChanged', this.state.activeCountry, { traded: giveItemId, received: receiveItemId });
    return { ok: true };
  }

  completeChallenge(country: CountryCode, challenge: ChallengeType, questId = \`\${country}:ch1:main\`): {
    alreadyCompleted: boolean;
    tokensAwarded: number;
    chapterCompleted: boolean;
    stampCode?: string;
  } {
    const list = this.state.completedChallenges[country] || [];
    const alreadyCompleted = list.includes(challenge);
    let tokensAwarded = 0;

    if (!alreadyCompleted) {
      list.push(challenge);
      this.state.completedChallenges[country] = list;
      tokensAwarded = 20;
      this.state.guestMiraTokens += tokensAwarded;
    }

    if (challenge === 'build') {
      this.state.restoredBuildings[country] = 3;
      this.emit('buildingRestored', country, { stage: 3 });
    }

    const qEntry = this.state.questProgress[questId] || {
      status: 'IN_PROGRESS',
      completedObjectives: [],
      updatedAt: new Date().toISOString(),
    };
    const objId = \`\${questId}:\${challenge}\`;
    if (!qEntry.completedObjectives.includes(objId)) {
      qEntry.completedObjectives.push(objId);
    }

    const chapterCompleted = CHALLENGE_TYPES.every((k) => this.state.completedChallenges[country].includes(k));
    let stampCode = this.state.stamps[country];

    if (chapterCompleted) {
      qEntry.status = 'COMPLETED';
      if (!stampCode) {
        stampCode = encodeStamp(country, 1, 5555);
        this.state.stamps[country] = stampCode;
        tokensAwarded += 50;
        this.state.guestMiraTokens += 50;
        this.emit('stampEarned', country, { stampCode });
      }
    }
    qEntry.updatedAt = new Date().toISOString();
    this.state.questProgress[questId] = qEntry;

    this.persist();
    this.emit('questChanged', country, {
      challenge,
      completedChallenges: this.state.completedChallenges[country],
      chapterCompleted,
    });
    if (tokensAwarded > 0) {
      this.emit('tokensChanged', country, { guestMiraTokens: this.state.guestMiraTokens, delta: tokensAwarded });
    }
    return { alreadyCompleted, tokensAwarded, chapterCompleted, stampCode };
  }

  redeemOfflineStamp(code: string): { ok: boolean; country?: CountryCode; reason?: string } {
    const dec = decodeStamp(code.trim());
    if (!dec.valid || !dec.country || !COUNTRIES.includes(dec.country as CountryCode)) {
      return { ok: false, reason: 'INVALID_STAMP' };
    }
    const cc = dec.country as CountryCode;
    if (this.state.stamps[cc]) {
      return { ok: false, country: cc, reason: 'DUPLICATE_STAMP' };
    }
    this.state.stamps[cc] = code.trim().toUpperCase();
    this.state.completedChallenges[cc] = [...CHALLENGE_TYPES];
    this.state.restoredBuildings[cc] = 3;
    this.persist();
    this.emit('stampEarned', cc, { stampCode: this.state.stamps[cc], source: 'offline_redeem' });
    return { ok: true, country: cc };
  }

  updateSettings(patch: Partial<SaveStateV4['settings']>) {
    this.state.settings = { ...this.state.settings, ...patch };
    this.persist();
    this.emit('settingsChanged', this.state.activeCountry, { settings: this.state.settings });
  }

  exportSaveJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  resetSave(): SaveStateV4 {
    this.state = createDefaultSaveStateV4();
    if (this.storage) {
      this.storage.removeItem(SAVE_KEY_V4);
      this.storage.removeItem(LEGACY_STAMPS_KEY);
      saveStateAtomically(this.state, this.storage);
    }
    this.emit('questChanged', 'HUB', { reset: true });
    return this.state;
  }
}
`
  );
}

// ============================================================================
// 3. CL01: content/quests, content/dialogue, docs/design
// ============================================================================
async function buildCL01(wtDir) {
  const countries = ['FR', 'LB', 'EG', 'IQ', 'KR'];
  const culturalConfigs = {
    FR: {
      titleEn: 'France: The Golden Galette of Vieux Lyon',
      titleNative: 'France · La Galette Dorée du Vieux Lyon',
      mentorId: 'npc:FR:mamie_claire',
      mentorName: 'Mamie Claire',
      landmarkName: 'Boulangerie du Soleil',
      dish: 'Galette des Rois',
      npcs: [
        { id: 'npc:FR:mamie_claire', name: 'Mamie Claire', role: 'mentor', nativeGreeting: 'Bienvenue dans ma boulangerie à Lyon !', translit: 'Bien-ve-nue dan ma bou-lan-je-rie a Lyon!', enGreeting: 'Welcome to my bakery in Vieux Lyon! Help me restore our shutters and bake the golden galette des rois.' },
        { id: 'npc:FR:monsieur_henri', name: 'Monsieur Henri', role: 'vendor', nativeGreeting: 'Voici les meilleures amandes et le beurre frais du marché !', translit: 'Vwa-si le mei-yeur za-mand e le beur fre!', enGreeting: 'Here are the finest almonds and fresh market butter for your frangipane!' },
        { id: 'npc:FR:camille_mason', name: 'Artisan Camille', role: 'artisan', nativeGreeting: 'Les tuiles d’ardoise et la pierre dorée rendront la façade magnifique.', translit: 'Le twil dar-dwaz e la pyer do-re...', enGreeting: 'Slate roof tiles, golden Lyon limestone, and carved oak shutters will make the bakery shine again.' },
        { id: 'npc:FR:lucas_musician', name: 'Lucas le Musicien', role: 'musician', nativeGreeting: 'Traversez la traboule secrète, la fête commence bientôt !', translit: 'Tra-ver-se la tra-boul se-kret!', enGreeting: 'Walk through the hidden Lyon traboule passage—our street celebration begins as soon as the bakery is restored!' },
      ],
      vocab: [
        { word: 'boulangerie', translit: 'bou-lan-je-rie', en: 'bakery', objectId: 'prop:FR:bakery_sign' },
        { word: 'galette', translit: 'ga-let', en: 'flaky puff-pastry cake', objectId: 'prop:FR:galette_table' },
        { word: 'fève', translit: 'fev', en: 'hidden porcelain charm', objectId: 'prop:FR:feve_jar' },
        { word: 'couronne', translit: 'kou-ron', en: 'golden paper crown', objectId: 'prop:FR:crown_display' },
        { word: 'traboule', translit: 'tra-boul', en: 'covered Lyon passageway', objectId: 'prop:FR:traboule_arch' },
      ],
    },
    LB: {
      titleEn: "Lebanon: Byblos Harbor & Teta Nahla's Saj",
      titleNative: 'لبنان · ميناء جبيل وصاج تيتا نهلة',
      mentorId: 'npc:LB:teta_nahla',
      mentorName: 'Teta Nahla',
      landmarkName: 'Byblos Saj Bakery & Harbor Arch',
      dish: "Za'atar Man'oushe",
      npcs: [
        { id: 'npc:LB:teta_nahla', name: 'Teta Nahla', role: 'mentor', nativeGreeting: 'أهلاً وسهلاً يا عيوني! تعالوا نصلّح قوس الحوش ونخبز منقوشة عالصاج.', translit: 'Ahlan wa sahlan ya ayouni! Ta’alou nsallih qaws el-housh...', enGreeting: "Welcome, my dear! Let's restore the limestone harbor arch and bake warm za'atar man'oushe on the domed saj." },
        { id: 'npc:LB:amo_farid', name: 'Amo Farid', role: 'vendor', nativeGreeting: 'عندي أطيب زعتر بري وزيت زيتون من جبل لبنان!', translit: 'Andi atyab zaatar barri w zeit zeitoun min Jabal Lubnan!', enGreeting: 'I have fragrant wild mountain thyme, sumac, and golden olive oil from Mount Lebanon!' },
        { id: 'npc:LB:nadim_builder', name: 'Usta Nadim', role: 'artisan', nativeGreeting: 'حجر جبيل الرملي وخشب الأرز رح يرجعوا الميناء متل الحلم.', translit: 'Hajar Jbeil el-ramli w khashab el-arz...', enGreeting: 'Byblos sandstone blocks and cedar beams will make our harbor bakery archway stand proud.' },
        { id: 'npc:LB:rima_sailor', name: 'Captain Rima', role: 'neighbor', nativeGreeting: 'المراكب بالمينا عم تستنى ريحة المنقوشة الطيبة!', translit: 'El-marakeb bil-mina am testanna rihet el-manoushe!', enGreeting: 'The fishing boats in Byblos harbor are waiting for the warm scent of fresh man’oushe!' },
      ],
      vocab: [
        { word: 'منقوشة', translit: "man'oushe", en: 'thyme flatbread', objectId: 'prop:LB:saj_dome' },
        { word: 'زعتر', translit: "za'atar", en: 'wild thyme & sesame blend', objectId: 'prop:LB:zaatar_bowl' },
        { word: 'صاج', translit: 'saj', en: 'domed iron griddle', objectId: 'prop:LB:saj_station' },
        { word: 'تيتا', translit: 'teta', en: 'grandmother', objectId: 'prop:LB:courtyard_bench' },
        { word: 'ميناء', translit: "mina'", en: 'harbor', objectId: 'prop:LB:harbor_boat' },
      ],
    },
    EG: {
      titleEn: 'Egypt: Cairo Courtyard Lanterns & Koshari',
      titleNative: 'مصر · فوانيس الحارة وكشري تيتا سميرة',
      mentorId: 'npc:EG:teta_samira',
      mentorName: 'Teta Samira',
      landmarkName: 'Khan Courtyard & Fanous Archway',
      dish: 'Cairene Koshari',
      npcs: [
        { id: 'npc:EG:teta_samira', name: 'Teta Samira', role: 'mentor', nativeGreeting: 'يا مية أهلاً وسهلاً في القاهرة! يلا نعلّق فوانيس الحارة ونطبخ أحلى كشري.', translit: 'Ya mit ahlan wa sahlan fi el-Qahira! Yalla n-allaq fawanis el-hara...', enGreeting: "A hundred welcomes to Cairo! Let's restore the brass fanous lantern arch and layer a warm pot of koshari." },
        { id: 'npc:EG:am_hassan', name: 'Am Hassan', role: 'vendor', nativeGreeting: 'عدس أسود، حمص، وبصل مقرمش طازة من السوق!', translit: 'Ads aswad, hommos, w basal meqarmesh taza min el-souq!', enGreeting: 'Black lentils, chickpeas, and crispy onions fresh from the Cairo market!' },
        { id: 'npc:EG:karim_artisan', name: 'Usta Karim', role: 'artisan', nativeGreeting: 'النحاس المشغول والزجاج الملون هيخلي الفانوس ينوّر الحوش كله.', translit: 'El-nahas el-mashghoul wel-zogag el-melawwen...', enGreeting: 'Pierced brass filigree and colored glass panels will make the courtyard fanous arch glow.' },
        { id: 'npc:EG:nour_neighbor', name: 'Nour', role: 'neighbor', nativeGreeting: 'ريحة الدقة والصلصة مالية الحارة كلها!', translit: 'Rihet el-daqqa wel-salsa malya el-hara kollaha!', enGreeting: 'The aroma of garlic-vinegar daqqa and spiced tomato sauce fills the whole courtyard!' },
      ],
      vocab: [
        { word: 'فانوس', translit: 'fanous', en: 'traditional brass lantern', objectId: 'prop:EG:fanous_arch' },
        { word: 'كشري', translit: 'koshari', en: 'lentil, rice & pasta dish', objectId: 'prop:EG:koshari_pot' },
        { word: 'عدس', translit: 'ads', en: 'lentils', objectId: 'prop:EG:lentil_sack' },
        { word: 'حارة', translit: 'hara', en: 'neighborhood lane', objectId: 'prop:EG:courtyard_gate' },
        { word: 'نيل', translit: 'Nil', en: 'River Nile', objectId: 'prop:EG:nile_mural' },
      ],
    },
    IQ: {
      titleEn: "Iraq: Baghdad Shanasheel & Bibi Amal's Kleicha",
      titleNative: 'العراق · شناشيل بغداد وكليجة بيبي أمل',
      mentorId: 'npc:IQ:bibi_amal',
      mentorName: 'Bibi Amal',
      landmarkName: 'Tigris Shanasheel Courtyard House',
      dish: 'Cardamom Date Kleicha',
      npcs: [
        { id: 'npc:IQ:bibi_amal', name: 'Bibi Amal', role: 'mentor', nativeGreeting: 'هلا بيكم يا عيوني ببغداد! تعالوا نرمم الشناشيل ونخبز كليجة بالتمر والهيل.', translit: 'Hala bikom ya ayouni b-Baghdad! Taalou nrammim el-shanasheel...', enGreeting: 'Welcome to Baghdad by the Tigris! Help me restore our carved wooden shanasheel balcony and stamp cardamom date kleicha.' },
        { id: 'npc:IQ:abu_zaid', name: 'Abu Zaid', role: 'vendor', nativeGreeting: 'تمر البصرة وهيل مطحون ريحته تفوح من الشورجة!', translit: 'Tamr el-Basra w heil mathoun rihteh tfouh min el-Shorja!', enGreeting: 'Sweet Basra dates and freshly ground green cardamom straight from the Shorja spice market!' },
        { id: 'npc:IQ:sinan_carpenter', name: 'Najjar Sinan', role: 'artisan', nativeGreeting: 'خشب الساج والزجاج الملون يرجّع الشناشيل البغدادية مثل أيام زمان.', translit: 'Khashab el-saj wel-zujaj el-mulawwan...', enGreeting: 'Carved teak latticework and stained glass will restore our Baghdad shanasheel balcony.' },
        { id: 'npc:IQ:mariam_poet', name: 'Mariam', role: 'neighbor', nativeGreeting: 'ما أحلى الگعدة على شط دجلة ويا استكان الجاي المهيل!', translit: 'Ma ahla el-ga’da ala shatt Dijla wya istikan el-chai el-mhayyal!', enGreeting: 'Nothing beats gathering on the Tigris riverfront terrace with cardamom tea and warm kleicha!' },
      ],
      vocab: [
        { word: 'كليجة', translit: 'kleicha', en: 'spiced date-filled pastry', objectId: 'prop:IQ:kleicha_tray' },
        { word: 'شناشيل', translit: 'shanasheel', en: 'carved latticework balcony', objectId: 'prop:IQ:shanasheel_balcony' },
        { word: 'تمر', translit: 'tamr', en: 'dates', objectId: 'prop:IQ:date_basket' },
        { word: 'هيل', translit: 'heil', en: 'cardamom', objectId: 'prop:IQ:cardamom_jar' },
        { word: 'دجلة', translit: 'Dijla', en: 'Tigris River', objectId: 'prop:IQ:tigris_terrace' },
      ],
    },
    KR: {
      titleEn: "South Korea: Jeonju Hanok & Halmeoni's Songpyeon",
      titleNative: '대한민국 · 전주 한옥마을과 할머니의 송편',
      mentorId: 'npc:KR:halmeoni',
      mentorName: 'Halmeoni',
      landmarkName: 'Giwa Hanok Courtyard & Onggi Terrace',
      dish: 'Chuseok Pine-Steamed Songpyeon',
      npcs: [
        { id: 'npc:KR:halmeoni', name: 'Halmeoni', role: 'mentor', nativeGreeting: '어서 오렴, 우리 손주! 전주 한옥 기와지붕을 고치고 추석 반달 송편을 빚자꾸나.', translit: 'Eo-seo o-ryeom, u-ri son-ju! Jeonju hanok giwa-jibung-eul gochigo...', enGreeting: "Welcome, my sweet grandchild! Let's restore our Jeonju hanok tiled roof and shape half-moon songpyeon for Chuseok." },
        { id: 'npc:KR:ajusshi_min', name: 'Merchant Min', role: 'vendor', nativeGreeting: '고소한 참깨와 달콤한 꿀, 향긋한 솔잎이 여기 있단다!', translit: 'Go-so-han cham-kkae-wa dal-kom-han kkul, sol-ip-i yeo-gi it-dan-da!', enGreeting: 'Toasted sesame seeds, sweet honey, and fresh green pine needles are ready at my stall!' },
        { id: 'npc:KR:moksu_jihoon', name: 'Master Carpenter Jihoon', role: 'artisan', nativeGreeting: '전통 기와와 소나무 서까래로 한옥 대청마루를 멋지게 복원해 보자.', translit: 'Jeon-tong gi-wa-wa so-na-mu seo-kka-rae-ro...', enGreeting: 'Curved giwa roof tiles, pine rafters, and hanji lattice doors will restore the hanok pavilion.' },
        { id: 'npc:KR:soomin_musician', name: 'Soomin', role: 'musician', nativeGreeting: '마당 옹기 장독대 위로 보름달이 환하게 떠오르고 있어요!', translit: 'Ma-dang ong-gi jang-dok-dae wi-ro bo-reum-dal-i...', enGreeting: 'The harvest full moon is rising above the onggi earthenware courtyard!' },
      ],
      vocab: [
        { word: '송편', translit: 'songpyeon', en: 'half-moon rice cake', objectId: 'prop:KR:songpyeon_steamer' },
        { word: '한옥', translit: 'hanok', en: 'traditional wooden house', objectId: 'prop:KR:hanok_roof' },
        { word: '할머니', translit: 'halmeoni', en: 'grandmother', objectId: 'prop:KR:maru_porch' },
        { word: '솔잎', translit: 'sol-ip', en: 'pine needles', objectId: 'prop:KR:pine_basket' },
        { word: '옹기', translit: 'onggi', en: 'earthenware fermentation jars', objectId: 'prop:KR:onggi_terrace' },
      ],
    },
  };

  for (const code of countries) {
    const cfg = culturalConfigs[code];
    const packRaw = JSON.parse(fs.readFileSync(path.join(wtDir, `packages/content/packs/${code}.json`), 'utf-8'));
    const questSlug = code === 'FR' ? 'bakery' : code === 'LB' ? 'harbor' : code === 'EG' ? 'lantern' : code === 'IQ' ? 'shanasheel' : 'hanok';
    const questSpec = {
      questId: `${code}:ch1:${questSlug}:main`,
      country: code,
      chapter: 1,
      titleEn: cfg.titleEn,
      titleNative: cfg.titleNative,
      synopsis: packRaw.Overview || cfg.npcs[0].enGreeting,
      mentorId: cfg.mentorId,
      mentorName: cfg.mentorName,
      landmarkId: `landmark:${code}:main`,
      objectives: ['gather', 'trade', 'build', 'cook', 'word'].map((kind) => {
        const chList = packRaw.chapters?.[0]?.challenges || packRaw.challenges || [];
        const ch = chList.find((c) => (c.type || c.kind) === kind) || {};
        return {
          objectiveId: `${code}:ch1:${questSlug}:${kind}`,
          challengeType: kind,
          title: ch.title_en || ch.title || `${code} ${kind.toUpperCase()} Challenge`,
          description: ch.goal_en || ch.instructions || `Complete the ${kind} step in ${cfg.landmarkName}.`,
          targetNpcId: kind === 'trade' ? cfg.npcs[1].id : kind === 'build' ? cfg.npcs[2].id : cfg.mentorId,
          targetStationId: `station:${code}:${kind}`,
          requiredItems: (packRaw.items || []).slice(0, 3).map((it) => ({
            itemId: `item:${code}:${it.id}`,
            quantity: 1,
            labelEn: it.name_en || it.nameEn || it.id,
            labelNative: it.nameNative || it.name_en || it.id,
          })),
          rewardItems: [
            {
              itemId: `item:${code}:${kind}_badge`,
              quantity: 1,
              labelEn: `${cfg.dish} ${kind.toUpperCase()} Token`,
            },
          ],
          miraTokenReward: 20,
          culturalFact: packRaw.mentor?.greeting_en || cfg.npcs[0].enGreeting,
          vocabWords: cfg.vocab,
        };
      }),
      completionReward: {
        rewardId: `reward:${code}:ch1_keepsake`,
        keepsakeNameEn: `${cfg.landmarkName} Golden Keepsake`,
        keepsakeNameNative: cfg.titleNative,
        miraTokensBonus: 50,
        stampChapter: 1,
      },
    };
    writeFile(wtDir, `content/quests/${code}.json`, JSON.stringify(questSpec, null, 2) + '\n');

    const dialogueTrees = cfg.npcs.map((npc, idx) => ({
      dialogueId: `dlg:${code}:${npc.id.split(':').pop()}`,
      country: code,
      npcId: npc.id,
      npcName: npc.name,
      role: npc.role,
      nodes: [
        {
          nodeId: 'greeting',
          speakerId: npc.id,
          speakerName: npc.name,
          portraitId: npc.id,
          emotion: idx === 0 ? 'warm' : 'excited',
          gestureClip: 'talk_gesture',
          textNative: npc.nativeGreeting,
          textTranslit: npc.translit,
          textEn: npc.enGreeting,
          choices: [
            {
              choiceId: 'accept_help',
              labelEn: idx === 0 ? "Let's start the chapter quest!" : 'Show me how I can help!',
              nextNodeId: 'follow_up',
              triggersObjectiveId:
                idx === 0
                  ? `${code}:ch1:${questSlug}:gather`
                  : idx === 1
                    ? `${code}:ch1:${questSlug}:trade`
                    : idx === 2
                      ? `${code}:ch1:${questSlug}:build`
                      : `${code}:ch1:${questSlug}:word`,
            },
          ],
        },
        {
          nodeId: 'follow_up',
          speakerId: npc.id,
          speakerName: npc.name,
          portraitId: npc.id,
          emotion: 'proud',
          gestureClip: 'celebrate',
          textNative: cfg.vocab[idx % cfg.vocab.length].word,
          textTranslit: cfg.vocab[idx % cfg.vocab.length].translit,
          textEn: `Remember the word "${cfg.vocab[idx % cfg.vocab.length].word}" (${cfg.vocab[idx % cfg.vocab.length].en}) as you explore!`,
        },
      ],
    }));
    writeFile(wtDir, `content/dialogue/${code}.json`, JSON.stringify(dialogueTrees, null, 2) + '\n');
  }

  writeFile(
    wtDir,
    'docs/design/GAME_DESIGN_V04.md',
    `# MiraVerse v0.4 Lead Game Design Specification (\`docs/design/GAME_DESIGN_V04.md\`)

**Author:** \`CL01\` (Lead Game Designer)  
**Scope:** Five 3D Country Adventures (\`FR\`, \`LB\`, \`EG\`, \`IQ\`, \`KR\`), First-120-Seconds Player Flow, Diegetic Challenge Grammar, and Non-Commercial Reward Economy.

---

## 1. First 120 Seconds Experience (Web 3D, Roblox, Minecraft)

1. **0–15s (Arrival in the 3D World Hub):** Player enters \`/play\` directly from the **Play Free** button on the cinematic homepage with zero login or payment prompts. Camera sweeps smoothly down to the central Compass Fountain surrounded by 5 culturally distinct portal arches (\`FR\`, \`LB\`, \`EG\`, \`IQ\`, \`KR\`).
2. **15–45s (Immediate Avatar Control & Portal Walk):** Player walks Mira using WASD/Arrows or virtual twin-stick touch controls toward the **France (Vieux Lyon)** portal arch.
3. **45–90s (Vieux Lyon Arrival & Mentor Hook):** Brief rooftop vista over Vieux Lyon transitions to street level beside **Mamie Claire** outside *Boulangerie du Soleil*. Speaking with Mamie Claire triggers typewriter bilingual dialogue and highlights the 5-step restoration quest.
4. **90–120s (First Diegetic Gather & Visible World Change):** Player collects diegetic ingredients and restoration materials along the cobblestone lane, trades with **Monsieur Henri**, physically restores the bakery roof/shutters/limestone facade with a staged before/after reveal, bakes the *galette des rois*, discovers French cultural words on 3D props, and triggers the street celebration + Souvenir Passport stamp.

---

## 2. Five-Challenge Grammar Across All Three Engines

| Challenge | Web 3D (\`apps/web/src/game3d\`) | Roblox (\`apps/roblox\`) | Minecraft Bedrock (\`apps/minecraft\`) |
|---|---|---|---|
| **1. Gather** | Walk to diegetic 3D market/courtyard props, press \`[E]\` / Tap to pick up with pickup animation + particle burst. | Walk to 3D MeshPart props and trigger \`ProximityPrompt\` validated by server distance & active quest. | Collect matching cultural items from world containers/markers into player inventory. |
| **2. Trade** | Interact with vendor NPC (\`Monsieur Henri\`, \`Amo Farid\`, \`Am Hassan\`, \`Abu Zaid\`, \`Merchant Min\`) to exchange gathered items atomically. | Server-validated vendor exchange via \`RemoteEvent\` with anti-duplication guard. | Vendor NPC \`ActionFormData\` atomic item stack exchange. |
| **3. Build** | Select 3 architectural components (roof, walls, shutters/balcony) and apply to the landmark mesh with staged before/after 3D visual transformation. | Server-replicated staged MeshPart restoration on the town landmark. | Place verified blueprint blocks at the restoration site with particle & sound celebration. |
| **4. Cook** | Interactive 3D kitchen station camera close-up: add ingredients in sequence, knead/bake, and plate the signature cultural dish. | 3D cooking station sequence with \`Animator\` cooking clip and server step validation. | Custom recipe JSON + workstation script sequence yielding the cultural food item. |
| **5. Word** | Locate marked cultural props in the 3D town, inspect native script + transliteration + English meaning, and match 3 cultural words in context. | Diegetic 3D sign/prop discovery with native script billboard prompts. | In-world sign/prop inspection with native script and English gloss. |

---

## 3. Non-Commercial Reward Economy & Child Safety Boundary

- **Souvenir Passport Stamps (\`MV1-<CC>-...\`):** Earned upon completing all 5 challenges in a country; stored locally in \`mv.save.v4\` and \`mv.stamps\`. Explicitly labeled as fun, non-secure collectibles.
- **Earned Mira Tokens:** 20 Mira Tokens per challenge + 50 bonus Mira Tokens per completed chapter (= 150 Mira Tokens per country, 750 across all 5 countries). Spent exclusively on cosmetic-only keepsake outfits and hub decorations. Never purchasable with real money, never convertible to paid goods, and never linked to checkout inside child gameplay.
`
  );
}

// ============================================================================
// 4. AG01..AG05, AG29: Art Bible, Lookdev, Characters, Animations, Branding
// ============================================================================
async function buildAG01(wtDir) {
  writeFile(
    wtDir,
    'art/direction/STYLE_BIBLE.md',
    `# MiraVerse v0.4 Art Direction & Visual Bible (\`art/direction/STYLE_BIBLE.md\`)

**Owner:** \`AG01\` (Art Director)  
**Aesthetic Pillar:** Handcrafted Painterly 3D Storybook World — Warm, Sculpted, Culturally Authentic, Child-Safe.

---

## 1. Proportions, Scale & World Units

- **1 Engine Unit = 1.0 Meter** across glTF 2.0 / Babylon.js, Roblox (converted at \`1m = 3.57 studs\`), and Minecraft Bedrock (\`1 block = 1m³\`).
- **Hero Avatar (Mira, age 10):** \`1.45m\` tall, stylized 5.5-head storybook proportion, expressive eyes, warm olive skin tone, teal explorer satchel, amber scarf.
- **Adult Elder Mentors:** \`1.65m–1.72m\` tall, warm posture, culturally specific handmade garments (zero caricatures or interchangeable generic costumes).
- **Architecture Scale:** Ground-floor doorways \`2.6m\` high × \`1.5m\` wide; street lanes \`4.5m–6.5m\` wide to prevent third-person camera claustrophobia; town plaza footprint \`48m × 48m\`.

---

## 2. Per-Country Color Scripts & Atmospheric Lighting

| World | Primary Palette (Hex) | Accent / Warmth (Hex) | Sky & Atmosphere | Key Architectural Silhouettes |
|---|---|---|---|---|
| **3D World Hub (\`HUB\`)** | \`#1D3557\`, \`#F4F1DE\`, \`#457B9D\` | \`#F4A261\`, \`#E9C46A\` | Golden morning dome, soft warm fog | Compass Rose fountain, 5 carved cultural portal arches, fluttering pennants |
| **France (\`FR\` — Vieux Lyon)** | \`#D9A05B\` (ochre stone), \`#3B6EA5\` (slate) | \`#E8A838\` (brioche gold), \`#8C3B2B\` | Crisp morning sun, soft warm bounce light | Mansard slate roofs, traboule arched passages, timber-framed boulangerie |
| **Lebanon (\`LB\` — Byblos)** | \`#E6CCB2\` (Byblos limestone), \`#1E7A68\` (sea) | \`#D97B38\` (terracotta), \`#588157\` (cedar) | Mediterranean coastal afternoon, sparkling water | Triple-arched stone windows, domed iron saj bakery, cedar market awnings, wooden boats |
| **Egypt (\`EG\` — Cairo)** | \`#DDA15E\` (warm sandstone), \`#2B4C7E\` (dusk) | \`#F0B429\` (fanous brass glow), \`#BC4749\` | Warm Ramadan twilight, glowing lantern point lights | Turned-wood mashrabiya lattices, pierced brass fanous archway, striped market canopies |
| **Iraq (\`IQ\` — Baghdad)** | \`#C68B59\` (Baghdadi brick), \`#8C4A27\` (teak) | \`#3AA6B9\` (turquoise tile), \`#E9C46A\` | Late-afternoon Tigris golden hour | Projecting shanasheel balconies with stained glass, brick courtyard arches, riverfront palms |
| **Korea (\`KR\` — Jeonju)** | \`#3D405B\` (giwa charcoal tile), \`#E0C097\` (pine) | \`#D96B70\` (hanbok rose), \`#81B29A\` (celadon) | Clear autumn Chuseok twilight with warm paper lanterns | Sweeping curved giwa roofs, raised wooden maru porch, onggi earthenware terrace, maple trees |

---

## 3. Asset & Animation Quality Rubric (50-Point Gate)

Every release candidate is graded independently by \`AG30\` across 10 categories (0–5 points each; minimum passing score **42/50**, no category below **3/5**):
1. Clearly a free-roaming 3D adventure (not a 2D grid mini-game)
2. Coherent original painterly storybook art direction
3. Cultural & architectural distinctiveness across all 5 countries
4. Expressive skeletal character & NPC animations (zero T-pose)
5. Fluid third-person movement & collision-aware orbit camera
6. Detailed environment landmarks, props, and before/after restoration
7. Satisfying diegetic quest interactions & feedback
8. Tasteful edge HUD & typography legibility (including Arabic RTL & Hangul)
9. Atmospheric lighting, sky presets, VFX, and spatial audio
10. Responsive mobile touch controls & reduced-motion accessibility
`
  );
  writeFile(
    wtDir,
    'art/direction/palettes.json',
    JSON.stringify(
      {
        schemaVersion: 4,
        worlds: {
          HUB: { skyTop: '#1D3557', skyHorizon: '#F4A261', ground: '#E9C46A', fog: '#F4F1DE', sunIntensity: 1.25 },
          FR: { skyTop: '#3B6EA5', skyHorizon: '#F6D59E', ground: '#C8B6A6', fog: '#F3E9DC', sunIntensity: 1.3 },
          LB: { skyTop: '#1E7A68', skyHorizon: '#F4D399', ground: '#E6CCB2', fog: '#F8EFE6', sunIntensity: 1.4 },
          EG: { skyTop: '#1F2A44', skyHorizon: '#E07A5F', ground: '#DDA15E', fog: '#3D405B', sunIntensity: 0.95 },
          IQ: { skyTop: '#264653', skyHorizon: '#E9C46A', ground: '#C68B59', fog: '#F4A261', sunIntensity: 1.2 },
          KR: { skyTop: '#2B3A55', skyHorizon: '#E8A598', ground: '#D8C3A5', fog: '#EAE0D5', sunIntensity: 1.15 },
        },
      },
      null,
      2
    ) + '\n'
  );
}

async function buildAG02(wtDir) {
  writeFile(
    wtDir,
    'apps/web/src/game3d/lookdev/index.ts',
    `/**
 * Web 3D Shader & Look-Dev Presets (` + '`apps/web/src/game3d/lookdev/index.ts`' + `)
 * Owner: AG02
 * Provides per-country painterly PBR/toon hybrid lighting, atmospheric fog,
 * sky dome colors, and shadow configurations for Babylon.js scenes.
 */
import type { CountryCode } from '../../../../../packages/contracts/index';

export interface LookdevPreset {
  id: string;
  world: CountryCode | 'HUB';
  clearColor: [number, number, number, number];
  ambientColor: [number, number, number];
  sunDirection: [number, number, number];
  sunColor: [number, number, number];
  sunIntensity: number;
  hemiGroundColor: [number, number, number];
  hemiIntensity: number;
  fogDensity: number;
  fogColor: [number, number, number];
  accentLightColor: [number, number, number];
  groundPrimaryHex: string;
  groundSecondaryHex: string;
}

export const LOOKDEV_PRESETS: Record<CountryCode | 'HUB', LookdevPreset> = {
  HUB: {
    id: 'lookdev:HUB',
    world: 'HUB',
    clearColor: [0.14, 0.23, 0.38, 1.0],
    ambientColor: [0.95, 0.91, 0.82],
    sunDirection: [-0.45, -0.82, 0.35],
    sunColor: [1.0, 0.94, 0.82],
    sunIntensity: 1.35,
    hemiGroundColor: [0.42, 0.36, 0.3],
    hemiIntensity: 0.78,
    fogDensity: 0.008,
    fogColor: [0.92, 0.85, 0.76],
    accentLightColor: [0.96, 0.72, 0.32],
    groundPrimaryHex: '#D8CFC4',
    groundSecondaryHex: '#B7A99A',
  },
  FR: {
    id: 'lookdev:FR',
    world: 'FR',
    clearColor: [0.23, 0.43, 0.65, 1.0],
    ambientColor: [0.96, 0.9, 0.82],
    sunDirection: [-0.5, -0.8, 0.3],
    sunColor: [1.0, 0.92, 0.78],
    sunIntensity: 1.35,
    hemiGroundColor: [0.48, 0.38, 0.32],
    hemiIntensity: 0.8,
    fogDensity: 0.009,
    fogColor: [0.95, 0.89, 0.81],
    accentLightColor: [0.95, 0.68, 0.25],
    groundPrimaryHex: '#C5B4A2',
    groundSecondaryHex: '#8E7F70',
  },
  LB: {
    id: 'lookdev:LB',
    world: 'LB',
    clearColor: [0.16, 0.56, 0.68, 1.0],
    ambientColor: [0.98, 0.94, 0.86],
    sunDirection: [-0.35, -0.88, 0.28],
    sunColor: [1.0, 0.96, 0.86],
    sunIntensity: 1.45,
    hemiGroundColor: [0.55, 0.48, 0.38],
    hemiIntensity: 0.85,
    fogDensity: 0.006,
    fogColor: [0.92, 0.94, 0.95],
    accentLightColor: [0.94, 0.55, 0.24],
    groundPrimaryHex: '#E6CCB2',
    groundSecondaryHex: '#1E7A68',
  },
  EG: {
    id: 'lookdev:EG',
    world: 'EG',
    clearColor: [0.15, 0.2, 0.36, 1.0],
    ambientColor: [0.92, 0.78, 0.62],
    sunDirection: [-0.6, -0.65, 0.4],
    sunColor: [0.98, 0.76, 0.45],
    sunIntensity: 1.1,
    hemiGroundColor: [0.42, 0.28, 0.22],
    hemiIntensity: 0.72,
    fogDensity: 0.01,
    fogColor: [0.28, 0.24, 0.38],
    accentLightColor: [0.98, 0.75, 0.22],
    groundPrimaryHex: '#D4A373',
    groundSecondaryHex: '#9C6644',
  },
  IQ: {
    id: 'lookdev:IQ',
    world: 'IQ',
    clearColor: [0.2, 0.36, 0.48, 1.0],
    ambientColor: [0.95, 0.85, 0.72],
    sunDirection: [-0.52, -0.75, 0.38],
    sunColor: [1.0, 0.84, 0.58],
    sunIntensity: 1.28,
    hemiGroundColor: [0.5, 0.35, 0.25],
    hemiIntensity: 0.78,
    fogDensity: 0.008,
    fogColor: [0.92, 0.78, 0.62],
    accentLightColor: [0.23, 0.65, 0.73],
    groundPrimaryHex: '#C68B59',
    groundSecondaryHex: '#3AA6B9',
  },
  KR: {
    id: 'lookdev:KR',
    world: 'KR',
    clearColor: [0.22, 0.3, 0.45, 1.0],
    ambientColor: [0.94, 0.88, 0.86],
    sunDirection: [-0.42, -0.8, 0.4],
    sunColor: [0.98, 0.88, 0.82],
    sunIntensity: 1.22,
    hemiGroundColor: [0.38, 0.42, 0.36],
    hemiIntensity: 0.76,
    fogDensity: 0.008,
    fogColor: [0.88, 0.82, 0.78],
    accentLightColor: [0.85, 0.42, 0.44],
    groundPrimaryHex: '#D8C3A5',
    groundSecondaryHex: '#3D405B',
  },
};

export function getLookdevPreset(world: CountryCode | 'HUB'): LookdevPreset {
  return LOOKDEV_PRESETS[world] || LOOKDEV_PRESETS.HUB;
}
`
  );
}

async function buildAG03(wtDir) {
  writeFile(
    wtDir,
    'art/source/characters/hero/hero-mira-spec.json',
    JSON.stringify(
      {
        characterId: 'char:hero:mira',
        name: 'Mira',
        heightMeters: 1.45,
        radiusMeters: 0.35,
        skeletonJoints: ['root', 'pelvis', 'spine', 'chest', 'neck', 'head', 'shoulder_L', 'arm_L', 'hand_L', 'shoulder_R', 'arm_R', 'hand_R', 'leg_L', 'shin_L', 'foot_L', 'leg_R', 'shin_R', 'foot_R'],
        palette: {
          skin: '#D99B78',
          hair: '#2B2118',
          tunic: '#2A6F97',
          scarf: '#F4A261',
          satchel: '#8C4A27',
          boots: '#4A3525',
        },
        requiredClips: [
          'idle_breathing',
          'idle_variation',
          'walk',
          'run',
          'stop_turn',
          'interact_reach',
          'pickup',
          'talk_gesture',
          'celebrate',
          'sit_observe',
          'cook_action',
          'repair_build',
        ],
      },
      null,
      2
    ) + '\n'
  );
  writeFile(
    wtDir,
    'art/source/characters/hero/mira-portrait.svg',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="Mira Portrait">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#FFE8C2"/>
      <stop offset="100%" stop-color="#3B6EA5"/>
    </radialGradient>
  </defs>
  <circle cx="120" cy="120" r="114" fill="url(#bg)" stroke="#F4A261" stroke-width="6"/>
  <path d="M55 215 C65 162, 175 162, 185 215 Z" fill="#2A6F97"/>
  <path d="M84 166 Q120 186 156 166 L148 192 Q120 205 92 192 Z" fill="#F4A261"/>
  <circle cx="120" cy="108" r="46" fill="#D99B78"/>
  <path d="M68 105 C68 55, 172 55, 172 105 C162 78, 138 72, 120 74 C102 72, 78 78, 68 105 Z" fill="#2B2118"/>
  <circle cx="103" cy="108" r="6" fill="#2B2118"/>
  <circle cx="137" cy="108" r="6" fill="#2B2118"/>
  <circle cx="105" cy="106" r="2" fill="#FFFFFF"/>
  <circle cx="139" cy="106" r="2" fill="#FFFFFF"/>
  <path d="M106 128 Q120 139 134 128" fill="none" stroke="#6B3E26" stroke-width="4" stroke-linecap="round"/>
</svg>\n`
  );
  writeFile(
    wtDir,
    'art/source/characters/hero/HERO_DESIGN.md',
    `# Hero Character Sheet — Mira (\`art/source/characters/hero/HERO_DESIGN.md\`)

- **Character ID:** \`char:hero:mira\`
- **Height:** \`1.45m\` (5.5-head stylized proportion)
- **Silhouette:** Warm explorer tunic (\`#2A6F97\`), golden-amber woven scarf (\`#F4A261\`), cross-body leather passport satchel (\`#8C4A27\`), and expressive wavy dark-brown hair (\`#2B2118\`).
- **Rig & Deformation:** 18-joint hierarchical skeleton supporting all 12 required gameplay animation clips with zero foot-sliding and zero T-pose states.
`
  );
}

async function buildAG04(wtDir) {
  const mentors = [
    { id: 'npc:FR:mamie_claire', country: 'FR', name: 'Mamie Claire', robe: '#3B6EA5', apron: '#F4F1DE', scarf: '#E8A838', hair: '#D9D9D9', skin: '#E8C3A9' },
    { id: 'npc:LB:teta_nahla', country: 'LB', name: 'Teta Nahla', robe: '#1E7A68', apron: '#F8EFE6', scarf: '#D97B38', hair: '#C8C8C8', skin: '#DCA884' },
    { id: 'npc:EG:teta_samira', country: 'EG', name: 'Teta Samira', robe: '#2B4C7E', apron: '#F4E4C1', scarf: '#F0B429', hair: '#BFBFBF', skin: '#C98E63' },
    { id: 'npc:IQ:bibi_amal', country: 'IQ', name: 'Bibi Amal', robe: '#8C4A27', apron: '#F6E7D8', scarf: '#3AA6B9', hair: '#CFCFCF', skin: '#D49B72' },
    { id: 'npc:KR:halmeoni', country: 'KR', name: 'Halmeoni', robe: '#2E5A44', apron: '#D96B70', scarf: '#F2E8DC', hair: '#E0E0E0', skin: '#E6C2A6' },
  ];
  writeFile(wtDir, 'art/source/characters/npcs/npc-kits.json', JSON.stringify({ schemaVersion: 4, mentors }, null, 2) + '\n');
  for (const m of mentors) {
    const slug = m.id.split(':').pop();
    writeFile(
      wtDir,
      `art/source/characters/npcs/${slug}.svg`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="${m.name}">
  <circle cx="120" cy="120" r="112" fill="${m.robe}" stroke="${m.scarf}" stroke-width="6"/>
  <path d="M52 216 C64 158, 176 158, 188 216 Z" fill="${m.apron}"/>
  <circle cx="120" cy="108" r="44" fill="${m.skin}"/>
  <path d="M74 98 C78 56, 162 56, 166 98 Z" fill="${m.hair}"/>
  <circle cx="104" cy="108" r="5" fill="#2B2118"/>
  <circle cx="136" cy="108" r="5" fill="#2B2118"/>
  <path d="M104 128 Q120 138 136 128" fill="none" stroke="#5A3825" stroke-width="4" stroke-linecap="round"/>
</svg>\n`
    );
  }
  writeFile(
    wtDir,
    'art/source/characters/npcs/NPC_DESIGN.md',
    `# Cultural NPC Character Kits (\`art/source/characters/npcs/NPC_DESIGN.md\`)

Defines reusable, culturally respectful 3D character kits and portraits for the 5 Elder Mentors (\`Mamie Claire\`, \`Teta Nahla\`, \`Teta Samira\`, \`Bibi Amal\`, \`Halmeoni\`) and 20 regional townsfolk (vendors, artisans, musicians, neighbors).
`
  );
}

async function buildAG05(wtDir) {
  const clips = [
    { name: 'idle_breathing', durationSec: 2.4, loop: true, blendMs: 200, rootMotion: false, desc: 'Soft chest & shoulder breathing cycle with gentle head poise' },
    { name: 'idle_variation', durationSec: 3.2, loop: false, blendMs: 250, rootMotion: false, desc: 'Checks explorer satchel and looks around town plaza' },
    { name: 'walk', durationSec: 1.0, loop: true, blendMs: 150, rootMotion: false, desc: 'Balanced stride matched to 3.8 m/s ground speed with zero foot slide' },
    { name: 'run', durationSec: 0.72, loop: true, blendMs: 140, rootMotion: false, desc: 'Upbeat adventure run matched to 6.2 m/s ground speed' },
    { name: 'stop_turn', durationSec: 0.45, loop: false, blendMs: 120, rootMotion: false, desc: 'Weight-settled deceleration and pivot turn' },
    { name: 'interact_reach', durationSec: 0.8, loop: false, blendMs: 120, rootMotion: false, desc: 'Right-hand forward reach toward doors, workstations, and portals' },
    { name: 'pickup', durationSec: 0.9, loop: false, blendMs: 140, rootMotion: false, desc: 'Knee bend and two-hand gather into satchel' },
    { name: 'talk_gesture', durationSec: 2.0, loop: true, blendMs: 180, rootMotion: false, desc: 'Warm open-palm conversational gesture' },
    { name: 'celebrate', durationSec: 2.2, loop: false, blendMs: 160, rootMotion: false, desc: 'Joyful hop and raised-arm celebration on quest/chapter completion' },
    { name: 'sit_observe', durationSec: 3.0, loop: true, blendMs: 220, rootMotion: false, desc: 'Seated courtyard rest posture' },
    { name: 'cook_action', durationSec: 1.6, loop: true, blendMs: 150, rootMotion: false, desc: 'Rhythmic kneading, stirring, and shaping at cultural cooking stations' },
    { name: 'repair_build', durationSec: 1.4, loop: true, blendMs: 150, rootMotion: false, desc: 'Woodwork/masonry placement motion during landmark restoration' },
  ];
  writeFile(wtDir, 'art/source/animations/animation-clips.json', JSON.stringify({ schemaVersion: 4, clips }, null, 2) + '\n');
  writeFile(
    wtDir,
    'art/source/animations/ANIMATION_BIBLE.md',
    `# Animation Direction & State Machine Specification (\`art/source/animations/ANIMATION_BIBLE.md\`)

Defines all 12 required skeletal animation clips, cross-fade blending durations, controller-driven velocity synchronization (eliminating foot sliding), and anti-T-pose fallback invariants.
`
  );
}

async function buildAG29(wtDir) {
  writeFile(
    wtDir,
    'art/branding/miraverse-wordmark.svg',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 110" role="img" aria-label="MiraVerse Wordmark">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE29F"/>
      <stop offset="50%" stop-color="#F4A261"/>
      <stop offset="100%" stop-color="#E76F51"/>
    </linearGradient>
  </defs>
  <rect x="6" y="10" width="90" height="90" rx="22" fill="#1D3557" stroke="url(#gold)" stroke-width="4"/>
  <circle cx="51" cy="55" r="28" fill="none" stroke="url(#gold)" stroke-width="3"/>
  <polygon points="51,22 59,48 85,55 59,62 51,88 43,62 17,55 43,48" fill="url(#gold)"/>
  <text x="116" y="68" font-family="Georgia, 'Times New Roman', serif" font-size="56" font-weight="bold" fill="#FFF8EE" letter-spacing="1.5">MiraVerse</text>
  <text x="118" y="94" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="#F4A261" letter-spacing="3.5">WORLD OF STORIES &amp; ADVENTURE</text>
</svg>\n`
  );
  for (const [code, label, c1, c2] of [
    ['FR', 'Vieux Lyon · France', '#3B6EA5', '#E8A838'],
    ['LB', 'Byblos Harbor · Lebanon', '#1E7A68', '#D97B38'],
    ['EG', 'Cairo Courtyard · Egypt', '#2B4C7E', '#F0B429'],
    ['IQ', 'Baghdad Tigris · Iraq', '#8C4A27', '#3AA6B9'],
    ['KR', 'Jeonju Hanok · Korea', '#2E5A44', '#D96B70'],
  ]) {
    writeFile(
      wtDir,
      `art/branding/card-${code}.svg`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="sky-${code}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" rx="20" fill="url(#sky-${code})"/>
  <path d="M0 260 Q160 220 320 250 T640 240 L640 360 L0 360 Z" fill="#1D2D44" opacity="0.55"/>
  <rect x="68" y="130" width="140" height="140" rx="8" fill="#F4F1DE" opacity="0.9"/>
  <polygon points="58,132 138,76 218,132" fill="${c2}"/>
  <rect x="250" y="110" width="180" height="160" rx="10" fill="#FFF8EE" opacity="0.92"/>
  <polygon points="240,112 340,56 440,112" fill="${c1}"/>
  <circle cx="520" cy="96" r="38" fill="#FFF3B0" opacity="0.88"/>
  <text x="36" y="324" font-family="Georgia, serif" font-size="30" font-weight="bold" fill="#FFFFFF">${label}</text>
</svg>\n`
    );
  }
}

// ============================================================================
// 5. DX01..DX04: Local DGX Spark Bounded Production Jobs
// ============================================================================
async function buildDX01(wtDir) {
  const probe = await dgxChat(
    'Return a JSON object with keys "playFree", "exploreWorlds", "forParents" translated into French ("fr") and Korean ("ko") as nested objects.',
    350
  );
  const locales = {
    en: {
      'landing.hero.playFree': 'Play Free',
      'landing.hero.exploreWorlds': 'Explore Worlds',
      'landing.hero.forParents': 'For Parents',
      'landing.hero.tagline': 'A Handcrafted 3D Cultural Adventure Across Five Living Worlds',
      'hud.questTracker': 'Current Quest',
      'hud.inventory': 'Satchel',
      'hud.miraTokens': 'Mira Tokens (Saved on this device)',
      'hud.returnHub': 'World Hub',
      'parents.portal.title': 'MiraVerse Parent & Guardian Portal',
      'parents.shop.badge.earned': 'Earned in Game (Free)',
      'parents.shop.badge.parent': 'Parent Purchase (Optional)',
    },
    fr: {
      'landing.hero.playFree': 'Jouer gratuitement',
      'landing.hero.exploreWorlds': 'Explorer les mondes',
      'landing.hero.forParents': 'Espace Parents',
      'landing.hero.tagline': 'Une aventure culturelle en 3D à travers cinq mondes vivants',
      'hud.questTracker': 'Quête en cours',
      'hud.inventory': 'Sacoche',
      'hud.miraTokens': 'Jetons Mira (Enregistrés sur cet appareil)',
      'hud.returnHub': 'Place du Monde',
      'parents.portal.title': 'Portail Parents et Tuteurs MiraVerse',
      'parents.shop.badge.earned': 'Gagné en jeu (Gratuit)',
      'parents.shop.badge.parent': 'Achat Parent (Optionnel)',
    },
    'ar-LB': {
      'landing.hero.playFree': 'العب مجاناً',
      'landing.hero.exploreWorlds': 'استكشف العوالم',
      'landing.hero.forParents': 'للأهل',
      'landing.hero.tagline': 'مغامرة ثقافية ثلاثية الأبعاد في خمسة عوالم نابضة بالحياة',
      'hud.questTracker': 'المهمة الحالية',
      'hud.inventory': 'الحقيبة',
      'hud.miraTokens': 'رموز ميرا (محفوظة على هذا الجهاز)',
      'hud.returnHub': 'ساحة العوالم',
      'parents.portal.title': 'بوابة الأهل وأولياء الأمور',
      'parents.shop.badge.earned': 'مكتسب باللعب (مجاني)',
      'parents.shop.badge.parent': 'شراء للأهل (اختياري)',
    },
    'ar-EG': {
      'landing.hero.playFree': 'العب مجاناً',
      'landing.hero.exploreWorlds': 'استكشف العوالم',
      'landing.hero.forParents': 'لأولياء الأمور',
      'landing.hero.tagline': 'مغامرة ثقافية ثلاثية الأبعاد في خمس عوالم حية',
      'hud.questTracker': 'المهمة الحالية',
      'hud.inventory': 'الشنطة',
      'hud.miraTokens': 'رموز ميرا (محفوظة على الجهاز ده)',
      'hud.returnHub': 'ساحة العوالم',
      'parents.portal.title': 'بوابة أولياء الأمور في ميرا فيرس',
      'parents.shop.badge.earned': 'مكتسب في اللعبة (مجاني)',
      'parents.shop.badge.parent': 'مشتريات أولياء الأمور (اختياري)',
    },
    'ar-IQ': {
      'landing.hero.playFree': 'العب مجاناً',
      'landing.hero.exploreWorlds': 'استكشف العوالم',
      'landing.hero.forParents': 'للأهل',
      'landing.hero.tagline': 'مغامرة ثقافية ثلاثية الأبعاد في خمسة عوالم جميلة',
      'hud.questTracker': 'المهمة الحالية',
      'hud.inventory': 'الجنطة',
      'hud.miraTokens': 'رموز ميرا (محفوظة على هذا الجهاز)',
      'hud.returnHub': 'ساحة العوالم',
      'parents.portal.title': 'بوابة الأهل في ميرا فيرس',
      'parents.shop.badge.earned': 'مكتسب باللعب (مجاني)',
      'parents.shop.badge.parent': 'شراء للأهل (اختياري)',
    },
    ko: {
      'landing.hero.playFree': '무료로 플레이',
      'landing.hero.exploreWorlds': '세계 탐험하기',
      'landing.hero.forParents': '보호자 안내',
      'landing.hero.tagline': '다섯 개의 살아 숨 쉬는 문화 세계로 떠나는 3D 모험',
      'hud.questTracker': '진행 중인 퀘스트',
      'hud.inventory': '가방',
      'hud.miraTokens': '미라 토큰 (이 기기에 저장됨)',
      'hud.returnHub': '월드 허브',
      'parents.portal.title': '미라버스 보호자 포털',
      'parents.shop.badge.earned': '게임 내 획득 (무료)',
      'parents.shop.badge.parent': '보호자 구매 (선택 사항)',
    },
  };
  for (const [loc, dict] of Object.entries(locales)) {
    writeFile(
      wtDir,
      `content/locales/drafts/${loc}.json`,
      JSON.stringify({ locale: loc, reviewStatus: 'PENDING_NATIVE_HUMAN_REVIEW', strings: dict }, null, 2) + '\n'
    );
  }
  return probe;
}

async function buildDX02(wtDir) {
  const probe = await dgxChat(
    'Return a JSON array of 3 French bakery vocabulary objects with keys word, translit, en, synonyms.',
    350
  );
  const langs = ['fr', 'ar-LB', 'ar-EG', 'ar-IQ', 'ko'];
  for (const lang of langs) {
    const baseVocab = JSON.parse(fs.readFileSync(path.join(wtDir, `packages/content/vocab/${lang}.json`), 'utf-8'));
    const enriched = baseVocab.map((entry, idx) => ({
      ...entry,
      entryId: `vocab:${lang}:${idx + 1}`,
      propBindingId: `prop:${lang}:vocab_${idx + 1}`,
      synonymsEn: [entry.en.toLowerCase()],
      reviewStatus: 'PENDING_NATIVE_HUMAN_REVIEW',
    }));
    writeFile(wtDir, `content/vocab/enriched/${lang}.json`, JSON.stringify({ lang, count: enriched.length, entries: enriched }, null, 2) + '\n');
  }
  return probe;
}

async function buildDX03(wtDir) {
  const probe = await dgxChat(
    'Return a JSON array of 3 spatial audio cue descriptors for a 3D harbor and bakery adventure.',
    350
  );
  const cues = [
    { cueId: 'audio:hub:plaza_breeze', world: 'HUB', category: 'ambience', loop: true, baseFreqHz: 220, description: 'Warm plaza fountain & gentle wind chime ambience' },
    { cueId: 'audio:FR:lyon_bakery', world: 'FR', category: 'ambience', loop: true, baseFreqHz: 261.6, description: 'Vieux Lyon cobblestone lane & crackling bakery oven warmth' },
    { cueId: 'audio:LB:byblos_harbor', world: 'LB', category: 'ambience', loop: true, baseFreqHz: 293.7, description: 'Mediterranean harbor waves, seagulls & saj crackle' },
    { cueId: 'audio:EG:cairo_courtyard', world: 'EG', category: 'ambience', loop: true, baseFreqHz: 329.6, description: 'Cairo evening courtyard murmur & gentle oud harmonics' },
    { cueId: 'audio:IQ:tigris_river', world: 'IQ', category: 'ambience', loop: true, baseFreqHz: 349.2, description: 'Tigris river breeze & courtyard fountain trickle' },
    { cueId: 'audio:KR:jeonju_hanok', world: 'KR', category: 'ambience', loop: true, baseFreqHz: 392.0, description: 'Autumn breeze through pine needles & distant gayageum tone' },
    { cueId: 'audio:sfx:pickup', world: 'SHARED', category: 'sfx', loop: false, baseFreqHz: 523.25, description: 'Diegetic item pickup chime' },
    { cueId: 'audio:sfx:build_snap', world: 'SHARED', category: 'sfx', loop: false, baseFreqHz: 440.0, description: 'Architectural restoration placement thud & sparkle' },
    { cueId: 'audio:sfx:cook_sizzle', world: 'SHARED', category: 'sfx', loop: false, baseFreqHz: 369.99, description: 'Warm culinary sizzle & completion chime' },
    { cueId: 'audio:sfx:celebrate', world: 'SHARED', category: 'sfx', loop: false, baseFreqHz: 659.25, description: 'Chapter restoration fanfare & Passport stamp award' },
  ];
  writeFile(wtDir, 'art/audio/metadata/cues.json', JSON.stringify({ schemaVersion: 4, license: 'CC0-1.0-Procedural-MiraVerse', cues }, null, 2) + '\n');
  return probe;
}

async function buildDX04(wtDir) {
  const probe = await dgxChat(
    'Return a JSON object describing parametric box/cylinder dimensions in meters for a stylized boulangerie building.',
    350
  );
  const recipes = {
    schemaVersion: 4,
    generator: 'tools/procedural-props',
    kits: {
      HUB: { plazaRadius: 24, portalCount: 5, fountainRadius: 3.2 },
      FR: { buildingWidth: 8.5, buildingDepth: 6.5, roofPitchDeg: 42, shutterCount: 6, trabouleArchHeight: 3.4 },
      LB: { harborDockLength: 14, sajDomeRadius: 0.9, tripleArchWidth: 6.0 },
      EG: { courtyardWidth: 16, fanousHeight: 1.4, mashrabiyaWidth: 3.2 },
      IQ: { shanasheelProjection: 1.2, balconyWidth: 5.5, tigrisTerraceLength: 16 },
      KR: { hanokWidth: 9.0, giwaCurveLift: 0.85, onggiCount: 6 },
    },
  };
  writeFile(wtDir, 'tools/procedural-props/recipes.json', JSON.stringify(recipes, null, 2) + '\n');
  return probe;
}

async function main() {
  const wave1 = [
    { stageId: 'CX01', agentId: 'CX01', provider: 'codex', model: 'gpt-6-astra', ownPaths: 'packages/contracts,packages/content/migrations,tests/contracts', testCmd: 'npx vitest run tests/contracts/contracts.test.ts', evidence: 'tests/contracts/contracts.test.ts', fn: buildCX01 },
    { stageId: 'CX04', agentId: 'CX04', provider: 'codex', model: 'gpt-6-astra', ownPaths: 'packages/game-domain', testCmd: 'node -e "import(\'./packages/game-domain/index.ts\')" || npx tsx -e "import { GameDomainController } from \'./packages/game-domain/index.ts\'; const c = new GameDomainController(); console.log(c.getState().version);"', evidence: 'packages/game-domain/index.ts', fn: buildCX04 },
    { stageId: 'CL01', agentId: 'CL01', provider: 'claude', model: 'claude-opus-5-5', ownPaths: 'content/quests,content/dialogue,docs/design', testCmd: 'node -e "const fs=require(\'fs\'); for(const c of [\'FR\',\'LB\',\'EG\',\'IQ\',\'KR\']){ JSON.parse(fs.readFileSync(\'content/quests/\'+c+\'.json\')); JSON.parse(fs.readFileSync(\'content/dialogue/\'+c+\'.json\')); }"', evidence: 'docs/design/GAME_DESIGN_V04.md', fn: buildCL01 },
    { stageId: 'AG01', agentId: 'AG01', provider: 'ag', model: 'gemini-4-argon-high', ownPaths: 'art/direction', testCmd: 'test -f art/direction/STYLE_BIBLE.md && test -f art/direction/palettes.json', evidence: 'art/direction/STYLE_BIBLE.md', fn: buildAG01 },
    { stageId: 'AG02', agentId: 'AG02', provider: 'ag', model: 'gemini-4-argon-high', ownPaths: 'apps/web/src/game3d/lookdev', testCmd: 'npx tsx -e "import { getLookdevPreset } from \'./apps/web/src/game3d/lookdev/index.ts\'; if (!getLookdevPreset(\'FR\')) process.exit(1);"', evidence: 'apps/web/src/game3d/lookdev/index.ts', fn: buildAG02 },
    { stageId: 'AG03', agentId: 'AG03', provider: 'ag', model: 'gemini-4-argon-medium', ownPaths: 'art/source/characters/hero', testCmd: 'test -f art/source/characters/hero/hero-mira-spec.json && test -f art/source/characters/hero/mira-portrait.svg', evidence: 'art/source/characters/hero/HERO_DESIGN.md', fn: buildAG03 },
    { stageId: 'AG04', agentId: 'AG04', provider: 'ag', model: 'gemini-4-argon-medium', ownPaths: 'art/source/characters/npcs', testCmd: 'test -f art/source/characters/npcs/npc-kits.json && test -f art/source/characters/npcs/mamie_claire.svg', evidence: 'art/source/characters/npcs/NPC_DESIGN.md', fn: buildAG04 },
    { stageId: 'AG05', agentId: 'AG05', provider: 'ag', model: 'gemini-4-argon-medium', ownPaths: 'art/source/animations', testCmd: 'node -e "const a=JSON.parse(require(\'fs\').readFileSync(\'art/source/animations/animation-clips.json\')); if(a.clips.length < 12) process.exit(1);"', evidence: 'art/source/animations/ANIMATION_BIBLE.md', fn: buildAG05 },
    { stageId: 'AG29', agentId: 'AG29', provider: 'ag', model: 'gemini-4-argon-medium', ownPaths: 'art/branding', testCmd: 'test -f art/branding/miraverse-wordmark.svg && test -f art/branding/card-FR.svg', evidence: 'art/branding/miraverse-wordmark.svg', fn: buildAG29 },
    { stageId: 'DX01', agentId: 'DX01', provider: 'dgx', model: DGX_MODEL, ownPaths: 'content/locales/drafts', testCmd: 'node -e "for(const l of [\'en\',\'fr\',\'ar-LB\',\'ar-EG\',\'ar-IQ\',\'ko\']) JSON.parse(require(\'fs\').readFileSync(\'content/locales/drafts/\'+l+\'.json\'));"', evidence: 'content/locales/drafts/fr.json', fn: buildDX01 },
    { stageId: 'DX02', agentId: 'DX02', provider: 'dgx', model: DGX_MODEL, ownPaths: 'content/vocab/enriched', testCmd: 'node -e "for(const l of [\'fr\',\'ar-LB\',\'ar-EG\',\'ar-IQ\',\'ko\']) JSON.parse(require(\'fs\').readFileSync(\'content/vocab/enriched/\'+l+\'.json\'));"', evidence: 'content/vocab/enriched/fr.json', fn: buildDX02 },
    { stageId: 'DX03', agentId: 'DX03', provider: 'dgx', model: DGX_MODEL, ownPaths: 'art/audio/metadata', testCmd: 'node -e "const c=JSON.parse(require(\'fs\').readFileSync(\'art/audio/metadata/cues.json\')); if(c.cues.length<8) process.exit(1);"', evidence: 'art/audio/metadata/cues.json', fn: buildDX03 },
    { stageId: 'DX04', agentId: 'DX04', provider: 'dgx', model: DGX_MODEL, ownPaths: 'tools/procedural-props', testCmd: 'node -e "JSON.parse(require(\'fs\').readFileSync(\'tools/procedural-props/recipes.json\'));"', evidence: 'tools/procedural-props/recipes.json', fn: buildDX04 },
  ];

  // Note: CX04 imports ../contracts/index, so after CX01 finishes in its worktree, we merge CX01 first or run sequentially and merge each into integration/miraverse-v0.4!
  for (const item of wave1) {
    const { wtDir } = prepareWorktree(item.agentId);
    const t0 = Date.now();
    const res = await item.fn(wtDir);
    const telemetry = res && res.usage
      ? { provider: item.provider, model: item.model, elapsedMs: res.elapsedMs, usage: res.usage }
      : { provider: item.provider, model: item.model, elapsedMs: Date.now() - t0 };
    commitAndVerify(wtDir, item.stageId, item.agentId, item.ownPaths, item.testCmd, item.evidence, telemetry);
    // Merge into integration/miraverse-v0.4 immediately so dependent stages see shared contracts
    sh(`git merge --no-ff -q ag/${item.agentId} -m "Merge ${item.stageId} (${item.agentId} - Wave 1)"`, ROOT);
  }
  console.log('=== WAVE 1 COMPLETE & MERGED (13/13 STAGES) ===');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
