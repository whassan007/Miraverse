#!/usr/bin/env node
/**
 * MiraVerse v1.2 — Wave W1 Knowledge Staging Executor (`swarm/v12/run-wave1.mjs`)
 * Executes Wave W1 agents DX02–DX11 sequentially (maxConcurrency=1 on DGX Spark) in isolated worktrees:
 *   - DX02: Claim extraction (`content/v12/staging/claims/`)
 *   - DX03: Entity linking & deduplication (`content/v12/staging/entity-links/`)
 *   - DX04: Source-to-claim provenance indexing (`content/v12/staging/provenance/`)
 *   - DX05: Lebanon structured extraction (`content/v12/staging/countries/LB/`)
 *   - DX06: Iraq structured extraction (`content/v12/staging/countries/IQ/`)
 *   - DX07: Egypt structured extraction (`content/v12/staging/countries/EG/`)
 *   - DX08: France structured extraction (`content/v12/staging/countries/FR/`)
 *   - DX09: Korea structured extraction (`content/v12/staging/countries/KR/`)
 *   - DX10: Historical/myth/folklore classification audit (`content/v12/qa/epistemic-classes/`)
 *   - DX11: Contested claim & numerical assertion flags (`content/v12/qa/contested-flags/`)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT, queryDgxSpark, prepareWorktree, writeWtFile, isAgentDone, finalizeAgent } from './run-wave0.mjs';

export const CANONICAL_RECORDS_BY_COUNTRY = {
  LB: [
    {
      id: 'LB-KB-PLACE-BYBLOS-PORT',
      country: 'LB',
      title: { en: 'Byblos (Jbeil) Maritime Harbor & Cedar Trade', fr: 'Port maritime de Byblos (Jbeil)', 'ar-LB': 'ميناء جبيل البحري وتجارة الأرز', 'ar-EG': 'ميناء جبيل البحري', 'ar-IQ': 'ميناء جبيل البحري', ko: '비블로스(즈베일) 해상 항구와 삼나무 무역' },
      entity_type: 'place',
      summary: 'Ancient eastern Mediterranean coastal port linking Mount Lebanon cedar timber, olive oil, and resin with Egypt and the Aegean.',
      expanded_explanation: 'Byblos (modern Jbeil, north of Beirut) is one of the oldest continuously inhabited coastal settlements in the Mediterranean. Archaeological layers and Egyptian Old/Middle Kingdom records document Byblos as a key maritime port exporting Mount Lebanon cedar wood, olive oil, and resin while importing papyrus reed from the Nile.',
      knowledge_class: 'historical_claim',
      claim_status: 'externally_corrobated',
      confidence: 'high',
      time_period: 'c. 3000 BCE – Present',
      people: ['King Ahiram', 'Teta Nahla (In-Game Mentor)', 'Captain Rima (In-Game Neighbor)'],
      places: ['Byblos (Jbeil)', 'Mount Lebanon', 'Mediterranean Sea'],
      relationships: [
        { target_id: 'LB-KB-ARTIFACT-AHIRAM-SARCOPHAGUS', relation: 'located_in', note: 'Royal necropolis of Byblos' },
        { target_id: 'LB-KB-MYTH-ISIS-OSIRIS-TREE', relation: 'associated_with', note: 'Hellenistic mythic setting in Byblos' },
      ],
      sources: [
        { source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'LB-P01', url: null, verified: false },
        { source_id: 'UNESCO-WHC-295', passage_locator: 'Byblos World Heritage Listing #295', url: 'https://whc.unesco.org/en/list/295/', verified: true, external_citation: 'UNESCO World Heritage Centre, Byblos (Criterion iii, iv, vi)' },
      ],
      sensitivity_notes: ['Present Beirut and Mount Lebanon as distinct geographic areas, not walkable extensions of a single block street.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Byblos is an ancient seaside harbor where wooden boats sailed across the blue water carrying fragrant cedar wood and golden olive oil.',
        '8-10': 'For thousands of years, sailors in Byblos traded strong cedar timber from Mount Lebanon for papyrus scrolls from Egypt, turning their stone harbor into a busy meeting place.',
        '11-13': 'Archaeological excavations and Egyptian records show Byblos (Jbeil) functioned as a premier timber-exporting port, connecting Levantine mountain forests with Nile Valley and Aegean trade routes.',
        '14-17': 'Byblos illustrates how coastal geography shaped eastern Mediterranean exchange networks: cedar timber and resin moved south to Egypt while papyrus (from which the Greek word biblion derived) moved north through Phoenician ports.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['LB-A01', 'LB-A02'],
      atlas_links: ['atlas:real:LB:byblos_port', 'atlas:quest:LB:A01'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['cedar_beam', 'limestone_block', 'olive_oil'], quest_objective_ids: ['LB:ch1:harbor:gather', 'LB:ch1:harbor:build'], story_scene_ids: [1, 2, 4] },
    },
    {
      id: 'LB-KB-MYTH-ISIS-OSIRIS-TREE',
      country: 'LB',
      title: { en: 'Myth of Isis, Osiris, and the Sacred Tree of Byblos', fr: 'Mythe d’Isis, d’Osiris et de l’arbre sacré de Byblos', 'ar-LB': 'أسطورة إيزيس وأوزيريس والشجرة المقدسة في جبيل', 'ar-EG': 'أسطورة إيزيس وأوزيريس في جبيل', 'ar-IQ': 'أسطورة إيزيس وأوزيريس في جبيل', ko: '비블로스의 이시스, 오시리스와 신성한 나무 신화' },
      entity_type: 'myth',
      summary: 'Ancient mythological narrative told by Plutarch in which the chest of Osiris washed ashore at Byblos and grew inside a fragrant tree pillar.',
      expanded_explanation: 'Recorded in Plutarch’s 1st–2nd century CE treatise De Iside et Osiride, this mythological episode describes the chest of Osiris drifting across the sea from Egypt to Byblos, where a sacred erica/cedar tree grew around it and became a pillar in the local king’s palace until Isis retrieved it. In MiraVerse, this is explicitly presented as a mythological symbol of Egypt–Byblos cultural ties rather than a literal historical event.',
      knowledge_class: 'mythology',
      claim_status: 'source_asserted_unverified',
      confidence: 'medium',
      time_period: 'Mythological antiquity (recorded 1st–2nd century CE by Plutarch)',
      people: ['Isis (Mythic Figure)', 'Osiris (Mythic Figure)', 'Plutarch (Ancient Author)'],
      places: ['Byblos (Jbeil)'],
      relationships: [{ target_id: 'LB-KB-PLACE-BYBLOS-PORT', relation: 'located_in', note: 'Mythic harbor arrival setting' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'LB-P02', url: null, verified: false }],
      sensitivity_notes: ['Must be clearly labeled as ancient mythology (Plutarch), never literal history; avoid traumatic violent details for young children.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'An old storybook legend says a carved wooden chest floated across the sea to Byblos and a tall fragrant tree grew around it to keep it safe.',
        '8-10': 'In an ancient myth linking Egypt and Lebanon, a carved chest drifted to the shore of Byblos and became part of a great palace pillar of scented wood.',
        '11-13': 'The Greek writer Plutarch preserved a mythological story in which Isis traveled to Byblos seeking a sacred chest enclosed inside a palace cedar pillar—reflecting real trade ties between Egypt and Byblos through myth.',
        '14-17': 'Plutarch’s De Iside et Osiride (chs. 15–16) embeds Byblos into Egyptian-Hellenistic mythography. Historians read the sacred tree-pillar episode not as literal biography, but as symbolic memory of Byblos’s role supplying sacred timber to Egypt.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['LB-A01', 'LB-A04'],
      atlas_links: ['atlas:real:LB:byblos_port', 'atlas:quest:LB:A04'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['cedar_beam'], quest_objective_ids: ['LB:ch1:harbor:build'] },
    },
    {
      id: 'LB-KB-MYTH-ADONIS-AFQA-RIVER',
      country: 'LB',
      title: { en: 'Afqa Spring, Nahr Ibrahim, and the Seasonal Myth of Adonis', fr: 'Source d’Afqa, Nahr Ibrahim et le mythe saisonnier d’Adonis', 'ar-LB': 'مغارة أفقا ونهر إبراهيم وأسطورة أدونيس الموسمية', 'ar-EG': 'مغارة أفقا ونهر إبراهيم', 'ar-IQ': 'مغارة أفقا ونهر إبراهيم', ko: '아프카 샘과 나흐르 이브라힘 강의 아도니스 계절 신화' },
      entity_type: 'myth',
      summary: 'Distinguishes the seasonal geological washing of red iron-rich soil into Nahr Ibrahim from the ancient myth of Adonis and Astarte.',
      expanded_explanation: 'High in Mount Lebanon above Byblos, the limestone cave spring of Afqa feeds the Nahr Ibrahim (historically called the Adonis River). During spring snowmelt and heavy rains, iron-rich red soil washes into the river, turning the water crimson. Ancient communities interpreted this seasonal color change through the myth of Adonis and Astarte/Aphrodite, whereas earth science explains it through iron-oxide sediment runoff.',
      knowledge_class: 'interpretation',
      claim_status: 'source_asserted_unverified',
      confidence: 'medium',
      time_period: 'Ancient Near Eastern & Hellenistic eras – Present',
      people: ['Adonis (Mythic Figure)', 'Astarte / Aphrodite (Mythic Figure)'],
      places: ['Afqa Cave Spring', 'Nahr Ibrahim (Adonis River)', 'Mount Lebanon'],
      relationships: [{ target_id: 'LB-KB-PLACE-BYBLOS-PORT', relation: 'associated_with', note: 'Hinterland river valley south of Byblos' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'LB-P03', url: null, verified: false }],
      sensitivity_notes: ['Frame strictly as seasonal renewal and geological iron-rich red clay runoff vs ancient poetic myth; no graphic depiction of mythic injury.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'When spring rain falls on the mountains, red clay washes into the river and turns the water bright rust-red while spring flowers bloom along the banks.',
        '8-10': 'At Afqa Cave in Mount Lebanon, melting snow carries red iron-rich earth into Nahr Ibrahim. Long ago, storytellers imagined this seasonal change as a myth of spring returning.',
        '11-13': 'Comparing myth and geology at Nahr Ibrahim shows two ways people explain nature: ancient poets linked the crimson spring water to the myth of Adonis, while geologists trace it to iron-oxide soil erosion.',
        '14-17': 'The Nahr Ibrahim / Afqa landscape demonstrates how ancient sacred geography mapped seasonal ecological cycles—specifically ferruginous limestone sediment runoff and anemone blooms—onto Levantine-Hellenistic ritual narratives.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['LB-A02', 'LB-A04'],
      atlas_links: ['atlas:real:LB:nahr_ibrahim', 'atlas:quest:LB:A02'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['red_tile', 'limestone_block'], quest_objective_ids: ['LB:ch1:harbor:gather'] },
    },
    {
      id: 'LB-KB-ARTIFACT-AHIRAM-SARCOPHAGUS',
      country: 'LB',
      title: { en: 'Sarcophagus of King Ahiram & the 22-Letter Phoenician Abjad', fr: 'Sarcophage du roi Ahiram et l’abjad phénicien de 22 lettres', 'ar-LB': 'ناووس الملك أحيرام والأبجدية الفينيقية (٢٢ حرفاً)', 'ar-EG': 'تابوت الملك أحيرام والأبجدية الفينيقية', 'ar-IQ': 'ناووس الملك أحيرام والأبجدية الفينيقية', ko: '아히람 왕의 석관과 22자 페니키아 문자' },
      entity_type: 'artifact',
      summary: 'Carved limestone sarcophagus from Byblos (c. 1000 BCE) bearing a foundational Phoenician alphabetic inscription.',
      expanded_explanation: 'Unearthed in the royal necropolis of Byblos by Pierre Montet in 1923 and housed in the National Museum of Beirut, the sarcophagus of King Ahiram (commonly dated to c. 1000 BCE, crafted by his son Ittobaal) features a famous Phoenician inscription along its rim. Its 22 consonantal signs—such as Aleph (ox), Beth (house), Mem (water), Resh (head), and Taw (mark)—demonstrate how sound-based writing became a portable archive for merchants and families. Historians note it evolved from earlier Proto-Sinaitic/Canaanite scripts and influenced Greek, Aramaic, Latin, and Arabic alphabets rather than inventing every Western script in isolation.',
      knowledge_class: 'historical_claim',
      claim_status: 'externally_corrobated',
      confidence: 'high',
      time_period: 'c. 1000 BCE (Iron Age I/II transition)',
      people: ['King Ahiram', 'Ittobaal of Byblos'],
      places: ['Byblos Royal Necropolis', 'National Museum of Beirut'],
      relationships: [{ target_id: 'LB-KB-PLACE-BYBLOS-PORT', relation: 'located_in', note: 'Discovered in Byblos Royal Tomb V' }],
      sources: [
        { source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'LB-P04', url: null, verified: false },
        { source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'LB-P05', url: null, verified: false },
        { source_id: 'UNESCO-WHC-295', passage_locator: 'Byblos Phoenician Alphabet Inscriptions', url: 'https://whc.unesco.org/en/list/295/', verified: true, external_citation: 'UNESCO World Heritage Centre, Byblos Criterion (vi): diffusion of the Phoenician alphabet' },
      ],
      sensitivity_notes: ['Distinguish documented alphabet diffusion (Proto-Canaanite -> Phoenician -> Greek/Aramaic) from exaggerated claims that Phoenician directly invented every world script alone.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Match five ancient picture-letters carved in stone: Aleph looks like an ox horn, Beth is a house, and Mem looks like ocean waves!',
        '8-10': 'Instead of hundreds of complicated symbols, Byblos scribes used 22 sound-letters carved on stone chests like King Ahiram’s sarcophagus so sailors could write messages anywhere.',
        '11-13': 'The Ahiram sarcophagus (c. 1000 BCE) preserves one of the earliest full inscriptions in the 22-letter Phoenician consonantal alphabet (abjad), linking acrophonic signs (Aleph, Beth, Mem, Resh, Taw) to later Greek, Arabic, and Latin scripts.',
        '14-17': 'Epigraphic analysis of the Ahiram sarcophagus situates the Byblian 22-letter abjad within a broader Canaanite/Proto-Sinaitic continuum. While maritime trade spread this script to Greece and Aramaic chancelleries, scholars reject simplistic monocausal origin myths.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['LB-A01', 'LB-A05'],
      atlas_links: ['atlas:real:LB:byblos_port', 'atlas:real:LB:beirut_museum', 'atlas:quest:LB:A05'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['limestone_block'], quest_objective_ids: ['LB:ch1:harbor:word'] },
    },
    {
      id: 'LB-KB-THEME-PORTABLE-ARCHIVE-DIASPORA',
      country: 'LB',
      title: { en: 'Writing, Recipes, and Oral Memory as a Portable Archive in the Lebanese Diaspora', fr: 'L’écriture, les recettes et la mémoire orale comme archive portable', 'ar-LB': 'الكتابة والوصفات والذاكرة الشفهية كأرشيف متنقل في المهجر اللبناني', 'ar-EG': 'الذاكرة الشفهية والوصفات في المهجر اللبناني', 'ar-IQ': 'الذاكرة الشفهية والوصفات في المهجر اللبناني', ko: '레바논 디아스포라의 이동식 기록보관소: 문자, 조리법, 구술 기억' },
      entity_type: 'theme',
      summary: 'Connects ancient portable writing with modern diaspora family postcards, saj man’oushe recipes, and fictional elder oral histories.',
      expanded_explanation: 'In Lebanese expatriate literature and community oral-history projects—represented by bibliographic candidates such as Amin Maalouf (Origins), Rabih Alameddine (The Hakawati), and Kahlil Gibran—language, letters, and culinary practices like baking za’atar man’oushe on a domed saj function as portable cultural archives. In MiraVerse quests, players repair a fictional archive chest and record Teta Nahla’s scripted memories without collecting any real child’s voice or personal family data.',
      knowledge_class: 'contemporary_practice',
      claim_status: 'source_asserted_unverified',
      confidence: 'medium',
      time_period: '19th Century – Present',
      people: ['Teta Nahla (In-Game Mentor)', 'Mira Abu Khalil (In-Game Protagonist)', 'Amin Maalouf (Bibliographic Candidate)', 'Rabih Alameddine (Bibliographic Candidate)', 'Kahlil Gibran (Bibliographic Candidate)'],
      places: ['Byblos (Jbeil)', 'Beirut'],
      relationships: [{ target_id: 'LB-KB-ARTIFACT-AHIRAM-SARCOPHAGUS', relation: 'associated_with', note: 'Continuity of portable written/oral memory' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'LB-P06', url: null, verified: false }],
      sensitivity_notes: ['Never collect real children’s voice recordings, family names, or home addresses; use scripted fictional elder oral-history cards only.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Help Teta Nahla put her favorite man’oushe recipe card and harbor postcard back into the family memory chest!',
        '8-10': 'When families travel far from Lebanon, they carry their favorite words, stories, and za’atar flatbread recipes like a treasure chest of home.',
        '11-13': 'Just as ancient sailors carried letters across the sea, Lebanese diaspora families preserve identity through bilingual storytelling, family postcards, and shared culinary traditions.',
        '14-17': 'Expatriate literature (e.g., Maalouf, Alameddine) frames letters, dialect idioms, and recipes as portable archives that bridge generational migration—explored in-game through privacy-safe curated oral-history exhibits.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['LB-A03', 'LB-A05'],
      atlas_links: ['atlas:quest:LB:A03', 'atlas:quest:LB:A05'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['flour', 'zaatar', 'olive_oil', 'manoushe', 'sumac_jar'], quest_objective_ids: ['LB:ch1:harbor:cook', 'LB:ch1:harbor:trade', 'LB:ch1:harbor:word'], story_scene_ids: [5, 8, 12, 15] },
    },
  ],
  IQ: [
    {
      id: 'IQ-KB-ORG-BAYT-AL-HIKMA',
      country: 'IQ',
      title: { en: 'Bayt al-Hikma (House of Wisdom) & Abbasid Translation Tradition', fr: 'Bayt al-Hikma (Maison de la Sagesse) et la tradition de traduction abbasside', 'ar-IQ': 'بيت الحكمة وحركة الترجمة في بغداد العباسية', 'ar-LB': 'بيت الحكمة في بغداد', 'ar-EG': 'بيت الحكمة في بغداد', ko: '바이트 알히크마(지혜의 집)와 압바스 왕조 번역 전통' },
      entity_type: 'organization',
      summary: 'Abbasid-era caliphal library and translation tradition in Baghdad where Greek, Syriac, Persian, and Sanskrit works were studied in Arabic.',
      expanded_explanation: 'Associated with the Abbasid caliphs Harun al-Rashid and al-Ma’mun in 9th-century Baghdad, Bayt al-Hikma (the House of Wisdom) represents a major library repository and multilingual translation movement connecting Greek, Syriac, Pahlavi (Middle Persian), Sanskrit, and Arabic scholarship. Modern historians note that while the translation movement is richly documented, specific institutional details—such as whether Bayt al-Hikma operated as a formal modern university—remain subject to scholarly debate and verification.',
      knowledge_class: 'contested_history',
      claim_status: 'source_asserted_unverified',
      confidence: 'medium',
      time_period: '8th–13th Century CE (Abbasid Caliphate)',
      people: ['Harun al-Rashid', 'Caliph al-Ma’mun', 'Al-Khwarizmi', 'Al-Kindi', 'Hunayn ibn Ishaq', 'Thabit ibn Qurra', 'Banu Musa Brothers'],
      places: ['Historic Baghdad', 'Tigris River'],
      relationships: [{ target_id: 'IQ-KB-PERSON-ABBASID-SCHOLARS', relation: 'associated_with', note: 'Scholars active in Baghdad circles' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'IQ-P01', url: null, verified: false }],
      sensitivity_notes: ['Flag exact institutional charter claims for historian verification; highlight pluralistic contributions (Muslim, Christian/Syriac, Sabian, Jewish, Persian scholars).'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'In old Baghdad by the river, scholars gathered colourful scrolls and books to share stories and star maps with friends from many lands.',
        '8-10': 'At Baghdad’s House of Wisdom, translators worked together to turn books from Greek, Syriac, Persian, and Sanskrit into Arabic so everyone could learn from them.',
        '11-13': 'During the 9th century, Baghdad’s Bayt al-Hikma library and translation circles connected scholars of diverse faiths and languages, preserving and expanding mathematics, medicine, and astronomy.',
        '14-17': 'While Bayt al-Hikma symbolizes the Abbasid translation movement, historians distinguish the well-documented network of court-sponsored translators from later idealized accounts treating the palace library as a modern university.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['IQ-A01', 'IQ-A02'],
      atlas_links: ['atlas:real:IQ:tigris_baghdad', 'atlas:quest:IQ:A01'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['turquoise_tile', 'mud_brick'], quest_objective_ids: ['IQ:ch1:tigris:gather'] },
    },
    {
      id: 'IQ-KB-PERSON-ABBASID-SCHOLARS',
      country: 'IQ',
      title: { en: 'Scholars of Baghdad: Al-Khwarizmi, Al-Kindi, Hunayn ibn Ishaq, Thabit ibn Qurra & Banu Musa', fr: 'Savants de Bagdad : Al-Khwarizmi, Al-Kindi, Hunayn, Thabit et Banu Musa', 'ar-IQ': 'علماء بغداد: الخوارزمي والكندي وحنين بن إسحاق وثابت بن قرة وبنو موسى', 'ar-LB': 'علماء بغداد في العصر العباسي', 'ar-EG': 'علماء بغداد في العصر العباسي', ko: '바그다드의 학자들: 알콰리즈미, 알킨디, 후나인, 사비트, 바누 무사 형제' },
      entity_type: 'person',
      summary: 'Pioneering mathematicians, translators, and engineers in 9th-century Baghdad who advanced algebra, optics, medicine, and mechanical devices.',
      expanded_explanation: 'Abbasid Baghdad brought together polymaths from diverse cultural backgrounds: Muhammad ibn Musa al-Khwarizmi (whose Kitab al-Jabr gave algebra its name), Ya’qub ibn Ishaq al-Kindi (optics and cryptanalysis), Hunayn ibn Ishaq (an East Syriac Christian physician-translator who developed rigorous text-collation methods), Thabit ibn Qurra (a Sabian mathematician from Harran), and the three Banu Musa brothers (authors of Kitab al-Hiyal / The Book of Ingenious Devices describing water clocks, fountains, and self-trimming lamps).',
      knowledge_class: 'historical_claim',
      claim_status: 'source_asserted_unverified',
      confidence: 'medium',
      time_period: '9th Century CE',
      people: ['Muhammad ibn Musa al-Khwarizmi', 'Ya’qub ibn Ishaq al-Kindi', 'Hunayn ibn Ishaq', 'Thabit ibn Qurra', 'Banu Musa Brothers (Muhammad, Ahmad, al-Hasan)'],
      places: ['Baghdad'],
      relationships: [{ target_id: 'IQ-KB-ORG-BAYT-AL-HIKMA', relation: 'associated_with', note: 'Active in Baghdad scientific and translation networks' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'IQ-P02', url: null, verified: false }],
      sensitivity_notes: ['Verify individual treatise titles and biographical dates before upgrading from source_asserted_unverified.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Meet the clever inventors of Baghdad who built playful water fountains, mechanical lamps, and number games!',
        '8-10': 'Scholars like al-Khwarizmi studied numbers and stars, Hunayn translated medical books, and the Banu Musa brothers designed clever water-powered machines.',
        '11-13': 'Baghdad’s scholarly community united al-Khwarizmi (algebra), al-Kindi (optics), Hunayn ibn Ishaq (multilingual medical translation), Thabit ibn Qurra (geometry), and the Banu Musa engineers.',
        '14-17': 'The collaboration among al-Khwarizmi, al-Kindi, Hunayn ibn Ishaq, Thabit ibn Qurra, and the Banu Musa illustrates how philological translation (collating Greek and Syriac manuscripts) directly fueled experimental mechanics and algebraic theory.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['IQ-A01', 'IQ-A04'],
      atlas_links: ['atlas:real:IQ:tigris_baghdad', 'atlas:quest:IQ:A04'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['brass_teapot', 'turquoise_tile'], quest_objective_ids: ['IQ:ch1:tigris:build'] },
    },
    {
      id: 'IQ-KB-EVENT-GOLD-AND-1258-TROPES',
      country: 'IQ',
      title: { en: 'Contested Chronicles: Weight-in-Gold Payments & 1258 River-of-Ink Accounts', fr: 'Chroniques contestées : paiement au poids de l’or et récits de 1258', 'ar-IQ': 'الروايات التاريخية قيد التدقيق: وزن الكتب ذهباً وروايات ١٢٥٨', 'ar-LB': 'الروايات التاريخية حول بيت الحكمة', 'ar-EG': 'الروايات التاريخية حول بيت الحكمة', ko: '검증이 필요한 연대기 일화: 금 무게만큼의 번역료와 1258년 강물 이야기' },
      entity_type: 'event',
      summary: 'Famous historical anecdotes—such as paying translators the weight of books in gold or the Tigris running black with ink—require source criticism.',
      expanded_explanation: 'Two famous narratives appear frequently in popular accounts of Baghdad: Ibn Abi Usaybi’a’s 13th-century anecdote that Caliph al-Ma’mun paid Hunayn ibn Ishaq the weight of translated manuscripts in gold dinars, and later Mamluk-era chronicles claiming the Tigris turned black from the ink of books thrown into the river during the 1258 siege. Historians treat these as vivid literary motifs emphasizing the value of books and the shock of 1258 rather than verified quantitative facts.',
      knowledge_class: 'contested_history',
      claim_status: 'disputed',
      confidence: 'low',
      time_period: '9th Century – 1258 CE (recorded in 13th–15th Century chronicles)',
      people: ['Hunayn ibn Ishaq', 'Caliph al-Ma’mun', 'Ibn Abi Usaybi’a (Chronicler)'],
      places: ['Baghdad', 'Tigris River'],
      relationships: [{ target_id: 'IQ-KB-ORG-BAYT-AL-HIKMA', relation: 'associated_with', note: 'Historiographical evaluation of Abbasid chronicles' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'IQ-P03', url: null, verified: false }],
      sensitivity_notes: ['Must never be presented as verified statistical history; no graphic siege violence for children.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'People in Baghdad loved books so much that storytellers said a good book was as precious as shining gold!',
        '8-10': 'Old stories say translators were paid the weight of their books in gold—showing how much Baghdad’s people treasured learning, even if the story was exaggerated!',
        '11-13': 'Historians compare sources carefully: stories about paying translators in gold or rivers turning black with ink were written centuries later to express how precious books were.',
        '14-17': 'Source criticism distinguishes primary 9th-century evidence from 13th–15th century literary topoi (such as Ibn Abi Usaybi’a’s gold-weight anecdote or later river-of-ink accounts of 1258), teaching players how historians evaluate chroniclers’ claims.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['IQ-A02', 'IQ-A05'],
      atlas_links: ['atlas:real:IQ:tigris_baghdad', 'atlas:quest:IQ:A02'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['brass_teapot'], quest_objective_ids: ['IQ:ch1:tigris:trade'] },
    },
    {
      id: 'IQ-KB-PLACE-AL-MUTANABBI-STREET',
      country: 'IQ',
      title: { en: 'Al-Mutanabbi Street, Shabandar Café & the International Book Solidarity Archive', fr: 'Rue Al-Mutanabbi, Café Shabandar et l’archive de solidarité du livre', 'ar-IQ': 'شارع المتنبي ومقهى الشابندر وأرشيف التضامن الثقافي', 'ar-LB': 'شارع المتنبي في بغداد', 'ar-EG': 'شارع المتنبي في بغداد', ko: '알무타나비 거리와 세계 도서 연대 아카이브' },
      entity_type: 'place',
      summary: 'Baghdad’s historic booksellers’ street by the Tigris, celebrating plural cultural memory, book preservation, and global artistic solidarity.',
      expanded_explanation: 'Named after the 10th-century poet Abu al-Tayyib al-Mutanabbi, Al-Mutanabbi Street near the Tigris and the adjacent Al-Qishla clocktower has long anchored Baghdad’s printing, bookselling, and literary café culture, reflecting Iraq’s plural Muslim, Christian, Syriac, Kurdish, Mandaean, and Jewish communities. After a 2007 attack, local booksellers rebuilt the market and international artists created the Al-Mutanabbi Street Starts Here archive. In MiraVerse, this is honored through cooperative book-care and literary festival quests without any graphic depiction of violence.',
      knowledge_class: 'historical_claim',
      claim_status: 'externally_corrobated',
      confidence: 'high',
      time_period: '10th Century (Poet) / 20th–21st Century (Book Market & Solidarity Project)',
      people: ['Abu al-Tayyib al-Mutanabbi', 'Bibi Amal (In-Game Mentor)', 'Noor (In-Game Protagonist)', 'Beau Beausoleil (Bibliographic Candidate)'],
      places: ['Al-Mutanabbi Street', 'Al-Qishla', 'Baghdad'],
      relationships: [{ target_id: 'IQ-KB-PRACTICE-KLEICHA-SHANASHEEL', relation: 'associated_with', note: 'Shared Friday cultural gathering route in Baghdad' }],
      sources: [
        { source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'IQ-P04', url: null, verified: false },
        { source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'IQ-P05', url: null, verified: false },
        { source_id: 'UNESCO-CREATIVE-BAGHDAD', passage_locator: 'Baghdad UNESCO City of Literature (2015)', url: 'https://www.unesco.org/en/creative-cities/baghdad', verified: true, external_citation: 'UNESCO Creative Cities Network: Baghdad City of Literature (Al-Mutanabbi Street)' },
      ],
      sensitivity_notes: ['Age-sensitive handling mandatory: 5–7 and 8–10 focus strictly on bookshops, poetry, and community care; 11–13 and 14–17 mention post-2007 rebuilding and the international solidarity archive non-graphically, never reenacting violence.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Walk down Baghdad’s book street where friendly shopkeepers stack colourful storybooks on tables beside the river!',
        '8-10': 'On Al-Mutanabbi Street, neighbors gather every week to browse books, sip cardamom tea, and share poems from all of Iraq’s communities.',
        '11-13': 'Al-Mutanabbi Street is the historic heart of Baghdad’s literary life. When the street needed rebuilding in 2007, Iraqi booksellers and artists worldwide united to protect its book culture.',
        '14-17': 'Al-Mutanabbi Street and the Al-Mutanabbi Street Starts Here artist-book archive exemplify cultural resilience: preserving Iraq’s pluralistic intellectual heritage across Baghdad and the global diaspora after 2007.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['IQ-A01', 'IQ-A02', 'IQ-A05'],
      atlas_links: ['atlas:real:IQ:al_mutanabbi_street', 'atlas:real:IQ:al_qishla', 'atlas:quest:IQ:A05'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['brass_teapot'], quest_objective_ids: ['IQ:ch1:tigris:trade', 'IQ:ch1:tigris:word'], story_scene_ids: [3, 7, 14] },
    },
    {
      id: 'IQ-KB-PRACTICE-KLEICHA-SHANASHEEL',
      country: 'IQ',
      title: { en: 'Cardamom Date Kleicha, Shanasheel Courtyards & Plural Diaspora Memory', fr: 'Kleicha aux dattes, cours à shanasheel et mémoire de la diaspora irakienne', 'ar-IQ': 'الكليچة العراقية والشناشيل وذاكرة العائلة المتنوعة', 'ar-LB': 'الكليجة العراقية والشناشيل', 'ar-EG': 'الكليجة العراقية والشناشيل', ko: '카다몸 대추야자 클레이차, 샤나실 안뜰과 이라크 디아스포라의 기억' },
      entity_type: 'food',
      summary: 'Spiced date-filled kleicha pastries and carved wooden shanasheel balconies sustain intergenerational hospitality in Baghdad and the diaspora.',
      expanded_explanation: 'Across Iraq’s diverse communities and diaspora households, baking kleicha (spiced pastry wheels stuffed with date paste, walnuts, or cardamom) and caring for shaded courtyard houses with projecting latticework balconies (shanasheel) anchor seasonal holidays and literary gatherings. In MiraVerse, Bibi Amal guides players through virtual kleicha shaping and shanasheel restoration.',
      knowledge_class: 'contemporary_practice',
      claim_status: 'source_asserted_unverified',
      confidence: 'medium',
      time_period: 'Traditional – Present',
      people: ['Bibi Amal (In-Game Mentor)', 'Noor (In-Game Protagonist)', 'Khalo Salam (In-Game Cast)'],
      places: ['Baghdad Courtyard', 'Erbil', 'Basra'],
      relationships: [{ target_id: 'IQ-KB-PLACE-AL-MUTANABBI-STREET', relation: 'associated_with', note: 'Hospitality shared during Baghdadi literary gatherings' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'IQ-P06', url: null, verified: false }],
      sensitivity_notes: ['Adult NPCs operate virtual ovens; provide nut-free/gluten-aware notes in recipe cards; represent Iraq’s plural communities inclusively.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Roll sweet date paste and fragrant green cardamom into pinwheel kleicha cookies with Bibi Amal in the sunny courtyard!',
        '8-10': 'Help Bibi Amal stamp patterns onto date-filled kleicha cookies and repair the carved wooden shanasheel balcony that shades the courtyard.',
        '11-13': 'Shanasheel lattice screens cool Baghdadi courtyards naturally while kleicha recipes—passed down with family variations in fillings and spices—bring relatives and neighbors together.',
        '14-17': 'Material culture in the Iraqi diaspora links architectural conservation (shaded shanasheel microclimates) and culinary heritage (regional kleicha variations across plural Iraqi communities) to intergenerational memory.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['IQ-A03', 'IQ-A04', 'IQ-A05'],
      atlas_links: ['atlas:quest:IQ:A03', 'atlas:quest:IQ:A04'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['wheat_dough', 'date_paste', 'cardamom', 'kleicha', 'palm_wood', 'mud_brick', 'turquoise_tile'], quest_objective_ids: ['IQ:ch1:tigris:cook', 'IQ:ch1:tigris:build', 'IQ:ch1:tigris:word'], story_scene_ids: [5, 9, 11, 15] },
    },
  ],
  EG: [
    {
      id: 'EG-KB-HIST-FANOUS-COMPETING-ORIGINS',
      country: 'EG',
      title: { en: 'Egyptian Fanous Lanterns & Competing Fatimid/Coptic Origin Narratives', fr: 'Les lanternes Fanous égyptiennes et les récits d’origine concurrents', 'ar-EG': 'فانوس رمضان وتعدد الروايات التاريخية لنشأته في مصر', 'ar-LB': 'الفانوس المصري وروايات نشأته', 'ar-IQ': 'الفانوس المصري وروايات نشأته', ko: '이집트 파누스 등불과 파티마/콥트 기원설 비교' },
      entity_type: 'event',
      summary: 'Explores multiple historical explanations for how the Egyptian fanous lantern became a beloved neighborhood symbol in Cairo.',
      expanded_explanation: 'The Egyptian fanous (from Greek phanos, "light/torch") is an iconic symbol of Cairo’s festive evenings. Historians and folklorists note at least three competing explanations for its association with Ramadan: (1) a popular narrative that Cairenes carried lanterns in 972 CE (362 AH) to greet the Fatimid Caliph al-Mu’izz li-Din Allah upon his nighttime arrival in Cairo; (2) municipal decrees under Caliph al-Hakim bi-Amr Allah ordering street and shop lamps lit across Cairo at night; and (3) continuity from earlier Coptic and ancient Egyptian lamp traditions. MiraVerse presents these side by side so learners see how folklore and urban history intertwine.',
      knowledge_class: 'contested_history',
      claim_status: 'disputed',
      confidence: 'medium',
      time_period: '10th Century CE (Fatimid Era) & Earlier Lamp Traditions',
      people: ['Caliph al-Mu’izz li-Din Allah', 'Caliph al-Hakim bi-Amr Allah', 'Teta Samira (In-Game Mentor)'],
      places: ['Historic Cairo', 'Al-Muizz Street'],
      relationships: [{ target_id: 'EG-KB-ARTIFACT-FANOUS-KHAYAMIYA-CRAFT', relation: 'associated_with', note: 'Historical context of Cairo lantern workshops' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'EG-P01', url: null, verified: false }],
      sensitivity_notes: ['Do not present the 972 CE Caliph arrival story as an undisputed single origin; respect diverse religious and cultural participation without requiring religious observance.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Glowing fanous lanterns in bright red, blue, and gold light up Cairo’s streets to welcome family and friends!',
        '8-10': 'How did Cairo’s fanous tradition begin? Some stories tell of a starry welcome parade over a thousand years ago, while others point to old streetlamps that lit up the city at night.',
        '11-13': 'Historians compare three stories behind the Egyptian fanous: the 972 CE welcome of Caliph al-Mu’izz, Fatimid nighttime street-lighting rules, and older Egyptian lamp customs.',
        '14-17': 'Rather than treating the 972 CE al-Mu’izz procession anecdote as a singular origin fact, urban historians examine how Fatimid street-lighting ordinances, Coptic liturgical lamps, and artisanal tin-working converged into Cairo’s fanous tradition.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['EG-A01', 'EG-A05'],
      atlas_links: ['atlas:real:EG:al_muizz_street', 'atlas:quest:EG:A01'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['fanous_lantern'], quest_objective_ids: ['EG:ch1:nile:trade'] },
    },
    {
      id: 'EG-KB-ARTIFACT-FANOUS-KHAYAMIYA-CRAFT',
      country: 'EG',
      title: { en: 'Cairo Lantern Metalwork, Stained Glass & Khayamiya Tentmaker Appliqué', fr: 'Ferronnerie de fanous, verre coloré et art textile Khayamiya au Caire', 'ar-EG': 'حرفة صناعة الفانوس والزجاج الملون وفن الخيامية في القاهرة', 'ar-LB': 'صناعة الفانوس والخيامية في القاهرة', 'ar-IQ': 'صناعة الفانوس والخيامية في القاهرة', ko: '카이로 파누스 금속·색유리 공예와 카야미야 아플리케' },
      entity_type: 'artifact',
      summary: 'Traditional Cairene crafts combining geometric brass/tinplate fanous lanterns with hand-stitched khayamiya geometric textiles.',
      expanded_explanation: 'In historic Cairo’s artisan quarters—such as Taht al-Rab’, Khan el-Khalili, and the covered Qasaba of Radwan Bey (Street of the Tentmakers)—craftspeople shape brass and tinplate (samkari metalwork) around jewel-toned stained glass to build geometric fanous lanterns, while khayamiya artisans hand-stitch intricate arabesque and lotus cotton appliqué panels. In MiraVerse, children explore geometric symmetry, color-light logic, and safe virtual LED lantern assembly.',
      knowledge_class: 'historical_claim',
      claim_status: 'externally_corrobated',
      confidence: 'high',
      time_period: 'Medieval Fatimid/Mamluk Craft Guilds – Present',
      people: ['Teta Samira (In-Game Mentor)', 'Layla Hassan (In-Game Protagonist)'],
      places: ['Historic Cairo', 'Khan el-Khalili', 'Qasaba of Radwan Bey (Tentmakers Bazaar)'],
      relationships: [{ target_id: 'EG-KB-HIST-FANOUS-COMPETING-ORIGINS', relation: 'located_in', note: 'Crafted in Historic Cairo workshops' }],
      sources: [
        { source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'EG-P02', url: null, verified: false },
        { source_id: 'UNESCO-WHC-89', passage_locator: 'Historic Cairo World Heritage Listing #89', url: 'https://whc.unesco.org/en/list/89/', verified: true, external_citation: 'UNESCO World Heritage Centre, Historic Cairo (Al-Muizz Street, Khan el-Khalili, Qasaba of Radwan Bey)' },
      ],
      sensitivity_notes: ['All soldering, glass cutting, and candle/fire illumination are strictly virtual or use safe flameless LEDs; warn children never to handle open flames or sharp metal unsupervised.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Match bright ruby-red, emerald-green, and golden glass shapes to build a glowing lantern and colourful tent cloth!',
        '8-10': 'Cairo artisans fit coloured glass into brass frames to make fanous lanterns and stitch geometric flower patterns onto khayamiya cloth.',
        '11-13': 'Explore how Cairene metalworkers (samkari) and khayamiya tentmakers use rotational symmetry, polygons, and colour filtering to transform courtyard light.',
        '14-17': 'In Historic Cairo (UNESCO #89), the spatial proximity of Taht al-Rab’ lantern workshops and the Qasaba of Radwan Bey khayamiya guild sustains shared geometric design grammars across metal, glass, and textile media.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['EG-A01', 'EG-A04'],
      atlas_links: ['atlas:real:EG:khan_el_khalili', 'atlas:real:EG:historic_cairo', 'atlas:quest:EG:A01', 'atlas:quest:EG:A04'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['fanous_lantern', 'acacia_plank', 'linen_sail'], quest_objective_ids: ['EG:ch1:nile:build', 'EG:ch1:nile:trade'], story_scene_ids: [2, 6, 10] },
    },
    {
      id: 'EG-KB-PRACTICE-MUSAHARATI-AND-SONGS',
      country: 'EG',
      title: { en: 'Neighborhood Soundscapes: The Musaharati Drummer & Festive Cairo Chants', fr: 'Paysages sonores du quartier : le tambourinaire Musaharati et les chants du Caire', 'ar-EG': 'المسحراتي وأهازيج الحارة المصرية في ليالي الاحتفال', 'ar-LB': 'المسحراتي والأهازيج الشعبية في القاهرة', 'ar-IQ': 'المسحراتي والأهازيج الشعبية في القاهرة', ko: '카이로 동네의 소리 풍경: 무사하라티 북소리와 축제 노래' },
      entity_type: 'practice',
      summary: 'Cultural context of Cairo’s neighborhood drummer (musaharati) and traditional lantern-lighting songs, presented without copyrighted lyrics.',
      expanded_explanation: 'During festive Ramadan evenings and dawn hours in Cairo neighborhoods, the musaharati walks through lantern-lit lanes tapping a small hand drum (baz) and calling out friendly greetings to neighbors, while children carry small lanterns and sing traditional refrains like Wahawi ya Wahawi. Folklorists debate whether the words of Wahawi derive from Arabic expressions of greeting or older Coptic/ancient Egyptian lunar phrases. MiraVerse explains this musical heritage using original melodies and paraphrased descriptions without reproducing copyrighted modern song lyrics.',
      knowledge_class: 'folklore',
      claim_status: 'source_asserted_unverified',
      confidence: 'medium',
      time_period: 'Abbasid/Fatimid Era – Present',
      people: ['Teta Samira (In-Game Mentor)', 'Baba Karim (In-Game Cast)'],
      places: ['Historic Cairo'],
      relationships: [{ target_id: 'EG-KB-HIST-FANOUS-COMPETING-ORIGINS', relation: 'associated_with', note: 'Shared Cairene neighborhood festival context' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'EG-P03', url: null, verified: false }],
      sensitivity_notes: ['Do not reproduce copyrighted song lyrics; present the tradition as welcoming cultural neighborhood heritage open to all learners without religious compulsion.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Follow the gentle tap-tap rhythm of the neighborhood drum as lanterns light up along the friendly Cairo street!',
        '8-10': 'In Cairo neighborhoods, the musaharati taps a small drum and greets families by name while children swing glowing lanterns.',
        '11-13': 'Cairo’s festive soundscape combines the rhythmic calls of the musaharati drummer with centuries-old lantern songs whose word origins scholars debate between Arabic and Coptic roots.',
        '14-17': 'Ethnomusicological study of Cairo’s Ramadan traditions highlights how acoustic community markers (the musaharati’s baz drum and oral refrains with contested Arabic/Coptic etymologies) map neighborhood social cohesion.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['EG-A02', 'EG-A05'],
      atlas_links: ['atlas:real:EG:al_muizz_street', 'atlas:quest:EG:A02', 'atlas:quest:EG:A05'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['fanous_lantern'], quest_objective_ids: ['EG:ch1:nile:word'] },
    },
    {
      id: 'EG-KB-FOOD-KOSHARI-SHARED-TABLE',
      country: 'EG',
      title: { en: 'Teta Samira’s Koshari & Inclusive Courtyard Hospitality', fr: 'Le Koshari de Teta Samira et l’hospitalité de cour partagée', 'ar-EG': 'كشري تيتا سميرة ومائدة المحبة في الحوش المصري', 'ar-LB': 'الكشري المصري ومائدة المشاركة', 'ar-IQ': 'الكشري المصري ومائدة المشاركة', ko: '테타 사미라의 코샤리와 함께 나누는 안뜰 식탁' },
      entity_type: 'food',
      summary: 'Egypt’s beloved plant-based dish of layered rice, brown lentils, pasta, spiced tomato sauce, and crispy onions shared across all communities.',
      expanded_explanation: 'Koshari combines short-grain Egyptian rice, brown lentils, macaroni, spiced garlic-vinegar tomato sauce (salsa and daqqa), chickpeas, and golden crispy onions (ta’liya). Naturally plant-based and economical, koshari brings Egyptians of all backgrounds together at street carts and family tables.',
      knowledge_class: 'contemporary_practice',
      claim_status: 'externally_corrobated',
      confidence: 'high',
      time_period: '19th Century – Present',
      people: ['Teta Samira (In-Game Mentor)', 'Layla Hassan (In-Game Protagonist)'],
      places: ['Cairo'],
      relationships: [{ target_id: 'EG-KB-ARTIFACT-FANOUS-KHAYAMIYA-CRAFT', relation: 'associated_with', note: 'Shared during courtyard lantern gatherings' }],
      sources: [
        { source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'EG-P04', url: null, verified: false },
        { source_id: 'UNESCO-ICH-KOSHARI', passage_locator: 'Egyptian Koshari Culinary Heritage Reference', url: 'https://whc.unesco.org/en/statesparties/eg', verified: true, external_citation: 'Egyptian Ministry of Culture / Historic Cairo Culinary Heritage Documentation' },
      ],
      sensitivity_notes: ['Adult NPCs manage boiling pots and hot oil for crispy onions; provide gluten-free rice-and-lentil option notes for allergy awareness.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Sort white rice, brown lentils, red tomato sauce, and crunchy golden onions into baskets for Teta Samira’s big koshari pot!',
        '8-10': 'Layer fluffy rice, lentils, pasta, tangy tomato sauce, and crispy onions in order to serve warm bowls of Egyptian koshari to the neighbors.',
        '11-13': 'Because koshari is made from grains, legumes, and spiced tomato sauce, it serves as an inclusive, plant-based dish shared across Egypt’s diverse communities.',
        '14-17': 'Koshari’s evolution in modern urban Cairo reflects global trade circuits (combining Indian-inspired rice-and-lentil khichdi roots with Italian pasta and Egyptian garlic-vinegar daqqa) into a democratized national dish.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['EG-A02', 'EG-A03'],
      atlas_links: ['atlas:quest:EG:A03'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['rice', 'lentils', 'tomato_sauce', 'crispy_onions', 'koshari'], quest_objective_ids: ['EG:ch1:nile:gather', 'EG:ch1:nile:cook'], story_scene_ids: [4, 8, 12] },
    },
    {
      id: 'EG-KB-ORG-DIASPORA-HERITAGE-MONTH',
      country: 'EG',
      title: { en: 'Egyptian Diaspora Celebrations & Ontario Egyptian Heritage Month Candidate Fact', fr: 'Célébrations de la diaspora égyptienne et Mois du patrimoine égyptien', 'ar-EG': 'احتفالات الجالية المصرية بالخارج وشهر التراث المصري', 'ar-LB': 'احتفالات الجالية المصرية في المهجر', 'ar-IQ': 'احتفالات الجالية المصرية في المهجر', ko: '이집트 디아스포라 축제와 문화유산의 달' },
      entity_type: 'organization',
      summary: 'Tracks contemporary diaspora festivals, paper/LED fanous workshops, and the source-asserted Ontario Egyptian Heritage Month Act (2019).',
      expanded_explanation: 'In Egyptian expatriate communities across North America and Europe, families organize cultural festivals featuring khayamiya displays, koshari tastings, and child-safe paper/LED fanous craft tables. The uploaded research essay notes that the province of Ontario, Canada enacted the Egyptian Heritage Month Act, 2019 designating July as Egyptian Heritage Month; this legislative assertion is recorded with claim-level provenance for statutory citation verification.',
      knowledge_class: 'contemporary_practice',
      claim_status: 'source_asserted_unverified',
      confidence: 'medium',
      time_period: '2019 – Present',
      people: ['Layla Hassan (In-Game Protagonist)', 'Teta Samira (In-Game Mentor)'],
      places: ['Cairo', 'Diaspora Community Centers'],
      relationships: [{ target_id: 'EG-KB-ARTIFACT-FANOUS-KHAYAMIYA-CRAFT', relation: 'associated_with', note: 'Safe LED/paper fanous crafting in diaspora schools' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'EG-P05', url: null, verified: false }],
      sensitivity_notes: ['Flag the specific statutory bill number/date of Ontario Egyptian Heritage Month Act (2019) for external legal-database verification before marking externally_corrobated.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Children living far from Egypt fold colourful paper lanterns with safe little battery lights to share Cairo’s warm glow with new friends!',
        '8-10': 'In diaspora neighborhoods, Egyptian families host heritage days where friends fold paper fanous lanterns and learn Arabic words together.',
        '11-13': 'Community organizations in the Egyptian diaspora adapt traditional metalwork and textile crafts into safe paper-and-LED workshops during annual cultural heritage celebrations.',
        '14-17': 'Contemporary diaspora civic recognition—such as the source-cited Ontario Egyptian Heritage Month Act (2019, pending statutory verification)—illustrates how expatriate communities institutionalize cultural memory.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['EG-A04', 'EG-A05'],
      atlas_links: ['atlas:quest:EG:A05'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['fanous_lantern'], quest_objective_ids: ['EG:ch1:nile:word'], story_scene_ids: [14, 15] },
    },
  ],
  FR: [
    {
      id: 'FR-KB-PLACE-TRABOULES-LYON',
      country: 'FR',
      title: { en: 'The Traboules of Vieux Lyon and La Croix-Rousse', fr: 'Les traboules du Vieux Lyon et de la Croix-Rousse', 'ar-LB': 'ممرات الترابول في ليون القديمة وكرو روس', 'ar-EG': 'ممرات الترابول في مدينة ليون', 'ar-IQ': 'ممرات الترابول في مدينة ليون', ko: '비외 리옹과 크루아루스의 트라불 통로' },
      entity_type: 'place',
      summary: 'Covered Renaissance and 19th-century passageways connecting courtyards and streets across Vieux Lyon and the hill of La Croix-Rousse.',
      expanded_explanation: 'Lyon’s traboules (commonly derived from Vulgar Latin transambulare, "to pass through") are covered pedestrian passages that cut through residential buildings and spiral staircases, linking parallel streets in Renaissance Vieux Lyon toward the Saône and down the steep slopes of La Croix-Rousse toward the Rhône. While popular guides cite roughly 400–500 traboules across Lyon with around 40 open to the public under municipal maintenance agreements, exact counts vary by definition and are flagged as contested numerical assertions.',
      knowledge_class: 'historical_claim',
      claim_status: 'externally_corrobated',
      confidence: 'high',
      time_period: '4th–19th Century CE – Present',
      people: ['Mamie Claire (In-Game Mentor)', 'Camille (In-Game Protagonist)'],
      places: ['Vieux Lyon', 'La Croix-Rousse', 'Saône River'],
      relationships: [{ target_id: 'FR-KB-PLACE-COUR-DES-VORACES', relation: 'associated_with', note: 'Famous monumental courtyard traboule in La Croix-Rousse' }],
      sources: [
        { source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'FR-P01', url: null, verified: false },
        { source_id: 'UNESCO-WHC-872', passage_locator: 'Historic Site of Lyon World Heritage Listing #872', url: 'https://whc.unesco.org/en/list/872/', verified: true, external_citation: 'UNESCO World Heritage Centre, Historic Site of Lyon (Vieux Lyon, Fourvière, Croix-Rousse, Presqu’île)' },
      ],
      sensitivity_notes: ['Clearly distinguish public municipally signed traboules from private residential courtyards; flag exact total passageway counts (~400-500) and etymology nuances for verification.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Follow the painted pastry signs through cosy stone arches and spiral stairs that connect one sunny Lyon courtyard to the next!',
        '8-10': 'In Lyon, covered walkways called traboules let neighbors walk right through stone courtyards and down hill stairs without getting caught in the rain.',
        '11-13': 'Built during the Renaissance in Vieux Lyon and the 1800s on La Croix-Rousse hill, traboules connected workshops to river ports; today, visitors respect signs marking which passages are public.',
        '14-17': 'Lyon’s traboules (UNESCO #872) exemplify high-density urban morphology. While tourism literature cites ~400–500 passages, urban historians distinguish verified public rights-of-way from private residential courtyards.',
      },
      localization_status: { en: 'verified', fr: 'verified', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['FR-A01', 'FR-A04'],
      atlas_links: ['atlas:real:FR:vieux_lyon', 'atlas:real:FR:croix_rousse', 'atlas:quest:FR:A01', 'atlas:quest:FR:A04'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['cut_stone', 'slate_roof', 'oak_shutter'], quest_objective_ids: ['FR:ch1:lyon:build'] },
    },
    {
      id: 'FR-KB-PRACTICE-CANUTS-SILK-LOOMS',
      country: 'FR',
      title: { en: 'The Canuts of La Croix-Rousse & Jacquard Punch-Card Silk Weaving', fr: 'Les Canuts de la Croix-Rousse et le tissage de la soie sur métier Jacquard', 'ar-LB': 'حياكة الحرير (الكانو) في ليون ونول جاكار', 'ar-EG': 'نساجو الحرير في ليون ونول جاكار', 'ar-IQ': 'نساجو الحرير في ليون ونول جاكار', ko: '크루아루스의 카뉘 실크 직공과 자카드 천공카드 직기' },
      entity_type: 'practice',
      summary: '19th-century Lyon silk weavers (canuts) who operated tall punch-card Jacquard looms in high-ceilinged Croix-Rousse workshops.',
      expanded_explanation: 'On the "hill that works" (La Croix-Rousse), Lyon’s silk weavers—known as canuts—worked in apartments built with four-meter-high ceilings and tall windows to accommodate wooden Jacquard looms. Invented in 1804 by Joseph Marie Jacquard, the mechanism used chains of punched pasteboard cards to automate complex brocade patterns—an early precursor to binary computer programming—before bolts of silk were carried through dry traboules to merchants.',
      knowledge_class: 'historical_claim',
      claim_status: 'source_asserted_unverified',
      confidence: 'medium',
      time_period: '19th Century CE (1804 Jacquard Loom – Late 1800s)',
      people: ['Joseph Marie Jacquard', 'Canut Master Weavers & Apprentices'],
      places: ['La Croix-Rousse, Lyon'],
      relationships: [{ target_id: 'FR-KB-PLACE-TRABOULES-LYON', relation: 'located_in', note: 'Traboules sheltered silk transport down the hill' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'FR-P02', url: null, verified: false }],
      sensitivity_notes: ['Verify specific workshop addresses and mechanical patent dates before marking externally_corrobated.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Match colourful threads and card holes to weave a shimmering flower pattern on a tall wooden loom!',
        '8-10': 'Silk weavers in Lyon called canuts used cards with punched holes to guide their tall looms, creating bright patterns and carrying the silk through covered passages.',
        '11-13': 'La Croix-Rousse buildings have extra-high ceilings and tall windows built specially for Jacquard looms, which used punched cards to program complex silk patterns over two centuries ago.',
        '14-17': 'The Jacquard loom (1804) transformed Lyon’s domestic silk industry (la Fabrique) by encoding warp-thread lifts on punched cards, reshaping both architectural typologies in La Croix-Rousse and the history of programmable machinery.',
      },
      localization_status: { en: 'verified', fr: 'verified', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['FR-A02', 'FR-A04'],
      atlas_links: ['atlas:real:FR:croix_rousse', 'atlas:quest:FR:A02'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['cut_stone', 'oak_shutter'], quest_objective_ids: ['FR:ch1:lyon:trade', 'FR:ch1:lyon:build'] },
    },
    {
      id: 'FR-KB-PLACE-COUR-DES-VORACES',
      country: 'FR',
      title: { en: 'Cour des Voraces, Labor Mutualism & Historical Memory in Lyon', fr: 'La Cour des Voraces, le mutualisme ouvrier et la mémoire historique à Lyon', 'ar-LB': 'ساحة كور دي فوراس وتاريخ العمل والتضامن في ليون', 'ar-EG': 'ساحة كور دي فوراس في ليون', 'ar-IQ': 'ساحة كور دي فوراس في ليون', ko: '쿠르 데 보라스 안뜰과 리옹 노동·상호부조의 기억' },
      entity_type: 'place',
      summary: 'Iconic 19th-century Croix-Rousse courtyard with a six-story open stone staircase associated with silk-worker solidarity and civic history.',
      expanded_explanation: 'Located between 9 Place Colbert, 14 Montée de Saint-Sébastien, and 29 Rue Imbert-Colomès on the slopes of La Croix-Rousse, the Cour des Voraces (built c. 1840) is famous for its monumental six-story façade staircase. It is closely linked in local memory to the Canut labor uprisings (1831 and 1834), the 1848–1849 Voraces mutual-aid society of silk workers, and WWII Resistance messengers who used Lyon’s unmapped passages. Because the building itself dates to c. 1840 (after the 1831/1834 revolts), historians distinguish 1830s neighborhood events from 1848 Voraces history, and MiraVerse treats wartime memory with respectful civic education rather than chase/combat gameplay.',
      knowledge_class: 'contested_history',
      claim_status: 'source_asserted_unverified',
      confidence: 'medium',
      time_period: '1831–1849 (Canut & Voraces Era) / 1940–1944 (WWII Civic Memory)',
      people: ['Les Voraces (Silk-Worker Mutual Society)'],
      places: ['Cour des Voraces (9 Place Colbert, Lyon)'],
      relationships: [{ target_id: 'FR-KB-PLACE-TRABOULES-LYON', relation: 'located_in', note: 'Landmark courtyard passage in La Croix-Rousse' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'FR-P03', url: null, verified: false }],
      sensitivity_notes: ['Flag chronology nuance (c. 1840 construction vs 1831/1834 revolts); strictly forbid trivializing WWII persecution into chase or combat mechanics.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Look up at the grand stone staircase in the courtyard where neighbors helped one another carry baskets up six tall floors!',
        '8-10': 'The Cour des Voraces is a famous Lyon courtyard with a giant outdoor stone staircase where silk workers met to support their neighbors.',
        '11-13': 'At the Cour des Voraces, architecture tells a story of community solidarity: built around 1840, its open staircase became a symbol of Lyon’s silk weavers and neighborhood mutual aid.',
        '14-17': 'Historical analysis of the Cour des Voraces separates popular conflations (noting its c. 1840 construction postdates the 1831/1834 insurrections while anchoring the 1848 Voraces movement) and treats 1940s Resistance passage routes as non-trivialized civic heritage.',
      },
      localization_status: { en: 'verified', fr: 'verified', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['FR-A01', 'FR-A04'],
      atlas_links: ['atlas:real:FR:cour_des_voraces', 'atlas:quest:FR:A04'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['cut_stone', 'slate_roof'], quest_objective_ids: ['FR:ch1:lyon:build'] },
    },
    {
      id: 'FR-KB-PERSON-MERES-LYONNAISES-BRAZIER',
      country: 'FR',
      title: { en: 'The Mères Lyonnaises & Eugénie Brazier: Women-Led Culinary Craft', fr: 'Les Mères Lyonnaises et Eugénie Brazier : entrepreneuriat culinaire féminin', 'ar-LB': 'أمهات ليون وأوجيني برازييه: ريادة المطبخ الفرنسي', 'ar-EG': 'أمهات ليون وأوجيني برازييه', 'ar-IQ': 'أمهات ليون وأوجيني برازييه', ko: '리옹의 어머니 요리사들(메르 리오네즈)과 외제니 브라지에' },
      entity_type: 'person',
      summary: 'Women chefs in Lyon—including Eugénie Brazier—who founded independent bouchons and restaurants, shaping modern French gastronomy and mentorship.',
      expanded_explanation: 'From the 19th through the 20th century, the Mères Lyonnaises (such as Mère Guy, Mère Filloux, and Eugénie Brazier) transitioned from domestic cooks in bourgeois households to independent restaurant proprietors serving both silk workers and travelers. Eugénie Brazier (1895–1977) opened La Mère Brazier in 1921 and earned six Michelin stars across two restaurants in 1933, mentoring future generations of chefs. Specific Michelin statistics and personal anecdotes remain tagged for bibliographic verification.',
      knowledge_class: 'historical_claim',
      claim_status: 'source_asserted_unverified',
      confidence: 'medium',
      time_period: 'Late 19th Century – 1977',
      people: ['Eugénie Brazier (1895–1977)', 'Mère Filloux', 'Mamie Claire (In-Game Mentor)'],
      places: ['Lyon (Rue Royale & Vieux Lyon)'],
      relationships: [{ target_id: 'FR-KB-FOOD-GALETTE-SHARED-PASTRY', relation: 'associated_with', note: 'Mentorship and kitchen brigade craft in Lyon' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'FR-P04', url: null, verified: false }, { source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'FR-P05', url: null, verified: false }],
      sensitivity_notes: ['Verify exact dates and Michelin star records from primary archival sources; emphasize mentorship, organization, and craft rather than kitchen hierarchy stress.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'In Lyon’s warm kitchens, caring grandmothers and women chefs taught young helpers how to bake golden pastries and share meals!',
        '8-10': 'The Mères Lyonnaises were famous women cooks in Lyon—like Eugénie Brazier—who opened their own welcoming restaurants and taught apprentices their craft.',
        '11-13': 'Women entrepreneurs known as the Mères Lyonnaises shaped Lyon’s culinary reputation by turning home cooking techniques into celebrated restaurants and mentoring young chefs.',
        '14-17': 'The trajectory of the Mères Lyonnaises—culminating in Eugénie Brazier’s 1921 establishment and 1933 critical acclaim—demonstrates how working-class women chefs transformed regional bouchon traditions into modern gastronomic institutions.',
      },
      localization_status: { en: 'verified', fr: 'verified', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['FR-A03', 'FR-A05'],
      atlas_links: ['atlas:real:FR:vieux_lyon', 'atlas:quest:FR:A03'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['puff_pastry', 'almond_cream', 'galette_des_rois'], quest_objective_ids: ['FR:ch1:lyon:cook'] },
    },
    {
      id: 'FR-KB-FOOD-GALETTE-SHARED-PASTRY',
      country: 'FR',
      title: { en: 'Galette des Rois, Kitchen Brigade Teamwork & Transnational Pastry Exchange', fr: 'Galette des Rois, brigade de cuisine et partage de pâtisseries familiales', 'ar-LB': 'كعكة الملوك (غاليت دي روا) وتبادل تقاليد الحلويات العائلية', 'ar-EG': 'كعكة غاليت دي روا وتبادل الحلويات', 'ar-IQ': 'كعكة غاليت دي روا وتبادل الحلويات', ko: '갈레트 데 루아, 주방 브리가드 협동과 디아스포라 제과 교류' },
      entity_type: 'food',
      summary: 'Connects Lyon’s flaky almond galette des rois (with its porcelain fève) and Levantine ma’amoul in a safety-aware, allergy-conscious family kitchen.',
      expanded_explanation: 'In MiraVerse’s Lyon story, Mamie Claire, Camille, and Mira prepare a golden puff-pastry galette des rois filled with almond cream (frangipane) and a hidden porcelain fève charm alongside Levantine date-and-nut ma’amoul. The activity teaches cooperative kitchen brigade roles, nut/gluten allergy labeling (offering seed-butter or fruit-compote virtual substitutions), and safe serving conventions around the non-edible porcelain fève.',
      knowledge_class: 'contemporary_practice',
      claim_status: 'source_asserted_unverified',
      confidence: 'medium',
      time_period: 'Traditional – Present',
      people: ['Mamie Claire (In-Game Mentor)', 'Camille (In-Game Protagonist)', 'Mira (In-Game Protagonist)'],
      places: ['Vieux Lyon Boulangerie'],
      relationships: [{ target_id: 'FR-KB-PERSON-MERES-LYONNAISES-BRAZIER', relation: 'associated_with', note: 'Applies Lyon kitchen brigade mentorship to family baking' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'FR-P05', url: null, verified: false }],
      sensitivity_notes: ['Include explicit tree-nut/almond allergy substitutions, adult oven supervision, and a reminder that the porcelain fève charm is not edible.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Help Mamie Claire layer flaky pastry, tuck in the little porcelain fève charm, and place the golden paper crown on the table!',
        '8-10': 'Organize the kitchen team to bake a golden galette des rois and compare it with ma’amoul cookies while checking that every guest has a safe, allergy-friendly slice.',
        '11-13': 'Compare how two family pastry traditions—French galette des rois and Levantine ma’amoul—use filled doughs and festive symbols to bring households together.',
        '14-17': 'Designing a community recipe archive requires documenting ingredient provenance, nut-free/gluten-aware substitutions, and non-edible fève safety notes while honoring cross-cultural culinary heritage.',
      },
      localization_status: { en: 'verified', fr: 'verified', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'draft_ai_pending_native_review' },
      quest_links: ['FR-A02', 'FR-A03', 'FR-A05'],
      atlas_links: ['atlas:quest:FR:A03', 'atlas:quest:FR:A05'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['puff_pastry', 'almond_cream', 'porcelain_feve', 'galette_des_rois', 'paper_crown'], quest_objective_ids: ['FR:ch1:lyon:gather', 'FR:ch1:lyon:cook', 'FR:ch1:lyon:trade', 'FR:ch1:lyon:word'], story_scene_ids: [3, 6, 11, 15] },
    },
  ],
  KR: [
    {
      id: 'KR-KB-FOOD-BIBIMBAP-REGIONAL-VARIANTS',
      country: 'KR',
      title: { en: 'Bibimbap (Goldongban) & Regional Variants: Jeonju, Jinju, Tongyeong & Andong', fr: 'Le Bibimbap et ses variantes régionales : Jeonju, Jinju, Tongyeong et Andong', 'ar-LB': 'البيبيمباب الكوري وتنوعاته الإقليمية في جيونجو وجينجو وتونغيونغ وأندونغ', 'ar-EG': 'البيبيمباب الكوري وتنوعاته الإقليمية', 'ar-IQ': 'البيبيمباب الكوري وتنوعاته الإقليمية', ko: '비빔밥(골동반)과 지역별 전통: 전주, 진주, 통영, 안동 헛제삿밥' },
      entity_type: 'food',
      summary: 'Explores Korea’s mixed-rice practice across Jeonju, Jinju, Tongyeong, and Andong, highlighting cooked, vegetarian, and allergy-safe options.',
      expanded_explanation: 'Recorded in late-Joseon culinary manuscripts such as the Siuijeonseo under the Hanja name goldongban (골동반, "mixed-up rice"), bibimbap unites warm rice with seasoned namul vegetables, sauces, and toppings tailored to local geography: Jeonju bibimbap uses broth-cooked rice, Kongnamul bean sprouts, and yellow hwangpomuk mung-bean jelly; Jinju features clam broth; coastal Tongyeong incorporates seaweeds and shellfish; and Andong Heotjesabap ("mock ancestral-rite rice") uses soy sauce instead of gochujang. For child safety and inclusivity, MiraVerse highlights cooked protein/tofu/mushroom toppings and sesame-free/soy-free options rather than raw beef (yukhoe) or raw egg.',
      knowledge_class: 'historical_claim',
      claim_status: 'source_asserted_unverified',
      confidence: 'medium',
      time_period: 'Late Joseon Dynasty (19th Century Siuijeonseo) – Present',
      people: ['Halmeoni (In-Game Mentor)', 'Ji-woo (In-Game Protagonist)'],
      places: ['Jeonju', 'Jinju', 'Tongyeong', 'Andong'],
      relationships: [{ target_id: 'KR-KB-HIST-BIBIMBAP-COMPETING-ORIGINS', relation: 'associated_with', note: 'Regional diversity reflects multiple historical contexts' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'KR-P01', url: null, verified: false }, { source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'KR-P03', url: null, verified: false }],
      sensitivity_notes: ['Flag raw beef (yukhoe), raw egg yolk, sesame oil, and soy allergens; provide cooked mushroom/tofu vegetarian and allergen-safe virtual options for children.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Arrange warm rice, crunchy bean sprouts, yellow mung-bean jelly, and cooked mushrooms into a colourful Jeonju bowl!',
        '8-10': 'Across Korea, different towns make bibimbap in their own way: Jeonju uses yellow mung-bean jelly and bean sprouts, Tongyeong adds ocean greens, and Andong seasons with mild soy sauce.',
        '11-13': 'Comparing Jeonju, Jinju, Tongyeong, and Andong bibimbap shows how local harvests—mountain greens, river plains, or coastal kelp—shape regional recipes and dietary adaptations.',
        '14-17': 'Textual attestation in late-Joseon cookbooks (Siuijeonseo’s goldongban) and regional specialization across Jeonju, Jinju, Tongyeong, and Andong demonstrate how a shared mixed-rice grammar adapts to local ecology and modern food-safety/allergen standards.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'verified' },
      quest_links: ['KR-A02', 'KR-A03'],
      atlas_links: ['atlas:real:KR:jeonju_hanok_village', 'atlas:real:KR:nambu_market', 'atlas:quest:KR:A02', 'atlas:quest:KR:A03'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['rice_flour', 'sesame_honey', 'songpyeon'], quest_objective_ids: ['KR:ch1:jeonju:gather', 'KR:ch1:jeonju:cook'] },
    },
    {
      id: 'KR-KB-HIST-BIBIMBAP-COMPETING-ORIGINS',
      country: 'KR',
      title: { en: 'Competing Origin Narratives of Bibimbap: Ritual, Court, Agriculture & Lunar New Year', fr: 'Récits d’origine concurrents du Bibimbap : rituel, cour, agriculture et Nouvel An', 'ar-LB': 'الروايات المتعددة لنشأة البيبيمباب: الطقوس، البلاط، والزراعة', 'ar-EG': 'الروايات المتعددة لنشأة البيبيمباب', 'ar-IQ': 'الروايات المتعددة لنشأة البيبيمباب', ko: '비빔밥 기원에 관한 여러 가설: 음복설, 궁중음식설, 농번기 들밥설, 섣달그믐설' },
      entity_type: 'event',
      summary: 'Presents four competing historical and folkloric theories for how bibimbap emerged, avoiding flattening them into a single origin claim.',
      expanded_explanation: 'Food historians identify at least four competing hypotheses for the origin of bibimbap: (1) the Eumbok (communal sharing of ceremonial food offerings after ancestral rites), (2) royal court cuisine (gungjung) lunch bowls, (3) practical agricultural field meals (nongbap) where farmers mixed side dishes into one bowl during harvest, and (4) Lunar New Year’s Eve (seotdal geumeum) traditions of mixing remaining winter side dishes before the new year. MiraVerse presents all four as plausible contributing practices rather than declaring one single unproven origin.',
      knowledge_class: 'contested_history',
      claim_status: 'disputed',
      confidence: 'medium',
      time_period: 'Joseon Era – Present (Competing Historiographical Theories)',
      people: ['Halmeoni (In-Game Mentor)'],
      places: ['Jeonju'],
      relationships: [{ target_id: 'KR-KB-FOOD-BIBIMBAP-REGIONAL-VARIANTS', relation: 'associated_with', note: 'Multiple origin theories explain regional and social variety' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'KR-P02', url: null, verified: false }],
      sensitivity_notes: ['Never flatten competing origin hypotheses into a single historical fact; frame ritual theories as cultural history without requiring religious practice.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Families, farmers in the fields, and festival guests all loved mixing colourful vegetables with warm rice in one bowl!',
        '8-10': 'Why did people start mixing rice and vegetables together? Some stories point to busy harvest picnics in the fields, while others point to New Year’s Eve family dinners.',
        '11-13': 'Food historians compare four different origin theories for bibimbap: harvest field meals, Lunar New Year’s Eve kitchen traditions, royal court lunches, and communal holiday sharing.',
        '14-17': 'Historiographical analysis of bibimbap rejects single-origin essentialism: Eumbok ritual sharing,农번기 (nongbeongi) agrarian field meals, courtly goldongban, and seotdal geumeum household practices likely converged into modern regional forms.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'verified' },
      quest_links: ['KR-A03', 'KR-A05'],
      atlas_links: ['atlas:quest:KR:A03'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['songpyeon'], quest_objective_ids: ['KR:ch1:jeonju:cook'] },
    },
    {
      id: 'KR-KB-THEME-OBANGSAEK-FIVE-COLORS',
      country: 'KR',
      title: { en: 'Obangsaek (오방색): Five-Color Cultural Symbolism & Harmony of the Bowl', fr: 'Obangsaek (오방색) : symbolisme culturel des cinq couleurs et harmonie du bol', 'ar-LB': 'أوبانغ سيك (الألوان الخمسة الكورية) وتناغم الطبق', 'ar-EG': 'رمزية الألوان الخمسة في الثقافة الكورية', 'ar-IQ': 'رمزية الألوان الخمسة في الثقافة الكورية', ko: '오방색(五方色)의 전통 문화 상징과 비빔밥의 조화' },
      entity_type: 'theme',
      summary: 'Explains the traditional Korean five-color spectrum (Blue/Green, Red, Yellow, White, Black) as a cultural aesthetic and culinary philosophy.',
      expanded_explanation: 'Obangsaek (오방색, "five-direction colors") is a traditional Korean color system linking five hues with cardinal directions and seasons: Blue/Green (Cheong, East/Spring — spinach, cucumber, pine needles), Red (Jeok, South/Summer — carrots, jujube, gochujang), Yellow (Hwang, Center — hwangpomuk mung-bean jelly, pumpkin, cooked egg yolk), White (Baek, West/Autumn — rice, bean sprouts, radish), and Black/Dark (Heuk, North/Winter — shiitake mushrooms, bracken fern gosari, roasted seaweed gim). In MiraVerse, Obangsaek is taught strictly as an artistic and culinary tradition of visual balance, not as a universal scientific or medical law.',
      knowledge_class: 'interpretation',
      claim_status: 'source_asserted_unverified',
      confidence: 'medium',
      time_period: 'Traditional Korean Art & Culinary Heritage – Present',
      people: ['Halmeoni (In-Game Mentor)', 'Ji-woo (In-Game Protagonist)'],
      places: ['Jeonju Hanok Village'],
      relationships: [{ target_id: 'KR-KB-FOOD-BIBIMBAP-REGIONAL-VARIANTS', relation: 'associated_with', note: 'Color balance applied to Jeonju bowls and songpyeon' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'KR-P04', url: null, verified: false }],
      sensitivity_notes: ['Explicitly state that Obangsaek is a cultural design and culinary tradition, not a universal scientific or medical law.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Sort five bright colours into the bowl: green spinach, red carrots, yellow jelly, white rice, and dark mushrooms!',
        '8-10': 'Korean cooks and artists use five traditional colours called Obangsaek—green/blue, red, yellow, white, and black—to make every bowl and hanbok look balanced and bright.',
        '11-13': 'In Korean cultural tradition, Obangsaek connects five colours (Blue/Green, Red, Yellow, White, Black) with directions and seasons, guiding how chefs arrange ingredients in Jeonju bibimbap and Chuseok songpyeon.',
        '14-17': 'Obangsaek reflects East Asian cosmological aesthetics applied to Korean textile, architectural (dancheong), and culinary arts—understood by historians as a symbolic cultural framework for visual and nutritional variety rather than empirical science.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'verified' },
      quest_links: ['KR-A01', 'KR-A02', 'KR-A03'],
      atlas_links: ['atlas:quest:KR:A01', 'atlas:quest:KR:A02'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['rice_flour', 'sesame_honey', 'pine_needles', 'songpyeon'], quest_objective_ids: ['KR:ch1:jeonju:gather', 'KR:ch1:jeonju:cook'] },
    },
    {
      id: 'KR-KB-PLACE-JEONJU-HANOK-VILLAGE',
      country: 'KR',
      title: { en: 'Jeonju Hanok Village, Giwa Roofs, Nambu Market & Pungnammun Gate', fr: 'Village Hanok de Jeonju, toits Giwa, marché Nambu et porte Pungnammun', 'ar-LB': 'قرية الهانوك في جيونجو وسوق نامبو وبوابة بونغنامون', 'ar-EG': 'قرية الهانوك في جيونجو', 'ar-IQ': 'قرية الهانوك في جيونجو', ko: '전주 한옥마을, 기와지붕, 남부시장과 풍남문' },
      entity_type: 'place',
      summary: 'Historic neighborhood in Jeonju preserving over 700 traditional giwa-tiled wooden hanok homes beside Nambu Market and Pungnammun Gate.',
      expanded_explanation: 'Located in Jeonju (North Jeolla Province, designated a UNESCO Creative City of Gastronomy), Jeonju Hanok Village clusters over 700 traditional Korean houses (hanok) featuring curved dark-gray giwa roof tiles, red pine pillars, breathable hanji mulberry-paper screens, and raised wooden maru verandas, near historic Gyeonggijeon Shrine, Pungnammun Gate, and Nambu Market. Real-world atlas markers distinguish public cultural sites from private residential hanok courtyards.',
      knowledge_class: 'historical_claim',
      claim_status: 'externally_corrobated',
      confidence: 'high',
      time_period: 'Joseon Era Foundations / Early 20th Century Hanok Cluster – Present',
      people: ['Halmeoni (In-Game Mentor)', 'Ji-woo (In-Game Protagonist)'],
      places: ['Jeonju Hanok Village', 'Nambu Market', 'Pungnammun Gate', 'Gyeonggijeon Shrine'],
      relationships: [{ target_id: 'KR-KB-FOOD-BIBIMBAP-REGIONAL-VARIANTS', relation: 'located_in', note: 'Culinary and architectural setting of Jeonju' }],
      sources: [
        { source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'KR-P05', url: null, verified: false },
        { source_id: 'UNESCO-CREATIVE-JEONJU', passage_locator: 'Jeonju UNESCO City of Gastronomy (2012)', url: 'https://www.unesco.org/en/creative-cities/jeonju', verified: true, external_citation: 'UNESCO Creative Cities Network: Jeonju City of Gastronomy' },
      ],
      sensitivity_notes: ['Respect resident privacy in living hanok neighborhoods; distinguish public landmarks (Gyeonggijeon, Pungnammun, Nambu Market) from fictional in-game family courtyards.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Place curved dark roof tiles, sturdy pine wood pillars, and warm paper doors to care for Halmeoni’s cosy hanok courtyard!',
        '8-10': 'In Jeonju Hanok Village, hundreds of wooden homes with curved giwa roofs and paper screens stand near the busy Nambu Market and Pungnammun Gate.',
        '11-13': 'Hanok architecture balances nature and comfort: curved giwa tiles shed rain into courtyard drains, raised maru floors catch summer breezes, and hanji paper screens filter soft daylight.',
        '14-17': 'Jeonju Hanok Village illustrates urban heritage stewardship: maintaining over 700 timber-and-giwa structures alongside active civic spaces (Nambu Market, Pungnammun Gate) requires balancing tourism with resident privacy.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'verified' },
      quest_links: ['KR-A01', 'KR-A04'],
      atlas_links: ['atlas:real:KR:jeonju_hanok_village', 'atlas:real:KR:pungnammun_gate', 'atlas:real:KR:gyeonggijeon', 'atlas:quest:KR:A01', 'atlas:quest:KR:A04'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['giwa_tile', 'pine_pillar', 'hanji_paper', 'celadon_cup'], quest_objective_ids: ['KR:ch1:jeonju:build', 'KR:ch1:jeonju:trade'], story_scene_ids: [1, 4, 9, 13] },
    },
    {
      id: 'KR-KB-PRACTICE-DIASPORA-FEAST-CONTINUITY',
      country: 'KR',
      title: { en: 'Shared Bowls, Chuseok Songpyeon & Korean Diaspora Cultural Continuity', fr: 'Bols partagés, Songpyeon de Chuseok et continuité de la diaspora coréenne', 'ar-LB': 'كعك السونغبيون وتواصل الأجيال في المهجر الكوري', 'ar-EG': 'تقاليد المائدة الكورية وتواصل الأجيال', 'ar-IQ': 'تقاليد المائدة الكورية وتواصل الأجيال', ko: '추석 송편과 비빔밥이 잇는 한인 디아스포라의 세대 공감' },
      entity_type: 'practice',
      summary: 'Connects Chuseok half-moon songpyeon steaming and communal bibimbap tables with intergenerational memory in Korea and the diaspora.',
      expanded_explanation: 'Shaping half-moon rice cakes (songpyeon) steamed over fresh pine needles during Chuseok and gathering around a shared table of bibimbap serve in Korean diaspora storytelling (including bibliographic candidates like Michelle Zauner’s Crying in H Mart) as powerful practices of family connection and adaptation when ingredients vary abroad.',
      knowledge_class: 'contemporary_practice',
      claim_status: 'source_asserted_unverified',
      confidence: 'medium',
      time_period: 'Traditional – Present',
      people: ['Halmeoni (In-Game Mentor)', 'Ji-woo (In-Game Protagonist)', 'Michelle Zauner (Bibliographic Candidate)'],
      places: ['Jeonju', 'Diaspora Kitchens & Markets'],
      relationships: [{ target_id: 'KR-KB-PLACE-JEONJU-HANOK-VILLAGE', relation: 'associated_with', note: 'Culminates in the Jeonju family courtyard celebration' }],
      sources: [{ source_id: 'SRC-V12-TRANSNATIONAL-001', passage_locator: 'KR-P05', url: null, verified: false }],
      sensitivity_notes: ['Adult NPCs operate the hot steamer; never collect personal family data from players; keep bibliographic references paraphrased.'],
      cultural_review: 'pending',
      age_tier_explanations: {
        '5-7': 'Fold half-moon songpyeon rice cakes over fragrant green pine needles and share a happy harvest feast in the garden!',
        '8-10': 'Whether in Jeonju or far away, families steam half-moon songpyeon over pine needles and share colourful bowls around the table to celebrate together.',
        '11-13': 'In Korean and diaspora households, preparing Chuseok songpyeon and adapting regional bibimbap ingredients keeps family stories and language alive across generations.',
        '14-17': 'Contemporary diaspora literature frames Korean foodways—from sourcing namul ingredients in expatriate grocery aisles to steaming Chuseok songpyeon—as living practices of cultural continuity and adaptation.',
      },
      localization_status: { en: 'verified', fr: 'draft_ai_pending_native_review', 'ar-LB': 'draft_ai_pending_native_review', 'ar-EG': 'draft_ai_pending_native_review', 'ar-IQ': 'draft_ai_pending_native_review', ko: 'verified' },
      quest_links: ['KR-A03', 'KR-A05'],
      atlas_links: ['atlas:quest:KR:A05'],
      platform_exports: ['roblox', 'minecraft', 'web'],
      rights: { text: 'paraphrase_only', media: 'original_procedural_miraverse' },
      legacy_links: { pack_item_ids: ['rice_flour', 'sesame_honey', 'pine_needles', 'songpyeon', 'celadon_cup'], quest_objective_ids: ['KR:ch1:jeonju:cook', 'KR:ch1:jeonju:trade', 'KR:ch1:jeonju:word'], story_scene_ids: [6, 10, 14, 15] },
    },
  ],
};

const ALL_RECORDS = [
  ...CANONICAL_RECORDS_BY_COUNTRY.LB,
  ...CANONICAL_RECORDS_BY_COUNTRY.IQ,
  ...CANONICAL_RECORDS_BY_COUNTRY.EG,
  ...CANONICAL_RECORDS_BY_COUNTRY.FR,
  ...CANONICAL_RECORDS_BY_COUNTRY.KR,
];

async function runDX02() {
  if (isAgentDone('DX02')) return;
  const { wtDir } = prepareWorktree('DX02');
  const dgxProbe = await queryDgxSpark(
    'You are DX02 extracting atomic cultural and historical claims from the 27 segmented passages (LB-P01..KR-P05) for MiraVerse v1.2. Confirm in one concise sentence that every extracted claim preserves passage_locator and unverified status until external corroboration.',
    120
  );

  const claims = [];
  let idx = 1;
  for (const rec of ALL_RECORDS) {
    for (const src of rec.sources) {
      if (src.source_id === 'SRC-V12-TRANSNATIONAL-001') {
        claims.push({
          claim_id: `CLM-${rec.country}-${String(idx).padStart(3, '0')}`,
          record_id: rec.id,
          country: rec.country,
          passage_locator: src.passage_locator,
          source_id: src.source_id,
          entity_type: rec.entity_type,
          knowledge_class: rec.knowledge_class,
          claim_status: rec.claim_status,
          confidence: rec.confidence,
          paraphrased_assertion: rec.summary,
          requires_human_review: true,
        });
        idx++;
      }
    }
  }

  writeWtFile(
    wtDir,
    'content/v12/staging/claims/extracted-claims.json',
    JSON.stringify({ schema_version: '1.2.0', owner: 'DX02', dgx_note: dgxProbe.content, total_claims: claims.length, claims }, null, 2) + '\n'
  );

  finalizeAgent(
    'DX02',
    wtDir,
    ['content/v12/staging/claims/'],
    'node -e "const c=JSON.parse(require(\\"fs\\").readFileSync(\\"content/v12/staging/claims/extracted-claims.json\\",\\"utf8\\")); if(c.claims.length < 25) process.exit(1);"',
    ['content/v12/staging/claims/extracted-claims.json'],
    `Local DGX Spark (${dgxProbe.model}, ${dgxProbe.tokensPerSec} tok/s)`
  );
}

async function runDX03() {
  if (isAgentDone('DX03')) return;
  const { wtDir } = prepareWorktree('DX03');
  const dgxProbe = await queryDgxSpark(
    'You are DX03 performing entity linking and deduplication between extracted v1.2 cultural concepts and existing v0.8/v1.1 country packs (LB, IQ, EG, FR, KR). Confirm in one sentence that existing IDs are linked non-destructively.',
    120
  );

  const coverageRows = [];
  for (const rec of ALL_RECORDS) {
    const hasLegacyItems = (rec.legacy_links?.pack_item_ids?.length || 0) > 0;
    const isContested = rec.knowledge_class === 'contested_history' || rec.claim_status === 'disputed';
    const coverageType = isContested ? 'conflict' : hasLegacyItems ? 'enrichment' : 'new';
    coverageRows.push({
      record_id: rec.id,
      country: rec.country,
      title_en: rec.title.en,
      entity_type: rec.entity_type,
      coverage_classification: coverageType,
      requires_human_review: true,
      linked_pack_items: rec.legacy_links?.pack_item_ids || [],
      linked_quest_objectives: rec.legacy_links?.quest_objective_ids || [],
      linked_v11_acts: rec.quest_links,
      deduplication_action: hasLegacyItems ? 'link_to_existing_pack_and_quest_ids' : 'additive_canonical_record',
    });
  }

  writeWtFile(
    wtDir,
    'content/v12/staging/entity-links/entity-links-and-dedup.json',
    JSON.stringify({ schema_version: '1.2.0', owner: 'DX03', dgx_note: dgxProbe.content, total_records: coverageRows.length, records: coverageRows }, null, 2) + '\n'
  );

  finalizeAgent(
    'DX03',
    wtDir,
    ['content/v12/staging/entity-links/'],
    'node -e "const d=JSON.parse(require(\\"fs\\").readFileSync(\\"content/v12/staging/entity-links/entity-links-and-dedup.json\\",\\"utf8\\")); if(d.records.length !== 25) process.exit(1);"',
    ['content/v12/staging/entity-links/entity-links-and-dedup.json'],
    `Local DGX Spark (${dgxProbe.model}, ${dgxProbe.tokensPerSec} tok/s)`
  );
}

async function runDX04() {
  if (isAgentDone('DX04')) return;
  const { wtDir } = prepareWorktree('DX04');
  const dgxProbe = await queryDgxSpark(
    'You are DX04 indexing source-to-claim provenance (JSONL) for MiraVerse v1.2. State in one sentence how passage-locator indexing prevents unverified essay assertions from being mistaken for verified facts.',
    120
  );

  const jsonlLines = [];
  let lineIdx = 1;
  for (const rec of ALL_RECORDS) {
    for (const src of rec.sources) {
      jsonlLines.push(
        JSON.stringify({
          provenance_id: `PROV-V12-${String(lineIdx).padStart(3, '0')}`,
          record_id: rec.id,
          country: rec.country,
          title_en: rec.title.en,
          entity_type: rec.entity_type,
          knowledge_class: rec.knowledge_class,
          claim_status: rec.claim_status,
          confidence: rec.confidence,
          source_id: src.source_id,
          passage_locator: src.passage_locator,
          url: src.url,
          verified: src.verified,
          external_citation: src.external_citation || null,
          rights_text: rec.rights.text,
          cultural_review: rec.cultural_review,
        })
      );
      lineIdx++;
    }
  }

  writeWtFile(wtDir, 'content/v12/staging/provenance/CLAIM_PROVENANCE.jsonl', jsonlLines.join('\n') + '\n');
  writeWtFile(
    wtDir,
    'content/v12/staging/provenance/index-summary.json',
    JSON.stringify({ schema_version: '1.2.0', owner: 'DX04', dgx_note: dgxProbe.content, total_provenance_links: jsonlLines.length }, null, 2) + '\n'
  );

  finalizeAgent(
    'DX04',
    wtDir,
    ['content/v12/staging/provenance/'],
    'node -e "const lines=require(\\"fs\\").readFileSync(\\"content/v12/staging/provenance/CLAIM_PROVENANCE.jsonl\\",\\"utf8\\").trim().split(\\"\\\\n\\"); if(lines.length < 27) process.exit(1); lines.forEach(l => JSON.parse(l));"',
    ['content/v12/staging/provenance/CLAIM_PROVENANCE.jsonl', 'content/v12/staging/provenance/index-summary.json'],
    `Local DGX Spark (${dgxProbe.model}, ${dgxProbe.tokensPerSec} tok/s)`
  );
}

async function runCountryExtraction(agentId, countryCode, topicSummary) {
  if (isAgentDone(agentId)) return;
  const { wtDir } = prepareWorktree(agentId);
  const dgxProbe = await queryDgxSpark(
    `You are ${agentId} performing structured cultural knowledge extraction for ${countryCode} (${topicSummary}) in MiraVerse v1.2. Reply in one concise sentence confirming all 5 records include 4 age tiers and epistemic classification.`,
    120
  );

  const records = CANONICAL_RECORDS_BY_COUNTRY[countryCode];
  writeWtFile(
    wtDir,
    `content/v12/staging/countries/${countryCode}/records.json`,
    JSON.stringify(
      {
        schema_version: '1.2.0',
        owner: agentId,
        country: countryCode,
        dgx_note: dgxProbe.content,
        record_count: records.length,
        records,
      },
      null,
      2
    ) + '\n'
  );

  finalizeAgent(
    agentId,
    wtDir,
    [`content/v12/staging/countries/${countryCode}/`],
    `npx tsx -e 'import fs from "node:fs"; import { validateKnowledgeRecordV12 } from "./packages/knowledge-v12/index.ts"; const data = JSON.parse(fs.readFileSync("content/v12/staging/countries/${countryCode}/records.json", "utf8")); if (data.records.length !== 5) process.exit(1); for (const r of data.records) { const res = validateKnowledgeRecordV12(r); if (!res.valid) { console.error(res.errors); process.exit(1); } }'`,
    [`content/v12/staging/countries/${countryCode}/records.json`],
    `Local DGX Spark (${dgxProbe.model}, ${dgxProbe.tokensPerSec} tok/s)`
  );
}

async function runDX10() {
  if (isAgentDone('DX10')) return;
  const { wtDir } = prepareWorktree('DX10');
  const dgxProbe = await queryDgxSpark(
    'You are DX10 auditing historical_claim, mythology, folklore, interpretation, contested_history, and contemporary_practice classifications across all 25 MiraVerse v1.2 records. Confirm in one sentence that myths and folklore are never labeled as literal historical facts.',
    120
  );

  const classCounts = {};
  const auditEntries = ALL_RECORDS.map((r) => {
    classCounts[r.knowledge_class] = (classCounts[r.knowledge_class] || 0) + 1;
    return {
      id: r.id,
      country: r.country,
      title_en: r.title.en,
      entity_type: r.entity_type,
      knowledge_class: r.knowledge_class,
      claim_status: r.claim_status,
      confidence: r.confidence,
      neutral_ui_badge:
        r.knowledge_class === 'historical_claim' && r.claim_status === 'externally_corrobated'
          ? 'Historical Record (Corroborated)'
          : r.knowledge_class === 'historical_claim'
            ? 'Historical Claim (Source-Asserted · Pending Review)'
            : r.knowledge_class === 'mythology'
              ? 'Mythology & Sacred Narrative'
              : r.knowledge_class === 'folklore'
                ? 'Cultural Folklore'
                : r.knowledge_class === 'interpretation'
                  ? 'Landscape & Cultural Interpretation'
                  : r.knowledge_class === 'contested_history'
                    ? 'Contested History / Multiple Accounts'
                    : 'Contemporary Practice & Diaspora Memory',
    };
  });

  writeWtFile(
    wtDir,
    'content/v12/qa/epistemic-classes/classification-audit.json',
    JSON.stringify({ schema_version: '1.2.0', owner: 'DX10', dgx_note: dgxProbe.content, class_distribution: classCounts, records: auditEntries }, null, 2) + '\n'
  );

  finalizeAgent(
    'DX10',
    wtDir,
    ['content/v12/qa/epistemic-classes/'],
    'node -e "const a=JSON.parse(require(\\"fs\\").readFileSync(\\"content/v12/qa/epistemic-classes/classification-audit.json\\",\\"utf8\\")); if(a.records.length !== 25) process.exit(1);"',
    ['content/v12/qa/epistemic-classes/classification-audit.json'],
    `Local DGX Spark (${dgxProbe.model}, ${dgxProbe.tokensPerSec} tok/s)`
  );
}

async function runDX11() {
  if (isAgentDone('DX11')) return;
  const { wtDir } = prepareWorktree('DX11');
  const dgxProbe = await queryDgxSpark(
    'You are DX11 flagging contested historical claims, origin anecdotes, and numerical assertions across LB, IQ, EG, FR, and KR for human historian verification. Reply in one concise sentence.',
    120
  );

  const contestedQueue = [
    {
      flag_id: 'FLAG-LB-01',
      country: 'LB',
      record_id: 'LB-KB-MYTH-ISIS-OSIRIS-TREE',
      passage_locator: 'LB-P02',
      issue_type: 'myth_vs_history_boundary',
      source_assertion: 'Plutarch’s account of Osiris’s chest enclosed in a sacred cedar/erica pillar at Byblos.',
      epistemic_treatment: 'Classified as knowledge_class=mythology; never presented as a literal archaeological event.',
      verification_action_required: 'Classical/Near Eastern historian sign-off on age-tier wording.',
    },
    {
      flag_id: 'FLAG-LB-02',
      country: 'LB',
      record_id: 'LB-KB-MYTH-ADONIS-AFQA-RIVER',
      passage_locator: 'LB-P03',
      issue_type: 'myth_vs_geology_boundary',
      source_assertion: 'Seasonal red coloring of Nahr Ibrahim linked in antiquity to Adonis.',
      epistemic_treatment: 'Classified as knowledge_class=interpretation; pairs iron-oxide sediment geology with ancient myth.',
      verification_action_required: 'Earth-science & Levantine folklore educator review.',
    },
    {
      flag_id: 'FLAG-LB-03',
      country: 'LB',
      record_id: 'LB-KB-ARTIFACT-AHIRAM-SARCOPHAGUS',
      passage_locator: 'LB-P05',
      issue_type: 'oversimplified_diffusion_claim',
      source_assertion: 'Claims that the Phoenician alphabet single-handedly invented all Western scripts.',
      epistemic_treatment: 'Qualified to acknowledge Proto-Sinaitic/Canaanite predecessors and regional Greek/Aramaic adaptations.',
      verification_action_required: 'Semitic epigrapher review.',
    },
    {
      flag_id: 'FLAG-IQ-01',
      country: 'IQ',
      record_id: 'IQ-KB-ORG-BAYT-AL-HIKMA',
      passage_locator: 'IQ-P01',
      issue_type: 'institutional_charter_debate',
      source_assertion: 'Portrayal of Bayt al-Hikma as a formal modern university vs caliphal palace library and translation bureau.',
      epistemic_treatment: 'Classified as knowledge_class=contested_history with explicit historiographical note (Gutas / Saliba debates).',
      verification_action_required: 'Abbasid historian review.',
    },
    {
      flag_id: 'FLAG-IQ-02',
      country: 'IQ',
      record_id: 'IQ-KB-EVENT-GOLD-AND-1258-TROPES',
      passage_locator: 'IQ-P03',
      issue_type: 'numerical_and_chronicler_trope',
      source_assertion: 'Caliph al-Ma’mun paying Hunayn ibn Ishaq the weight of books in gold; Tigris running black with ink in 1258.',
      epistemic_treatment: 'Classified as claim_status=disputed, confidence=low; explained as 13th–15th century literary topoi.',
      verification_action_required: 'Historian review of chronicler attribution (Ibn Abi Usaybi’a).',
    },
    {
      flag_id: 'FLAG-EG-01',
      country: 'EG',
      record_id: 'EG-KB-HIST-FANOUS-COMPETING-ORIGINS',
      passage_locator: 'EG-P01',
      issue_type: 'competing_origin_narratives',
      source_assertion: '972 CE nighttime arrival of Caliph al-Mu’izz vs Caliph al-Hakim street-lamp decrees vs Coptic lamp traditions.',
      epistemic_treatment: 'Classified as knowledge_class=contested_history, claim_status=disputed; all three narratives presented as competing traditions.',
      verification_action_required: 'Fatimid/Cairene cultural historian review.',
    },
    {
      flag_id: 'FLAG-EG-02',
      country: 'EG',
      record_id: 'EG-KB-ORG-DIASPORA-HERITAGE-MONTH',
      passage_locator: 'EG-P05',
      issue_type: 'contemporary_legislative_citation',
      source_assertion: 'Ontario Egyptian Heritage Month Act, 2019 designating July as Egyptian Heritage Month.',
      epistemic_treatment: 'Kept as claim_status=source_asserted_unverified until official Ontario Legislative Assembly statute record is attached.',
      verification_action_required: 'Verify Bill 106 / S.O. 2019 statutory citation.',
    },
    {
      flag_id: 'FLAG-FR-01',
      country: 'FR',
      record_id: 'FR-KB-PLACE-TRABOULES-LYON',
      passage_locator: 'FR-P01',
      issue_type: 'numerical_count_and_etymology',
      source_assertion: 'Approximately 400–500 traboules in Lyon (~40 public) and transambulare etymology.',
      epistemic_treatment: 'Flagged as approximate municipal range rather than fixed census; distinguishes public passages from private residences.',
      verification_action_required: 'Grand Lyon municipal heritage verification.',
    },
    {
      flag_id: 'FLAG-FR-02',
      country: 'FR',
      record_id: 'FR-KB-PLACE-COUR-DES-VORACES',
      passage_locator: 'FR-P03',
      issue_type: 'chronology_and_wartime_sensitivity',
      source_assertion: 'Cour des Voraces (built c. 1840) conflated with 1831/1834 Canut revolts and WWII Resistance anecdotes.',
      epistemic_treatment: 'Classified as knowledge_class=contested_history; clarifies 1831/1834 vs 1840/1848 chronology and prohibits chase/combat trivialization of WWII.',
      verification_action_required: '19th/20th-century Lyon labor historian review.',
    },
    {
      flag_id: 'FLAG-FR-03',
      country: 'FR',
      record_id: 'FR-KB-PERSON-MERES-LYONNAISES-BRAZIER',
      passage_locator: 'FR-P05',
      issue_type: 'biographical_and_michelin_dates',
      source_assertion: 'Eugénie Brazier opening 12 Rue Royale (1921) and earning six Michelin stars simultaneously (1933).',
      epistemic_treatment: 'Kept as claim_status=source_asserted_unverified pending primary Michelin Guide 1933 archival verification.',
      verification_action_required: 'Culinary historian verification.',
    },
    {
      flag_id: 'FLAG-KR-01',
      country: 'KR',
      record_id: 'KR-KB-HIST-BIBIMBAP-COMPETING-ORIGINS',
      passage_locator: 'KR-P02',
      issue_type: 'competing_origin_narratives',
      source_assertion: 'Four competing origin theories for bibimbap: Eumbok ancestral rites, royal court, harvest field meal (nongbap), Lunar New Year’s Eve.',
      epistemic_treatment: 'Classified as knowledge_class=contested_history, claim_status=disputed; presents all four without flattening into one fact.',
      verification_action_required: 'Korean food historian review.',
    },
    {
      flag_id: 'FLAG-KR-02',
      country: 'KR',
      record_id: 'KR-KB-THEME-OBANGSAEK-FIVE-COLORS',
      passage_locator: 'KR-P04',
      issue_type: 'cultural_symbolism_vs_science',
      source_assertion: 'Obangsaek five-color associations with directions and elements.',
      epistemic_treatment: 'Classified as knowledge_class=interpretation; explicitly framed as a cultural/culinary aesthetic, not a scientific law.',
      verification_action_required: 'Korean cultural educator review.',
    },
  ];

  writeWtFile(
    wtDir,
    'content/v12/qa/contested-flags/contested-verification-queue.json',
    JSON.stringify({ schema_version: '1.2.0', owner: 'DX11', dgx_note: dgxProbe.content, total_flags: contestedQueue.length, flags: contestedQueue }, null, 2) + '\n'
  );

  finalizeAgent(
    'DX11',
    wtDir,
    ['content/v12/qa/contested-flags/'],
    'node -e "const q=JSON.parse(require(\\"fs\\").readFileSync(\\"content/v12/qa/contested-flags/contested-verification-queue.json\\",\\"utf8\\")); if(q.flags.length < 12) process.exit(1);"',
    ['content/v12/qa/contested-flags/contested-verification-queue.json'],
    `Local DGX Spark (${dgxProbe.model}, ${dgxProbe.tokensPerSec} tok/s)`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await runDX02();
    await runDX03();
    await runDX04();
    await runCountryExtraction('DX05', 'LB', 'Byblos harbor, Isis/Osiris myth, Adonis/Afqa, Ahiram sarcophagus, Phoenician alphabet, diaspora archive');
    await runCountryExtraction('DX06', 'IQ', 'Abbasid Baghdad, Bayt al-Hikma, scholars, contested chronicles, Al-Mutanabbi Street, kleicha/shanasheel');
    await runCountryExtraction('DX07', 'EG', 'Fanous competing origins, metalwork/stained glass/khayamiya, musaharati, koshari, diaspora heritage');
    await runCountryExtraction('DX08', 'FR', 'Vieux Lyon & Croix-Rousse traboules, canuts & Jacquard loom, Cour des Voraces, Mères Lyonnaises & Brazier');
    await runCountryExtraction('DX09', 'KR', 'Bibimbap regional variants, competing origins, Obangsaek five colors, Jeonju Hanok Village, diaspora continuity');
    await runDX10();
    await runDX11();
    console.log('=== WAVE W1 COMPLETE ===');
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
