/**
 * MiraVerse v1.6 (`CL01`) — Arabian Peninsula & Gulf Diaspora Expansion Shared Architecture & Contracts
 * (`packages/contracts/v16/index.ts`)
 *
 * Non-negotiable architectural guarantees:
 * - Preserves all 5 legacy countries (`LB`, `IQ`, `EG`, `FR`, `KR`) and existing routes/IDs without destructive edits.
 * - Adds 5 mandatory Gulf countries (`QA`, `AE`, `KW`, `SA`, `OM`) + 6th country (`BH`) as a separate, first-class destination.
 * - Explicitly tracks Yemen (`YE`) as a potential future candidate (`RESEARCH_AND_CULTURAL_REVIEW_REQUIRED`), never as an inferred 7th release country.
 * - Truthfully separates implemented, staged, and planned country counts across Website, Roblox, and Minecraft Bedrock.
 * - Defines stable IDs (`country.qa`, `quest.qa.01`, `artifact.qa.pearl_basket`), 30 canonical quest acts × 4 age tiers (120 stage definitions / 240 platform-age configs),
 *   and the Arabic (`Arab`) / Arabizi (`Latn`) / English (`en`) localization contract with `عالم يرا` / `Mira's World` brand separation.
 */
import type { AgeTierId } from '../v13/index';

export const V16_RELEASE_VERSION = '1.6.0' as const;

export type GulfCountryCode = 'QA' | 'AE' | 'KW' | 'SA' | 'OM' | 'BH';
export type LegacyCountryCode = 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';
export type AllMiraverseCountryCodeV16 = LegacyCountryCode | GulfCountryCode;

export type StableGulfCountryId =
  | 'country.qa'
  | 'country.ae'
  | 'country.kw'
  | 'country.sa'
  | 'country.om'
  | 'country.bh';

export const V16_MANDATORY_GULF_COUNTRIES: readonly GulfCountryCode[] = ['QA', 'AE', 'KW', 'SA', 'OM'] as const;
export const V16_SIXTH_ADDED_GULF_COUNTRY: GulfCountryCode = 'BH';
export const V16_GULF_COUNTRIES_ORDERED: readonly GulfCountryCode[] = ['QA', 'AE', 'KW', 'SA', 'OM', 'BH'] as const;

export const V16_STABLE_COUNTRY_IDS: Record<GulfCountryCode, StableGulfCountryId> = {
  QA: 'country.qa',
  AE: 'country.ae',
  KW: 'country.kw',
  SA: 'country.sa',
  OM: 'country.om',
  BH: 'country.bh',
};

export type GulfDialectCode = 'ar-QA' | 'ar-AE' | 'ar-KW' | 'ar-SA' | 'ar-OM' | 'ar-BH';
export type ScriptVariantV16 = 'Arab' | 'Latn' | 'en';
export type RegisterV16 = 'child-friendly' | 'narration' | 'educational';
export type ReviewStatusV16 = 'pending' | 'approved' | 'rejected';

export type PlatformTruthStatusV16 =
  | 'DISCOVER'
  | 'PREVIEW'
  | 'TEST BUILD'
  | 'PLAYABLE VERIFIED'
  | 'PUBLISH PENDING'
  | 'UNVERIFIED/BLOCKED';

export type ProvenanceCategoryV16 =
  | 'history'
  | 'archaeology'
  | 'folklore'
  | 'literary epic'
  | 'religious tradition'
  | 'modern interpretation'
  | 'fictional game content';

export type CanonicalQuestActArchetypeV16 = 'GATHER' | 'TRADE' | 'BUILD' | 'COOK_OR_STORY' | 'WORD_FINALE';

/**
 * Exact Localization Data Contract required by Section 2 of the v1.6 specification.
 */
export interface LocalizationRecordV16 {
  id: string; // e.g., "quest.qa.01.intro"
  countryId: 'qa' | 'ae' | 'kw' | 'sa' | 'om' | 'bh';
  language: 'ar';
  dialectVariant: GulfDialectCode;
  scriptVariant: 'Arab' | 'Latn';
  textArabic: string;
  textArabizi: string;
  textEnglish: string;
  register: RegisterV16;
  ageTier: AgeTierId;
  sourceIds: string[];
  reviewStatus: ReviewStatusV16;
  phoneticGuideAges5To7?: string; // Transparent Latin letters without 3/7/5 numeral substitutions
  arabiziNumeralNoteAges11To17?: string; // Explanation of 3 (ع), 7 (ح), 5 (خ) for older tiers
}

/**
 * Brand Header Separation required by Section 2:
 * Arabic brand `عالم يرا` and English `Mira's World` distinguished from translated interface text.
 */
export const V16_BRAND_IDENTITY = {
  arabicBrandTitle: 'عالم يرا',
  arabiziBrandTitle: '3alam Mira (Mira\'s World)',
  englishBrandTitle: 'Mira\'s World',
  platformTitle: 'MiraVerse',
  brandNote: 'Brand identity (عالم يرا / Mira\'s World) is preserved distinctly from translated UI navigation labels.',
} as const;

