/**
 * MiraVerse Global v1.1 — 14-Locale Service, RTL/BiDi Formatter & Fallback Resolver
 * (`apps/minecraft/scripts/src/locales/index.ts`)
 * Owner: CX02 (Wave W2)
 */
import localesRegistry from '../../../../../packages/content/minecraft-global/locales/locales-registry.json';
import enUS from '../../../../../packages/content/locales/en-US/messages.json';
import frFR from '../../../../../packages/content/locales/fr-FR/messages.json';
import frCA from '../../../../../packages/content/locales/fr-CA/messages.json';
import deDE from '../../../../../packages/content/locales/de-DE/messages.json';
import zhHansCN from '../../../../../packages/content/locales/zh-Hans-CN/messages.json';
import jaJP from '../../../../../packages/content/locales/ja-JP/messages.json';
import ruRU from '../../../../../packages/content/locales/ru-RU/messages.json';
import ukUA from '../../../../../packages/content/locales/uk-UA/messages.json';
import koKR from '../../../../../packages/content/locales/ko-KR/messages.json';
import ar from '../../../../../packages/content/locales/ar/messages.json';
import arLB from '../../../../../packages/content/locales/ar-LB/messages.json';
import arIQ from '../../../../../packages/content/locales/ar-IQ/messages.json';
import arEG from '../../../../../packages/content/locales/ar-EG/messages.json';
import arMA from '../../../../../packages/content/locales/ar-MA/messages.json';

export type SupportedLocaleId =
  | 'en-US'
  | 'fr-FR'
  | 'fr-CA'
  | 'de-DE'
  | 'zh-Hans-CN'
  | 'ja-JP'
  | 'ru-RU'
  | 'uk-UA'
  | 'ko-KR'
  | 'ar'
  | 'ar-LB'
  | 'ar-IQ'
  | 'ar-EG'
  | 'ar-MA';

const CATALOGS: Record<SupportedLocaleId, typeof enUS> = {
  'en-US': enUS,
  'fr-FR': frFR,
  'fr-CA': frCA,
  'de-DE': deDE,
  'zh-Hans-CN': zhHansCN,
  'ja-JP': jaJP,
  'ru-RU': ruRU,
  'uk-UA': ukUA,
  'ko-KR': koKR,
  'ar': ar,
  'ar-LB': arLB,
  'ar-IQ': arIQ,
  'ar-EG': arEG,
  'ar-MA': arMA,
};

export class LocaleService {
  static readonly SUPPORTED_LOCALES: SupportedLocaleId[] = Object.keys(CATALOGS) as SupportedLocaleId[];

  static getLocaleMetadata(localeId: SupportedLocaleId) {
    return (localesRegistry as any[]).find((l) => l.id === localeId) || localesRegistry[0];
  }

  static translate(localeId: SupportedLocaleId, key: string): { text: string; resolvedLocale: SupportedLocaleId; direction: 'ltr' | 'rtl'; isNativeBedrock: boolean } {
    const meta = this.getLocaleMetadata(localeId);
    const chain: SupportedLocaleId[] = (meta?.fallbackChain as SupportedLocaleId[]) || [localeId, 'en-US'];
    for (const candidate of chain) {
      const cat = CATALOGS[candidate];
      const val = (cat?.strings as Record<string, string> | undefined)?.[key];
      if (val && val.trim().length > 0) {
        return {
          text: val,
          resolvedLocale: candidate,
          direction: (cat.direction as 'ltr' | 'rtl') || 'ltr',
          isNativeBedrock: Boolean(cat.isNativeBedrock),
        };
      }
    }
    return {
      text: key,
      resolvedLocale: 'en-US',
      direction: 'ltr',
      isNativeBedrock: true,
    };
  }
}

export class DialogueService {
  static buildChapterDialogue(chapterId: string, localeId: SupportedLocaleId, ageTrack: '5-7' | '8-10' | '11-13' | '14-17') {
    const title = LocaleService.translate(localeId, `quest.${chapterId}.title`).text;
    const greeting = LocaleService.translate(localeId, `quest.${chapterId}.greeting`).text;
    const summary = LocaleService.translate(localeId, `quest.${chapterId}.summary`).text;
    const sourceNote = LocaleService.translate(localeId, `quest.${chapterId}.source_note`).text;
    return {
      chapterId,
      localeId,
      ageTrack,
      title,
      greeting,
      summary,
      sourceNote,
      showPictogramAssist: ageTrack === '5-7',
      showCuratorProvenancePanel: ageTrack === '14-17' || ageTrack === '11-13',
    };
  }
}
