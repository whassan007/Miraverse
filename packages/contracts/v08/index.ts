/**
 * MiraVerse v0.8 — Platform Truth, Visual Mapping, Passport & Adult Commerce Contracts
 * Owners: CL02, CL03, CL04, CL05, CL06, CL08, CL09, CX03
 */
import type { CountryCode } from '../index';

export const V08_RELEASE_VERSION = '0.8.0' as const;
export const V08_CULTURAL_REVIEW_STATUS = 'AI_REVIEWED_PENDING_HUMAN' as const;

export type PlatformAvailabilityTier =
  | 'FLAGSHIP_BUILD_VERIFIED'
  | 'COMPANION_ADDON_DOWNLOADABLE'
  | 'IN_NATIVE_VALIDATION'
  | 'STORY_AND_PREVIEW_AVAILABLE';

export interface CountryPlatformTruthV08 {
  country: CountryCode;
  nameEn: string;
  nameNative: string;
  storyLang: 'ar-LB' | 'ar-EG' | 'ar-IQ' | 'ko' | 'fr';
  locationLabel: string;
  chapterTitle: string;
  mentorName: string;
  mentorTitle: string;
  mentorGreetingNative: string;
  mentorGreetingEn: string;
  landmarkName: string;
  signatureDish: string;
  adventureHook: string;
  architecturalCues: string[];
  isFlagshipSlice: boolean;
  robloxStatus: PlatformAvailabilityTier;
  robloxStatusLabel: string;
  minecraftStatus: PlatformAvailabilityTier;
  minecraftStatusLabel: string;
  storyStatusLabel: string;
  coverArtUrl: string;
  sceneArtUrls: string[];
  portraitArtUrl: string;
  stampArtUrl: string;
  primaryColorHex: string;
  accentColorHex: string;
  surfaceTintHex: string;
}

