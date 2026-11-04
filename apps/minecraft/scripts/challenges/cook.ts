import type { Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import type { Challenge, Pack } from '../../../../packages/content/schema.js';
import { giveItem, itemName, say, show } from './util.js';

export async function runCook(player: Player, challenge: Challenge, pack: Pack): Promise<boolean> {
  const recipe = challenge.recipe;
  if (!recipe) return false;
  const inputs = recipe.inputs;
  let step = 0;
  while (step < inputs.length) {
    const options = Array.from(new Set(inputs));
    const form = new ActionFormData().title(challenge.title_en);
    form.body(`${challenge.goal_en}\n\nStep ${step + 1} of ${inputs.length}. Add the next ingredient.\nAdded: ${inputs.slice(0, step).map((i) => itemName(pack, i)).join(', ') || '-'}`);
    for (const o of options) form.button(itemName(pack, o));
    form.button('Leave');
    const sel = await show(player, form);
    if (sel === undefined || sel >= options.length) return false;
    if (options[sel] === inputs[step]) {
      step++;
    } else {
      say(player, `§eNot yet! ${itemName(pack, options[sel])} does not go in next. Try again.`);
    }
  }
  giveItem(player, pack, recipe.output, 1);
  say(player, `§aYou cooked ${itemName(pack, recipe.output)}!`);
  return true;
}
