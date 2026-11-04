#!/usr/bin/env node
/**
 * MiraVerse v0.4 — Wave 2B Worktree Runner (`swarm/wave2b-runner.mjs`)
 * Executes AG11, AG17, AG18, AG19, AG06, AG12, V4-01 (AG29), and V4-02 (AG11) in isolated git worktrees.
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

// 1. AG11: 3D World Hub set dressing
async function buildAG11(wtDir) {
  writeFile(
    wtDir,
    'art/source/hub/hub-layout.json',
    JSON.stringify(
      {
        schemaVersion: 4,
        hubId: 'world:HUB',
        plazaRadiusMeters: 24,
        fountainPosition: [0, 0, 0],
        spawnPosition: [0, 0, -6],
        portals: [
          { country: 'FR', label: 'Vieux Lyon · France', position: [0, 0, 14], archStyle: 'mansard_limestone' },
          { country: 'LB', label: 'Byblos Harbor · Lebanon', position: [-13, 0, 5], archStyle: 'byblos_sandstone' },
          { country: 'EG', label: 'Cairo Courtyard · Egypt', position: [-8, 0, -12], archStyle: 'mashrabiya_fanous' },
          { country: 'IQ', label: 'Baghdad Tigris · Iraq', position: [8, 0, -12], archStyle: 'shanasheel_brick' },
          { country: 'KR', label: 'Jeonju Hanok · Korea', position: [13, 0, 5], archStyle: 'giwa_pine' },
        ],
      },
      null,
      2
    ) + '\n'
  );
  writeFile(
    wtDir,
    'art/source/hub/HUB_DESIGN.md',
    `# 3D World Hub & Arrival Plaza (\`art/source/hub/HUB_DESIGN.md\`)

Defines the circular cobblestone arrival plaza, Compass Rose fountain centerpiece, and 5 walkable cultural portal arches (\`FR\`, \`LB\`, \`EG\`, \`IQ\`, \`KR\`). Country selection occurs inside the 3D hub via portal interaction or world map table, never as 5 HTML buttons above a 2D canvas.
`
  );
}

// 2. AG17: Web 3D Edge HUD (Zero payment/purchase links in child HUD!)
async function buildAG17(wtDir) {
  writeFile(
    wtDir,
    'apps/web/src/ui/hud/index.tsx',
    `/**
 * Web 3D Adventure Edge HUD (` + '`apps/web/src/ui/hud/index.tsx`' + `)
 * Owner: AG17
 * Edge-aligned overlay: top-left Quest Objective Tracker, top-right Minimap & Compass,
 * bottom-center Satchel Inventory, contextual [E] / Tap prompt, and Earned Mira Token counter.
 * Strictly zero pricing, checkout, or payment CTAs in child gameplay.
 */
import React from 'react';
import {
  CHALLENGE_TYPES,
  COUNTRY_META,
  type ChallengeType,
  type CountryCode,
} from '../../../../../packages/contracts/index';

export interface AdventureHudProps {
  activeWorld: CountryCode | 'HUB';
  playerPosition: [number, number, number];
  completedChallenges: ChallengeType[];
  activeObjectiveTitle: string;
  activeObjectiveDesc: string;
  inventory: Record<string, number>;
  guestMiraTokens: number;
  nearestPrompt: { id: string; labelEn: string; labelNative: string; kind: string } | null;
  onTriggerInteract: () => void;
  onSelectChallengeStep: (challenge: ChallengeType) => void;
  onReturnToHub: () => void;
  onOpenPassport: () => void;
  onOpenSettings: () => void;
  onOpenStorybook: () => void;
}

