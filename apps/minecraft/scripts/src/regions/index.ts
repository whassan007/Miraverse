/**
 * MiraVerse v1.0 Minecraft Bedrock — Complete 5-Country Region & Anchor Registry
 * (`apps/minecraft/scripts/src/regions/index.ts`)
 * Owner: CL02 (Wave W1–W2)
 */
import type { CountryId } from '../../../../../packages/content/schema.js';
import type { RegionDistrictContract } from '../contracts/index.js';

function makeDistrict(
  country: CountryId,
  index: number,
  titleEn: string,
  titleNative: string,
  mentorNameEn: string,
  mentorNameNative: string,
  dishItemId: string,
  dishNameEn: string,
  dishNameNative: string,
  stationBlockId: string,
  wallBlock: string,
  roofBlock: string,
  trimBlock: string,
  gatherItem1: string,
  gatherItem2: string,
  tradeItem: string,
  restoreItem: string,
  optionalItem: string,
  words: Array<{ word: string; translit: string; en: string }>
): RegionDistrictContract {
  const cx = 200 * (index + 1);
  return {
    country,
    titleEn,
    titleNative,
    origin: { x: cx, y: 64, z: 0 },
    footprint: { width: 96, height: 32, depth: 96 },
    spawnPos: { x: cx, y: 65, z: -18 },
    returnPortalPos: { x: cx, y: 65, z: -24 },
    privatePlotOrigin: { x: cx + 32, y: 65, z: 20 },
    privatePlotRadius: 8,
    restorationOrigin: { x: cx - 8, y: 65, z: 8 },
    restorationRequiredItems: [{ itemId: restoreItem, count: 3 }],
    exteriors: [
      { buildingId: `${country.toLowerCase()}_mentor_kitchen_house`, nameEn: `${mentorNameEn}'s Culinary House`, nameNative: titleNative, origin: { x: cx - 12, y: 64, z: 4 }, size: { x: 12, y: 7, z: 10 }, wallBlock, roofBlock, trimBlock, hasInterior: true, interiorId: `${country.toLowerCase()}_int_kitchen` },
      { buildingId: `${country.toLowerCase()}_family_courtyard`, nameEn: `${titleEn} Family Courtyard`, nameNative: titleNative, origin: { x: cx + 6, y: 64, z: 4 }, size: { x: 14, y: 8, z: 12 }, wallBlock, roofBlock, trimBlock, hasInterior: true, interiorId: `${country.toLowerCase()}_int_salon` },
      { buildingId: `${country.toLowerCase()}_artisan_workshop`, nameEn: `${titleEn} Artisan Workshop`, nameNative: titleNative, origin: { x: cx - 16, y: 64, z: -12 }, size: { x: 10, y: 6, z: 10 }, wallBlock, roofBlock, trimBlock, hasInterior: true, interiorId: `${country.toLowerCase()}_int_workshop` },
      { buildingId: `${country.toLowerCase()}_market_pavilion`, nameEn: `${titleEn} Market Bazaar Pavilion`, nameNative: titleNative, origin: { x: cx + 10, y: 64, z: -14 }, size: { x: 11, y: 6, z: 9 }, wallBlock, roofBlock, trimBlock, hasInterior: false },
      { buildingId: `${country.toLowerCase()}_heritage_tower`, nameEn: `${titleEn} Heritage Landmark Gate`, nameNative: titleNative, origin: { x: cx - 4, y: 64, z: 22 }, size: { x: 9, y: 10, z: 9 }, wallBlock, roofBlock, trimBlock, hasInterior: false },
    ],
    interiors: [
      {
        interiorId: `${country.toLowerCase()}_int_kitchen`,
        buildingId: `${country.toLowerCase()}_mentor_kitchen_house`,
        nameEn: `${mentorNameEn}'s Kitchen Interior`,
        entryPos: { x: cx - 8, y: 65, z: 4 },
        furnishings: [
          { propId: `${country.toLowerCase()}_hearth`, blockId: stationBlockId, offset: { x: cx - 6, y: 65, z: 8 }, labelEn: `${dishNameEn} Cooking Station` },
          { propId: `${country.toLowerCase()}_prep_table`, blockId: 'minecraft:crafting_table', offset: { x: cx - 9, y: 65, z: 7 }, labelEn: 'Preparation Table' },
        ],
      },
      {
        interiorId: `${country.toLowerCase()}_int_salon`,
        buildingId: `${country.toLowerCase()}_family_courtyard`,
        nameEn: `${titleEn} Family Salon Interior`,
        entryPos: { x: cx + 12, y: 65, z: 4 },
        furnishings: [
          { propId: `${country.toLowerCase()}_lectern`, blockId: 'minecraft:lectern', offset: { x: cx + 10, y: 65, z: 9 }, labelEn: 'Storybook Stand' },
        ],
      },
      {
        interiorId: `${country.toLowerCase()}_int_workshop`,
        buildingId: `${country.toLowerCase()}_artisan_workshop`,
        nameEn: `${titleEn} Artisan Workshop Interior`,
        entryPos: { x: cx - 12, y: 65, z: -12 },
        furnishings: [
          { propId: `${country.toLowerCase()}_barrel`, blockId: 'minecraft:barrel', offset: { x: cx - 10, y: 65, z: -9 }, labelEn: 'Artisan Supply Barrel' },
        ],
      },
    ],
    npcs: [
      { npcId: `npc:${country}:mentor`, entityTypeId: `miraverse:mentor_${country.toLowerCase()}`, country, nameEn: mentorNameEn, nameNative: mentorNameNative, role: 'mentor', spawnPos: { x: cx - 7, y: 65, z: 3 }, defaultAnimation: 'greeting', dialogueGreetingEn: `Welcome to ${titleEn}! Let's gather ingredients, trade at the market, cook ${dishNameEn}, restore our landmark, and learn 3 cultural words.`, dialogueGreetingNative: titleNative, humanReviewRequired: true },
      { npcId: `npc:${country}:merchant`, entityTypeId: `miraverse:mentor_${country.toLowerCase()}`, country, nameEn: `${titleEn} Market Merchant`, nameNative: mentorNameNative, role: 'merchant', spawnPos: { x: cx - 11, y: 65, z: -11 }, defaultAnimation: 'idle', dialogueGreetingEn: 'Trade your gathered herbs and ingredients for specialty cooking supplies!', dialogueGreetingNative: titleNative, humanReviewRequired: true },
      { npcId: `npc:${country}:artisan`, entityTypeId: `miraverse:mentor_${country.toLowerCase()}`, country, nameEn: `${titleEn} Master Artisan`, nameNative: mentorNameNative, role: 'artisan', spawnPos: { x: cx - 9, y: 65, z: 9 }, defaultAnimation: 'pointing', dialogueGreetingEn: 'Place restoration blocks on our damaged landmark to see the before/after transformation!', dialogueGreetingNative: titleNative, humanReviewRequired: true },
      { npcId: `npc:${country}:cousin`, entityTypeId: `miraverse:mentor_${country.toLowerCase()}`, country, nameEn: `${titleEn} Cousin Guide`, nameNative: mentorNameNative, role: 'cousin', spawnPos: { x: cx + 12, y: 65, z: -14 }, defaultAnimation: 'walk', dialogueGreetingEn: 'Explore the streets and discover the three cultural vocabulary objects!', dialogueGreetingNative: titleNative, humanReviewRequired: true },
    ],
    anchors: [
      { anchorId: `anchor:${country}:return_hub`, country, kind: 'portal', pos: { x: cx, y: 65, z: -24 }, blockId: trimBlock, labelEn: 'Return to MiraVerse Gateway Hub' },
      { anchorId: `anchor:${country}:gather_1`, country, kind: 'gather_node', pos: { x: cx - 18, y: 65, z: 2 }, blockId: 'minecraft:barrel', labelEn: `Gather ${gatherItem1}`, linkedItemId: gatherItem1 },
      { anchorId: `anchor:${country}:gather_2`, country, kind: 'gather_node', pos: { x: cx - 15, y: 65, z: -4 }, blockId: 'minecraft:barrel', labelEn: `Gather ${gatherItem2}`, linkedItemId: gatherItem2 },
      { anchorId: `anchor:${country}:trade_stall`, country, kind: 'trade_stall', pos: { x: cx - 11, y: 65, z: -10 }, blockId: 'minecraft:emerald_block', labelEn: 'Market Trade Stall', linkedItemId: tradeItem },
      { anchorId: `anchor:${country}:cooking_station`, country, kind: 'cooking_station', pos: { x: cx - 6, y: 65, z: 8 }, blockId: stationBlockId, labelEn: `Cook ${dishNameEn}`, linkedItemId: dishItemId },
      { anchorId: `anchor:${country}:restoration_site`, country, kind: 'restoration_site', pos: { x: cx - 8, y: 65, z: 8 }, blockId: wallBlock, labelEn: `Restore ${titleEn} Landmark`, linkedItemId: restoreItem },
      { anchorId: `anchor:${country}:word_1`, country, kind: 'word_object', pos: { x: cx - 5, y: 65, z: 8 }, blockId: stationBlockId, labelEn: `Word: ${words[0].en}`, labelNative: words[0].word, transliteration: words[0].translit },
      { anchorId: `anchor:${country}:word_2`, country, kind: 'word_object', pos: { x: cx - 17, y: 65, z: 2 }, blockId: trimBlock, labelEn: `Word: ${words[1].en}`, labelNative: words[1].word, transliteration: words[1].translit },
      { anchorId: `anchor:${country}:word_3`, country, kind: 'word_object', pos: { x: cx + 12, y: 64, z: -16 }, blockId: roofBlock, labelEn: `Word: ${words[2].en}`, labelNative: words[2].word, transliteration: words[2].translit },
      { anchorId: `anchor:${country}:private_plot`, country, kind: 'plot_stone', pos: { x: cx + 32, y: 65, z: 20 }, blockId: trimBlock, labelEn: `${titleEn} Explorer Private Building Plot` },
      { anchorId: `anchor:${country}:optional_collectible`, country, kind: 'optional_collectible', pos: { x: cx - 2, y: 66, z: 24 }, blockId: 'minecraft:chest', labelEn: `Optional Keepsake (${optionalItem})`, linkedItemId: optionalItem },
    ],
    restorationStages: [
      { stage: 0, descriptionEn: 'Before Restoration: Damaged masonry and missing architectural trim.', blockPlacements: [{ offset: { x: 0, y: 0, z: 0 }, blockId: 'minecraft:cobblestone' }, { offset: { x: 0, y: 1, z: 0 }, blockId: 'minecraft:air' }] },
      { stage: 1, descriptionEn: 'Stage 1 Restoration: Structural walls rebuilt.', blockPlacements: [{ offset: { x: 0, y: 0, z: 0 }, blockId: wallBlock }, { offset: { x: 0, y: 1, z: 0 }, blockId: trimBlock }] },
      { stage: 2, descriptionEn: 'Stage 2 Restoration: Complete roof, shutters, and lanterns restored!', blockPlacements: [{ offset: { x: 0, y: 0, z: 0 }, blockId: wallBlock }, { offset: { x: 0, y: 1, z: 0 }, blockId: trimBlock }, { offset: { x: 0, y: 2, z: 0 }, blockId: roofBlock }] },
    ],
    cookingSequence: {
      country,
      dishItemId,
      dishNameEn,
      dishNameNative,
      stationBlockId,
      orderedSteps: [
        { stepIndex: 0, ingredientItemId: gatherItem1, quantity: 1, actionVerb: 'Prepare primary ingredient' },
        { stepIndex: 1, ingredientItemId: tradeItem, quantity: 1, actionVerb: 'Combine traded market ingredient' },
        { stepIndex: 2, ingredientItemId: gatherItem2, quantity: 1, actionVerb: 'Bake/Simmer with Elder Mentor supervision', adultSupervisionNote: 'Elder NPC handles stove/oven heat safely.' },
      ],
    },
  };
}

