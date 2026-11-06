#!/usr/bin/env node
/**
 * Compiles the 11-country registry and the locale catalogs for Roblox:
 *   apps/roblox/src/shared/Atlas/Catalog.luau        countries, chapters and their challenges
 *   apps/roblox/src/shared/Atlas/Locales/<id>.luau   one string table per language
 * Each chapter's challenges come from its mechanic. Placeholder translations are dropped,
 * so a missing string falls back to English instead of showing "[DE] text".
 * New English strings are added to en-US by running with --sync-en.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const LOCALE_DIR = path.join(ROOT, 'packages/content/locales');
const OUT_DIR = path.join(ROOT, 'apps/roblox/src/shared/Atlas');
const PLACEHOLDER = /^‏?\[[^\]]+\]\s|^【[^】]+】|— ‏?\[[^\]]+\]\s|— 【[^】]+】/;
const LOCALE_IDS = ['en-US', 'ar', 'ar-LB', 'ar-EG', 'ar-IQ', 'ar-MA', 'fr-FR', 'fr-CA', 'de-DE', 'zh-Hans-CN', 'ja-JP', 'ru-RU', 'uk-UA', 'ko-KR'];

const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages/content/minecraft-global/registry.json'), 'utf8'));
const npcs = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages/content/minecraft-global/people/npcs-catalog.json'), 'utf8'));

const UI_STRINGS = {
  'rbx.choose_language': 'Choose your language',
  'rbx.choose_country': 'Choose a country',
  'rbx.choose_chapter': 'Choose a chapter',
  'rbx.classic_adventure': 'Classic adventure',
  'rbx.locked': 'Locked',
  'rbx.completed': 'Completed',
  'rbx.back': 'Back',
  'rbx.close': 'Close',
  'rbx.play_challenge': 'Play challenge',
  'rbx.progress': 'Challenge %s of %s',
  'rbx.souvenir_stamp': 'Souvenir stamp!',
  'rbx.reward': 'You earned: %s',
  'rbx.collected': 'Collected %s',
  'rbx.added': 'Added %s',
  'rbx.made': 'Made %s!',
  'rbx.wrong_order': 'Wrong order! Start again from the first step.',
  'rbx.find_word': 'Find the word for: %s',
  'rbx.word_match': '%s means: %s',
  'rbx.not_that_one': 'Not that one. Try again!',
  'rbx.needs': 'Needed: %s',
  'rbx.offer_invalid': 'That offer is not valid.',
  'rbx.not_enough': 'Not enough %s.',
  'rbx.not_asked': 'That was not asked for: %s.',
  'rbx.do_not_have': 'You do not have %s yet.',
  'rbx.received': 'Received %s x %s',
  'rbx.choose_block': 'Choose a block first.',
  'rbx.selected': 'Selected %s',
  'rbx.wrong_block': 'That block does not belong there.',
  'rbx.blueprint_complete': 'Blueprint complete!',
  'rbx.source_question': 'What kind of story is this?',
  'rbx.source_correct': 'That is right!',
  'class.contemporary_tradition': 'Living tradition',
  'class.historical_context': 'History',
  'class.folklore': 'Folklore',
  'class.literature': 'Literature',
  'class.fictional_gameplay': 'Game fiction',
  'item.route_marker': 'Route marker',
  'item.story_clue': 'Story clue',
};

/** Hand-written because the registry has no ingredient data. */
const RECIPES = {
  LB03: { output: "Za'atar Man'oushe", inputs: ['Wheat Flour', "Za'atar", 'Olive Oil'] },
  LB06: { output: 'Festival Table', inputs: ['Flatbread', 'Olives', 'Hummus'] },
  IQ04: { output: 'Kleicha', inputs: ['Wheat Dough', 'Date Paste', 'Cardamom'] },
  EG04: { output: 'Koshari Bowl', inputs: ['Rice', 'Lentils', 'Tomato Sauce'] },
  FR03: { output: 'Lyon-Style Potatoes', inputs: ['Potatoes', 'Onions', 'Butter'] },
  FR06: { output: 'Community Recipe Table', inputs: ['Fresh Bread', 'Cheese', 'Fruit Tart'] },
  KR04: { output: 'Bibimbap', inputs: ['Steamed Rice', 'Seasoned Vegetables', 'Gochujang'] },
  KR06: { output: 'Shared Harmony Table', inputs: ['Steamed Rice', 'Kimchi', 'Seaweed Soup'] },
  CN05: { output: 'Mooncake', inputs: ['Wheat Dough', 'Lotus Seed Paste', 'Mooncake Mold'] },
  MA03: { output: 'Mint Tea Tray', inputs: ['Fresh Mint', 'Green Tea', 'Sugar'] },
};