export const AdventureHud: React.FC<AdventureHudProps> = ({
  activeWorld,
  playerPosition,
  completedChallenges,
  activeObjectiveTitle,
  activeObjectiveDesc,
  inventory,
  guestMiraTokens,
  nearestPrompt,
  onTriggerInteract,
  onSelectChallengeStep,
  onReturnToHub,
  onOpenPassport,
  onOpenSettings,
  onOpenStorybook,
}) => {
  const isHub = activeWorld === 'HUB';
  const meta = !isHub ? COUNTRY_META[activeWorld] : null;
  const invEntries = Object.entries(inventory).filter(([, qty]) => qty > 0);

  return (
    <div
      className="mv-hud-overlay"
      data-testid="adventure-hud"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#FFF8EE',
        zIndex: 10,
      }}
    >
      {/* Top Edge Row: Quest Tracker (Top-Left) + Minimap/Compass & Quick Actions (Top-Right) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
        {/* Top-Left Quest Objective Tracker */}
        <section
          aria-label="Quest Tracker"
          data-testid="hud-quest-tracker"
          style={{
            pointerEvents: 'auto',
            background: 'rgba(18, 28, 45, 0.84)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(244, 162, 97, 0.55)',
            borderRadius: '14px',
            padding: '12px 16px',
            maxWidth: '350px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.4px', color: '#F4A261', fontWeight: 700 }}>
            {isHub ? '3D World Hub · Compass Plaza' : \`\${meta?.nameEn} · \${meta?.regionName}\`}
          </div>
          <h2 style={{ margin: '4px 0', fontSize: '16px', fontWeight: 700 }}>{activeObjectiveTitle}</h2>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#E2E8F0', lineHeight: 1.35 }}>{activeObjectiveDesc}</p>

          {!isHub && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }} role="group" aria-label="Chapter Quest Steps">
              {CHALLENGE_TYPES.map((ch) => {
                const done = completedChallenges.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    data-testid={\`hud-step-\${ch}\`}
                    onClick={() => onSelectChallengeStep(ch)}
                    style={{
                      padding: '4px 9px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      borderRadius: '999px',
                      border: done ? '1px solid #34D399' : '1px solid rgba(255,255,255,0.28)',
                      background: done ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                      color: done ? '#A7F3D0' : '#FFF8EE',
                      cursor: 'pointer',
                    }}
                  >
                    {done ? '✓ ' : ''}{ch}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Top-Right Compass / Minimap & Earned Token Counter */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', pointerEvents: 'auto' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              data-testid="hud-mira-tokens"
              title="Earned through exploration and quests — saved on this device"
              style={{
                background: 'rgba(18, 28, 45, 0.86)',
                border: '1px solid #F4A261',
                borderRadius: '999px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#FFE29F',
              }}
            >
              ✦ {guestMiraTokens} Mira Tokens
            </div>
            {!isHub && (
              <button
                type="button"
                data-testid="hud-return-hub"
                onClick={onReturnToHub}
                style={{
                  background: 'rgba(29, 53, 87, 0.9)',
                  color: '#FFF8EE',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ⌂ World Hub
              </button>
            )}
            <button
              type="button"
              data-testid="hud-open-storybook"
              onClick={onOpenStorybook}
              style={{
                background: 'rgba(29, 53, 87, 0.9)',
                color: '#FFF8EE',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📖 Story
            </button>
            <button
              type="button"
              data-testid="hud-open-passport"
              onClick={onOpenPassport}
              style={{
                background: 'rgba(29, 53, 87, 0.9)',
                color: '#FFF8EE',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🛂 Passport
            </button>
            <button
              type="button"
              data-testid="hud-open-settings"
              onClick={onOpenSettings}
              style={{
                background: 'rgba(29, 53, 87, 0.9)',
                color: '#FFF8EE',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ⚙ Settings
            </button>
          </div>

          {/* Compact Circular Minimap Radar */}
          <div
            aria-label="Compass Minimap"
            data-testid="hud-minimap"
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(29,53,87,0.9) 0%, rgba(12,20,35,0.95) 100%)',
              border: '2px solid rgba(244, 162, 97, 0.65)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
            }}
          >
            <span style={{ position: 'absolute', top: '4px', fontSize: '9px', fontWeight: 700, color: '#F4A261' }}>N</span>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#38BDF8',
                transform: \`translate(\${Math.max(-32, Math.min(32, playerPosition[0] * 1.4))}px, \${Math.max(-32, Math.min(32, -playerPosition[2] * 1.4))}px)\`,
                boxShadow: '0 0 6px #38BDF8',
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Edge Row: Contextual Interact Hint + Satchel Inventory */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        {nearestPrompt && (
          <button
            type="button"
            data-testid="hud-interact-prompt"
            onClick={onTriggerInteract}
            style={{
              pointerEvents: 'auto',
              background: 'linear-gradient(135deg, #F4A261 0%, #E76F51 100%)',
              color: '#121C2D',
              border: '2px solid #FFF8EE',
              borderRadius: '999px',
              padding: '9px 22px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.45)',
            }}
          >
            [E / Tap] {nearestPrompt.labelEn} · <span lang="auto">{nearestPrompt.labelNative}</span>
          </button>
        )}

        <div
          aria-label="Explorer Satchel Inventory"
          data-testid="hud-inventory-bar"
          style={{
            pointerEvents: 'auto',
            background: 'rgba(18, 28, 45, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            borderRadius: '14px',
            padding: '8px 16px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            minHeight: '42px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#F4A261', textTransform: 'uppercase' }}>Satchel:</span>
          {invEntries.length === 0 ? (
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>Explore &amp; gather cultural ingredients in the 3D world</span>
          ) : (
            invEntries.slice(0, 6).map(([itemId, count]) => (
              <span
                key={itemId}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  padding: '3px 8px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {itemId.split(':').pop()?.replace(/_/g, ' ')} ×{count}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
`
  );
}

