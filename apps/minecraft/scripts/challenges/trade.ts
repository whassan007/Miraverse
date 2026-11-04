import type { Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import type { Challenge, Pack } from '../../../../packages/content/schema.js';
import { countItem, giveItem, itemName, say, show, takeItem } from './util.js';

export async function runTrade(player: Player, challenge: Challenge, pack: Pack): Promise<boolean> {
  const needs = challenge.needs ?? [];
  for (;;) {
    const ready = needs.every((n) => countItem(player, pack, n.item) >= n.count);
    const form = new ActionFormData().title(`${pack.mentor.name}: ${challenge.title_en}`);
    form.body(
      challenge.goal_en +
        '\n\nOffer:\n' +
        needs.map((n) => `${itemName(pack, n.item)}: ${Math.min(countItem(player, pack, n.item), n.count)}/${n.count}`).join('\n') +
        (challenge.reward ? `\n\nReward: ${challenge.reward.count} x ${itemName(pack, challenge.reward.item)}` : ''),
    );
    form.button(ready ? 'Trade' : 'Trade (need more items)');
    form.button('Leave');
    const sel = await show(player, form);
    if (sel === undefined || sel === 1) return false;
    if (!ready) {
      say(player, '§eYou do not have enough yet. Gather more and come back!');
      return false;
    }
    for (const n of needs) takeItem(player, pack, n.item, n.count);
    if (challenge.reward) giveItem(player, pack, challenge.reward.item, challenge.reward.count);
    say(player, '§aTrade complete! Thank you!');
    return true;
  }
}
