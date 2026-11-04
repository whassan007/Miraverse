/**
 * MiraVerse Global v1.1 — Unified 11-Country, 66-Chapter, 264-Age-Variant & 14-Language Web Catalog
 * Bridges `packages/content/minecraft-global/registry.json` and the 14 locale profiles into the web portal.
 */
import globalRegistryRaw from '../../../../packages/content/minecraft-global/registry.json';
import localesRegistryRaw from '../../../../packages/content/minecraft-global/locales/locales-registry.json';
import globalEnUS from '../../../../packages/content/locales/en-US/messages.json';
import type { AgeTierId, EpistemicClassification } from '../../../../packages/contracts/v13/index';
import type { CountryCode } from '../../../../packages/contracts/index';

export type GlobalCountryCode =
  | 'LB'
  | 'IQ'
  | 'EG'
  | 'FR'
  | 'KR'
  | 'DE'
  | 'CN'
  | 'JP'
  | 'RU'
  | 'UA'
  | 'MA';

export const GLOBAL_COUNTRIES_ORDERED: readonly GlobalCountryCode[] = [
  'LB',
  'IQ',
  'EG',
  'FR',
  'KR',
  'DE',
  'CN',
  'JP',
  'RU',
  'UA',
  'MA',
] as const;

export const GLOBAL_NEW_COUNTRY_CODES: readonly GlobalCountryCode[] = [
  'DE',
  'CN',
  'JP',
  'RU',
  'UA',
  'MA',
] as const;

export function isCoreCountryCode(code: string): code is CountryCode {
  return ['LB', 'IQ', 'EG', 'FR', 'KR'].includes(code);
}

export function isGlobalCountryCode(code: string): code is GlobalCountryCode {
  return GLOBAL_COUNTRIES_ORDERED.includes(code as GlobalCountryCode);
}

export interface GlobalLearnWord {
  key: string;
  native: string;
  translit: string;
  en: string;
}

export interface GlobalAgeVariant {
  track: string;
  interaction: string;
  steps: number;
  hint: string;
  timersEnabled: boolean;
  resourceLossPossible: boolean;
  checkpointEveryStep: boolean;
  readingLoad: string;
  activitySummary: string;
  objectiveNodes: string[];
  recoveryMode: string;
}

export interface GlobalChapterEntry {
  id: string;
  countryCode: GlobalCountryCode;
  chapterIndex: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  activity: string;
  mechanic: string;
  scene: string;
  sourceType: 'folklore' | 'literature' | 'historical_context' | 'contemporary_tradition' | 'fictional_gameplay';
  sourceIds: string[];
  prerequisiteChapterId: string | null;
  independentlyAvailableAtStart: boolean;
  npcLeadId: string;
  supportNpcId: string;
  stationAnchorId: string;
  stationCoords: { x: number; y: number; z: number };
  reward: {
    artifactId: string;
    artifactName: string;
    storySparks: number;
    grantsCountryStamp: string | null;
    grantsCapstoneKeepsake: string | null;
  };
  ageVariants: Record<AgeTierId, GlobalAgeVariant>;
}

export interface GlobalNpcEntry {
  id: string;
  countryCode: GlobalCountryCode;
  name: string;
  nameNative: string;
  role: string;
  greeting: string;
}

export interface GlobalLandmarkSpec {
  landmarkId: string;
  country: GlobalCountryCode;
  name: string;
  nativeName: string;
  coordinates: [number, number];
  eraOrCentury: string;
  classification: EpistemicClassification;
  summary: string;
  educationalReference: string;
}

export interface GlobalCountryMeta {
  code: GlobalCountryCode;
  order: number;
  name: string;
  nameNative: string;
  city: string;
  subtitle: string;
  theme: string;
  visualIdentity: string;
  localLanguage: string;
  storyRouteLang: 'ar-LB' | 'ar-IQ' | 'ar-EG' | 'fr' | 'ko';
  culturalWarning: string;
  capstoneArtifact: { id: string; name: string };
  stampId: string;
  stampName: string;
  learnWords: GlobalLearnWord[];
  chapterIds: string[];
  castIds: string[];
  mentorName: string;
  mentorTitle: string;
  mentorGreetingNative: string;
  mentorGreetingEn: string;
  signatureDish: string;
  craftName: string;
  coverArtUrl: string;
  portraitArtUrl: string;
  questMapArtUrl: string;
  stampArtUrl: string;
  primaryColorHex: string;
  accentColorHex: string;
  surfaceTintHex: string;
  coordinatesCenter: [number, number];
  geographicSummary: string;
  landmarks: GlobalLandmarkSpec[];
  isCoreFive: boolean;
  isFlagshipSlice: boolean;
  availabilityBadge: string;
}

export interface GlobalLocaleProfile {
  id: string;
  uiValue: string;
  name: string;
  nativeLabel: string;
  nativePackLang: string | null;
  isNativeBedrock: boolean;
  script: 'Latin' | 'CJK' | 'Cyrillic' | 'Arabic';
  direction: 'ltr' | 'rtl';
  fallbackChain: string[];
  scope: string;
}

