#!/usr/bin/env node
/**
 * Miraverse Real-World Topography Reconstruction — 40-Agent Ledger & Swarm Library
 * Ratio: DGX Spark (16) : Gemini/Antigravity (16) : Codex (4) : Claude (4) = 4 : 4 : 1 : 1
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync, spawnSync } from 'node:child_process';

export const ROOT = '/home/wael/Code/Miraverse';
export const WT_BASE = '/home/wael/Code/mv-wt-terrain';
export const LEDGER_PATH = path.join(ROOT, 'reports/terrain/agent-execution-ledger.json');
export const STUDIO_LOCK_PATH = path.join(ROOT, 'swarm/terrain-v17/.studio.lock');
export const LOGS_DIR = path.join(ROOT, 'swarm/terrain-v17/logs');

fs.mkdirSync(WT_BASE, { recursive: true });
fs.mkdirSync(LOGS_DIR, { recursive: true });
fs.mkdirSync(path.dirname(LEDGER_PATH), { recursive: true });

export const ASSIGNMENTS = [
  // === 16 DGX SPARK AGENTS ===
  {
    agentId: 'DGX-01',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 1,
    task: 'Repository and current terrain architecture audit',
    ownedPaths: ['reports/terrain/agents/DGX-01.md'],
  },
  {
    agentId: 'DGX-02',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 1,
    task: 'DEM source discovery, licensing and caching',
    ownedPaths: ['content/terrain/manifests/source-registry.json', 'reports/terrain/geographic-sources.md', 'reports/terrain/data-licenses.md', 'reports/terrain/agents/DGX-02.md'],
  },
  {
    agentId: 'DGX-03',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 1,
    task: 'GIS reprojection, clipping and elevation conversion',
    ownedPaths: ['tools/terrain/gis_pipeline.py', 'reports/terrain/terrain-pipeline.md', 'reports/terrain/agents/DGX-03.md'],
  },
  {
    agentId: 'DGX-04',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 1,
    task: 'Roblox heightmap, voxel and material generation',
    ownedPaths: ['tools/terrain/generate_luau_terrain.py', 'reports/terrain/agents/DGX-04.md'],
  },
  {
    agentId: 'DGX-05',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 2,
    task: 'Lebanon: Byblos, Mount Lebanon, Beirut',
    ownedPaths: ['content/terrain/manifests/LB.json', 'reports/terrain/countries/LB/gis-report.md', 'reports/terrain/agents/DGX-05.md'],
  },
  {
    agentId: 'DGX-06',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 2,
    task: 'Egypt: Cairo, Alexandria, Aswan',
    ownedPaths: ['content/terrain/manifests/EG.json', 'reports/terrain/countries/EG/gis-report.md', 'reports/terrain/agents/DGX-06.md'],
  },
  {
    agentId: 'DGX-07',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 2,
    task: 'Iraq: Baghdad, Erbil, Basra',
    ownedPaths: ['content/terrain/manifests/IQ.json', 'reports/terrain/countries/IQ/gis-report.md', 'reports/terrain/agents/DGX-07.md'],
  },
  {
    agentId: 'DGX-08',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 2,
    task: 'South Korea: Jeonju, Seoul, Busan',
    ownedPaths: ['content/terrain/manifests/KR.json', 'reports/terrain/countries/KR/gis-report.md', 'reports/terrain/agents/DGX-08.md'],
  },
  {
    agentId: 'DGX-09',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 2,
    task: 'France: Lyon, Paris, Marseille',
    ownedPaths: ['content/terrain/manifests/FR.json', 'reports/terrain/countries/FR/gis-report.md', 'reports/terrain/agents/DGX-09.md'],
  },
  {
    agentId: 'DGX-10',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 2,
    task: 'Germany: Rhine terrain',
    ownedPaths: ['content/terrain/manifests/DE.json', 'reports/terrain/countries/DE/gis-report.md', 'reports/terrain/agents/DGX-10.md'],
  },
  {
    agentId: 'DGX-11',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 2,
    task: 'China: Wuling-inspired landscape',
    ownedPaths: ['content/terrain/manifests/CN.json', 'reports/terrain/countries/CN/gis-report.md', 'reports/terrain/agents/DGX-11.md'],
  },
  {
    agentId: 'DGX-12',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 2,
    task: 'Japan: Bashō/Tohoku geographic references',
    ownedPaths: ['content/terrain/manifests/JP.json', 'reports/terrain/countries/JP/gis-report.md', 'reports/terrain/agents/DGX-12.md'],
  },
  {
    agentId: 'DGX-13',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 2,
    task: 'Russia: Lake Svetloyar',
    ownedPaths: ['content/terrain/manifests/RU.json', 'reports/terrain/countries/RU/gis-report.md', 'reports/terrain/agents/DGX-13.md'],
  },
  {
    agentId: 'DGX-14',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 2,
    task: 'Ukraine: Kyiv hills and Dnipro',
    ownedPaths: ['content/terrain/manifests/UA.json', 'reports/terrain/countries/UA/gis-report.md', 'reports/terrain/agents/DGX-14.md'],
  },
  {
    agentId: 'DGX-15',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 2,
    task: 'Morocco: Marrakesh and Atlas regional relief',
    ownedPaths: ['content/terrain/manifests/MA.json', 'reports/terrain/countries/MA/gis-report.md', 'reports/terrain/agents/DGX-15.md'],
  },
  {
    agentId: 'DGX-16',
    backend: 'dgx-spark',
    model: 'qwen3-coder:30b',
    reasoningEffort: 'low',
    wave: 3,
    task: 'Geographic accuracy, tile seams, performance and source validation',
    ownedPaths: ['reports/terrain/country-coverage.csv', 'reports/terrain/geographic-accuracy.csv', 'reports/terrain/agents/DGX-16.md'],
  },

  // === 16 GEMINI / ANTIGRAVITY AGENTS ===
  {
    agentId: 'AG-01',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'low',
    wave: 1,
    task: 'Studio baseline, current terrain and spatial layout',
    ownedPaths: ['reports/terrain/agents/AG-01.md'],
  },
  {
    agentId: 'AG-02',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'medium',
    wave: 1,
    task: 'Lebanon terrain reconstruction',
    ownedPaths: ['apps/roblox/src/server/world/BeirutWorld.luau', 'reports/terrain/countries/LB/README.md', 'reports/terrain/agents/AG-02.md'],
  },
  {
    agentId: 'AG-03',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'low',
    wave: 2,
    task: 'Egypt terrain reconstruction',
    ownedPaths: ['reports/terrain/countries/EG/README.md', 'reports/terrain/agents/AG-03.md'],
  },
  {
    agentId: 'AG-04',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'low',
    wave: 2,
    task: 'Iraq terrain reconstruction',
    ownedPaths: ['reports/terrain/countries/IQ/README.md', 'reports/terrain/agents/AG-04.md'],
  },
  {
    agentId: 'AG-05',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'low',
    wave: 2,
    task: 'South Korea terrain reconstruction',
    ownedPaths: ['reports/terrain/countries/KR/README.md', 'reports/terrain/agents/AG-05.md'],
  },
  {
    agentId: 'AG-06',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'low',
    wave: 2,
    task: 'France terrain reconstruction',
    ownedPaths: ['reports/terrain/countries/FR/README.md', 'reports/terrain/agents/AG-06.md'],
  },
  {
    agentId: 'AG-07',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'low',
    wave: 2,
    task: 'Germany Rhine scene',
    ownedPaths: ['reports/terrain/countries/DE/README.md', 'reports/terrain/agents/AG-07.md'],
  },
  {
    agentId: 'AG-08',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'low',
    wave: 2,
    task: 'China landscape scene',
    ownedPaths: ['reports/terrain/countries/CN/README.md', 'reports/terrain/agents/AG-08.md'],
  },
  {
    agentId: 'AG-09',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'low',
    wave: 2,
    task: 'Japan journey environment',
    ownedPaths: ['reports/terrain/countries/JP/README.md', 'reports/terrain/agents/AG-09.md'],
  },
  {
    agentId: 'AG-10',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'low',
    wave: 2,
    task: 'Russia Lake Svetloyar scene',
    ownedPaths: ['reports/terrain/countries/RU/README.md', 'reports/terrain/agents/AG-10.md'],
  },
  {
    agentId: 'AG-11',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'low',
    wave: 2,
    task: 'Ukraine Kyiv scene',
    ownedPaths: ['reports/terrain/countries/UA/README.md', 'reports/terrain/agents/AG-11.md'],
  },
  {
    agentId: 'AG-12',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'low',
    wave: 2,
    task: 'Morocco Marrakesh scene',
    ownedPaths: ['reports/terrain/countries/MA/README.md', 'reports/terrain/agents/AG-12.md'],
  },
  {
    agentId: 'AG-13',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'low',
    wave: 1,
    task: 'Regional vegetation, water, materials and lighting',
    ownedPaths: ['reports/terrain/agents/AG-13.md'],
  },
  {
    agentId: 'AG-14',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'low',
    wave: 1,
    task: 'Spawn, navigation, NPC and quest compatibility',
    ownedPaths: ['reports/terrain/gameplay-regression.csv', 'reports/terrain/agents/AG-14.md'],
  },
  {
    agentId: 'AG-15',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'low',
    wave: 3,
    task: 'Mobile performance, streaming and collision tests',
    ownedPaths: ['reports/terrain/performance.csv', 'reports/terrain/agents/AG-15.md'],
  },
  {
    agentId: 'AG-16',
    backend: 'gemini-antigravity',
    model: 'flash',
    reasoningEffort: 'medium',
    wave: 3,
    task: 'Source-to-game visual comparison and real Studio evidence',
    ownedPaths: ['reports/terrain/studio-evidence/README.md', 'reports/terrain/agents/AG-16.md'],
  },

  // === 4 CODEX AGENTS ===
  {
    agentId: 'CODEX-01',
    backend: 'codex',
    model: 'codex-cli-0.166.0',
    reasoningEffort: 'medium',
    wave: 1,
    task: 'GIS-to-Roblox Pipeline',
    ownedPaths: ['apps/roblox/src/shared/TerrainPipeline.luau', 'reports/terrain/agents/CODEX-01.md'],
  },
  {
    agentId: 'CODEX-02',
    backend: 'codex',
    model: 'codex-cli-0.166.0',
    reasoningEffort: 'medium',
    wave: 2,
    task: 'World and Location Integration',
    ownedPaths: ['apps/roblox/src/shared/WorldRegistry.luau', 'apps/roblox/src/server/MapBuilder.luau', 'reports/terrain/agents/CODEX-02.md'],
  },
  {
    agentId: 'CODEX-03',
    backend: 'codex',
    model: 'codex-cli-0.166.0',
    reasoningEffort: 'medium',
    wave: 2,
    task: 'Performance and Streaming',
    ownedPaths: ['apps/roblox/src/server/world/RegionalTerrainBuilder.luau', 'reports/terrain/agents/CODEX-03.md'],
  },
  {
    agentId: 'CODEX-04',
    backend: 'codex',
    model: 'codex-cli-0.166.0',
    reasoningEffort: 'medium',
    wave: 3,
    task: 'Automated Testing and Build Integration',
    ownedPaths: ['tests/roblox/terrain-gis-pipeline.test.ts', 'reports/terrain/test-results.md', 'reports/terrain/agents/CODEX-04.md'],
  },

  // === 4 CLAUDE AGENTS ===
  {
    agentId: 'CLAUDE-01',
    backend: 'claude',
    model: 'sonnet',
    reasoningEffort: 'medium',
    wave: 1,
    task: 'Principal Geographic Architect',
    ownedPaths: ['reports/terrain/agents/CLAUDE-01.md'],
  },
  {
    agentId: 'CLAUDE-02',
    backend: 'claude',
    model: 'sonnet',
    reasoningEffort: 'medium',
    wave: 2,
    task: 'Roblox World Architecture Reviewer',
    ownedPaths: ['reports/terrain/agents/CLAUDE-02.md'],
  },
  {
    agentId: 'CLAUDE-03',
    backend: 'claude',
    model: 'sonnet',
    reasoningEffort: 'medium',
    wave: 2,
    task: 'Geographic and Cultural Integrity Reviewer',
    ownedPaths: ['reports/terrain/agents/CLAUDE-03.md'],
  },
  {
    agentId: 'CLAUDE-04',
    backend: 'claude',
    model: 'sonnet',
    reasoningEffort: 'high',
    wave: 3,
    task: 'Independent Release Assurance',
    ownedPaths: ['reports/terrain/unresolved-defects.md', 'reports/terrain/agents/CLAUDE-04.md'],
  },
];

export function initLedger() {
  let existing = [];
  if (fs.existsSync(LEDGER_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'));
    } catch {}
  }
  const byId = new Map(existing.map((e) => [e.agentId, e]));
  const ledger = ASSIGNMENTS.map((a) => {
    const prev = byId.get(a.agentId);
    return {
      agentId: a.agentId,
      backend: a.backend,
      model: a.model,
      reasoningEffort: a.reasoningEffort,
      wave: a.wave,
      task: a.task,
      ownedPaths: a.ownedPaths,
      sessionId: prev?.sessionId || null,
      worktree: prev?.worktree || path.join(WT_BASE, a.agentId),
      status: prev?.status || 'REGISTERED',
      startTime: prev?.startTime || null,
      endTime: prev?.endTime || null,
      commitIds: prev?.commitIds || [],
      evidencePaths: prev?.evidencePaths || [],
      externalTokenUsage: prev?.externalTokenUsage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      estimatedCost: prev?.estimatedCost || 0,
      blockers: prev?.blockers || [],
    };
  });
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2) + '\n');
  return ledger;
}

export function updateAgentLedger(agentId, patch) {
  const ledger = initLedger();
  const idx = ledger.findIndex((e) => e.agentId === agentId);
  if (idx === -1) throw new Error(`Unknown agentId: ${agentId}`);
  ledger[idx] = { ...ledger[idx], ...patch };
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2) + '\n');
  return ledger[idx];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const l = initLedger();
  const counts = l.reduce((acc, item) => {
    acc[item.backend] = (acc[item.backend] || 0) + 1;
    return acc;
  }, {});
  console.log('Initialized 40-agent ledger at', LEDGER_PATH);
  console.log('Allocation:', counts);
}
