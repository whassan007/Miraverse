import type { CountryId, Lang } from '../../../../../packages/content/schema';

export interface HomeCopy {
  badge: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaPassport: string;
  ctaAbout: string;
  ctaExplore: string;
  chooseCountryTitle: string;
  chooseCountrySubtitle: string;
  mentorLabel: string;
  regionsLabel: string;
  storyPreviewLabel: string;
  readStory: string;
  playChapter: string;
  privacyNote: string;
  countryNames: Record<CountryId, string>;
}

const LOCALIZED_HOME_COPY: Record<Lang, HomeCopy> = {
  en: {
    badge: 'MiraVerse v0.1 · Local-First Cultural Adventures',
    heroTitle: 'Explore Living Stories & Heritage Across Five Worlds',
    heroSubtitle:
      'Travel with Mira and neighborhood mentors across Lebanon, Egypt, Iraq, South Korea, and France. Read bilingual stories, gather regional crafts, and earn stamps in your personal passport.',
    ctaPassport: 'Open My Passport',
    ctaAbout: 'About MiraVerse',
    ctaExplore: 'Choose a Country',
    chooseCountryTitle: 'Choose a Country Adventure',
    chooseCountrySubtitle:
      'Select any of the five canonical destinations below to read an illustrated bilingual story or play an interactive chapter.',
    mentorLabel: 'Elder Mentor',
    regionsLabel: 'Regions to Explore',
    storyPreviewLabel: 'Featured Story',
    readStory: 'Read Story',
    playChapter: 'Play Chapter',
    privacyNote: '100% local progress · No accounts, no tracking, safe for kids & classrooms.',
    countryNames: {
      LB: 'Lebanon',
      EG: 'Egypt',
      IQ: 'Iraq',
      KR: 'South Korea',
      FR: 'France',
    },
  },
  fr: {
    badge: 'MiraVerse v0.1 · Aventures culturelles sans compte',
    heroTitle: 'Explorez des récits vivants et le patrimoine de cinq pays',
    heroSubtitle:
      'Voyagez avec Mira et les mentors du quartier au Liban, en Égypte, en Irak, en Corée du Sud et en France. Lisez des histoires bilingues, découvrez des métiers d’art et collectionnez des tampons dans votre passeport.',
    ctaPassport: 'Ouvrir mon passeport',
    ctaAbout: 'À propos de MiraVerse',
    ctaExplore: 'Choisir un pays',
    chooseCountryTitle: 'Choisissez une aventure par pays',
    chooseCountrySubtitle:
      'Sélectionnez l’une des cinq destinations canoniques pour lire un conte bilingue ou jouer un chapitre interactif.',
    mentorLabel: 'Mentor aîné',
    regionsLabel: 'Régions à explorer',
    storyPreviewLabel: 'Conte à la une',
    readStory: 'Lire l’histoire',
    playChapter: 'Jouer le chapitre',
    privacyNote: 'Progression 100 % locale · Sans compte, sans pistage, conçu pour les enfants.',
    countryNames: {
      LB: 'Liban',
      EG: 'Égypte',
      IQ: 'Irak',
      KR: 'Corée du Sud',
      FR: 'France',
    },
  },
  'ar-LB': {
    badge: 'ميرا فيرس · مغامرات ثقافية آمنة للأطفال',
    heroTitle: 'اكتشفوا حكايات حيّة وتراث خمسة بلدان حول العالم',
    heroSubtitle:
      'سافروا مع ميرا والجدود المرشدين في لبنان ومصر والعراق وكوريا الجنوبية وفرنسا. اقرأوا قصصاً ثنائية اللغة، واجمعوا الحرف التراثية وأختام جواز السفر.',
    ctaPassport: 'افتح جواز السفر',
    ctaAbout: 'عن ميرا فيرس',
    ctaExplore: 'اختر بلداً للمغامرة',
    chooseCountryTitle: 'اختر مغامرة البلد',
    chooseCountrySubtitle:
      'اختاروا أي وجهة من البلدان الخمسة لقراءة القصة المصورة أو لعب فصل تفاعلي.',
    mentorLabel: 'المرشد الحكيم',
    regionsLabel: 'مناطق الاستكشاف',
    storyPreviewLabel: 'قصة البلد',
    readStory: 'اقرأ القصة',
    playChapter: 'العب الفصل',
    privacyNote: 'حفظ محلي بالكامل · بدون حسابات أو تتبع، آمن للأطفال والعائلات.',
    countryNames: {
      LB: 'لبنان',
      EG: 'مصر',
      IQ: 'العراق',
      KR: 'كوريا الجنوبية',
      FR: 'فرنسا',
    },
  },
  'ar-EG': {
    badge: 'ميرا فيرس · مغامرات ثقافية آمنة للأطفال',
    heroTitle: 'استكشفوا حكايات حية وتراث خمس بلاد حول العالم',
    heroSubtitle:
      'سافروا مع ميرا والجدود المرشدين في لبنان ومصر والعراق وكوريا الجنوبية وفرنسا. اقرأوا قصص بلغتين، واجمعوا الحرف التراثية وأختام الباسبور.',
    ctaPassport: 'افتح جواز السفر',
    ctaAbout: 'عن ميرا فيرس',
    ctaExplore: 'اختر بلد المغامرة',
    chooseCountryTitle: 'اختر مغامرة البلد',
    chooseCountrySubtitle:
      'اختاروا أي بلد من الخمسة عشان تقرأوا القصة المصورة أو تلعبوا فصل تفاعلي.',
    mentorLabel: 'المرشد الكبير',
    regionsLabel: 'مناطق الاستكشاف',
    storyPreviewLabel: 'قصة البلد',
    readStory: 'اقرأ القصة',
    playChapter: 'العب الفصل',
    privacyNote: 'تقدمك محفوظ محلياً بالكامل · من غير حسابات أو تتبع، آمن للأطفال.',
    countryNames: {
      LB: 'لبنان',
      EG: 'مصر',
      IQ: 'العراق',
      KR: 'كوريا الجنوبية',
      FR: 'فرنسا',
    },
  },
  'ar-IQ': {
    badge: 'ميرا فيرس · مغامرات ثقافية آمنة للأطفال',
    heroTitle: 'اكتشفوا حكايات حية وتراث خمس بلدان حول العالم',
    heroSubtitle:
      'سافروا ويا ميرا والجدود المرشدين في لبنان ومصر والعراق وكوريا الجنوبية وفرنسا. اقرأوا قصصاً ثنائية اللغة، واجمعوا الحرف التراثية وأختام الجواز.',
    ctaPassport: 'افتح جواز السفر',
    ctaAbout: 'عن ميرا فيرس',
    ctaExplore: 'اختر بلد المغامرة',
    chooseCountryTitle: 'اختر مغامرة البلد',
    chooseCountrySubtitle:
      'اختاروا واحدة من الوجهات الخمسة لقراءة القصة المصورة أو لعب فصل تفاعلي.',
    mentorLabel: 'المرشد الحكيم',
    regionsLabel: 'مناطق الاستكشاف',
    storyPreviewLabel: 'قصة البلد',
    readStory: 'اقرأ القصة',
    playChapter: 'العب الفصل',
    privacyNote: 'حفظ محلي بالكامل · بدون حسابات أو تتبع، آمن للأطفال.',
    countryNames: {
      LB: 'لبنان',
      EG: 'مصر',
      IQ: 'العراق',
      KR: 'كوريا الجنوبية',
      FR: 'فرنسا',
    },
  },
  ko: {
    badge: '미라버스 v0.1 · 어린이 안전 로컬 문화 모험',
    heroTitle: '다섯 나라의 살아있는 이야기와 문화유산을 탐험하세요',
    heroSubtitle:
      '미라와 마을 어르신 멘토들과 함께 레바논, 이집트, 이라크, 대한민국, 프랑스로 떠나보세요. 이중언어 동화를 읽고 전통 공예를 배우며 여권 스탬프를 모아보세요.',
    ctaPassport: '내 여권 열기',
    ctaAbout: '미라버스 소개',
    ctaExplore: '나라 선택하기',
    chooseCountryTitle: '나라별 모험 선택하기',
    chooseCountrySubtitle:
      '다섯 나라 중 원하는 곳을 골라 이중언어 이야기를 읽거나 인터랙티브 챕터를 플레이하세요.',
    mentorLabel: '마을 멘토',
    regionsLabel: '탐험 지역',
    storyPreviewLabel: '대표 이야기',
    readStory: '이야기 읽기',
    playChapter: '챕터 플레이',
    privacyNote: '100% 기기 내 저장 · 계정 불필요, 추적 없음, 어린이 안전 설계.',
    countryNames: {
      LB: '레바논',
      EG: '이집트',
      IQ: '이라크',
      KR: '대한민국',
      FR: '프랑스',
    },
  },
};