export const GLOBAL_WEB_LOCALES: readonly GlobalLocaleProfile[] = [
  {
    id: 'en-US',
    uiValue: 'en',
    name: 'English',
    nativeLabel: 'English (en-US)',
    nativePackLang: 'en_US',
    isNativeBedrock: true,
    script: 'Latin',
    direction: 'ltr',
    fallbackChain: ['en-US'],
    scope: 'Global baseline',
  },
  {
    id: 'fr-FR',
    uiValue: 'fr',
    name: 'French (France)',
    nativeLabel: 'Français · France (fr-FR)',
    nativePackLang: 'fr_FR',
    isNativeBedrock: true,
    script: 'Latin',
    direction: 'ltr',
    fallbackChain: ['fr-FR', 'en-US'],
    scope: 'France & global French',
  },
  {
    id: 'fr-CA',
    uiValue: 'fr-CA',
    name: 'French (Canada)',
    nativeLabel: 'Français · Canada (fr-CA)',
    nativePackLang: 'fr_CA',
    isNativeBedrock: true,
    script: 'Latin',
    direction: 'ltr',
    fallbackChain: ['fr-CA', 'fr-FR', 'en-US'],
    scope: 'Canadian French',
  },
  {
    id: 'de-DE',
    uiValue: 'de-DE',
    name: 'German',
    nativeLabel: 'Deutsch · Deutschland (de-DE)',
    nativePackLang: 'de_DE',
    isNativeBedrock: true,
    script: 'Latin',
    direction: 'ltr',
    fallbackChain: ['de-DE', 'en-US'],
    scope: 'Germany',
  },
  {
    id: 'zh-Hans-CN',
    uiValue: 'zh-Hans-CN',
    name: 'Simplified Chinese',
    nativeLabel: '简体中文 · 中国 (zh-Hans-CN)',
    nativePackLang: 'zh_CN',
    isNativeBedrock: true,
    script: 'CJK',
    direction: 'ltr',
    fallbackChain: ['zh-Hans-CN', 'en-US'],
    scope: 'China',
  },
  {
    id: 'ja-JP',
    uiValue: 'ja-JP',
    name: 'Japanese',
    nativeLabel: '日本語 · 日本 (ja-JP)',
    nativePackLang: 'ja_JP',
    isNativeBedrock: true,
    script: 'CJK',
    direction: 'ltr',
    fallbackChain: ['ja-JP', 'en-US'],
    scope: 'Japan',
  },
  {
    id: 'ru-RU',
    uiValue: 'ru-RU',
    name: 'Russian',
    nativeLabel: 'Русский (ru-RU)',
    nativePackLang: 'ru_RU',
    isNativeBedrock: true,
    script: 'Cyrillic',
    direction: 'ltr',
    fallbackChain: ['ru-RU', 'en-US'],
    scope: 'Russia',
  },
  {
    id: 'uk-UA',
    uiValue: 'uk-UA',
    name: 'Ukrainian',
    nativeLabel: 'Українська · Україна (uk-UA)',
    nativePackLang: 'uk_UA',
    isNativeBedrock: true,
    script: 'Cyrillic',
    direction: 'ltr',
    fallbackChain: ['uk-UA', 'en-US'],
    scope: 'Ukraine',
  },
  {
    id: 'ko-KR',
    uiValue: 'ko',
    name: 'Korean',
    nativeLabel: '한국어 · 대한민국 (ko-KR)',
    nativePackLang: 'ko_KR',
    isNativeBedrock: true,
    script: 'CJK',
    direction: 'ltr',
    fallbackChain: ['ko-KR', 'en-US'],
    scope: 'South Korea',
  },
  {
    id: 'ar',
    uiValue: 'ar',
    name: 'Modern Standard Arabic',
    nativeLabel: 'العربية الفصحى (ar)',
    nativePackLang: null,
    isNativeBedrock: false,
    script: 'Arabic',
    direction: 'rtl',
    fallbackChain: ['ar', 'en-US'],
    scope: 'Arabic base',
  },
  {
    id: 'ar-LB',
    uiValue: 'ar-LB',
    name: 'Lebanese Arabic',
    nativeLabel: 'العربية · لبنان (ar-LB)',
    nativePackLang: null,
    isNativeBedrock: false,
    script: 'Arabic',
    direction: 'rtl',
    fallbackChain: ['ar-LB', 'ar', 'en-US'],
    scope: 'Lebanon',
  },
  {
    id: 'ar-IQ',
    uiValue: 'ar-IQ',
    name: 'Iraqi Arabic',
    nativeLabel: 'العربية · العراق (ar-IQ)',
    nativePackLang: null,
    isNativeBedrock: false,
    script: 'Arabic',
    direction: 'rtl',
    fallbackChain: ['ar-IQ', 'ar', 'en-US'],
    scope: 'Iraq',
  },
  {
    id: 'ar-EG',
    uiValue: 'ar-EG',
    name: 'Egyptian Arabic',
    nativeLabel: 'العربية · مصر (ar-EG)',
    nativePackLang: null,
    isNativeBedrock: false,
    script: 'Arabic',
    direction: 'rtl',
    fallbackChain: ['ar-EG', 'ar', 'en-US'],
    scope: 'Egypt',
  },
  {
    id: 'ar-MA',
    uiValue: 'ar-MA',
    name: 'Moroccan Darija',
    nativeLabel: 'الدارجة المغربية · المغرب (ar-MA)',
    nativePackLang: null,
    isNativeBedrock: false,
    script: 'Arabic',
    direction: 'rtl',
    fallbackChain: ['ar-MA', 'ar', 'en-US'],
    scope: 'Morocco',
  },
] as const;

