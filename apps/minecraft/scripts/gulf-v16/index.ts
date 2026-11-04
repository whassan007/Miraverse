/**
 * MiraVerse v1.6 (CX04 / CL04) — Non-Destructive Minecraft Bedrock Arabic / Arabizi / English Capability Test & 30-Act Engine
 * (apps/minecraft/scripts/gulf-v16/index.ts)
 *
 * Implements the three-rung per-surface fallback ladder:
 * 1. Native UTF-8 Arabic script (without manual string reversal) where supported in @minecraft/server-ui & titles.
 * 2. Curated Arabizi (Latin-script Arabic transliteration: phonetic for ages 5-7, optional 3/7/5 numerals for 11-17).
 * 3. Plain English with side-by-side Arabic/Arabizi glossary.
 * Never adds fake unsupported language codes to texts/languages.json.
 */

export type BedrockScriptModeV16 = 'Arab' | 'Latn' | 'en';
export type BedrockSurfaceTypeV16 =
  | 'server_ui_form'
  | 'actionbar_short'
  | 'title_banner'
  | 'npc_nametag'
  | 'sign_text'
  | 'book_page';

export interface GulfBedrockLocalizedLineV16 {
  id: string;
  arabic: string;
  arabizi5To7: string;
  arabizi11To17: string;
  english: string;
}

export const BEDROCK_CAPABILITY_PROBES_V16: readonly GulfBedrockLocalizedLineV16[] = [
  {
    id: 'probe.brand.header',
    arabic: 'عالم يرا · مغامرات الخليج',
    arabizi5To7: "Alam Mira · Gulf Adventures (Mira's World)",
    arabizi11To17: "3alam Mira · Mughamarat il-Khalij (Mira's World)",
    english: "Mira's World · Gulf Diaspora Adventures",
  },
  {
    id: 'probe.qa.act1.invitation',
    arabic: 'حياكم الله على سيف الدوحة! يلا نكتشف دفتر القلاف واللؤلؤ.',
    arabizi5To7: 'Yalla niktishif il-lulu wa daftar il-qallaf!',
    arabizi11To17: '7ayyakum Allah 3ala seef il-Doha! Yalla niktishif daftar il-qallaf.',
    english: "Welcome to the Doha shore! Let's explore the boatwright's ledger and pearls.",
  },
];

export function resolveBedrockSurfaceTextV16(
  line: GulfBedrockLocalizedLineV16,
  mode: BedrockScriptModeV16,
  ageTier: '5-7' | '8-10' | '11-13' | '14-17' = '8-10',
  surface: BedrockSurfaceTypeV16 = 'server_ui_form'
): string {
  const arabizi = ageTier === '5-7' || ageTier === '8-10' ? line.arabizi5To7 : line.arabizi11To17;
  if (mode === 'Arab') {
    if (surface === 'npc_nametag' || surface === 'sign_text') {
      return `${line.arabic.slice(0, 28)} · ${line.english.slice(0, 22)}`;
    }
    return `${line.arabic}\n(${line.english})`;
  }
  if (mode === 'Latn') {
    return `${arabizi}\n[${line.arabic} — ${line.english}]`;
  }
  return `${line.english}\n[${arabizi} · ${line.arabic}]`;
}

