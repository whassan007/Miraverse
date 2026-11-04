import {
  COUNTRIES,
  COUNTRY_LANG_MAP,
  COUNTRY_WGS84,
  type CountryId,
  type Lang,
  type Pack,
} from '../../../../../packages/content/schema';

export const FALLBACK_PACKS: Record<CountryId, Pack> = {
  LB: {
    country: 'LB',
    name_en: 'Lebanon',
    lang: COUNTRY_LANG_MAP.LB,
    colors: { primary: '#B91C1C', secondary: '#15803D' },
    regions: [
      { id: 'byblos', name_en: 'Byblos Harbor' },
      { id: 'beirut', name_en: 'Beirut Courtyards' },
      { id: 'cedars', name_en: 'Chouf Cedars' },
    ],
    mentor: {
      name: 'Teta Salma',
      greeting: 'أهلاً وسهلاً في جبيل! يلا نكتشف حكاياتنا سوا.',
      greeting_en: 'Welcome to Byblos! Let us discover our stories together.',
    },
    items: [
      { id: 'cedar_plank', name_en: 'Cedar Wood Plank', color: '#8B5A2B' },
      { id: 'zaatar_mix', name_en: 'Wild Thyme & Sesame', color: '#4F772D' },
    ],
    chapters: [
      {
        id: 1,
        title_en: 'The Cedar Workshop of Byblos',
        challenges: [],
      },
    ],
  },
  EG: {
    country: 'EG',
    name_en: 'Egypt',
    lang: COUNTRY_LANG_MAP.EG,
    colors: { primary: '#B45309', secondary: '#1D4ED8' },
    regions: [
      { id: 'cairo', name_en: 'Old Cairo Markets' },
      { id: 'nile', name_en: 'Nile Felucca Quays' },
      { id: 'aswan', name_en: 'Aswan Botanical Island' },
    ],
    mentor: {
      name: 'Gedo Mahmoud',
      greeting: 'يا أهلاً بيكم في القاهرة! النيل بينور بوجودكم.',
      greeting_en: 'Welcome to Cairo! The Nile shines brighter with you here.',
    },
    items: [
      { id: 'papyrus_reed', name_en: 'Papyrus Reed', color: '#D4A373' },
      { id: 'hibiscus_petal', name_en: 'Aswan Karkadeh Petals', color: '#9B2226' },
    ],
    chapters: [
      {
        id: 1,
        title_en: 'Lanterns Along the Nile',
        challenges: [],
      },
    ],
  },
  IQ: {
    country: 'IQ',
    name_en: 'Iraq',
    lang: COUNTRY_LANG_MAP.IQ,
    colors: { primary: '#0F766E', secondary: '#CA8A04' },
    regions: [
      { id: 'baghdad', name_en: 'Al-Mutanabbi Street' },
      { id: 'tigris', name_en: 'Tigris Riverfront' },
      { id: 'marshes', name_en: 'Mesopotamian Reed Marshes' },
    ],
    mentor: {
      name: 'Bibi Nadia',
      greeting: 'هلا بيكم ببغداد! تعالوا نقرأ ونبني سوا.',
      greeting_en: 'Welcome to Baghdad! Come read and build with us.',
    },
    items: [
      { id: 'reed_bundle', name_en: 'Golden Marsh Reed', color: '#E9C46A' },
      { id: 'date_syrup', name_en: 'Basra Date Syrup', color: '#6F1D1B' },
    ],
    chapters: [
      {
        id: 1,
        title_en: 'Bookbinders of the Tigris',
        challenges: [],
      },
    ],
  },
  KR: {
    country: 'KR',
    name_en: 'South Korea',
    lang: COUNTRY_LANG_MAP.KR,
    colors: { primary: '#1E3A8A', secondary: '#DC2626' },
    regions: [
      { id: 'jeonju', name_en: 'Jeonju Hanok Village' },
      { id: 'seoul', name_en: 'Bukchon Artisans Alley' },
      { id: 'gyeongju', name_en: 'Gyeongju Observatory' },
    ],
    mentor: {
      name: 'Halmeoni Sunja',
      greeting: '전주 한옥마을에 오신 것을 환영합니다! 함께 이야기를 시작해요.',
      greeting_en: 'Welcome to Jeonju Hanok Village! Let us begin our story together.',
    },
    items: [
      { id: 'hanji_sheet', name_en: 'Mulberry Hanji Paper', color: '#F4F1DE' },
      { id: 'pine_ink', name_en: 'Pine Soot Inkstick', color: '#2B2D42' },
    ],
    chapters: [
      {
        id: 1,
        title_en: 'Morning Light on Hanji Paper',
        challenges: [],
      },
    ],
  },
  FR: {
    country: 'FR',
    name_en: 'France',
    lang: COUNTRY_LANG_MAP.FR,
    colors: { primary: '#1D4ED8', secondary: '#D97706' },
    regions: [
      { id: 'lyon', name_en: 'Vieux Lyon Traboules' },
      { id: 'paris', name_en: 'Seine Bookstalls' },
      { id: 'provence', name_en: 'Provence Herb Gardens' },
    ],
    mentor: {
      name: 'Mamie Colette',
      greeting: 'Bienvenue à Lyon ! Prêts à explorer les passages secrets ?',
      greeting_en: 'Welcome to Lyon! Ready to explore the hidden passages?',
    },
    items: [
      { id: 'silk_thread', name_en: 'Lyon Silk Spool', color: '#E07A5F' },
      { id: 'praline_rose', name_en: 'Rose Praline Brioche', color: '#D62828' },
    ],
    chapters: [
      {
        id: 1,
        title_en: 'The Silk Weavers of Lyon',
        challenges: [],
      },
    ],
  },
};

