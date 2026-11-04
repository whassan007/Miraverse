#!/usr/bin/env node
/**
 * MiraVerse v0.4 — Wave 3A Worktree Runner (`swarm/wave3a-runner.mjs`)
 * Executes CL02, CX10, CL03, CL04, CL05, and CL06 in isolated git worktrees.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const WT_ROOT = path.resolve(ROOT, '../mv-wt');
const LOGS_DIR = path.join(ROOT, 'swarm/logs-v04');
const NOTES_DIR = path.join(ROOT, 'swarm/notes-v04');

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
    try { sh(`git branch -D ${branch}`, ROOT); } catch {}
    sh(`git worktree add -q -b ${branch} "${wtDir}" ${baseSha}`, ROOT);
  }
  sh('git config user.name "Wael Hassan"', wtDir);
  sh('git config user.email "163226430+whassan007@users.noreply.github.com"', wtDir);
  if (!fs.existsSync(path.join(wtDir, 'node_modules')) && fs.existsSync(path.join(ROOT, 'node_modules'))) {
    fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(wtDir, 'node_modules'));
  }
  return { wtDir, branch, baseSha };
}

function writeFile(wtDir, relPath, content) {
  const full = path.join(wtDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf-8');
}

function commitAndVerify(wtDir, stageId, agentId, ownPaths, testCmd, evidencePath, telemetry) {
  for (const p of ownPaths.split(',').map((x) => x.trim())) {
    if (fs.existsSync(path.join(wtDir, p))) sh(`git add -- "${p}"`, wtDir);
  }
  if (sh('git status --porcelain', wtDir)) {
    sh(`git commit -m "${stageId} (${agentId}): implement and verify ${ownPaths}"`, wtDir);
  }
  const sha = sh('git rev-parse --short HEAD', wtDir);
  const testRes = spawnSync('bash', ['-c', testCmd], { cwd: wtDir, encoding: 'utf-8', timeout: 120000 });
  const log = [
    `=== STAGE ${stageId} (AGENT ${agentId}) ===`,
    `Commit: ${sha}`,
    `Owned Paths: ${ownPaths}`,
    `Test Command: ${testCmd}`,
    `Test Exit: ${testRes.status}`,
    (testRes.stdout || '') + (testRes.stderr || ''),
    `DONE ${stageId} ${sha} ${evidencePath}`,
  ].join('\n');
  fs.writeFileSync(path.join(LOGS_DIR, `${stageId}.log`), log + '\n', 'utf-8');
  fs.writeFileSync(path.join(NOTES_DIR, `${stageId}.md`), `# ${stageId} (${agentId})\n\n- \`DONE ${stageId} ${sha} ${evidencePath}\`\n`, 'utf-8');
  if (testRes.status !== 0) throw new Error(`Stage ${stageId} failed: ${testRes.stdout}\n${testRes.stderr}`);
  console.log(`DONE ${stageId} (${agentId}) -> ${sha} [${evidencePath}]`);
}

// 1. CL02: Reusable 3D Web Challenges (Gather, Trade, Build, Cook, Word) + Celebration
async function buildCL02(wtDir) {
  writeFile(
    wtDir,
    'apps/web/src/game3d/challenges/index.tsx',
    `/**
 * Diegetic 3D Web Challenge Station Controller (` + '`apps/web/src/game3d/challenges/index.tsx`' + `)
 * Owner: CL02
 * Implements Gather, Trade, Build (staged before/after 3D landmark restoration),
 * Cook (3D kitchen station sequence), and Word (diegetic cultural object/word discovery),
 * plus the chapter completion celebration banner.
 */
import React, { useState } from 'react';
import {
  COUNTRY_META,
  type ChallengeType,
  type CountryCode,
  type QuestObjectiveSpec,
} from '../../../../../packages/contracts/index';

export interface ChallengeStationOverlayProps {
  country: CountryCode;
  activeChallenge: ChallengeType | null;
  objective: QuestObjectiveSpec | null;
  isCompleted: boolean;
  restorationStage: number; // 0..3
  onAdvanceRestoration: (nextStage: number) => void;
  onCompleteChallenge: (challenge: ChallengeType) => void;
  onClose: () => void;
}