export const V08_WORLD_VISUAL_MAP: Record<CountryCode, CountryPlatformTruthV08> = {
  LB: {
    country: 'LB',
    nameEn: 'Lebanon',
    nameNative: 'لبنان · جبيل',
    storyLang: 'ar-LB',
    locationLabel: 'Byblos Harbor & Old Souk',
    chapterTitle: "Summer at Teta's",
    mentorName: 'Teta Nahla',
    mentorTitle: 'Harbor Baker & Heritage Storykeeper',
    mentorGreetingNative: 'أهلاً وسهلاً ببجبيل! تعوا نخبز منقوشة عالصاج.',
    mentorGreetingEn: 'Welcome to Byblos Harbor! Let us gather wild za’atar and bake warm man’oushe on the saj.',
    landmarkName: 'Byblos Limestone Courtyard & Saj Bakery',
    signatureDish: "Za'atar & Olive Oil Man'oushe",
    adventureHook:
      'Roam ancient limestone arches by the Mediterranean sea, gather wild mountain thyme with Teta Nahla, restore the harbor courtyard, and bake golden flatbread on a domed saj.',
    architecturalCues: [
      'Phoenician & Crusader harbor watchtower',
      'Triple-arched Lebanese limestone house (mandaloun)',
      'Domed cast-iron saj hearth & olive terrace',
      'Wooden coastal faluka fishing boats',
    ],
    isFlagshipSlice: true,
    robloxStatus: 'FLAGSHIP_BUILD_VERIFIED',
    robloxStatusLabel: 'RC1 Flagship · Playable on Roblox',
    minecraftStatus: 'COMPANION_ADDON_DOWNLOADABLE',
    minecraftStatusLabel: 'RC2 Companion · Bedrock Add-On Ready',
    storyStatusLabel: '15-Scene Story Live (ar-LB)',
    coverArtUrl: '/art/LB/cover.svg',
    sceneArtUrls: ['/art/LB/1.svg', '/art/LB/2.svg', '/art/LB/3.svg', '/art/LB/4.svg', '/art/LB/5.svg'],
    portraitArtUrl: '/art/v08/portraits/mentor-LB.svg',
    stampArtUrl: '/art/v08/stamps/stamp-LB.svg',
    primaryColorHex: '#0D9488',
    accentColorHex: '#F4A261',
    surfaceTintHex: '#112A34',
  },
  EG: {
    country: 'EG',
    nameEn: 'Egypt',
    nameNative: 'مصر · القاهرة',
    storyLang: 'ar-EG',
    locationLabel: 'Historic Cairo & Nile Courtyard',
    chapterTitle: 'Lanterns of the Nile',
    mentorName: 'Teta Samira',
    mentorTitle: 'Master Lantern Artisan & Courtyard Host',
    mentorGreetingNative: 'يا هلا بمصر! الفوانيس منوّرة الحارة الليلة.',
    mentorGreetingEn: 'Welcome to Cairo! Help us hang the brass fanous lanterns and prepare warm koshari for the courtyard.',
    landmarkName: 'Khan el-Khalili Lantern Courtyard',
    signatureDish: 'Cairo Spiced Koshari',
    adventureHook:
      'Sail past Nile feluccas at twilight, trade colored glass with brass smiths in historic Cairo, restore glowing Ramadan fanous lanterns, and simmer festive koshari.',
    architecturalCues: [
      'Carved wooden mashrabiya lattice balconies',
      'Pierced brass & stained-glass fanous lanterns',
      'White-sailed Nile felucca boats at sunset',
      'Ablaq striped stone courtyard arches',
    ],
    isFlagshipSlice: false,
    robloxStatus: 'IN_NATIVE_VALIDATION',
    robloxStatusLabel: 'Story & Preview Live · Roblox RC3 Next',
    minecraftStatus: 'IN_NATIVE_VALIDATION',
    minecraftStatusLabel: 'Included in Bedrock Add-On Pack',
    storyStatusLabel: '15-Scene Story Live (ar-EG)',
    coverArtUrl: '/art/EG/cover.svg',
    sceneArtUrls: ['/art/EG/1.svg', '/art/EG/2.svg', '/art/EG/3.svg', '/art/EG/4.svg', '/art/EG/5.svg'],
    portraitArtUrl: '/art/v08/portraits/mentor-EG.svg',
    stampArtUrl: '/art/v08/stamps/stamp-EG.svg',
    primaryColorHex: '#D97706',
    accentColorHex: '#FBBF24',
    surfaceTintHex: '#281E18',
  },
  IQ: {
    country: 'IQ',
    nameEn: 'Iraq',
    nameNative: 'العراق · بغداد',
    storyLang: 'ar-IQ',
    locationLabel: 'Baghdad Riverfront & Shanashil Courtyard',
    chapterTitle: 'Palms of the Tigris',
    mentorName: 'Bibi Amal',
    mentorTitle: 'Calligraphy Keeper & Orchard Host',
    mentorGreetingNative: 'هلا بيكم ببغداد! النخل على دجلة ينتظركم.',
    mentorGreetingEn: 'Welcome to Baghdad! Gather sweet golden dates beneath the palms and restore our stained-glass shanashil.',
    landmarkName: 'Tigris Shanashil Courtyard & Fountain',
    signatureDish: 'Baghdadi Cardamom Date Kleicha',
    adventureHook:
      'Step beneath pointed brick arches along the Tigris riverfront, restore jewel-toned shanashil bay windows and turquoise fountains, and bake cardamom date kleicha pastries.',
    architecturalCues: [
      'Ornate projecting wooden shanashil windows with stained glass',
      'Warm buff-brick pointed courtyard arches',
      'Octagonal turquoise-tiled courtyard fountain',
      'Towering Tigris date palm groves',
    ],
    isFlagshipSlice: false,
    robloxStatus: 'IN_NATIVE_VALIDATION',
    robloxStatusLabel: 'Story & Preview Live · Roblox RC3 Next',
    minecraftStatus: 'IN_NATIVE_VALIDATION',
    minecraftStatusLabel: 'Included in Bedrock Add-On Pack',
    storyStatusLabel: '15-Scene Story Live (ar-IQ)',
    coverArtUrl: '/art/IQ/cover.svg',
    sceneArtUrls: ['/art/IQ/1.svg', '/art/IQ/2.svg', '/art/IQ/3.svg', '/art/IQ/4.svg', '/art/IQ/5.svg'],
    portraitArtUrl: '/art/v08/portraits/mentor-IQ.svg',
    stampArtUrl: '/art/v08/stamps/stamp-IQ.svg',
    primaryColorHex: '#0284C7',
    accentColorHex: '#38BDF8',
    surfaceTintHex: '#102538',
  },
  KR: {
    country: 'KR',
    nameEn: 'South Korea',
    nameNative: '대한민국 · 전주',
    storyLang: 'ko',
    locationLabel: 'Jeonju Hanok Village',
    chapterTitle: 'Moonlight Over the Hanok',
    mentorName: 'Halmeoni Jin',
    mentorTitle: 'Hanok Craftswoman & Culinary Elder',
    mentorGreetingNative: '전주 한옥마을에 오신 것을 환영해요! 함께 송편과 비빔밥을 만들어요.',
    mentorGreetingEn: 'Welcome to Jeonju Hanok Village! Let us repair the paper-screen doors beneath the harvest moon.',
    landmarkName: 'Jeonju Giwa Hanok Courtyard',
    signatureDish: 'Jeonju Five-Color Bibimbap & Songpyeon',
    adventureHook:
      'Explore sweeping dark-tiled giwa roofs under a glowing autumn moon, repair warm changhoji paper screens, and arrange colorful seasonal vegetables with Halmeoni Jin.',
    architecturalCues: [
      'Upward-curving dark clay giwa roof eaves',
      'Warm backlit changhoji mulberry-paper lattice doors',
      'Elevated wooden maru veranda & courtyard onggi jars',
      'Korean red pine branches framing the harvest moon',
    ],
    isFlagshipSlice: false,
    robloxStatus: 'IN_NATIVE_VALIDATION',
    robloxStatusLabel: 'Story & Preview Live · Roblox RC3 Next',
    minecraftStatus: 'IN_NATIVE_VALIDATION',
    minecraftStatusLabel: 'Included in Bedrock Add-On Pack',
    storyStatusLabel: '15-Scene Story Live (ko)',
    coverArtUrl: '/art/KR/cover.svg',
    sceneArtUrls: ['/art/KR/1.svg', '/art/KR/2.svg', '/art/KR/3.svg', '/art/KR/4.svg', '/art/KR/5.svg'],
    portraitArtUrl: '/art/v08/portraits/mentor-KR.svg',
    stampArtUrl: '/art/v08/stamps/stamp-KR.svg',
    primaryColorHex: '#4F46E5',
    accentColorHex: '#A5B4FC',
    surfaceTintHex: '#181C3A',
  },
  FR: {
    country: 'FR',
    nameEn: 'France',
    nameNative: 'France · Vieux Lyon',
    storyLang: 'fr',
    locationLabel: 'Vieux Lyon Traboules & Boulangerie',
    chapterTitle: 'The Golden Boulangerie of Lyon',
    mentorName: 'Mamie Claire',
    mentorTitle: 'Master Boulangère of Vieux Lyon',
    mentorGreetingNative: 'Bienvenue dans le Vieux Lyon ! Préparons ensemble une galette dorée.',
    mentorGreetingEn: 'Welcome to Vieux Lyon! Follow the stone traboule passageways to our warm neighborhood bakery.',
    landmarkName: 'Vieux Lyon Renaissance Traboule & Boulangerie',
    signatureDish: 'Golden Galette des Rois & Brioche',
    adventureHook:
      'Discover hidden Renaissance stone passageways in Vieux Lyon, trade fresh butter and almonds at the morning market, restore bakery shutters, and score a golden Galette des Rois.',
    architecturalCues: [
      'Ochre & rose Renaissance stone facades of Vieux Lyon',
      'Vaulted stone traboule courtyard arches',
      'Warm boulangerie display windows & wooden bread racks',
      'Cobblestone rue with wrought-iron lanterns',
    ],
    isFlagshipSlice: false,
    robloxStatus: 'IN_NATIVE_VALIDATION',
    robloxStatusLabel: 'Story & Preview Live · Roblox RC3 Next',
    minecraftStatus: 'IN_NATIVE_VALIDATION',
    minecraftStatusLabel: 'Included in Bedrock Add-On Pack',
    storyStatusLabel: '15-Scene Story Live (fr)',
    coverArtUrl: '/art/FR/cover.svg',
    sceneArtUrls: ['/art/FR/1.svg', '/art/FR/2.svg', '/art/FR/3.svg', '/art/FR/4.svg', '/art/FR/5.svg'],
    portraitArtUrl: '/art/v08/portraits/mentor-FR.svg',
    stampArtUrl: '/art/v08/stamps/stamp-FR.svg',
    primaryColorHex: '#2563EB',
    accentColorHex: '#F59E0B',
    surfaceTintHex: '#14223B',
  },
};

