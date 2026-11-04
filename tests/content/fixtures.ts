import type { Pack, Scene, Story } from '../../packages/content/schema.js';

export function createValidStory(): Story {
  const scenes: Scene[] = Array.from({ length: 15 }, (_, idx) => {
    const id = idx + 1;
    return {
      id,
      title: `Scene ${id} Title`,
      text: `Scene ${id} narrative text in Lebanese Arabic dialect with rich cultural context.`,
      gloss_en: `Scene ${id} English gloss translation for release profile validation.`,
      image_prompt: `Warm storybook illustration of Byblos harbor scene ${id}, golden hour lighting.`,
    };
  });

  return {
    lang: 'ar-LB',
    country: 'LB',
    title: 'رحلة في جبيل',
    title_en: 'Journey in Byblos',
    characters: [
      {
        name: 'Mira',
        role: 'protagonist',
        note: 'Curious young traveler exploring her heritage.',
      },
      {
        name: 'Teta Salma',
        role: 'elder_mentor',
        note: 'Wise grandmother who shares stories of ancient cedars.',
      },
      {
        name: 'Rami',
        role: 'host_peer',
        note: 'Local friend in Byblos who loves building boats.',
      },
    ],
    scenes,
    vocab: [
      { word: 'أرز', translit: 'arz', en: 'cedar' },
      { word: 'بحر', translit: 'bahr', en: 'sea' },
      { word: 'خبز', translit: 'khubz', en: 'bread' },
      { word: 'زيتون', translit: 'zaytoun', en: 'olive' },
      { word: 'صديق', translit: 'sadiq', en: 'friend' },
      { word: 'بيت', translit: 'bayt', en: 'house' },
      { word: 'شمس', translit: 'shams', en: 'sun' },
      { word: 'مينا', translit: 'mina', en: 'harbor' },
      { word: 'جبل', translit: 'jabal', en: 'mountain' },
      { word: 'تاريخ', translit: 'tarikh', en: 'history' },
    ],
  };
}

export function createValidPack(): Pack {
  return {
    country: 'LB',
    name_en: 'Lebanon',
    lang: 'ar-LB',
    colors: {
      primary: '#C1272D',
      secondary: '#00A651',
    },
    regions: [
      { id: 'byblos_harbor', name_en: 'Byblos Harbor' },
      { id: 'chouf_cedars', name_en: 'Chouf Cedars' },
    ],
    mentor: {
      name: 'Teta Salma',
      greeting_en: 'Welcome to Byblos, little explorer!',
      greeting: 'أهلاً وسهلاً في جبيل!',
    },
    items: [
      { id: 'cedar_plank', name_en: 'Cedar Plank', color: '#8B5A2B' },
      { id: 'limestone_block', name_en: 'Limestone Block', color: '#E8E0D5' },
      { id: 'olive_oil', name_en: 'Olive Oil', color: '#B5A642' },
      { id: 'zaatar_herb', name_en: 'Zaatar Herb', color: '#4F7942' },
      { id: 'pita_dough', name_en: 'Pita Dough', color: '#F5DEB3' },
      { id: 'manoushe_flatbread', name_en: 'Manoushe Flatbread', color: '#D2995A' },
      { id: 'woven_basket', name_en: 'Woven Basket', color: '#C68E3F' },
    ],
    chapters: [
      {
        id: 1,
        title_en: 'Secrets of the Phoenician Coast',
        challenges: [
          {
            id: 'lb_gather_ingredients',
            type: 'gather',
            title_en: 'Harvest the Grove',
            goal_en: 'Gather olive oil and zaatar herbs from the terraced hillside.',
            needs: [
              { item: 'olive_oil', count: 2 },
              { item: 'zaatar_herb', count: 3 },
            ],
            reward: { item: 'pita_dough', count: 1 },
          },
          {
            id: 'lb_cook_manoushe',
            type: 'cook',
            title_en: 'Bake Morning Manoushe',
            goal_en: 'Combine pita dough, olive oil, and zaatar herb on the saj griddle.',
            recipe: {
              inputs: ['pita_dough', 'olive_oil', 'zaatar_herb'],
              output: 'manoushe_flatbread',
            },
            reward: { item: 'manoushe_flatbread', count: 2 },
          },
          {
            id: 'lb_trade_harbor',
            type: 'trade',
            title_en: 'Harbor Market Exchange',
            goal_en: 'Trade warm manoushe flatbread with the harbor artisan for a woven basket.',
            needs: [{ item: 'manoushe_flatbread', count: 1 }],
            reward: { item: 'woven_basket', count: 1 },
          },
          {
            id: 'lb_word_greetings',
            type: 'word',
            title_en: 'Words of the Coast',
            goal_en: 'Learn three essential Lebanese Arabic words with Teta Salma.',
            words: [
              { word: 'أرز', translit: 'arz', en: 'cedar' },
              { word: 'بحر', translit: 'bahr', en: 'sea' },
              { word: 'مينا', translit: 'mina', en: 'harbor' },
            ],
            reward: { item: 'cedar_plank', count: 2 },
          },
          {
            id: 'lb_build_arch',
            type: 'build',
            title_en: 'Restore the Harbor Arch',
            goal_en: 'Use limestone blocks and cedar planks to rebuild the harbor archway.',
            blueprint: [
              'CCC',
              'L.L',
              'L.L',
            ],
            blueprintLegend: {
              C: 'cedar_plank',
              L: 'limestone_block',
            },
            reward: { item: 'limestone_block', count: 1 },
          },
        ],
      },
    ],
  };
}

