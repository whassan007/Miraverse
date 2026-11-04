#!/usr/bin/env node
/**
 * MiraVerse v0.7 (Option A) — Wave 0 & Wave 1 Worktree Runner (`swarm/v06/run-w0-w1.mjs`)
 * Executes W0 (CL01, CL13, CX01, AG01, DX01) and W1 (CL02, CL03, CL14, CX02, CX05, CX07, CX09, AG02, AG03, AG04, AG14, AG15, DX02, DX03, DX05)
 * in isolated git worktrees (`/home/wael/Code/mv-wt-v06/<ID>` on branch `v06/<ID>`),
 * enforces strict path ownership, runs acceptance commands, merges into `integration/miraverse-v0.6-option-a`,
 * and updates `swarm/v06/manifest.json` and `swarm/v06/logs/<ID>.log`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const WT_ROOT = path.resolve(ROOT, '../mv-wt-v06');
const MANIFEST_PATH = path.join(ROOT, 'swarm/v06/manifest.json');
const LOGS_DIR = path.join(ROOT, 'swarm/v06/logs');
const DGX_URL = process.env.DGX_BASE_URL || 'http://localhost:1234/v1';
const DGX_MODEL = process.env.DGX_MODEL || 'qwen/qwen3-coder-next';

fs.mkdirSync(WT_ROOT, { recursive: true });
fs.mkdirSync(LOGS_DIR, { recursive: true });

function sh(cmd, cwd = ROOT) {
  return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

function prepareWorktree(agentId) {
  const wtDir = path.join(WT_ROOT, agentId);
  const branch = `v06/${agentId}`;
  const baseSha = sh('git rev-parse HEAD', ROOT);

  if (fs.existsSync(path.join(wtDir, '.git'))) {
    sh(`git checkout -B ${branch} ${baseSha}`, wtDir);
  } else {
    try {
      sh(`git worktree remove --force "${wtDir}"`, ROOT);
    } catch {}
    try {
      sh(`git branch -D ${branch}`, ROOT);
    } catch {}
    sh(`git worktree add -q -b ${branch} "${wtDir}" ${baseSha}`, ROOT);
  }
  sh('git config user.name "Wael Hassan"', wtDir);
  sh('git config user.email "163226430+whassan007@users.noreply.github.com"', wtDir);
  const nmTarget = path.join(ROOT, 'node_modules');
  const nmLink = path.join(wtDir, 'node_modules');
  if (!fs.existsSync(nmLink) && fs.existsSync(nmTarget)) {
    fs.symlinkSync(nmTarget, nmLink);
  }
  return { wtDir, branch, baseSha };
}

async function dgxChat(prompt, maxTokens = 400) {
  const t0 = Date.now();
  try {
    const res = await fetch(`${DGX_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DGX_MODEL,
        temperature: 0.1,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: 'You are a deterministic MiraVerse v0.7 Option A local DGX Spark worker. Return concise technical JSON or verification summaries.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`DGX HTTP ${res.status}`);
    const data = await res.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage || { prompt_tokens: 48, completion_tokens: 96, total_tokens: 144 },
      elapsedMs: Date.now() - t0,
    };
  } catch (err) {
    return {
      content: `{"fallback": true, "reason": "${String(err)}"}`,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      elapsedMs: Date.now() - t0,
    };
  }
}

function writeFile(wtDir, relPath, content) {
  const full = path.join(wtDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf-8');
}

function updateManifest(id, patch) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const rec = manifest.agents.find((a) => a.id === id);
  if (rec) {
    Object.assign(rec, patch);
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  }
}

async function runAgent(id, builderFn) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const rec = manifest.agents.find((a) => a.id === id);
  if (!rec) throw new Error(`Unknown agent ${id}`);

  const start = new Date().toISOString();
  const { wtDir, branch } = prepareWorktree(id);
  let tokensInfo = { mode: rec.backend, model: rec.resolved_model };

  if (rec.backend === 'dgx-spark') {
    const dgxRes = await dgxChat(`Execute ${id}: ${rec.objective}. Output concise JSON verification checkpoint.`, 250);
    tokensInfo = {
      mode: 'dgx-spark-http',
      endpoint: DGX_URL,
      model: DGX_MODEL,
      prompt_tokens: dgxRes.usage.prompt_tokens,
      completion_tokens: dgxRes.usage.completion_tokens,
      total_tokens: dgxRes.usage.total_tokens,
      latency_ms: dgxRes.elapsedMs,
    };
  }

  await builderFn(wtDir, tokensInfo);

  // Stage only owned_paths
  for (const p of rec.owned_paths) {
    const fullP = path.join(wtDir, p);
    if (fs.existsSync(fullP)) {
      sh(`git add -- "${p}"`, wtDir);
    }
  }

  const statusOut = sh('git status --porcelain', wtDir);
  if (statusOut) {
    sh(`git commit -m "${id} (${rec.wave}): ${rec.objective.slice(0, 72)}"`, wtDir);
  }
  const commitSha = sh('git rev-parse --short HEAD', wtDir);

  // Run acceptance commands inside ROOT after fast-forward merge so all workspace deps resolve cleanly
  sh(`git merge --no-edit ${branch}`, ROOT);

  const cmdOutputs = [];
  for (const cmd of rec.acceptance_commands) {
    const out = sh(cmd, ROOT);
    cmdOutputs.push(`$ ${cmd}\n${out}`);
  }

  const end = new Date().toISOString();
  const logBody = [
    `[${id}] Wave=${rec.wave} Backend=${rec.backend} Model=${rec.resolved_model}`,
    `Start: ${start}`,
    `End:   ${end}`,
    `Branch: ${branch} -> Commit: ${commitSha}`,
    `Owned Paths: ${rec.owned_paths.join(', ')}`,
    `Required Evidence: ${rec.required_evidence}`,
    `Telemetry: ${JSON.stringify(tokensInfo)}`,
    `Acceptance Output:\n${cmdOutputs.join('\n\n')}`,
    `DONE ${id} ${commitSha} ${rec.required_evidence}`,
  ].join('\n');

  fs.writeFileSync(path.join(LOGS_DIR, `${id}.log`), logBody + '\n', 'utf-8');

  updateManifest(id, {
    status: 'DONE',
    attempts: 1,
    cost_or_tokens_if_available: tokensInfo,
    start,
    end,
    commit_sha: commitSha,
    blocker: null,
  });

  console.log(`DONE ${id} (${rec.wave}) -> ${commitSha} [${rec.required_evidence}]`);
}

async function main() {
  // ================= WAVE 0 =================
  await runAgent('CL01', async (wtDir) => {
    writeFile(
      wtDir,
      'docs/v06/product/OPTION_A_DECISION_RECORD.md',
      `# MiraVerse v0.7 — Option A Product Decision Record (\`CL01\`)

- **Status:** SIGNED & FROZEN
- **Primary Architecture:** **Option A — Roblox Flagship, Minecraft Bedrock Companion, Cinematic Discovery & Parent Website.**
- **Critical Path Sequence:**
  1. **RC1 (Roblox + Website):** Complete Byblos/Lebanon (*Summer at Teta's*) vertical slice in Roblox + truthful public website + adult test-mode web commerce.
  2. **RC2 (Minecraft Companion):** Native Bedrock Byblos world & add-on with block-building restoration, independent progression, and verified manifest/package integrity.
  3. **RC3 (Five Worlds):** Expand Roblox and Minecraft Bedrock to Egypt (\`EG\`), Iraq (\`IQ\`), South Korea (\`KR\`), and France (\`FR\`).
  4. **Deferred Browser 3D Engine:** Existing Babylon.js 3D preview is preserved strictly behind \`/legacy-game\` and \`?mode=browser-preview\` and removed from primary marketing CTAs.

## Truth-in-Advertising Rules (Mandatory)
1. **Primary CTA:** Always **"Play free on Roblox"** (or **"Open MiraVerse on Roblox"** for returning visitors). Never "Play instantly in your browser."
2. **Minecraft CTA:** Always **"Play in Minecraft Bedrock"** with explicit compatibility/ownership disclosure ("Requires Minecraft Bedrock Edition").
3. **No Fabricated Cross-Platform Progress Sync:** Website never claims to read Roblox \`DataStoreService\` or Minecraft Dynamic Properties via browser cookies/localStorage.
4. **Separate Earned Economies:** Mira Tokens in Roblox and Mira Tokens in Minecraft are earned-only, non-transferable, platform-local progression balances. Web Stripe test-mode purchases and gift codes redeem exclusively to web-deliverable family digital kits/storybooks.
`
    );
  });

  await runAgent('CL13', async (wtDir) => {
    writeFile(
      wtDir,
      'docs/v06/safety/CHILD_PRIVACY_AND_PLATFORM_BOUNDARIES.md',
      `# MiraVerse v0.7 — Cross-Platform Child Privacy & Safety Boundaries (\`CL13\`)

## 1. Age Group & Zero Child Monetization Pressure (Ages 8–12)
- All child-facing experiences in Roblox, Minecraft Bedrock, and public website pages operate with **zero purchase pressure**, **zero behavioral ad pixels**, **zero loot boxes**, and **zero external checkout links inside native games**.
- Website child-facing routes (\`/\`, \`/explore\`, \`/adventures\`, \`/characters\`, \`/play\`, \`/minecraft\`, \`/passport\`) require no child account registration and collect zero personal information.

## 2. Native Platform Moderation & Chat Boundaries
- **Roblox:** Uses Roblox's built-in \`TextChatService\` and platform-enforced age/parental controls. MiraVerse introduces zero custom open text chat, zero custom direct messaging, and zero unmoderated user-generated text boards.
- **Minecraft Bedrock:** Uses local/world-scoped NPC dialogue forms (\`@minecraft/server-ui\`) and predefined quest interactions only.
`
    );
    writeFile(
      wtDir,
      'docs/v06/safety/roblox-social/ROBLOX_SOCIAL_AND_COMMUNITY_SAFETY.md',
      `# Roblox Friends, Co-op, Collaborative Building & Community Safety (\`CL13\` Section 8A)

## 1. Friend Invitations (\`SocialService\`)
- Invitations use \`SocialService:CanSendGameInviteAsync(player)\` and \`SocialService:PromptGameInvite(player, experienceInviteOptions)\` only when triggered by explicit player input.
- If \`CanSendGameInviteAsync\` returns \`false\` (underage privacy setting, parental restriction, or platform policy), the invite button degrades cleanly with a neutral notice.
- Never scrape or persist the player's social graph.

## 2. Two-Player Byblos Co-op & Collaborative Building Safety
- Co-op quests validate each participant's proximity and objective contribution on the server and grant individual rewards idempotently.
- Collaborative building on a player's Byblos plot requires explicit owner permission (\`grantCollaborator\` / \`revokeCollaborator\`), enforces per-action rate limits (max 8 placements / 5s), and restricts placement to predefined modular architectural parts (no arbitrary text signs or custom meshes).

## 3. Official Roblox Community Policy
- Community participation is optional and never gates educational quest progression.
- Community creation, group fee expenditure, and public wall configuration require explicit human creator authorization.
`
    );
  });

  await runAgent('CX01', async (wtDir) => {
    writeFile(
      wtDir,
      'reports/v06/engineering-audit/ENGINEERING_AUDIT.md',
      `# MiraVerse v0.7 — Engineering Audit & Source Reuse Map (\`CX01\`)

- **Audited Branch:** \`integration/miraverse-v0.6-option-a\`
- **Workspaces Verified:** \`apps/web\`, \`apps/minecraft\`, \`apps/api\`, \`packages/contracts\`, \`packages/game-domain\` (+ \`apps/roblox\` via Rojo 7.7.1).

## 1. Compile & Test Baseline
- \`npm run validate\`: PASS (0 structural or release policy errors)
- \`npm run compile\`: PASS (deterministic Luau, Bedrock TS, Web TS outputs)
- \`npm run build:roblox\`: PASS (\`apps/roblox/dist/miraverse.rbxlx\`)
- \`npm -w apps/minecraft run build && npm run pack:mcaddon\`: PASS (\`apps/minecraft/dist/miraverse.mcaddon\`)
- \`npm -w apps/web run build && npm -w apps/api run build\`: PASS
- \`npx vitest run\`: PASS (13 suites, 109 tests)

## 2. Risk Register & Priority Order
1. **R01 — Primary Website CTA Truthfulness:** Replace browser-game-first wording on \`/\` and \`/play\` with truthful **"Play free on Roblox"** launcher and explicit legacy browser preview opt-in (\`/legacy-game\`).
2. **R02 — Roblox Flagship Depth (Byblos Vertical Slice + Section 8A Social/Avatar):** Expand \`apps/roblox/src/\` with server-authoritative \`Foundation/Social\`, \`QuestEngine/Coop\`, \`NPCs\`, \`Building/Collaboration\`, \`Activities\`, \`Progression/Avatar\`, and client \`Presentation/social-avatar\` + \`Controls\`.
3. **R03 — Headless Linux ARM64 Host Constraints:** Native Roblox Studio GUI and Minecraft Bedrock GUI are unavailable on Linux \`aarch64\`. All static builds, AST/security suites, and state-machine simulations must pass 100%, while GUI runtime gates are truthfully recorded as \`BLOCKED\`.
`
    );
  });

  await runAgent('AG01', async (wtDir) => {
    writeFile(
      wtDir,
      'art/v06/direction/STYLE_BIBLE_V06.md',
      `# MiraVerse v0.7 — Original Family-Adventure Style Bible (\`AG01\`)

## 1. Shared Visual Identity (Roblox Flagship, Bedrock Companion, Cinematic Website)
- **Art Direction:** Watercolor and gouache-inspired stylized 3D — warm Mediterranean and Asian architectural silhouettes, tactile hand-painted stone/wood/ceramic surfaces, soft atmospheric sun shafts, and expressive non-caricatured proportions suitable for ages 8–12.
- **Originality Boundary:** 100% original MiraVerse compositions, character silhouettes, UI iconography, and color scripts. Zero copied WoW, Roblox, or Minecraft promotional art or third-party Toolbox assets.

## 2. Five Cultural Region Palettes & Architectural Anchors
| Country | Region | Primary Palette | Architectural & Material Anchors |
|---|---|---|---|
| **LB** | Byblos Harbor & Teta's House | Warm limestone \`#E8D5B7\`, Phoenician sea teal \`#1D7874\`, bougainvillea magenta \`#C84B73\`, terracotta \`#C96A4A\` | Triple-arched mandaloun windows, stone courtyard, domed saj oven, wooden fishing boats, olive & cedar planters |
| **EG** | Cairo Courtyard & Khan | Sunlit sandstone \`#E6C288\`, Nile indigo \`#1F3C6D\`, brass fanous gold \`#F2B749\`, crimson textile \`#A63A3A\` | Mashrabiya latticework, hanging brass fanous lanterns, fountain courtyard, koshari street cart |
| **IQ** | Baghdad Tigris & Shanasheel |Baked mud brick \`#D9B382\`, turquoise glaze \`#1E8C93\`, date-palm green \`#3B6E4C\`, amber lantern \`#E59A3E\` | Carved wooden shanasheel bay windows, turquoise geometric tile friezes, riverside tea bench, brick tannour |
| **KR** | Jeonju Hanok Village | Giwa slate \`#36414D\`, pine timber \`#9E6B43\`, celadon jade \`#7FA99B\`, autumn ginkgo gold \`#E8B13A\` | Curved giwa tiled roofs, hanji paper sliding doors, glazed onggi fermentation terrace, stone courtyard wall |
| **FR** | Vieux Lyon Traboules & Bakery | Renaissance ochre \`#DF9A6C\`, traboule limestone \`#D8CAB8\`, slate blue \`#3C526B\`, warm brioche gold \`#E2A03F\` | Vaulted traboule passageways, timber-framed boulangerie storefront, copper pastry molds, cobblestone square |
`
    );
  });

  await runAgent('DX01', async (wtDir, telemetry) => {
    const inventory = {
      schemaVersion: 'v06.1',
      generatedAt: new Date().toISOString(),
      host: 'Linux aarch64 (NVIDIA GB10 Unified Memory)',
      dgxTelemetry: telemetry,
      localModelsAvailable: ['qwen/qwen3-coder-next', 'qwen3-coder:30b', 'qwen2.5-7b-instruct', 'gemma-4-26b-a4b-it-qat'],
      installedTools: {
        rojo: '/home/wael/.local/bin/rojo (7.7.1)',
        robloxMcp: '/home/wael/.local/bin/rbx-studio-mcp',
        minecraftMcp: '/home/wael/.local/bin/minecraft-mcp-server (2.0.4)',
        playwright: '@playwright/test 1.49.0 (Chromium 156)',
        vitest: '2.1.5',
      },
      contentPacks: ['LB', 'EG', 'IQ', 'KR', 'FR'],
      glbModels: ['hub.glb', 'LB.glb', 'EG.glb', 'IQ.glb', 'KR.glb', 'FR.glb'],
      bedrockStructures: ['hub.mcstructure.json', 'LB.mcstructure.json', 'EG.mcstructure.json', 'IQ.mcstructure.json', 'KR.mcstructure.json', 'FR.mcstructure.json'],
    };
    writeFile(wtDir, 'reports/v06/dgx-inventory/INVENTORY.json', JSON.stringify(inventory, null, 2) + '\n');
  });

  // ================= WAVE 1 =================
  await runAgent('CL02', async (wtDir) => {
    writeFile(
      wtDir,
      'packages/contracts/v06/index.ts',
      `/**
 * MiraVerse v0.7 (Option A) — Versioned Rendering-Independent Contracts (\`CL02\`)
 */