const EXTRA_COUNTRY_DETAILS: Record<
  GlobalCountryCode,
  {
    mentorName: string;
    mentorTitle: string;
    mentorGreetingNative: string;
    mentorGreetingEn: string;
    signatureDish: string;
    craftName: string;
    coverArtUrl: string;
    portraitArtUrl: string;
    questMapArtUrl: string;
    stampArtUrl: string;
    primaryColorHex: string;
    accentColorHex: string;
    surfaceTintHex: string;
    coordinatesCenter: [number, number];
    geographicSummary: string;
    storyRouteLang: 'ar-LB' | 'ar-IQ' | 'ar-EG' | 'fr' | 'ko';
    landmarks: GlobalLandmarkSpec[];
  }
> = {
  LB: {
    mentorName: 'Teta Nahla',
    mentorTitle: 'Harbor Baker & Heritage Storykeeper',
    mentorGreetingNative: 'أهلاً وسهلاً ببجبيل! تعوا نخبز منقوشة عالصاج.',
    mentorGreetingEn: 'Welcome to Byblos Harbor! Let us gather wild za’atar and bake warm man’oushe on the saj.',
    signatureDish: "Za'atar & Olive Oil Man'oushe",
    craftName: 'Byblos Limestone Arch & Phoenician Epigraphy',
    coverArtUrl: '/art/p0/world-cover-LB.jpg',
    portraitArtUrl: '/art/p0/portrait-mentor-LB.jpg',
    questMapArtUrl: '/art/v13/quest-map-LB.jpg',
    stampArtUrl: '/art/v08/stamps/stamp-LB.svg',
    primaryColorHex: '#0D9488',
    accentColorHex: '#F4A261',
    surfaceTintHex: '#112A34',
    coordinatesCenter: [34.123, 35.6511],
    geographicSummary: 'Coastal sandstone and limestone promontory on the eastern Mediterranean shore backed by Mount Lebanon.',
    storyRouteLang: 'ar-LB',
    landmarks: [
      {
        landmarkId: 'LB-BYBLOS-HARBOR',
        country: 'LB',
        name: 'Ancient Port of Byblos (Jbeil)',
        nativeName: 'مرفأ جبيل القديم',
        coordinates: [34.1236, 35.6481],
        eraOrCentury: 'c. 3000 BCE – Present',
        classification: 'ESTABLISHED_HISTORY',
        summary: 'Historic Mediterranean timber and papyrus harbor linking Mount Lebanon cedar forests with the Nile.',
        educationalReference: 'UNESCO World Heritage List #295 (Byblos)',
      },
    ],
  },
  IQ: {
    mentorName: 'Ustadh Zayd & Bibi Amal',
    mentorTitle: 'Astronomer, Calligrapher & Courtyard Host',
    mentorGreetingNative: 'هلا بيكم ببغداد! النخل على دجلة ينتظركم.',
    mentorGreetingEn: 'Welcome to Baghdad! Study the stars with our brass astrolabe by the turquoise fountain and bake cardamom kleicha.',
    signatureDish: 'Baghdadi Cardamom Date Kleicha',
    craftName: 'Shanasheel Lattice Carpentry & Brass Astrolabes',
    coverArtUrl: '/art/p0/world-cover-IQ.jpg',
    portraitArtUrl: '/art/p0/portrait-mentor-IQ.jpg',
    questMapArtUrl: '/art/v13/quest-map-IQ.jpg',
    stampArtUrl: '/art/v08/stamps/stamp-IQ.svg',
    primaryColorHex: '#0284C7',
    accentColorHex: '#38BDF8',
    surfaceTintHex: '#102538',
    coordinatesCenter: [33.3406, 44.3939],
    geographicSummary: 'Situated along the alluvial plains of the Tigris River in central Mesopotamia.',
    storyRouteLang: 'ar-IQ',
    landmarks: [
      {
        landmarkId: 'IQ-MUTANABBI-ST',
        country: 'IQ',
        name: 'Al-Mutanabbi Booksellers Street & Tigris Bank',
        nativeName: 'شارع المتنبي وضفاف دجلة',
        coordinates: [33.3406, 44.3894],
        eraOrCentury: 'Abbasid Era – Present',
        classification: 'LIVING_TRADITION',
        summary: 'Historic Baghdad literary quarter celebrating manuscript preservation, translation, and shared inquiry.',
        educationalReference: 'UNESCO Creative Cities Network — Baghdad City of Literature',
      },
    ],
  },
  EG: {
    mentorName: 'Uncle Tariq & Layla',
    mentorTitle: 'Master Lantern Artisan & Courtyard Host',
    mentorGreetingNative: 'يا هلا بمصر! الفوانيس منوّرة الحارة الليلة.',
    mentorGreetingEn: 'Welcome to Cairo! Help us hang the stained-glass fanous lanterns and prepare warm koshari for the courtyard.',
    signatureDish: 'Cairo Spiced Koshari',
    craftName: 'Pierced Brass & Stained-Glass Fanous Lanterns',
    coverArtUrl: '/art/p0/world-cover-EG.jpg',
    portraitArtUrl: '/art/p0/portrait-mentor-EG.jpg',
    questMapArtUrl: '/art/v13/quest-map-EG.jpg',
    stampArtUrl: '/art/v08/stamps/stamp-EG.svg',
    primaryColorHex: '#D97706',
    accentColorHex: '#FBBF24',
    surfaceTintHex: '#281E18',
    coordinatesCenter: [30.0478, 31.2622],
    geographicSummary: 'Historic Cairo on the eastern bank of the Nile just south of the Nile Delta apex.',
    storyRouteLang: 'ar-EG',
    landmarks: [
      {
        landmarkId: 'EG-KHAN-KHALILI',
        country: 'EG',
        name: 'Historic Cairo & Khan el-Khalili Artisan Lanes',
        nativeName: 'القاهرة التاريخية وخان الخليلي',
        coordinates: [30.0478, 31.2622],
        eraOrCentury: '10th–14th Century CE – Present',
        classification: 'LIVING_TRADITION',
        summary: 'Vibrant neighborhood of brass smiths, glassmakers, and turned-wood mashrabiya courtyards.',
        educationalReference: 'UNESCO World Heritage List #89 (Historic Cairo)',
      },
    ],
  },
  FR: {
    mentorName: 'Chef Élodie & Mamie Camille',
    mentorTitle: 'Master Boulangère & Silk Heritage Guide',
    mentorGreetingNative: 'Bienvenue dans le Vieux Lyon ! Préparons ensemble une brioche dorée.',
    mentorGreetingEn: 'Welcome to Vieux Lyon! Follow the cobblestone traboule courtyard to our warm neighborhood bakery.',
    signatureDish: 'Golden Brioche & Lyonnais Praline Tart',
    craftName: 'Jacquard Silk Weaving & Renaissance Traboule Stonework',
    coverArtUrl: '/art/p0/world-cover-FR.jpg',
    portraitArtUrl: '/art/p0/portrait-mentor-FR.jpg',
    questMapArtUrl: '/art/v13/quest-map-FR.jpg',
    stampArtUrl: '/art/v08/stamps/stamp-FR.svg',
    primaryColorHex: '#2563EB',
    accentColorHex: '#F59E0B',
    surfaceTintHex: '#14223B',
    coordinatesCenter: [45.762, 4.827],
    geographicSummary: 'Confluence of the Rhône and Saône rivers at the foot of Fourvière and Croix-Rousse hills.',
    storyRouteLang: 'fr',
    landmarks: [
      {
        landmarkId: 'FR-VIEUX-LYON-TRABOULES',
        country: 'FR',
        name: 'Vieux Lyon Renaissance Traboules & Courtyards',
        nativeName: 'Traboules du Vieux Lyon',
        coordinates: [45.7628, 4.8274],
        eraOrCentury: '15th–17th Century CE',
        classification: 'ESTABLISHED_HISTORY',
        summary: 'Covered Renaissance stone passageways linking courtyard galleries with riverfront streets.',
        educationalReference: 'UNESCO World Heritage List #872 (Historic Site of Lyon)',
      },
    ],
  },
  KR: {
    mentorName: 'Halmeoni Seo-Yeon',
    mentorTitle: 'Hanji Lantern Artisan & Culinary Elder',
    mentorGreetingNative: '전주 한옥마을에 오신 것을 환영해요! 함께 송편과 비빔밥을 만들어요.',
    mentorGreetingEn: 'Welcome to Jeonju Hanok Village! Let us light the silk lanterns along the giwa rooftops and prepare songpyeon.',
    signatureDish: 'Jeonju Five-Color Bibimbap & Songpyeon',
    craftName: 'Mulberry Hanji Paper Craft & Giwa Roof Carpentry',
    coverArtUrl: '/art/p0/world-cover-KR.jpg',
    portraitArtUrl: '/art/p0/portrait-mentor-KR.jpg',
    questMapArtUrl: '/art/v13/quest-map-KR.jpg',
    stampArtUrl: '/art/v08/stamps/stamp-KR.svg',
    primaryColorHex: '#4F46E5',
    accentColorHex: '#A5B4FC',
    surfaceTintHex: '#181C3A',
    coordinatesCenter: [35.8147, 127.1526],
    geographicSummary: 'Fertile Honam Plain basin in North Jeolla Province framed by Girinbong Peak and the Jeonjucheon stream.',
    storyRouteLang: 'ko',
    landmarks: [
      {
        landmarkId: 'KR-JEONJU-HANOK',
        country: 'KR',
        name: 'Jeonju Hanok Village (Gyo-dong & Pungnam-dong)',
        nativeName: '전주 한옥마을',
        coordinates: [35.8147, 127.1526],
        eraOrCentury: 'Joseon Dynasty – 20th Century',
        classification: 'LIVING_TRADITION',
        summary: 'Over 700 traditional timber-framed Korean houses with curved giwa tiled roofs and ondol heating.',
        educationalReference: 'UNESCO Creative Cities of Gastronomy — Jeonju',
      },
    ],
  },
  DE: {
    mentorName: 'Navigator Klara & Historian Lukas',
    mentorTitle: 'Rhine River Pilot & Literary Heritage Curator',
    mentorGreetingNative: 'Willkommen am Mittelrhein! Lass uns die Leuchtfeuer prüfen und die heilende Frage stellen.',
    mentorGreetingEn: 'Welcome to the Upper Middle Rhine! Let us guide the river barge safely past the slate cliffs and practice active empathy.',
    signatureDish: 'Rhenish Apple-Spiced Bread & Orchard Cider Cake',
    craftName: 'Half-Timbered Fachwerk Carpentry & Acoustic River Chimes',
    coverArtUrl: '/art/global/world-cover-DE.svg',
    portraitArtUrl: '/art/global/portrait-mentor-DE.svg',
    questMapArtUrl: '/art/global/quest-map-DE.svg',
    stampArtUrl: '/art/global/stamp-DE.svg',
    primaryColorHex: '#3B82F6',
    accentColorHex: '#D4AC4C',
    surfaceTintHex: '#12263A',
    coordinatesCenter: [50.1394, 7.7278],
    geographicSummary: 'Upper Middle Rhine Valley gorge with steep Devonian slate cliffs, terraced vineyards, and riverside villages around St. Goarshausen.',
    storyRouteLang: 'fr',
    landmarks: [
      {
        landmarkId: 'DE-RHINE-LORELEI',
        country: 'DE',
        name: 'Upper Middle Rhine Gorge & Lorelei Slate Cliff',
        nativeName: 'Oberes Mittelrheintal & Loreleyfelsen',
        coordinates: [50.1394, 7.7278],
        eraOrCentury: 'Geological / 19th-Century Literary Tradition',
        classification: 'ESTABLISHED_HISTORY',
        summary: '132-meter slate headland at the narrowest bend of the Rhine; distinguish real river navigation history from Brentano/Heine Romantic literature.',
        educationalReference: 'UNESCO World Heritage List #1066 (Upper Middle Rhine Valley)',
      },
      {
        landmarkId: 'DE-FACHWERK-VILLAGE',
        country: 'DE',
        name: 'Rhenish Half-Timbered Market Square',
        nativeName: 'Rheinischer Fachwerk-Marktplatz',
        coordinates: [50.1511, 7.7153],
        eraOrCentury: '16th–18th Century CE',
        classification: 'LIVING_TRADITION',
        summary: 'Traditional oak-beam Fachwerk houses and riverside signal towers maintained by local craft guilds.',
        educationalReference: 'German Timber-Frame Road (Deutsche Fachwerkstraße)',
      },
    ],
  },
  CN: {
    mentorName: 'Elder Lin & Orchard Keeper Mei',
    mentorTitle: 'Valley Chronicler & Terrace Hydrologist',
    mentorGreetingNative: '欢迎来到桃花源！让我们一起修缮竹渠、分享团圆月饼。',
    mentorGreetingEn: 'Welcome to Peach Blossom Valley! Let us restore the bamboo water channels and bake mooncakes under the autumn pavilion.',
    signatureDish: 'Osmanthus & Lotus-Seed Mooncakes (月饼)',
    craftName: 'Bamboo Water-Channel Joinery & Huizhou Courtyard Architecture',
    coverArtUrl: '/art/global/world-cover-CN.svg',
    portraitArtUrl: '/art/global/portrait-mentor-CN.svg',
    questMapArtUrl: '/art/global/quest-map-CN.svg',
    stampArtUrl: '/art/global/stamp-CN.svg',
    primaryColorHex: '#EC4899',
    accentColorHex: '#10B981',
    surfaceTintHex: '#271932',
    coordinatesCenter: [28.9022, 111.4714],
    geographicSummary: 'Wuling mountain-stream landscape in Hunan/Jiangnan tradition with terraced valleys, bamboo groves, and whitewashed courtyard dwellings.',
    storyRouteLang: 'ko',
    landmarks: [
      {
        landmarkId: 'CN-TAOHUAYUAN-VALLEY',
        country: 'CN',
        name: 'Wuling Stream & Literary Peach Blossom Landscape',
        nativeName: '武陵溪流与桃花源意境',
        coordinates: [28.9022, 111.4714],
        eraOrCentury: '421 CE (Eastern Jin Literature)',
        classification: 'FOLKLORE_AND_MYTHOLOGY',
        summary: 'Inspired by Tao Yuanming’s classic prose fable "The Peach Blossom Spring" (桃花源记)—celebrated as literary heritage rather than a literal hidden village.',
        educationalReference: 'Classical Chinese Literary Canon — Tao Yuanming (365–427 CE)',
      },
      {
        landmarkId: 'CN-TERRACE-IRRIGATION',
        country: 'CN',
        name: 'Mountain Terrace Bamboo Water Channels',
        nativeName: '梯田竹木引水渠',
        coordinates: [28.885, 111.49],
        eraOrCentury: 'Song–Qing Dynasty Agricultural Tradition',
        classification: 'LIVING_TRADITION',
        summary: 'Gravity-fed bamboo and stone water channels sustaining hillside orchards and rice terraces.',
        educationalReference: 'FAO Globally Important Agricultural Heritage Systems (GIAHS)',
      },
    ],
  },
  JP: {
    mentorName: 'Waystation Guide Haruka & Poet Aoi',
    mentorTitle: 'Michinoku Trail Steward & Haiku Mentor',
    mentorGreetingNative: 'みちのくの旅路へようこそ！木の橋を整え、季節の俳句を詠みましょう。',
    mentorGreetingEn: 'Welcome to the Michinoku trail! Let us repair the cedar footbridge, tend the moss garden, and compose a seasonal haiku.',
    signatureDish: 'Tohoku Grilled Miso Rice Skewers (Kiritanpo / Gohei-mochi)',
    craftName: 'Cedar Waystation Joinery & Seasonal Haiku Bookbinding',
    coverArtUrl: '/art/global/world-cover-JP.svg',
    portraitArtUrl: '/art/global/portrait-mentor-JP.svg',
    questMapArtUrl: '/art/global/quest-map-JP.svg',
    stampArtUrl: '/art/global/stamp-JP.svg',
    primaryColorHex: '#10B981',
    accentColorHex: '#FB7185',
    surfaceTintHex: '#132824',
    coordinatesCenter: [38.9986, 141.1147],
    geographicSummary: 'Northern Honshu (Tohoku) cedar mountain passes, river crossings, and coastal waystations along the historic Oku no Hosomichi route.',
    storyRouteLang: 'ko',
    landmarks: [
      {
        landmarkId: 'JP-HIRAIZUMI-MICHINOKU',
        country: 'JP',
        name: 'Michinoku Waystations & Hiraizumi Cultural Landscape',
        nativeName: '奥の細道・平泉の文化的景観',
        coordinates: [38.9986, 141.1147],
        eraOrCentury: '12th Century / 1689 CE (Edo Period)',
        classification: 'ESTABLISHED_HISTORY',
        summary: 'Historic northern road traveled by poet Matsuo Bashō in 1689; distinguishes verified route geography from literary haibun composition.',
        educationalReference: 'UNESCO World Heritage List #1277 (Hiraizumi) & Oku no Hosomichi National Scenic Route',
      },
      {
        landmarkId: 'JP-MATSUSHIMA-BAY',
        country: 'JP',
        name: 'Pine-Clad Coastal Viewpoint & Tea Waystation',
        nativeName: '松島湾と街道茶屋',
        coordinates: [38.3667, 141.0667],
        eraOrCentury: 'Edo Period – Present',
        classification: 'LIVING_TRADITION',
        summary: 'Timber post-town tea houses and garden stepping-stones welcoming travelers across seasons.',
        educationalReference: 'Agency for Cultural Affairs, Japan — Places of Scenic Beauty',
      },
    ],
  },
  RU: {
    mentorName: 'Keeper Yelena & Historian Pavel',
    mentorTitle: 'Lakeside Storykeeper & Oral Tradition Scholar',
    mentorGreetingNative: 'Добро пожаловать на озеро Светлояр! Узнаем, как предания берегут память.',
    mentorGreetingEn: 'Welcome to Lake Svetloyar! Let us restore the carved wooden nalichnik window frames and play the gusli by the water.',
    signatureDish: 'Forest Berry Pirozhki & Warm Spiced Sbiten',
    craftName: 'Carved Pine Izba Architecture (Nalichniki) & Gusli String Craft',
    coverArtUrl: '/art/global/world-cover-RU.svg',
    portraitArtUrl: '/art/global/portrait-mentor-RU.svg',
    questMapArtUrl: '/art/global/quest-map-RU.svg',
    stampArtUrl: '/art/global/stamp-RU.svg',
    primaryColorHex: '#0EA5E9',
    accentColorHex: '#F59E0B',
    surfaceTintHex: '#10243A',
    coordinatesCenter: [56.8194, 45.0917],
    geographicSummary: 'Glacial-karst forest lake basin in the Zavolzhye woodland region east of the Volga River.',
    storyRouteLang: 'fr',
    landmarks: [
      {
        landmarkId: 'RU-LAKE-SVETLOYAR',
        country: 'RU',
        name: 'Lake Svetloyar Natural & Cultural Reserve',
        nativeName: 'Озеро Светлояр',
        coordinates: [56.8194, 45.0917],
        eraOrCentury: 'Holocene Karst Basin / 18th-Century Folklore',
        classification: 'FOLKLORE_AND_MYTHOLOGY',
        summary: 'Circular forest lake associated with the oral legend of Kitezh—explicitly contextualized as protective cultural folklore rather than a literal submerged city.',
        educationalReference: 'Voskresenskoye Povetluzhye Nature Park Geological & Ethnographic Survey',
      },
      {
        landmarkId: 'RU-WOODEN-NALICHNIKI',
        country: 'RU',
        name: 'Volga-region Carved Pine Architecture',
        nativeName: 'Резное деревянное зодчество Поволжья',
        coordinates: [56.824, 45.085],
        eraOrCentury: '19th–20th Century CE',
        classification: 'LIVING_TRADITION',
        summary: 'Intricately fret-sawn wooden window surrounds (nalichniki) and log carpentry preserved in lakeside villages.',
        educationalReference: 'Museum of Wooden Architecture & Folk Art Ethnographic Catalog',
      },
    ],
  },
  UA: {
    mentorName: 'Guide Lybid & Kobzar Mykola',
    mentorTitle: 'Kyiv Hills Historian & Bandura Luthier',
    mentorGreetingNative: 'Ласкаво просимо на Київські пагорби! Разом відновимо музичну сцену в толоці.',
    mentorGreetingEn: 'Welcome to the Kyiv Hills! Join our community toloka to restore the music square and tune the multi-stringed bandura.',
    signatureDish: 'Sour-Cherry Varenyky & Honey-Poppyseed Makivnyk',
    craftName: 'Bandura Luthier Craft & Embroidered Rushnyk Textiles',
    coverArtUrl: '/art/global/world-cover-UA.svg',
    portraitArtUrl: '/art/global/portrait-mentor-UA.svg',
    questMapArtUrl: '/art/global/quest-map-UA.svg',
    stampArtUrl: '/art/global/stamp-UA.svg',
    primaryColorHex: '#2563EB',
    accentColorHex: '#FACC15',
    surfaceTintHex: '#0F2547',
    coordinatesCenter: [50.458, 30.516],
    geographicSummary: 'Wooded loess bluffs and hills overlooking the right bank of the Dnipro River in Kyiv.',
    storyRouteLang: 'fr',
    landmarks: [
      {
        landmarkId: 'UA-KYIV-FOUNDING-HILLS',
        country: 'UA',
        name: 'Starokyivska Hill & Dnipro River Bluffs',
        nativeName: 'Старокиївська гора та Дніпровські кручі',
        coordinates: [50.458, 30.516],
        eraOrCentury: '6th–12th Century CE',
        classification: 'ARCHAEOLOGICAL_RECORD',
        summary: 'Historic hilltop center of early Kyiv; separates archaeological settlement evidence from the chronicle legend of Kyi, Shchek, Khoryv, and Lybid.',
        educationalReference: 'National Museum of the History of Ukraine Archaeological Survey',
      },
      {
        landmarkId: 'UA-BANDURA-WORKSHOP',
        country: 'UA',
        name: 'Community Music Square & Bandura Guild',
        nativeName: 'Музичний майдан та майстерня бандури',
        coordinates: [50.462, 30.519],
        eraOrCentury: '16th Century – Present',
        classification: 'LIVING_TRADITION',
        summary: 'Living Ukrainian musical craftsmanship celebrating bandura luthiers, rushnyk embroidery, and cooperative toloka restoration.',
        educationalReference: 'UNESCO Intangible Cultural Heritage — Kobzar and Wheel-Lyre Tradition',
      },
    ],
  },
  MA: {
    mentorName: 'Hakawati Driss & Tea Host Kenza',
    mentorTitle: 'Al-Halqa Master Storyteller & Riad Artisan',
    mentorGreetingNative: 'مرحبا بيكم فمراكش! اجتمعوا فالحلقة ونشربوا أتاي بالنعناع.',
    mentorGreetingEn: 'Welcome to Marrakesh! Gather around the storyteller’s circle in the medina square and share warm mint atay.',
    signatureDish: 'Moroccan Spearmint Atay & Almond-Honey Briouats',
    craftName: 'Geometric Zellij Mosaic Tilework & Cedar Woodcarving',
    coverArtUrl: '/art/global/world-cover-MA.svg',
    portraitArtUrl: '/art/global/portrait-mentor-MA.svg',
    questMapArtUrl: '/art/global/quest-map-MA.svg',
    stampArtUrl: '/art/global/stamp-MA.svg',
    primaryColorHex: '#EA580C',
    accentColorHex: '#14B8A6',
    surfaceTintHex: '#3B1812',
    coordinatesCenter: [31.6258, -7.9891],
    geographicSummary: 'Haouz Plain oasis city at the northern foothills of the High Atlas Mountains in central Morocco.',
    storyRouteLang: 'ar-LB',
    landmarks: [
      {
        landmarkId: 'MA-JEMAA-EL-FNAA',
        country: 'MA',
        name: 'Medina of Marrakesh & Al-Halqa Storyteller Square',
        nativeName: 'ساحة جامع الفنا والمدينة القديمة بمراكش',
        coordinates: [31.6258, -7.9891],
        eraOrCentury: '11th Century CE – Present',
        classification: 'LIVING_TRADITION',
        summary: 'UNESCO-recognized open-air cultural space where hakawati storytellers, musicians, and artisans gather in interactive audience circles (halqa).',
        educationalReference: 'UNESCO Masterpieces of the Oral and Intangible Heritage of Humanity (Cultural Space of Jemaa el-Fna Square)',
      },
      {
        landmarkId: 'MA-ZELLIJ-RIAD',
        country: 'MA',
        name: 'Riad Courtyard Fountain & Zellij Workshop',
        nativeName: 'رياض الزليج المغربي ونافورة الفناء',
        coordinates: [31.631, -7.986],
        eraOrCentury: 'Almoravid / Marinid Era – Present',
        classification: 'ESTABLISHED_HISTORY',
        summary: 'Inward-looking garden courtyards cooled by central fountains and adorned with hand-cut geometric zellij tilework.',
        educationalReference: 'UNESCO World Heritage List #331 (Medina of Marrakesh)',
      },
    ],
  },
};