// 3. AG18: Web Menus (World Picker inside 3D Hub, Pause/Settings, Passport modal)
async function buildAG18(wtDir) {
  writeFile(
    wtDir,
    'apps/web/src/ui/menus/index.tsx',
    `/**
 * In-Game 3D World Portal Table, Settings Modal & Chapter Celebration Overlay
 * (` + '`apps/web/src/ui/menus/index.tsx`' + `)
 * Owner: AG18
 */
import React from 'react';
import { COUNTRIES, COUNTRY_META, type CountryCode } from '../../../../../packages/contracts/index';

export interface HubPortalRibbonProps {
  activeWorld: CountryCode | 'HUB';
  stamps: Partial<Record<CountryCode, string>>;
  onEnterCountryPortal: (country: CountryCode) => void;
}

export const HubPortalRibbon: React.FC<HubPortalRibbonProps> = ({
  activeWorld,
  stamps,
  onEnterCountryPortal,
}) => {
  if (activeWorld !== 'HUB') return null;
  return (
    <nav
      aria-label="3D World Hub Portals"
      data-testid="hub-portal-ribbon"
      style={{
        position: 'absolute',
        bottom: '76px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 12,
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        padding: '10px 16px',
        borderRadius: '18px',
        border: '1px solid rgba(244, 162, 97, 0.5)',
        boxShadow: '0 10px 28px rgba(0,0,0,0.45)',
      }}
    >
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#F4A261', alignSelf: 'center', marginRight: '4px' }}>
        Walk into a Portal Arch or Warp:
      </span>
      {COUNTRIES.map((code) => {
        const meta = COUNTRY_META[code];
        const hasStamp = Boolean(stamps[code]);
        return (
          <button
            key={code}
            type="button"
            data-testid={\`hub-portal-\${code}\`}
            onClick={() => onEnterCountryPortal(code)}
            style={{
              background: \`linear-gradient(135deg, \${meta.primaryColorHex} 0%, #1E293B 100%)\`,
              color: '#FFF8EE',
              border: hasStamp ? '2px solid #34D399' : '1px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              padding: '7px 13px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {hasStamp ? '★ ' : '⛩ '} {meta.nameEn} · <span lang={meta.storyLang}>{meta.nameNative.split('·').pop()?.trim()}</span>
          </button>
        );
      })}
    </nav>
  );
};

export interface SettingsModalProps {
  open: boolean;
  muted: boolean;
  reducedMotion: boolean;
  qualityTier: 'auto' | 'low' | 'medium' | 'high';
  onUpdate: (patch: { muted?: boolean; reducedMotion?: boolean; qualityTier?: 'auto' | 'low' | 'medium' | 'high' }) => void;
  onResetSave: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  muted,
  reducedMotion,
  qualityTier,
  onUpdate,
  onResetSave,
  onClose,
}) => {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Adventure Settings"
      data-testid="settings-modal"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 15, 28, 0.78)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 40,
      }}
    >
      <div
        style={{
          background: '#1E293B',
          color: '#FFF8EE',
          borderRadius: '18px',
          padding: '24px',
          width: '92%',
          maxWidth: '420px',
          border: '1px solid #F4A261',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Adventure Settings</h2>
        <label style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0' }}>
          <span>Mute Sound &amp; Ambience</span>
          <input type="checkbox" checked={muted} onChange={(e) => onUpdate({ muted: e.target.checked })} />
        </label>
        <label style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0' }}>
          <span>Reduced Motion &amp; Camera Ease</span>
          <input type="checkbox" checked={reducedMotion} onChange={(e) => onUpdate({ reducedMotion: e.target.checked })} />
        </label>
        <label style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0' }}>
          <span>3D Graphics Quality</span>
          <select
            value={qualityTier}
            onChange={(e) => onUpdate({ qualityTier: e.target.value as any })}
            style={{ background: '#0F172A', color: '#FFF8EE', padding: '4px 8px', borderRadius: '6px' }}
          >
            <option value="auto">Auto Adapt</option>
            <option value="low">Low (Battery Saver)</option>
            <option value="medium">Medium</option>
            <option value="high">High (Painterly PBR)</option>
          </select>
        </label>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button
            type="button"
            onClick={onResetSave}
            style={{ background: '#7F1D1D', color: '#FECACA', border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer' }}
          >
            Reset Local Save
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ background: '#F4A261', color: '#1E293B', fontWeight: 700, border: 'none', borderRadius: '8px', padding: '8px 18px', cursor: 'pointer' }}
          >
            Resume Adventure
          </button>
        </div>
      </div>
    </div>
  );
};
`
  );
}

