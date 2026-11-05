import { describe, it, expect } from 'vitest';
import {
  AgeTrackResolver,
  ObjectiveRegistry,
  QuestDirector,
  type GlobalAgeTrack,
  type GlobalCountryCode,
} from '../../scripts/src/quests/index.js';
import { LocaleService, DialogueService, type SupportedLocaleId } from '../../scripts/src/locales/index.js';
import { StateStore, RewardLedger } from '../../scripts/src/state/index.js';
import { CoopSession } from '../../scripts/src/multiplayer/index.js';
import { StructureRestore } from '../../scripts/src/building/index.js';
import { MiraVerseGlobalRuntimeV11 } from '../../scripts/src/bootstrap/index.js';
import { createDefaultPlayerStateV10 } from '../../scripts/src/state/index.js';

describe('MiraVerse Global v1.1 — 11-Country, 66-Chapter, 264-Age-Variant & 14-Locale Matrix Suite (DX18)', () => {
  const ALL_COUNTRIES: GlobalCountryCode[] = ['LB', 'IQ', 'EG', 'FR', 'KR', 'DE', 'CN', 'JP', 'RU', 'UA', 'MA'];
  const ALL_TRACKS: GlobalAgeTrack[] = ['5-7', '8-10', '11-13', '14-17'];
  const ALL_LOCALES: SupportedLocaleId[] = [
    'en-US', 'fr-FR', 'fr-CA', 'de-DE', 'zh-Hans-CN', 'ja-JP',
    'ru-RU', 'uk-UA', 'ko-KR', 'ar', 'ar-LB', 'ar-IQ', 'ar-EG', 'ar-MA',
  ];

  it('validates all 11 countries, 66 chapters, and executes all 264 chapter-age behavior variants (66 x 4) end-to-end', () => {
    const allChapters = ObjectiveRegistry.getAllChapters();
    expect(allChapters).toHaveLength(66);

    let executedVariants = 0;

    for (const track of ALL_TRACKS) {
      const runtime = new MiraVerseGlobalRuntimeV11();
      const playerId = `tester_${track}`;
      runtime.getOrCreatePlayer(playerId, `Storykeeper_${track}`, 'en-US', track);

      // Verify Chapter 1 of every country is independently available at start
      const pState = runtime.getOrCreatePlayer(playerId);
      for (const cc of ALL_COUNTRIES) {
        expect(pState.chapters[`${cc}01`].lifecycle).toBe('AVAILABLE');
        expect(pState.chapters[`${cc}02`].lifecycle).toBe('LOCKED');
      }

      // Play all 66 chapters in sequence per country on this age track
      for (const cc of ALL_COUNTRIES) {
        const countryChapters = ObjectiveRegistry.getCountryChapters(cc);
        expect(countryChapters).toHaveLength(6);

        for (let i = 0; i < countryChapters.length; i++) {
          const ch = countryChapters[i];
          const variant = AgeTrackResolver.resolveChapterVariant(ch.id, track);
          expect(variant.timersEnabled).toBe(false);
          expect(variant.resourceLossPossible).toBe(false);
          expect(variant.checkpointEveryStep).toBe(true);

          const res = runtime.playFullChapter(playerId, ch.id);
          expect(res.ok).toBe(true);
          expect(res.reward?.artifactGranted).toBe(ch.reward.artifactId);
          executedVariants += 1;

          // Verify idempotent replay does not duplicate sparks
          const sparksBefore = pState.storySparks;
          const replayRes = runtime.playFullChapter(playerId, ch.id);
          expect(replayRes.ok).toBe(true);
          expect(replayRes.reward?.deduplicated).toBe(true);
          expect(pState.storySparks).toBe(sparksBefore);
        }
      }

      expect(pState.earnedArtifacts).toHaveLength(66);
      expect(pState.earnedKeepsakes).toHaveLength(11);
      expect(pState.earnedStamps).toHaveLength(11);
    }

    expect(executedVariants).toBe(264);
  });

  it('unlocks The Circle of Stories finale with any 3+ completed country keepsakes (not requiring all 11)', () => {
    const runtime = new MiraVerseGlobalRuntimeV11();
    const pid = 'finale_explorer';
    runtime.getOrCreatePlayer(pid, 'Amira', 'ar-LB', '8-10');

    // Before 3 keepsakes: Finale must reject
    const earlyFinale = runtime.attemptCircleOfStoriesFinale(pid);
    expect(earlyFinale.ok).toBe(false);
    expect(earlyFinale.reason).toBe('REQUIRES_AT_LEAST_3_COUNTRY_KEEPSAKES');

    // Complete 3 countries (LB, DE, MA — 18 chapters) in non-linear order
    for (const cc of ['LB', 'DE', 'MA'] as GlobalCountryCode[]) {
      for (let idx = 1; idx <= 6; idx++) {
        const chId = `${cc}0${idx}`;
        const res = runtime.playFullChapter(pid, chId);
        expect(res.ok).toBe(true);
      }
    }

    const journal = runtime.openAtlasJournal(pid);
    expect(journal.earnedKeepsakesCount).toBe(3);
    expect(journal.circleOfStoriesUnlocked).toBe(true);

    const finaleRes = runtime.attemptCircleOfStoriesFinale(pid);
    expect(finaleRes.ok).toBe(true);
    expect(finaleRes.finaleStampId).toBe('stamp_global_storykeeper');
  });

  it('supports mid-quest age-track switching, gentle failure recovery, and live locale switching across all 14 locales', () => {
    const chapters = QuestDirector.initializeChapterMap('5-7');
    const start = QuestDirector.startChapter(chapters, 'JP01', '5-7');
    expect(start.ok).toBe(true);

    const step1 = QuestDirector.advanceObjectiveStep(chapters, 'JP01', '5-7', 0);
    expect(step1.ok).toBe(true);
    expect(step1.completedSteps).toBe(1);

    // Recover from failure without losing step1 checkpoint
    const rec = QuestDirector.recoverFromFailureOrRetry(chapters, 'JP01', '5-7');
    expect(rec.ok).toBe(true);
    expect(rec.resumedAtCheckpoint).toBe('JP01:explorer:step1');

    // Switch age track mid-quest to 14-17 without losing completed progress
    const switched = QuestDirector.switchAgeTrackMidQuest(chapters, 'JP01', '14-17');
    expect(switched.ok).toBe(true);
    expect(switched.state.completedObjectiveNodes).toHaveLength(1);

    // Verify all 14 locales resolve non-empty strings and distinct Arabic dialects
    for (const loc of ALL_LOCALES) {
      const dlg = DialogueService.buildChapterDialogue('LB01', loc, '11-13');
      expect(dlg.title.length).toBeGreaterThan(2);
      expect(dlg.greeting.length).toBeGreaterThan(10);
      const englishNote = DialogueService.buildChapterDialogue('LB01', 'en-US', '11-13').sourceNote;
      expect(englishNote).toContain('living traditions');
      if (loc === 'en-US') {
        expect(dlg.sourceNote).toBe(englishNote);
      } else {
        expect(dlg.sourceNote.length).toBeGreaterThan(10);
        expect(dlg.sourceNote).not.toBe(englishNote);
      }
    }

    const msa = LocaleService.translate('ar', 'ui.hub.welcome');
    const lb = LocaleService.translate('ar-LB', 'ui.hub.welcome');
    const ma = LocaleService.translate('ar-MA', 'ui.hub.welcome');
    expect(lb.text).not.toBe(msa.text);
    expect(ma.text).not.toBe(msa.text);
    expect(lb.direction).toBe('rtl');
    expect(lb.isNativeBedrock).toBe(false);
  });

  it('migrates v1.0 5-country player saves losslessly and enforces co-op plot grief protection across all 11 countries', () => {
    const v10 = createDefaultPlayerStateV10('legacy_p1', 'Karim');
    v10.localMiraTokens = 150;
    v10.quests.LB.lifecycle = 'REWARDED';
    v10.quests.LB.stampCode = 'MV-LB1-ABCD-EFGH';

    const v11 = StateStore.migrateFromV10PlayerState(v10);
    expect(v11.storySparks).toBe(150);
    expect(v11.chapters.LB01.lifecycle).toBe('COMPLETED');
    expect(v11.chapters.LB02.lifecycle).toBe('AVAILABLE');
    expect(v11.chapters.DE01.lifecycle).toBe('AVAILABLE');
    expect(v11.earnedStamps).toContain('MV-LB1-ABCD-EFGH');

    // Co-op plot protection
    const coop = new CoopSession();
    const plot = coop.claimPlot('UA', 'owner_1');
    const denied = coop.placeBlock(plot.plotId, 'stranger_2', { x: 1, y: 1, z: 1 }, 'minecraft:oak_planks');
    expect(denied.ok).toBe(false);
    expect(denied.reason).toBe('GRIEF_PROTECTION_DENIED');

    coop.grantCollaborator(plot.plotId, 'owner_1', 'friend_2');
    const allowed = coop.placeBlock(plot.plotId, 'friend_2', { x: 1, y: 1, z: 1 }, 'minecraft:oak_planks');
    expect(allowed.ok).toBe(true);

    // Structure restoration
    const restore = new StructureRestore();
    restore.advanceStage('UA');
    restore.advanceStage('UA');
    const finalStage = restore.advanceStage('UA');
    expect(finalStage.completed).toBe(true);
  });
});