/**
 * Truthful Repository & Platform Inventory Totals (`DX01` / `CL01`).
 * Never conflates v1.5 unmerged plans or website knowledge pages with native playable game availability.
 */
export interface RepositoryCountryInventoryV16 {
  v15MergedInMain: boolean;
  legacyActiveCountries: readonly LegacyCountryCode[]; // 5: LB, IQ, EG, FR, KR
  minecraftGlobalStagedOnlyCountries: readonly string[]; // 6 extra in packages/content/minecraft-global (FR-CA/DE/CN/JP/RU/UA/MA)
  gulfV16Countries: readonly GulfCountryCode[]; // 6: QA, AE, KW, SA, OM, BH
  futureCandidatesExcludedFromRelease: readonly {
    code: 'YE';
    nameEn: 'Yemen';
    status: 'POTENTIAL_FUTURE_DESTINATION_NOT_RELEASED';
    requirement: 'Requires dedicated historical/ethnographic research and human Yemeni cultural review before inclusion.';
  }[];
  totals: {
    legacyImplementedWebAndPacks: 5;
    gulfV16ImplementedWebAndStagedGamePacks: 6;
    totalActiveWebPortalCountries: 11; // 5 legacy + 6 Gulf v1.6
    totalPlannedIfV15MergedLater: 33; // 27 + 6 (reported transparently as unmerged target only)
  };
}

export const V16_REPOSITORY_INVENTORY: RepositoryCountryInventoryV16 = {
  v15MergedInMain: false,
  legacyActiveCountries: ['LB', 'IQ', 'EG', 'FR', 'KR'],
  minecraftGlobalStagedOnlyCountries: ['DE', 'CN', 'JP', 'RU', 'UA', 'MA'],
  gulfV16Countries: ['QA', 'AE', 'KW', 'SA', 'OM', 'BH'],
  futureCandidatesExcludedFromRelease: [
    {
      code: 'YE',
      nameEn: 'Yemen',
      status: 'POTENTIAL_FUTURE_DESTINATION_NOT_RELEASED',
      requirement: 'Requires dedicated historical/ethnographic research and human Yemeni cultural review before inclusion.',
    },
  ],
  totals: {
    legacyImplementedWebAndPacks: 5,
    gulfV16ImplementedWebAndStagedGamePacks: 6,
    totalActiveWebPortalCountries: 11,
    totalPlannedIfV15MergedLater: 33,
  },
};

export interface ProvenanceClaimRecordV16 {
  claimId: string;
  sourceId: string;
  countryCode: GulfCountryCode;
  stableCountryId: StableGulfCountryId;
  passageLocator: string;
  claimText: string;
  epistemicCategory: ProvenanceCategoryV16;
  confidence: 'low' | 'medium' | 'high';
  period: string;
  geographicScope: string;
  externalVerificationUrl: string | null;
  externallyCorroborated: boolean;
  culturalReviewer: string;
  reviewStatus: ReviewStatusV16;
  reviewDate: string | null;
  ageConsiderations: string;
  licensing: 'paraphrase_only_user_supplied_research' | 'public_domain_institution_reference';
}

export interface GeographicSitePinV16 {
  siteId: string;
  countryCode: GulfCountryCode;
  nameEn: string;
  nameAr: string;
  nameArabizi: string;
  coordinates: [number, number]; // [lat, lon] verified WGS84
  uncertaintyMeters: number;
  era: string;
  category: ProvenanceCategoryV16;
  summaryEn: string;
  summaryAr: string;
  summaryArabizi: string;
  attributionSource: string;
  sourceUrl: string;
}

export interface GulfArtifactRecordV16 {
  id: string; // e.g. "artifact.qa.pearl_basket"
  countryCode: GulfCountryCode;
  stableCountryId: StableGulfCountryId;
  nameEn: string;
  nameAr: string;
  nameArabizi: string;
  eraAndMaterial: string;
  category: ProvenanceCategoryV16;
  descriptionEn: string;
  descriptionAr: string;
  descriptionArabizi: string;
  provenanceNote: string;
  imageUrl: string;
  questActNumber: 1 | 2 | 3 | 4 | 5;
  reviewStatus: ReviewStatusV16;
}

export interface GulfVocabularyItemV16 {
  termId: string;
  countryCode: GulfCountryCode;
  dialectVariant: GulfDialectCode;
  arabicScript: string;
  msaEquivalent: string;
  arabiziPhonetic5To7: string;
  arabiziStandard11To17: string;
  englishGloss: string;
  culturalNote: string;
  audioPhoneticHint: string;
}

export interface GulfAgeTierVariantV16 {
  ageTier: AgeTierId;
  stageId: string; // e.g. "quest.qa.01.tier.5-7"
  durationMinutes: string;
  readingLoad: 'low_pictorial_captioned' | 'guided_bilingual_cards' | 'investigative_multi_step' | 'source_critical_provenance';
  titleEn: string;
  titleAr: string;
  titleArabizi: string;
  objectiveEn: string;
  objectiveAr: string;
  objectiveArabizi: string;
  puzzleMechanicsEn: string;
  scaffoldingAndHintEn: string;
  adultAssistanceOption: boolean;
  shorterSessionOverrideMinutes: number;
  robloxAdapterMechanics: string;
  bedrockAdapterMechanics: string;
}