export interface QuestLoopStepV08 {
  stepNumber: number;
  type: 'gather' | 'trade' | 'build' | 'cook' | 'word';
  title: string;
  badge: string;
  description: string;
  byblosExample: string;
  iconUrl: string;
  sceneIllustrationUrl: string;
}

export const V08_QUEST_LOOP_STEPS: QuestLoopStepV08[] = [
  {
    stepNumber: 1,
    type: 'gather',
    title: 'Explore & Gather',
    badge: 'Step 1 · Outdoor Discovery',
    description: 'Search harbors, courtyards, and hillside terraces for fresh regional herbs and artisan supplies.',
    byblosExample: 'Gather wild mountain za’atar and sun-ripened olives along the Byblos harbor steps.',
    iconUrl: '/art/v08/icons/quest-gather.svg',
    sceneIllustrationUrl: '/art/LB/1.svg',
  },
  {
    stepNumber: 2,
    type: 'trade',
    title: 'Meet & Trade',
    badge: 'Step 2 · Souk & Market',
    description: 'Greet friendly neighborhood vendors and exchange supplies with respectful local phrases.',
    byblosExample: 'Trade harvested herbs with Uncle Tariq in the old stone souk for golden olive oil and sesame.',
    iconUrl: '/art/v08/icons/quest-trade.svg',
    sceneIllustrationUrl: '/art/LB/2.svg',
  },
  {
    stepNumber: 3,
    type: 'build',
    title: 'Build & Restore',
    badge: 'Step 3 · Hands-On Craft',
    description: 'Rebuild historic arches, lanterns, shutters, and tiled roofs step-by-step with friends.',
    byblosExample: 'Restore Teta Nahla’s triple-arched limestone courtyard wall and harbor lantern brackets.',
    iconUrl: '/art/v08/icons/quest-build.svg',
    sceneIllustrationUrl: '/art/LB/3.svg',
  },
  {
    stepNumber: 4,
    type: 'cook',
    title: 'Cook Together',
    badge: 'Step 4 · Family Kitchen',
    description: 'Prepare each region’s signature dish alongside your elder mentor (with adult supervision off-screen).',
    byblosExample: 'Stretch dough and bake fragrant za’atar man’oushe on the domed cast-iron saj.',
    iconUrl: '/art/v08/icons/quest-cook.svg',
    sceneIllustrationUrl: '/art/LB/4.svg',
  },
  {
    stepNumber: 5,
    type: 'word',
    title: 'Discover Words & Earn Stamp',
    badge: 'Step 5 · Language & Keepsake',
    description: 'Practice authentic cultural expressions in native script and unlock your chapter Passport stamp.',
    byblosExample: 'Master Lebanese Arabic greetings and earn the Cedar & Saj Harbour Stamp + Mira Tokens.',
    iconUrl: '/art/v08/icons/quest-word.svg',
    sceneIllustrationUrl: '/art/LB/5.svg',
  },
];

export const V08_TRUTH_GUARDRAILS = {
  version: V08_RELEASE_VERSION,
  culturalStatus: V08_CULTURAL_REVIEW_STATUS,
  robloxRequiresAccountAndApp: true,
  minecraftRequiresLicensedBedrockClient: true,
  minimumBedrockVersion: '1.21.50',
  browserPassportSyncsToRoblox: false,
  webPurchasesUnlockNativeGameItems: false,
  stripeLiveChargesEnabled: false,
  defaultDemoParentSessionAllowed: false,
  forbidZeroNetworkCallsClaimOnCheckoutPages: true,
  forbidUnsubstantiatedLegalCertificationClaims: true,
} as const;
