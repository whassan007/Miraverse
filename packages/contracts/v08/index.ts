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

export const P0_PRODUCTION_ART_ASSETS = {
  heroDesktopJpg: '/art/p0/hero-byblos-desktop.jpg',
  heroDesktopWebp: '/art/p0/hero-byblos-desktop.webp',
  heroMobileJpg: '/art/p0/hero-byblos-mobile.jpg',
  heroMobileWebp: '/art/p0/hero-byblos-mobile.webp',
  miraPortraitJpg: '/art/p0/portrait-mira.jpg',
  passportDeskJpg: '/art/p0/passport-collectible-desk.jpg',
  robloxCoopJpg: '/art/p0/roblox-coop-byblos.jpg',
  minecraftBedrockJpg: '/art/p0/minecraft-bedrock-byblos.jpg',
  byblosQuestSceneJpg: '/art/p0/quest-byblos-saj-bakery.jpg',
  worldCovers: {
    LB: '/art/p0/world-cover-LB.jpg',
    EG: '/art/p0/world-cover-EG.jpg',
    IQ: '/art/p0/world-cover-IQ.jpg',
    KR: '/art/p0/world-cover-KR.jpg',
    FR: '/art/p0/world-cover-FR.jpg',
  },
  mentorPortraits: {
    LB: '/art/p0/portrait-mentor-LB.jpg',
    EG: '/art/p0/portrait-mentor-EG.jpg',
    IQ: '/art/p0/portrait-mentor-IQ.jpg',
    KR: '/art/p0/portrait-mentor-KR.jpg',
    FR: '/art/p0/portrait-mentor-FR.jpg',
  },
} as const;

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
    coverArtUrl: '/art/p0/world-cover-LB.jpg',
    sceneArtUrls: [
      '/art/p0/quest-byblos-saj-bakery.jpg',
      '/art/p0/roblox-coop-byblos.jpg',
      '/art/p0/minecraft-bedrock-byblos.jpg',
      '/art/p0/hero-byblos-desktop.jpg',
      '/art/p0/passport-collectible-desk.jpg',
    ],
    portraitArtUrl: '/art/p0/portrait-mentor-LB.jpg',
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
    locationLabel: 'Historic Cairo & Lantern Market',
    chapterTitle: 'Lanterns of the Nile',
    mentorName: 'Uncle Tariq',
    mentorTitle: 'Master Lantern Artisan & Courtyard Host',
    mentorGreetingNative: 'يا هلا بمصر! الفوانيس منوّرة الحارة الليلة.',
    mentorGreetingEn: 'Welcome to Cairo! Help us hang the stained-glass fanous lanterns and prepare warm koshari for the courtyard.',
    landmarkName: 'Khan el-Khalili Lantern Courtyard',
    signatureDish: 'Cairo Spiced Koshari',
    adventureHook:
      'Walk beneath glowing brass and stained-glass fanous lanterns in historic Cairo, trade colored glass below carved mashrabiya balconies, and simmer festive koshari.',
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
    coverArtUrl: '/art/p0/world-cover-EG.jpg',
    sceneArtUrls: ['/art/p0/world-cover-EG.jpg', '/art/EG/1.svg', '/art/EG/2.svg', '/art/EG/3.svg', '/art/EG/4.svg'],
    portraitArtUrl: '/art/p0/portrait-mentor-EG.jpg',
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
    locationLabel: 'Baghdad Courtyard & Tigris Riverfront',
    chapterTitle: 'Palms of the Tigris',
    mentorName: 'Ustadh Zayd',
    mentorTitle: 'Astronomer, Calligrapher & Courtyard Host',
    mentorGreetingNative: 'هلا بيكم ببغداد! النخل على دجلة ينتظركم.',
    mentorGreetingEn: 'Welcome to Baghdad! Study the stars with our brass astrolabe by the turquoise fountain and bake cardamom kleicha.',
    landmarkName: 'Tigris Courtyard & House of Wisdom Arches',
    signatureDish: 'Baghdadi Cardamom Date Kleicha',
    adventureHook:
      'Step beneath turquoise-tiled arches overlooking the golden Tigris River, chart constellations with brass astrolabes beside the octagonal fountain, and bake date kleicha.',
    architecturalCues: [
      'Turquoise-glazed geometric mosaic courtyard arches',
      'Warm buff-brick pointed riverside arcades',
      'Octagonal courtyard fountain reflecting lantern light',
      'Towering Tigris date palm groves & wooden river boats',
    ],
    isFlagshipSlice: false,
    robloxStatus: 'IN_NATIVE_VALIDATION',
    robloxStatusLabel: 'Story & Preview Live · Roblox RC3 Next',
    minecraftStatus: 'IN_NATIVE_VALIDATION',
    minecraftStatusLabel: 'Included in Bedrock Add-On Pack',
    storyStatusLabel: '15-Scene Story Live (ar-IQ)',
    coverArtUrl: '/art/p0/world-cover-IQ.jpg',
    sceneArtUrls: ['/art/p0/world-cover-IQ.jpg', '/art/IQ/1.svg', '/art/IQ/2.svg', '/art/IQ/3.svg', '/art/IQ/4.svg'],
    portraitArtUrl: '/art/p0/portrait-mentor-IQ.jpg',
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
    mentorName: 'Halmeoni Seo-Yeon',
    mentorTitle: 'Hanji Lantern Artisan & Culinary Elder',
    mentorGreetingNative: '전주 한옥마을에 오신 것을 환영해요! 함께 송편과 비빔밥을 만들어요.',
    mentorGreetingEn: 'Welcome to Jeonju Hanok Village! Let us light the silk lanterns along the giwa rooftops and prepare songpyeon.',
    landmarkName: 'Jeonju Giwa Hanok Courtyard',
    signatureDish: 'Jeonju Five-Color Bibimbap & Songpyeon',
    adventureHook:
      'Stroll sunlit cobblestone lanes beneath sweeping dark-slate giwa roofs and golden ginkgo trees, restore warm hanji paper doors, and prepare festive songpyeon.',
    architecturalCues: [
      'Upward-curving dark clay giwa roof eaves',
      'Warm backlit changhoji mulberry-paper lattice doors',
      'Elevated wooden maru veranda & courtyard onggi jars',
      'Red-and-blue silk lanterns & golden ginkgo trees',
    ],
    isFlagshipSlice: false,
    robloxStatus: 'IN_NATIVE_VALIDATION',
    robloxStatusLabel: 'Story & Preview Live · Roblox RC3 Next',
    minecraftStatus: 'IN_NATIVE_VALIDATION',
    minecraftStatusLabel: 'Included in Bedrock Add-On Pack',
    storyStatusLabel: '15-Scene Story Live (ko)',
    coverArtUrl: '/art/p0/world-cover-KR.jpg',
    sceneArtUrls: ['/art/p0/world-cover-KR.jpg', '/art/KR/1.svg', '/art/KR/2.svg', '/art/KR/3.svg', '/art/KR/4.svg'],
    portraitArtUrl: '/art/p0/portrait-mentor-KR.jpg',
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
    locationLabel: 'Vieux Lyon & Traditional Bakery',
    chapterTitle: 'The Golden Boulangerie of Lyon',
    mentorName: 'Chef Élodie',
    mentorTitle: 'Master Boulangère of Vieux Lyon',
    mentorGreetingNative: 'Bienvenue dans le Vieux Lyon ! Préparons ensemble une brioche dorée.',
    mentorGreetingEn: 'Welcome to Vieux Lyon! Follow the cobblestone traboule courtyard to our warm neighborhood bakery.',
    landmarkName: 'Vieux Lyon Renaissance Traboule & Boulangerie',
    signatureDish: 'Golden Brioche & Galette des Rois',
    adventureHook:
      'Explore ochre Renaissance facades and stone lion fountains in Vieux Lyon, step through vaulted traboule archways, and bake golden croissants and brioche with Chef Élodie.',
    architecturalCues: [
      'Ochre & rose Renaissance stone facades of Vieux Lyon',
      'Vaulted stone traboule archway & carved lion fountain',
      'Warm boulangerie display windows & woven bread baskets',
      'Cobblestone square with Fourvière hill on the horizon',
    ],
    isFlagshipSlice: false,
    robloxStatus: 'IN_NATIVE_VALIDATION',
    robloxStatusLabel: 'Story & Preview Live · Roblox RC3 Next',
    minecraftStatus: 'IN_NATIVE_VALIDATION',
    minecraftStatusLabel: 'Included in Bedrock Add-On Pack',
    storyStatusLabel: '15-Scene Story Live (fr)',
    coverArtUrl: '/art/p0/world-cover-FR.jpg',
    sceneArtUrls: ['/art/p0/world-cover-FR.jpg', '/art/FR/1.svg', '/art/FR/2.svg', '/art/FR/3.svg', '/art/FR/4.svg'],
    portraitArtUrl: '/art/p0/portrait-mentor-FR.jpg',
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
    sceneIllustrationUrl: '/art/p0/hero-byblos-desktop.jpg',
  },
  {
    stepNumber: 2,
    type: 'trade',
    title: 'Meet & Trade',
    badge: 'Step 2 · Souk & Market',
    description: 'Greet friendly neighborhood vendors and exchange supplies with respectful local phrases.',
    byblosExample: 'Trade harvested herbs with harbor merchants in the sunlit stone souk for golden olive oil.',
    iconUrl: '/art/v08/icons/quest-trade.svg',
    sceneIllustrationUrl: '/art/p0/roblox-coop-byblos.jpg',
  },
  {
    stepNumber: 3,
    type: 'build',
    title: 'Build & Restore',
    badge: 'Step 3 · Hands-On Craft',
    description: 'Rebuild historic arches, lanterns, shutters, and tiled roofs step-by-step with friends.',
    byblosExample: 'Restore Byblos Harbor’s limestone arches, sea castle watchtower, and pier lanterns.',
    iconUrl: '/art/v08/icons/quest-build.svg',
    sceneIllustrationUrl: '/art/p0/minecraft-bedrock-byblos.jpg',
  },
  {
    stepNumber: 4,
    type: 'cook',
    title: 'Cook Together',
    badge: 'Step 4 · Family Kitchen',
    description: 'Prepare each region’s signature dish alongside your elder mentor (with adult supervision off-screen).',
    byblosExample: 'Stretch dough and bake fragrant za’atar man’oushe on the domed stone saj with Teta Nahla.',
    iconUrl: '/art/v08/icons/quest-cook.svg',
    sceneIllustrationUrl: '/art/p0/quest-byblos-saj-bakery.jpg',
  },
  {
    stepNumber: 5,
    type: 'word',
    title: 'Discover Words & Earn Stamp',
    badge: 'Step 5 · Language & Keepsake',
    description: 'Practice authentic cultural expressions in native script and unlock your chapter Passport stamp.',
    byblosExample: 'Master Lebanese Arabic greetings and earn the Cedar & Saj Harbour Stamp + Mira Tokens.',
    iconUrl: '/art/v08/icons/quest-word.svg',
    sceneIllustrationUrl: '/art/p0/passport-collectible-desk.jpg',
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