function pickTranslated(
  t: (key: string, fallback?: string) => string,
  candidateKeys: string[],
  fallback: string
): string {
  for (const key of candidateKeys) {
    const value = t(key, '');
    if (value && value !== key) {
      return value;
    }
  }
  return t(candidateKeys[0], fallback);
}

export function resolveHomeCopy(
  lang: Lang,
  t: (key: string, fallback?: string) => string
): HomeCopy {
  const base = LOCALIZED_HOME_COPY[lang] ?? LOCALIZED_HOME_COPY.en;

  return {
    badge: pickTranslated(t, ['home.badge', 'hero.badge'], base.badge),
    heroTitle: pickTranslated(
      t,
      ['home.hero.title', 'home.title', 'hero.title', 'app.tagline'],
      base.heroTitle
    ),
    heroSubtitle: pickTranslated(
      t,
      ['home.hero.subtitle', 'home.subtitle', 'hero.subtitle', 'app.description'],
      base.heroSubtitle
    ),
    ctaPassport: pickTranslated(
      t,
      ['home.cta.passport', 'home.passportCta', 'nav.passport', 'passport.title'],
      base.ctaPassport
    ),
    ctaAbout: pickTranslated(
      t,
      ['home.cta.about', 'home.aboutCta', 'nav.about', 'about.title'],
      base.ctaAbout
    ),
    ctaExplore: pickTranslated(
      t,
      ['home.cta.explore', 'home.explore'],
      base.ctaExplore
    ),
    chooseCountryTitle: pickTranslated(
      t,
      ['home.chooseCountry', 'home.countries.title', 'home.gridTitle'],
      base.chooseCountryTitle
    ),
    chooseCountrySubtitle: pickTranslated(
      t,
      ['home.chooseCountrySubtitle', 'home.countries.subtitle', 'home.gridSubtitle'],
      base.chooseCountrySubtitle
    ),
    mentorLabel: pickTranslated(
      t,
      ['home.mentor', 'pack.mentor', 'mentor.label'],
      base.mentorLabel
    ),
    regionsLabel: pickTranslated(
      t,
      ['home.regions', 'pack.regions', 'regions.label'],
      base.regionsLabel
    ),
    storyPreviewLabel: pickTranslated(
      t,
      ['home.storyPreview', 'story.featured'],
      base.storyPreviewLabel
    ),
    readStory: pickTranslated(
      t,
      ['home.readStory', 'story.read', 'actions.readStory'],
      base.readStory
    ),
    playChapter: pickTranslated(
      t,
      ['home.playChapter', 'play.chapter', 'actions.playChapter'],
      base.playChapter
    ),
    privacyNote: pickTranslated(
      t,
      ['home.privacyNote', 'privacy.banner'],
      base.privacyNote
    ),
    countryNames: {
      LB: pickTranslated(t, ['country.LB', 'countries.LB'], base.countryNames.LB),
      EG: pickTranslated(t, ['country.EG', 'countries.EG'], base.countryNames.EG),
      IQ: pickTranslated(t, ['country.IQ', 'countries.IQ'], base.countryNames.IQ),
      KR: pickTranslated(t, ['country.KR', 'countries.KR'], base.countryNames.KR),
      FR: pickTranslated(t, ['country.FR', 'countries.FR'], base.countryNames.FR),
    },
  };
}
