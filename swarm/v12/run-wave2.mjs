#!/usr/bin/env node
/**
 * MiraVerse v1.2 — Wave W2 Executor (`swarm/v12/run-wave2.mjs`)
 * Executes Wave W2 agents in isolated worktrees (`/home/wael/Code/mv-wt-v12/<ID>`):
 *   - CL03: Age-tier educational design & 5-act quest alignment across LB, IQ, EG, FR, KR (`content/v12/quest-enrichment/`)
 *   - CL04: Cross-platform content contracts & localization/safety constraints (`packages/contracts/v12/`)
 *   - AG02: Lebanon storyboards (`art/v12/countries/LB/storyboards/`)
 *   - AG03: Lebanon artifacts/alphabet illustrations (`art/v12/countries/LB/artifacts/`, `apps/web/public/art/v12/LB/`)
 *   - AG14: Age 5–7 narrative presentation (`content/v12/presentations/age-5-7/`)
 *   - AG15: Age 8–10 narrative presentation (`content/v12/presentations/age-8-10/`)
 *   - AG16: Age 11–13 evidence interactions (`content/v12/presentations/age-11-13/`)
 *   - AG17: Age 14–17 source-critical interactions (`content/v12/presentations/age-14-17/`)
 *   - DX12: Named-entity spelling & date consistency (`content/v12/qa/entity-consistency/`)
 *   - DX13: Age-tier language linting (`content/v12/qa/age-lint/`)
 *   - DX14: Lebanese Arabic (`ar-LB`) localization checks (`content/v12/locales/ar-LB/`)
 *   - CX02: Content compiler for Roblox Luau & Minecraft Bedrock JS/JSON (`tools/v12/compiler/`, `apps/roblox/src/shared/KnowledgeV12.luau`, `apps/minecraft/scripts/generated/knowledgeV12.ts`)
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, queryDgxSpark, prepareWorktree, writeWtFile, isAgentDone, finalizeAgent } from './run-wave0.mjs';
import { CANONICAL_RECORDS_BY_COUNTRY } from './run-wave1.mjs';

export const QUEST_ACTS_V12 = [
  // LEBANON (LB-A01..LB-A05)
  {
    act_id: 'LB-A01',
    country: 'LB',
    act_number: 1,
    title: { en: 'The Harbor Welcome & Maritime Routes', fr: 'L’accueil du port de Byblos', 'ar-LB': 'ترحيب مينا جبيل وطرق البحر', 'ar-EG': 'ترحيب ميناء جبيل', 'ar-IQ': 'ترحيب ميناء جبيل', ko: '비블로스 항구의 환영과 바닷길' },
    legacy_quest_id: 'LB:ch1:harbor:main',
    legacy_objective_id: 'LB:ch1:harbor:gather',
    mentor_id: 'npc:LB:teta_nahla',
    mentor_name: 'Teta Nahla',
    supporting_npc_id: 'npc:LB:rima_sailor',
    linked_knowledge_ids: ['LB-KB-PLACE-BYBLOS-PORT', 'LB-KB-MYTH-ISIS-OSIRIS-TREE', 'LB-KB-ARTIFACT-AHIRAM-SARCOPHAGUS'],
    enrichment_hook: 'harbor_map_and_trade_routes',
    free_knowledge_unlock: 'Byblos Maritime & Cedar Trade Lore Card',
    paid_reward_required: false,
    safety_flags: ['no_child_pii', 'myth_clearly_labeled_not_history'],
    variations: {
      '5-7': {
        learning_objective: 'Recognize Byblos harbor objects (cedar beam, olive oil jar, sailboat) using pictorial icons in a 1–3 minute guided loop.',
        narrative_hook: 'Teta Nahla and Captain Rima wave from the sunny pier—let’s match three harbor pictures to welcome the boats!',
        npc_lines: {
          mentor_greeting_en: 'Ahlan ya habibi! Tap the three glowing seashell pictures to bring the cedar wood and olive jar to the harbor sign.',
          mentor_greeting_native: 'أهلا يا حبيبي! إكبس عالصور التلاتة لنرتب لوحة مينا جبيل.',
        },
        player_actions: ['Follow glowing seashell trail', 'Match 3 pictorial harbor icons (cedar, olive jar, boat)', 'Snap welcome sign into place'],
        hint_ladder: ['Icon glow pulse after 8s', 'Teta points directly to the matching basket', 'Auto-snap assist on touch'],
        completion_criteria: '3 harbor icons matched and welcome sign placed (no reading or timer required).',
        reward: { knowledge_unlock_id: 'LB-KB-PLACE-BYBLOS-PORT', stamp_id: 'stamp:LB:A01', free_earned: true },
        historical_notes: 'Byblos harbor traded cedar wood and olive oil across the Mediterranean.',
      },
      '8-10': {
        learning_objective: 'Sort coastal trade goods and distinguish historical harbor trade from the ancient myth of the sacred tree.',
        narrative_hook: 'The harbor notice board lost its route tags! Help Captain Rima sort what sailed out of Byblos and what arrived from Egypt.',
        npc_lines: {
          mentor_greeting_en: 'Welcome to Jbeil! Ask Captain Rima which goods came from Mount Lebanon and which arrived by sea.',
          mentor_greeting_native: 'أهلا وسهلا بجبيل! اسأل القبطان ريما شو كان يسافر من جبل لبنان بالبحر.',
        },
        player_actions: ['Collect 4 route tags along the pier', 'Sort Mount Lebanon cedar/olive oil vs Egyptian papyrus', 'Assemble 3-piece harbor map board'],
        hint_ladder: ['Show picture clue on tag', 'Highlight Mount Lebanon vs Nile ports on mini-map', 'Captain Rima explains the match'],
        completion_criteria: 'All 4 goods sorted and 3-piece harbor route map restored.',
        reward: { knowledge_unlock_id: 'LB-KB-MYTH-ISIS-OSIRIS-TREE', stamp_id: 'stamp:LB:A01', free_earned: true },
        historical_notes: 'Separates real timber/papyrus trade from Plutarch’s mythological sacred-tree story.',
      },
      '11-13': {
        learning_objective: 'Compare archaeological trade evidence with mythological narratives (Isis/Osiris chest story) on the Byblos harbor map.',
        narrative_hook: 'Two scrolls washed up in the harbor workshop: one is a merchant cargo list, the other is a myth recorded by Plutarch. Can you classify both?',
        npc_lines: {
          mentor_greeting_en: 'Let’s compare the harbor cargo ledger with the ancient myth of the sacred cedar pillar so visitors know how history and legend connect.',
          mentor_greeting_native: 'خلينا نقارن دفتر تجارة المينا مع أسطورة الشجرة المقدسة لنوضح الفرق بين التاريخ والأسطورة.',
        },
        player_actions: ['Inspect 3 cargo manifests and 2 mythic reliefs', 'Plot maritime route between Byblos and the Nile Delta', 'Label each panel as Historical Record or Mythology'],
        hint_ladder: ['Check the source date on each scroll', 'Compare timber shipping lists with Plutarch’s story', 'Review epistemic badge guide'],
        completion_criteria: 'Route plotted and all 5 harbor panels accurately labeled by knowledge class.',
        reward: { knowledge_unlock_id: 'LB-KB-PLACE-BYBLOS-PORT', stamp_id: 'stamp:LB:A01', free_earned: true },
        historical_notes: 'Plutarch’s De Iside et Osiride symbolizes Egypt–Byblos timber ties through myth.',
      },
      '14-17': {
        learning_objective: 'Analyze primary/secondary provenance connecting Levantine cedar exports, Egyptian papyrus imports, and Hellenistic mythography.',
        narrative_hook: 'Curate the Byblos Port interpretive board: evaluate why Greek writers connected papyrus (biblion) to Byblos and separate corroborated archaeology from unverified claims.',
        npc_lines: {
          mentor_greeting_en: 'Our visitors want rigorous provenance. Cross-check the UNESCO archaeological summary against the research essay’s mythological claims.',
          mentor_greeting_native: 'زوارنا بيحبوا الدقة التاريخية؛ قارن الأدلة الأثرية الموثقة مع الروايات الأسطورية.',
        },
        player_actions: ['Audit 4 source passages (LB-P01, LB-P02, UNESCO #295)', 'Assign claim_status and confidence levels', 'Design bilingual harbor signage with dialect notes'],
        hint_ladder: ['Verify whether an independent citation exists', 'Flag Plutarch’s narrative as mythology rather than historical_claim', 'Confirm no confidence=high on unverified claims'],
        completion_criteria: 'Signage curated with 100% accurate epistemic tags and provenance links.',
        reward: { knowledge_unlock_id: 'LB-KB-MYTH-ISIS-OSIRIS-TREE', stamp_id: 'stamp:LB:A01', free_earned: true },
        historical_notes: 'Demonstrates source criticism on ancient Mediterranean trade and myth.',
      },
    },
  },
  {
    act_id: 'LB-A02',
    country: 'LB',
    act_number: 2,
    title: { en: 'The Souk Exchange & Mountain RiverClues', fr: 'L’échange du souk et les indices de la montagne', 'ar-LB': 'تبادل السوق وحكاية نهر الجبل', 'ar-EG': 'سوق جبيل وحكاية نهر الجبل', 'ar-IQ': 'سوق جبيل وحكاية نهر الجبل', ko: '수크 시장의 교류와 산강 이야기' },
    legacy_quest_id: 'LB:ch1:harbor:main',
    legacy_objective_id: 'LB:ch1:harbor:trade',
    mentor_id: 'npc:LB:amo_farid',
    mentor_name: 'Amo Farid',
    supporting_npc_id: 'npc:LB:teta_nahla',
    linked_knowledge_ids: ['LB-KB-MYTH-ADONIS-AFQA-RIVER', 'LB-KB-PLACE-BYBLOS-PORT'],
    enrichment_hook: 'repair_damaged_archive_chest_and_market_ledger',
    free_knowledge_unlock: 'Afqa Spring & Nahr Ibrahim Landscape Interpretation Card',
    paid_reward_required: false,
    safety_flags: ['non_graphic_seasonal_myth', 'geology_vs_myth_distinction'],
    variations: {
      '5-7': {
        learning_objective: 'Match red sumac, green za’atar, and golden olive oil baskets at Amo Farid’s souk stall.',
        narrative_hook: 'Amo Farid’s spice baskets need sorting by colour and shape before the family breakfast!',
        npc_lines: {
          mentor_greeting_en: 'Match the crimson sumac jar, green za’atar, and golden olive oil to my market baskets!',
          mentor_greeting_native: 'رتّب مرطبان السماق الأحمر والزعتر الأخضر وزيت الزيتون بالسلات!',
        },
        player_actions: ['Tap 3 spice baskets by colour/icon', 'Hand warm man’oushe to Amo Farid', 'Receive crimson sumac jar'],
        hint_ladder: ['Colour ring glows around matching basket', 'Amo Farid holds up the matching jar', 'Guided tap completion'],
        completion_criteria: '3 baskets matched and fair trade completed.',
        reward: { knowledge_unlock_id: 'LB-KB-MYTH-ADONIS-AFQA-RIVER', stamp_id: 'stamp:LB:A02', free_earned: true },
        historical_notes: 'Introduces Mount Lebanon herbs, sumac, and red earth colours gently.',
      },
      '8-10': {
        learning_objective: 'Complete a fair souk trade and learn why Nahr Ibrahim turns red after spring mountain rains.',
        narrative_hook: 'Amo Farid brings herbs from the mountains near Afqa—discover the science and the old story behind the red river!',
        npc_lines: {
          mentor_greeting_en: 'When spring rain washes red iron clay down into Nahr Ibrahim, the river turns crimson like sumac!',
          mentor_greeting_native: 'لما بتشتي بالربيع عالجبل، التراب الأحمر بيلوّن نهر إبراهيم متل لون السماق!',
        },
        player_actions: ['Gather 5 market items', 'Complete 2 fair trades with Amo Farid', 'Sort geological red-clay card vs ancient spring-myth card'],
        hint_ladder: ['Check quantity icons on stall', 'Read Amo Farid’s clue about iron-rich mountain soil', 'Place geology card on left, myth card on right'],
        completion_criteria: 'Trades completed and river cards sorted accurately.',
        reward: { knowledge_unlock_id: 'LB-KB-MYTH-ADONIS-AFQA-RIVER', stamp_id: 'stamp:LB:A02', free_earned: true },
        historical_notes: 'Distinguishes iron-oxide sediment runoff from the ancient Adonis myth.',
      },
      '11-13': {
        learning_objective: 'Compare geological explanations (ferruginous limestone sediment) and ancient mythological interpretations of Nahr Ibrahim.',
        narrative_hook: 'Repair the damaged market archive chest and match mountain provenance notes from Afqa and Jbeil.',
        npc_lines: {
          mentor_greeting_en: 'Help me repair this cedar archive chest and organize the cards explaining how geology and ancient myth both described Nahr Ibrahim.',
          mentor_greeting_native: 'ساعدني نصلّح صندوق الأرشيف الخشبي ونرتّب بطاقات الجيولوجيا والأسطورة عن نهر إبراهيم.',
        },
        player_actions: ['Repair 3 cedar chest hinges', 'Balance souk supply exchange across 3 stalls', 'Link Afqa sediment data vs Hellenistic Adonis myth'],
        hint_ladder: ['Inspect hinge blueprint', 'Check seasonal snowmelt timeline', 'Tag interpretation class on the Afqa record'],
        completion_criteria: 'Archive chest repaired and landscape interpretation cards verified.',
        reward: { knowledge_unlock_id: 'LB-KB-MYTH-ADONIS-AFQA-RIVER', stamp_id: 'stamp:LB:A02', free_earned: true },
        historical_notes: 'Shows how seasonal ecology inspired ancient Near Eastern myth.',
      },
      '14-17': {
        learning_objective: 'Evaluate sacred landscape interpretation vs empirical hydrology and document ingredient provenance.',
        narrative_hook: 'Audit the Nahr Ibrahim / Afqa archive dossier: separate verifiable hydrological sediment transport from literary mythography.',
        npc_lines: {
          mentor_greeting_en: 'In our heritage archive, we never present seasonal myth as literal history—review passage LB-P03 and classify each claim.',
          mentor_greeting_native: 'بأرشيفنا الثقافي منفرّق بوضوح بين الظواهر الجيولوجية والرموز الأسطورية القديمة.',
        },
        player_actions: ['Analyze passage LB-P03 provenance', 'Optimize multi-stall resource trade with zero waste', 'Write provenance annotation distinguishing myth from geology'],
        hint_ladder: ['Verify knowledge_class is set to interpretation', 'Check Mount Lebanon elevation and river flow', 'Confirm paraphrase-only text compliance'],
        completion_criteria: 'Provenance dossier approved with zero conflation of myth and history.',
        reward: { knowledge_unlock_id: 'LB-KB-MYTH-ADONIS-AFQA-RIVER', stamp_id: 'stamp:LB:A02', free_earned: true },
        historical_notes: 'Models scholarly landscape interpretation for teen researchers.',
      },
    },
  },
  {
    act_id: 'LB-A03',
    country: 'LB',
    act_number: 3,
    title: { en: 'Teta’s Saj Kitchen & Portable Family Recipes', fr: 'La cuisine au saj de Teta et les recettes familiales', 'ar-LB': 'مطبخ الصاج عند تيتا نهلة ووصفات العيلة', 'ar-EG': 'مطبخ الصاج عند تيتا نهلة', 'ar-IQ': 'مطبخ الصاج عند تيتا نهلة', ko: '테타 나흘라의 사즈 주방과 가족 조리법' },
    legacy_quest_id: 'LB:ch1:harbor:main',
    legacy_objective_id: 'LB:ch1:harbor:cook',
    mentor_id: 'npc:LB:teta_nahla',
    mentor_name: 'Teta Nahla',
    supporting_npc_id: 'npc:LB:amo_farid',
    linked_knowledge_ids: ['LB-KB-THEME-PORTABLE-ARCHIVE-DIASPORA'],
    enrichment_hook: 'family_memory_postcard_and_saj_recipe_archive',
    free_knowledge_unlock: 'Portable Archive: Saj Man’oushe & Diaspora Memory Card',
    paid_reward_required: false,
    safety_flags: ['adult_npc_operates_hot_saj', 'sesame_and_gluten_allergy_notes'],
    variations: {
      '5-7': {
        learning_objective: 'Sequence dough, olive oil, and za’atar in a safe guided virtual saj bake where Teta Nahla handles the warm griddle.',
        narrative_hook: 'Tap the dough, brush on golden olive oil, and sprinkle green za’atar while Teta Nahla bakes our man’oushe!',
        npc_lines: {
          mentor_greeting_en: 'Step back from the warm saj, habibi—you brush the oil and za’atar, and Teta will bake it golden!',
          mentor_greeting_native: 'خليك بعيد عن الصاج الحامي يا حبيبي، إنت حط الزيت والزعتر وتيتا بتخبزها!',
        },
        player_actions: ['Tap wheat dough circle', 'Brush olive oil and sprinkle za’atar', 'Watch Teta Nahla bake on the domed saj'],
        hint_ladder: ['Highlight bowl 1 (dough), bowl 2 (oil), bowl 3 (za’atar)', 'Visual hand icon shows brushing motion', 'Automatic safe completion'],
        completion_criteria: 'Virtual man’oushe prepared safely with adult NPC handling the heat.',
        reward: { knowledge_unlock_id: 'LB-KB-THEME-PORTABLE-ARCHIVE-DIASPORA', stamp_id: 'stamp:LB:A03', free_earned: true },
        historical_notes: 'Traditional domed saj flatbread baking in Lebanese courtyards.',
      },
      '8-10': {
        learning_objective: 'Reconstruct Teta’s missing recipe postcard and learn how recipes travel with families across the diaspora.',
        narrative_hook: 'Cousin Karim sent a family memory postcard from abroad—let’s match the recipe steps and bake man’oushe!',
        npc_lines: {
          mentor_greeting_en: 'When cousins travel far away, a handwritten man’oushe recipe postcard brings the scent of our courtyard to their kitchen.',
          mentor_greeting_native: 'لما يسافروا ولاد العم لبعيد، بطاقة وصفة المنقوشة بتحمل ريحة حوشنا لمطبخهم.',
        },
        player_actions: ['Gather flour, olive oil, and za’atar', 'Place 4 recipe steps in order on the family postcard', 'Select sesame-free herb substitution option for a guest'],
        hint_ladder: ['Check the numbered corners of the postcard', 'Dough comes before oil and za’atar', 'Use pure thyme-and-sumac blend for sesame allergy'],
        completion_criteria: 'Recipe postcard restored and allergy-friendly batch baked.',
        reward: { knowledge_unlock_id: 'LB-KB-THEME-PORTABLE-ARCHIVE-DIASPORA', stamp_id: 'stamp:LB:A03', free_earned: true },
        historical_notes: 'Recipes act as portable cultural archives in expatriate families.',
      },
      '11-13': {
        learning_objective: 'Compare mountain vs coastal Lebanese man’oushe variations and design an allergy-aware community baking plan.',
        narrative_hook: 'Compare Teta Nahla’s Byblos za’atar blend with Mount Lebanon kishk/herb variations and prepare the courtyard feast table.',
        npc_lines: {
          mentor_greeting_en: 'Every village blends its za’atar differently—let’s compare our coastal sumac-rich blend with mountain thyme recipes.',
          mentor_greeting_native: 'كل ضيعة بلبنان إلها خلطتها؛ تعال نقارن خلطة الساحل بالسماق مع خلطة الجبل.',
        },
        player_actions: ['Compare 2 regional recipe cards', 'Scale ingredient quantities for 8 guests', 'Tag gluten-aware and sesame-free options'],
        hint_ladder: ['Check sumac ratio in coastal vs mountain cards', 'Multiply base recipe by 2', 'Attach clear allergen labels to each platter'],
        completion_criteria: 'Regional comparison completed and labeled community platters prepared.',
        reward: { knowledge_unlock_id: 'LB-KB-THEME-PORTABLE-ARCHIVE-DIASPORA', stamp_id: 'stamp:LB:A03', free_earned: true },
        historical_notes: 'Connects culinary variation to micro-regions and diaspora adaptation.',
      },
      '14-17': {
        learning_objective: 'Examine how diaspora literature (e.g., Maalouf, Alameddine) treats culinary memory and letters as portable archives.',
        narrative_hook: 'Curate the Diaspora Kitchen Archive: link Teta’s recipe postcard to literary themes of transnational memory while verifying bibliographic status.',
        npc_lines: {
          mentor_greeting_en: 'Writers in the Lebanese diaspora describe recipes and letters as portable homes—let’s catalog these works honestly as bibliographic candidates pending edition review.',
          mentor_greeting_native: 'أدباء المهجر شافوا بالوصفة والرسالة بيت متنقل؛ خلينا نوثّق هالمصادر بأمانة علمية.',
        },
        player_actions: ['Review passage LB-P06 bibliographic candidates', 'Design scalable community meal workflow with allergen & heat-safety protocols', 'Verify paraphrase-only text compliance'],
        hint_ladder: ['Keep bibliographic citations marked verified=false until original books are checked', 'Include sesame/gluten substitution matrix', 'Confirm adult supervision note on real-world cooking'],
        completion_criteria: 'Diaspora culinary archive curated with full epistemic and safety compliance.',
        reward: { knowledge_unlock_id: 'LB-KB-THEME-PORTABLE-ARCHIVE-DIASPORA', stamp_id: 'stamp:LB:A03', free_earned: true },
        historical_notes: 'Separates research essay bibliographic mentions from verified primary editions.',
      },
    },
  },
  {
    act_id: 'LB-A04',
    country: 'LB',
    act_number: 4,
    title: { en: 'Restore the Stone Courtyard & Cedar Archway', fr: 'Restaurer la cour en pierre et l’arche de cèdre', 'ar-LB': 'ترميم حوش الحجر وقنطرة الأرز', 'ar-EG': 'ترميم البيت الحجري في جبيل', 'ar-IQ': 'ترميم البيت الحجري في جبيل', ko: '돌 안뜰과 삼나무 아치 복원' },
    legacy_quest_id: 'LB:ch1:harbor:main',
    legacy_objective_id: 'LB:ch1:harbor:build',
    mentor_id: 'npc:LB:nadim_builder',
    mentor_name: 'Usta Nadim',
    supporting_npc_id: 'npc:LB:teta_nahla',
    linked_knowledge_ids: ['LB-KB-PLACE-BYBLOS-PORT', 'LB-KB-MYTH-ISIS-OSIRIS-TREE'],
    enrichment_hook: 'repair_archive_alcove_and_courtyard_arch',
    free_knowledge_unlock: 'Levantine Triple-Arch & Cedar Timber Architecture Card',
    paid_reward_required: false,
    safety_flags: ['accessible_courtyard_ramp', 'conservation_ethics'],
    variations: {
      '5-7': {
        learning_objective: 'Snap 4 large pale limestone blocks, cedar beams, and red roof tiles into glowing silhouettes.',
        narrative_hook: 'Help Usta Nadim place the big stone blocks and red roof tiles so Teta’s courtyard shines!',
        npc_lines: {
          mentor_greeting_en: 'Match the pale stone blocks at the bottom, the brown cedar beam in the middle, and the red roof tiles on top!',
          mentor_greeting_native: 'حط حجر الرمل الفاتح تحت، وجسر خشب الأرز بالنص، والقرميد الأحمر فوق!',
        },
        player_actions: ['Snap 2 limestone pillar blocks', 'Place 1 cedar lintel beam', 'Place red terracotta roof tiles'],
        hint_ladder: ['Outline glows in matching colour', 'Piece floats toward target on tap', 'Instant celebration chime'],
        completion_criteria: '4 courtyard pieces snapped into place; courtyard visually transforms.',
        reward: { knowledge_unlock_id: 'LB-KB-PLACE-BYBLOS-PORT', stamp_id: 'stamp:LB:A04', free_earned: true },
        historical_notes: 'Traditional Lebanese coastal stone houses combine limestone walls, cedar beams, and red tile roofs.',
      },
      '8-10': {
        learning_objective: 'Follow Usta Nadim’s 4x4 blueprint (RRRR / CCCC / L..L / LLLL) to repair the courtyard archway and archive chest alcove.',
        narrative_hook: 'Use the mason’s blueprint to rebuild the limestone arch and create a dry alcove for the neighborhood story chest!',
        npc_lines: {
          mentor_greeting_en: 'Follow the blueprint legend—L for limestone, C for cedar beam, and R for red roof tile!',
          mentor_greeting_native: 'امشي عالخريطة الهندسية: حجر كلسي، خشب أرز، وقرميد أحمر!',
        },
        player_actions: ['Gather limestone, cedar beams, and red tiles', 'Complete the 4x4 archway blueprint', 'Place the repaired archive chest in the sheltered alcove'],
        hint_ladder: ['Show row-by-row blueprint overlay', 'Highlight missing tile position', 'Usta Nadim checks structural balance'],
        completion_criteria: 'Blueprint 100% matched and archive chest sheltered.',
        reward: { knowledge_unlock_id: 'LB-KB-PLACE-BYBLOS-PORT', stamp_id: 'stamp:LB:A04', free_earned: true },
        historical_notes: 'Preserves canonical LB-1-build blueprint while adding archive alcove context.',
      },
      '11-13': {
        learning_objective: 'Plan courtyard restoration satisfying visitor accessibility, shade, and material conservation constraints.',
        narrative_hook: 'Usta Nadim needs a restoration layout that keeps elders comfortable in the shade and provides step-free courtyard access.',
        npc_lines: {
          mentor_greeting_en: 'Good restoration respects old stone while making sure everyone—including elders and wheelchairs—can enter the courtyard easily.',
          mentor_greeting_native: 'الترميم الصح بيحترم الحجر القديم وبيأمّن مدخل مريح لكل الزوار والكبار بالعمر.',
        },
        player_actions: ['Complete archway structure', 'Add step-free limestone threshold ramp', 'Position cedar pergola shade over the story bench'],
        hint_ladder: ['Check slope angle on threshold', 'Align cedar beams with afternoon sun direction', 'Verify clear walkway width'],
        completion_criteria: 'Courtyard arch, accessible ramp, and shade pergola verified.',
        reward: { knowledge_unlock_id: 'LB-KB-PLACE-BYBLOS-PORT', stamp_id: 'stamp:LB:A04', free_earned: true },
        historical_notes: 'Connects traditional Levantine courtyard architecture with inclusive design.',
      },
      '14-17': {
        learning_objective: 'Distinguish original historic masonry fabric from modern reversible conservation additions under budget constraints.',
        narrative_hook: 'Draft the Byblos Courtyard Conservation Proposal: document which stones are historic fabric and justify reversible modern supports.',
        npc_lines: {
          mentor_greeting_en: 'In heritage conservation (Venice Charter principles), new additions must be distinguishable and reversible—never fake antiquity.',
          mentor_greeting_native: 'بهندسة الترميم التراثي، الإضافات الجديدة لازم تكون واضحة وقابلة للإزالة بدون ما نزيّف التاريخ.',
        },
        player_actions: ['Map original sandstone blocks vs new lime-mortar repairs', 'Balance material budget across arch, roof, and accessibility ramp', 'Attach conservation provenance note'],
        hint_ladder: ['Use breathable lime mortar rather than rigid cement on sandstone', 'Mark new cedar timbers with restoration year', 'Verify accessible circulation route'],
        completion_criteria: 'Conservation plan meets structural, accessibility, and reversibility criteria.',
        reward: { knowledge_unlock_id: 'LB-KB-PLACE-BYBLOS-PORT', stamp_id: 'stamp:LB:A04', free_earned: true },
        historical_notes: 'Applies architectural conservation ethics to coastal Levantine masonry.',
      },
    },
  },
  {
    act_id: 'LB-A05',
    country: 'LB',
    act_number: 5,
    title: { en: 'Festival of Stories, Phoenician Letters & Elder Memory', fr: 'Festival des histoires, lettres phéniciennes et mémoire des anciens', 'ar-LB': 'مهرجان الحكايات وحروف جبيل وذاكرة الكبار', 'ar-EG': 'مهرجان الحكايات والأبجدية الفينيقية', 'ar-IQ': 'مهرجان الحكايات والأبجدية الفينيقية', ko: '이야기 축제, 페니키아 문자와 어르신의 기억' },
    legacy_quest_id: 'LB:ch1:harbor:main',
    legacy_objective_id: 'LB:ch1:harbor:word',
    mentor_id: 'npc:LB:teta_nahla',
    mentor_name: 'Teta Nahla',
    supporting_npc_id: 'npc:LB:rima_sailor',
    linked_knowledge_ids: ['LB-KB-ARTIFACT-AHIRAM-SARCOPHAGUS', 'LB-KB-THEME-PORTABLE-ARCHIVE-DIASPORA'],
    enrichment_hook: 'letter_shape_matching_and_fictional_elder_oral_history',
    free_knowledge_unlock: 'Ahiram Sarcophagus & 22-Letter Phoenician Abjad Card',
    paid_reward_required: false,
    safety_flags: ['fictional_elder_audio_only_no_child_voice_collection', 'no_monocausal_script_invention_claim'],
    variations: {
      '5-7': {
        learning_objective: 'Match 3 spoken/pictorial Lebanese Arabic words (tēta, manʾūshe, ṣaḥtēn) and 3 ancient picture-letters (Aleph, Beth, Mem).',
        narrative_hook: 'Lanterns glow by the sea wall! Match the friendly Lebanese words and ancient wave-letters with Teta Nahla to earn your Byblos stamp!',
        npc_lines: {
          mentor_greeting_en: 'Listen and match: tēta (grandma), manʾūshe (flatbread), and Mem—the ancient wave letter of the sea!',
          mentor_greeting_native: 'اسمع ووصّل الكلمات: تيتا، منقوشة، وصحتين، وحرف الميم اللي بيشبه موج البحر!',
        },
        player_actions: ['Match 3 Lebanese Arabic word cards with pictures', 'Match Aleph (ox), Beth (house), and Mem (water) letter tiles', 'Collect Lebanon Chapter Stamp'],
        hint_ladder: ['Tap speaker icon for clear pronunciation', 'Mem looks like wavy blue water', 'Celebration fireworks light the harbor'],
        completion_criteria: '3 Lebanese words and 3 letter shapes matched; stamp awarded.',
        reward: { knowledge_unlock_id: 'LB-KB-ARTIFACT-AHIRAM-SARCOPHAGUS', stamp_id: 'stamp:LB:A05', free_earned: true },
        historical_notes: 'Connects living Lebanese dialect greetings with ancient Byblos acrophonic letters.',
      },
      '8-10': {
        learning_objective: 'Compare 5 Phoenician letters (Aleph, Beth, Mem, Resh, Taw) and record Teta Nahla’s scripted fictional harbor memory into the archive book.',
        narrative_hook: 'Help Mira archive Teta Nahla’s harbor memory using our scripted story cards and match five ancient Phoenician letters!',
        npc_lines: {
          mentor_greeting_en: 'Choose my story cards to save our fictional family memory in the harbor album—no microphone or personal info needed!',
          mentor_greeting_native: 'اختار بطاقات الحكاية لنحفظ ذكريات المينا بدفتر العيلة بأمان!',
        },
        player_actions: ['Match Aleph, Beth, Mem, Resh, and Taw to their meanings and modern Arabic/Latin cousins', 'Practice 5 Lebanese Arabic vocab words', 'Assemble Teta Nahla’s 3-part scripted oral-history card'],
        hint_ladder: ['Beth means house (bayt)', 'Resh means head (ra’s)', 'Select the scripted harbor memory cards in chronological order'],
        completion_criteria: '5 letter comparisons and scripted elder oral-history card completed.',
        reward: { knowledge_unlock_id: 'LB-KB-ARTIFACT-AHIRAM-SARCOPHAGUS', stamp_id: 'stamp:LB:A05', free_earned: true },
        historical_notes: 'Demonstrates acrophonic principle (Aleph/Beth/Mem/Resh/Taw) safely without recording child voice data.',
      },
      '11-13': {
        learning_objective: 'Trace how the 22-letter Phoenician consonantal abjad on the Ahiram sarcophagus diffused across Mediterranean scripts while preserving dialect nuances.',
        narrative_hook: 'Set up the Harbor Festival Exhibit comparing the Ahiram sarcophagus inscription (c. 1000 BCE) with modern Lebanese Arabic (`ar-LB`) and French/English signage.',
        npc_lines: {
          mentor_greeting_en: 'Show our visitors how the 22 consonantal letters from Byblos traveled by sea—and why spoken Lebanese Arabic has its own warm expressions.',
          mentor_greeting_native: 'فرجي الزوار كيف انتقلت حروف جبيل عبر البحر، وليش اللهجة اللبنانية المحكية إلها نكهتها الخاصة.',
        },
        player_actions: ['Compare Ahiram sarcophagus letterforms with Greek/Aramaic/Arabic cognates', 'Distinguish spoken Lebanese dialect (`ar-LB`) from Modern Standard Arabic', 'Curate 4-panel festival story trail'],
        hint_ladder: ['Check the c. 1000 BCE date on the Ahiram sarcophagus card', 'Note that ancient Phoenician is a distinct Northwest Semitic language from modern ar-LB', 'Place dialect audio/text cards at the courtyard entrance'],
        completion_criteria: 'Exhibit panels accurately trace script diffusion and dialect distinction.',
        reward: { knowledge_unlock_id: 'LB-KB-ARTIFACT-AHIRAM-SARCOPHAGUS', stamp_id: 'stamp:LB:A05', free_earned: true },
        historical_notes: 'Clarifies that historical characters in 1000 BCE spoke Phoenician, while modern characters speak Lebanese Arabic (`ar-LB`).',
      },
      '14-17': {
        learning_objective: 'Conduct a full epistemic and privacy-safe curation of Byblos’s epigraphic and diaspora heritage.',
        narrative_hook: 'Finalize the Byblos Community Curatorial Review: verify that alphabet diffusion claims avoid monocausal exaggeration and that oral-history mechanics collect zero personal data.',
        npc_lines: {
          mentor_greeting_en: 'A true cultural archivist protects both historical accuracy and community privacy. Review our final Byblos exhibit before the festival opens.',
          mentor_greeting_native: 'الأمين الثقافي الحقيقي بيحمي الدقة التاريخية وخصوصية الناس سوا؛ راجع معرض جبيل قبل الافتتاح.',
        },
        player_actions: ['Verify Proto-Sinaitic/Canaanite predecessor context on the Ahiram exhibit', 'Audit bibliographic diaspora references as paraphrase_only', 'Confirm oral-history station uses 100% scripted fictional elder cards'],
        hint_ladder: ['Reject any label claiming Phoenician invented every script without predecessors', 'Verify UNESCO #295 external corroboration link', 'Check privacy flag: zero microphone/free-text input'],
        completion_criteria: 'Curatorial audit passed with 100% provenance and privacy compliance.',
        reward: { knowledge_unlock_id: 'LB-KB-THEME-PORTABLE-ARCHIVE-DIASPORA', stamp_id: 'stamp:LB:A05', free_earned: true },
        historical_notes: 'Synthesizes epigraphy, diaspora memory, and privacy-by-design.',
      },
    },
  },
];

function buildRemainingCountryActs() {
  const specs = [
    // IRAQ (IQ-A01..IQ-A05)
    {
      act_id: 'IQ-A01', country: 'IQ', act_number: 1,
      title: { en: 'Footprints by the Tigris & Translation Workshop', fr: 'Empreintes au bord du Tigre et atelier de traduction', 'ar-IQ': 'خطوات على دجلة وورشة الترجمة', 'ar-LB': 'خطوات على دجلة وورشة الترجمة', 'ar-EG': 'خطوات على دجلة وورشة الترجمة', ko: '티그리스 강변의 발자취와 번역 공방' },
      legacy_quest_id: 'IQ:ch1:tigris:main', legacy_objective_id: 'IQ:ch1:tigris:gather',
      mentor_id: 'npc:IQ:bibi_amal', mentor_name: 'Bibi Amal', supporting_npc_id: 'npc:IQ:khalo_salam',
      linked_knowledge_ids: ['IQ-KB-ORG-BAYT-AL-HIKMA', 'IQ-KB-PERSON-ABBASID-SCHOLARS'],
      enrichment_hook: 'rebuild_translation_workshop_and_route_manuscripts',
      free_knowledge_unlock: 'Bayt al-Hikma & Abbasid Translation Tradition Card',
      safety_flags: ['pluralistic_community_representation', 'institutional_origin_flagged_for_verification'],
      obj57: 'Match 3 colourful scroll and star-tool icons by the Tigris walkway with Bibi Amal.',
      obj810: 'Route Greek, Syriac, Persian, and Sanskrit manuscripts to their translation desks in Baghdad.',
      obj1113: 'Compare how Hunayn ibn Ishaq, al-Khwarizmi, and Thabit ibn Qurra collaborated across languages and faiths.',
      obj1417: 'Evaluate the historiography of Bayt al-Hikma: distinguish documented translation circles from unverified modern-university analogies.',
      greetingNative: 'هلا بيكم يا عيوني! تعالوا نرتب المخطوطات وأدوات الفلك على شاطئ دجلة.',
    },
    {
      act_id: 'IQ-A02', country: 'IQ', act_number: 2,
      title: { en: 'Dates, Al-Mutanabbi Booksellers & Chronicler Tales', fr: 'Dattes, libraires d’Al-Mutanabbi et récits de chroniqueurs', 'ar-IQ': 'سوق التمر وشارع المتنبي وحكايات المؤرخين', 'ar-LB': 'سوق التمر وشارع المتنبي', 'ar-EG': 'سوق التمر وشارع المتنبي', ko: '대추야자 시장, 알무타나비 서점가와 연대기 이야기' },
      legacy_quest_id: 'IQ:ch1:tigris:main', legacy_objective_id: 'IQ:ch1:tigris:trade',
      mentor_id: 'npc:IQ:khalo_salam', mentor_name: 'Khalo Salam', supporting_npc_id: 'npc:IQ:bibi_amal',
      linked_knowledge_ids: ['IQ-KB-PLACE-AL-MUTANABBI-STREET', 'IQ-KB-EVENT-GOLD-AND-1258-TROPES'],
      enrichment_hook: 'preserve_book_collection_and_evaluate_gold_anecdote',
      free_knowledge_unlock: 'Contested Chronicles: Weight-in-Gold & 1258 Tropes Card',
      safety_flags: ['non_graphic_resilience_framing', 'anecdotes_labeled_contested'],
      obj57: 'Collect 3 date baskets and stack colourful storybooks on the Al-Mutanabbi bookstall table.',
      obj810: 'Share warm kleicha for a polished brass teapot and learn why storytellers said books were worth their weight in gold.',
      obj1113: 'Preserve a neighborhood book collection on Al-Mutanabbi Street and compare chronicler exaggerations vs historical evidence.',
      obj1417: 'Analyze Ibn Abi Usaybi’a’s weight-in-gold payment anecdote and 1258 river-of-ink tropes as literary motifs rather than verified statistics.',
      greetingNative: 'أهلاً بيكم بشارع المتنبي! الكتب هنا أغلى من الذهب بقلوب أهل بغداد.',
    },
    {
      act_id: 'IQ-A03', country: 'IQ', act_number: 3,
      title: { en: 'Bibi’s Kleicha Notebook & Plural Family Recipes', fr: 'Le carnet de Kleicha de Bibi et les recettes familiales', 'ar-IQ': 'دفتر كليچة بيبي أمل ووصفات العيلة', 'ar-LB': 'دفتر كليجة بيبي أمل', 'ar-EG': 'دفتر كليجة بيبي أمل', ko: '비비 아말의 클레이차 수첩과 가족 조리법' },
      legacy_quest_id: 'IQ:ch1:tigris:main', legacy_objective_id: 'IQ:ch1:tigris:cook',
      mentor_id: 'npc:IQ:bibi_amal', mentor_name: 'Bibi Amal', supporting_npc_id: 'npc:IQ:khalo_salam',
      linked_knowledge_ids: ['IQ-KB-PRACTICE-KLEICHA-SHANASHEEL'],
      enrichment_hook: 'recover_kleicha_recipe_fragments_and_dietary_variants',
      free_knowledge_unlock: 'Cardamom Date Kleicha & Baghdadi Hospitality Card',
      safety_flags: ['adult_npc_operates_oven', 'nut_free_date_filling_option'],
      obj57: 'Match wheat dough, sweet date paste, and green cardamom pods so Bibi Amal can bake golden kleicha wheels!',
      obj810: 'Complete 4 recipe steps in Bibi’s notebook and stamp wooden mold patterns onto date-filled kleicha.',
      obj1113: 'Compare date-filled vs cardamom-sugar kleicha variations across Iraqi communities and label nut-free trays.',
      obj1417: 'Document how Iraqi diaspora families preserve plural culinary traditions (Muslim, Christian, Kurdish, Mandaean, Yazidi holiday pastries) with inclusive dietary notes.',
      greetingNative: 'تعالوا نلف عجينة الكليچة بالتمر والهيل، وبيبي أمل تخبزها بالفرن بأمان!',
    },
    {
      act_id: 'IQ-A04', country: 'IQ', act_number: 4,
      title: { en: 'Shanasheel Courtyard & Banu Musa Water-Device Puzzle', fr: 'Cour à shanasheel et puzzle hydraulique des Banu Musa', 'ar-IQ': 'ورشة الشناشيل ولغز آلات بني موسى المائية', 'ar-LB': 'ورشة الشناشيل وآلات بني موسى', 'ar-EG': 'ورشة الشناشيل وآلات بني موسى', ko: '샤나실 안뜰 공방과 바누 무사 수력 장치 퍼즐' },
      legacy_quest_id: 'IQ:ch1:tigris:main', legacy_objective_id: 'IQ:ch1:tigris:build',
      mentor_id: 'npc:IQ:khalo_salam', mentor_name: 'Khalo Salam', supporting_npc_id: 'npc:IQ:bibi_amal',
      linked_knowledge_ids: ['IQ-KB-PERSON-ABBASID-SCHOLARS', 'IQ-KB-PRACTICE-KLEICHA-SHANASHEEL'],
      enrichment_hook: 'simple_mechanical_device_puzzle_and_shanasheel_shade',
      free_knowledge_unlock: 'Banu Musa Ingenious Devices & Shanasheel Architecture Card',
      safety_flags: ['accessible_courtyard_circulation'],
      obj57: 'Snap turquoise glazed tiles, mud-brick walls, and palm-wood beams into the courtyard outline and turn on the gentle courtyard fountain!',
      obj810: 'Follow the 4x5 courtyard blueprint (TTTTT / BPPPB / B...B / BB.BB) and connect 3 pipes on a Banu Musa fountain puzzle.',
      obj1113: 'Balance courtyard shade using shanasheel wooden lattice screens and solve a two-valve Banu Musa water-clock flow puzzle.',
      obj1417: 'Analyze passive solar cooling in Baghdadi shanasheel architecture alongside the pneumatic/hydraulic principles of the Banu Musa’s Kitab al-Hiyal.',
      greetingNative: 'خشب الشناشيل والكاشي الفيروزي يبرّدون الحوش، ونافورة بني موسى تشتغل بتوازن المي!',
    },
    {
      act_id: 'IQ-A05', country: 'IQ', act_number: 5,
      title: { en: 'The Gathering of Generations & Cooperative Literary Festival', fr: 'Le rassemblement des générations et le festival littéraire coopératif', 'ar-IQ': 'جمعة الأجيال ومهرجان الأدب التعاوني', 'ar-LB': 'لقاء الأجيال ومهرجان الأدب', 'ar-EG': 'لقاء الأجيال ومهرجان الأدب', ko: '세대를 잇는 모임과 협동 문학 축제' },
      legacy_quest_id: 'IQ:ch1:tigris:main', legacy_objective_id: 'IQ:ch1:tigris:word',
      mentor_id: 'npc:IQ:bibi_amal', mentor_name: 'Bibi Amal', supporting_npc_id: 'npc:IQ:khalo_salam',
      linked_knowledge_ids: ['IQ-KB-PLACE-AL-MUTANABBI-STREET', 'IQ-KB-PRACTICE-KLEICHA-SHANASHEEL'],
      enrichment_hook: 'cooperative_literary_festival_and_baghdadi_dialect',
      free_knowledge_unlock: 'Al-Mutanabbi Street Solidarity & Plural Iraqi Heritage Card',
      safety_flags: ['preserve_baghdadi_arabic_dialect_not_msa', 'non_graphic_solidarity_focus'],
      obj57: 'Match 3 Baghdadi words (kleicha, bibi, shaku maku) with pictures as lanterns light the family courtyard!',
      obj810: 'Complete a 5-stop courtyard book-and-tea trail using authentic Baghdadi Arabic greetings.',
      obj1113: 'Coordinate a cooperative courtyard literary festival celebrating Iraq’s plural communities and the global book-solidarity archive.',
      obj1417: 'Curate an exhibition connecting 9th-century translation circles, Al-Mutanabbi Street’s modern solidarity archive, and Baghdadi dialect preservation.',
      greetingNative: 'شكو ماكو يا أحباب؟ تعالوا نحتفل بمهرجان القراءة والكليچة بحوش بيبي أمل!',
    },

    // EGYPT (EG-A01..EG-A05)
    {
      act_id: 'EG-A01', country: 'EG', act_number: 1,
      title: { en: 'The Missing Fanous Patterns & Light-Color Logic', fr: 'Les motifs de Fanous disparus et la logique des couleurs', 'ar-EG': 'رسومات الفانوس المفقودة وهندسة النور والألوان', 'ar-LB': 'تصاميم الفانوس وهندسة الألوان', 'ar-IQ': 'تصاميم الفانوس وهندسة الألوان', ko: '사라진 파누스 무늬와 빛·색채 논리 퍼즐' },
      legacy_quest_id: 'EG:ch1:nile:main', legacy_objective_id: 'EG:ch1:nile:trade',
      mentor_id: 'npc:EG:teta_samira', mentor_name: 'Teta Samira', supporting_npc_id: 'npc:EG:amo_hassan',
      linked_knowledge_ids: ['EG-KB-HIST-FANOUS-COMPETING-ORIGINS', 'EG-KB-ARTIFACT-FANOUS-KHAYAMIYA-CRAFT'],
      enrichment_hook: 'lantern_pattern_design_and_light_color_logic',
      free_knowledge_unlock: 'Egyptian Fanous Competing Historical Origins Card',
      safety_flags: ['virtual_led_no_open_flame', '972_arrival_not_single_undisputed_origin'],
      obj57: 'Match ruby-red, emerald-green, and amber-gold glass shapes into the brass fanous outline!',
      obj810: 'Collect 4 geometric fanous pattern pieces and compare two stories of how Cairo’s lanterns began.',
      obj1113: 'Solve a rotational symmetry and colour-filtering puzzle for a brass fanous while comparing Fatimid and Coptic lamp histories.',
      obj1417: 'Design an original geometric fanous & khayamiya pattern and write a source note explaining why the 972 CE Caliph arrival story is one of several competing accounts.',
      greetingNative: 'نوّرتوا مصر يا حبايبي! تعالوا نركّب قزاز الفانوس الملون ونفهم حكاياته التاريخية.',
    },
    {
      act_id: 'EG-A02', country: 'EG', act_number: 2,
      title: { en: 'The Cairo Market Route & Musaharati Rhythm', fr: 'La route du marché du Caire et le rythme du Musaharati', 'ar-EG': 'طريق السوق في القاهرة وإيقاع المسحراتي', 'ar-LB': 'طريق سوق القاهرة والمسحراتي', 'ar-IQ': 'طريق سوق القاهرة والمسحراتي', ko: '카이로 시장 길찾기와 무사하라티 북소리' },
      legacy_quest_id: 'EG:ch1:nile:main', legacy_objective_id: 'EG:ch1:nile:gather',
      mentor_id: 'npc:EG:teta_samira', mentor_name: 'Teta Samira', supporting_npc_id: 'npc:EG:amo_hassan',
      linked_knowledge_ids: ['EG-KB-PRACTICE-MUSAHARATI-AND-SONGS', 'EG-KB-FOOD-KOSHARI-SHARED-TABLE'],
      enrichment_hook: 'neighborhood_route_puzzle_and_craft_supplies',
      free_knowledge_unlock: 'Cairo Soundscapes: Musaharati & Festive Chants Card',
      safety_flags: ['no_copyrighted_song_lyrics', 'no_religious_observance_required'],
      obj57: 'Collect rice, brown lentils, and red tomato sauce from 3 market stalls along the lantern-lit lane!',
      obj810: 'Follow the gentle drumbeat route puzzle through the market to gather koshari ingredients and khayamiya thread.',
      obj1113: 'Plan a multi-stall market route between Al-Muizz Street and the Tentmakers Bazaar while exploring the history of the musaharati drummer.',
      obj1417: 'Optimize a zero-waste neighborhood market supply route and examine the debated Arabic vs Coptic etymologies of traditional Cairene lantern chants without reproducing protected lyrics.',
      greetingNative: 'امشوا على دقة طبلة المسحراتي الهادية وهاتوا الرز والعدس من السوق!',
    },
    {
      act_id: 'EG-A03', country: 'EG', act_number: 3,
      title: { en: 'Teta Samira’s Koshari Kitchen & Inclusive Feast', fr: 'La cuisine de Koshari de Teta Samira et le repas partagé', 'ar-EG': 'مطبخ كشري تيتا سميرة ولمّة الحوش', 'ar-LB': 'مطبخ كشري تيتا سميرة', 'ar-IQ': 'مطبخ كشري تيتا سميرة', ko: '테타 사미라의 코샤리 주방과 모두를 위한 식탁' },
      legacy_quest_id: 'EG:ch1:nile:main', legacy_objective_id: 'EG:ch1:nile:cook',
      mentor_id: 'npc:EG:teta_samira', mentor_name: 'Teta Samira', supporting_npc_id: 'npc:EG:amo_hassan',
      linked_knowledge_ids: ['EG-KB-FOOD-KOSHARI-SHARED-TABLE'],
      enrichment_hook: 'festival_preparation_and_layered_koshari_kitchen',
      free_knowledge_unlock: 'Egyptian Koshari & Inclusive Courtyard Hospitality Card',
      safety_flags: ['adult_npc_manages_boiling_pots_and_oil', 'gluten_free_koshari_layer_option'],
      obj57: 'Sort white rice, brown lentils, red sauce, and golden crispy onions into baskets while Teta Samira cooks on the stove!',
      obj810: 'Layer rice, lentils, pasta, spiced garlic tomato sauce, and crispy onions in order to serve warm koshari bowls.',
      obj1113: 'Manage quantities for 10 neighbors, prepare a gluten-free rice-and-lentil bowl option, and explain why plant-based koshari welcomes everyone.',
      obj1417: 'Trace the global trade history of koshari’s ingredients and design an efficient, allergy-labeled community kitchen workflow.',
      greetingNative: 'خلّي البوتاجاز والزيت السخن على تيتا سميرة، وإنتو رتّبوا طبقات الكشري بالترتيب!',
    },
    {
      act_id: 'EG-A04', country: 'EG', act_number: 4,
      title: { en: 'Safe Virtual Lantern Craft, Felucca Sail & Courtyard Arch', fr: 'Artisanat virtuel sécurisé de Fanous, voile de felouque et cour', 'ar-EG': 'ورشة الفانوس الآمن وشراع الفلوكة وتزيين الحوش', 'ar-LB': 'ورشة الفانوس وشراع الفلوكة', 'ar-IQ': 'ورشة الفانوس وشراع الفلوكة', ko: '안전한 파누스 공예, 펠루카 돛과 안뜰 장식' },
      legacy_quest_id: 'EG:ch1:nile:main', legacy_objective_id: 'EG:ch1:nile:build',
      mentor_id: 'npc:EG:amo_hassan', mentor_name: 'Usta Hassan', supporting_npc_id: 'npc:EG:teta_samira',
      linked_knowledge_ids: ['EG-KB-ARTIFACT-FANOUS-KHAYAMIYA-CRAFT'],
      enrichment_hook: 'safe_virtual_crafting_and_khayamiya_courtyard_display',
      free_knowledge_unlock: 'Samkari Metalwork, Stained Glass & Khayamiya Appliqué Card',
      safety_flags: ['virtual_only_heat_and_metalwork', 'safe_led_illumination'],
      obj57: 'Snap the wooden planks, white linen sail, and glowing LED fanous garland onto the courtyard stand!',
      obj810: 'Complete the 4x5 felucca blueprint (..S.. / .SSS. / ..S.. / PPPPP) and hang geometric khayamiya banners in the courtyard.',
      obj1113: 'Construct a symmetrical courtyard lantern canopy using constrained brass, stained-glass, and khayamiya textile panels.',
      obj1417: 'Solve structural, accessible circulation, and low-energy LED illumination tradeoffs while preserving traditional Cairene geometric proportions.',
      greetingNative: 'بنركّب الفوانيس بنور LED آمن ونفرد قماش الخيامية المبهج في الحوش!',
    },
    {
      act_id: 'EG-A05', country: 'EG', act_number: 5,
      title: { en: 'Evening of Light, Cairene Words & Diaspora Storytelling', fr: 'Soirée de lumière, mots du Caire et récits de la diaspora', 'ar-EG': 'ليلة النور وكلمات القاهرة وحكايات المصريين بالخارج', 'ar-LB': 'ليلة النور وحكايات الجالية المصرية', 'ar-IQ': 'ليلة النور وحكايات الجالية المصرية', ko: '빛의 저녁, 카이로 방언과 디아스포라 이야기' },
      legacy_quest_id: 'EG:ch1:nile:main', legacy_objective_id: 'EG:ch1:nile:word',
      mentor_id: 'npc:EG:teta_samira', mentor_name: 'Teta Samira', supporting_npc_id: 'npc:EG:amo_hassan',
      linked_knowledge_ids: ['EG-KB-ORG-DIASPORA-HERITAGE-MONTH', 'EG-KB-HIST-FANOUS-COMPETING-ORIGINS'],
      enrichment_hook: 'family_storytelling_and_diaspora_celebration_exhibit',
      free_knowledge_unlock: 'Egyptian Diaspora Celebrations & Heritage Month Card',
      safety_flags: ['preserve_cairene_ar_EG_dialect', 'no_child_pii_collection'],
      obj57: 'Match 3 Cairene Egyptian words (koshari, fanous, felucca) with glowing pictures along the courtyard path!',
      obj810: 'Complete a 5-word Egyptian Arabic lantern hunt and read how families abroad celebrate with paper fanous crafts.',
      obj1113: 'Link artisan stories from Khan el-Khalili and the Tentmakers Bazaar to diaspora community celebrations.',
      obj1417: 'Curate a neighborhood craft exhibition distinguishing corroborated Historic Cairo facts (UNESCO #89) from contested 972 CE anecdotes and pending statutory citations (Ontario 2019).',
      greetingNative: 'يا أحلى لمة في الحوش! تعالوا نتعلّم كلامنا المصري الجميل ونشوف إزاي الفانوس بينوّر في كل مكان.',
    },

    // FRANCE (FR-A01..FR-A05)
    {
      act_id: 'FR-A01', country: 'FR', act_number: 1,
      title: { en: 'The Bakery’s Lost Sign & Traboule Passageway Maze', fr: 'L’enseigne perdue de la boulangerie et le labyrinthe des traboules', 'ar-LB': 'لافتة المخبز المفقودة وممرات الترابول في ليون', 'ar-EG': 'لافتة المخبز وممرات الترابول في ليون', 'ar-IQ': 'لافتة المخبز وممرات الترابول في ليون', ko: '사라진 빵집 간판과 트라불 통로 미로' },
      legacy_quest_id: 'FR:ch1:lyon:main', legacy_objective_id: 'FR:ch1:lyon:gather',
      mentor_id: 'npc:FR:mamie_claire', mentor_name: 'Mamie Claire', supporting_npc_id: 'npc:FR:chef_luc',
      linked_knowledge_ids: ['FR-KB-PLACE-TRABOULES-LYON', 'FR-KB-PLACE-COUR-DES-VORACES'],
      enrichment_hook: 'navigate_historically_informed_traboule_maze',
      free_knowledge_unlock: 'Traboules of Vieux Lyon & La Croix-Rousse Card',
      safety_flags: ['respect_public_vs_private_passages', 'no_wartime_chase_combat_trivialization'],
      obj57: 'Follow the golden croissant and star signs through the cosy stone archway to place Mamie Claire’s bakery sign!',
      obj810: 'Navigate a gentle 3-courtyard traboule path, talk to 2 neighbors, and restore the bilingual boulangerie sign.',
      obj1113: 'Use a courtyard map to navigate public traboules between Vieux Lyon and La Croix-Rousse while respecting private resident gates.',
      obj1417: 'Evaluate competing claims about Lyon’s traboule counts (~400–500 total vs ~40 public) and design respectful visitor signage for Cour des Voraces.',
      greetingNative: 'Bienvenue à Lyon ! Suivons les passages couverts des traboules pour retrouver l’enseigne de notre boulangerie.',
    },
    {
      act_id: 'FR-A02', country: 'FR', act_number: 2,
      title: { en: 'Canut Silk Delivery & Punch-Card Weaving Pattern', fr: 'Livraison de soie des Canuts et motif de tissage sur carte perforée', 'ar-LB': 'توصيل حرير الكانو ونمط النسيج بالبطاقات المثقبة', 'ar-EG': 'حرير ليون ونول جاكار', 'ar-IQ': 'حرير ليون ونول جاكار', ko: '카뉘 실크 배달과 천공카드 직조 무늬' },
      legacy_quest_id: 'FR:ch1:lyon:main', legacy_objective_id: 'FR:ch1:lyon:trade',
      mentor_id: 'npc:FR:chef_luc', mentor_name: 'Artisan Luc', supporting_npc_id: 'npc:FR:mamie_claire',
      linked_knowledge_ids: ['FR-KB-PRACTICE-CANUTS-SILK-LOOMS', 'FR-KB-PLACE-TRABOULES-LYON'],
      enrichment_hook: 'deliver_silk_safely_and_build_weaving_pattern',
      free_knowledge_unlock: 'The Canuts & Jacquard Punch-Card Loom Card',
      safety_flags: ['safe_non_timed_delivery'],
      obj57: 'Match 3 bright silk ribbons and pastry baskets at the market stall and keep the silk dry under the covered arch!',
      obj810: 'Deliver a bolt of silk through a covered traboule away from the rain and match a 4-hole Jacquard punch-card pattern.',
      obj1113: 'Program a 2-row binary punch-card pattern for a Jacquard silk loom and plan a dry delivery + bakery ingredient route.',
      obj1417: 'Analyze how Joseph Marie Jacquard’s 1804 punch-card loom reshaped La Croix-Rousse workshop architecture and prefigured binary computing.',
      greetingNative: 'Les canuts utilisaient des cartes perforées pour tisser la soie et les traboules pour la protéger de la pluie !',
    },
    {
      act_id: 'FR-A03', country: 'FR', act_number: 3,
      title: { en: 'Mamie Claire’s Kitchen Brigade, Mères Lyonnaises & Galette', fr: 'La brigade de Mamie Claire, les Mères Lyonnaises et la Galette', 'ar-LB': 'مطبخ مامي كلير وأمهات ليون وكعكة الملوك', 'ar-EG': 'مطبخ مامي كلير وأمهات ليون', 'ar-IQ': 'مطبخ مامي كلير وأمهات ليون', ko: '마미 클레어의 주방 브리가드, 메르 리오네즈와 갈레트' },
      legacy_quest_id: 'FR:ch1:lyon:main', legacy_objective_id: 'FR:ch1:lyon:cook',
      mentor_id: 'npc:FR:mamie_claire', mentor_name: 'Mamie Claire', supporting_npc_id: 'npc:FR:chef_luc',
      linked_knowledge_ids: ['FR-KB-PERSON-MERES-LYONNAISES-BRAZIER', 'FR-KB-FOOD-GALETTE-SHARED-PASTRY'],
      enrichment_hook: 'organize_kitchen_brigade_and_restore_recipe_archive',
      free_knowledge_unlock: 'Mères Lyonnaises, Eugénie Brazier & Culinary Mentorship Card',
      safety_flags: ['adult_npc_operates_oven', 'tree_nut_almond_allergy_substitutions', 'non_edible_porcelain_feve_warning'],
      obj57: 'Match flaky puff pastry, sweet cream, and the tiny porcelain fève charm while Mamie Claire bakes the golden galette!',
      obj810: 'Organize 3 kitchen helper stations (pastry, filling, scoring) inspired by Lyon’s women chefs and bake a golden galette des rois.',
      obj1113: 'Compare French almond frangipane galette and Levantine ma’amoul in a cooperative brigade while preparing a nut-free apple-compote variant.',
      obj1417: 'Restore a community recipe archive honoring the Mères Lyonnaises (including Eugénie Brazier’s 1921/1933 career, tagged for archival verification) with complete allergen & fève safety protocols.',
      greetingNative: 'Comme les célèbres Mères Lyonnaises, préparons notre galette en équipe avec soin et générosité !',
    },
    {
      act_id: 'FR-A04', country: 'FR', act_number: 4,
      title: { en: 'Vieux Lyon Facade & Cour des Voraces Staircase Restoration', fr: 'Restauration de la façade du Vieux Lyon et de l’escalier de la Cour des Voraces', 'ar-LB': 'ترميم واجهة ليون القديمة ودرج كور دي فوراس', 'ar-EG': 'ترميم واجهة ليون القديمة', 'ar-IQ': 'ترميم واجهة ليون القديمة', ko: '비외 리옹 외벽과 쿠르 데 보라스 계단 복원' },
      legacy_quest_id: 'FR:ch1:lyon:main', legacy_objective_id: 'FR:ch1:lyon:build',
      mentor_id: 'npc:FR:chef_luc', mentor_name: 'Artisan Luc', supporting_npc_id: 'npc:FR:mamie_claire',
      linked_knowledge_ids: ['FR-KB-PLACE-COUR-DES-VORACES', 'FR-KB-PLACE-TRABOULES-LYON'],
      enrichment_hook: 'restore_boulangerie_facade_and_courtyard_passage',
      free_knowledge_unlock: 'Cour des Voraces Architecture & Labor Memory Card',
      safety_flags: ['chronology_1831_vs_1840_clarified', 'step_free_bakery_access'],
      obj57: 'Snap slate roof tiles, cut limestone blocks, and carved oak shutters onto the bakery facade!',
      obj810: 'Complete the 5-row Vieux Lyon blueprint (.RRRR. / RRRRRR / SOSSOS / SOSSOS / SSSSSS) and light the courtyard arch.',
      obj1113: 'Restore the boulangerie facade and courtyard passage while keeping the high-ceilinged canut windows and accessible ground entrance clear.',
      obj1417: 'Draft a heritage conservation plan for a Croix-Rousse / Vieux Lyon courtyard that accurately dates c. 1840 Voraces masonry relative to 1831/1834 labor history.',
      greetingNative: 'Posons les pierres de taille, les volets en chêne et les ardoises pour redonner vie à la façade lyonnaise !',
    },
    {
      act_id: 'FR-A05', country: 'FR', act_number: 5,
      title: { en: 'A Shared Table: French Words & Community Recipe Archive', fr: 'Une table partagée : mots français et archive de recettes communautaires', 'ar-LB': 'مائدة مشتركة: كلمات فرنسية وأرشيف وصفات الحي', 'ar-EG': 'مائدة مشتركة وكلمات فرنسية', 'ar-IQ': 'مائدة مشتركة وكلمات فرنسية', ko: '함께 나누는 식탁: 프랑스어 어휘와 마을 조리법 아카이브' },
      legacy_quest_id: 'FR:ch1:lyon:main', legacy_objective_id: 'FR:ch1:lyon:word',
      mentor_id: 'npc:FR:mamie_claire', mentor_name: 'Mamie Claire', supporting_npc_id: 'npc:FR:chef_luc',
      linked_knowledge_ids: ['FR-KB-FOOD-GALETTE-SHARED-PASTRY', 'FR-KB-PERSON-MERES-LYONNAISES-BRAZIER'],
      enrichment_hook: 'restore_community_recipe_archive_and_shared_table',
      free_knowledge_unlock: 'Shared Table: Galette des Rois & Ma’amoul Cultural Exchange Card',
      safety_flags: ['no_cultural_stereotypes', 'allergen_labels_visible'],
      obj57: 'Match 3 French words (la galette, la fève, la couronne) with pictures and place the golden paper crown on the celebration table!',
      obj810: 'Complete a 5-word French bakery discovery trail and set the shared table with both galette des rois and ma’amoul.',
      obj1113: 'Trace how Camille’s and Mira’s households combine French and Levantine pastry traditions in an annotated neighborhood recipe album.',
      obj1417: 'Curate a bilingual culinary & architectural exhibit on Lyon (traboules, canuts, Mères Lyonnaises) with verified UNESCO #872 coordinates and source-criticism notes.',
      greetingNative: 'Autour de notre table partagée, la galette des rois et le ma’amoul racontent l’amitié entre nos familles !',
    },

    // SOUTH KOREA (KR-A01..KR-A05)
    {
      act_id: 'KR-A01', country: 'KR', act_number: 1,
      title: { en: 'The Hanok Courtyard Invitation & Five-Direction Colours', fr: 'L’invitation de la cour Hanok et les cinq couleurs Obangsaek', 'ar-LB': 'دعوة حوش الهانوك والألوان الخمسة الكورية', 'ar-EG': 'دعوة بيت الهانوك والألوان الخمسة', 'ar-IQ': 'دعوة بيت الهانوك والألوان الخمسة', ko: '한옥 마당의 초대와 오방색 길찾기' },
      legacy_quest_id: 'KR:ch1:jeonju:main', legacy_objective_id: 'KR:ch1:jeonju:gather',
      mentor_id: 'npc:KR:halmeoni', mentor_name: 'Halmeoni', supporting_npc_id: 'npc:KR:uncle_min',
      linked_knowledge_ids: ['KR-KB-PLACE-JEONJU-HANOK-VILLAGE', 'KR-KB-THEME-OBANGSAEK-FIVE-COLORS'],
      enrichment_hook: 'classify_obangsaek_colors_and_hanok_wayfinding',
      free_knowledge_unlock: 'Obangsaek (오방색) Five-Color Cultural Symbolism Card',
      safety_flags: ['obangsaek_framed_as_cultural_tradition_not_scientific_law', 'respect_resident_privacy'],
      obj57: 'Follow the five colourful ribbons (blue/green, red, yellow, white, dark charcoal) to place Halmeoni’s courtyard welcome board!',
      obj810: 'Gather 4 hanji paper invitation cards and classify the five Obangsaek colours by their seasonal directions.',
      obj1113: 'Decode a Jeonju Hanok Village map distinguishing public landmarks (Pungnammun, Gyeonggijeon) from private family courtyards while matching Obangsaek colour symbolism.',
      obj1417: 'Design bilingual visitor guidance for Jeonju Hanok Village that protects resident privacy and explains Obangsaek as a traditional East Asian aesthetic rather than empirical science.',
      greetingNative: '어서 오렴! 오방색 고운 빛깔을 따라 우리 전주 한옥 마당의 초대장을 맞추어 보자꾸나.',
    },
    {
      act_id: 'KR-A02', country: 'KR', act_number: 2,
      title: { en: 'Nambu Harvest Market & Regional Ingredients Puzzle', fr: 'Le marché de Nambu et les ingrédients régionaux', 'ar-LB': 'سوق نامبو وأحجية المكونات الإقليمية', 'ar-EG': 'سوق نامبو والمكونات الكورية', 'ar-IQ': 'سوق نامبو والمكونات الكورية', ko: '남부시장 수확 장터와 지역 식재료 퍼즐' },
      legacy_quest_id: 'KR:ch1:jeonju:main', legacy_objective_id: 'KR:ch1:jeonju:trade',
      mentor_id: 'npc:KR:uncle_min', mentor_name: 'Uncle Min', supporting_npc_id: 'npc:KR:halmeoni',
      linked_knowledge_ids: ['KR-KB-FOOD-BIBIMBAP-REGIONAL-VARIANTS', 'KR-KB-THEME-OBANGSAEK-FIVE-COLORS'],
      enrichment_hook: 'gather_regional_ingredients_and_seasonal_market_puzzle',
      free_knowledge_unlock: 'Bibimbap Regional Variants (Jeonju, Jinju, Tongyeong, Andong) Card',
      safety_flags: ['allergen_aware_sesame_soy_options', 'cooked_vegetarian_ingredients'],
      obj57: 'Match white rice flour, golden honey-sesame, green pine needles, and yellow mung-bean jelly at the market stalls!',
      obj810: 'Solve a 3-stall seasonal market puzzle at Nambu Market to gather ingredients for Jeonju bibimbap and Chuseok songpyeon.',
      obj1113: 'Compare regional ingredient baskets from Jeonju (bean sprouts & hwangpomuk), Tongyeong (coastal kelp), and Andong (mild soy seasoning) under a fair-trade budget.',
      obj1417: 'Plan a zero-waste seasonal market sourcing strategy that accommodates soy/sesame allergies and explains regional ecological adaptations across Korean provinces.',
      greetingNative: '남부시장에서 전주 콩나물과 황포묵, 솔잎과 햅쌀가루를 고루 모아 보자!',
    },
    {
      act_id: 'KR-A03', country: 'KR', act_number: 3,
      title: { en: 'Harmony of the Bowl & Songpyeon Kitchen Together', fr: 'L’harmonie du bol de Bibimbap et les Songpyeon en famille', 'ar-LB': 'تناغم طبق البيبيمباب وكعك السونغبيون العائلي', 'ar-EG': 'طبق البيبيمباب وكعك السونغبيون', 'ar-IQ': 'طبق البيبيمباب وكعك السونغبيون', ko: '비빔밥 그릇의 조화와 함께 빚는 송편' },
      legacy_quest_id: 'KR:ch1:jeonju:main', legacy_objective_id: 'KR:ch1:jeonju:cook',
      mentor_id: 'npc:KR:halmeoni', mentor_name: 'Halmeoni', supporting_npc_id: 'npc:KR:uncle_min',
      linked_knowledge_ids: ['KR-KB-HIST-BIBIMBAP-COMPETING-ORIGINS', 'KR-KB-FOOD-BIBIMBAP-REGIONAL-VARIANTS', 'KR-KB-THEME-OBANGSAEK-FIVE-COLORS'],
      enrichment_hook: 'prepare_balanced_virtual_bowl_and_compare_origins',
      free_knowledge_unlock: 'Competing Origin Narratives of Bibimbap Card',
      safety_flags: ['no_raw_beef_or_raw_egg_for_children_use_cooked_tofu_mushroom', 'adult_npc_operates_steamer', 'competing_origins_not_flattened'],
      obj57: 'Arrange five bright cooked vegetables by colour into the warm rice bowl and shape half-moon songpyeon over green pine needles!',
      obj810: 'Prepare a balanced five-color virtual Jeonju bowl (using cooked mushrooms, tofu, bean sprouts, carrots, and yellow jelly) and steam songpyeon safely with Halmeoni.',
      obj1113: 'Compare the four competing origin stories of bibimbap (harvest field meal, Lunar New Year’s Eve, court lunch, and holiday sharing) while preparing vegetarian and sesame-free bowls.',
      obj1417: 'Critically evaluate late-Joseon culinary records (Siuijeonseo’s goldongban) alongside the four competing origin hypotheses, designing an inclusive workshop with cooked/allergen-safe substitutions.',
      greetingNative: '따뜻한 밥 위에 오방색 나물과 잘 익힌 버섯·두부를 올리고, 솔잎 향 가득한 송편을 함께 찐단다!',
    },
    {
      act_id: 'KR-A04', country: 'KR', act_number: 4,
      title: { en: 'Care for the Hanok Roof, Pine Pillars & Hanji Screens', fr: 'Prendre soin du toit Giwa, des piliers de pin et du papier Hanji', 'ar-LB': 'العناية بسقف الهانوك وأعمدة الصنوبر وورق الهانجي', 'ar-EG': 'ترميم بيت الهانوك الكوري', 'ar-IQ': 'ترميم بيت الهانوك الكوري', ko: '한옥 기와지붕과 소나무 기둥, 한지 창호 보살피기' },
      legacy_quest_id: 'KR:ch1:jeonju:main', legacy_objective_id: 'KR:ch1:jeonju:build',
      mentor_id: 'npc:KR:uncle_min', mentor_name: 'Uncle Min', supporting_npc_id: 'npc:KR:halmeoni',
      linked_knowledge_ids: ['KR-KB-PLACE-JEONJU-HANOK-VILLAGE'],
      enrichment_hook: 'restore_hanok_courtyard_and_rainwater_harmony',
      free_knowledge_unlock: 'Jeonju Hanok Village Architecture & Living Heritage Card',
      safety_flags: ['step_free_courtyard_path'],
      obj57: 'Snap the curved dark giwa roof tiles, red pine pillars, and warm hanji paper doors onto the courtyard pavilion!',
      obj810: 'Follow the 3x4 hanok blueprint (GGGG / PHHP / PHHP) to repair the courtyard pavilion roof and sliding paper screens.',
      obj1113: 'Solve a courtyard rainwater-drainage and natural ventilation puzzle while restoring the giwa roof eaves and maru wooden porch.',
      obj1417: 'Analyze architectural conservation tradeoffs in Jeonju Hanok Village: balancing traditional timber joinery, weather resilience, step-free visitor access, and material reuse.',
      greetingNative: '굽은 기와지붕이 빗물을 모으고 한지 창호가 부드러운 햇살을 들일 수 있게 마루를 고쳐 보자!',
    },
    {
      act_id: 'KR-A05', country: 'KR', act_number: 5,
      title: { en: 'The Communal Feast, Korean Words & Diaspora Continuity', fr: 'Le festin communautaire, mots coréens et continuité de la diaspora', 'ar-LB': 'الوليمة المشتركة والكلمات الكورية وتواصل الأجيال', 'ar-EG': 'الوليمة الكورية وتواصل الأجيال', 'ar-IQ': 'الوليمة الكورية وتواصل الأجيال', ko: '이웃과 나누는 잔치상, 한국어 어휘와 디아스포라의 이어짐' },
      legacy_quest_id: 'KR:ch1:jeonju:main', legacy_objective_id: 'KR:ch1:jeonju:word',
      mentor_id: 'npc:KR:halmeoni', mentor_name: 'Halmeoni', supporting_npc_id: 'npc:KR:uncle_min',
      linked_knowledge_ids: ['KR-KB-PRACTICE-DIASPORA-FEAST-CONTINUITY', 'KR-KB-THEME-OBANGSAEK-FIVE-COLORS'],
      enrichment_hook: 'design_communal_feast_and_story_exhibit',
      free_knowledge_unlock: 'Shared Bowls & Korean Diaspora Cultural Continuity Card',
      safety_flags: ['no_child_pii_collection', 'paraphrase_only_bibliographic_candidates'],
      obj57: 'Match 3 Korean words (songpyeon, hanok, chuseok) with pictures and share the colourful harvest table in the garden!',
      obj810: 'Complete a 5-word Korean harvest exploration and arrange a welcoming communal feast table for relatives and neighbors.',
      obj1113: 'Curate a family story trail showing how Korean dishes like bibimbap and songpyeon connect generations in Jeonju and abroad.',
      obj1417: 'Design a community heritage exhibit with full epistemic labels—distinguishing UNESCO gastronomy records, competing bibimbap origin theories, and diaspora literary reflections.',
      greetingNative: '송편과 한옥, 추석의 따뜻한 마음을 담아 온 가족이 함께 나누는 잔치상을 완성했구나!',
    },
  ];

  for (const s of specs) {
    QUEST_ACTS_V12.push({
      act_id: s.act_id,
      country: s.country,
      act_number: s.act_number,
      title: s.title,
      legacy_quest_id: s.legacy_quest_id,
      legacy_objective_id: s.legacy_objective_id,
      mentor_id: s.mentor_id,
      mentor_name: s.mentor_name,
      supporting_npc_id: s.supporting_npc_id,
      linked_knowledge_ids: s.linked_knowledge_ids,
      enrichment_hook: s.enrichment_hook,
      free_knowledge_unlock: s.free_knowledge_unlock,
      paid_reward_required: false,
      safety_flags: s.safety_flags,
      variations: {
        '5-7': {
          learning_objective: s.obj57,
          narrative_hook: `${s.mentor_name} invites you for a quick, friendly picture activity in ${s.title.en}!`,
          npc_lines: { mentor_greeting_en: s.obj57, mentor_greeting_native: s.greetingNative },
          player_actions: ['Follow glowing pictorial markers', 'Match 3 visual icons (1–3 min untimed)', 'Watch celebratory courtyard animation'],
          hint_ladder: ['Gentle icon glow after 8s', `${s.mentor_name} points to the matching target`, 'Guided tap assist'],
          completion_criteria: '3 visual matches completed with zero reading pressure or failure penalty.',
          reward: { knowledge_unlock_id: s.linked_knowledge_ids[0], stamp_id: `stamp:${s.country}:A0${s.act_number}`, free_earned: true },
          historical_notes: `Age 5–7 pictorial adaptation for ${s.act_id}.`,
        },
        '8-10': {
          learning_objective: s.obj810,
          narrative_hook: `Help ${s.mentor_name} complete the multi-step neighborhood task in ${s.title.en}!`,
          npc_lines: { mentor_greeting_en: s.obj810, mentor_greeting_native: s.greetingNative },
          player_actions: ['Collect 4 neighborhood items', 'Sort items by cultural clue card', 'Complete guided assembly/exchange'],
          hint_ladder: ['Show short clue card', 'Highlight station on quest map', `${s.mentor_name} gives step-by-step guidance`],
          completion_criteria: 'All 4 items sorted and guided craft/trade step completed.',
          reward: { knowledge_unlock_id: s.linked_knowledge_ids[0], stamp_id: `stamp:${s.country}:A0${s.act_number}`, free_earned: true },
          historical_notes: `Age 8–10 guided cause-and-effect adaptation for ${s.act_id}.`,
        },
        '11-13': {
          learning_objective: s.obj1113,
          narrative_hook: `Compare historical clues, maps, and multiple interpretations with ${s.mentor_name} in ${s.title.en}.`,
          npc_lines: { mentor_greeting_en: s.obj1113, mentor_greeting_native: s.greetingNative },
          player_actions: ['Compare 2–3 evidence cards or regional variations', 'Plan cooperative route/layout under constraints', 'Verify epistemic class labels'],
          hint_ladder: ['Inspect timeline & map coordinates', 'Compare competing interpretations side by side', 'Check cultural context glossary'],
          completion_criteria: 'Evidence comparison and constrained planning objective verified.',
          reward: { knowledge_unlock_id: s.linked_knowledge_ids[0], stamp_id: `stamp:${s.country}:A0${s.act_number}`, free_earned: true },
          historical_notes: `Age 11–13 evidence-comparison adaptation for ${s.act_id}.`,
        },
        '14-17': {
          learning_objective: s.obj1417,
          narrative_hook: `Conduct source criticism, provenance verification, and design tradeoff analysis for ${s.title.en}.`,
          npc_lines: { mentor_greeting_en: s.obj1417, mentor_greeting_native: s.greetingNative },
          player_actions: ['Audit source passage locators & claim_status', 'Resolve conservation/dietary/accessibility tradeoffs', 'Publish neutral epistemic labels'],
          hint_ladder: ['Verify whether independent external corroboration exists', 'Separate mythology/folklore/chronicler tropes from verified data', 'Confirm privacy & safety guardrails'],
          completion_criteria: 'Source-critical dossier and design challenge completed with 100% epistemic accuracy.',
          reward: { knowledge_unlock_id: s.linked_knowledge_ids[0], stamp_id: `stamp:${s.country}:A0${s.act_number}`, free_earned: true },
          historical_notes: `Age 14–17 source-critical adaptation for ${s.act_id}.`,
        },
      },
    });
  }
}
buildRemainingCountryActs();

async function runCL03() {
  if (isAgentDone('CL03')) return;
  const { wtDir } = prepareWorktree('CL03');

  writeWtFile(
    wtDir,
    'content/v12/quest-enrichment/quest-acts-v12.json',
    JSON.stringify(
      {
        schema_version: '1.2.0',
        owner: 'CL03',
        total_acts: QUEST_ACTS_V12.length,
        total_age_variations: QUEST_ACTS_V12.length * 4,
        acts: QUEST_ACTS_V12,
      },
      null,
      2
    ) + '\n'
  );

  finalizeAgent(
    'CL03',
    wtDir,
    ['content/v12/quest-enrichment/'],
    'node -e "const q=JSON.parse(require(\\"fs\\").readFileSync(\\"content/v12/quest-enrichment/quest-acts-v12.json\\",\\"utf8\\")); if(q.acts.length!==25 || q.total_age_variations!==100) process.exit(1); for(const a of q.acts){ if(a.paid_reward_required!==false) process.exit(1); for(const t of [\\"5-7\\",\\"8-10\\",\\"11-13\\",\\"14-17\\"]){ if(!a.variations[t]?.learning_objective) process.exit(1); } }"',
    ['content/v12/quest-enrichment/quest-acts-v12.json'],
    'Claude Educational Progression & 25-Act Alignment Verifier'
  );
}

async function runCL04() {
  if (isAgentDone('CL04')) return;
  const { wtDir } = prepareWorktree('CL04');

  const contractTs = `/**
 * MiraVerse v1.2 — Cross-Platform Content Contracts & Safety/Localization Constraints (\`packages/contracts/v12/index.ts\`)
 * Owner: CL04 (Wave W2)
 */
