import { BlockPermutation } from '@minecraft/server';
import type { Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import type { Challenge, Pack } from '../../../../packages/content/schema.js';
import { buildOrigins } from '../world/index.js';
import { itemId, say, show } from './util.js';

const FALLBACK_BLOCK = 'minecraft:white_concrete';

function blockTypeFor(pack: Pack, item: string): string {
  const id = itemId(pack, item);
  try {
    BlockPermutation.resolve(id);
    return id;
  } catch {
    return FALLBACK_BLOCK;
  }
}

interface Cell {
  x: number;
  y: number;
  z: number;
  type: string;
}

function cells(challenge: Challenge, pack: Pack, o: { x: number; y: number; z: number }): Cell[] {
  const out: Cell[] = [];
  const legend = challenge.blueprintLegend ?? {};
  (challenge.blueprint ?? []).forEach((row, z) => {
    [...row].forEach((ch, x) => {
      if (ch === '.' || !legend[ch]) return;
      out.push({ x: o.x + x, y: o.y, z: o.z + z, type: blockTypeFor(pack, legend[ch]) });
    });
  });
  return out;
}

export async function runBuild(player: Player, challenge: Challenge, pack: Pack): Promise<boolean> {
  const o = buildOrigins[pack.country] ?? {
    x: Math.floor(player.location.x),
    y: Math.floor(player.location.y),
    z: Math.floor(player.location.z),
  };
  const target = cells(challenge, pack, o);
  const dim = player.dimension;
  const missing = (): Cell[] => target.filter((c) => dim.getBlock({ x: c.x, y: c.y, z: c.z })?.typeId !== c.type);
  for (;;) {
    const todo = missing();
    if (todo.length === 0) {
      say(player, `§aBuild complete: ${challenge.title_en}!`);
      return true;
    }
    const form = new ActionFormData().title(challenge.title_en);
    form.body(
      `${challenge.goal_en}\n\nBuild this pattern (rows go south, columns go east) starting at ${o.x}, ${o.y}, ${o.z}:\n` +
        (challenge.blueprint ?? []).join('\n') +
        `\n\nBlocks left: ${todo.length}`,
    );
    form.button('Check my build');
    form.button('Place the next block for me');
    form.button('Place all blocks for me');
    form.button('Leave');
    const sel = await show(player, form);
    if (sel === undefined || sel === 3) return false;
    if (sel === 0) {
      say(player, `§eStill ${todo.length} block(s) to place.`);
    } else {
      for (const c of sel === 1 ? todo.slice(0, 1) : todo) {
        const b = dim.getBlock({ x: c.x, y: c.y, z: c.z });
        try {
          b?.setType(c.type);
        } catch {
          b?.setType(FALLBACK_BLOCK);
        }
      }
    }
  }
}