/** Lead-character looks, by what the character's name and role say. */
const CHARACTER_STYLES = {
  LB: 'grandmother', IQ: 'grandmother', EG: 'grandmother', FR: 'grandmother', KR: 'grandmother',
  DE: 'woman', JP: 'woman', RU: 'woman', UA: 'woman', CN: 'elder', MA: 'elder',
};

const BLUEPRINTS = [
  ['PSSSP', 'P...P', 'P...P'],
  ['.SSS.', 'PPPPP', 'P.P.P'],
  ['SSSSS', 'P...P', 'PPPPP'],
  ['..S..', '.SSS.', 'PPPPP'],
  ['S.S.S', 'PPPPP'],
  ['SPPPS', 'SP.PS', 'SP.PS'],
];

const slug = (text) => text.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const title = (id) => id.replace(/^[a-z]{2}_/, '').split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const hex = (rgb) => `#${rgb.map((n) => n.toString(16).padStart(2, '0')).join('')}`;

export function groupOf(mechanic, chapterId) {
  if (RECIPES[chapterId]) return 'cook';
  if (/trade/.test(mechanic)) return 'trade';
  if (/restoration|build|repair|craft|assembly|garden|exhibit|stage|venue|ecological|composition/.test(mechanic)) return 'build';
  if (/navigation|exploration|mapping|wayfinding|route|onboarding/.test(mechanic)) return 'route';
  if (/comparison|myth|folklore|oral|literature|reflection|poetic|music|rhythm|observation|signal|reasoning|attribution|classification/.test(mechanic)) return 'words';
  throw new Error(`No challenge group for ${chapterId}: ${mechanic}`);
}

