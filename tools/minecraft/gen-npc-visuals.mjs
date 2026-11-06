#!/usr/bin/env node
/**
 * Writes a client entity and a 64x64 humanoid skin for every global NPC. Their behavior
 * files existed with no visual definition, so the game had nothing to render for them.
 * Output is deterministic. Rerun after adding NPCs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const RP = path.join(ROOT, 'apps/minecraft/rp');
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages/content/minecraft-global/registry.json'), 'utf8'));
const npcs = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages/content/minecraft-global/people/npcs-catalog.json'), 'utf8'));
const paletteOf = Object.fromEntries(registry.countries.map((c) => [c.code, c]));

const SKIN = [214, 170, 134];
const HAIR = [58, 42, 34];
const EYE = [40, 30, 28];
const SHOE = [60, 45, 38];
const TROUSERS = [70, 66, 72];

function skin(top, trim) {
  const png = new PNG({ width: 64, height: 64 });
  const paint = (x0, y0, x1, y1, [r, g, b]) => {
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * 64 + x) * 4;
        png.data[i] = r;
        png.data[i + 1] = g;
        png.data[i + 2] = b;
        png.data[i + 3] = 255;
      }
    }
  };
  // Standard humanoid layout: head, right leg, body, right arm, left leg, left arm.
  paint(0, 0, 32, 16, SKIN);
  paint(8, 0, 16, 8, HAIR); // top of head
  paint(0, 8, 8, 10, HAIR); // sides and back of hair
  paint(16, 8, 32, 10, HAIR);
  paint(24, 8, 32, 16, HAIR);
  paint(8, 8, 16, 10, HAIR); // fringe
  paint(10, 12, 11, 13, EYE);
  paint(13, 12, 14, 13, EYE);
  paint(0, 16, 16, 32, TROUSERS);
  paint(0, 26, 16, 32, SHOE);
  paint(16, 16, 40, 32, top);
  paint(16, 28, 40, 30, trim); // belt
  paint(40, 16, 56, 32, top);
  paint(40, 28, 56, 32, SKIN); // hands
  paint(16, 48, 32, 64, TROUSERS);
  paint(16, 58, 32, 64, SHOE);
  paint(32, 48, 48, 64, top);
  paint(32, 60, 48, 64, SKIN);
  return PNG.sync.write(png, { deflateLevel: 9 });
}

fs.mkdirSync(path.join(RP, 'textures/entity'), { recursive: true });
for (const npc of npcs) {
  const country = paletteOf[npc.countryCode];
  fs.writeFileSync(path.join(RP, 'textures/entity', `${npc.id}.png`), skin(country.paletteRgb, country.accentRgb));
  const clientEntity = {
    format_version: '1.10.0',
    'minecraft:client_entity': {
      description: {
        identifier: `miraverse:${npc.id}`,
        materials: { default: 'entity_alphatest' },
        textures: { default: `textures/entity/${npc.id}` },
        geometry: { default: 'geometry.humanoid.custom' },
        render_controllers: ['controller.render.default'],
      },
    },
  };
  fs.writeFileSync(path.join(RP, 'entity', `${npc.id}.entity.json`), `${JSON.stringify(clientEntity, null, 2)}\n`);
}
console.log(`Wrote visuals for ${npcs.length} NPCs.`);