export const REGIONS_V10: Record<CountryId, RegionDistrictContract> = {
  LB: makeDistrict(
    'LB', 0, 'Byblos Harbor', 'جبيل · لبنان', 'Teta Nahla', 'تيتا نهلة',
    'miraverse:lb_manoushe', "Za'atar Man'oushe", 'منقوشة زعتر', 'miraverse:lb_saj_hearth_block',
    'miraverse:lb_byblos_limestone', 'miraverse:lb_terracotta_roof_tile', 'miraverse:lb_cedar_shutter',
    'miraverse:lb_zaatar', 'miraverse:lb_flour', 'miraverse:lb_olive_oil', 'miraverse:lb_limestone_block', 'miraverse:lb_cedar_sapling',
    [
      { word: 'صاج', translit: 'ṣāj', en: 'Domed Saj Griddle' },
      { word: 'زعتر', translit: "za'tar", en: 'Wild Thyme Blend' },
      { word: 'بحر', translit: 'baḥr', en: 'Mediterranean Sea' },
    ]
  ),
  EG: makeDistrict(
    'EG', 1, 'Cairo Lantern Courtyard', 'القاهرة · مصر', 'Teta Samira', 'تيتا سميرة',
    'miraverse:eg_koshari', 'Cairene Koshari', 'كشري مصري', 'miraverse:eg_koshari_cauldron_block',
    'miraverse:eg_khan_arch_stone', 'miraverse:eg_spice_bazaar_canopy', 'miraverse:eg_cairo_mashrabiya',
    'miraverse:eg_lentils', 'miraverse:eg_rice', 'miraverse:eg_tomato_sauce', 'miraverse:eg_fanous_lantern', 'miraverse:eg_sun_stone',
    [
      { word: 'فانوس', translit: 'fānūs', en: 'Ramadan Lantern' },
      { word: 'كشري', translit: 'kusharī', en: 'Cairene Koshari Dish' },
      { word: 'نيل', translit: 'nīl', en: 'River Nile' },
    ]
  ),
  IQ: makeDistrict(
    'IQ', 2, 'Baghdad Riverside', 'بغداد · العراق', 'Bibi Amal', 'بيبي أمل',
    'miraverse:iq_kleicha', 'Cardamom Date Kleicha', 'كليجة بالتمر والهيل', 'miraverse:iq_kleicha_brick_oven',
    'miraverse:iq_tigris_glazed_brick', 'miraverse:iq_turquoise_muqarnas', 'miraverse:iq_shanasheel_oriel_screen',
    'miraverse:iq_date_paste', 'miraverse:iq_wheat_dough', 'miraverse:iq_cardamom', 'miraverse:iq_palm_wood', 'miraverse:iq_pomegranate',
    [
      { word: 'شناشيل', translit: 'shanāshīl', en: 'Carved Oriel Balcony' },
      { word: 'كليجة', translit: 'klīcha', en: 'Spiced Date Pastry' },
      { word: 'دجلة', translit: 'dijla', en: 'Tigris River' },
    ]
  ),
  KR: makeDistrict(
    'KR', 3, 'Jeonju Hanok Village', '전주 한옥마을 · 대한민국', 'Halmeoni', '할머니',
    'miraverse:kr_songpyeon', 'Pine-Steamed Songpyeon', '송편', 'miraverse:kr_songpyeon_steamer_block',
    'miraverse:kr_hanji_sliding_screen', 'miraverse:kr_giwa_eave_tile', 'miraverse:kr_pine_beam_bracket',
    'miraverse:kr_rice_flour', 'miraverse:kr_pine_needles', 'miraverse:kr_sesame_honey', 'miraverse:kr_giwa_tile', 'miraverse:kr_celadon_cup',
    [
      { word: '한옥', translit: 'hanok', en: 'Traditional Korean House' },
      { word: '송편', translit: 'songpyeon', en: 'Half-Moon Rice Cake' },
      { word: '할머니', translit: 'halmeoni', en: 'Grandmother' },
    ]
  ),
  FR: makeDistrict(
    'FR', 4, 'Vieux Lyon Bakery', 'Vieux Lyon · France', 'Mamie Claire', 'Mamie Claire',
    'miraverse:fr_galette_des_rois', 'Galette des Rois', 'Galette des Rois', 'miraverse:fr_boulangerie_wood_oven',
    'miraverse:fr_lyon_ochre_stucco', 'miraverse:fr_mansard_slate_shingle', 'miraverse:fr_carved_oak_shutter',
    'miraverse:fr_puff_pastry', 'miraverse:fr_porcelain_feve', 'miraverse:fr_almond_cream', 'miraverse:fr_cut_stone', 'miraverse:fr_lavender',
    [
      { word: 'boulangerie', translit: 'boo-lahn-zhuh-ree', en: 'Neighborhood Bakery' },
      { word: 'galette', translit: 'gah-let', en: 'Flaky Almond King Cake' },
      { word: 'traboule', translit: 'trah-bool', en: 'Covered Renaissance Passageway' },
    ]
  ),
};