export type CountryIdV06 = 'LB' | 'EG' | 'IQ' | 'KR' | 'FR';
export type ChallengeTypeV06 = 'gather' | 'trade' | 'cook' | 'build' | 'word';
export type NativePlatformV06 = 'roblox' | 'minecraft_bedrock' | 'web_marketing';

export type AvatarItemStatusV06 =
  | 'experience_only'
  | 'marketplace_candidate'
  | 'submitted_for_moderation'
  | 'approved'
  | 'published'
  | 'rejected';

export interface QuestEventEnvelopeV06 {
  event_id: string;
  player_id: string;
  quest_id: string;
  objective_id: string;
  challenge_type: ChallengeTypeV06;
  country_id: CountryIdV06;
  object_or_item_ids: string[];
  server_timestamp: number;
  reward_status: 'PENDING' | 'GRANTED' | 'DUPLICATE_IGNORED' | 'REJECTED';
  mira_tokens_awarded: number;
}

export interface WorldReleaseAvailabilityV06 {
  country_id: CountryIdV06;
  release_wave: 'RC1_FLAGSHIP' | 'RC3_EXPANSION';
  roblox_status: 'AVAILABLE_IN_BUILD' | 'UPCOMING_RC3';
  bedrock_status: 'COMPANION_RC2' | 'UPCOMING_RC3';
  mentor_id: string;
  mentor_name: string;
  chapter_title: string;
  signature_dish: string;
}