export function createValidPackFR(): Pack {
  return {
    country: 'FR',
    name_en: 'France',
    lang: 'fr',
    colors: {
      primary: '#0055A4',
      secondary: '#EF4135',
    },
    regions: [
      { id: 'lyon_old_town', name_en: 'Old Lyon' },
      { id: 'provence_fields', name_en: 'Provence Fields' },
    ],
    mentor: {
      name: 'Mamie Claire',
      greeting_en: 'Welcome to Lyon, young apprentice!',
      greeting: 'Bienvenue à Lyon, jeune apprenti !',
    },
    items: [
      { id: 'wheat_flour', name_en: 'Wheat Flour', color: '#F5F5DC' },
      { id: 'sweet_butter', name_en: 'Sweet Butter', color: '#FFFACD' },
      { id: 'brioche_loaf', name_en: 'Brioche Loaf', color: '#DAA520' },
      { id: 'lavender_bundle', name_en: 'Lavender Bundle', color: '#967BB6' },
      { id: 'oak_beam', name_en: 'Oak Beam', color: '#80461B' },
      { id: 'slate_tile', name_en: 'Slate Tile', color: '#708090' },
    ],
    chapters: [
      {
        id: 1,
        title_en: 'Lanterns of Lyon',
        challenges: [
          {
            id: 'fr_gather_bakery',
            type: 'gather',
            title_en: 'Gather Bakery Supplies',
            goal_en: 'Collect wheat flour and sweet butter for the morning bake.',
            needs: [
              { item: 'wheat_flour', count: 2 },
              { item: 'sweet_butter', count: 1 },
            ],
            reward: { item: 'lavender_bundle', count: 1 },
          },
          {
            id: 'fr_cook_brioche',
            type: 'cook',
            title_en: 'Bake Golden Brioche',
            goal_en: 'Mix wheat flour and sweet butter into a golden brioche loaf.',
            recipe: {
              inputs: ['wheat_flour', 'sweet_butter'],
              output: 'brioche_loaf',
            },
            reward: { item: 'brioche_loaf', count: 1 },
          },
          {
            id: 'fr_trade_market',
            type: 'trade',
            title_en: 'Silk Weaver Trade',
            goal_en: 'Trade a brioche loaf for seasoned oak beams.',
            needs: [{ item: 'brioche_loaf', count: 1 }],
            reward: { item: 'oak_beam', count: 2 },
          },
          {
            id: 'fr_word_market',
            type: 'word',
            title_en: 'French Market Words',
            goal_en: 'Practice three French words at the square.',
            words: [
              { word: 'pain', translit: 'pan', en: 'bread' },
              { word: 'pont', translit: 'pon', en: 'bridge' },
              { word: 'ami', translit: 'a-mee', en: 'friend' },
            ],
            reward: { item: 'slate_tile', count: 2 },
          },
          {
            id: 'fr_build_roof',
            type: 'build',
            title_en: 'Build the Market Awning',
            goal_en: 'Arrange slate tiles and oak beams to shelter the market stall.',
            blueprint: [
              'SSS',
              'O.O',
            ],
            blueprintLegend: {
              S: 'slate_tile',
              O: 'oak_beam',
            },
            reward: { item: 'lavender_bundle', count: 1 },
          },
        ],
      },
    ],
  };
}

