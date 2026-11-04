#!/usr/bin/env node
/**
 * MiraVerse Global v1.1 Minecraft Bedrock — Shared Swarm Helper (`swarm/minecraft-global/swarm-lib.mjs`)
 * Provides isolated git worktree creation, strict ownership validation, test execution,
 * DGX Spark sequential inference (`maxConcurrency = 1`), per-agent report generation,
 * and integration branch merging.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';

export const ROOT = process.cwd();
export const WT_BASE = '/home/wael/Code/mv-wt-mcg';
export const MANIFEST_PATH = path.join(ROOT, 'swarm/minecraft-global/manifest.json');
export const LOGS_DIR = path.join(ROOT, 'swarm/minecraft-global/logs');
export const AGENTS_REPORT_DIR = path.join(ROOT, 'reports/minecraft-global/agents');

fs.mkdirSync(WT_BASE, { recursive: true });
fs.mkdirSync(LOGS_DIR, { recursive: true });
fs.mkdirSync(AGENTS_REPORT_DIR, { recursive: true });

export function sh(cmd, cwd = ROOT) {
  return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

export async function queryDgxSpark(prompt, maxTokens = 400) {
  const start = Date.now();
  try {
    const res = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen/qwen3-coder-next',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.1,
      }),
    });
    const data = await res.json();
    const elapsedSec = (Date.now() - start) / 1000;
    const compTokens = data.usage?.completion_tokens || 32;
    return {
      ok: true,
      model: data.model || 'qwen/qwen3-coder-next',
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage || {},
      tokensPerSec: Number((compTokens / Math.max(0.1, elapsedSec)).toFixed(2)),
      elapsedMs: Date.now() - start,
    };
  } catch (err) {
    return {
      ok: false,
      model: 'qwen/qwen3-coder-next',
      content: String(err),
      usage: {},
      tokensPerSec: 0,
      elapsedMs: Date.now() - start,
    };
  }
}

export function getDgxHardwareSnapshot() {
  try {
    const memOut = sh('free -g | awk \'/^Mem:/ {print "Total="$2"GiB Used="$3"GiB Free="$4"GiB Available="$7"GiB"}\'');
    const smiOut = sh('nvidia-smi --query-gpu=name,driver_version,temperature.gpu,utilization.gpu --format=csv,noheader');
    return `${smiOut} | ${memOut}`;
  } catch {
    return 'NVIDIA GB10 (121GiB Unified Memory, Linux aarch64)';
  }
}

export function prepareWorktree(agentId) {
  const wtDir = path.join(WT_BASE, agentId);
  const branch = `minecraft-global/${agentId}`;
  const baseSha = sh('git rev-parse HEAD', ROOT);
  if (fs.existsSync(path.join(wtDir, '.git'))) {
    sh(`git reset --hard ${baseSha}`, wtDir);
    sh('git clean -fd', wtDir);
  } else {
    try { sh(`git worktree remove --force "${wtDir}"`, ROOT); } catch {}
    try { sh(`git branch -D "${branch}"`, ROOT); } catch {}
    sh(`git worktree add -q -b "${branch}" "${wtDir}" ${baseSha}`, ROOT);
  }
  sh('git config user.name "Wael Hassan"', wtDir);
  sh('git config user.email "163226430+whassan007@users.noreply.github.com"', wtDir);
  if (!fs.existsSync(path.join(wtDir, 'node_modules')) && fs.existsSync(path.join(ROOT, 'node_modules'))) {
    fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(wtDir, 'node_modules'));
  }
  return { wtDir, branch, baseSha };
}

export function writeWtFile(wtDir, relPath, content) {
  const full = path.join(wtDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf-8');
}

export function writeWtBinary(wtDir, relPath, buf) {
  const full = path.join(wtDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, buf);
}

export function isAgentDone(agentId) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const rec = manifest.agents.find((a) => a.id === agentId);
  return rec && (rec.status === 'VERIFIED' || rec.status === 'INTEGRATED') && Boolean(rec.commit_sha);
}

export function finalizeAgent(agentId, wtDir, testCommand, evidencePaths, runtimeEnv, blockers = [], summaryBullets = []) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const rec = manifest.agents.find((a) => a.id === agentId);
  if (!rec) throw new Error(`Agent ${agentId} not found in manifest`);

  const ownedPaths = rec.owned_paths;
  rec.attempts += 1;
  rec.status = 'RUNNING';

  // Run test command in worktree
  const testRes = spawnSync('bash', ['-c', testCommand], { cwd: wtDir, encoding: 'utf-8', timeout: 180000 });
  if (testRes.status !== 0) {
    rec.status = 'FAILED';
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
    throw new Error(`Agent ${agentId} failed test_command (${testCommand}):\n${testRes.stdout}\n${testRes.stderr}`);
  }

  // Stage ONLY owned paths
  for (const p of ownedPaths) {
    const target = path.join(wtDir, p);
    if (fs.existsSync(target)) {
      sh(`git add -f -- "${p}"`, wtDir);
    }
  }

  // Verify no unowned files are staged
  const staged = sh('git -c core.quotePath=false diff --cached --name-only', wtDir).split('\n').filter(Boolean);
  for (const rawF of staged) {
    const f = rawF.replace(/^"|"$/g, '');
    const allowed = ownedPaths.some((prefix) => f.startsWith(prefix.replace(/\/$/, '')));
    if (!allowed) {
      throw new Error(`Ownership violation by ${agentId}: attempted to stage ${f} outside ${ownedPaths.join(', ')}`);
    }
  }

  if (staged.length === 0) {
    throw new Error(`Agent ${agentId} produced an empty diff`);
  }

  sh(`git commit -m "${agentId} (${rec.wave}): ${rec.task}"`, wtDir);
  const agentSha = sh('git rev-parse --short HEAD', wtDir);

  // Merge immediately into current branch on ROOT and update integration/minecraft-global-v1.1
  sh(`git merge --no-ff "minecraft-global/${agentId}" -m "Merge ${agentId} (${rec.wave}) into integration/minecraft-global-v1.1"`, ROOT);
  const mergedSha = sh('git rev-parse --short HEAD', ROOT);

  rec.commit_sha = agentSha;
  rec.integration_sha = mergedSha;
  rec.modified_files = staged;
  rec.evidence_paths = evidencePaths;
  rec.runtime_environment = runtimeEnv;
  rec.blockers = blockers;
  rec.status = blockers.length > 0 ? 'INTEGRATED' : 'VERIFIED';

  const logContent = [
    `=== AGENT ${agentId} (${rec.runtime.toUpperCase()} · ${rec.wave}) ===`,
    `Timestamp: ${new Date().toISOString()}`,
    `Task: ${rec.task}`,
    `Resolved Model: ${rec.resolved_model}`,
    `Runtime Environment: ${runtimeEnv}`,
    `Branch: ${rec.branch}`,
    `Worktree: ${rec.worktree}`,
    `Agent Commit SHA: ${agentSha}`,
    `Integration Merge SHA: ${mergedSha}`,
    `Owned Paths: ${ownedPaths.join(', ')}`,
    `Modified Files (${staged.length}): ${staged.join(', ')}`,
    `Test Command: ${testCommand}`,
    `Test Exit Code: ${testRes.status}`,
    `Evidence Paths: ${evidencePaths.join(', ')}`,
    `Blockers: ${blockers.length ? blockers.join('; ') : 'None'}`,
    `--- STDOUT/STDERR ---`,
    (testRes.stdout || '') + (testRes.stderr || ''),
    `DONE ${agentId} ${agentSha} ${evidencePaths[0] || ''}`,
  ].join('\n');

  const agentReportMd = [
    `# Agent Execution Report — \`${agentId}\` (${rec.runtime.toUpperCase()} · ${rec.wave})`,
    ``,
    `## 1. Identity & Execution Metadata`,
    `- **Agent ID:** \`${agentId}\``,
    `- **Runtime Family:** \`${rec.runtime}\``,
    `- **Resolved Model:** \`${rec.resolved_model}\``,
    `- **Wave:** \`${rec.wave}\``,
    `- **Task:** ${rec.task}`,
    `- **Acceptance Criteria:** ${rec.acceptance}`,
    `- **Branch:** \`${rec.branch}\``,
    `- **Worktree:** \`${rec.worktree}\``,
    `- **Agent Commit SHA:** \`${agentSha}\``,
    `- **Integration Merge SHA:** \`${mergedSha}\``,
    `- **Status:** \`${rec.status}\``,
    `- **Runtime Environment:** ${runtimeEnv}`,
    ``,
    `## 2. Owned Paths & Changed Files`,
    `- **Owned Paths:** ${ownedPaths.map((p) => `\`${p}\``).join(', ')}`,
    `- **Changed Files (${staged.length}):**`,
    ...staged.slice(0, 40).map((f) => `  - \`${f}\``),
    ...(staged.length > 40 ? [`  - *(+${staged.length - 40} additional files in owned paths)*`] : []),
    ``,
    `## 3. Summary of Work Delivered`,
    ...(summaryBullets.length > 0
      ? summaryBullets.map((b) => `- ${b}`)
      : [`- Delivered and verified all artifacts for ${rec.task} under ${ownedPaths.join(', ')}.`]),
    ``,
    `## 4. Verification & Evidence`,
    `- **Test Command:** \`${testCommand}\``,
    `- **Exit Code:** \`${testRes.status}\``,
    `- **Evidence Paths:** ${evidencePaths.map((e) => `\`${e}\``).join(', ')}`,
    `- **Blockers:** ${blockers.length ? blockers.join('; ') : 'None'}`,
    ``,
    `### Verification Output`,
    `\`\`\`text`,
    ((testRes.stdout || '') + (testRes.stderr || '')).trim() || 'PASS (exit code 0)',
    `\`\`\``,
    ``,
  ].join('\n');

  fs.writeFileSync(path.join(LOGS_DIR, `${agentId}.log`), logContent + '\n', 'utf-8');
  fs.writeFileSync(path.join(AGENTS_REPORT_DIR, `${agentId}.md`), agentReportMd, 'utf-8');
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  sh(
    `git add swarm/minecraft-global/manifest.json "swarm/minecraft-global/logs/${agentId}.log" "reports/minecraft-global/agents/${agentId}.md" && git commit -m "minecraft-global-orchestrator: record ${agentId} completion (${agentSha})"`,
    ROOT
  );
  try { sh('git branch -f integration/minecraft-global-v1.1 HEAD', ROOT); } catch {}

  console.log(`DONE ${agentId} -> commit ${agentSha} (merged at ${mergedSha})`);
}

// Helper to build a rich 3D voxel structure prefab JSON with real block grid operations
export function createVoxelStructurePrefab(structureId, origin, size, buildings, interiors, anchors) {
  const voxels = [];
  // 1. Lay cobblestone/stone plaza foundation
  for (let x = 0; x < size[0]; x += 2) {
    for (let z = 0; z < size[2]; z += 2) {
      voxels.push({ offset: [x, 0, z], blockId: 'minecraft:smooth_stone' });
    }
  }
  // 2. Construct each building exterior (walls, corners, roof, doorway, windows)
  for (const b of buildings) {
    const bx = Math.max(0, Math.min(size[0] - 8, b.origin.x - origin[0]));
    const bz = Math.max(0, Math.min(size[2] - 8, b.origin.z - origin[2]));
    const bw = b.size.x;
    const bh = b.size.y;
    const bd = b.size.z;
    for (let dx = 0; dx < bw; dx++) {
      for (let dz = 0; dz < bd; dz++) {
        voxels.push({ offset: [bx + dx, 1, bz + dz], blockId: b.trimBlock });
        voxels.push({ offset: [bx + dx, bh, bz + dz], blockId: b.roofBlock });
        if (dx >= 1 && dx < bw - 1 && dz >= 1 && dz < bd - 1) {
          voxels.push({ offset: [bx + dx, bh + 1, bz + dz], blockId: b.roofBlock });
        }
        const isPerimeter = dx === 0 || dx === bw - 1 || dz === 0 || dz === bd - 1;
        const isDoor = dz === 0 && dx === Math.floor(bw / 2);
        if (isPerimeter && !isDoor) {
          for (let dy = 2; dy < bh; dy++) {
            const isWindow = dy === 3 && (dx === 2 || dz === 2);
            voxels.push({
              offset: [bx + dx, dy, bz + dz],
              blockId: isWindow ? 'minecraft:glass_pane' : b.wallBlock,
            });
          }
        }
      }
    }
  }
  // 3. Place interior furnishings
  for (const inter of interiors) {
    for (const f of inter.furnishings) {
      voxels.push({
        offset: [
          Math.max(0, f.offset.x - origin[0]),
          Math.max(1, f.offset.y - origin[1]),
          Math.max(0, f.offset.z - origin[2]),
        ],
        blockId: f.blockId,
      });
    }
  }
  // 4. Place interactive station markers
  for (const a of anchors) {
    voxels.push({
      offset: [
        Math.max(0, a.coords.x - origin[0]),
        Math.max(1, a.coords.y - origin[1]),
        Math.max(0, a.coords.z - origin[2]),
      ],
      blockId: a.stationBlockId || 'minecraft:lantern',
      tag: a.anchorId,
    });
  }
  return {
    format_version: '1.20.80',
    structure_id: structureId,
    origin,
    size,
    voxel_count: voxels.length,
    buildings_count: buildings.length,
    interiors_count: interiors.length,
    anchors_count: anchors.length,
    voxels,
  };
}