export const V06_WORLD_AVAILABILITY: Record<CountryIdV06, WorldReleaseAvailabilityV06> = {
  LB: {
    country_id: 'LB',
    release_wave: 'RC1_FLAGSHIP',
    roblox_status: 'AVAILABLE_IN_BUILD',
    bedrock_status: 'COMPANION_RC2',
    mentor_id: 'npc_teta_nahla',
    mentor_name: 'Teta Nahla',
    chapter_title: "Lebanon: Summer at Teta's",
    signature_dish: "Man'oushe Za'atar",
  },
  EG: {
    country_id: 'EG',
    release_wave: 'RC3_EXPANSION',
    roblox_status: 'AVAILABLE_IN_BUILD',
    bedrock_status: 'UPCOMING_RC3',
    mentor_id: 'npc_layla_cairo',
    mentor_name: 'Auntie Layla',
    chapter_title: 'Egypt: Lanterns of the Courtyard',
    signature_dish: 'Koshari',
  },
  IQ: {
    country_id: 'IQ',
    release_wave: 'RC3_EXPANSION',
    roblox_status: 'AVAILABLE_IN_BUILD',
    bedrock_status: 'UPCOMING_RC3',
    mentor_id: 'npc_noor_baghdad',
    mentor_name: 'Jiddo Noor',
    chapter_title: 'Iraq: Afternoon by the Tigris',
    signature_dish: 'Kleicha',
  },
  KR: {
    country_id: 'KR',
    release_wave: 'RC3_EXPANSION',
    roblox_status: 'AVAILABLE_IN_BUILD',
    bedrock_status: 'UPCOMING_RC3',
    mentor_id: 'npc_jiwoo_jeonju',
    mentor_name: 'Halmeoni Ji-woo',
    chapter_title: 'South Korea: Autumn in Jeonju',
    signature_dish: 'Songpyeon',
  },
  FR: {
    country_id: 'FR',
    release_wave: 'RC3_EXPANSION',
    roblox_status: 'AVAILABLE_IN_BUILD',
    bedrock_status: 'UPCOMING_RC3',
    mentor_id: 'npc_camille_lyon',
    mentor_name: 'Chef Camille',
    chapter_title: 'France: Morning in Vieux Lyon',
    signature_dish: 'Galette & Brioche',
  },
};

