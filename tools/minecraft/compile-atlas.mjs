#!/usr/bin/env node
/**
 * Compiles the six Atlas countries the Minecraft game plays through its menus into
 * apps/minecraft/scripts/generated/atlas.json: district block fills, NPCs and chapters.
 * Chapter challenges come from the catalog tools/roblox/compile-atlas.mjs generates, so
 * both games share one chapter design. Run that compiler first.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const MC = path.join(ROOT, 'apps/minecraft');
const CODES = ['DE', 'CN', 'JP', 'RU', 'UA', 'MA'];

// Districts were authored at y=64, inside natural terrain. Raising them matches the
// y=100 height the rest of the game builds at.
const Y_SHIFT = 36;
const FLOOR_BLOCK = 'minecraft:smooth_stone';
const FALLBACK_COLOR = '#b5654a';

// Custom blocks ship without textures, so districts use the closest standard block.
const VANILLA = {
  'minecraft:white_terracotta': '#d1b2a1',
  'minecraft:orange_terracotta': '#a15325',
  'minecraft:yellow_terracotta': '#ba8523',
  'minecraft:brown_terracotta': '#4d3323',
  'minecraft:red_terracotta': '#8f3d2e',
  'minecraft:pink_terracotta': '#a14e4e',
  'minecraft:cyan_terracotta': '#575b5b',
  'minecraft:blue_terracotta': '#4a3b5b',
  'minecraft:green_terracotta': '#4c532a',
  'minecraft:light_gray_terracotta': '#876a61',
  'minecraft:white_concrete': '#cfd5d6',
  'minecraft:light_gray_concrete': '#7d7d73',
  'minecraft:gray_concrete': '#373a3e',
  'minecraft:red_concrete': '#8e2121',
  'minecraft:orange_concrete': '#e06101',
  'minecraft:yellow_concrete': '#f1af15',
  'minecraft:lime_concrete': '#5ea918',
  'minecraft:green_concrete': '#495b24',
  'minecraft:cyan_concrete': '#157788',
  'minecraft:light_blue_concrete': '#2389c7',
  'minecraft:blue_concrete': '#2d2f8f',
  'minecraft:pink_concrete': '#d6658f',
  'minecraft:brown_concrete': '#603c20',
  'minecraft:spruce_planks': '#6b5030',
  'minecraft:oak_planks': '#a2834f',
  'minecraft:sandstone': '#d8cb9b',
  'minecraft:stone_bricks': '#7a7a7a',
};

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
function nearestVanilla(hex) {
  const [r, g, b] = rgb(hex);
  let best = 'minecraft:white_terracotta';
  let bestDistance = Infinity;
  for (const [block, color] of Object.entries(VANILLA)) {
    const [x, y, z] = rgb(color);
    const distance = (r - x) ** 2 + (g - y) ** 2 + (b - z) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = block;
    }
  }
  return best;
}

function vanillaFor(blockId) {
  if (!blockId.startsWith('miraverse:')) return blockId.toLowerCase();
  const file = path.join(MC, 'bp/blocks', `${blockId.split(':')[1]}.json`);
  if (!fs.existsSync(file)) return nearestVanilla(FALLBACK_COLOR);
  const color = JSON.parse(fs.readFileSync(file, 'utf8'))['minecraft:block'].components['minecraft:map_color'];
  return nearestVanilla(color ?? FALLBACK_COLOR);
}

const shift = (p) => ({ x: p.x, y: p.y + Y_SHIFT, z: p.z });

/** Merges neighbouring voxels on each row into one fill. */
function compileFills(district) {
  const [ox, oy, oz] = district.origin;
  const y = oy + Y_SHIFT;
  const [sx, sy, sz] = district.size;
  const fills = [
    // The authored floor covers only part of the district.
    { min: [ox, y, oz], max: [ox + sx - 1, y, oz + sz - 1], block: FLOOR_BLOCK },
    // A safety wall, so children can't fall off the raised district.
    { min: [ox - 1, y, oz - 1], max: [ox + sx, y + 3, oz - 1], block: 'minecraft:barrier' },
    { min: [ox - 1, y, oz + sz], max: [ox + sx, y + 3, oz + sz], block: 'minecraft:barrier' },
    { min: [ox - 1, y, oz], max: [ox - 1, y + 3, oz + sz - 1], block: 'minecraft:barrier' },
    { min: [ox + sx, y, oz], max: [ox + sx, y + 3, oz + sz - 1], block: 'minecraft:barrier' },
  ];
  const rows = new Map();
  for (const voxel of district.voxels) {
    const [dx, dy, dz] = voxel.offset;
    const block = vanillaFor(voxel.blockId);
    if (dy === 0 && block === FLOOR_BLOCK) continue;
    const key = `${dy}:${dz}`;
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push([dx, block]);
  }
  void sy;
  for (const [key, cells] of rows) {
    const [dy, dz] = key.split(':').map(Number);
    cells.sort((a, b) => a[0] - b[0]);
    let start = cells[0];
    let end = cells[0];
    const flush = () => fills.push({ min: [ox + start[0], y + dy, oz + dz], max: [ox + end[0], y + dy, oz + dz], block: start[1] });
    for (const cell of cells.slice(1)) {
      if (cell[0] === end[0] + 1 && cell[1] === start[1]) {
        end = cell;
      } else {
        flush();
        start = cell;
        end = cell;
      }
    }
    flush();
  }
  return fills;
}

