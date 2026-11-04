import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COUNTRIES, type Pack } from '../../packages/content/schema.js';
import compileWeb, { compareText } from './web.js';
import compileRoblox from './roblox.js';
import compileMinecraft from './minecraft.js';
import { compileV04Bundles } from './v04-meta.js';

const packsDir = fileURLToPath(new URL('../../packages/content/packs/', import.meta.url));

async function main(): Promise<void> {
  const files = (await fs.readdir(packsDir)).filter(file => file.endsWith('.json')).sort(compareText);
  if (files.length === 0) throw new Error(`No JSON packs found in ${packsDir}`);
  const packs: Pack[] = [];
  const globalIds = new Map<string, string>();
  const countries = new Map<string, string>();
  for (const file of files) {
    let pack: Pack;
    try {
      pack = JSON.parse(await fs.readFile(path.join(packsDir, file), 'utf8'));
    } catch (error) {
      throw new Error(`Cannot load pack ${file}: ${String(error)}`);
    }
    if (!pack || !COUNTRIES.includes(pack.country) || !Array.isArray(pack.items)
      || !Array.isArray(pack.chapters)) {
      throw new Error(`Invalid pack ${file}: expected canonical country, items and chapters`);
    }
    for (const item of pack.items) {
      if (!item || typeof item.id !== 'string' || item.id.length === 0) {
        throw new Error(`Invalid item ID in pack ${file}`);
      }
      const globalId = `${pack.country.toLowerCase()}_${item.id}`;
      const previous = globalIds.get(globalId);
      if (previous !== undefined) {
        throw new Error(`Global item ID collision "${globalId}" in ${previous} and ${file}`);
      }
      globalIds.set(globalId, file);
    }
    const previous = countries.get(pack.country);
    if (previous !== undefined) {
      throw new Error(`Duplicate country "${pack.country}" in ${previous} and ${file}`);
    }
    countries.set(pack.country, file);
    packs.push(pack);
  }
  packs.sort((a, b) => compareText(a.country, b.country));
  await compileWeb(packs);
  await compileRoblox(packs);
  await compileMinecraft(packs);
  await compileV04Bundles(packs);
  console.log(`Compiled ${packs.length} packs.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