export interface GulfQuestActSpecV16 {
  id: string; // e.g. "quest.qa.01"
  countryCode: GulfCountryCode;
  stableCountryId: StableGulfCountryId;
  actNumber: 1 | 2 | 3 | 4 | 5;
  canonicalArchetype: 'GATHER' | 'TRADE' | 'BUILD' | 'COOK_OR_STORY' | 'WORD_FINALE';
  countrySpecificAlias: string; // e.g. "STORY/COOK", "WORD", "COOK/STORY"
  titleEn: string;
  titleAr: string;
  titleArabizi: string;
  settingSubarea: string;
  mentorNpcId: string;
  mentorNameEn: string;
  mentorNameAr: string;
  mentorNameArabizi: string;
  summaryEn: string;
  summaryAr: string;
  summaryArabizi: string;
  epistemicCategory: ProvenanceCategoryV16;
  epistemicWarningEn: string;
  objectiveGraph: {
    stepId: string;
    descriptionEn: string;
    requiredItemOrAction: string;
    hintEn: string;
    failureRecovery: string;
  }[];
  coopBehavior: {
    supportsTwoPlayerCoop: boolean;
    sharedCheckpointId: string;
    roleSplitEn: string;
  };
  reward: {
    collectibleArtifactId: string;
    passportMilestoneId: string;
    miraTokensEarned: number;
    idempotencyKey: string;
  };
  mapCheckpoint: {
    questMapSvgUrl: string;
    markerXPercent: number;
    markerYPercent: number;
    checkpointLabelEn: string;
    checkpointLabelAr: string;
    checkpointLabelArabizi: string;
  };
  vocabularyIds: string[];
  ageTiers: Record<AgeTierId, GulfAgeTierVariantV16>;
  robloxImplementation: {
    moduleName: string;
    interactionType: string;
    zoneAnchorName: string;
    status: PlatformTruthStatusV16;
  };
  bedrockImplementation: {
    scriptHandler: string;
    structureTemplateId: string;
    customBlocksAndItems: string[];
    status: PlatformTruthStatusV16;
  };
}

export interface GulfCountryExperienceV16 {
  countryCode: GulfCountryCode;
  stableId: StableGulfCountryId;
  orderNumber: 1 | 2 | 3 | 4 | 5 | 6;
  isSixthAddedCountry: boolean;
  nameEn: string;
  nameAr: string;
  nameArabizi: string;
  storyArcTitleEn: string;
  storyArcTitleAr: string;
  storyArcTitleArabizi: string;
  dialectCode: GulfDialectCode;
  settingSummaryEn: string;
  settingSummaryAr: string;
  settingSummaryArabizi: string;
  folkloreAndEpistemicFrameEn: string;
  folkloreAndEpistemicFrameAr: string;
  folkloreAndEpistemicFrameArabizi: string;
  diasporaNarrativeEn: string;
  diasporaNarrativeAr: string;
  diasporaNarrativeArabizi: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    surfaceBg: string;
  };
  mentor: {
    npcId: string;
    nameEn: string;
    nameAr: string;
    nameArabizi: string;
    roleEn: string;
    roleAr: string;
    roleArabizi: string;
    isOriginalFictionalCharacter: true;
    fictionalDisclosureEn: string;
    greetingEn: string;
    greetingAr: string;
    greetingArabizi: string;
    portraitSvgUrl: string;
  };
  keyArtUrl: string;
  adventureMapSvgUrl: string;
  passportStampSvgUrl: string;
  passportStampCodeExample: string;
  platformStatus: {
    website: PlatformTruthStatusV16;
    roblox: PlatformTruthStatusV16;
    minecraftBedrock: PlatformTruthStatusV16;
    blockerNoteEn: string;
  };
  realGeographicPins: GeographicSitePinV16[];
  artifacts: GulfArtifactRecordV16[];
  glossary: GulfVocabularyItemV16[];
  questActs: GulfQuestActSpecV16[];
  familyConversationPrompts: {
    promptId: string;
    questionEn: string;
    questionAr: string;
    questionArabizi: string;
    privacyNoteEn: string;
  }[];
  traditionsAndFood: {
    dishOrCraftNameEn: string;
    dishOrCraftNameAr: string;
    dishOrCraftNameArabizi: string;
    descriptionEn: string;
    allergySafeSubstitutionsEn: string[];
    nonFoodCraftAlternativeEn: string;
  };
  architectureAndMusic: {
    architecturalFeaturesEn: string[];
    rhythmicTraditionNoteEn: string;
    audioRightsStatus: 'original_licensed_rhythm_only_no_copyrighted_or_sacred_recordings';
  };
}
