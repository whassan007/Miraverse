import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { RTL } from '../../../../packages/content/schema';
import arEG from './locales/ar-EG.json';
import arIQ from './locales/ar-IQ.json';
import arLB from './locales/ar-LB.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ko from './locales/ko.json';

import globalEnUS from '../../../../packages/content/locales/en-US/messages.json';
import globalFrFR from '../../../../packages/content/locales/fr-FR/messages.json';
import globalFrCA from '../../../../packages/content/locales/fr-CA/messages.json';
import globalDeDE from '../../../../packages/content/locales/de-DE/messages.json';
import globalZhCN from '../../../../packages/content/locales/zh-Hans-CN/messages.json';
import globalJaJP from '../../../../packages/content/locales/ja-JP/messages.json';
import globalRuRU from '../../../../packages/content/locales/ru-RU/messages.json';
import globalUkUA from '../../../../packages/content/locales/uk-UA/messages.json';
import globalKoKR from '../../../../packages/content/locales/ko-KR/messages.json';
import globalAr from '../../../../packages/content/locales/ar/messages.json';
import globalArLB from '../../../../packages/content/locales/ar-LB/messages.json';
import globalArIQ from '../../../../packages/content/locales/ar-IQ/messages.json';
import globalArEG from '../../../../packages/content/locales/ar-EG/messages.json';
import globalArMA from '../../../../packages/content/locales/ar-MA/messages.json';

export type WebUiLang =
  | 'en'
  | 'fr'
  | 'fr-CA'
  | 'de-DE'
  | 'zh-Hans-CN'
  | 'ja-JP'
  | 'ru-RU'
  | 'uk-UA'
  | 'ko'
  | 'ar'
  | 'ar-LB'
  | 'ar-EG'
  | 'ar-IQ'
  | 'ar-MA';

export const WEB_UI_LANGS: readonly WebUiLang[] = [
  'en',
  'fr',
  'ar-LB',
  'ar-EG',
  'ar-IQ',
  'ko',
  'fr-CA',
  'de-DE',
  'zh-Hans-CN',
  'ja-JP',
  'ru-RU',
  'uk-UA',
  'ar',
  'ar-MA',
] as const;

export const WEB_UI_LANG_LABELS: Record<WebUiLang, string> = {
  en: 'English (en-US)',
  fr: 'Français · France (fr-FR)',
  'fr-CA': 'Français · Canada (fr-CA)',
  'de-DE': 'Deutsch · Deutschland (de-DE)',
  'zh-Hans-CN': '简体中文 · 中国 (zh-Hans-CN)',
  'ja-JP': '日本語 · 日本 (ja-JP)',
  'ru-RU': 'Русский (ru-RU)',
  'uk-UA': 'Українська · Україна (uk-UA)',
  ko: '한국어 · 대한민국 (ko-KR)',
  ar: 'العربية الفصحى (ar)',
  'ar-LB': 'العربية · لبنان (ar-LB)',
  'ar-IQ': 'العربية · العراق (ar-IQ)',
  'ar-EG': 'العربية · مصر (ar-EG)',
  'ar-MA': 'الدارجة المغربية · المغرب (ar-MA)',
};

