import type { Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import type { Challenge, Pack } from '../../../../packages/content/schema.js';
import { countItem, giveItem, itemName, say, show } from './util.js';

export async function runGather(player: Player, challenge: Challenge, pack: Pack): Promise<boolean> {
  const needs = challenge.needs ?? [];
  for (;;) {
    const remaining = needs.filter((n) => countItem(player, pack, n.item) < n.count);
    if (remaining.length === 0) {
      say(player, `§aYou gathered everything: ${challenge.title_en}!`);
      return true;
    }
    const form = new ActionFormData().title(challenge.title_en);
    form.body(
      challenge.goal_en +
        '\n\n' +
        needs.map((n) => `${itemName(pack, n.item)}: ${Math.min(countItem(player, pack, n.item), n.count)}/${n.count}`).join('\n'),
    );
    for (const n of remaining) form.button(`Gather ${itemName(pack, n.item)}`);
    form.button('Leave');
    const sel = await show(player, form);
    if (sel === undefined || sel >= remaining.length) return false;
    const n = remaining[sel];
    giveItem(player, pack, n.item, 1);
  }
}