/** The script bundle is size-sensitive, so fills become number arrays plus a block palette. */
function compactFills(fills) {
  const palette = [...new Set(fills.map((f) => f.block))];
  return {
    palette,
    packedFills: fills.map((f) => [...f.min, ...f.max, palette.indexOf(f.block)]),
  };
}

const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages/content/minecraft-global/generated/atlas-catalog.json'), 'utf8'));
const strings = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages/content/locales/en-US/messages.json'), 'utf8')).strings;
const t = (key) => strings[key] ?? key;

const countries = CODES.map((code) => {
  const country = catalog.countries.find((c) => c.code === code);
  const lower = code.toLowerCase();
  const info = JSON.parse(fs.readFileSync(path.join(MC, `world/${code}/district-v11.json`), 'utf8'));
  const structure = JSON.parse(fs.readFileSync(path.join(MC, `world/${code}/structures/${lower}_district_v11.mcstructure.json`), 'utf8'));
  const locations = Object.fromEntries(info.chapterLocations.map((l) => [l.chapterId, l.coords]));

  const items = {};
  const blocks = {};
  for (const item of country.items) {
    items[item.id] = t(item.nameKey);
    const source = `miraverse:${item.id}`;
    if (fs.existsSync(path.join(MC, 'bp/blocks', `${item.id}.json`))) blocks[item.id] = vanillaFor(source);
  }

  const chapters = catalog.chapters.filter((c) => c.country === code).map((chapter) => ({
    id: chapter.id,
    index: chapter.index,
    prerequisite: chapter.prerequisite ?? null,
    title: t(chapter.titleKey),
    greeting: t(chapter.greetingKey),
    completion: t(chapter.completionKey),
    artifactId: chapter.artifactKey.split('.')[1],
    artifactName: t(chapter.artifactKey),
    storySparks: chapter.storySparks,
    location: shift(locations[chapter.id]),
    challenges: chapter.challenges.map((c) => {
      const base = { id: c.id, type: c.type, title_en: t(chapter.titleKey), goal_en: c.goalKey ? t(c.goalKey) : '' };
      if (c.type === 'source') {
        return {
          ...base,
          goal_en: t(c.noteKey),
          answer: c.answer,
          options: c.options.map((id) => ({ id, label: t(`class.${id}`) })),
        };
      }
      const { reward, goalKey, ...rest } = c;
      void reward;
      void goalKey;
      return { ...rest, ...base };
    }),
  }));

  return {
    code,
    name: t(country.nameKey),
    story: t(country.storyKey),
    mentorName: t(country.leadNameKey),
    spawn: shift(info.spawnPos),
    bounds: {
      min: [structure.origin[0] - 1, structure.origin[1] + Y_SHIFT, structure.origin[2] - 1],
      max: [structure.origin[0] + structure.size[0], structure.origin[1] + Y_SHIFT, structure.origin[2] + structure.size[2]],
    },
    stampName: info.passportStamp.name,
    npcs: info.npcs.map((n) => ({ id: n.npcId, name: n.nameEn, pos: shift(n.spawnPos) })),
    items,
    blocks,
    ...compactFills(compileFills(structure)),
    chapters,
  };
});

const outDir = path.join(MC, 'scripts/generated');
fs.mkdirSync(outDir, { recursive: true });
// IDs must be plain ASCII for Script API keys; the display names keep their accents.
const output = JSON.stringify({ countries }).replaceAll('terracotta_pisé', 'terracotta_pise');
fs.writeFileSync(path.join(outDir, 'atlas.json'), output);
const fillCount = countries.reduce((sum, c) => sum + c.packedFills.length, 0);
console.log(`Compiled Minecraft Atlas: ${countries.length} countries, ${fillCount} block fills.`);