export const GLOBAL_COUNTRIES_CATALOG: readonly GlobalCountryMeta[] = (
  globalRegistryRaw.countries as Array<{
    code: GlobalCountryCode;
    order: number;
    name: string;
    nameNative: string;
    city: string;
    subtitle: string;
    theme: string;
    visualIdentity: string;
    localLanguage: string;
    culturalWarning: string;
    capstoneArtifact: { id: string; name: string };
    stampId: string;
    stampName: string;
    learnWords: GlobalLearnWord[];
    chapterIds: string[];
    castIds: string[];
  }>
).map((c) => {
  const extra = EXTRA_COUNTRY_DETAILS[c.code];
  const isCoreFive = ['LB', 'IQ', 'EG', 'FR', 'KR'].includes(c.code);
  const isFlagshipSlice = c.code === 'LB';
  return {
    ...c,
    ...extra,
    isCoreFive,
    isFlagshipSlice,
    availabilityBadge: isFlagshipSlice
      ? '1. RC1 Flagship · Playable on Roblox & Minecraft Global v1.1'
      : isCoreFive
        ? `${c.order}. Core World · Story, Portal & Minecraft Global v1.1 Ready`
        : `${c.order}. Global v1.1 Destination · 6 Chapters & Bedrock Add-On Ready`,
  };
});