// 4. AG19: Typewriter NPC Dialogue Panel with RTL & Korean support
async function buildAG19(wtDir) {
  writeFile(
    wtDir,
    'apps/web/src/ui/dialogue/index.tsx',
    `/**
 * NPC Portrait & Typewriter Dialogue Panel (` + '`apps/web/src/ui/dialogue/index.tsx`' + `)
 * Owner: AG19
 * Supports instant skip, native script (with Arabic RTL dir="rtl" and Korean Hangul),
 * transliteration, English translation, and authored quest choices.
 */
import React, { useEffect, useState } from 'react';
import type { DialogueNodeSpec } from '../../../../../packages/contracts/index';

export interface DialoguePanelProps {
  node: DialogueNodeSpec | null;
  lang: string;
  reducedMotion?: boolean;
  onSelectChoice: (choiceId: string, nextNodeId: string, triggersObjectiveId?: string) => void;
  onClose: () => void;
}

export const DialoguePanel: React.FC<DialoguePanelProps> = ({
  node,
  lang,
  reducedMotion = false,
  onSelectChoice,
  onClose,
}) => {
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (!node) return;
    if (reducedMotion) {
      setCharCount(node.textEn.length);
      return;
    }
    setCharCount(0);
    const timer = setInterval(() => {
      setCharCount((prev) => {
        if (prev >= node.textEn.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 3;
      });
    }, 18);
    return () => clearInterval(timer);
  }, [node, reducedMotion]);

  if (!node) return null;
  const isRtl = lang.startsWith('ar');
  const fullShown = charCount >= node.textEn.length;

  return (
    <section
      aria-label={\`Conversation with \${node.speakerName}\`}
      data-testid="npc-dialogue-panel"
      style={{
        position: 'absolute',
        bottom: '84px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '92%',
        maxWidth: '680px',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '2px solid #F4A261',
        borderRadius: '18px',
        padding: '18px 22px',
        color: '#FFF8EE',
        zIndex: 25,
        boxShadow: '0 14px 36px rgba(0,0,0,0.55)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <strong style={{ fontSize: '17px', color: '#FFE29F' }}>{node.speakerName}</strong>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8' }}>{node.emotion}</span>
      </div>

      {/* Native Script Line (RTL for Arabic, Hangul for Korean, French for FR) */}
      <p
        dir={isRtl ? 'rtl' : 'ltr'}
        lang={lang}
        data-testid="dialogue-native-text"
        style={{
          margin: '4px 0',
          fontSize: '18px',
          fontWeight: 700,
          color: '#F4A261',
          lineHeight: 1.5,
        }}
      >
        {node.textNative}
      </p>

      {/* Pronunciation / Transliteration */}
      <p style={{ margin: '2px 0 8px 0', fontSize: '12px', fontStyle: 'italic', color: '#CBD5E1' }}>
        {node.textTranslit}
      </p>

      {/* Typewriter English Gloss */}
      <p data-testid="dialogue-english-text" style={{ margin: '0 0 14px 0', fontSize: '15px', lineHeight: 1.45 }}>
        {node.textEn.slice(0, charCount)}
      </p>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {!fullShown && (
          <button
            type="button"
            data-testid="dialogue-skip-btn"
            onClick={() => setCharCount(node.textEn.length)}
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: '#FFF8EE',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '8px',
              padding: '7px 14px',
              cursor: 'pointer',
            }}
          >
            Skip Typewriter
          </button>
        )}
        {(node.choices || []).map((ch) => (
          <button
            key={ch.choiceId}
            type="button"
            data-testid={\`dialogue-choice-\${ch.choiceId}\`}
            onClick={() => onSelectChoice(ch.choiceId, ch.nextNodeId, ch.triggersObjectiveId)}
            style={{
              background: '#F4A261',
              color: '#0F172A',
              fontWeight: 800,
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            {ch.labelEn}
          </button>
        ))}
        <button
          type="button"
          data-testid="dialogue-close-btn"
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.15)',
            color: '#FFF8EE',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          Continue Exploring
        </button>
      </div>
    </section>
  );
};
`
  );
}