export function createValidPackEG(): Pack {
  return {
    country: 'EG',
    name_en: 'Egypt',
    lang: 'ar-EG',
    colors: {
      primary: '#CE1126',
      secondary: '#C09300',
    },
    regions: [
      { id: 'cairo_bazaar', name_en: 'Cairo Bazaar' },
      { id: 'aswan_nile', name_en: 'Aswan Nile Bank' },
    ],
    mentor: {
      name: 'Ammo Hassan',
      greeting_en: 'Welcome to Cairo by the Nile!',
      greeting: 'أهلاً بيك في القاهرة على النيل!',
    },
    items: [
      { id: 'nile_clay', name_en: 'Nile Clay', color: '#A0522D' },
      { id: 'papyrus_reed', name_en: 'Papyrus Reed', color: '#C2B280' },
      { id: 'red_lentils', name_en: 'Red Lentils', color: '#E35335' },
      { id: 'white_rice', name_en: 'White Rice', color: '#FAF0E6' },
      { id: 'koshari_bowl', name_en: 'Koshari Bowl', color: '#CD853F' },
      { id: 'alabaster_stone', name_en: 'Alabaster Stone', color: '#F2F0E6' },
    ],
    chapters: [
      {
        id: 1,
        title_en: 'Songs of the Nile',
        challenges: [
          {
            id: 'eg_gather_reeds',
            type: 'gather',
            title_en: 'Gather Riverbank Goods',
            goal_en: 'Collect Nile clay and papyrus reeds along the riverbank.',
            needs: [
              { item: 'nile_clay', count: 2 },
              { item: 'papyrus_reed', count: 2 },
            ],
            reward: { item: 'red_lentils', count: 1 },
          },
          {
            id: 'eg_cook_koshari',
            type: 'cook',
            title_en: 'Simmer Warm Koshari',
            goal_en: 'Cook red lentils and white rice into a hearty koshari bowl.',
            recipe: {
              inputs: ['red_lentils', 'white_rice'],
              output: 'koshari_bowl',
            },
            reward: { item: 'koshari_bowl', count: 1 },
          },
          {
            id: 'eg_trade_bazaar',
            type: 'trade',
            title_en: 'Bazaar Lantern Trade',
            goal_en: 'Share a warm koshari bowl in exchange for carved alabaster stone.',
            needs: [{ item: 'koshari_bowl', count: 1 }],
            reward: { item: 'alabaster_stone', count: 2 },
          },
          {
            id: 'eg_word_nile',
            type: 'word',
            title_en: 'Words of the River',
            goal_en: 'Learn three Egyptian Arabic words with Ammo Hassan.',
            words: [
              { word: 'نيل', translit: 'nil', en: 'Nile' },
              { word: 'شمس', translit: 'shams', en: 'sun' },
              { word: 'مركب', translit: 'markeb', en: 'boat' },
            ],
            reward: { item: 'nile_clay', count: 2 },
          },
          {
            id: 'eg_build_courtyard',
            type: 'build',
            title_en: 'Raise the Courtyard Pillars',
            goal_en: 'Place alabaster stones and Nile clay bricks to frame the courtyard.',
            blueprint: [
              'AAA',
              'N.N',
            ],
            blueprintLegend: {
              A: 'alabaster_stone',
              N: 'nile_clay',
            },
            reward: { item: 'papyrus_reed', count: 1 },
          },
        ],
      },
    ],
  };
}