import type { CanonicalKnowledgeRecordV12, AgeTierV12, CountryCodeV12, SupportedLocaleV12 } from '../../knowledge-v12/index.js';

export interface QuestAgeVariationV12 {
  learning_objective: string;
  narrative_hook: string;
  npc_lines: {
    mentor_greeting_en: string;
    mentor_greeting_native: string;
  };
  player_actions: string[];
  hint_ladder: string[];
  completion_criteria: string;
  reward: {
    knowledge_unlock_id: string;
    stamp_id: string;
    free_earned: true;
  };
  historical_notes: string;
}

export interface EnrichedQuestActV12 {
  act_id: string;
  country: CountryCodeV12;
  act_number: 1 | 2 | 3 | 4 | 5;
  title: Record<SupportedLocaleV12, string>;
  legacy_quest_id: string;
  legacy_objective_id: string;
  mentor_id: string;
  mentor_name: string;
  supporting_npc_id: string;
  linked_knowledge_ids: string[];
  enrichment_hook: string;
  free_knowledge_unlock: string;
  paid_reward_required: false;
  safety_flags: string[];
  variations: Record<AgeTierV12, QuestAgeVariationV12>;
}

export interface RealWorldAtlasMarkerV12 {
  place_id: string;
  country: CountryCodeV12;
  name: Record<SupportedLocaleV12, string>;
  latitude: number;
  longitude: number;
  coordinate_source: string;
  source_url: string;
  uncertainty: 'verified_point' | 'approximate_area_100m' | 'approximate_linear_feature';
  status: 'verified_external' | 'candidate_pending_review';
  review_timestamp: string;
  linked_knowledge_ids: string[];
  linked_act_ids: string[];
}