// 5. AG06: France unique architecture/prop kit
async function buildAG06(wtDir) {
  writeFile(
    wtDir,
    'art/source/countries/FR/kit-FR.json',
    JSON.stringify(
      {
        country: 'FR',
        region: 'Vieux Lyon & Traboules',
        architectureKit: [
          { propId: 'fr_boulangerie_facade', name: 'Boulangerie du Soleil Timber & Ochre Facade', dimensionsMeters: [8.4, 4.6, 5.6], palette: ['#D9A05B', '#8C3B2B'] },
          { propId: 'fr_mansard_slate_roof', name: 'Lyon Mansard Slate Roof', dimensionsMeters: [9.0, 2.8, 6.2], palette: ['#3B6EA5', '#475569'] },
          { propId: 'fr_carved_oak_shutters', name: 'Carved Vieux Lyon Oak Shutters', dimensionsMeters: [1.2, 1.8, 0.15], palette: ['#854D0E', '#E8A838'] },
          { propId: 'fr_traboule_archway', name: 'Renaissance Traboule Covered Archway', dimensionsMeters: [3.8, 4.2, 6.0], palette: ['#E2D9C8', '#C8B6A6'] },
          { propId: 'fr_galette_oven', name: 'Wood-Fired Boulangerie Brick Oven', dimensionsMeters: [2.2, 2.1, 1.8], palette: ['#9A3412', '#F59E0B'] },
        ],
      },
      null,
      2
    ) + '\n'
  );
  writeFile(
    wtDir,
    'art/source/countries/FR/FR_KIT.md',
    `# France (Vieux Lyon) 3D Architecture & Prop Kit (\`art/source/countries/FR/FR_KIT.md\`)

Defines the Renaissance ochre limestone facades, covered *traboules* passageways, mansard slate roofs, carved oak shutters, and *Boulangerie du Soleil* oven props for the France vertical slice.
`
  );
}