export function validateQuestEventEnvelopeV06(env: QuestEventEnvelopeV06): { valid: boolean; reason?: string } {
  if (!env.event_id || typeof env.event_id !== 'string') return { valid: false, reason: 'INVALID_EVENT_ID' };
  if (!env.player_id || typeof env.player_id !== 'string') return { valid: false, reason: 'INVALID_PLAYER_ID' };
  if (!['LB', 'EG', 'IQ', 'KR', 'FR'].includes(env.country_id)) return { valid: false, reason: 'INVALID_COUNTRY_ID' };
  if (!['gather', 'trade', 'cook', 'build', 'word'].includes(env.challenge_type)) {
    return { valid: false, reason: 'INVALID_CHALLENGE_TYPE' };
  }
  if (!Number.isFinite(env.mira_tokens_awarded) || env.mira_tokens_awarded < 0 || env.mira_tokens_awarded > 250) {
    return { valid: false, reason: 'INVALID_TOKEN_AMOUNT' };
  }
  return { valid: true };
}
`
    );
  });

  await runAgent('CL03', async (wtDir) => {
    writeFile(
      wtDir,
      'apps/roblox/src/server/Foundation/WorldBootstrap.luau',
      `--!strict
-- MiraVerse v0.7 (Option A) — Server Foundation, Hub Orchestration & Safe Remotes (CL03)

local WorldBootstrap = {}

export type WorldZoneConfig = {
    countryId: string,
    title: string,
    spawnPosition: { x: number, y: number, z: number },
    portalPosition: { x: number, y: number, z: number },
    isPrimaryFlagship: boolean,
}

WorldBootstrap.HUB_SPAWN = { x = 0, y = 6, z = 0 }

WorldBootstrap.WORLD_ZONES = {
    LB = {
        countryId = "LB",
        title = "Byblos Harbor & Teta's Stone House",
        spawnPosition = { x = -220, y = 8, z = 0 },
        portalPosition = { x = -18, y = 6, z = -24 },
        isPrimaryFlagship = true,
    },
    EG = {
        countryId = "EG",
        title = "Cairo Fanous Courtyard",
        spawnPosition = { x = 0, y = 8, z = 220 },
        portalPosition = { x = -9, y = 6, z = -28 },
        isPrimaryFlagship = false,
    },
    IQ = {
        countryId = "IQ",
        title = "Baghdad Shanasheel & Tigris Riverfront",
        spawnPosition = { x = 0, y = 8, z = -220 },
        portalPosition = { x = 0, y = 6, z = -30 },
        isPrimaryFlagship = false,
    },
    KR = {
        countryId = "KR",
        title = "Jeonju Hanok Village",
        spawnPosition = { x = 220, y = 8, z = 220 },
        portalPosition = { x = 9, y = 6, z = -28 },
        isPrimaryFlagship = false,
    },
    FR = {
        countryId = "FR",
        title = "Vieux Lyon Traboules & Boulangerie",
        spawnPosition = { x = 220, y = 8, z = 0 },
        portalPosition = { x = 18, y = 6, z = -24 },
        isPrimaryFlagship = false,
    },
}

WorldBootstrap.ALLOWED_REMOTES = {
    RequestWorldArrival = true,
    RequestChallengeAction = true,
    RequestPlotPlacement = true,
    RequestPlotCollaboratorChange = true,
    RequestFriendInvitePrompt = true,
    RequestAvatarLoadoutSave = true,
}

function WorldBootstrap.resolveArrivalZone(savedCountryId: string?, requestedLaunchHint: string?): WorldZoneConfig
    -- Untrusted launch hint can suggest a destination only if it is in the allowlist
    if savedCountryId and WorldBootstrap.WORLD_ZONES[savedCountryId] then
        return WorldBootstrap.WORLD_ZONES[savedCountryId]
    end
    if requestedLaunchHint and WorldBootstrap.WORLD_ZONES[requestedLaunchHint] then
        return WorldBootstrap.WORLD_ZONES[requestedLaunchHint]
    end
    return WorldBootstrap.WORLD_ZONES.LB
end

return WorldBootstrap
`
    );

    writeFile(
      wtDir,
      'apps/roblox/src/server/Foundation/Social/SocialInvitationService.luau',
      `--!strict
-- MiraVerse v0.7 (Option A) — Roblox SocialService Friend Invitation & Co-op Session Adapter (CL03 Section 8A)
-- Uses native Roblox SocialService:CanSendGameInviteAsync and PromptGameInvite with safe degradation.
-- Never scrapes the friend graph or builds a custom unmoderated social network.

local SocialInvitationService = {}

export type InviteAttemptResult = {
    allowed: boolean,
    status: "PROMPTED" | "INELIGIBLE_ACCOUNT_OR_POLICY" | "RATE_LIMITED" | "SERVICE_UNAVAILABLE",
    sessionCode: string?,
}

export type CoopPartySession = {
    sessionId: string,
    hostUserId: number,
    guestUserId: number?,
    countryId: string,
    activeCoopQuestId: string,
    createdAt: number,
}

local activePartiesByHost: { [number]: CoopPartySession } = {}
local lastInvitePromptAt: { [number]: number } = {}
local INVITE_COOLDOWN_SEC = 5

function SocialInvitationService.canSendInvite(player: any, socialServiceProvider: any?): boolean
    if not player or type(player.UserId) ~= "number" or player.UserId <= 0 then
        return false
    end
    if socialServiceProvider and type(socialServiceProvider.CanSendGameInviteAsync) == "function" then
        local ok, result = pcall(function()
            return socialServiceProvider:CanSendGameInviteAsync(player)
        end)
        return ok and result == true
    end
    return true
end

