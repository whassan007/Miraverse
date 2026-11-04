import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pack } from '../../packages/content/schema.js';

const outPath = fileURLToPath(new URL('../../apps/web/src/generated/packs.json', import.meta.url));
const gulfBundlePath = fileURLToPath(new URL('../../packages/content/gulf-v16/gulf-bundle-v16.json', import.meta.url));
const gulfOutPath = fileURLToPath(new URL('../../apps/web/src/generated/gulfV16.json', import.meta.url));

export function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Preserve ordered gameplay data such as blueprint rows and recipe inputs. */
export function normalizePacks(packs: readonly Pack[]) {
  return [...packs].sort((a, b) => compareText(a.country, b.country)).map(pack => ({
    ...pack,
    items: [...pack.items].sort((a, b) => compareText(a.id, b.id)).map(item => ({
      ...item,
      globalId: `${pack.country.toLowerCase()}_${item.id}`,
    })),
    chapters: [...pack.chapters].sort((a, b) => a.id - b.id).map(chapter => ({
      ...chapter,
      challenges: [...chapter.challenges].sort((a, b) => compareText(a.id, b.id)),
    })),
  }));
}

/** Canonicalize object keys without changing array order. */
function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => compareText(a, b))
      .map(([key, child]) => [key, stableValue(child)]));
  }
  return value;
}

/** Rename within the destination filesystem so readers never see a partial file. */
export async function writeAtomic(destination: string, content: string): Promise<void> {
  const directory = path.dirname(destination);
  await fs.mkdir(directory, { recursive: true });
  const temporaryDirectory = await fs.mkdtemp(path.join(directory, '.compile-'));
  try {
    const temporaryFile = path.join(temporaryDirectory, 'output');
    await fs.writeFile(temporaryFile, content, 'utf8');
    await fs.rename(temporaryFile, destination);
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
}

export default async function compileWeb(packs: Pack[]): Promise<void> {
  await writeAtomic(outPath, JSON.stringify(stableValue(normalizePacks(packs)), null, 2) + '\n');
  try {
    const gulfContent = await fs.readFile(gulfBundlePath, 'utf8');
    await writeAtomic(gulfOutPath, gulfContent);
  } catch {
    // If gulf bundle is not present, skip
  }
}