export const GLOBAL_COUNTRY_MAP: Record<GlobalCountryCode, GlobalCountryMeta> =
  GLOBAL_COUNTRIES_CATALOG.reduce(
    (acc, item) => {
      acc[item.code] = item;
      return acc;
    },
    {} as Record<GlobalCountryCode, GlobalCountryMeta>
  );

export const GLOBAL_CHAPTERS_CATALOG: readonly GlobalChapterEntry[] =
  globalRegistryRaw.chapters as unknown as GlobalChapterEntry[];

const enStrings = globalEnUS.strings as Record<string, string>;

export const GLOBAL_NPCS_CATALOG: readonly GlobalNpcEntry[] = GLOBAL_COUNTRIES_CATALOG.flatMap((c) =>
  c.castIds.map((npcId) => {
    const rawName = enStrings[`npc.${npcId}.name`] ?? npcId;
    const match = rawName.match(/^(.+?)\s*\((.+)\)$/);
    return {
      id: npcId,
      countryCode: c.code,
      name: match ? match[1].trim() : rawName,
      nameNative: match ? match[2].trim() : c.nameNative,
      role: 'Cultural Guide & Community Mentor',
      greeting: enStrings[`npc.${npcId}.greeting`] ?? c.mentorGreetingEn,
    };
  })
);

export const GLOBAL_LOCALES_REGISTRY = localesRegistryRaw;