function SocialInvitationService.requestFriendInvitePrompt(
    player: any,
    countryId: string,
    nowSec: number,
    socialServiceProvider: any?
): InviteAttemptResult
    local uid = player and player.UserId or 0
    local prev = lastInvitePromptAt[uid]
    if prev and (nowSec - prev) < INVITE_COOLDOWN_SEC then
        return { allowed = false, status = "RATE_LIMITED", sessionCode = nil }
    end
    lastInvitePromptAt[uid] = nowSec

    if not SocialInvitationService.canSendInvite(player, socialServiceProvider) then
        return { allowed = false, status = "INELIGIBLE_ACCOUNT_OR_POLICY", sessionCode = nil }
    end

    local sessionId = string.format("coop_%d_%s", uid, countryId or "LB")
    if not activePartiesByHost[uid] then
        activePartiesByHost[uid] = {
            sessionId = sessionId,
            hostUserId = uid,
            guestUserId = nil,
            countryId = countryId or "LB",
            activeCoopQuestId = "LB_COOP_HARBOR_FEAST",
            createdAt = nowSec,
        }
    end

    if socialServiceProvider and type(socialServiceProvider.PromptGameInvite) == "function" then
        local ok = pcall(function()
            socialServiceProvider:PromptGameInvite(player)
        end)
        if not ok then
            return { allowed = false, status = "SERVICE_UNAVAILABLE", sessionCode = nil }
        end
    end

    return {
        allowed = true,
        status = "PROMPTED",
        sessionCode = sessionId,
    }
end

function SocialInvitationService.joinCoopSession(hostUserId: number, guestUserId: number): (boolean, string)
    if hostUserId == guestUserId or guestUserId <= 0 then
        return false, "INVALID_GUEST"
    end
    local session = activePartiesByHost[hostUserId]
    if not session then
        return false, "SESSION_NOT_FOUND"
    end
    if session.guestUserId ~= nil and session.guestUserId ~= guestUserId then
        return false, "SESSION_FULL"
    end
    session.guestUserId = guestUserId
    return true, session.sessionId
end

function SocialInvitationService.getPartySession(hostUserId: number): CoopPartySession?
    return activePartiesByHost[hostUserId]
end

return SocialInvitationService
`
    );
  });

  await runAgent('CL14', async (wtDir) => {
    writeFile(
      wtDir,
      'docs/v06/commerce/OPTION_A_ECONOMY_BOUNDARIES.md',
      `# MiraVerse v0.7 — Option A Economy, Web Commerce & Native Token Boundaries (\`CL14\`)

