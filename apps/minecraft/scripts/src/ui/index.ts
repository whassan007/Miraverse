/**
 * Native Bedrock @minecraft/server-ui Forms & HUD Coordinator
 * Owner: CX03
 */
import type { CountryId } from '../../../../../packages/content/schema.js';
import { COUNTRIES_V10, type PlayerSaveStateV10 } from '../contracts/index.js';
import { REGIONS_V10 } from '../regions/index.js';

export interface ActionFormDescriptor {
  title: string;
  body: string;
  buttons: { id: string; label: string; iconPath?: string }[];
}

export class BedrockUiFormsV10 {
  buildTutorialWelcomeForm(skippable = true): ActionFormDescriptor {
    const buttons = [
      { id: 'start_tutorial', label: 'Start Guided Terminal Tour (60s)', iconPath: 'textures/items/passport' },
    ];
    if (skippable) {
      buttons.push({ id: 'skip_tutorial', label: 'Skip Tutorial — Choose Destination Now', iconPath: 'textures/items/mira_token' });
    }
    return {
      title: 'Welcome to MiraVerse Gateway Hub',
      body: 'Explore five authentic cultural towns: Byblos (LB), Historic Cairo (EG), Baghdad Riverfront (IQ), Jeonju Hanok Village (KR), and Vieux Lyon (FR).',
      buttons,
    };
  }

  buildPassportOverviewForm(state: PlayerSaveStateV10): ActionFormDescriptor {
    const stampLines = COUNTRIES_V10.map((cc) => {
      const q = state.quests[cc];
      return `${cc}: ${q?.stampCode ? `STAMPED (${q.stampCode})` : `${q?.completedChallenges.length ?? 0}/5 challenges`}`;
    });
    return {
      title: `MiraVerse Passport — ${state.localMiraTokens} Mira Tokens`,
      body: [
        `Active Region: ${state.activeCountry}`,
        ...stampLines,
      ].join('\n'),
      buttons: [
        ...COUNTRIES_V10.map((cc) => ({
          id: `travel_${cc}`,
          label: `${REGIONS_V10[cc].titleEn} (${cc})`,
        })),
        { id: 'travel_HUB', label: 'Return to Gateway Hub' },
      ],
    };
  }

  buildMentorDialogueForm(
    country: CountryId,
    npcName: string,
    greetingEn: string,
    greetingNative: string,
    nextRecommendedChallenge: string
  ): ActionFormDescriptor {
    return {
      title: `${npcName} (${country})`,
      body: `${greetingEn}\n\n${greetingNative}\n\nNext Objective: ${nextRecommendedChallenge.toUpperCase()}`,
      buttons: [
        { id: 'accept_objective', label: `Start/Continue: ${nextRecommendedChallenge}` },
        { id: 'open_passport', label: 'Open MiraVerse Passport' },
      ],
    };
  }
}


// ============================================================================
// MiraVerse Global v1.1 — AtlasJournal & ArtifactViewer UI Controllers
// Owner: CX02 (Wave W2)
// ============================================================================
import { LocaleService, type SupportedLocaleId } from '../locales/index.js';
import { AgeTrackResolver, ObjectiveRegistry, type GlobalAgeTrack, type GlobalChapterProgress } from '../quests/index.js';

export class AtlasJournal {
  static buildAtlasOverview(
    localeId: SupportedLocaleId,
    ageTrack: GlobalAgeTrack,
    chaptersState: Record<string, GlobalChapterProgress>,
    earnedKeepsakes: string[],
    earnedStamps: string[]
  ) {
    const completedCount = Object.values(chaptersState).filter((c) => c.lifecycle === 'COMPLETED').length;
    return {
      title: LocaleService.translate(localeId, 'ui.hub.title').text,
      campaignTitle: LocaleService.translate(localeId, 'ui.campaign.title').text,
      localeId,
      ageTrack,
      ageTrackDescription: LocaleService.translate(localeId, `ui.age_track.${ageTrack}`).text,
      completedChaptersCount: completedCount,
      totalChaptersCount: 66,
      earnedKeepsakesCount: earnedKeepsakes.length,
      earnedStampsCount: earnedStamps.length,
      circleOfStoriesUnlocked: earnedKeepsakes.length >= 3,
    };
  }
}

export class ArtifactViewer {
  static inspectChapterSource(chapterId: string, localeId: SupportedLocaleId, ageTrack: GlobalAgeTrack) {
    const ch = ObjectiveRegistry.getChapterDefinition(chapterId);
    const variant = AgeTrackResolver.resolveChapterVariant(chapterId, ageTrack);
    return {
      chapterId,
      artifactId: ch.reward.artifactId,
      artifactName: LocaleService.translate(localeId, `artifact.${ch.reward.artifactId}.name`).text,
      sourceType: ch.sourceType,
      sourceNote: LocaleService.translate(localeId, `quest.${chapterId}.source_note`).text,
      readingLoad: variant.readingLoad,
    };
  }
}