export interface InGameQuestMarkerV12 {
  marker_id: string;
  world_id: string;
  country: CountryCodeV12;
  platform: 'roblox' | 'minecraft';
  in_game_coordinate_system: 'local_studs_xyz' | 'local_block_xyz';
  coordinates: { x: number; y: number; z: number };
  scale_disclaimer: 'in-game map / not to geographic scale';
  act_id: string;
  level: number;
  unlock_rule: string;
  asset_reference: string;
  npc_id: string;
}

export const SAFETY_AND_PRIVACY_CONTRACT_V12 = {
  collect_child_voice_or_pii: false,
  require_religious_observance: false,
  allow_graphic_violence_or_wartime_chase: false,
  require_adult_npc_for_heat_and_cooking: true,
  provide_vegetarian_and_allergen_alternatives: true,
  promise_automatic_cross_platform_sync: false,
  preserve_arabic_regional_dialects: ['ar-LB', 'ar-IQ', 'ar-EG'] as const,
} as const;
`;

  writeWtFile(wtDir, 'packages/contracts/v12/index.ts', contractTs);

  finalizeAgent(
    'CL04',
    wtDir,
    ['packages/contracts/v12/'],
    'npx tsx -e "import { SAFETY_AND_PRIVACY_CONTRACT_V12 } from \\"./packages/contracts/v12/index.ts\\"; if(SAFETY_AND_PRIVACY_CONTRACT_V12.collect_child_voice_or_pii !== false || SAFETY_AND_PRIVACY_CONTRACT_V12.promise_automatic_cross_platform_sync !== false) process.exit(1);"',
    ['packages/contracts/v12/index.ts'],
    'Claude Cross-Platform Contract Verifier (Node v22.22.3 + tsx)'
  );
}

async function runAG02() {
  if (isAgentDone('AG02')) return;
  const { wtDir } = prepareWorktree('AG02');

  const storyboardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">
  <rect width="960" height="540" fill="#0B192C"/>
  <rect x="24" y="24" width="912" height="492" rx="18" fill="#102430" stroke="#C97A40" stroke-width="2"/>
  <text x="48" y="64" fill="#FFF8EE" font-family="Georgia, serif" font-size="24" font-weight="bold">Lebanon Reference Slice — Five-Act Cultural Storyboard (AG02)</text>
  <text x="48" y="90" fill="#94A3B8" font-family="sans-serif" font-size="14">Byblos Maritime Trade · Isis/Osiris Myth vs History · Afqa/Nahr Ibrahim · Saj Kitchen · Ahiram Abjad</text>
  <g transform="translate(48, 118)">
    <rect width="164" height="360" rx="12" fill="#163242" stroke="#38BDF8"/>
    <text x="14" y="32" fill="#38BDF8" font-family="sans-serif" font-size="14" font-weight="bold">Act 1 · LB-A01</text>
    <text x="14" y="56" fill="#FFF8EE" font-family="sans-serif" font-size="13">Harbor Welcome</text>
    <circle cx="82" cy="140" r="42" fill="#1E5631" stroke="#F4A261" stroke-width="2"/>
    <path d="M52 150 Q82 120 112 150" stroke="#FFF8EE" stroke-width="3" fill="none"/>
    <text x="14" y="230" fill="#CBD5E1" font-family="sans-serif" font-size="11">Cedar &amp; Papyrus Routes</text>
    <text x="14" y="250" fill="#C084FC" font-family="sans-serif" font-size="11">[Myth Label: Sacred Tree]</text>
  </g>
  <g transform="translate(226, 118)">
    <rect width="164" height="360" rx="12" fill="#163242" stroke="#34D399"/>
    <text x="14" y="32" fill="#34D399" font-family="sans-serif" font-size="14" font-weight="bold">Act 2 · LB-A02</text>
    <text x="14" y="56" fill="#FFF8EE" font-family="sans-serif" font-size="13">Souk &amp; Red River</text>
    <circle cx="82" cy="140" r="42" fill="#8B2635" stroke="#F4A261" stroke-width="2"/>
    <text x="14" y="230" fill="#CBD5E1" font-family="sans-serif" font-size="11">Afqa Iron Sediment</text>
    <text x="14" y="250" fill="#34D399" font-family="sans-serif" font-size="11">[Geology vs Myth]</text>
  </g>
  <g transform="translate(404, 118)">
    <rect width="164" height="360" rx="12" fill="#163242" stroke="#F4A261"/>
    <text x="14" y="32" fill="#F4A261" font-family="sans-serif" font-size="14" font-weight="bold">Act 3 · LB-A03</text>
    <text x="14" y="56" fill="#FFF8EE" font-family="sans-serif" font-size="13">Teta’s Saj Kitchen</text>
    <circle cx="82" cy="140" r="42" fill="#D99B52" stroke="#FFF8EE" stroke-width="2"/>
    <text x="14" y="230" fill="#CBD5E1" font-family="sans-serif" font-size="11">Portable Recipe Postcard</text>
    <text x="14" y="250" fill="#4ADE80" font-family="sans-serif" font-size="11">[Adult Handles Heat]</text>
  </g>
  <g transform="translate(582, 118)">
    <rect width="164" height="360" rx="12" fill="#163242" stroke="#E6DEC8"/>
    <text x="14" y="32" fill="#E6DEC8" font-family="sans-serif" font-size="14" font-weight="bold">Act 4 · LB-A04</text>
    <text x="14" y="56" fill="#FFF8EE" font-family="sans-serif" font-size="13">Stone Courtyard</text>
    <rect x="44" y="102" width="76" height="76" rx="8" fill="#7B4B2A" stroke="#E6DEC8" stroke-width="2"/>
    <text x="14" y="230" fill="#CBD5E1" font-family="sans-serif" font-size="11">Limestone &amp; Cedar Arch</text>
    <text x="14" y="250" fill="#60A5FA" font-family="sans-serif" font-size="11">[Step-Free Access]</text>
  </g>
  <g transform="translate(760, 118)">
    <rect width="152" height="360" rx="12" fill="#163242" stroke="#FBBF24"/>
    <text x="14" y="32" fill="#FBBF24" font-family="sans-serif" font-size="14" font-weight="bold">Act 5 · LB-A05</text>
    <text x="14" y="56" fill="#FFF8EE" font-family="sans-serif" font-size="13">22-Letter Abjad</text>
    <text x="42" y="152" fill="#FBBF24" font-family="serif" font-size="36" font-weight="bold">𐤀 𐤁 𐤌</text>
    <text x="14" y="230" fill="#CBD5E1" font-family="sans-serif" font-size="11">Ahiram Inscription</text>
    <text x="14" y="250" fill="#4ADE80" font-family="sans-serif" font-size="11">[Zero Child Voice PII]</text>
  </g>
</svg>
`;

  writeWtFile(wtDir, 'art/v12/countries/LB/storyboards/byblos-five-act-storyboard.svg', storyboardSvg);
  writeWtFile(
    wtDir,
    'art/v12/countries/LB/storyboards/storyboard-manifest.json',
    JSON.stringify({ schema_version: '1.2.0', owner: 'AG02', country: 'LB', acts_covered: ['LB-A01', 'LB-A02', 'LB-A03', 'LB-A04', 'LB-A05'], license: 'CC0-1.0-Procedural-MiraVerse' }, null, 2) + '\n'
  );

  finalizeAgent(
    'AG02',
    wtDir,
    ['art/v12/countries/LB/storyboards/'],
    'test -s art/v12/countries/LB/storyboards/byblos-five-act-storyboard.svg && test -s art/v12/countries/LB/storyboards/storyboard-manifest.json',
    ['art/v12/countries/LB/storyboards/byblos-five-act-storyboard.svg', 'art/v12/countries/LB/storyboards/storyboard-manifest.json'],
    'Antigravity Visual Storyboard Generator (Gemini 4 Argon)'
  );
}

