import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pack } from '../../packages/content/schema.js';

const root = fileURLToPath(new URL('../../apps/minecraft/', import.meta.url));
const compareText = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;
const itemId = (country: string, id: string): string => `${country.toLowerCase()}_${id}`;

// Sort object keys without reordering story, chapter, or challenge sequences.
function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, entry: unknown) => {
    if (entry !== null && typeof entry === 'object' && !Array.isArray(entry)) {
      const record = entry as Record<string, unknown>;
      return Object.fromEntries(Object.keys(record).sort(compareText).map(key => [key, record[key]]));
    }
    return entry;
  }, 2);
}

function itemDefinition(id: string): object {
  return {
    format_version: '1.20.50',
    'minecraft:item': {
      description: { identifier: `miraverse:${id}`, menu_category: { category: 'items' } },
      components: {
        'minecraft:icon': { texture: id },
        'minecraft:display_name': { value: `item.miraverse:${id}.name` },
      },
    },
  };
}

const langValue = (value: string): string => value.replace(/[\r\n\t]+/g, ' ');

export default async function compileMinecraft(packs: Pack[]): Promise<void> {
  const sorted = [...packs].sort((a, b) => compareText(a.country, b.country))
    .map(pack => ({ ...pack, items: [...pack.items].sort((a, b) => compareText(a.id, b.id)) }));
  const files = new Map<string, string>();
  const textures: Record<string, { textures: string }> = {
    passport: { textures: 'textures/items/passport' },
  };
  const names: Record<string, string> = {};
  const countries = new Set<string>();
  const jsonFile = (name: string, value: unknown): void => {
    const content = `${stableJson(value)}\n`;
    const previous = files.get(name);
    if (previous !== undefined && previous !== content) throw new Error(`Conflicting Minecraft output: ${name}`);
    files.set(name, content);
  };

  jsonFile('bp/items/gen_passport.json', itemDefinition('passport'));
  for (const pack of sorted) {
    if (countries.has(pack.country)) throw new Error(`Duplicate Minecraft country: ${pack.country}`);
    countries.add(pack.country);
    const ids = new Set<string>();
    for (const item of pack.items) {
      if (!/^[a-z0-9_]+$/.test(item.id) || ids.has(item.id)) {
        throw new Error(`Invalid or duplicate Minecraft item: ${pack.country}/${item.id}`);
      }
      ids.add(item.id);
      const id = itemId(pack.country, item.id);
      jsonFile(`bp/items/gen_${id}.json`, itemDefinition(id));
      textures[id] = { textures: `textures/items/${id}` };
      names[`item.miraverse:${id}.name`] = item.name_en;
    }
    names[`entity.miraverse:mentor_${pack.country.toLowerCase()}.name`] = pack.mentor.name;
    for (const chapter of pack.chapters) {
      for (const challenge of chapter.challenges) {
        if (challenge.type !== 'cook' || !challenge.recipe) continue;
        const { inputs, output } = challenge.recipe;
        if (inputs.length === 0 || inputs.length > 9 || !ids.has(output)
          || inputs.some(input => !ids.has(input))) {
          throw new Error(`Invalid Minecraft cooking recipe: ${challenge.id}`);
        }
        const id = itemId(pack.country, output);
        jsonFile(`bp/recipes/gen_${id}.json`, {
          format_version: '1.20.50',
          'minecraft:recipe_shapeless': {
            description: { identifier: `miraverse:${id}` },
            tags: ['crafting_table'],
            ingredients: [...inputs].sort(compareText).map(input => ({ item: `miraverse:${itemId(pack.country, input)}` })),
            result: { item: `miraverse:${id}`, count: 1 },
          },
        });
      }
    }
  }

  const atlas = { resource_pack_name: 'miraverse', texture_name: 'atlas.items', texture_data: textures };
  jsonFile('rp/textures/gen_item_texture.json', atlas);
  files.set('rp/textures/item_texture.json', files.get('rp/textures/gen_item_texture.json')!);
  // The content contract supplies English item names only; French falls back to these names.
  for (const [locale, passport] of [['en_US', 'Passport'], ['fr_FR', 'Passeport']]) {
    const localized: Record<string, string> = { ...names, 'item.miraverse:passport.name': passport };
    files.set(`rp/texts/${locale}.lang`, Object.keys(localized).sort(compareText)
      .map(key => `${key}=${langValue(localized[key])}`).join('\n') + '\n');
  }
  files.set('scripts/generated/packs.ts',
    `// GENERATED FILE - DO NOT EDIT\nimport type { Pack } from '../../../../../packages/content/schema.js';\n\n`
    + `export const PACKS: Pack[] = ${stableJson(sorted)};\n\n`
    + 'export function getMinecraftItemId(country: string, itemId: string): string {\n'
    + '  return `miraverse:${country.toLowerCase()}_${itemId}`;\n}\n');

  // Validate and prepare every output before removing any previous generated files.
  for (const directory of ['bp/items', 'bp/recipes']) {
    const absolute = path.join(root, directory);
    await fs.mkdir(absolute, { recursive: true });
    for (const entry of (await fs.readdir(absolute, { withFileTypes: true })).sort((a, b) => compareText(a.name, b.name))) {
      if (entry.isFile() && /^gen_.*\.json$/.test(entry.name)) await fs.unlink(path.join(absolute, entry.name));
    }
  }
  for (const [name, content] of [...files].sort(([a], [b]) => compareText(a, b))) {
    const destination = path.join(root, name);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, content, 'utf8');
  }
}
