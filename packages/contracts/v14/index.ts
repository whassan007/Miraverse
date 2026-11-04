/**
 * MiraVerse v1.4 — Dynamic 5-Country Hero Showcase Architecture & Contracts
 * Owner: AG01
 *
 * Mandatory Country Order:
 * 1. Lebanon: Byblos (LB)
 * 2. Iraq: Baghdad (IQ)
 * 3. Egypt: Cairo (EG)
 * 4. France: Lyon (FR)
 * 5. South Korea: Jeonju (KR)
 */

export const V14_RELEASE_VERSION = '1.4.0' as const;

export const V14_HERO_CYCLE_MS = 5200 as const;

export const V14_HERO_COUNTRIES = ['LB', 'IQ', 'EG', 'FR', 'KR'] as const;

export type HeroCountryCodeV14 = (typeof V14_HERO_COUNTRIES)[number];

export interface HeroOverlayLayerSpec {
  country: 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';
  orderIndex: 1 | 2 | 3 | 4 | 5;
  countryNameEn: string;
  countryNameNative: string;
  cityName: string;
  chapterTitle: string;
  ambientOverlaySvgUrl: string;
  heroDesktopJpg: string;
  heroDesktopWebp: string;
  heroMobileJpg?: string;
  heroMobileWebp?: string;
  questMapUrl: string;
  mentorName: string;
  mentorTitle: string;
  mentorPortraitUrl: string;
  mentorGreetingNative: string;
  mentorGreetingEn: string;
  signatureDish: string;
  epistemicHighlight: string;
  ambientMotionDescription: string;
  radialGradientCss: string;
  primaryColorHex: string;
  accentColorHex: string;
  isFlagshipRoblox: boolean;
}