export const GULF_BEDROCK_QUEST_HANDLERS_V16: Record<string, { country: string; actNumber: number; structureId: string; titleEn: string; titleAr: string; titleArabizi: string }> = {
  "quest.qa.01": { country: "QA", actNumber: 1, structureId: "miraverse:qa_doha_boatwright_pier", titleEn: "The Boatwright's Ledger", titleAr: "دفتر القلّاف", titleArabizi: "Daftar il-Qallaf" },
  "quest.qa.02": { country: "QA", actNumber: 2, structureId: "miraverse:qa_zubarah_market_courtyard", titleEn: "The Pearl Market", titleAr: "سوق الطواشين", titleArabizi: "Souq il-Tawashin" },
  "quest.qa.03": { country: "QA", actNumber: 3, structureId: "miraverse:qa_harbor_workshop_pavilion", titleEn: "Restore the Harbor Workshop", titleAr: "ترميم ورشة المرفأ", titleArabizi: "Tarmim Warshat il-Marfa" },
  "quest.qa.04": { country: "QA", actNumber: 4, structureId: "miraverse:qa_fisaikra_story_courtyard", titleEn: "The Fisaikra Story Circle", titleAr: "حلقة حكاية الفسيفكرة", titleArabizi: "Halqat Hikayat Al-Fisaikra" },
  "quest.qa.05": { country: "QA", actNumber: 5, structureId: "miraverse:qa_al_qaffal_promenade", titleEn: "Al Qaffal: Coming Home", titleAr: "القفّال: فرحة العودة إلى الديار", titleArabizi: "Al-Qaffal: Farhat il-3awda" },
  "quest.ae.01": { country: "AE", actNumber: 1, structureId: "miraverse:ae_creek_sunrise_pier", titleEn: "Sails at Sunrise", titleAr: "أشرعة عند الشروق", titleArabizi: "Ashri3a 3ind il-Shuruq" },
  "quest.ae.02": { country: "AE", actNumber: 2, structureId: "miraverse:ae_covered_creek_souk", titleEn: "The Souk of Many Routes", titleAr: "سوق المسارات المتعددة", titleArabizi: "Souq il-Masarat il-Muta3addida" },
  "quest.ae.03": { country: "AE", actNumber: 3, structureId: "miraverse:ae_barjeel_courtyard_workshop", titleEn: "Wind Tower Workshop", titleAr: "ورشة البارجيل والظل", titleArabizi: "Warshat il-Barjeel wal-Zill" },
  "quest.ae.04": { country: "AE", actNumber: 4, structureId: "miraverse:ae_al_ain_oasis_table", titleEn: "Oasis Table", titleAr: "مائدة الواحة والضيافة", titleArabizi: "Ma'idat il-Waha wal-Diyafa" },
  "quest.ae.05": { country: "AE", actNumber: 5, structureId: "miraverse:ae_sea_to_oasis_lookout", titleEn: "Sea to Oasis Memory Map", titleAr: "خريطة ذاكرة البحر والواحة", titleArabizi: "Kharitat Dhakirat il-Bahr wal-Waha" },
  "quest.kw.01": { country: "KW", actNumber: 1, structureId: "miraverse:kw_naqah_boom_pier", titleEn: "The Sailor's Kit", titleAr: "عدّة البحار والمؤونة", titleArabizi: "3iddat il-Bahhar wal-Ma'una" },
  "quest.kw.02": { country: "KW", actNumber: 2, structureId: "miraverse:kw_sikak_ledger_alley", titleEn: "The Merchant's Promise", titleAr: "كلمة التاجر وميثاق الأمانة", titleArabizi: "Kalimat il-Tajir wa Mithaq il-Amana" },
  "quest.kw.03": { country: "KW", actNumber: 3, structureId: "miraverse:kw_qallaf_shipyard", titleEn: "Rescue the Model Dhow", titleAr: "إنقاذ وترميم سفينة البوم", titleArabizi: "Inqadh wa Tarmim Safinat il-Boom" },
  "quest.kw.04": { country: "KW", actNumber: 4, structureId: "miraverse:kw_lantern_story_courtyard", titleEn: "Who Makes the Night Sounds?", titleAr: "من يصدر أصوات الليل في الميناء؟", titleArabizi: "Man Yusdir Aswat il-Layl fil-Mina?" },
  "quest.kw.05": { country: "KW", actNumber: 5, structureId: "miraverse:kw_sief_finale_pier", titleEn: "Songs of Safe Return", titleAr: "أهازيج العودة السالمة (القفال)", titleArabizi: "Ahazij il-3awda il-Salima (Il-Quffal)" },
  "quest.sa.01": { country: "SA", actNumber: 1, structureId: "miraverse:sa_najd_poetry_terrace", titleEn: "A Poet's First Words", titleAr: "كلمات الشاعر الأولى وميزان البيان", titleArabizi: "Kalimat il-Sha3ir il-Ula wa Mizan il-Bayan" },
  "quest.sa.02": { country: "SA", actNumber: 2, structureId: "miraverse:sa_wadi_caravan_station", titleEn: "The Caravan's Choices", titleAr: "خيارات القافلة وأمان الطريق", titleArabizi: "Khiyarat il-Qafila wa Aman il-Tariq" },
  "quest.sa.03": { country: "SA", actNumber: 3, structureId: "miraverse:sa_najd_market_arcade", titleEn: "The Honor of Fair Trade", titleAr: "شرف التجارة العادلة وميزان القسط", titleArabizi: "Sharaf il-Tijara il-3adila wa Mizan il-Qist" },
  "quest.sa.04": { country: "SA", actNumber: 4, structureId: "miraverse:sa_najd_story_courtyard", titleEn: "Build the Story Courtyard", titleAr: "بناء فناء القصيد والمجلس النجدي", titleArabizi: "Bina' Fina' il-Qasid wal-Majlis il-Najdi" },
  "quest.sa.05": { country: "SA", actNumber: 5, structureId: "miraverse:sa_najd_majlis_finale", titleEn: "The Voice That Travels Home", titleAr: "الصوت الذي يسافر إلى الديار", titleArabizi: "Il-Sawt illi Yusafir ila il-Diyar" },
  "quest.om.01": { country: "OM", actNumber: 1, structureId: "miraverse:om_falaj_sharia_basin", titleEn: "Follow the Water", titleAr: "تتبّع مسار الماء", titleArabizi: "Tatabba3 Masar il-Ma" },
  "quest.om.02": { country: "OM", actNumber: 2, structureId: "miraverse:om_frankincense_trade_station", titleEn: "The Frankincense Route", titleAr: "طريق اللبان الظفاري", titleArabizi: "Tariq il-Luban il-Dhofari" },
  "quest.om.03": { country: "OM", actNumber: 3, structureId: "miraverse:om_falaj_repair_aqueduct", titleEn: "Repair the Falaj", titleAr: "ترميم قناة الفلج", titleArabizi: "Tarmim Qanat il-Falaj" },
  "quest.om.04": { country: "OM", actNumber: 4, structureId: "miraverse:om_sablah_hospitality_veranda", titleEn: "The Oasis Family Table", titleAr: "مائدة عائلة الواحة", titleArabizi: "Ma'idat 3ailat il-Waha" },
  "quest.om.05": { country: "OM", actNumber: 5, structureId: "miraverse:om_sundial_archive_plaza", titleEn: "Share the Water, Share the Story", titleAr: "تقاسَم الماء وشارك الحكاية", titleArabizi: "Taqasam il-Ma wa Sharik il-Hikaya" },
  "quest.bh.01": { country: "BH", actNumber: 1, structureId: "miraverse:bh_qalat_stratigraphy_pavilion", titleEn: "The Archaeologist's Layers", titleAr: "طبقات عالم الآثار", titleArabizi: "Tabaqat 3alim il-Athar" },
  "quest.bh.02": { country: "BH", actNumber: 2, structureId: "miraverse:bh_dilmun_sea_gate_warehouse", titleEn: "The Harbor's Exchange", titleAr: "تبادل ميناء دلمون", titleArabizi: "Tabadul Mina Dilmun" },
  "quest.bh.03": { country: "BH", actNumber: 3, structureId: "miraverse:bh_conservation_walkway_pavilion", titleEn: "Preserve the Heritage Site", titleAr: "حماية الموقع التراثي وترميم جناح العرض", titleArabizi: "7imayat il-Mawqi3 il-Turathi" },
  "quest.bh.04": { country: "BH", actNumber: 4, structureId: "miraverse:bh_muharraq_pearling_courtyard", titleEn: "Pearling Stories and Dates", titleAr: "حكايات اللؤلؤ والضيافة في المحرق", titleArabizi: "Hikayat il-Lulu wal-Diyafa fil-Muharraq" },
  "quest.bh.05": { country: "BH", actNumber: 5, structureId: "miraverse:bh_dilmun_memory_chest_hall", titleEn: "The Dilmun Memory Chest", titleAr: "صندوق ذاكرة دلمون والبحرين", titleArabizi: "Sunduq Dhakirat Dilmun wal-Bahrain" },
};
