#!/usr/bin/env node
/**
 * Compiles packages/content/phoenicia into the single artifact both games read:
 *   packages/content/phoenicia/generated/world.compiled.json  (Minecraft)
 *   apps/roblox/src/shared/Phoenicia/Content.luau             (Roblox)
 * Run with --check to fail if the committed output is stale.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SRC = path.join(ROOT, 'packages/content/phoenicia');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(SRC, p), 'utf8'));

function rasterizeLand(region, y) {
  const rows = new Map();
  const add = (z, a, b) => {
    const r = rows.get(z);
    if (!r) rows.set(z, [[a, b]]);
    else r.push([a, b]);
  };
  for (const land of region.land) {
    if (land.shape === 'ellipse') {
      const [cx, cz] = land.center;
      const [rx, rz] = land.radius;
      for (let z = cz - rz; z <= cz + rz; z++) {
        const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - ((z - cz) / rz) ** 2)));
        if (half > 0) add(z, cx - half, cx + half);
      }
    } else if (land.shape === 'rect') {
      for (let z = land.min[1]; z <= land.max[1]; z++) add(z, land.min[0], land.max[0]);
    } else {
      throw new Error(`Unknown land shape: ${land.shape}`);
    }
  }
  return [...rows.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([z, spans]) => ({ z, spans: spans.sort((a, b) => a[0] - b[0]) }))
    .map((r) => ({ ...r, y }));
}

/** Expands a hollow building into walls with a door gap, plus a flat roof. */
function expandBuilding(b, y0) {
  const [x0, x1] = b.x;
  const [z0, z1] = b.z;
  const y1 = y0 + b.h - 1;
  const base = { material: b.material, district: b.district };
  const box = (suffix, min, max) => ({ id: `${b.id}_${suffix}`, min, max, ...base });
  const out = [box('roof', [x0, y1 + 1, z0], [x1, y1 + 1, z1])];
  const midX = Math.floor((x0 + x1) / 2);
  const midZ = Math.floor((z0 + z1) / 2);
  const side = (name, min, max, axis, mid) => {
    if (b.door !== name) return void out.push(box(name, min, max));
    // Leave a 2-wide, 3-high doorway in the middle of this wall.
    const low = [...min];
    const high = [...max];
    const beforeMax = [...max];
    const afterMin = [...min];
    beforeMax[axis] = mid - 1;
    afterMin[axis] = mid + 2;
    low[1] = y0 + 3;
    out.push(box(`${name}_a`, min, beforeMax), box(`${name}_b`, afterMin, max));
    if (low[1] <= high[1]) {
      low[axis] = mid;
      high[axis] = mid + 1;
      out.push(box(`${name}_lintel`, low, high));
    }
  };
  side('n', [x0, y0, z0], [x1, y1, z0], 0, midX);
  side('s', [x0, y0, z1], [x1, y1, z1], 0, midX);
  side('w', [x0, y0, z0], [x0, y1, z1], 2, midZ);
  side('e', [x1, y0, z0], [x1, y1, z1], 2, midZ);
  return out;
}

function compile() {
  const world = readJson('world.json');
  const quest = readJson('quests/TYR-05.json');
  const sources = readJson('sources.json');
  const locales = readJson('locales.json');
  const { landTopY } = world.projection;

  const regions = {};
  for (const [id, r] of Object.entries(world.regions)) {
    const { buildings, boxes, ...rest } = r;
    regions[id] = {
      ...rest,
      id,
      landRows: rasterizeLand(r, landTopY),
      boxes: [...buildings.flatMap((b) => expandBuilding(b, landTopY + 1)), ...boxes],
    };
  }

  const { ageVariantDefaults, ...questRest } = quest;
  const nodeIds = quest.nodes.map((n) => n.id);
  const ageVariants = {};
  for (const [age, t] of Object.entries(ageVariantDefaults.tracks)) {
    ageVariants[age] = {
      track: t.track,
      hint: t.hint,
      interaction: 'walk_to_anchor_and_choose',
      steps: nodeIds.length,
      timersEnabled: ageVariantDefaults.timersEnabled,
      resourceLossPossible: ageVariantDefaults.resourceLossPossible,
      checkpointEveryStep: ageVariantDefaults.checkpointEveryStep,
      recoveryMode: ageVariantDefaults.recoveryMode,
      activitySummary: `${quest.activity}. (${quest.title})`,
      objectiveNodes: nodeIds,
    };
  }

  return {
    schemaVersion: world.schemaVersion,
    scope: world.scope,
    league: world.league,
    epochs: world.epochs,
    projection: world.projection,
    materials: world.materials,
    routes: world.routes,
    regions,
    quests: { [quest.id]: { ...questRest, nodeOrder: nodeIds, ageVariants } },
    sources: sources.sources,
    locales: locales.locales,
    fallbackLocale: locales.fallback,
    strings: locales.strings,
  };
}

function toLuau(v, indent = '') {
  const next = `${indent}\t`;
  if (v === null || v === undefined) return 'nil';
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return '{}';
    return `{\n${v.map((x) => `${next}${toLuau(x, next)},`).join('\n')}\n${indent}}`;
  }
  const entries = Object.entries(v).filter(([, x]) => x !== null && x !== undefined);
  if (entries.length === 0) return '{}';
  return `{\n${entries.map(([k, x]) => `${next}[${JSON.stringify(k)}] = ${toLuau(x, next)},`).join('\n')}\n${indent}}`;
}

const compiled = compile();
const outputs = [
  [path.join(SRC, 'generated/world.compiled.json'), `${JSON.stringify(compiled, null, 1)}\n`],
  [
    path.join(ROOT, 'apps/roblox/src/shared/Phoenicia/Content.luau'),
    `-- GENERATED by tools/phoenicia/compile.mjs. Do not edit; change packages/content/phoenicia instead.\nreturn ${toLuau(compiled)}\n`,
  ],
];

if (process.argv.includes('--check')) {
  const stale = outputs.filter(([p, text]) => !fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== text);
  if (stale.length) {
    console.error(`Stale Phoenicia output, run tools/phoenicia/compile.mjs: ${stale.map(([p]) => p).join(', ')}`);
    process.exit(1);
  }
  console.log('Phoenicia output is up to date.');
} else {
  for (const [p, text] of outputs) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, text);
  }
  console.log(`Compiled Phoenicia: ${Object.keys(compiled.regions).length} regions, ${Object.keys(compiled.quests).length} quest.`);
}