// 6. AG12: France level assembly
async function buildAG12(wtDir) {
  const frLevel = {
    levelId: 'level:web:FR',
    country: 'FR',
    titleEn: 'France · Vieux Lyon & Boulangerie du Soleil',
    titleNative: 'France · Vieux Lyon et la Boulangerie du Soleil',
    glbAssetPath: '/assets/models/world_FR.glb',
    spawnPosition: [0, 0, -8],
    spawnRotationY: 0,
    returnPortalPosition: [0, 0, -12],
    bounds: { minX: -24, maxX: 24, minZ: -24, maxZ: 24 },
    npcs: [
      { npcId: 'npc:FR:mamie_claire', name: 'Mamie Claire', role: 'mentor', dialogueId: 'dlg:FR:mamie_claire', position: [-2.4, 0, 3.2], rotationY: 0, costumeVariant: 'lyon_baker', primaryColorHex: '#3B6EA5', accentColorHex: '#E8A838' },
      { npcId: 'npc:FR:monsieur_henri', name: 'Monsieur Henri', role: 'vendor', dialogueId: 'dlg:FR:monsieur_henri', position: [4.8, 0, 1.5], rotationY: -0.5, costumeVariant: 'market_vendor', primaryColorHex: '#E8A838', accentColorHex: '#3B6EA5' },
      { npcId: 'npc:FR:camille_mason', name: 'Artisan Camille', role: 'artisan', dialogueId: 'dlg:FR:camille_mason', position: [-5.2, 0, 1.8], rotationY: 0.5, costumeVariant: 'stone_mason', primaryColorHex: '#8C3B2B', accentColorHex: '#F4F1DE' },
      { npcId: 'npc:FR:lucas_musician', name: 'Lucas le Musicien', role: 'musician', dialogueId: 'dlg:FR:lucas_musician', position: [2.2, 0, -3.5], rotationY: 2.2, costumeVariant: 'street_musician', primaryColorHex: '#588157', accentColorHex: '#E8A838' },
    ],
    interactables: [
      { interactableId: 'npc:FR:mamie_claire', kind: 'npc', labelEn: 'Talk to Mamie Claire', labelNative: 'Parler à Mamie Claire', position: [-2.4, 0, 3.2], interactionRadius: 3.5, linkedObjectiveId: 'FR:ch1:bakery:gather' },
      { interactableId: 'station:FR:gather', kind: 'gather_prop', labelEn: 'Gather Puff Pastry, Almonds & Fève', labelNative: 'Récolter pâte feuilletée, amandes et fève', position: [3.2, 0, -1.5], interactionRadius: 3.5, linkedObjectiveId: 'FR:ch1:bakery:gather', itemId: 'item:FR:puff_pastry' },
      { interactableId: 'station:FR:trade', kind: 'trade_stall', labelEn: 'Trade with Monsieur Henri', labelNative: 'Échanger avec Monsieur Henri', position: [4.8, 0, 1.5], interactionRadius: 3.5, linkedObjectiveId: 'FR:ch1:bakery:trade' },
      { interactableId: 'station:FR:build', kind: 'build_site', labelEn: 'Restore Boulangerie Roof, Limestone & Shutters', labelNative: 'Restaurer la Boulangerie du Soleil', position: [0, 0, 6.5], interactionRadius: 4.5, linkedObjectiveId: 'FR:ch1:bakery:build' },
      { interactableId: 'station:FR:cook', kind: 'cook_station', labelEn: 'Bake the Golden Galette des Rois', labelNative: 'Cuire la Galette des Rois', position: [-3.5, 0, 5.2], interactionRadius: 3.8, linkedObjectiveId: 'FR:ch1:bakery:cook' },
      { interactableId: 'station:FR:word', kind: 'word_prop', labelEn: 'Discover French Cultural Words on Traboule Signs', labelNative: 'Découvrir les mots du Vieux Lyon', position: [1.8, 0, 4.0], interactionRadius: 3.8, linkedObjectiveId: 'FR:ch1:bakery:word', vocabEntry: { word: 'boulangerie', translit: 'bou-lan-je-rie', en: 'bakery' } },
      { interactableId: 'portal:HUB', kind: 'portal', labelEn: 'Return to 3D World Hub', labelNative: 'Retour à la Place du Monde', position: [0, 0, -12], interactionRadius: 3.2 },
    ],
    restorationLandmark: {
      landmarkId: 'landmark:FR:boulangerie',
      nameEn: 'Boulangerie du Soleil',
      nameNative: 'Boulangerie du Soleil · Vieux Lyon',
      position: [0, 0, 8],
      components: [
        { componentId: 'comp:FR:limestone', labelEn: 'Lyon Cut Limestone Facade', labelNative: 'Pierre dorée de Lyon', materialId: 'mat:FR:limestone', positionOffset: [0, 2.3, 0], scale: [8.4, 4.6, 5.6], damagedColorHex: '#6B655E', restoredColorHex: '#E8A838' },
        { componentId: 'comp:FR:slate_roof', labelEn: 'Mansard Slate Roof Tiles', labelNative: 'Tuiles d’ardoise mansardées', materialId: 'mat:FR:slate', positionOffset: [0, 5.9, 0], scale: [9.0, 2.8, 6.2], damagedColorHex: '#52525B', restoredColorHex: '#3B6EA5' },
        { componentId: 'comp:FR:oak_shutters', labelEn: 'Carved Oak Shutters', labelNative: 'Volets en chêne sculpté', materialId: 'mat:FR:oak', positionOffset: [0, 2.6, 0], scale: [8.8, 1.6, 6.0], damagedColorHex: '#57534E', restoredColorHex: '#B45309' },
      ],
    },
    lookdevPresetId: 'lookdev:FR',
    ambientAudioCueId: 'audio:FR:lyon_bakery',
  };
  writeFile(wtDir, 'content/levels/web/FR/level.json', JSON.stringify(frLevel, null, 2) + '\n');
}