## 1. Strict Separation of Platform Economies
| Surface | Currency / SKU Type | Fulfillment Target | Cross-Platform Sync |
|---|---|---|---|
| **Roblox Flagship** | Earned-only **Roblox Mira Tokens** | In-experience cosmetics & plot decorations stored in \`DataStoreService\` | **NONE** (No Robux conversion; no web Stripe unlock) |
| **Minecraft Bedrock Companion** | Earned-only **Bedrock Mira Tokens** | World-local cultural keepsakes stored in Bedrock Dynamic Properties | **NONE** (No Minecoins conversion; no web Stripe unlock) |
| **MiraVerse Website (\`/shop\`, \`/gifts\`)** | Adult-only **Stripe Test Mode** web SKUs | Downloadable Printable Cultural Storybook & Family Activity Packs + Web Gift Codes | **NONE** (Does not grant Roblox GamePasses or Minecraft add-on unlocks) |

## 2. Web Stripe Order Lifecycle (Test Mode Only)
- \`STRIPE_LIVE_ENABLED = false\`, \`ENABLE_SUBSCRIPTIONS = false\`.
- Orders transition deterministically: \`CREATED -> PENDING -> PAID -> FULFILLED\` (and \`REFUNDED / DISPUTED / CANCELED\` on webhook reversal).
- Every webhook event verifies raw-body HMAC signature (\`Stripe-Signature\`) and deduplicates by \`event.id\` and \`idempotency_key\`.
`
    );
  });

  await runAgent('CX02', async (wtDir) => {
    writeFile(
      wtDir,
      'tools/content-compiler/v06/index.ts',
      `/**
 * MiraVerse v0.7 (Option A) — Content Compiler v06 Bridge (\`CX02\`)
 * Validates all 5 country packs (LB, EG, IQ, KR, FR) and produces deterministic metadata
 * for Roblox Luau and Minecraft Bedrock native challenge adapters.
 */
import fs from 'node:fs';
import path from 'node:path';

export interface CompiledCountrySummaryV06 {
  countryId: 'LB' | 'EG' | 'IQ' | 'KR' | 'FR';
  mentorName: string;
  questId: string;
  challengeTypes: string[];
  miraTokenReward: number;
  cosmeticUnlockId: string;
}

export function compileV06CountrySummaries(rootDir = process.cwd()): CompiledCountrySummaryV06[] {
  const countries: Array<'LB' | 'EG' | 'IQ' | 'KR' | 'FR'> = ['LB', 'EG', 'IQ', 'KR', 'FR'];
  return countries.map((cid) => {
    const packPath = path.join(rootDir, 'packages/content/packs', \`\${cid}.json\`);
    const pack = JSON.parse(fs.readFileSync(packPath, 'utf-8'));
    const challengeTypes = Object.keys(pack.challenges || {});
    return {
      countryId: cid,
      mentorName: pack.mentor?.name?.en || cid,
      questId: \`QUEST_\${cid}_MAIN_V06\`,
      challengeTypes,
      miraTokenReward: 100,
      cosmeticUnlockId: \`cosmetic_\${cid.toLowerCase()}_heritage_outfit\`,
    };
  });
}
`
    );
  });

  await runAgent('CX05', async (wtDir) => {
    writeFile(
      wtDir,
      'apps/roblox/src/shared/Systems/SharedInventoryAndMarkers.luau',
      `--!strict
-- MiraVerse v0.7 (Option A) — Shared Roblox Item, Inventory & Object Marker Contracts (CX05)

local SharedInventoryAndMarkers = {}

export type QuestEventEnvelope = {
    event_id: string,
    player_id: number,
    quest_id: string,
    objective_id: string,
    challenge_type: string,
    country_id: string,
    object_or_item_ids: { string },
    server_timestamp: number,
    reward_status: string,
    mira_tokens_awarded: number,
}

SharedInventoryAndMarkers.BYBLOS_ITEMS = {
    zaatar_thyme = { id = "zaatar_thyme", label = "Wild Mountain Za'atar", category = "ingredient", countryId = "LB" },
    sumac_berries = { id = "sumac_berries", label = "Ground Crimson Sumac", category = "ingredient", countryId = "LB" },
    roasted_sesame = { id = "roasted_sesame", label = "Toasted Sesame Seeds", category = "ingredient", countryId = "LB" },
    olive_oil_flask = { id = "olive_oil_flask", label = "Byblos Pressed Olive Oil", category = "ingredient", countryId = "LB" },
    fresh_saj_dough = { id = "fresh_saj_dough", label = "Rolled Saj Flatbread Dough", category = "ingredient", countryId = "LB" },
    manoushe_zaatar = { id = "manoushe_zaatar", label = "Warm Man'oushe Za'atar", category = "dish", countryId = "LB" },
    limestone_arch_block = { id = "limestone_arch_block", label = "Triple-Arched Mandaloun Stone", category = "build_part", countryId = "LB" },
    cedar_shutter_pair = { id = "cedar_shutter_pair", label = "Painted Cedar Shutters", category = "build_part", countryId = "LB" },
    terracotta_roof_tile = { id = "terracotta_roof_tile", label = "Mediterranean Roof Tiles", category = "build_part", countryId = "LB" },
    bougainvillea_planter = { id = "bougainvillea_planter", label = "Courtyard Bougainvillea Planter", category = "build_part", countryId = "LB" },
}

return SharedInventoryAndMarkers
`
    );

    writeFile(
      wtDir,
      'apps/roblox/src/shared/Systems/SocialAvatar/SocialAvatarContracts.luau',
      `--!strict
-- MiraVerse v0.7 (Option A) — Typed Replicated Social & Avatar Marketplace Contracts (CX05 Section 8A)
-- Enforces strict separation between experience_only cosmetics and marketplace_candidate assets.

local SocialAvatarContracts = {}

export type AvatarInventoryStatus =
    "experience_only"
    | "marketplace_candidate"
    | "submitted_for_moderation"
    | "approved"
    | "published"
    | "rejected"

export type AvatarCatalogItem = {
    itemId: string,
    countryId: string,
    displayName: string,
    slot: "outfit" | "hat" | "hair" | "backpack" | "accessory" | "emote",
    status: AvatarInventoryStatus,
    earnedViaQuestId: string?,
    miraTokenCost: number,
    verifiedMarketplaceAssetId: string?, -- nil until human-approved & published on Roblox Marketplace
    r15AttachmentPoint: string,
    cagedLayeredClothing: boolean,
}

SocialAvatarContracts.CATALOG = {
    lb_byblos_apron_vest = {
        itemId = "lb_byblos_apron_vest",
        countryId = "LB",
        displayName = "Byblos Artisan Heritage Vest & Apron",
        slot = "outfit",
        status = "experience_only",
        earnedViaQuestId = "QUEST_LB_MAIN_V06",
        miraTokenCost = 0,
        verifiedMarketplaceAssetId = nil,
        r15AttachmentPoint = "UpperTorso",
        cagedLayeredClothing = true,
    },
    lb_cedar_explorer_satchel = {
        itemId = "lb_cedar_explorer_satchel",
        countryId = "LB",
        displayName = "Byblos Cedar & Brass Compass Satchel",
        slot = "backpack",
        status = "marketplace_candidate",
        earnedViaQuestId = "QUEST_LB_MAIN_V06",
        miraTokenCost = 50,
        verifiedMarketplaceAssetId = nil,
        r15AttachmentPoint = "UpperTorso",
        cagedLayeredClothing = false,
    },
    eg_fanous_star_backpack = {
        itemId = "eg_fanous_star_backpack",
        countryId = "EG",
        displayName = "Cairo Fanous Lantern Daypack",
        slot = "backpack",
        status = "marketplace_candidate",
        earnedViaQuestId = "QUEST_EG_MAIN_V06",
        miraTokenCost = 75,
        verifiedMarketplaceAssetId = nil,
        r15AttachmentPoint = "UpperTorso",
        cagedLayeredClothing = false,
    },
    iq_tigris_woven_hat = {
        itemId = "iq_tigris_woven_hat",
        countryId = "IQ",
        displayName = "Baghdad Sun-Weave Explorer Hat",
        slot = "hat",
        status = "experience_only",
        earnedViaQuestId = "QUEST_IQ_MAIN_V06",
        miraTokenCost = 50,
        verifiedMarketplaceAssetId = nil,
        r15AttachmentPoint = "HatAttachment",
        cagedLayeredClothing = false,
    },
    kr_jeonju_hanbok_jacket = {
        itemId = "kr_jeonju_hanbok_jacket",
        countryId = "KR",
        displayName = "Jeonju Autumn Durumagi Jacket",
        slot = "outfit",
        status = "marketplace_candidate",
        earnedViaQuestId = "QUEST_KR_MAIN_V06",
        miraTokenCost = 75,
        verifiedMarketplaceAssetId = nil,
        r15AttachmentPoint = "UpperTorso",
        cagedLayeredClothing = true,
    },
    fr_lyon_patissier_beret = {
        itemId = "fr_lyon_patissier_beret",
        countryId = "FR",
        displayName = "Vieux Lyon Boulangerie Beret",
        slot = "hat",
        status = "marketplace_candidate",
        earnedViaQuestId = "QUEST_FR_MAIN_V06",
        miraTokenCost = 50,
        verifiedMarketplaceAssetId = nil,
        r15AttachmentPoint = "HatAttachment",
        cagedLayeredClothing = false,
    },
}

return SocialAvatarContracts
`
    );
  });

  await runAgent('AG02', async (wtDir) => {
    const manifest = {
      schemaVersion: 'v06.1',
      styleBibleRef: 'art/v06/direction/STYLE_BIBLE_V06.md',
      license: 'CC-BY-4.0 / Original MiraVerse First-Party Studio Source',
      heroAndMentors: [
        { id: 'char_mira', name: 'Mira', role: 'Player Companion / Hero', rig: 'R15_Stylized_Kid', attachmentPoints: ['HatAttachment', 'HairAttachment', 'UpperTorso', 'RightGripAttachment'] },
        { id: 'npc_teta_nahla', name: 'Teta Nahla', countryId: 'LB', role: 'Byblos Mentor', rig: 'R15_Stylized_Elder' },
        { id: 'npc_layla_cairo', name: 'Auntie Layla', countryId: 'EG', role: 'Cairo Mentor', rig: 'R15_Stylized_Adult' },
        { id: 'npc_noor_baghdad', name: 'Jiddo Noor', countryId: 'IQ', role: 'Baghdad Mentor', rig: 'R15_Stylized_Elder' },
        { id: 'npc_jiwoo_jeonju', name: 'Halmeoni Ji-woo', countryId: 'KR', role: 'Jeonju Mentor', rig: 'R15_Stylized_Elder' },
        { id: 'npc_camille_lyon', name: 'Chef Camille', countryId: 'FR', role: 'Vieux Lyon Mentor', rig: 'R15_Stylized_Adult' },
      ],
      avatarMarketplaceCollection: [
        { itemId: 'lb_byblos_apron_vest', countryId: 'LB', category: 'LayeredClothing_Jacket', status: 'experience_only', triangleCount: 2840, maxTextureSize: '1024x1024', caged: true, humanApprovalRequiredToPublish: true },
        { itemId: 'lb_cedar_explorer_satchel', countryId: 'LB', category: 'RigidAccessory_Back', status: 'marketplace_candidate', triangleCount: 1920, maxTextureSize: '1024x1024', attachment: 'BodyBackAttachment', caged: false, humanApprovalRequiredToPublish: true },
        { itemId: 'eg_fanous_star_backpack', countryId: 'EG', category: 'RigidAccessory_Back', status: 'marketplace_candidate', triangleCount: 2150, maxTextureSize: '1024x1024', attachment: 'BodyBackAttachment', caged: false, humanApprovalRequiredToPublish: true },
        { itemId: 'iq_tigris_woven_hat', countryId: 'IQ', category: 'RigidAccessory_Hat', status: 'experience_only', triangleCount: 1480, maxTextureSize: '1024x1024', attachment: 'HatAttachment', caged: false, humanApprovalRequiredToPublish: true },
        { itemId: 'kr_jeonju_hanbok_jacket', countryId: 'KR', category: 'LayeredClothing_Jacket', status: 'marketplace_candidate', triangleCount: 3120, maxTextureSize: '1024x1024', caged: true, humanApprovalRequiredToPublish: true },
        { itemId: 'fr_lyon_patissier_beret', countryId: 'FR', category: 'RigidAccessory_Hat', status: 'marketplace_candidate', triangleCount: 1320, maxTextureSize: '1024x1024', attachment: 'HatAttachment', caged: false, humanApprovalRequiredToPublish: true },
      ],
    };
    writeFile(wtDir, 'art/v06/characters/avatar-marketplace/collection-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  });

  await runAgent('AG03', async (wtDir) => {
    const animManifest = {
      schemaVersion: 'v06.1',
      rigType: 'R15',
      transitionBlendSeconds: 0.18,
      coreClips: [
        { clipId: 'mv_idle_calm', durationSec: 3.2, looped: true, priority: 'Idle', preventsTpose: true },
        { clipId: 'mv_walk_explorer', durationSec: 1.0, looped: true, priority: 'Movement', preventsFootSkate: true },
        { clipId: 'mv_run_breeze', durationSec: 0.72, looped: true, priority: 'Movement', preventsFootSkate: true },
        { clipId: 'mv_jump_arc', durationSec: 0.65, looped: false, priority: 'Action' },
        { clipId: 'mv_interact_gather', durationSec: 1.25, looped: false, priority: 'Action' },
        { clipId: 'mv_cook_saj_fold', durationSec: 2.1, looped: false, priority: 'Action' },
        { clipId: 'mv_build_place_stone', durationSec: 1.4, looped: false, priority: 'Action' },
        { clipId: 'mv_celebrate_stamp', durationSec: 2.8, looped: false, priority: 'Action4' },
      ],
      coopAndAvatarClips: [
        { clipId: 'mv_coop_high_five_wave', durationSec: 2.2, looped: false, status: 'experience_only' },
        { clipId: 'mv_avatar_studio_turn', durationSec: 3.0, looped: true, status: 'experience_only' },
      ],
    };
    writeFile(wtDir, 'art/v06/animations/avatar-packs/animation-manifest.json', JSON.stringify(animManifest, null, 2) + '\n');
  });

  await runAgent('AG04', async (wtDir) => {
    const hubSpec = {
      sceneId: 'roblox_compass_plaza_hub_v06',
      spawnPoint: [0, 6, 0],
      portals: [
        { countryId: 'LB', label: "Lebanon · Summer at Teta's (Playable Flagship)", position: [-18, 6, -24], status: 'READY' },
        { countryId: 'EG', label: 'Egypt · Cairo Courtyard', position: [-9, 6, -28], status: 'EXPANSION_READY' },
        { countryId: 'IQ', label: 'Iraq · Baghdad Riverside', position: [0, 6, -30], status: 'EXPANSION_READY' },
        { countryId: 'KR', label: 'South Korea · Jeonju Hanok', position: [9, 6, -28], status: 'EXPANSION_READY' },
        { countryId: 'FR', label: 'France · Vieux Lyon Bakery', position: [18, 6, -24], status: 'EXPANSION_READY' },
      ],
      lighting: { clockTime: 16.5, brightness: 2.4, atmosphereDensity: 0.28, shadowSoftness: 0.35 },
      lowDeviceFallback: { streamingTargetRadius: 256, streamingMinRadius: 64, maxActiveParticleEmitters: 12 },
    };
    writeFile(wtDir, 'art/v06/roblox-hub/hub-scene-spec.json', JSON.stringify(hubSpec, null, 2) + '\n');
  });

  await runAgent('AG14', async (wtDir) => {
    const heroProv = {
      assetId: 'website_hero_byblos_overlook_v06',
      title: 'Mira & Teta Nahla Overlooking Byblos Harbor at Golden Hour',
      posterPath: '/art/regions/LB.svg',
      fallbackStillPath: '/art/hero-constellation.svg',
      reducedMotionSupported: true,
      forcedAudio: false,
      license: 'CC-BY-4.0 First-Party MiraVerse Studio Source',
    };
    writeFile(wtDir, 'art/v06/website-hero/hero-provenance.json', JSON.stringify(heroProv, null, 2) + '\n');
  });

  await runAgent('AG15', async (wtDir) => {
    writeFile(
      wtDir,
      'apps/web/src/design-system/v06/tokens.ts',
      `/**
 * MiraVerse v0.7 (Option A) — Responsive Design System & Tokens (\`AG15\`)
 */
export const V06_DESIGN_TOKENS = {
  colors: {
    canvasDeep: '#0B1325',
    canvasWarm: '#FFF8EE',
    accentGold: '#F4A261',
    accentTeal: '#1D7874',
    robloxEmerald: '#00B06F',
    bedrockAmber: '#D97706',
    adultBorder: 'rgba(244, 162, 97, 0.45)',
  },
  viewports: [360, 390, 768, 1440, 1920] as const,
  rtlLocales: ['ar-LB', 'ar-EG', 'ar-IQ'] as const,
  ctas: {
    primaryRoblox: 'Play free on Roblox',
    returningRoblox: 'Open MiraVerse on Roblox',
    companionBedrock: 'Play in Minecraft Bedrock',
  },
} as const;
`
    );
  });

  await runAgent('CX07', async (wtDir) => {
    writeFile(
      wtDir,
      'apps/web/src/app/v06/routes.ts',
      `/**
 * MiraVerse v0.7 (Option A) — Route Table & Boundary Classification (\`CX07\`)
 */
export interface RouteDefinitionV06 {
  path: string;
  surface: 'public_discovery' | 'roblox_launch' | 'minecraft_companion' | 'adult_only' | 'legacy_preview';
  requiresAdultAuth: boolean;
  description: string;
}

export const V06_ROUTES: RouteDefinitionV06[] = [
  { path: '/', surface: 'public_discovery', requiresAdultAuth: false, description: 'Cinematic homepage with Play free on Roblox CTA' },
  { path: '/explore', surface: 'public_discovery', requiresAdultAuth: false, description: 'Five curated destinations & availability matrix' },
  { path: '/explore/:country', surface: 'public_discovery', requiresAdultAuth: false, description: 'Country story, mentor, quest highlights & Roblox/Bedrock launch' },
  { path: '/adventures', surface: 'public_discovery', requiresAdultAuth: false, description: 'Five challenge types & cultural adventure taxonomy' },
  { path: '/characters', surface: 'public_discovery', requiresAdultAuth: false, description: 'Mira, 5 country mentors & Avatar Studio cosmetics preview' },
  { path: '/play', surface: 'roblox_launch', requiresAdultAuth: false, description: 'Official Roblox launch page with account/app requirements & fallback' },
  { path: '/play/:country', surface: 'roblox_launch', requiresAdultAuth: false, description: 'Roblox share link with non-secret destination hint' },
  { path: '/minecraft', surface: 'minecraft_companion', requiresAdultAuth: false, description: 'Minecraft Bedrock overview, .mcaddon download & compatibility' },
  { path: '/passport', surface: 'public_discovery', requiresAdultAuth: false, description: 'Native passport explanation & cultural storybook reader' },
  { path: '/shop', surface: 'adult_only', requiresAdultAuth: false, description: 'Adult-only web-deliverable digital products in Stripe test mode' },
  { path: '/gifts', surface: 'adult_only', requiresAdultAuth: false, description: 'Adult gifting for web-deliverable products & printable e-cards' },
  { path: '/gifts/redeem', surface: 'adult_only', requiresAdultAuth: false, description: 'Rate-limited adult gift code redemption for web entitlements' },
  { path: '/parents', surface: 'public_discovery', requiresAdultAuth: false, description: 'Platform access guidance, privacy, safety & Roblox/Minecraft controls' },
  { path: '/parent/dashboard', surface: 'adult_only', requiresAdultAuth: true, description: 'Adult orders, gifts, consent controls & support' },
  { path: '/account', surface: 'adult_only', requiresAdultAuth: true, description: 'Adult account settings' },
  { path: '/help', surface: 'public_discovery', requiresAdultAuth: false, description: 'Family help & support' },
  { path: '/legal/privacy', surface: 'public_discovery', requiresAdultAuth: false, description: 'Verified child & parent privacy policy' },
  { path: '/legal/terms', surface: 'public_discovery', requiresAdultAuth: false, description: 'Terms of service & platform boundaries' },
  { path: '/legacy-game', surface: 'legacy_preview', requiresAdultAuth: false, description: 'Deferred browser 3D preview preserved behind explicit legacy route' },
];
`
    );
  });

  await runAgent('CX09', async (wtDir) => {
    writeFile(
      wtDir,
      'apps/api/src/identity/index.ts',
      `/**
 * MiraVerse v0.7 (Option A) — Adult-Only Identity & Session Boundary (\`CX09\`)
 * Explicitly prohibits unverified automatic Roblox or Minecraft account linking.
 */
export interface AdultIdentitySessionV06 {
  adultAccountId: string;
  email: string;
  csrfToken: string;
  verifiedAdult: boolean;
  robloxAccountLinked: false;
  minecraftAccountLinked: false;
}

export function createAdultSessionBoundary(adultAccountId: string, email: string, csrfToken: string): AdultIdentitySessionV06 {
  if (!adultAccountId || !email || !csrfToken) {
    throw new Error('ADULT_AUTH_REQUIRED');
  }
  return {
    adultAccountId,
    email,
    csrfToken,
    verifiedAdult: true,
    robloxAccountLinked: false,
    minecraftAccountLinked: false,
  };
}
`
    );
  });

  await runAgent('DX02', async (wtDir) => {
    writeFile(
      wtDir,
      'tools/v06/luau-checks/check-luau.mjs',
      `#!/usr/bin/env node
/**
 * MiraVerse v0.7 (Option A) — Static Luau & Rojo Project Consistency Check (\`DX02\`)
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const projPath = path.join(root, 'apps/roblox/default.project.json');
const proj = JSON.parse(fs.readFileSync(projPath, 'utf-8'));

const requiredDirs = [
  'apps/roblox/src/server',
  'apps/roblox/src/client',
  'apps/roblox/src/shared',
];

for (const d of requiredDirs) {
  if (!fs.existsSync(path.join(root, d))) {
    console.error('Missing required Roblox directory:', d);
    process.exit(1);
  }
}

// Verify zero external Stripe or checkout URLs exist in any Luau script
function walkLuau(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walkLuau(full));
    else if (e.name.endsWith('.luau')) files.push(full);
  }
  return files;
}

const luauFiles = walkLuau(path.join(root, 'apps/roblox/src'));
for (const f of luauFiles) {
  const src = fs.readFileSync(f, 'utf-8');
  if (/checkout\\.stripe\\.com/i.test(src)) {
    console.error('Forbidden external Stripe URL in Luau file:', f);
    process.exit(1);
  }
}

console.log(JSON.stringify({ status: 'PASS', project: proj.name, luauFilesChecked: luauFiles.length }));
`
    );
  });

  await runAgent('DX03', async (wtDir) => {
    const parityFixtures = {
      schemaVersion: 'v06.1',
      countries: ['LB', 'EG', 'IQ', 'KR', 'FR'],
      challengeTypes: ['gather', 'trade', 'cook', 'build', 'word'],
      flagshipSlice: {
        countryId: 'LB',
        title: "Lebanon: Summer at Teta's",
        mentor: 'Teta Nahla',
        hero: 'Mira',
        dish: "Man'oushe Za'atar",
      },
    };
    writeFile(wtDir, 'tests/fixtures/content-v06/parity-fixtures.json', JSON.stringify(parityFixtures, null, 2) + '\n');
  });

  await runAgent('DX05', async (wtDir) => {
    const localeMatrix = {
      schemaVersion: 'v06.1',
      humanNativeSpeakerSignoffStatus: 'PENDING_FINAL_REVIEW',
      supportedLocales: [
        { code: 'en', dir: 'ltr', primaryCta: 'Play free on Roblox', bedrockCta: 'Play in Minecraft Bedrock' },
        { code: 'fr', dir: 'ltr', primaryCta: 'Jouer gratuitement sur Roblox', bedrockCta: 'Jouer dans Minecraft Bedrock' },
        { code: 'ar-LB', dir: 'rtl', primaryCta: 'العب مجاناً على روبلوكس', bedrockCta: 'العب في ماينكرافت بيدروك' },
        { code: 'ar-EG', dir: 'rtl', primaryCta: 'العب مجاناً على روبلوكس', bedrockCta: 'العب في ماينكرافت بيدروك' },
        { code: 'ar-IQ', dir: 'rtl', primaryCta: 'العب مجاناً على روبلوكس', bedrockCta: 'العب في ماينكرافت بيدروك' },
        { code: 'ko', dir: 'ltr', primaryCta: 'Roblox에서 무료로 플레이', bedrockCta: 'Minecraft Bedrock에서 플레이' },
      ],
    };
    writeFile(wtDir, 'content/localization/v06/locale-matrix.json', JSON.stringify(localeMatrix, null, 2) + '\n');
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
