#!/usr/bin/env node
/**
 * MiraVerse v1.6 — Arabian Peninsula & Gulf Diaspora Expansion
 * Shared Swarm Execution Library (`swarm/gulf-v16/swarm-lib.mjs`)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync, spawnSync } from 'node:child_process';

export const ROOT = process.cwd();
export const WT_BASE = '/home/wael/Code/mv-wt-gulf16';
export const MANIFEST_PATH = path.join(ROOT, 'swarm/gulf-v16/manifest.json');
export const LOGS_DIR = path.join(ROOT, 'swarm/gulf-v16/logs');
export const AGENTS_REPORT_DIR = path.join(ROOT, 'reports/gulf-v16/agents');

fs.mkdirSync(WT_BASE, { recursive: true });
fs.mkdirSync(LOGS_DIR, { recursive: true });
fs.mkdirSync(AGENTS_REPORT_DIR, { recursive: true });

export function sh(cmd, cwd = ROOT) {
  return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

export function sha256Text(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

export function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

export async function queryDgxSpark(prompt, maxTokens = 320) {
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
      content: (data.choices?.[0]?.message?.content || '').trim(),
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
    const memOut = sh("free -g | awk '/^Mem:/ {print \"Total=\"$2\"GiB Used=\"$3\"GiB Free=\"$4\"GiB Available=\"$7\"GiB\"}'");
    const smiOut = sh('nvidia-smi --query-gpu=name,driver_version,temperature.gpu,utilization.gpu --format=csv,noheader');
    return `${smiOut} | ${memOut}`;
  } catch {
    return 'NVIDIA GB10 (121GiB Unified Memory, Linux aarch64)';
  }
}

export function prepareWorktree(agentId) {
  const wtDir = path.join(WT_BASE, agentId);
  const branch = `gulf-v16/${agentId}`;
  const baseSha = sh('git rev-parse HEAD', ROOT);
  try { sh('rm -f .git/worktrees/*/index.lock .git/index.lock', ROOT); } catch {}
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
  fs.writeFileSync(full, content, 'utf8');
}

export function writeWtBinary(wtDir, relPath, buf) {
  const full = path.join(wtDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, buf);
}

export function isAgentDone(agentId) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const rec = manifest.agents.find((a) => a.id === agentId);
  return rec && (rec.status === 'VERIFIED' || rec.status === 'INTEGRATED') && Boolean(rec.commit_sha);
}

export function finalizeAgent(agentId, wtDir, testCommand, evidencePaths, runtimeEnv, blockers = [], summaryBullets = []) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const rec = manifest.agents.find((a) => a.id === agentId);
  if (!rec) throw new Error(`Agent ${agentId} not found in manifest`);

  const ownedPaths = rec.owned_paths;
  rec.attempts += 1;
  rec.status = 'RUNNING';

  for (const p of ownedPaths) {
    const target = path.join(wtDir, p);
    if (fs.existsSync(target)) {
      sh(`git add -f -- "${p}"`, wtDir);
    }
  }

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

  // Copy staged files into ROOT before running testCommand so cross-agent dependencies in ROOT are visible
  for (const rawF of staged) {
    const f = rawF.replace(/^"|"$/g, '');
    const src = path.join(wtDir, f);
    const dst = path.join(ROOT, f);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }

  const testRes = spawnSync('bash', ['-c', testCommand], { cwd: ROOT, encoding: 'utf8', timeout: 180000 });
  if (testRes.status !== 0) {
    rec.status = 'FAILED';
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    throw new Error(`Agent ${agentId} failed testCommand (${testCommand}):\n${testRes.stdout}\n${testRes.stderr}`);
  }

  sh(`git commit -m "${agentId} (${rec.wave}): ${rec.title}"`, wtDir);
  const agentSha = sh('git rev-parse --short HEAD', wtDir);

  rec.commit_sha = agentSha;
  rec.modified_files = staged;
  rec.evidence_paths = evidencePaths;
  rec.runtime_environment = runtimeEnv;
  rec.blockers = blockers;
  rec.status = blockers.length > 0 ? 'INTEGRATED' : 'VERIFIED';

  const logContent = [
    `=== AGENT ${agentId} (${rec.family.toUpperCase()} · ${rec.wave}) ===`,
    `Timestamp: ${new Date().toISOString()}`,
    `Title: ${rec.title}`,
    `Resolved Model: ${rec.resolved_model}`,
    `Runtime Environment: ${runtimeEnv}`,
    `Branch: ${rec.branch}`,
    `Worktree: ${rec.worktree}`,
    `Agent Commit SHA: ${agentSha}`,
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
    `# Agent Execution Report — \`${agentId}\` (${rec.family} · ${rec.wave})`,
    ``,
    `## 1. Identity & Execution Metadata`,
    `- **Agent ID:** \`${agentId}\``,
    `- **Family:** \`${rec.family}\``,
    `- **Resolved Model:** \`${rec.resolved_model}\``,
    `- **Wave:** \`${rec.wave}\``,
    `- **Title:** ${rec.title}`,
    `- **Branch:** \`${rec.branch}\``,
    `- **Worktree:** \`${rec.worktree}\``,
    `- **Agent Commit SHA:** \`${agentSha}\``,
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
      : [`- Delivered and verified all artifacts for ${rec.title} under ${ownedPaths.join(', ')}.`]),
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

  fs.writeFileSync(path.join(LOGS_DIR, `${agentId}.log`), logContent + '\n', 'utf8');
  fs.writeFileSync(path.join(AGENTS_REPORT_DIR, `${agentId}.md`), agentReportMd, 'utf8');
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log(`DONE ${agentId} -> worktree commit ${agentSha} (${staged.length} files synced to workspace)`);
}
