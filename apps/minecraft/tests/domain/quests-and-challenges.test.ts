import { describe, it, expect } from 'vitest';
import { COUNTRIES_V10 } from '../../scripts/src/contracts/index.js';
import { REGIONS_V10 } from '../../scripts/src/regions/index.js';
import {
  createDefaultPlayerStateV10,
  createDefaultWorldStateV10,
  savePlayerStateV10,
  loadPlayerStateV10,
  type DynamicPropertyStore,
} from '../../scripts/src/state/index.js';
import { interactWithNpcV10 } from '../../scripts/src/npc/index.js';
import {
  performGatherAnchor,
  performMarketTrade,
  performCookingStep,
  performRestorationStageStep,
  performWordDiscovery,
} from '../../scripts/src/challenges/index.js';
import { claimChapterPassportReward } from '../../scripts/src/passport/index.js';
import { StructureBuilderV10 } from '../../scripts/src/structures/index.js';
import { BedrockUiFormsV10 } from '../../scripts/src/ui/index.js';

class MemoryPropertyStore implements DynamicPropertyStore {
  private map = new Map<string, string | number | boolean>();
  getDynamicProperty(key: string) { return this.map.get(key); }
  setDynamicProperty(key: string, value: string | number | boolean | undefined) {
    if (value === undefined) this.map.delete(key);
    else this.map.set(key, value);
  }
}

describe('MiraVerse v1.0 Minecraft Bedrock — 5-Country Quest, Cooking, Restoration & Passport Suite', () => {
  it('completes all 5 challenges (Gather -> Trade -> Cook -> Build -> Word) across all 5 countries (25 activities) and issues idempotent Passport stamps', () => {
    const worldState = createDefaultWorldStateV10();
    const playerState = createDefaultPlayerStateV10('player_explorer_1', 'Layla');
    const builder = new StructureBuilderV10(64);
    const ui = new BedrockUiFormsV10();

    const welcomeForm = ui.buildTutorialWelcomeForm(true);
    expect(welcomeForm.buttons.some((b) => b.id === 'skip_tutorial')).toBe(true);

    for (const country of COUNTRIES_V10) {
      const region = REGIONS_V10[country];
      expect(region.exteriors.length).toBeGreaterThanOrEqual(5);
      expect(region.interiors.length).toBeGreaterThanOrEqual(3);
      expect(region.npcs.length).toBeGreaterThanOrEqual(4);
      expect(region.anchors.length).toBeGreaterThanOrEqual(11);

      // 0. Talk to mentor to accept quest
      const mentorRes = interactWithNpcV10(playerState, country, `npc:${country}:mentor`);
      expect(mentorRes.questLifecycle).toBe('ACCEPTED');

      // 1. Gather both nodes
      const g1 = performGatherAnchor(playerState, country, `anchor:${country}:gather_1`);
      expect(g1.ok).toBe(true);
      const g2 = performGatherAnchor(playerState, country, `anchor:${country}:gather_2`);
      expect(g2.ok).toBe(true);
      expect(g2.gatherObjectiveCompleted).toBe(true);

      // Optional collectible works and prevents duplicate collection
      const opt1 = performGatherAnchor(playerState, country, `anchor:${country}:optional_collectible`);
      expect(opt1.ok).toBe(true);
      const opt2 = performGatherAnchor(playerState, country, `anchor:${country}:optional_collectible`);
      expect(opt2.ok).toBe(false);

      // 2. Atomic market trade
      const tradeRes = performMarketTrade(playerState, country);
      expect(tradeRes.ok).toBe(true);

      // 3. Ordered 3-step cooking sequence (rejects wrong order first)
      const steps = region.cookingSequence.orderedSteps;
      const wrongCook = performCookingStep(playerState, country, steps[2].ingredientItemId);
      expect(wrongCook.ok).toBe(false);
      expect(wrongCook.reason).toContain('WRONG_INGREDIENT_ORDER');

      for (const step of steps) {
        const cookRes = performCookingStep(playerState, country, step.ingredientItemId);
        expect(cookRes.ok).toBe(true);
      }
      expect(playerState.quests[country].completedChallenges).toContain('cook');

      // 4. 3-stage physical block restoration (Stage 0 -> 1 -> 2)
      const restoreMat = region.restorationRequiredItems[0].itemId;
      const r1 = performRestorationStageStep(playerState, country, restoreMat);
      expect(r1.ok).toBe(true);
      expect(r1.newStage).toBe(1);
      builder.applyRestorationStage(country, r1.newStage);

      const r2 = performRestorationStageStep(playerState, country, restoreMat);
      expect(r2.ok).toBe(true);
      expect(r2.newStage).toBe(2);
      expect(r2.restorationCompleted).toBe(true);
      builder.applyRestorationStage(country, r2.newStage);

      let placedCount = 0;
      builder.processTick(() => { placedCount++; });
      expect(placedCount).toBeGreaterThan(0);

      // 5. Discover 3 cultural vocabulary words in world
      for (const wId of ['word_1', 'word_2', 'word_3']) {
        const wRes = performWordDiscovery(playerState, country, `anchor:${country}:${wId}`);
        expect(wRes.ok).toBe(true);
      }
      expect(playerState.quests[country].completedChallenges).toEqual(['gather', 'trade', 'cook', 'build', 'word']);
      expect(playerState.quests[country].lifecycle).toBe('COMPLETED');

      // 6. Claim Passport Stamp & World-Local Mira Tokens (idempotent)
      const claim1 = claimChapterPassportReward(worldState, playerState, country);
      expect(claim1.ok).toBe(true);
      expect(claim1.deduplicated).toBe(false);
      expect(claim1.tokensAwarded).toBe(50);
      expect(claim1.stampCode).toMatch(new RegExp(`^MV-${country}1-`));

      const claim2 = claimChapterPassportReward(worldState, playerState, country);
      expect(claim2.ok).toBe(true);
      expect(claim2.deduplicated).toBe(true);
      expect(claim2.tokensAwarded).toBe(0);
    }

    expect(playerState.localMiraTokens).toBe(250);
  });

  it('quarantines corrupted DynamicProperty JSON into :corrupt_bak and migrates legacy mv:stamp:<CC> state cleanly', () => {
    const store = new MemoryPropertyStore();
    const state = createDefaultPlayerStateV10('p_backup', 'Rami');
    state.localMiraTokens = 200;
    savePlayerStateV10(store, state);

    // Also set a legacy v0.4 stamp and corrupt the primary key
    store.setDynamicProperty('mv:stamp:LB', 'MV-LB-1-ABCD-EFGH');
    store.setDynamicProperty('mv:v10:player:p_backup', '{corrupted_json');
    const recovered = loadPlayerStateV10(store, 'p_backup', 'Rami');
    expect(store.getDynamicProperty('mv:v10:player:p_backup:corrupt_bak')).toBe('{corrupted_json');
    expect(recovered.quests.LB.stampCode).toBe('MV-LB-1-ABCD-EFGH');
    expect(recovered.quests.LB.lifecycle).toBe('REWARDED');
  });
});
