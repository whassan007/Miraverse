import { fileURLToPath } from 'node:url';
import type { Pack } from '../../packages/content/schema.js';
import { compareText, normalizePacks, writeAtomic } from './web.js';

const outPath = fileURLToPath(new URL('../../apps/roblox/src/shared/Packs.luau', import.meta.url));

/** Luau decimal escapes avoid JSON-only unicode escape syntax. */
function quote(value: string): string {
  return '"' + value.replace(/["\\\u0000-\u001f\u007f]/g, character => {
    if (character === '"') return '\\"';
    if (character === '\\') return '\\\\';
    return '\\' + character.charCodeAt(0).toString(10).padStart(3, '0');
  }) + '"';
}

function serialize(value: unknown, depth = 0): string {
  if (value === null) return 'nil';
  if (typeof value === 'string') return quote(value);
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value !== 'object') throw new Error(`Cannot serialize ${String(value)} to Luau`);
  const indentation = '  '.repeat(depth);
  const entries = Array.isArray(value)
    ? value.map(child => serialize(child, depth + 1))
    : Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => compareText(a, b))
      .map(([key, child]) => `[${quote(key)}] = ${serialize(child, depth + 1)}`);
  if (entries.length === 0) return '{}';
  return `{\n${entries.map(entry => `${indentation}  ${entry},`).join('\n')}\n${indentation}}`;
}

export default async function compileRoblox(packs: Pack[]): Promise<void> {
  const countries = new Map<string, unknown>();
  for (const pack of normalizePacks(packs)) {
    if (countries.has(pack.country)) throw new Error(`Duplicate Roblox country: ${pack.country}`);
    countries.set(pack.country, pack);
  }
  await writeAtomic(outPath, '-- GENERATED FILE - DO NOT EDIT\nreturn '
    + serialize(Object.fromEntries(countries)) + '\n');
}
