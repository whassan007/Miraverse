import type { CountryId, Item, Pack } from '../../packages/content/schema.js';
import { validatePack } from '../../tools/validate.js';

export interface CompiledArtifacts {
  countries: CountryId[];
  itemsByCountry: Record<string, string[]>;
  globalItemIds: string[];
  webJson: string;
  robloxLuau: string;
  minecraftJson: string;
}

function canonicalizePack(pack: Pack): Pack {
  const sortedRegions = [...pack.regions]
    .map((r) => ({ id: r.id, name_en: r.name_en }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const sortedItems: Item[] = [...pack.items]
    .map((it) => ({ id: it.id, name_en: it.name_en, color: it.color }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const chapters = [...pack.chapters]
    .sort((a, b) => a.id - b.id)
    .map((ch) => ({
      id: ch.id,
      title_en: ch.title_en,
      challenges: ch.challenges.map((c) => {
        const sortedLegend = c.blueprintLegend
          ? Object.fromEntries(
              Object.entries(c.blueprintLegend).sort(([k1], [k2]) => k1.localeCompare(k2))
            )
          : undefined;
        return {
          id: c.id,
          type: c.type,
          title_en: c.title_en,
          goal_en: c.goal_en,
          ...(c.needs ? { needs: c.needs.map((n) => ({ item: n.item, count: n.count })) } : {}),
          ...(c.recipe
            ? { recipe: { inputs: [...c.recipe.inputs], output: c.recipe.output } }
            : {}),
          ...(c.words
            ? {
                words: c.words.map((w) => ({
                  word: w.word,
                  translit: w.translit,
                  en: w.en,
                })),
              }
            : {}),
          ...(c.blueprint ? { blueprint: [...c.blueprint] } : {}),
          ...(sortedLegend ? { blueprintLegend: sortedLegend } : {}),
          ...(c.reward ? { reward: { item: c.reward.item, count: c.reward.count } } : {}),
        };
      }),
    }));

  return {
    country: pack.country,
    name_en: pack.name_en,
    lang: pack.lang,
    colors: {
      primary: pack.colors.primary,
      secondary: pack.colors.secondary,
    },
    regions: sortedRegions,
    mentor: {
      name: pack.mentor.name,
      greeting_en: pack.mentor.greeting_en,
      greeting: pack.mentor.greeting,
    },
    items: sortedItems,
    chapters,
  };
}

export function compileFixturePacks(packs: Pack[]): CompiledArtifacts {
  const seenItemIds = new Map<string, CountryId>();
  const seenGlobalIds = new Set<string>();

  for (const pack of packs) {
    const localIds = new Set<string>();
    for (const item of pack.items) {
      if (localIds.has(item.id)) {
        throw new Error(
          `Item ID collision detected in pack '${pack.country}': duplicate item id '${item.id}'`
        );
      }
      localIds.add(item.id);

      const globalId = `${pack.country.toLowerCase()}_${item.id}`;
      if (seenGlobalIds.has(globalId)) {
        throw new Error(`Global item ID collision detected: '${globalId}'`);
      }
      seenGlobalIds.add(globalId);

      const prevCountry = seenItemIds.get(item.id);
      if (prevCountry !== undefined) {
        throw new Error(
          `Item ID collision detected across packs ('${prevCountry}' and '${pack.country}'): '${item.id}'`
        );
      }
      seenItemIds.set(item.id, pack.country);
    }

    const validationErrors = validatePack(pack, `packs/${pack.country}.json`, {
      expectedCountry: pack.country,
    });
    if (validationErrors.length > 0) {
      throw new Error(`Pack validation failed: ${validationErrors.join('; ')}`);
    }
  }

  const canonicalPacks = packs
    .map((p) => canonicalizePack(p))
    .sort((a, b) => a.country.localeCompare(b.country));

  const countries = canonicalPacks.map((p) => p.country);
  const itemsByCountry: Record<string, string[]> = {};
  const globalItemIds: string[] = [];

  for (const pack of canonicalPacks) {
    itemsByCountry[pack.country] = pack.items.map((it) => it.id);
    for (const item of pack.items) {
      globalItemIds.push(`${pack.country.toLowerCase()}_${item.id}`);
    }
  }

  const webJson = JSON.stringify({ packs: canonicalPacks }, null, 2) + '\n';

  const luauLines: string[] = [
    '-- Auto-generated deterministic Roblox pack data',
    'local Packs = {',
  ];
  for (const pack of canonicalPacks) {
    luauLines.push(`  [${JSON.stringify(pack.country)}] = {`);
    luauLines.push(`    country = ${JSON.stringify(pack.country)},`);
    luauLines.push(`    name_en = ${JSON.stringify(pack.name_en)},`);
    luauLines.push(`    lang = ${JSON.stringify(pack.lang)},`);
    luauLines.push('    items = {');
    for (const item of pack.items) {
      luauLines.push(
        `      { id = ${JSON.stringify(item.id)}, name_en = ${JSON.stringify(item.name_en)}, color = ${JSON.stringify(item.color)} },`
      );
    }
    luauLines.push('    },');
    luauLines.push('  },');
  }
  luauLines.push('}');
  luauLines.push('return Packs');
  const robloxLuau = luauLines.join('\n') + '\n';

  const minecraftItems = canonicalPacks.flatMap((pack) =>
    pack.items.map((item) => ({
      identifier: `miraverse:${pack.country.toLowerCase()}_${item.id}`,
      country: pack.country,
      item_id: item.id,
      display_name: item.name_en,
      color: item.color,
    }))
  );
  const minecraftJson = JSON.stringify({ items: minecraftItems }, null, 2) + '\n';

  return {
    countries,
    itemsByCountry,
    globalItemIds,
    webJson,
    robloxLuau,
    minecraftJson,
  };
}