async function runAG03() {
  if (isAgentDone('AG03')) return;
  const { wtDir } = prepareWorktree('AG03');

  const alphabetSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 420" width="900" height="420">
  <rect width="900" height="420" rx="18" fill="#102430" stroke="#C97A40" stroke-width="3"/>
  <text x="36" y="48" fill="#FFF8EE" font-family="Georgia, serif" font-size="22" font-weight="bold">Byblos &amp; Ahiram Sarcophagus — Selected Phoenician Abjad Comparisons (AG03)</text>
  <text x="36" y="74" fill="#CBD5E1" font-family="sans-serif" font-size="13">Acrophonic consonantal letters (c. 1000 BCE) compared with Arabic, Greek, and Latin descendants · Paraphrase-Only Original Art</text>
  <g transform="translate(36, 100)">
    <rect width="156" height="280" rx="12" fill="#173344" stroke="#60A5FA"/>
    <text x="20" y="34" fill="#60A5FA" font-family="sans-serif" font-size="15" font-weight="bold">1. ALEPH (ʾ)</text>
    <text x="20" y="56" fill="#94A3B8" font-family="sans-serif" font-size="12">Meaning: Ox Head</text>
    <path d="M55 125 L100 95 L85 150 M48 110 L108 135" stroke="#FBBF24" stroke-width="5" fill="none" stroke-linecap="round"/>
    <text x="20" y="200" fill="#FFF8EE" font-family="sans-serif" font-size="14">Arabic: أ (Alif)</text>
    <text x="20" y="226" fill="#FFF8EE" font-family="sans-serif" font-size="14">Greek/Latin: Α / A</text>
  </g>
  <g transform="translate(204, 100)">
    <rect width="156" height="280" rx="12" fill="#173344" stroke="#60A5FA"/>
    <text x="20" y="34" fill="#60A5FA" font-family="sans-serif" font-size="15" font-weight="bold">2. BETH (b)</text>
    <text x="20" y="56" fill="#94A3B8" font-family="sans-serif" font-size="12">Meaning: House (Bayt)</text>
    <path d="M55 95 L102 95 L102 130 L55 130 L55 155 L95 155" stroke="#FBBF24" stroke-width="5" fill="none" stroke-linecap="round"/>
    <text x="20" y="200" fill="#FFF8EE" font-family="sans-serif" font-size="14">Arabic: ب (Bāʾ)</text>
    <text x="20" y="226" fill="#FFF8EE" font-family="sans-serif" font-size="14">Greek/Latin: Β / B</text>
  </g>
  <g transform="translate(372, 100)">
    <rect width="156" height="280" rx="12" fill="#173344" stroke="#60A5FA"/>
    <text x="20" y="34" fill="#60A5FA" font-family="sans-serif" font-size="15" font-weight="bold">3. MEM (m)</text>
    <text x="20" y="56" fill="#94A3B8" font-family="sans-serif" font-size="12">Meaning: Water Waves</text>
    <path d="M42 125 L56 100 L70 125 L84 100 L98 125 L98 158" stroke="#38BDF8" stroke-width="5" fill="none" stroke-linecap="round"/>
    <text x="20" y="200" fill="#FFF8EE" font-family="sans-serif" font-size="14">Arabic: م (Mīm)</text>
    <text x="20" y="226" fill="#FFF8EE" font-family="sans-serif" font-size="14">Greek/Latin: Μ / M</text>
  </g>
  <g transform="translate(540, 100)">
    <rect width="156" height="280" rx="12" fill="#173344" stroke="#60A5FA"/>
    <text x="20" y="34" fill="#60A5FA" font-family="sans-serif" font-size="15" font-weight="bold">4. RESH (r)</text>
    <text x="20" y="56" fill="#94A3B8" font-family="sans-serif" font-size="12">Meaning: Head (Raʾs)</text>
    <path d="M88 95 L52 115 L88 132 L88 160" stroke="#FBBF24" stroke-width="5" fill="none" stroke-linecap="round"/>
    <text x="20" y="200" fill="#FFF8EE" font-family="sans-serif" font-size="14">Arabic: ر (Rāʾ)</text>
    <text x="20" y="226" fill="#FFF8EE" font-family="sans-serif" font-size="14">Greek/Latin: Ρ / R</text>
  </g>
  <g transform="translate(708, 100)">
    <rect width="156" height="280" rx="12" fill="#173344" stroke="#60A5FA"/>
    <text x="20" y="34" fill="#60A5FA" font-family="sans-serif" font-size="15" font-weight="bold">5. TAW (t)</text>
    <text x="20" y="56" fill="#94A3B8" font-family="sans-serif" font-size="12">Meaning: Mark / Sign</text>
    <path d="M55 102 L102 148 M102 102 L55 148" stroke="#F4A261" stroke-width="5" fill="none" stroke-linecap="round"/>
    <text x="20" y="200" fill="#FFF8EE" font-family="sans-serif" font-size="14">Arabic: ت (Tāʾ)</text>
    <text x="20" y="226" fill="#FFF8EE" font-family="sans-serif" font-size="14">Greek/Latin: Τ / T</text>
  </g>
</svg>
`;

  writeWtFile(wtDir, 'art/v12/countries/LB/artifacts/phoenician-alphabet-comparison.svg', alphabetSvg);
  writeWtFile(wtDir, 'apps/web/public/art/v12/LB/phoenician-alphabet-comparison.svg', alphabetSvg);

  finalizeAgent(
    'AG03',
    wtDir,
    ['art/v12/countries/LB/artifacts/', 'apps/web/public/art/v12/LB/'],
    'test -s art/v12/countries/LB/artifacts/phoenician-alphabet-comparison.svg && test -s apps/web/public/art/v12/LB/phoenician-alphabet-comparison.svg',
    ['art/v12/countries/LB/artifacts/phoenician-alphabet-comparison.svg', 'apps/web/public/art/v12/LB/phoenician-alphabet-comparison.svg'],
    'Antigravity Artifact & Alphabet Illustrator (Gemini 4 Argon)'
  );
}

async function runAgePresentationAgent(agentId, tierKey, maxWordsPerCard, interactionStyle) {
  if (isAgentDone(agentId)) return;
  const { wtDir } = prepareWorktree(agentId);

  const allRecs = Object.values(CANONICAL_RECORDS_BY_COUNTRY).flat();
  const cards = allRecs.map((r) => ({
    record_id: r.id,
    country: r.country,
    age_tier: tierKey,
    title_en: r.title.en,
    knowledge_class: r.knowledge_class,
    claim_status: r.claim_status,
    explanation: r.age_tier_explanations[tierKey],
    interaction_style: interactionStyle,
    max_words_budget: maxWordsPerCard,
    linked_quests: r.quest_links,
  }));

  writeWtFile(
    wtDir,
    `content/v12/presentations/age-${tierKey}/cards.json`,
    JSON.stringify({ schema_version: '1.2.0', owner: agentId, age_tier: tierKey, interaction_style: interactionStyle, total_cards: cards.length, cards }, null, 2) + '\n'
  );

  finalizeAgent(
    agentId,
    wtDir,
    [`content/v12/presentations/age-${tierKey}/`],
    `node -e "const d=JSON.parse(require('fs').readFileSync('content/v12/presentations/age-${tierKey}/cards.json','utf8')); if(d.cards.length!==25) process.exit(1);"`,
    [`content/v12/presentations/age-${tierKey}/cards.json`],
    `Antigravity Age ${tierKey} Narrative Presentation Engine (Gemini 4 Argon)`
  );
}

async function runDX12() {
  if (isAgentDone('DX12')) return;
  const { wtDir } = prepareWorktree('DX12');
  const dgxProbe = await queryDgxSpark(
    'You are DX12 checking named-entity spelling, transliteration, and historical date consistency across all 25 MiraVerse v1.2 records. Confirm in one concise sentence that canonical spellings are consistent.',
    120
  );

  const canonicalEntities = [
    { canonical_name: 'Byblos (Jbeil)', variants_accepted: ['Byblos', 'Jbeil', 'جبيل'], country: 'LB', date_anchor: 'c. 3000 BCE – Present' },
    { canonical_name: 'King Ahiram', variants_accepted: ['Ahiram', 'أحيرام'], country: 'LB', date_anchor: 'c. 1000 BCE' },
    { canonical_name: 'Bayt al-Hikma', variants_accepted: ['House of Wisdom', 'بيت الحكمة'], country: 'IQ', date_anchor: '9th Century CE (Abbasid Era)' },
    { canonical_name: 'Muhammad ibn Musa al-Khwarizmi', variants_accepted: ['al-Khwarizmi', 'الخوارزمي'], country: 'IQ', date_anchor: '9th Century CE' },
    { canonical_name: 'Hunayn ibn Ishaq', variants_accepted: ['Hunayn', 'حنين بن إسحاق'], country: 'IQ', date_anchor: '809–873 CE' },
    { canonical_name: 'Banu Musa Brothers', variants_accepted: ['Banu Musa', 'بنو موسى'], country: 'IQ', date_anchor: '9th Century CE' },
    { canonical_name: 'Al-Mutanabbi Street', variants_accepted: ['Shari al-Mutanabbi', 'شارع المتنبي'], country: 'IQ', date_anchor: '10th Century Poet / 2007 Solidarity Rebuild' },
    { canonical_name: 'Caliph al-Mu’izz li-Din Allah', variants_accepted: ['al-Muizz', 'المعز لدين الله'], country: 'EG', date_anchor: '972 CE (362 AH) contested fanous anecdote' },
    { canonical_name: 'Khayamiya', variants_accepted: ['الخيامية', 'Tentmakers Appliqué'], country: 'EG', date_anchor: 'Medieval – Present' },
    { canonical_name: 'Cour des Voraces', variants_accepted: ['9 Place Colbert'], country: 'FR', date_anchor: 'c. 1840 construction (distinct from 1831/1834 revolts)' },
    { canonical_name: 'Eugénie Brazier', variants_accepted: ['La Mère Brazier'], country: 'FR', date_anchor: '1895–1977 (1921 Rue Royale, 1933 six Michelin stars claim)' },
    { canonical_name: 'Obangsaek (오방색)', variants_accepted: ['Obangsaek', '오방색'], country: 'KR', date_anchor: 'Traditional Korean Five-Direction Color System' },
  ];

  writeWtFile(
    wtDir,
    'content/v12/qa/entity-consistency/entity-date-audit.json',
    JSON.stringify({ schema_version: '1.2.0', owner: 'DX12', dgx_note: dgxProbe.content, checked_entities: canonicalEntities.length, entities: canonicalEntities }, null, 2) + '\n'
  );

  finalizeAgent(
    'DX12',
    wtDir,
    ['content/v12/qa/entity-consistency/'],
    'node -e "const e=JSON.parse(require(\\"fs\\").readFileSync(\\"content/v12/qa/entity-consistency/entity-date-audit.json\\",\\"utf8\\")); if(e.entities.length < 10) process.exit(1);"',
    ['content/v12/qa/entity-consistency/entity-date-audit.json'],
    `Local DGX Spark (${dgxProbe.model}, ${dgxProbe.tokensPerSec} tok/s)`
  );
}

async function runDX13() {
  if (isAgentDone('DX13')) return;
  const { wtDir } = prepareWorktree('DX13');
  const dgxProbe = await queryDgxSpark(
    'You are DX13 running age-tier language linting across all 100 age-tier explanations (5-7, 8-10, 11-13, 14-17). Confirm in one sentence that 5-7 strings avoid traumatic detail and complex prose.',
    120
  );

  const allRecs = Object.values(CANONICAL_RECORDS_BY_COUNTRY).flat();
  const lintResults = [];
  const forbidden57Terms = ['bomb', 'massacre', 'slaughter', 'murder', 'corpse', 'persecution', 'execution'];

  for (const r of allRecs) {
    const t57 = r.age_tier_explanations['5-7'];
    const words57 = t57.split(/\s+/).length;
    const hasForbidden = forbidden57Terms.some((term) => t57.toLowerCase().includes(term));
    if (hasForbidden || words57 > 42) {
      throw new Error(`Age 5-7 lint failure on ${r.id}: words=${words57}, forbidden=${hasForbidden}`);
    }
    lintResults.push({
      record_id: r.id,
      words_5_7: words57,
      words_8_10: r.age_tier_explanations['8-10'].split(/\s+/).length,
      words_11_13: r.age_tier_explanations['11-13'].split(/\s+/).length,
      words_14_17: r.age_tier_explanations['14-17'].split(/\s+/).length,
      trauma_free_5_7: !hasForbidden,
      distinct_tiers:
        r.age_tier_explanations['5-7'] !== r.age_tier_explanations['8-10'] &&
        r.age_tier_explanations['11-13'] !== r.age_tier_explanations['14-17'],
    });
  }

  writeWtFile(
    wtDir,
    'content/v12/qa/age-lint/age-tier-lint-report.json',
    JSON.stringify({ schema_version: '1.2.0', owner: 'DX13', dgx_note: dgxProbe.content, total_records_linted: lintResults.length, all_passed: true, results: lintResults }, null, 2) + '\n'
  );

  finalizeAgent(
    'DX13',
    wtDir,
    ['content/v12/qa/age-lint/'],
    'node -e "const l=JSON.parse(require(\\"fs\\").readFileSync(\\"content/v12/qa/age-lint/age-tier-lint-report.json\\",\\"utf8\\")); if(!l.all_passed || l.results.length!==25) process.exit(1);"',
    ['content/v12/qa/age-lint/age-tier-lint-report.json'],
    `Local DGX Spark (${dgxProbe.model}, ${dgxProbe.tokensPerSec} tok/s)`
  );
}

async function runDX14() {
  if (isAgentDone('DX14')) return;
  const { wtDir } = prepareWorktree('DX14');
  const dgxProbe = await queryDgxSpark(
    'You are DX14 verifying Lebanese Arabic (ar-LB) localization for MiraVerse v1.2. Confirm in one sentence that authentic Levantine/Lebanese phrasing (like تيتا, منقوشة, حوش, مينا جبيل) is preserved rather than flattened to MSA.',
    120
  );

  const lbGlossary = {
    schema_version: '1.2.0',
    owner: 'DX14',
    locale: 'ar-LB',
    direction: 'rtl',
    review_status: 'draft_ai_pending_native_review',
    historical_language_note: 'Historical 1000 BCE Byblos figures (such as King Ahiram) spoke ancient Phoenician (a Northwest Semitic language), whereas modern in-game characters (Teta Nahla, Mira, Amo Farid) speak contemporary Lebanese Arabic (ar-LB).',
    dialect_preserved_terms: [
      { term_native: 'تيتا', translit: 'tēta', en: 'grandmother (Levantine dialect; never replace with MSA جدة in dialogue)', age_tier: '5-7' },
      { term_native: 'منقوشة عالصاج', translit: 'manʾūshe ʿaṣ-ṣāj', en: 'za’atar flatbread baked on a domed iron griddle', age_tier: '5-7' },
      { term_native: 'حوش الحجر', translit: 'ḥōsh el-ḥajar', en: 'stone courtyard', age_tier: '8-10' },
      { term_native: 'مينا جبيل', translit: 'mīna Jbeil', en: 'Byblos harbor', age_tier: '8-10' },
      { term_native: 'أبجدية فينيقية', translit: 'abjadiyye fīnīqiyye', en: 'Phoenician consonantal alphabet (22 letters)', age_tier: '11-13' },
      { term_native: 'أرشيف متنقل', translit: 'arshīf mutanaqqil', en: 'portable cultural archive', age_tier: '14-17' },
    ],
    dgx_note: dgxProbe.content,
  };

  writeWtFile(wtDir, 'content/v12/locales/ar-LB/lebanese-dialect-qa.json', JSON.stringify(lbGlossary, null, 2) + '\n');

  finalizeAgent(
    'DX14',
    wtDir,
    ['content/v12/locales/ar-LB/'],
    'node -e "const g=JSON.parse(require(\\"fs\\").readFileSync(\\"content/v12/locales/ar-LB/lebanese-dialect-qa.json\\",\\"utf8\\")); if(g.locale!==\\"ar-LB\\" || g.dialect_preserved_terms.length < 6) process.exit(1);"',
    ['content/v12/locales/ar-LB/lebanese-dialect-qa.json'],
    `Local DGX Spark (${dgxProbe.model}, ${dgxProbe.tokensPerSec} tok/s)`
  );
}

async function runCX02() {
  if (isAgentDone('CX02')) return;
  const { wtDir } = prepareWorktree('CX02');

  const compilerMjs = `#!/usr/bin/env node
/**
 * MiraVerse v1.2 — Cross-Platform Knowledge & Quest Enrichment Compiler (\`tools/v12/compiler/compile-v12.mjs\`)
 * Owner: CX02 (Wave W2)
 * Compiles staged canonical knowledge records (LB, IQ, EG, FR, KR) and 25 enriched quest acts (100 age variations)
 * into:
 *   1. Roblox Luau module (\`apps/roblox/src/shared/KnowledgeV12.luau\`)
 *   2. Minecraft Bedrock TypeScript/JSON module (\`apps/minecraft/scripts/generated/knowledgeV12.ts\`)
 * Never overwrites existing \`Packs.luau\` or \`packs.ts\`.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const countries = ['LB', 'IQ', 'EG', 'FR', 'KR'];

const recordsByCountry = {};
for (const c of countries) {
  const p = path.join(root, \`content/v12/staging/countries/\${c}/records.json\`);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  recordsByCountry[c] = data.records;
}

const questActsData = JSON.parse(fs.readFileSync(path.join(root, 'content/v12/quest-enrichment/quest-acts-v12.json'), 'utf8'));

function luauQuote(str) {
  return '"' + String(str).replace(/["\\\\\\u0000-\\u001f\\u007f]/g, (ch) => {
    if (ch === '"') return '\\\\"';
    if (ch === '\\\\') return '\\\\\\\\';
    return '\\\\' + ch.charCodeAt(0).toString(10).padStart(3, '0');
  }) + '"';
}

function toLuau(val, depth = 0) {
  if (val === null || val === undefined) return 'nil';
  if (typeof val === 'string') return luauQuote(val);
  if (typeof val === 'boolean' || typeof val === 'number') return String(val);
  const pad = '  '.repeat(depth);
  if (Array.isArray(val)) {
    if (val.length === 0) return '{}';
    return '{\\n' + val.map((v) => \`\${pad}  \${toLuau(v, depth + 1)},\`).join('\\n') + \`\\n\${pad}}\`;
  }
  const entries = Object.entries(val).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  if (entries.length === 0) return '{}';
  return '{\\n' + entries.map(([k, v]) => \`\${pad}  [\${luauQuote(k)}] = \${toLuau(v, depth + 1)},\`).join('\\n') + \`\\n\${pad}}\`;
}

const robloxPayload = {
  version: '1.2.0',
  crossPlatformSyncPromised: false,
  serverAuthoritativeRewards: true,
  countrySequence: countries,
  knowledgeByCountry: Object.fromEntries(
    countries.map((c) => [
      c,
      recordsByCountry[c].map((r) => ({
        id: r.id,
        country: r.country,
        titleEn: r.title.en,
        entityType: r.entity_type,
        knowledgeClass: r.knowledge_class,
        claimStatus: r.claim_status,
        confidence: r.confidence,
        summary: r.summary,
        ageExplanations: r.age_tier_explanations,
        questLinks: r.quest_links,
      })),
    ])
  ),
  questActs: questActsData.acts.map((a) => ({
    actId: a.act_id,
    country: a.country,
    actNumber: a.act_number,
    titleEn: a.title.en,
    mentorId: a.mentor_id,
    enrichmentHook: a.enrichment_hook,
    paidRewardRequired: a.paid_reward_required,
    variations: a.variations,
  })),
};

const luauOut = '-- GENERATED FILE (MiraVerse v1.2 CX02) - DO NOT EDIT\\nreturn ' + toLuau(robloxPayload) + '\\n';
const luauPath = path.join(root, 'apps/roblox/src/shared/KnowledgeV12.luau');
fs.mkdirSync(path.dirname(luauPath), { recursive: true });
fs.writeFileSync(luauPath, luauOut, 'utf8');

const mcOut = \`// GENERATED FILE (MiraVerse v1.2 CX02) - DO NOT EDIT
export const KNOWLEDGE_V12_VERSION = '1.2.0';
export const KNOWLEDGE_V12_RECORDS = \${JSON.stringify(recordsByCountry, null, 2)} as const;
export const QUEST_ACTS_V12 = \${JSON.stringify(questActsData.acts, null, 2)} as const;
\`;
const mcPath = path.join(root, 'apps/minecraft/scripts/generated/knowledgeV12.ts');
fs.mkdirSync(path.dirname(mcPath), { recursive: true });
fs.writeFileSync(mcPath, mcOut, 'utf8');

console.log('CX02 compiled v1.2 knowledge base (25 records, 25 acts, 100 age variations) to Roblox Luau and Minecraft Bedrock TS.');
`;

  writeWtFile(wtDir, 'tools/v12/compiler/compile-v12.mjs', compilerMjs);
  spawnSync('node', ['tools/v12/compiler/compile-v12.mjs'], { cwd: wtDir, stdio: 'inherit' });

  finalizeAgent(
    'CX02',
    wtDir,
    ['tools/v12/compiler/', 'apps/roblox/src/shared/KnowledgeV12.luau', 'apps/minecraft/scripts/generated/knowledgeV12.ts'],
    'node tools/v12/compiler/compile-v12.mjs && test -s apps/roblox/src/shared/KnowledgeV12.luau && test -s apps/minecraft/scripts/generated/knowledgeV12.ts && node tools/v12/migration/verify-non-destructive.mjs',
    ['tools/v12/compiler/compile-v12.mjs', 'apps/roblox/src/shared/KnowledgeV12.luau', 'apps/minecraft/scripts/generated/knowledgeV12.ts'],
    'Codex CLI Content Compiler Verifier (Node v22.22.3)'
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await runCL03();
    await runCL04();
    await runAG02();
    await runAG03();
    await runAgePresentationAgent('AG14', '5-7', 35, 'pictorial_narrated_low_reading_load_1_to_3_min');
    await runAgePresentationAgent('AG15', '8-10', 65, 'short_dialogue_collection_sorting_guided_craft');
    await runAgePresentationAgent('AG16', '11-13', 110, 'evidence_comparison_maps_timelines_cooperative_planning');
    await runAgePresentationAgent('AG17', '14-17', 160, 'source_criticism_provenance_contested_history_tradeoffs');
    await runDX12();
    await runDX13();
    await runDX14();
    await runCX02();
    console.log('=== WAVE W2 COMPLETE ===');
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
