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


// ============================================================================
// MiraVerse Global v1.1 — Unified Global Runtime Bootstrap
// Owner: CX04 (Wave W4)
// ============================================================================
import {
  QuestDirector,
  ObjectiveRegistry,
  AgeTrackResolver,
  type GlobalAgeTrack,
  type GlobalCountryCode,
} from '../quests/index.js';
import { LocaleService, DialogueService, type SupportedLocaleId } from '../locales/index.js';
import { StateStore, RewardLedger, type GlobalPlayerSaveStateV11 } from '../state/index.js';
import { CoopSession } from '../multiplayer/index.js';
import { StructureRestore } from '../building/index.js';
import { AtlasJournal, ArtifactViewer } from '../ui/index.js';

export class MiraVerseGlobalRuntimeV11 {
  readonly coop = new CoopSession();
  readonly restore = new StructureRestore();
  private readonly players = new Map<string, GlobalPlayerSaveStateV11>();

  getOrCreatePlayer(
    playerId: string,
    playerName = 'Storykeeper',
    locale: SupportedLocaleId = 'en-US',
    ageTrack: GlobalAgeTrack = '8-10'
  ): GlobalPlayerSaveStateV11 {
    let p = this.players.get(playerId);
    if (!p) {
      p = StateStore.createDefaultGlobalPlayerState(playerId, playerName, locale, ageTrack);
      this.players.set(playerId, p);
    }
    return p;
  }

  switchLocale(playerId: string, newLocale: SupportedLocaleId) {
    const p = this.getOrCreatePlayer(playerId);
    p.locale = newLocale;
    return {
      ok: true,
      locale: p.locale,
      hubWelcome: LocaleService.translate(newLocale, 'ui.hub.welcome'),
    };
  }

  switchAgeTrack(playerId: string, newAgeTrack: GlobalAgeTrack, activeChapterId?: string) {
    const p = this.getOrCreatePlayer(playerId);
    p.ageTrack = AgeTrackResolver.normalizeTrack(newAgeTrack);
    if (activeChapterId && p.chapters[activeChapterId]) {
      QuestDirector.switchAgeTrackMidQuest(p.chapters, activeChapterId, p.ageTrack);
    }
    return { ok: true, ageTrack: p.ageTrack };
  }

  playFullChapter(playerId: string, chapterId: string) {
    const p = this.getOrCreatePlayer(playerId);
    const startRes = QuestDirector.startChapter(p.chapters, chapterId, p.ageTrack);
    if (!startRes.ok || !startRes.variant) {
      return { ok: false, reason: startRes.reason };
    }
    for (const node of startRes.variant.objectiveNodes) {
      QuestDirector.advanceObjectiveStep(p.chapters, chapterId, p.ageTrack, node);
    }
    const compRes = QuestDirector.completeChapterAndUnlockNext(p.chapters, chapterId);
    const rewardRes = RewardLedger.grantChapterRewardsIdempotent(
      p,
      chapterId,
      compRes.reward.artifactId,
      compRes.reward.storySparks,
      compRes.reward.grantsCountryStamp,
      compRes.reward.grantsCapstoneKeepsake
    );
    const dialogue = DialogueService.buildChapterDialogue(chapterId, p.locale, p.ageTrack);
    const sourceInspect = ArtifactViewer.inspectChapterSource(chapterId, p.locale, p.ageTrack);
    return {
      ok: true,
      chapterId,
      ageTrack: p.ageTrack,
      locale: p.locale,
      unlockedNextChapterId: compRes.unlockedNextChapterId,
      reward: rewardRes,
      dialogue,
      sourceInspect,
    };
  }

  openAtlasJournal(playerId: string) {
    const p = this.getOrCreatePlayer(playerId);
    return AtlasJournal.buildAtlasOverview(p.locale, p.ageTrack, p.chapters, p.earnedKeepsakes, p.earnedStamps);
  }

  attemptCircleOfStoriesFinale(playerId: string) {
    const p = this.getOrCreatePlayer(playerId);
    return RewardLedger.tryCompleteCircleOfStoriesFinale(p);
  }
}
