import type { Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import type { Challenge, Pack } from '../../../../packages/content/schema.js';
import { say, show } from './util.js';

export async function runWord(player: Player, challenge: Challenge, _pack: Pack): Promise<boolean> {
  const words = (challenge.words ?? []).slice(0, 3);
  if (words.length === 0) return false;
  for (let stage = 0; stage < words.length; stage++) {
    const target = words[stage];
    // Deterministic rotation of options so the answer position varies by stage.
    const options = words.map((_, i) => words[(i + stage) % words.length]);
    for (;;) {
      const form = new ActionFormData().title(`${challenge.title_en} (${stage + 1}/${words.length})`);
      form.body(`${target.word}\n${target.translit}\n\nWhat does it mean?`);
      for (const o of options) form.button(o.en);
      form.button('Leave');
      const sel = await show(player, form);
      if (sel === undefined || sel >= options.length) return false;
      if (options[sel].en === target.en) {
        say(player, `§aCorrect! ${target.word} = ${target.en}`);
        break;
      }
      say(player, '§eNot quite. Try again!');
    }
  }
  return true;
}
