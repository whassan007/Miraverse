import type { Player } from '@minecraft/server';
import type { Challenge, Pack } from '../../../../packages/content/schema.js';
import { runBuild } from './build.js';
import { runCook } from './cook.js';
import { runGather } from './gather.js';
import { runTrade } from './trade.js';
import { runWord } from './word.js';

export { runBuild, runCook, runGather, runTrade, runWord };

/** Runs a challenge for the player; resolves true when completed. */
export async function run(player: Player, challenge: Challenge, pack: Pack): Promise<boolean> {
  switch (challenge.type) {
    case 'gather':
      return runGather(player, challenge, pack);
    case 'cook':
      return runCook(player, challenge, pack);
    case 'build':
      return runBuild(player, challenge, pack);
    case 'trade':
      return runTrade(player, challenge, pack);
    case 'word':
      return runWord(player, challenge, pack);
    default:
      return false;
  }
}