export const V14_HERO_SLIDES: Record<'LB' | 'IQ' | 'EG' | 'FR' | 'KR', HeroOverlayLayerSpec> = {
  LB: {
    country: 'LB',
    orderIndex: 1,
    countryNameEn: 'Lebanon',
    countryNameNative: 'لبنان · جبيل',
    cityName: 'Byblos (Jbeil)',
    chapterTitle: "Summer at Teta's",
    ambientOverlaySvgUrl: '/art/v14/hero-overlays/overlay-LB.svg',
    heroDesktopJpg: '/art/p0/hero-byblos-desktop.jpg',
    heroDesktopWebp: '/art/p0/hero-byblos-desktop.webp',
    heroMobileJpg: '/art/p0/hero-byblos-mobile.jpg',
    heroMobileWebp: '/art/p0/hero-byblos-mobile.webp',
    questMapUrl: '/art/v13/quest-map-LB.jpg',
    mentorName: 'Teta Nahla',
    mentorTitle: 'Harbor Baker & Heritage Storykeeper',
    mentorPortraitUrl: '/art/p0/portrait-mentor-LB.jpg',
    mentorGreetingNative: 'أهلاً وسهلاً ببجبيل! تعوا نخبز منقوشة عالصاج.',
    mentorGreetingEn: 'Welcome to Byblos Harbor! Let us gather wild za’atar and bake warm man’oushe on the saj.',
    signatureDish: "Za'atar & Olive Oil Man'oushe",
    epistemicHighlight: 'Phoenician 22-letter abjad & Mediterranean harbor waves',
    ambientMotionDescription:
      'Luminous Phoenician 22-letter abjad glyphs, swaying Mount Lebanon cedar boughs, and gentle Mediterranean harbor wave crests.',
    radialGradientCss:
      'radial-gradient(circle at 75% 28%, rgba(244, 162, 97, 0.34) 0%, rgba(13, 148, 136, 0.28) 45%, rgba(11, 18, 32, 0.92) 100%)',
    primaryColorHex: '#0D9488',
    accentColorHex: '#F4A261',
    isFlagshipRoblox: true,
  },
  IQ: {
    country: 'IQ',
    orderIndex: 2,
    countryNameEn: 'Iraq',
    countryNameNative: 'العراق · بغداد',
    cityName: 'Baghdad',
    chapterTitle: 'Palms of the Tigris',
    ambientOverlaySvgUrl: '/art/v14/hero-overlays/overlay-IQ.svg',
    heroDesktopJpg: '/art/p0/world-cover-IQ.jpg',
    heroDesktopWebp: '/art/p0/world-cover-IQ.webp',
    questMapUrl: '/art/v13/quest-map-IQ.jpg',
    mentorName: 'Ustadh Zayd',
    mentorTitle: 'Astronomer, Calligrapher & Courtyard Host',
    mentorPortraitUrl: '/art/p0/portrait-mentor-IQ.jpg',
    mentorGreetingNative: 'هلا بيكم ببغداد! النخل على دجلة ينتظركم.',
    mentorGreetingEn: 'Welcome to Baghdad! Study the stars with our brass astrolabe by the turquoise fountain and bake cardamom kleicha.',
    signatureDish: 'Baghdadi Cardamom Date Kleicha',
    epistemicHighlight: 'House of Wisdom translation scrolls & golden astrolabe rings over the Tigris',
    ambientMotionDescription:
      'Rotating brass astrolabe celestial retes, twelve-fold Abbasid geometric star rosettes, and House of Wisdom translation scrolls over the Tigris.',
    radialGradientCss:
      'radial-gradient(circle at 74% 26%, rgba(56, 189, 248, 0.34) 0%, rgba(2, 132, 199, 0.28) 46%, rgba(11, 18, 32, 0.92) 100%)',
    primaryColorHex: '#0284C7',
    accentColorHex: '#38BDF8',
    isFlagshipRoblox: false,
  },
  EG: {
    country: 'EG',
    orderIndex: 3,
    countryNameEn: 'Egypt',
    countryNameNative: 'مصر · القاهرة',
    cityName: 'Cairo',
    chapterTitle: 'Lanterns of the Nile',
    ambientOverlaySvgUrl: '/art/v14/hero-overlays/overlay-EG.svg',
    heroDesktopJpg: '/art/p0/world-cover-EG.jpg',
    heroDesktopWebp: '/art/p0/world-cover-EG.webp',
    questMapUrl: '/art/v13/quest-map-EG.jpg',
    mentorName: 'Uncle Tariq',
    mentorTitle: 'Master Lantern Artisan & Courtyard Host',
    mentorPortraitUrl: '/art/p0/portrait-mentor-EG.jpg',
    mentorGreetingNative: 'يا هلا بمصر! الفوانيس منوّرة الحارة الليلة.',
    mentorGreetingEn: 'Welcome to Cairo! Help us hang the stained-glass fanous lanterns and prepare warm koshari for the courtyard.',
    signatureDish: 'Cairo Spiced Koshari',
    epistemicHighlight: 'Pierced brass fanous lanterns & geometric khayamiya stars over the Nile',
    ambientMotionDescription:
      'Warm glowing pierced brass fanous lanterns, refracted stained-glass optics rays, and geometric khayamiya star polygons over Nile felucca sails.',
    radialGradientCss:
      'radial-gradient(circle at 76% 30%, rgba(251, 191, 36, 0.36) 0%, rgba(217, 119, 6, 0.28) 45%, rgba(11, 18, 32, 0.92) 100%)',
    primaryColorHex: '#D97706',
    accentColorHex: '#FBBF24',
    isFlagshipRoblox: false,
  },
  FR: {
    country: 'FR',
    orderIndex: 4,
    countryNameEn: 'France',
    countryNameNative: 'France · Vieux Lyon',
    cityName: 'Lyon',
    chapterTitle: 'The Golden Boulangerie of Lyon',
    ambientOverlaySvgUrl: '/art/v14/hero-overlays/overlay-FR.svg',
    heroDesktopJpg: '/art/p0/world-cover-FR.jpg',
    heroDesktopWebp: '/art/p0/world-cover-FR.webp',
    questMapUrl: '/art/v13/quest-map-FR.jpg',
    mentorName: 'Chef Élodie',
    mentorTitle: 'Master Boulangère of Vieux Lyon',
    mentorPortraitUrl: '/art/p0/portrait-mentor-FR.jpg',
    mentorGreetingNative: 'Bienvenue dans le Vieux Lyon ! Préparons ensemble une brioche dorée.',
    mentorGreetingEn: 'Welcome to Vieux Lyon! Follow the cobblestone traboule courtyard to our warm neighborhood bakery.',
    signatureDish: 'Golden Brioche & Galette des Rois',
    epistemicHighlight: 'Vieux Lyon traboule lantern arches & Jacquard punch-card silk ribbons',
    ambientMotionDescription:
      'Renaissance Vieux Lyon traboule lantern arches, Canut Jacquard punch-card binary matrices, and flowing golden silk ribbons.',
    radialGradientCss:
      'radial-gradient(circle at 74% 28%, rgba(245, 158, 11, 0.34) 0%, rgba(37, 99, 235, 0.28) 46%, rgba(11, 18, 32, 0.92) 100%)',
    primaryColorHex: '#2563EB',
    accentColorHex: '#F59E0B',
    isFlagshipRoblox: false,
  },
  KR: {
    country: 'KR',
    orderIndex: 5,
    countryNameEn: 'South Korea',
    countryNameNative: '대한민국 · 전주',
    cityName: 'Jeonju',
    chapterTitle: 'Moonlight Over the Hanok',
    ambientOverlaySvgUrl: '/art/v14/hero-overlays/overlay-KR.svg',
    heroDesktopJpg: '/art/p0/world-cover-KR.jpg',
    heroDesktopWebp: '/art/p0/world-cover-KR.webp',
    questMapUrl: '/art/v13/quest-map-KR.jpg',
    mentorName: 'Halmeoni Seo-Yeon',
    mentorTitle: 'Hanji Lantern Artisan & Culinary Elder',
    mentorPortraitUrl: '/art/p0/portrait-mentor-KR.jpg',
    mentorGreetingNative: '전주 한옥마을에 오신 것을 환영해요! 함께 송편과 비빔밥을 만들어요.',
    mentorGreetingEn: 'Welcome to Jeonju Hanok Village! Let us light the silk lanterns along the giwa rooftops and prepare songpyeon.',
    signatureDish: 'Jeonju Five-Color Bibimbap & Songpyeon',
    epistemicHighlight: 'Obangsaek five-color silk ribbons & drifting golden ginkgo leaves over giwa roofs',
    ambientMotionDescription:
      'Curving dark-slate giwa hanok eaves, Obangsaek five-color silk lantern ribbons, and golden autumn ginkgo leaves drifting across moonlight.',
    radialGradientCss:
      'radial-gradient(circle at 75% 27%, rgba(165, 180, 252, 0.34) 0%, rgba(79, 70, 229, 0.28) 46%, rgba(11, 18, 32, 0.92) 100%)',
    primaryColorHex: '#4F46E5',
    accentColorHex: '#A5B4FC',
    isFlagshipRoblox: false,
  },
};

export const V14_HERO_SLIDES_ORDERED: readonly HeroOverlayLayerSpec[] = V14_HERO_COUNTRIES.map(
  (code) => V14_HERO_SLIDES[code]
);