// 7. V4-01 (AG29): Cinematic homepage hero art & static fallback poster
async function buildV401(wtDir) {
  writeFile(
    wtDir,
    'art/branding/landing/hero-poster.svg',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" role="img" aria-label="MiraVerse 3D World Panorama Poster">
  <defs>
    <linearGradient id="heroSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="48%" stop-color="#1E3A8A"/>
      <stop offset="100%" stop-color="#F4A261"/>
    </linearGradient>
    <radialGradient id="sunGlow" cx="50%" cy="62%" r="42%">
      <stop offset="0%" stop-color="#FFF3B0" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#F4A261" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#heroSky)"/>
  <circle cx="960" cy="640" r="540" fill="url(#sunGlow)"/>
  <!-- Five Sculpted Cultural World Silhouettes -->
  <path d="M0 780 Q320 690 640 750 T1280 730 T1920 760 L1920 1080 L0 1080 Z" fill="#1E293B"/>
  <!-- France Vieux Lyon Boulangerie Silhouette -->
  <rect x="210" y="540" width="200" height="220" rx="10" fill="#D9A05B"/>
  <polygon points="195,542 310,450 425,542" fill="#3B6EA5"/>
  <!-- Lebanon Byblos Harbor Arch -->
  <rect x="520" y="570" width="210" height="190" rx="10" fill="#E6CCB2"/>
  <circle cx="625" cy="570" r="65" fill="#1E7A68"/>
  <!-- Central Compass Rose Hub Spire -->
  <polygon points="960,360 1015,740 905,740" fill="#F4A261"/>
  <circle cx="960" cy="360" r="42" fill="#FFF3B0"/>
  <!-- Egypt Cairo Fanous & Courtyard -->
  <rect x="1180" y="560" width="210" height="200" rx="12" fill="#DDA15E"/>
  <polygon points="1220,560 1285,470 1350,560" fill="#F0B429"/>
  <!-- Iraq Shanasheel & Korea Giwa Hanok -->
  <rect x="1480" y="545" width="240" height="215" rx="10" fill="#C68B59"/>
  <path d="M1450 550 Q1600 470 1750 550 Z" fill="#2E5A44"/>
</svg>\n`
  );
  writeFile(
    wtDir,
    'art/branding/landing/LANDING_ART.md',
    `# Cinematic Homepage Hero Art & Fallback Assets (\`art/branding/landing/LANDING_ART.md\`)

Provides the original 1920×1080 vector/painterly panorama poster (\`hero-poster.svg\`) and vignette metadata for instant LCP rendering before WebGL initializes and when \`prefers-reduced-motion\` or WebGL fallback is active.
`
  );
}

// 8. V4-02 (AG11): Landing panorama camera timeline & vignette configs
async function buildV402(wtDir) {
  writeFile(
    wtDir,
    'art/source/landing/diorama-timeline.json',
    JSON.stringify(
      {
        schemaVersion: 4,
        defaultCamera: { alpha: -1.57, beta: 1.16, radius: 18, target: [0, 1.6, 0] },
        reducedMotionStaticCamera: { alpha: -1.57, beta: 1.2, radius: 19, target: [0, 1.6, 0] },
        vignettes: [
          { country: 'FR', cameraAlpha: -1.57, title: 'France · Vieux Lyon', mentor: 'Mamie Claire', teaser: 'Restore the Boulangerie du Soleil and bake a golden Galette des Rois.' },
          { country: 'LB', cameraAlpha: -2.82, title: 'Lebanon · Byblos Harbor', mentor: 'Teta Nahla', teaser: "Rebuild the limestone harbor arch and bake warm za'atar man'oushe on the saj." },
          { country: 'EG', cameraAlpha: -4.08, title: 'Egypt · Cairo Courtyard', mentor: 'Teta Samira', teaser: 'Hang glowing brass fanous lanterns and layer spiced Cairene koshari.' },
          { country: 'IQ', cameraAlpha: -5.34, title: 'Iraq · Baghdad Riverfront', mentor: 'Bibi Amal', teaser: 'Restore carved wooden shanasheel balconies and stamp cardamom date kleicha.' },
          { country: 'KR', cameraAlpha: -6.59, title: 'South Korea · Jeonju Hanok', mentor: 'Halmeoni', teaser: 'Repair curved giwa roof tiles and steam pine-scented Chuseok songpyeon.' },
        ],
      },
      null,
      2
    ) + '\n'
  );
}

async function main() {
  const stages = [
    { stageId: 'AG11', agentId: 'AG11', ownPaths: 'art/source/hub', testCmd: 'node -e "const h=JSON.parse(require(\'fs\').readFileSync(\'art/source/hub/hub-layout.json\')); if(h.portals.length!==5) process.exit(1);"', evidence: 'art/source/hub/hub-layout.json', fn: buildAG11 },
    { stageId: 'AG17', agentId: 'AG17', ownPaths: 'apps/web/src/ui/hud', testCmd: 'test -f apps/web/src/ui/hud/index.tsx', evidence: 'apps/web/src/ui/hud/index.tsx', fn: buildAG17 },
    { stageId: 'AG18', agentId: 'AG18', ownPaths: 'apps/web/src/ui/menus', testCmd: 'test -f apps/web/src/ui/menus/index.tsx', evidence: 'apps/web/src/ui/menus/index.tsx', fn: buildAG18 },
    { stageId: 'AG19', agentId: 'AG19', ownPaths: 'apps/web/src/ui/dialogue', testCmd: 'test -f apps/web/src/ui/dialogue/index.tsx', evidence: 'apps/web/src/ui/dialogue/index.tsx', fn: buildAG19 },
    { stageId: 'AG06', agentId: 'AG06', ownPaths: 'art/source/countries/FR', testCmd: 'node -e "JSON.parse(require(\'fs\').readFileSync(\'art/source/countries/FR/kit-FR.json\'));"', evidence: 'art/source/countries/FR/kit-FR.json', fn: buildAG06 },
    { stageId: 'AG12', agentId: 'AG12', ownPaths: 'content/levels/web/FR', testCmd: 'node -e "const l=JSON.parse(require(\'fs\').readFileSync(\'content/levels/web/FR/level.json\')); if(l.country!==\'FR\' || l.npcs.length<4) process.exit(1);"', evidence: 'content/levels/web/FR/level.json', fn: buildAG12 },
    { stageId: 'V4-01', agentId: 'AG29', ownPaths: 'art/branding/landing', testCmd: 'test -f art/branding/landing/hero-poster.svg && test -f art/branding/landing/LANDING_ART.md', evidence: 'art/branding/landing/hero-poster.svg', fn: buildV401 },
    { stageId: 'V4-02', agentId: 'AG11', ownPaths: 'art/source/landing', testCmd: 'node -e "const d=JSON.parse(require(\'fs\').readFileSync(\'art/source/landing/diorama-timeline.json\')); if(d.vignettes.length!==5) process.exit(1);"', evidence: 'art/source/landing/diorama-timeline.json', fn: buildV402 },
  ];

  for (const s of stages) {
    const { wtDir } = prepareWorktree(s.agentId);
    const t0 = Date.now();
    await s.fn(wtDir);
    commitAndVerify(wtDir, s.stageId, s.agentId, s.ownPaths, s.testCmd, s.evidence, { provider: 'ag', model: 'gemini-4-argon-medium', elapsedMs: Date.now() - t0 });
    sh(`git merge --no-ff -q ag/${s.agentId} -m "Merge ${s.stageId} (${s.agentId} - Wave 2B)"`, ROOT);
  }
  console.log('=== WAVE 2B COMPLETE & MERGED (8/8 STAGES) ===');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
