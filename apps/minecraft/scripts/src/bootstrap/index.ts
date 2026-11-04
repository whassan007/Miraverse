/**
 * MiraVerse v1.0 Bedrock Runtime Bootstrap
 * Owner: CX03
 */
import type { CountryId } from '../../../../../packages/content/schema.js';
import type { PlayerSaveStateV10, WorldSaveStateV10 } from '../contracts/index.js';
import { createDefaultPlayerStateV10, createDefaultWorldStateV10 } from '../state/index.js';
import { interactWithNpcV10 } from '../npc/index.js';
import {
  performGatherAnchor,
  performMarketTrade,
  performCookingStep,
  performRestorationStageStep,
  performWordDiscovery,
} from '../challenges/index.js';
import { claimOrGetPrivatePlot } from '../multiplayer/index.js';
import { StructureBuilderV10 } from '../structures/index.js';
import { BedrockUiFormsV10 } from '../ui/index.js';

export class MiraVerseBedrockRuntimeV10 {
  readonly structures = new StructureBuilderV10(64);
  readonly ui = new BedrockUiFormsV10();
  readonly worldState: WorldSaveStateV10 = createDefaultWorldStateV10();
  private readonly players = new Map<string, PlayerSaveStateV10>();

  getOrCreatePlayer(playerId: string, playerName = 'Explorer'): PlayerSaveStateV10 {
    let p = this.players.get(playerId);
    if (!p) {
      p = createDefaultPlayerStateV10(playerId, playerName);
      this.players.set(playerId, p);
    }
    return p;
  }

  completeOrSkipTutorial(playerId: string): PlayerSaveStateV10 {
    const p = this.getOrCreatePlayer(playerId);
    p.tutorialCompleted = true;
    return p;
  }

  talkToMentor(playerId: string, country: CountryId, npcId: string) {
    const p = this.getOrCreatePlayer(playerId);
    return interactWithNpcV10(p, country, npcId);
  }

  gather(playerId: string, country: CountryId, anchorId: string) {
    return performGatherAnchor(this.getOrCreatePlayer(playerId), country, anchorId);
  }

  trade(playerId: string, country: CountryId) {
    return performMarketTrade(this.getOrCreatePlayer(playerId), country);
  }

  cookStep(playerId: string, country: CountryId, ingredientItemId: string) {
    return performCookingStep(this.getOrCreatePlayer(playerId), country, ingredientItemId);
  }

  restoreStep(playerId: string, country: CountryId, materialItemId: string) {
    const res = performRestorationStageStep(this.getOrCreatePlayer(playerId), country, materialItemId);
    if (res.ok) {
      this.structures.applyRestorationStage(country, res.newStage);
      this.worldState.restorationStagesByCountry[country] = res.newStage;
    }
    return res;
  }

  discoverWord(playerId: string, country: CountryId, anchorId: string) {
    return performWordDiscovery(this.getOrCreatePlayer(playerId), country, anchorId);
  }

  claimPlot(playerId: string, country: CountryId) {
    return claimOrGetPrivatePlot(this.worldState, country, playerId);
  }
}
