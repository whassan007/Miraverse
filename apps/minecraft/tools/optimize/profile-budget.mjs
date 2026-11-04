#!/usr/bin/env node
/**
 * MiraVerse Global v1.1 — Texture, Model & Script Budget Optimizer (`apps/minecraft/tools/optimize/profile-budget.mjs`)
 * Owner: DX19 (Wave W4)
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

export function runPerformanceBudgetAudit() {
  const walkFiles = (dir) => {
    if (!fs.existsSync(dir)) return [];
    const res = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) res.push(...walkFiles(full));
      else if (e.isFile()) res.push({ path: full, bytes: fs.statSync(full).size });
    }
    return res;
  };

  const assetFiles = walkFiles(path.join(ROOT, 'apps/minecraft/assets-src'));
  const worldFiles = walkFiles(path.join(ROOT, 'apps/minecraft/world'));
  const pngFiles = assetFiles.filter((f) => f.path.endsWith('.png'));
  const bbModels = assetFiles.filter((f) => f.path.endsWith('.bbmodel'));
  const mcStructures = worldFiles.filter((f) => f.path.endsWith('.mcstructure.json'));

  const totalPngBytes = pngFiles.reduce((a, b) => a + b.bytes, 0);
  const totalStructureBytes = mcStructures.reduce((a, b) => a + b.bytes, 0);

  const report = {
    schemaVersion: '1.1.0',
    generatedAt: new Date().toISOString(),
    budgets: {
      maxPngAtlasBytes: 10 * 1024 * 1024,
      actualPngBytes: totalPngBytes,
      pngCount: pngFiles.length,
      bbModelCount: bbModels.length,
      mcStructureCount: mcStructures.length,
      totalStructureBytes,
      maxNpcsPerDistrict: 5,
      districtSeparationBlocks: 200,
      withinBudget: totalPngBytes < 10 * 1024 * 1024 && bbModels.length >= 55 && mcStructures.length >= 12,
    },
  };

  if (!report.budgets.withinBudget) {
    throw new Error('Asset budget exceeded or incomplete: ' + JSON.stringify(report.budgets));
  }
  return report;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = runPerformanceBudgetAudit();
  console.log('PERFORMANCE_BUDGET_OK', JSON.stringify(r.budgets));
}