export const COUNTRY_NATIVE_NAMES: Record<CountryId, string> = {
  LB: 'لبنان',
  EG: 'مصر',
  IQ: 'العراق',
  KR: '대한민국',
  FR: 'France',
};

export const LANG_DISPLAY_LABELS: Record<Lang, string> = {
  'ar-LB': 'العربية (لبنان) · Levantine Arabic',
  'ar-EG': 'العربية (مصر) · Egyptian Arabic',
  'ar-IQ': 'العربية (العراق) · Mesopotamian Arabic',
  ko: '한국어 · Korean',
  fr: 'Français · French',
  en: 'English',
};

export function resolveHomePacks(loadedPacks: readonly Pack[] | undefined | null): Pack[] {
  const byCountry = new Map<CountryId, Pack>();
  if (Array.isArray(loadedPacks)) {
    for (const pack of loadedPacks) {
      if (pack && COUNTRIES.includes(pack.country)) {
        byCountry.set(pack.country, pack);
      }
    }
  }

  return COUNTRIES.map((countryId) => {
    const existing = byCountry.get(countryId);
    const fallback = FALLBACK_PACKS[countryId];
    if (!existing) {
      return fallback;
    }
    return {
      ...fallback,
      ...existing,
      country: countryId,
      lang: existing.lang || fallback.lang,
      name_en: existing.name_en || fallback.name_en,
      colors: {
        primary: existing.colors?.primary || fallback.colors.primary,
        secondary: existing.colors?.secondary || fallback.colors.secondary,
      },
      regions:
        Array.isArray(existing.regions) && existing.regions.length > 0
          ? existing.regions
          : fallback.regions,
      mentor: {
        name: existing.mentor?.name || fallback.mentor.name,
        greeting: existing.mentor?.greeting || fallback.mentor.greeting,
        greeting_en: existing.mentor?.greeting_en || fallback.mentor.greeting_en,
      },
      items: Array.isArray(existing.items) ? existing.items : fallback.items,
      chapters:
        Array.isArray(existing.chapters) && existing.chapters.length > 0
          ? existing.chapters
          : fallback.chapters,
    };
  });
}

export function getCountryCoordinatesLabel(country: CountryId): string {
  const geo = COUNTRY_WGS84[country];
  if (!geo) return '';
  const latDir = geo.lat >= 0 ? 'N' : 'S';
  const lonDir = geo.lon >= 0 ? 'E' : 'W';
  return `${geo.capital_en} (${Math.abs(geo.lat).toFixed(1)}°${latDir}, ${Math.abs(geo.lon).toFixed(1)}°${lonDir})`;
}