const EXTRA_WEB_UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  'fr-CA': {
    ...fr,
    'app.subtitle': 'Onze pays, 66 chapitres, 14 langues — Echoes of Home : L’Atlas de l’Appartenance',
    'country.DE': 'Allemagne',
    'country.CN': 'Chine',
    'country.JP': 'Japon',
    'country.RU': 'Russie',
    'country.UA': 'Ukraine',
    'country.MA': 'Maroc',
  },
  'de-DE': {
    'app.title': 'MiraVerse',
    'app.subtitle': 'Elf Länder, 66 Kapitel, 14 Sprachen — Echoes of Home: Der Atlas der Zugehörigkeit',
    'nav.home': 'Startseite',
    'nav.passport': 'Reisepass',
    'nav.about': 'Über uns & Eltern',
    'nav.language': 'Sprache',
    'home.hero.title': 'Wähle dein kulturelles Abenteuer in 11 Ländern',
    'home.hero.subtitle': 'Entdecke 11 Kulturwelten, 66 vernetzte Kapitel, 4 Altersstufen (5–17) und 14 Sprachprofile.',
    'home.cta.passport': 'Meinen Reisepass öffnen',
    'home.cta.about': 'Für Eltern & Lehrkräfte',
    'home.card.readStory': 'Geschichte lesen',
    'home.card.playChapter': 'Kapitel spielen',
    'home.card.mentor': 'Mentor',
    'home.card.regions': 'Regionen',
    'country.LB': 'Libanon',
    'country.EG': 'Ägypten',
    'country.IQ': 'Irak',
    'country.KR': 'Südkorea',
    'country.FR': 'Frankreich',
    'country.DE': 'Deutschland',
    'country.CN': 'China',
    'country.JP': 'Japan',
    'country.RU': 'Russland',
    'country.UA': 'Ukraine',
    'country.MA': 'Marokko',
    'passport.title': 'MiraVerse Souvenir-Reisepass',
    'passport.clear': 'Reisepass zurücksetzen',
    'about.title': 'Über MiraVerse — Leitfaden für Eltern & Pädagogen',
  },
  'zh-Hans-CN': {
    'app.title': 'MiraVerse 奇妙世界',
    'app.subtitle': '11 个国家、66 个章节、14 种语言 —— 家园回响：归属地图集',
    'nav.home': '首页',
    'nav.passport': '纪念护照',
    'nav.about': '关于与家长指南',
    'nav.language': '语言',
    'home.hero.title': '开启 11 国文化探索之旅',
    'home.hero.subtitle': '探索 11 个文化目的地、66 个相连章节、4 个年龄段轨迹（5–17 岁）与 14 种语言配置。',
    'home.cta.passport': '打开我的护照',
    'home.cta.about': '家长与教师指南',
    'home.card.readStory': '阅读故事',
    'home.card.playChapter': '开始章节',
    'home.card.mentor': '导师',
    'home.card.regions': '地区',
    'country.LB': '黎巴嫩',
    'country.EG': '埃及',
    'country.IQ': '伊拉克',
    'country.KR': '韩国',
    'country.FR': '法国',
    'country.DE': '德国',
    'country.CN': '中国',
    'country.JP': '日本',
    'country.RU': '俄罗斯',
    'country.UA': '乌克兰',
    'country.MA': '摩洛哥',
    'passport.title': 'MiraVerse 纪念护照',
    'passport.clear': '清空 / 重置护照',
    'about.title': '关于 MiraVerse —— 家长与教育者指南',
  },
  'ja-JP': {
    'app.title': 'ミラバース (MiraVerse)',
    'app.subtitle': '11カ国・66章・14言語 — 故郷のこだま：つながりのアトラス',
    'nav.home': 'ホーム',
    'nav.passport': '記念パスポート',
    'nav.about': '保護者・教育者向け案内',
    'nav.language': '言語',
    'home.hero.title': '11の文化ワールドから冒険を選ぼう',
    'home.hero.subtitle': '11の文化都市、66の章、4つの年齢トラック（5〜17歳）、14の言語プロファイルを体験しよう。',
    'home.cta.passport': 'パスポートを開く',
    'home.cta.about': '保護者と先生へ',
    'home.card.readStory': '物語を読む',
    'home.card.playChapter': 'チャプターを遊ぶ',
    'home.card.mentor': 'メンター',
    'home.card.regions': '地域',
    'country.LB': 'レバノン',
    'country.EG': 'エジプト',
    'country.IQ': 'イラク',
    'country.KR': '韓国',
    'country.FR': 'フランス',
    'country.DE': 'ドイツ',
    'country.CN': '中国',
    'country.JP': '日本',
    'country.RU': 'ロシア',
    'country.UA': 'ウクライナ',
    'country.MA': 'モロッコ',
    'passport.title': 'ミラバース 記念パスポート',
    'passport.clear': 'パスポートをリセット',
    'about.title': 'ミラバースについて — 保護者・教育者ガイド',
  },
  'ru-RU': {
    'app.title': 'MiraVerse',
    'app.subtitle': '11 стран, 66 глав, 14 языков — Эхо дома: Атлас сопричастности',
    'nav.home': 'Главная',
    'nav.passport': 'Паспорт',
    'nav.about': 'О проекте и родителям',
    'nav.language': 'Язык',
    'home.hero.title': 'Выберите культурное приключение в 11 странах',
    'home.hero.subtitle': 'Исследуйте 11 культурных регионов, 66 глав, 4 возрастных маршрута (5–17 лет) и 14 языковых профилей.',
    'home.cta.passport': 'Открыть паспорт',
    'home.cta.about': 'Родителям и педагогам',
    'home.card.readStory': 'Читать историю',
    'home.card.playChapter': 'Играть главу',
    'home.card.mentor': 'Наставник',
    'home.card.regions': 'Регионы',
    'country.LB': 'Ливан',
    'country.EG': 'Египет',
    'country.IQ': 'Ирак',
    'country.KR': 'Южная Корея',
    'country.FR': 'Франция',
    'country.DE': 'Германия',
    'country.CN': 'Китай',
    'country.JP': 'Япония',
    'country.RU': 'Россия',
    'country.UA': 'Украина',
    'country.MA': 'Марокко',
    'passport.title': 'Сувенирный паспорт MiraVerse',
    'passport.clear': 'Очистить паспорт',
    'about.title': 'О MiraVerse — Руководство для родителей и учителей',
  },
  'uk-UA': {
    'app.title': 'MiraVerse',
    'app.subtitle': '11 країн, 66 розділів, 14 мов — Відлуння дому: Атлас приналежності',
    'nav.home': 'Головна',
    'nav.passport': 'Паспорт',
    'nav.about': 'Про проєкт і батькам',
    'nav.language': 'Мова',
    'home.hero.title': 'Оберіть культурну пригоду в 11 країнах',
    'home.hero.subtitle': 'Досліджуйте 11 культурних світів, 66 розділів, 4 вікові треки (5–17 років) та 14 мовних профілів.',
    'home.cta.passport': 'Відкрити паспорт',
    'home.cta.about': 'Для батьків та освітян',
    'home.card.readStory': 'Читати історію',
    'home.card.playChapter': 'Грати розділ',
    'home.card.mentor': 'Наставник',
    'home.card.regions': 'Регіони',
    'country.LB': 'Ліван',
    'country.EG': 'Єгипет',
    'country.IQ': 'Ірак',
    'country.KR': 'Південна Корея',
    'country.FR': 'Франція',
    'country.DE': 'Німеччина',
    'country.CN': 'Китай',
    'country.JP': 'Японія',
    'country.RU': 'Росія',
    'country.UA': 'Україна',
    'country.MA': 'Марокко',
    'passport.title': 'Сувенірний паспорт MiraVerse',
    'passport.clear': 'Очистити паспорт',
    'about.title': 'Про MiraVerse — Посібник для батьків та вчителів',
  },
  ar: {
    ...arLB,
    'app.subtitle': '١١ بلداً، ٦٦ فصلاً، ١٤ لغة — أصداء الوطن: أطلس الانتماء',
    'country.DE': 'ألمانيا',
    'country.CN': 'الصين',
    'country.JP': 'اليابان',
    'country.RU': 'روسيا',
    'country.UA': 'أوكرانيا',
    'country.MA': 'المغرب',
  },
  'ar-MA': {
    ...arLB,
    'app.subtitle': '١١ بلاد، ٦٦ فصل، ١٤ لغة — أصداء الدار: أطلس الانتماء',
    'nav.home': 'الرئيسية',
    'nav.passport': 'الباسبور',
    'nav.language': 'اللغة',
    'country.DE': 'ألمانيا',
    'country.CN': 'الصين',
    'country.JP': 'اليابان',
    'country.RU': 'روسيا',
    'country.UA': 'أوكرانيا',
    'country.MA': 'المغرب',
  },
};