function compile() {
  const extraEnglish = { ...UI_STRINGS };
  const countries = [];
  const chapters = [];
  const npcById = Object.fromEntries(npcs.map((n) => [n.id, n]));

  for (const country of registry.countries) {
    const code = country.code;
    const items = new Map();
    const addItem = (id, nameKey, color) => {
      if (!items.has(id)) items.set(id, { id, nameKey, color });
      return id;
    };
    const accent = hex(country.accentRgb);
    const palette = hex(country.paletteRgb);
    addItem('route_marker', 'item.route_marker', accent);
    addItem('story_clue', 'item.story_clue', palette);

    const blocks = country.customBlocks.map((block, i) => {
      const id = block.replace('miraverse:', '');
      const nameKey = `item.${id}`;
      extraEnglish[nameKey] = title(id);
      return addItem(id, nameKey, i % 2 === 0 ? palette : accent);
    });
    const cookItem = (name, i) => {
      const id = `food_${slug(name)}`;
      const nameKey = `item.${id}`;
      extraEnglish[nameKey] = name;
      return addItem(id, nameKey, i % 2 === 0 ? accent : palette);
    };

    const words = country.learnWords.map((w) => ({
      word: w.native,
      translit: w.translit,
      en: w.en,
      meaningKey: `vocab.${code}.${w.key}`,
    }));
    const countryChapters = registry.chapters.filter((c) => c.countryCode === code);
    for (const chapter of countryChapters) {
      const group = groupOf(chapter.mechanic, chapter.id);
      const base = `${chapter.id}`;
      const goalKey = `quest.${chapter.id}.summary`;
      const challenges = [];
      if (group === 'cook') {
        const recipe = RECIPES[chapter.id];
        const inputs = recipe.inputs.map(cookItem);
        const output = cookItem(recipe.output, 0);
        challenges.push({ id: `${base}-gather`, type: 'gather', goalKey, needs: inputs.map((item) => ({ item, count: 1 })) });
        challenges.push({ id: `${base}-cook`, type: 'cook', goalKey, recipe: { inputs, output } });
      } else if (group === 'trade') {
        const wanted = blocks[(chapter.chapterIndex - 1) % blocks.length];
        const rewardId = addItem(chapter.reward.artifactId, `artifact.${chapter.reward.artifactId}.name`, accent);
        challenges.push({ id: `${base}-gather`, type: 'gather', goalKey, needs: [{ item: wanted, count: 3 }] });
        challenges.push({ id: `${base}-trade`, type: 'trade', goalKey, needs: [{ item: wanted, count: 3 }], reward: { item: rewardId, count: 1 } });
      } else if (group === 'build') {
        const primary = blocks[(chapter.chapterIndex - 1) % blocks.length];
        const secondary = blocks[chapter.chapterIndex % blocks.length];
        challenges.push({
          id: `${base}-build`,
          type: 'build',
          goalKey,
          blueprint: BLUEPRINTS[(chapter.chapterIndex - 1) % BLUEPRINTS.length],
          blueprintLegend: { P: primary, S: secondary },
        });
      } else if (group === 'route') {
        challenges.push({ id: `${base}-route`, type: 'gather', goalKey, needs: [{ item: 'route_marker', count: 3 }, { item: 'story_clue', count: 1 }] });
      } else {
        challenges.push({ id: `${base}-word`, type: 'word', goalKey, words });
      }
      const others = ['contemporary_tradition', 'historical_context', 'folklore', 'literature', 'fictional_gameplay'].filter((c) => c !== chapter.sourceType);
      const offset = chapter.chapterIndex % others.length;
      const decoys = [others[offset], others[(offset + 1) % others.length]];
      challenges.push({
        id: `${base}-source`,
        type: 'source',
        noteKey: `quest.${chapter.id}.source_note`,
        answer: chapter.sourceType,
        // Rotated so the right answer isn't always in the same place.
        options: chapter.chapterIndex % 3 === 0
          ? [chapter.sourceType, ...decoys]
          : chapter.chapterIndex % 3 === 1
            ? [decoys[0], chapter.sourceType, decoys[1]]
            : [...decoys, chapter.sourceType],
      });
      chapters.push({
        id: chapter.id,
        country: code,
        index: chapter.chapterIndex,
        prerequisite: chapter.prerequisiteChapterId,
        group,
        titleKey: `quest.${chapter.id}.title`,
        greetingKey: `quest.${chapter.id}.greeting`,
        completionKey: `quest.${chapter.id}.completion`,
        artifactKey: `artifact.${chapter.reward.artifactId}.name`,
        storySparks: chapter.reward.storySparks,
        challenges,
      });
    }

    const lead = npcById[countryChapters[0].npcLeadId];
    countries.push({
      code,
      nameKey: `country.${code}.name`,
      storyKey: `country.${code}.story`,
      primary: palette,
      secondary: accent,
      leadNpc: lead.id,
      leadNameKey: `npc.${lead.id}.name`,
      characterStyle: CHARACTER_STYLES[code],
      items: [...items.values()],
    });
  }

  const english = JSON.parse(fs.readFileSync(path.join(LOCALE_DIR, 'en-US/messages.json'), 'utf8'));
  if (process.argv.includes('--sync-en')) {
    Object.assign(english.strings, extraEnglish);
    english.keyCount = Object.keys(english.strings).length;
    fs.writeFileSync(path.join(LOCALE_DIR, 'en-US/messages.json'), `${JSON.stringify(english, null, 2)}\n`);
  }
  const missing = Object.keys(extraEnglish).filter((k) => !english.strings[k]);
  if (missing.length) throw new Error(`en-US lacks ${missing.length} strings; run with --sync-en. First: ${missing[0]}`);

  const needed = (key) => /^(rbx|class|item|quest|country|npc|vocab|artifact)\./.test(key) && !/cultural_warning|\.greeting$/.test(key.startsWith('npc.') ? key : '');
  const locales = LOCALE_IDS.map((id) => {
    const catalog = JSON.parse(fs.readFileSync(path.join(LOCALE_DIR, id, 'messages.json'), 'utf8'));
    return { id, name: catalog.name, direction: catalog.direction, strings: catalog.strings };
  });
  const tables = locales.map(({ id, strings }) => {
    const table = {};
    for (const [key, value] of Object.entries(strings)) {
      if (needed(key) && !PLACEHOLDER.test(value)) table[key] = value;
    }
    return [id, table];
  });
  return {
    catalog: {
      countries,
      chapters,
      defaultLocale: 'en-US',
      locales: locales.map(({ id, name, direction }) => ({ id, name, direction })),
    },
    tables,
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

const HEADER = '-- GENERATED by tools/roblox/compile-atlas.mjs. Do not edit.\n';
const { catalog, tables } = compile();
fs.mkdirSync(path.join(OUT_DIR, 'Locales'), { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'Catalog.luau'), `${HEADER}return ${toLuau(catalog)}\n`);
for (const [id, table] of tables) {
  fs.writeFileSync(path.join(OUT_DIR, 'Locales', `${id}.luau`), `${HEADER}return ${toLuau(table)}\n`);
}
// Shared with tools/minecraft/compile-atlas.mjs so both games use one chapter design.
const sharedDir = path.join(ROOT, 'packages/content/minecraft-global/generated');
fs.mkdirSync(sharedDir, { recursive: true });
fs.writeFileSync(path.join(sharedDir, 'atlas-catalog.json'), JSON.stringify(catalog));
console.log(`Compiled Atlas: ${catalog.countries.length} countries, ${catalog.chapters.length} chapters, ${tables.length} languages.`);