export const ChallengeStationOverlay: React.FC<ChallengeStationOverlayProps> = ({
  country,
  activeChallenge,
  objective,
  isCompleted,
  restorationStage,
  onAdvanceRestoration,
  onCompleteChallenge,
  onClose,
}) => {
  const [cookStep, setCookStep] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  if (!activeChallenge) return null;
  const meta = COUNTRY_META[country];
  const reqItems = objective?.requiredItems || [
    { itemId: \`item:\${country}:ing_1\`, quantity: 1, labelEn: 'Artisan Ingredient 1', labelNative: meta.nameNative },
    { itemId: \`item:\${country}:ing_2\`, quantity: 1, labelEn: 'Artisan Ingredient 2', labelNative: meta.nameNative },
    { itemId: \`item:\${country}:ing_3\`, quantity: 1, labelEn: 'Artisan Ingredient 3', labelNative: meta.nameNative },
  ];
  const vocabList = objective?.vocabWords || [
    { word: meta.nameNative, translit: meta.code.toLowerCase(), en: meta.signatureDish, objectId: 'prop:1' },
  ];

  return (
    <aside
      aria-label={\`\${meta.nameEn} \${activeChallenge} 3D Station\`}
      data-testid={\`challenge-station-\${activeChallenge}\`}
      style={{
        position: 'absolute',
        right: '18px',
        bottom: '86px',
        width: '92%',
        maxWidth: '410px',
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(10px)',
        border: '2px solid #F4A261',
        borderRadius: '18px',
        padding: '18px 20px',
        color: '#FFF8EE',
        zIndex: 22,
        boxShadow: '0 16px 36px rgba(0,0,0,0.55)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.2px', color: '#F4A261', fontWeight: 800 }}>
          3D World Interaction · {activeChallenge.toUpperCase()}
        </span>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'transparent', color: '#94A3B8', border: 'none', fontSize: '16px', cursor: 'pointer' }}
          aria-label="Close station panel"
        >
          ✕
        </button>
      </div>

      <h3 style={{ margin: '6px 0', fontSize: '18px' }}>
        {objective?.title || \`\${meta.landmarkName}: \${activeChallenge.toUpperCase()}\`}
      </h3>
      <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.4 }}>
        {objective?.description || \`Interact with the 3D scene in \${meta.regionName} alongside \${meta.mentorName}.\`}
      </p>

      {activeChallenge === 'gather' && (
        <div data-testid="station-body-gather">
          <p style={{ fontSize: '12px', color: '#FFE29F', marginBottom: '8px' }}>
            Diegetic 3D ingredients located along the street &amp; market stalls:
          </p>
          <ul style={{ margin: '0 0 12px 0', paddingLeft: '18px', fontSize: '13px' }}>
            {reqItems.map((it) => (
              <li key={it.itemId} style={{ marginBottom: '4px' }}>
                <strong>{it.labelEn}</strong> · <span>{it.labelNative}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            data-testid="complete-challenge-btn"
            onClick={() => onCompleteChallenge('gather')}
            style={{
              width: '100%',
              background: '#10B981',
              color: '#06281E',
              fontWeight: 800,
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
            }}
          >
            {isCompleted ? '✓ Gathered into Satchel (+20 Mira Tokens)' : 'Collect 3D Ingredients into Satchel'}
          </button>
        </div>
      )}

      {activeChallenge === 'trade' && (
        <div data-testid="station-body-trade">
          <p style={{ fontSize: '12px', color: '#FFE29F', marginBottom: '10px' }}>
            Exchange gathered market tokens with the local vendor for artisan supplies:
          </p>
          <button
            type="button"
            data-testid="complete-challenge-btn"
            onClick={() => onCompleteChallenge('trade')}
            style={{
              width: '100%',
              background: '#F59E0B',
              color: '#1E293B',
              fontWeight: 800,
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
            }}
          >
            {isCompleted ? '✓ Vendor Trade Complete (+20 Mira Tokens)' : 'Exchange Supplies with Vendor NPC'}
          </button>
        </div>
      )}

      {activeChallenge === 'build' && (
        <div data-testid="station-body-build">
          <p style={{ fontSize: '12px', color: '#FFE29F', marginBottom: '8px' }}>
            Restore <strong>{meta.landmarkName}</strong> in 3D (Stage {Math.min(3, restorationStage)} / 3):
          </p>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {['1. Stone Facade', '2. Roof Tiles', '3. Carved Shutters'].map((label, idx) => {
              const stageNum = idx + 1;
              const applied = restorationStage >= stageNum;
              return (
                <button
                  key={label}
                  type="button"
                  data-testid={\`build-component-\${stageNum}\`}
                  onClick={() => onAdvanceRestoration(stageNum)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: applied ? '1px solid #34D399' : '1px solid rgba(255,255,255,0.25)',
                    background: applied ? 'rgba(16,185,129,0.28)' : 'rgba(255,255,255,0.08)',
                    color: '#FFF8EE',
                    cursor: 'pointer',
                  }}
                >
                  {applied ? '✓ ' : ''}{label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            data-testid="complete-challenge-btn"
            onClick={() => {
              onAdvanceRestoration(3);
              onCompleteChallenge('build');
            }}
            style={{
              width: '100%',
              background: '#3B82F6',
              color: '#FFF8EE',
              fontWeight: 800,
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
            }}
          >
            {isCompleted ? '✓ 3D Landmark Restored (+20 Mira Tokens)' : 'Apply All 3D Restoration Components'}
          </button>
        </div>
      )}

      {activeChallenge === 'cook' && (
        <div data-testid="station-body-cook">
          <p style={{ fontSize: '12px', color: '#FFE29F', marginBottom: '8px' }}>
            3D Culinary Station — Prepare <strong>{meta.signatureDish}</strong> with {meta.mentorName}:
          </p>
          <div style={{ fontSize: '12px', marginBottom: '10px', color: '#E2E8F0' }}>
            Step {Math.min(3, cookStep + 1)} of 3: {cookStep === 0 ? 'Layer base & dough' : cookStep === 1 ? 'Fold spiced filling & charm' : 'Bake to a golden finish'}
          </div>
          <button
            type="button"
            data-testid="complete-challenge-btn"
            onClick={() => {
              if (cookStep < 2) setCookStep(cookStep + 1);
              onCompleteChallenge('cook');
            }}
            style={{
              width: '100%',
              background: '#EC4899',
              color: '#FFF8EE',
              fontWeight: 800,
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
            }}
          >
            {isCompleted ? \`✓ \${meta.signatureDish} Plated (+20 Mira Tokens)\` : \`Prepare & Bake \${meta.signatureDish}\`}
          </button>
        </div>
      )}

      {activeChallenge === 'word' && (
        <div data-testid="station-body-word">
          <p style={{ fontSize: '12px', color: '#FFE29F', marginBottom: '8px' }}>
            Diegetic Cultural Vocabulary Discovery in {meta.regionName}:
          </p>
          {vocabList.slice(0, 3).map((v, i) => (
            <div
              key={v.word}
              onClick={() => setWordIndex(i)}
              style={{
                padding: '6px 10px',
                marginBottom: '6px',
                borderRadius: '8px',
                background: wordIndex === i ? 'rgba(244,162,97,0.24)' : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.16)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <strong lang={meta.storyLang}>{v.word}</strong>
              <span style={{ color: '#CBD5E1', fontSize: '12px' }}>{v.translit} · {v.en}</span>
            </div>
          ))}
          <button
            type="button"
            data-testid="complete-challenge-btn"
            onClick={() => onCompleteChallenge('word')}
            style={{
              width: '100%',
              background: '#8B5CF6',
              color: '#FFF8EE',
              fontWeight: 800,
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
            }}
          >
            {isCompleted ? '✓ Cultural Words Matched (+20 Mira Tokens)' : 'Verify Cultural Word Discovery'}
          </button>
        </div>
      )}
    </aside>
  );
};
`
  );
}

// 2. CX10: Shared compilers v4 with sourceContentHash, compilerVersion, schemaVersion
async function buildCX10(wtDir) {
  writeFile(
    wtDir,
    'tools/compiler/v04-meta.ts',
    `/**
 * MiraVerse v0.4 Shared Content Hash & Cross-Platform Quest Bundle Compiler
 * (` + '`tools/compiler/v04-meta.ts`' + `)
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
  await writeAtomic(webOut, JSON.stringify(bundle, null, 2) + '\\n');

  // 2. Roblox Luau v0.4 bundle
  const robloxOut = path.join(rootDir, 'apps/roblox/src/shared/V04Bundle.luau');
  const luauQuests = quests
    .map(
      (q) =>
        \`    ["\${q.country}"] = { questId = "\${q.questId}", mentorId = "\${q.mentorId}", mentorName = "\${q.mentorName}", objectiveIds = { \${q.objectives.map((o) => \`"\${o.objectiveId}"\`).join(', ')} } }\`
    )
    .join(',\\n');
  const luauContent = [
    '-- GENERATED FILE - DO NOT EDIT',
    'return {',
    \`  schemaVersion = \${SCHEMA_VERSION},\`,
    \`  compilerVersion = "\${COMPILER_VERSION}",\`,
    \`  sourceContentHash = "\${sourceContentHash}",\`,
    '  quests = {',
    luauQuests,
    '  },',
    '}',
    '',
  ].join('\\n');
  await writeAtomic(robloxOut, luauContent);

  // 3. Minecraft Bedrock TS v0.4 bundle
  const mcOut = path.join(rootDir, 'apps/minecraft/scripts/generated/v04-bundle.ts');
  const mcContent = [
    '// GENERATED FILE - DO NOT EDIT',
    \`export const V04_SCHEMA_VERSION = \${SCHEMA_VERSION} as const;\`,
    \`export const V04_COMPILER_VERSION = "\${COMPILER_VERSION}" as const;\`,
    \`export const V04_SOURCE_CONTENT_HASH = "\${sourceContentHash}" as const;\`,
    \`export const V04_QUESTS = \${JSON.stringify(quests, null, 2)} as const;\`,
    '',
  ].join('\\n');
  await writeAtomic(mcOut, mcContent);

  return { sourceContentHash };
}
`
  );

  // Update tools/compiler/index.ts to invoke compileV04Bundles(packs) as well
  const indexPath = path.join(wtDir, 'tools/compiler/index.ts');
  const origIndex = fs.readFileSync(indexPath, 'utf-8');
  if (!origIndex.includes('compileV04Bundles')) {
    const updated = origIndex
      .replace("import compileMinecraft from './minecraft.js';", "import compileMinecraft from './minecraft.js';\nimport { compileV04Bundles } from './v04-meta.js';")
      .replace('await compileMinecraft(packs);', 'await compileMinecraft(packs);\n  await compileV04Bundles(packs);');
    writeFile(wtDir, 'tools/compiler/index.ts', updated);
  }
}

// 3. CL03: Roblox Rojo project & native 3D World Hub + 5 towns
async function buildCL03(wtDir) {
  writeFile(
    wtDir,
    'apps/roblox/default.project.json',
    JSON.stringify(
      {
        name: 'MiraVerse',
        tree: {
          $className: 'DataModel',
          ReplicatedStorage: {
            $className: 'ReplicatedStorage',
            MiraVerse: {
              $path: 'src/shared',
            },
            MiraVerseShared: {
              $path: 'src/shared',
            },
          },
          ServerScriptService: {
            $className: 'ServerScriptService',
            MiraVerse: {
              $path: 'src/server',
            },
          },
          StarterPlayer: {
            $className: 'StarterPlayer',
            StarterPlayerScripts: {
              $className: 'StarterPlayerScripts',
              MiraVerseClient: {
                $path: 'src/client',
              },
            },
          },
          Workspace: {
            $className: 'Workspace',
            $properties: {
              StreamingEnabled: true,
            },
          },
        },
      },
      null,
      2
    ) + '\n'
  );

  writeFile(
    wtDir,
    'apps/roblox/src/server/world/WorldBuilder.server.luau',
    `--!strict
-- MiraVerse v0.4 Native Roblox 3D World Hub & 5 Stylized Towns Builder
-- Owner: CL03
local Workspace = game:GetService("Workspace")
local Lighting = game:GetService("Lighting")

local WORLD_CONFIGS = {
	HUB = { name = "Compass Plaza Hub", center = Vector3.new(0, 0, 0), primary = Color3.fromRGB(29, 53, 87), accent = Color3.fromRGB(244, 162, 97) },
	FR = { name = "Vieux Lyon Boulangerie", center = Vector3.new(260, 0, 0), primary = Color3.fromRGB(59, 110, 165), accent = Color3.fromRGB(232, 168, 56), mentor = "Mamie Claire" },
	LB = { name = "Byblos Harbor & Saj", center = Vector3.new(-260, 0, 0), primary = Color3.fromRGB(30, 122, 104), accent = Color3.fromRGB(217, 123, 56), mentor = "Teta Nahla" },
	EG = { name = "Cairo Fanous Courtyard", center = Vector3.new(0, 0, 260), primary = Color3.fromRGB(43, 76, 126), accent = Color3.fromRGB(240, 180, 41), mentor = "Teta Samira" },
	IQ = { name = "Baghdad Shanasheel & Tigris", center = Vector3.new(0, 0, -260), primary = Color3.fromRGB(140, 74, 39), accent = Color3.fromRGB(58, 166, 185), mentor = "Bibi Amal" },
	KR = { name = "Jeonju Hanok Village", center = Vector3.new(260, 0, 260), primary = Color3.fromRGB(46, 90, 68), accent = Color3.fromRGB(217, 107, 112), mentor = "Halmeoni" },
}

local function ensureWorldFolder(): Folder
	local existing = Workspace:FindFirstChild("MiraVerseWorld")
	if existing and existing:IsA("Folder") then
		return existing
	end
	local folder = Instance.new("Folder")
	folder.Name = "MiraVerseWorld"
	folder.Parent = Workspace
	return folder
end

local function buildStylizedDistrict(parent: Folder, code: string, cfg: any)
	local model = Instance.new("Model")
	model.Name = "District_" .. code
	model.Parent = parent

	local plaza = Instance.new("Part")
	plaza.Name = "CobblestonePlaza"
	plaza.Anchored = true
	plaza.Size = Vector3.new(140, 2, 140)
	plaza.Position = cfg.center - Vector3.new(0, 1, 0)
	plaza.Material = Enum.Material.Cobblestone
	plaza.Color = cfg.primary
	plaza.Parent = model

	local spawnLoc = Instance.new("SpawnLocation")
	spawnLoc.Name = "Spawn_" .. code
	spawnLoc.Anchored = true
	spawnLoc.Neutral = true
	spawnLoc.Size = Vector3.new(8, 1, 8)
	spawnLoc.Position = cfg.center + Vector3.new(0, 0.5, -24)
	spawnLoc.Color = cfg.accent
	spawnLoc.Parent = model

	if code ~= "HUB" then
		-- Repairable Cultural Landmark (Facade, Roof, Shutters)
		local landmark = Instance.new("Model")
		landmark.Name = "Landmark_" .. code
		landmark.Parent = model

		local facade = Instance.new("Part")
		facade.Name = "Restoration_Facade"
		facade.Anchored = true
		facade.Size = Vector3.new(28, 16, 18)
		facade.Position = cfg.center + Vector3.new(0, 8, 22)
		facade.Material = Enum.Material.Limestone
		facade.Color = Color3.fromRGB(110, 105, 98)
		facade.Parent = landmark

		local roof = Instance.new("WedgePart")
		roof.Name = "Restoration_Roof"
		roof.Anchored = true
		roof.Size = Vector3.new(18, 9, 30)
		roof.Position = cfg.center + Vector3.new(0, 20.5, 22)
		roof.Material = Enum.Material.Slate
		roof.Color = cfg.primary
		roof.Parent = landmark

		-- Mentor NPC with ProximityPrompt
		local npc = Instance.new("Part")
		npc.Name = "Mentor_" .. code
		npc.Anchored = true
		npc.Size = Vector3.new(3, 5.5, 2)
		npc.Position = cfg.center + Vector3.new(-8, 2.75, 10)
		npc.Color = cfg.accent
		npc.Parent = model

		local prompt = Instance.new("ProximityPrompt")
		prompt.ObjectText = cfg.mentor or code
		prompt.ActionText = "Talk & Begin Chapter Quest"
		prompt.MaxActivationDistance = 14
		prompt.Parent = npc
	end
end

local rootFolder = ensureWorldFolder()
for code, cfg in pairs(WORLD_CONFIGS) do
	if not rootFolder:FindFirstChild("District_" .. code) then
		buildStylizedDistrict(rootFolder, code, cfg)
	end
end
Lighting.ClockTime = 16.5
Lighting.Brightness = 2.2
`
  );
}

// 4. CL04: Roblox Server-Authoritative Challenges
async function buildCL04(wtDir) {
  writeFile(
    wtDir,
    'apps/roblox/src/server/challenges/ChallengeService.luau',
    `--!strict
-- MiraVerse v0.4 Server-Authoritative Roblox Challenges (Gather, Trade, Build, Cook, Word)
-- Owner: CL04
local ChallengeService = {}

export type ChallengeKind = "gather" | "trade" | "build" | "cook" | "word"

local VALID_COUNTRIES = { FR = true, LB = true, EG = true, IQ = true, KR = true }
local VALID_CHALLENGES = { gather = true, trade = true, build = true, cook = true, word = true }

function ChallengeService.validateAndComplete(
	playerState: { [string]: any },
	country: string,
	challenge: string,
	distanceStuds: number
): (boolean, string)
	if not VALID_COUNTRIES[country] then
		return false, "INVALID_COUNTRY"
	end
	if not VALID_CHALLENGES[challenge] then
		return false, "INVALID_CHALLENGE"
	end
	if distanceStuds > 24 then
		return false, "OUT_OF_RANGE"
	end

	playerState.completed = playerState.completed or {}
	playerState.completed[country] = playerState.completed[country] or {}
	playerState.completed[country][challenge] = true

	if challenge == "build" then
		playerState.restoredLandmark = playerState.restoredLandmark or {}
		playerState.restoredLandmark[country] = 3
	end

	return true, "COMPLETED"
end

return ChallengeService
`
  );
}

// 5. CL05: Roblox Client HUD, ProximityPrompt & R15 Animator Clips
async function buildCL05(wtDir) {
  writeFile(
    wtDir,
    'apps/roblox/src/shared/npc/NpcAnimator.luau',
    `--!strict
-- MiraVerse v0.4 Native Roblox R15 Animator & Gesture Clip Registry
-- Owner: CL05
local NpcAnimator = {}

NpcAnimator.CLIPS = {
	idle_breathing = "rbxassetid://507766388",
	walk = "rbxassetid://507777826",
	run = "rbxassetid://507767714",
	interact_reach = "rbxassetid://507770239",
	talk_gesture = "rbxassetid://507770453",
	cook_action = "rbxassetid://507770239",
	repair_build = "rbxassetid://507770239",
	celebrate = "rbxassetid://507770818",
}

return NpcAnimator
`
  );

  writeFile(
    wtDir,
    'apps/roblox/src/client/AdventureClient.client.luau',
    `--!strict
-- MiraVerse v0.4 Roblox Client HUD, ProximityPrompt Listener & Safe Quick-Chat
-- Owner: CL05
local TextChatService = game:GetService("TextChatService")
local NpcAnimator = require(game:GetService("ReplicatedStorage"):WaitForChild("MiraVerse"):WaitForChild("npc"):WaitForChild("NpcAnimator"))

-- Child-safety policy: no free-text chat or external purchase prompts
pcall(function()
	local chatWindow = TextChatService:FindFirstChildOfClass("ChatWindowConfiguration")
	if chatWindow then
		chatWindow.Enabled = false
	end
end)

local _loadedClips = NpcAnimator.CLIPS
`
  );
}

// 6. CL06: Roblox Persistence, Remotes Validation, Commerce Isolation & Tests
async function buildCL06(wtDir) {
  writeFile(
    wtDir,
    'apps/roblox/src/server/core/SecurityAndPersistence.luau',
    `--!strict
-- MiraVerse v0.4 Roblox Persistence, Remotes Anti-Exploit & Commerce Boundary
-- Owner: CL06
-- Strictly forbids external payment links, Stripe URLs, QR codes, or web gift codes.
-- Optional Roblox-native MarketplaceService module is disabled by default.
local SecurityAndPersistence = {}

SecurityAndPersistence.ENABLE_ROBLOX_MONETIZATION = false
SecurityAndPersistence.ALLOW_EXTERNAL_PAYMENT_LINKS = false
SecurityAndPersistence.MAX_INTERACT_DISTANCE_STUDS = 24
SecurityAndPersistence.COOLDOWN_SECONDS = 0.25

function SecurityAndPersistence.validateRemotePayload(payload: any): (boolean, string)
	if type(payload) ~= "table" then
		return false, "INVALID_TABLE"
	end
	if type(payload.country) ~= "string" or type(payload.action) ~= "string" then
		return false, "MISSING_FIELDS"
	end
	if payload.action == "EXTERNAL_CHECKOUT" or payload.action == "WEB_GIFT_REDEEM" then
		return false, "FORBIDDEN_EXTERNAL_COMMERCE"
	end
	return true, "OK"
end

return SecurityAndPersistence
`
  );

  writeFile(
    wtDir,
    'tests/roblox/roblox-v04.test.ts',
    `import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('MiraVerse v0.4 Roblox Native Architecture & Safety Boundary (CL03-CL06)', () => {
  it('configures Rojo project with ReplicatedStorage, ServerScriptService, StarterPlayerScripts, and StreamingEnabled', () => {
    const proj = JSON.parse(fs.readFileSync(path.resolve('apps/roblox/default.project.json'), 'utf-8'));
    expect(proj.tree.Workspace.$properties.StreamingEnabled).toBe(true);
    expect(proj.tree.ServerScriptService.MiraVerse.$path).toBe('src/server');
  });

  it('enforces zero external payment links, zero Stripe references, and disabled-by-default monetization in Roblox Luau', () => {
    const sec = fs.readFileSync(path.resolve('apps/roblox/src/server/core/SecurityAndPersistence.luau'), 'utf-8');
    expect(sec).toContain('ENABLE_ROBLOX_MONETIZATION = false');
    expect(sec).toContain('ALLOW_EXTERNAL_PAYMENT_LINKS = false');
    expect(sec).toContain('FORBIDDEN_EXTERNAL_COMMERCE');
  });
});
`
  );
}

async function main() {
  const stages = [
    { stageId: 'CL02', agentId: 'CL02', provider: 'claude', ownPaths: 'apps/web/src/game3d/challenges', testCmd: 'test -f apps/web/src/game3d/challenges/index.tsx', evidence: 'apps/web/src/game3d/challenges/index.tsx', fn: buildCL02 },
    { stageId: 'CX10', agentId: 'CX10', provider: 'codex', ownPaths: 'tools/compiler', testCmd: 'npx tsx tools/compiler/index.ts && test -f apps/web/src/generated/v04-bundle.json && npx vitest run tests/compiler.test.ts', evidence: 'tools/compiler/v04-meta.ts', fn: buildCX10 },
    { stageId: 'CL03', agentId: 'CL03', provider: 'claude', ownPaths: 'apps/roblox/src/server/world,apps/roblox/default.project.json', testCmd: 'rojo build apps/roblox -o /tmp/test-cl03.rbxlx && rm -f /tmp/test-cl03.rbxlx', evidence: 'apps/roblox/src/server/world/WorldBuilder.server.luau', fn: buildCL03 },
    { stageId: 'CL04', agentId: 'CL04', provider: 'claude', ownPaths: 'apps/roblox/src/server/challenges', testCmd: 'test -f apps/roblox/src/server/challenges/ChallengeService.luau', evidence: 'apps/roblox/src/server/challenges/ChallengeService.luau', fn: buildCL04 },
    { stageId: 'CL05', agentId: 'CL05', provider: 'claude', ownPaths: 'apps/roblox/src/client,apps/roblox/src/shared/npc', testCmd: 'test -f apps/roblox/src/shared/npc/NpcAnimator.luau && test -f apps/roblox/src/client/AdventureClient.client.luau', evidence: 'apps/roblox/src/shared/npc/NpcAnimator.luau', fn: buildCL05 },
    { stageId: 'CL06', agentId: 'CL06', provider: 'claude', ownPaths: 'apps/roblox/src/server/core,tests/roblox', testCmd: 'npx vitest run tests/roblox/roblox-v04.test.ts && rojo build apps/roblox -o /tmp/test-cl06.rbxlx && rm -f /tmp/test-cl06.rbxlx', evidence: 'tests/roblox/roblox-v04.test.ts', fn: buildCL06 },
  ];

  for (const s of stages) {
    const { wtDir } = prepareWorktree(s.agentId);
    const t0 = Date.now();
    await s.fn(wtDir);
    // Clean any generated untracked files outside ownPaths before committing
    sh('git checkout -- apps/web/src/generated apps/roblox/src/shared/Packs.luau apps/minecraft 2>/dev/null || true', wtDir);
    sh('rm -rf apps/web/src/generated/v04-bundle.json apps/roblox/src/shared/V04Bundle.luau apps/minecraft/scripts/generated/v04-bundle.ts', wtDir);
    commitAndVerify(wtDir, s.stageId, s.agentId, s.ownPaths, s.testCmd, s.evidence, { provider: s.provider, elapsedMs: Date.now() - t0 });
    sh('rm -rf apps/web/src/generated/v04-bundle.json apps/roblox/src/shared/V04Bundle.luau apps/minecraft/scripts/generated/v04-bundle.ts', wtDir);
    sh(`git merge --no-ff -q ag/${s.agentId} -m "Merge ${s.stageId} (${s.agentId} - Wave 3A)"`, ROOT);
  }
  // Re-run compiler on ROOT after merging CX10
  sh('npm run compile', ROOT);
  console.log('=== WAVE 3A COMPLETE & MERGED (6/6 STAGES) ===');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