const CATALOGS: Record<WebUiLang, Record<string, string>> = {
  en: { ...en, ...(globalEnUS.strings as Record<string, string>) },
  fr: { ...en, ...fr, ...(globalFrFR.strings as Record<string, string>) },
  'fr-CA': { ...en, ...fr, ...EXTRA_WEB_UI_TRANSLATIONS['fr-CA'], ...(globalFrCA.strings as Record<string, string>) },
  'de-DE': { ...en, ...EXTRA_WEB_UI_TRANSLATIONS['de-DE'], ...(globalDeDE.strings as Record<string, string>) },
  'zh-Hans-CN': { ...en, ...EXTRA_WEB_UI_TRANSLATIONS['zh-Hans-CN'], ...(globalZhCN.strings as Record<string, string>) },
  'ja-JP': { ...en, ...EXTRA_WEB_UI_TRANSLATIONS['ja-JP'], ...(globalJaJP.strings as Record<string, string>) },
  'ru-RU': { ...en, ...EXTRA_WEB_UI_TRANSLATIONS['ru-RU'], ...(globalRuRU.strings as Record<string, string>) },
  'uk-UA': { ...en, ...EXTRA_WEB_UI_TRANSLATIONS['uk-UA'], ...(globalUkUA.strings as Record<string, string>) },
  ko: { ...en, ...ko, ...(globalKoKR.strings as Record<string, string>) },
  ar: { ...en, ...EXTRA_WEB_UI_TRANSLATIONS.ar, ...(globalAr.strings as Record<string, string>) },
  'ar-LB': { ...en, ...arLB, ...(globalArLB.strings as Record<string, string>) },
  'ar-IQ': { ...en, ...arIQ, ...(globalArIQ.strings as Record<string, string>) },
  'ar-EG': { ...en, ...arEG, ...(globalArEG.strings as Record<string, string>) },
  'ar-MA': { ...en, ...EXTRA_WEB_UI_TRANSLATIONS['ar-MA'], ...(globalArMA.strings as Record<string, string>) },
};

const STORAGE_KEY = 'miraverse:ui-lang';

function isValidLang(value: string | null): value is WebUiLang {
  return value !== null && (WEB_UI_LANGS as readonly string[]).includes(value);
}

export function isWebRtlLang(lang: string): boolean {
  return (RTL as readonly string[]).includes(lang) || lang === 'ar' || lang === 'ar-MA' || lang.startsWith('ar-');
}

function readStoredLang(): WebUiLang {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isValidLang(raw) ? raw : 'en';
  } catch {
    return 'en';
  }
}

interface I18nValue {
  lang: WebUiLang;
  dir: 'ltr' | 'rtl';
  setLang: (lang: WebUiLang) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nValue>({
  lang: 'en',
  dir: 'ltr',
  setLang: () => {},
  t: (key, fallback) => CATALOGS.en[key] ?? fallback ?? key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<WebUiLang>(readStoredLang);
  const dir: 'ltr' | 'rtl' = isWebRtlLang(lang) ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage failures in restricted browser contexts.
    }
  }, [dir, lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      dir,
      setLang: setLangState,
      t: (key, fallback) => CATALOGS[lang]?.[key] ?? CATALOGS.en[key] ?? fallback ?? key,
    }),
    [dir, lang]
  );

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  return useContext(I18nContext);
}
