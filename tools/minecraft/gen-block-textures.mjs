#!/usr/bin/env node
/**
 * Gives every custom block a working texture. The blocks were defined with no material
 * and the resource pack had no terrain_texture.json, so nothing connected them to an image.
 *
 * Writes: rp/textures/blocks/<id>.png, rp/textures/terrain_texture.json, rp/blocks.json,
 * and a minecraft:material_instances component in each bp/blocks/<id>.json.
 * Textures are original, generated from each block's color and material family.
 * Output is deterministic.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const MC = fileURLToPath(new URL('../../apps/minecraft/', import.meta.url));
const SIZE = 16;
const DEFAULT_COLOR = '#b08d6a';

// Checked in order, so specific words come before general ones.
const FAMILIES = [
  ['lattice', /lattice|mashrabiya|shanasheel|oriel|sliding_screen|balcony|trellis/],
  ['glow', /lantern|lamp|beacon|prism|fanous|glass/],
  ['zellij', /zellij|mosaic|muqarnas|frieze|glazed|fountain/],
  ['roof', /roof|shingle|kawara|giwa|eave/],
  ['brick', /brick|oven|hearth|samovar|cauldron|steamer/],
  ['plaster', /stucco|pise|whitewashed|plaster|wall|nalichnik/],
  ['fabric', /canopy|banner|rushnyk|weave|reed|paper|hanji|shoji/],
  ['metal', /iron|brass|copper|gilded|chime|sign/],
  ['wood', /timber|cedar|oak|pine|beam|plank|log|shutter|bracket|bench|shelf|table|stand|rack|case|lectern|bamboo|palm|izba|belfry|bollard|footbridge|frame/],
  ['stone', /./],
];

const SOUNDS = { wood: 'wood', fabric: 'cloth', lattice: 'wood', glow: 'glass', metal: 'metal' };

export const familyOf = (id) => FAMILIES.find(([, pattern]) => pattern.test(id))[0];

function seedOf(id) {
  let hash = 2166136261;
  for (const char of id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return hash;
}

function rng(seed) {
  let state = seed || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
const shade = ([r, g, b], f) => [clamp(r * f), clamp(g * f), clamp(b * f)];
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** Returns [color, alpha] for one pixel of a family's pattern. */
function pixel(family, x, y, base, random) {
  const grain = 0.94 + random() * 0.12;
  switch (family) {
    case 'wood': {
      const plank = Math.floor(y / 4);
      if (y % 4 === 3) return [shade(base, 0.62), 255];
      return [shade(base, grain * (plank % 2 ? 0.95 : 1.05) * (0.97 + 0.03 * Math.sin(x * 0.9 + plank * 2))), 255];
    }
    case 'brick': {
      const row = Math.floor(y / 4);
      const offset = row % 2 ? 4 : 0;
      if (y % 4 === 3 || (x + offset) % 8 === 7) return [shade(base, 0.62), 255];
      return [shade(base, grain), 255];
    }
    case 'roof': {
      const row = Math.floor(y / 5);
      const curve = Math.abs(((x + (row % 2 ? 3 : 0)) % 6) - 2.5) / 2.5;
      if (y % 5 === 4) return [shade(base, 0.55), 255];
      return [shade(base, grain * (1.12 - curve * 0.32)), 255];
    }
    case 'zellij': {
      const cx = Math.abs((x % 8) - 3.5);
      const cy = Math.abs((y % 8) - 3.5);
      if (cx + cy < 2.2) return [shade(base, 1.35), 255];
      if (cx + cy < 3.4) return [[236, 228, 208], 255];
      if (x % 8 === 0 || y % 8 === 0) return [shade(base, 0.55), 255];
      return [shade(base, grain * 0.82), 255];
    }
    case 'lattice': {
      const bar = x % 4 === 0 || y % 4 === 0;
      return bar ? [shade(base, grain), 255] : [base, 0];
    }
    case 'glow': {
      const edge = x === 0 || y === 0 || x === SIZE - 1 || y === SIZE - 1 || x === 8 || y === 8;
      return edge ? [shade(base, 0.45), 255] : [shade([255, 214, 130], grain), 255];
    }
    case 'fabric':
      return [shade(base, grain * ((x + y) % 2 ? 0.94 : 1.04)), 255];
    case 'metal':
      return [shade(base, grain * (x === y || x + y === SIZE - 1 ? 1.25 : 0.95)), 255];
    case 'plaster':
      return [shade(base, 0.97 + random() * 0.06), 255];
    default: {
      // Cut stone: large offset blocks with mortar lines.
      const row = Math.floor(y / 8);
      const offset = row % 2 ? 4 : 0;
      if (y % 8 === 7 || (x + offset) % 8 === 7) return [shade(base, 0.72), 255];
      return [shade(base, grain), 255];
    }
  }
}

function texture(id, family, base) {
  const png = new PNG({ width: SIZE, height: SIZE });
  const random = rng(seedOf(id));
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const [[r, g, b], alpha] = pixel(family, x, y, base, random);
      const i = (y * SIZE + x) * 4;
      png.data[i] = r;
      png.data[i + 1] = g;
      png.data[i + 2] = b;
      png.data[i + 3] = alpha;
    }
  }
  return PNG.sync.write(png, { deflateLevel: 9 });
}

const blockDir = path.join(MC, 'bp/blocks');
const textureDir = path.join(MC, 'rp/textures/blocks');
fs.mkdirSync(textureDir, { recursive: true });

const terrain = { resource_pack_name: 'miraverse', texture_name: 'atlas.terrain', padding: 8, num_mip_levels: 4, texture_data: {} };
const blocksJson = { format_version: '1.21.40' };

for (const file of fs.readdirSync(blockDir).sort()) {
  const id = file.replace(/\.json$/, '');
  const block = JSON.parse(fs.readFileSync(path.join(blockDir, file), 'utf8'));
  const components = block['minecraft:block'].components;
  const family = familyOf(id);
  const base = rgb(components['minecraft:map_color'] ?? DEFAULT_COLOR);

  fs.writeFileSync(path.join(textureDir, `${id}.png`), texture(id, family, base));
  terrain.texture_data[id] = { textures: `textures/blocks/${id}` };
  blocksJson[`miraverse:${id}`] = { sound: SOUNDS[family] ?? 'stone' };

  const seeThrough = family === 'lattice';
  components['minecraft:material_instances'] = {
    '*': { texture: id, render_method: seeThrough ? 'alpha_test' : 'opaque' },
  };
  if (seeThrough) components['minecraft:light_dampening'] = 0;
  if (family === 'glow') components['minecraft:light_emission'] = 12;
  fs.writeFileSync(path.join(blockDir, file), JSON.stringify(block));
}

fs.writeFileSync(path.join(MC, 'rp/textures/terrain_texture.json'), `${JSON.stringify(terrain, null, 2)}\n`);
fs.writeFileSync(path.join(MC, 'rp/blocks.json'), `${JSON.stringify(blocksJson, null, 2)}\n`);
console.log(`Textured ${Object.keys(terrain.texture_data).length} custom blocks.`);
