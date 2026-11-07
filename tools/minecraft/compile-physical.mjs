#!/usr/bin/env node
/**
 * Compiles physical settlements and quests into apps/minecraft/scripts/generated/physical.json.
 * Also writes Karim's entity files, and adds new English strings to the shared catalog when
 * run with --sync-en. Translate new strings with tools/locale/translate.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { buildByblos } from './settlements/byblos.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const MC = path.join(ROOT, 'apps/minecraft');
const ORIGIN = { x: 3000, y: 100, z: 0 };

// Karim is Mira's cousin in the Lebanese family story.
const KARIM = 'family_lb_karim';

const STRINGS = {
  'ui.language.choose': 'Choose your language',
  'ui.quest.current': 'Objective',
  'ui.quest.continue': 'Continue',
  'npc.family_lb_karim.name': 'Karim',
  'npc.family_lb_karim.unavailable': "Hi! I can't talk right now. Come and find me at the harbor.",
  'npc.family_lb_karim.complete': "Look at that walkway! The fishing boats can reach the end of the mole again. Thank you, cousin.",
  'quest.pq_lb_harbor.title': 'The Broken Walkway',
  'quest.pq_lb_harbor.reward': 'You earned the Harbor Compass and 25 Story Sparks!',
  'quest.pq_lb_harbor.talk_start.intro': "Cousin, thank goodness! A storm tore a hole in the harbor walkway, and the fishers can't reach the end of the mole. Will you help me fix it?",
  'quest.pq_lb_harbor.talk_start.objective': 'Talk to Karim at the dock',
  'quest.pq_lb_harbor.inspect.objective': 'Walk out along the mole and look at the gap',
  'quest.pq_lb_harbor.inspect.active': 'Walk out along the mole, west from the dock. You will see the gap.',
  'quest.pq_lb_harbor.collect.objective': 'Break the timber stack by the warehouse and collect planks',
  'quest.pq_lb_harbor.collect.active': 'We need planks. Break the stack of timber just north of the warehouse.',
  'quest.pq_lb_harbor.place.objective': 'Place planks to fill every space in the gap',
  'quest.pq_lb_harbor.place.active': 'Fill every space in the gap with planks, level with the walkway.',
  'quest.pq_lb_harbor.cross.objective': 'Walk across the repair to the end of the mole',
  'quest.pq_lb_harbor.cross.active': 'Now test it! Walk across to the very end of the mole.',
  'quest.pq_lb_harbor.talk_end.objective': 'Go back and tell Karim',
  'quest.pq_lb_harbor.talk_end.active': 'You did it? It held? Wonderful!',
};

function skin() {
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
  const SKIN = [198, 150, 112];
  const HAIR = [24, 20, 20];
  // Short black hair and a green football shirt, as the Lebanese story describes him.
  const SHIRT = [40, 130, 74];
  const SHORTS = [36, 44, 62];
  paint(0, 0, 32, 16, SKIN);
  paint(8, 0, 16, 8, HAIR);
  paint(0, 8, 8, 10, HAIR);
  paint(16, 8, 32, 10, HAIR);
  paint(24, 8, 32, 16, HAIR);
  paint(8, 8, 16, 9, HAIR);
  paint(10, 12, 11, 13, [30, 22, 20]);
  paint(13, 12, 14, 13, [30, 22, 20]);
  paint(0, 16, 16, 24, SHORTS);
  paint(0, 24, 16, 32, SKIN);
  paint(16, 16, 40, 32, SHIRT);
  paint(40, 16, 56, 24, SHIRT);
  paint(40, 24, 56, 32, SKIN);
  paint(16, 48, 32, 56, SHORTS);
  paint(16, 56, 32, 64, SKIN);
  paint(32, 48, 48, 56, SHIRT);
  paint(32, 56, 48, 64, SKIN);
  return PNG.sync.write(png, { deflateLevel: 9 });
}

function writeKarim() {
  const entity = {
    format_version: '1.20.80',
    'minecraft:entity': {
      description: { identifier: `miraverse:${KARIM}`, is_spawnable: true, is_summonable: true },
      component_groups: {
        // Real pathfinding to a block marker on the dock, not teleporting.
        'miraverse:walk_to_dock': {
          'minecraft:behavior.move_to_block': {
            priority: 3,
            tick_interval: 10,
            start_chance: 1,
            search_range: 16,
            search_height: 4,
            goal_radius: 1.5,
            stay_duration: 30,
            speed_multiplier: 1,
            target_selection_method: 'nearest',
            target_blocks: ['minecraft:lodestone'],
          },
        },
      },
      components: {
        'minecraft:type_family': { family: ['miraverse_family', 'npc'] },
        'minecraft:persistent': {},
        'minecraft:physics': {},
        'minecraft:collision_box': { width: 0.6, height: 1.8 },
        'minecraft:health': { value: 20, max: 20 },
        'minecraft:damage_sensor': { triggers: [{ cause: 'all', deals_damage: false }] },
        'minecraft:pushable': { is_pushable: false, is_pushable_by_piston: false },
        'minecraft:nameable': { always_show: true, allow_name_tag_renaming: false },
        // Without this the game doesn't treat him as interactable, and touch controls show no button.
        'minecraft:interact': {
          interactions: [
            {
              on_interact: { filters: { test: 'is_family', subject: 'other', value: 'player' }, event: 'miraverse:on_talk' },
              interact_text: 'action.interact.talk',
              swing: false,
            },
          ],
        },
        'minecraft:movement': { value: 0.25 },
        'minecraft:movement.basic': {},
        'minecraft:jump.static': {},
        'minecraft:navigation.walk': { can_walk: true, can_path_over_water: false, avoid_water: true, avoid_damage_blocks: true },
        'minecraft:behavior.look_at_player': { priority: 2, look_distance: 8, probability: 0.8 },
        'minecraft:behavior.random_stroll': { priority: 6, speed_multiplier: 0.8, xz_dist: 6, y_dist: 2 },
        'minecraft:behavior.random_look_around': { priority: 7 },
      },
      events: {
        'miraverse:go_to_dock': { add: { component_groups: ['miraverse:walk_to_dock'] } },
        // The script handles the conversation; this event only marks the interaction as valid.
        'miraverse:on_talk': {},
      },
    },
  };
  fs.writeFileSync(path.join(MC, 'bp/entities', `${KARIM}.json`), `${JSON.stringify(entity, null, 2)}\n`);
  const client = {
    format_version: '1.10.0',
    'minecraft:client_entity': {
      description: {
        identifier: `miraverse:${KARIM}`,
        materials: { default: 'entity_alphatest' },
        textures: { default: `textures/entity/${KARIM}` },
        geometry: { default: 'geometry.humanoid.custom' },
        render_controllers: ['controller.render.default'],
      },
    },
  };
  fs.writeFileSync(path.join(MC, 'rp/entity', `${KARIM}.entity.json`), `${JSON.stringify(client, null, 2)}\n`);
  fs.writeFileSync(path.join(MC, 'rp/textures/entity', `${KARIM}.png`), skin());
}

function compile() {
  const byblos = buildByblos(ORIGIN);
  const palette = [...new Set(byblos.fills.map((f) => f.block))];
  const c = byblos.cells;
  const quest = {
    id: 'pq_lb_harbor',
    titleKey: 'quest.pq_lb_harbor.title',
    rewardKey: 'quest.pq_lb_harbor.reward',
    reward: { artifact: 'lb_harbor_compass', storySparks: 25 },
    giver: KARIM,
    objectives: [
      { id: 'talk_start', type: 'talk', npc: KARIM, textKey: 'quest.pq_lb_harbor.talk_start.objective', dialogueKey: 'quest.pq_lb_harbor.talk_start.intro' },
      { id: 'inspect', type: 'reach', at: c.gapLookout, radius: 4, textKey: 'quest.pq_lb_harbor.inspect.objective', dialogueKey: 'quest.pq_lb_harbor.inspect.active' },
      { id: 'collect', type: 'collect', item: c.repairBlock, count: c.repairCells.length, textKey: 'quest.pq_lb_harbor.collect.objective', dialogueKey: 'quest.pq_lb_harbor.collect.active' },
      { id: 'place', type: 'place', block: c.repairBlock, cells: c.repairCells, textKey: 'quest.pq_lb_harbor.place.objective', dialogueKey: 'quest.pq_lb_harbor.place.active' },
      { id: 'cross', type: 'reach', at: c.moleEnd, radius: 2.5, textKey: 'quest.pq_lb_harbor.cross.objective', dialogueKey: 'quest.pq_lb_harbor.cross.active' },
      { id: 'talk_end', type: 'talk', npc: KARIM, textKey: 'quest.pq_lb_harbor.talk_end.objective', dialogueKey: 'quest.pq_lb_harbor.talk_end.active' },
    ],
  };
  return {
    settlements: {
      byblos: {
        code: 'LB_BYBLOS',
        name: 'Byblos harbor',
        reference: byblos.reference,
        spawn: c.spawn,
        bounds: byblos.bounds,
        palette,
        packedFills: byblos.fills.map((f) => [...f.min, ...f.max, palette.indexOf(f.block)]),
        npcs: [{ id: KARIM, nameKey: 'npc.family_lb_karim.name', pos: c.karimStart, home: c.dock, event: 'miraverse:go_to_dock', recoveryRadius: 48 }],
        landmarks: { dock: c.dock, souk: c.soukEntrance, castle: c.castleGate, moleEnd: c.moleEnd },
        timberStack: c.timberStack,
      },
    },
    quests: { pq_lb_harbor: quest },
    npcText: {
      [KARIM]: {
        nameKey: 'npc.family_lb_karim.name',
        unavailableKey: 'npc.family_lb_karim.unavailable',
        completeKey: 'npc.family_lb_karim.complete',
      },
    },
  };
}

if (process.argv.includes('--sync-en')) {
  const file = path.join(ROOT, 'packages/content/locales/en-US/messages.json');
  const english = JSON.parse(fs.readFileSync(file, 'utf8'));
  Object.assign(english.strings, STRINGS);
  english.keyCount = Object.keys(english.strings).length;
  fs.writeFileSync(file, `${JSON.stringify(english, null, 2)}\n`);
}
writeKarim();
const out = compile();
const outDir = path.join(MC, 'scripts/generated');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'physical.json'), JSON.stringify(out));
console.log(`Compiled physical content: ${out.settlements.byblos.packedFills.length} fills, ${Object.keys(out.quests).length} quest.`);
