/**
 * MiraVerse v1.3 — Cultural Adventure Portal, Geographic Atlas, 25 Quest Maps & 100 Age-Tier Stages
 * Owners: CL01, CL02, CL03, DX01, DX02, DX03, DX04, DX05, DX06, AG01
 *
 * Mandatory Country Order:
 * 1. Lebanon: Byblos (LB)
 * 2. Iraq: Baghdad (IQ)
 * 3. Egypt: Cairo (EG)
 * 4. France: Lyon (FR)
 * 5. South Korea: Jeonju (KR)
 */
import type { ChallengeType, CountryCode } from '../index';
import { V08_WORLD_VISUAL_MAP } from '../v08/index';

export const V13_RELEASE_VERSION = '1.3.0' as const;

export const V13_COUNTRIES_ORDERED: readonly CountryCode[] = ['LB', 'IQ', 'EG', 'FR', 'KR'] as const;

export type AgeTierId = '5-7' | '8-10' | '11-13' | '14-17';

export interface AgeTierMeta {
  id: AgeTierId;
  label: string;
  pedagogyFocus: string;
  readingLevel: string;
}

export const V13_AGE_TIERS: readonly AgeTierMeta[] = [
  {
    id: '5-7',
    label: 'Ages 5–7',
    pedagogyFocus: 'Guided discovery and visual learning',
    readingLevel: 'Early Reader · Visual Story & Spoken Phrases',
  },
  {
    id: '8-10',
    label: 'Ages 8–10',
    pedagogyFocus: 'Collecting, crafting, and simple puzzles',
    readingLevel: 'Explorer · Hands-On Craft & Cultural Vocabulary',
  },
  {
    id: '11-13',
    label: 'Ages 11–13',
    pedagogyFocus: 'Investigation and cooperative problem-solving',
    readingLevel: 'Investigator · Architectural Systems & Co-Op Quests',
  },
  {
    id: '14-17',
    label: 'Ages 14–17',
    pedagogyFocus: 'Strategic challenges and historical interpretation',
    readingLevel: 'Scholar · Primary Sources, Historiography & Comparative Heritage',
  },
] as const;

export type EpistemicClassification =
  | 'ESTABLISHED_HISTORY'
  | 'ARCHAEOLOGICAL_RECORD'
  | 'LIVING_TRADITION'
  | 'FOLKLORE_AND_MYTHOLOGY';

export type AgeTierV13 = AgeTierId;

export const EPISTEMIC_BADGE_LABELS: Record<EpistemicClassification, string> = {
  ESTABLISHED_HISTORY: 'Established History',
  ARCHAEOLOGICAL_RECORD: 'Archaeological Record',
  LIVING_TRADITION: 'Living Cultural Tradition',
  FOLKLORE_AND_MYTHOLOGY: 'Folklore & Mythology',
};

export interface GeographicLandmarkV13 {
  landmarkId: string;
  country: CountryCode;
  name: string;
  nativeName: string;
  coordinates: [number, number]; // [latitude, longitude] (WGS84 verified)
  eraOrCentury: string;
  classification: EpistemicClassification;
  summary: string;
  educationalReference: string;
}

export interface TimelineEventV13 {
  era: string;
  title: string;
  classification: EpistemicClassification;
  description: string;
}

export interface CulturalFigureV13 {
  id: string;
  name: string;
  role: string;
  era: string;
  classification: EpistemicClassification;
  contribution: string;
}

export interface CulturalArtifactV13 {
  artifactId: string;
  country: CountryCode;
  name: string;
  nativeName: string;
  materialAndPeriod: string;
  classification: EpistemicClassification;
  description: string;
  provenanceNote: string;
  imageUrl: string;
  unlockedByQuestAct: number;
}

export interface AgeTierStageSpecV13 {
  ageTier: AgeTierId;
  stageId: string; // e.g. "LB:act1:5-7" (100 unique stage IDs across 25 quests x 4 tiers)
  focusTitle: string;
  learningObjective: string;
  guidedActivity: string;
  challengePrompt: string;
  historicalReflection: string;
}

export interface QuestMapWaypointV13 {
  waypointId: string;
  label: string;
  kind: 'START' | 'NPC' | 'OBJECTIVE' | 'CHECKPOINT' | 'SUPPLY' | 'ARTIFACT_REWARD';
  xPct: number;
  yPct: number;
  detail: string;
}

export interface QuestEncyclopediaEntryV13 {
  questId: string; // e.g. "LB-act-1" (25 total: 5 countries x 5 acts)
  legacyPackChallengeId: string; // Preserves LB-1-gather, etc.
  legacyObjectiveId: string; // Preserves LB:ch1:harbor:gather, etc.
  country: CountryCode;
  actNumber: 1 | 2 | 3 | 4 | 5;
  challengeType: ChallengeType;
  titleEn: string;
  titleNative: string;
  narrativeIntro: string;
  learningObjectives: string[];
  npcs: { id: string; name: string; role: string }[];
  questMapId: string;
  questMapImageUrl: string;
  questMapZoneLabel: string;
  waypoints: QuestMapWaypointV13[];
  suppliesRequired: string[];
  activitiesAndChallenges: string[];
  culturalKnowledgeSummary: string;
  epistemicClassification: EpistemicClassification;
  epistemicNote: string;
  rewardArtifactId: string;
  rewardTokens: number;
  robloxMechanics: string;
  minecraftMechanics: string;
  verifiedAvailability: {
    webCompanionInteractive: boolean;
    robloxStatus: 'PLAYABLE_RC1_BYBLOS' | 'PLANNED_RC3_WORLD_PACK';
    minecraftStatus: 'INCLUDED_IN_MCADDON_PACK';
    availabilityLabel: string;
  };
  ageTiers: Record<AgeTierId, AgeTierStageSpecV13>;
}

export interface CountryExperienceV13 {
  country: CountryCode;
  orderIndex: 1 | 2 | 3 | 4 | 5;
  cityName: string;
  countryNameEn: string;
  countryNameNative: string;
  storyLang: 'ar-LB' | 'ar-IQ' | 'ar-EG' | 'fr' | 'ko';
  coverArtUrl: string;
  questMapArtUrl: string;
  mentorPortraitUrl: string;
  stampArtUrl: string;
  heroTagline: string;
  historicalIntroduction: string;
  culturalThemes: {
    title: string;
    classification: EpistemicClassification;
    body: string;
  }[];
  coordinatesCenter: [number, number]; // [lat, lng]
  boundingBox: [number, number, number, number]; // [south, west, north, east]
  geographicSummary: string;
  landmarks: GeographicLandmarkV13[];
  importantFigures: CulturalFigureV13[];
  architectureAndLandmarksSummary: string[];
  foodAndCrafts: {
    dishName: string;
    dishDescription: string;
    craftName: string;
    craftDescription: string;
  };
  timeline: TimelineEventV13[];
  artifacts: CulturalArtifactV13[];
  verifiedReferences: { title: string; source: string; classification: EpistemicClassification }[];
  platformInfo: {
    robloxSummary: string;
    robloxPlayableNow: boolean;
    minecraftSummary: string;
    minecraftAddonReady: boolean;
  };
}

export const V13_COUNTRY_EXPERIENCES: Record<CountryCode, CountryExperienceV13> = {
  LB: {
    country: 'LB',
    orderIndex: 1,
    cityName: 'Byblos (Jbeil)',
    countryNameEn: 'Lebanon',
    countryNameNative: 'لبنان · جبيل',
    storyLang: 'ar-LB',
    coverArtUrl: '/art/p0/world-cover-LB.jpg',
    questMapArtUrl: '/art/v13/quest-map-LB.jpg',
    mentorPortraitUrl: '/art/p0/portrait-mentor-LB.jpg',
    stampArtUrl: '/art/v08/stamps/stamp-LB.svg',
    heroTagline: 'Cradle of the Phoenician Alphabet, Cedar Maritime Trade & Levantine Hearth Traditions',
    historicalIntroduction:
      'Inhabited continuously for over 7,000 years, Byblos (known in ancient Canaanite as Gubla and in Arabic as Jbeil) was the premier timber and papyrus port of the eastern Mediterranean. From its limestone quays, Phoenician mariners traded Mount Lebanon cedar wood with Egypt and disseminated the 22-letter consonantal alphabet that became the ancestor of Greek, Latin, Arabic, and Hebrew scripts.',
    culturalThemes: [
      {
        title: 'The Phoenician 22-Letter Alphabet',
        classification: 'ARCHAEOLOGICAL_RECORD',
        body: 'Inscribed on the 10th-century BCE Ahiram Sarcophagus discovered in the Byblos royal necropolis, the Phoenician script simplified writing from hundreds of pictographs into 22 consonantal signs.',
      },
      {
        title: 'Cedar Maritime Trade & Papyrus Port',
        classification: 'ESTABLISHED_HISTORY',
        body: 'Egyptian Old Kingdom records document ships ("Byblos boats") carrying fragrant Cedrus libani beams to the Nile while importing papyrus rolls—giving the Greek word bublos (book) its name.',
      },
      {
        title: 'Byblos Multi-Strata Archaeology',
        classification: 'ARCHAEOLOGICAL_RECORD',
        body: 'Excavations reveal Neolithic fishing dwellings, Bronze Age temples (Temple of the Obelisks), Persian fortifications, a Roman colonnade, and the 12th-century Crusader limestone castle.',
      },
      {
        title: 'Myth of Adonis & the Nahr Ibrahim River',
        classification: 'FOLKLORE_AND_MYTHOLOGY',
        body: 'Classical and Near Eastern mythology associated the nearby Nahr Ibrahim valley with the seasonal myth of Adonis; in spring, iron-rich mountain snowmelt turns the river crimson (a natural geological phenomenon interpreted mythologically in antiquity).',
      },
      {
        title: 'Diaspora Memory & the Morning Saj Hearth',
        classification: 'LIVING_TRADITION',
        body: 'Across Lebanon and global Lebanese diaspora communities, gathering wild mountain za’atar, pressing autumn olives, and baking flatbread on a domed cast-iron saj remain living expressions of hospitality.',
      },
    ],
    coordinatesCenter: [34.123, 35.6511],
    boundingBox: [34.115, 35.642, 34.131, 35.662],
    geographicSummary:
      'Located on a coastal sandstone and limestone promontory 37 km north of Beirut along the eastern Mediterranean shore, backed by the terraced western slopes of Mount Lebanon.',
    landmarks: [
      {
        landmarkId: 'geo:LB:harbor',
        country: 'LB',
        name: 'Ancient Phoenician Harbor of Byblos',
        nativeName: 'ميناء جبيل الفينيقي',
        coordinates: [34.1219, 35.6442],
        eraOrCentury: 'c. 3000 BCE – Present',
        classification: 'ARCHAEOLOGICAL_RECORD',
        summary: 'Natural rocky cove protected by stone moles where timber and papyrus vessels anchored in antiquity.',
        educationalReference: 'UNESCO World Heritage List — Byblos (Criterion iii, iv, vi).',
      },
      {
        landmarkId: 'geo:LB:castle',
        country: 'LB',
        name: 'Byblos Citadel & Archaeological Park',
        nativeName: 'قلعة جبيل والموقع الأثري',
        coordinates: [34.1194, 35.6456],
        eraOrCentury: '12th Century CE (built over Bronze Age strata)',
        classification: 'ARCHAEOLOGICAL_RECORD',
        summary: 'Limestone fortress overlooking the Temple of Baalat Gebal, the L-shaped temple, and the Temple of the Obelisks.',
        educationalReference: 'Direction Générale des Antiquités (Lebanon) — Byblos Site Monograph.',
      },
      {
        landmarkId: 'geo:LB:souk',
        country: 'LB',
        name: 'Old Stone Souk of Jbeil',
        nativeName: 'سوق جبيل القديم',
        coordinates: [34.1211, 35.6472],
        eraOrCentury: 'Ottoman & Mamluk periods to Present',
        classification: 'LIVING_TRADITION',
        summary: 'Vaulted limestone market lanes housing spice merchants, bakeries, and fossil workshops.',
        educationalReference: 'Lebanese Urban Heritage Survey — Historic Jbeil Quarter.',
      },
      {
        landmarkId: 'geo:LB:cedars',
        country: 'LB',
        name: 'Mount Lebanon Cedar & Olive Terraces',
        nativeName: 'مدرجات الأرز والزيتون في جبل لبنان',
        coordinates: [34.142, 35.715],
        eraOrCentury: 'Holocene Forest & Millennial Agricultural Terraces',
        classification: 'ESTABLISHED_HISTORY',
        summary: 'Highland limestone terraces cultivating olive groves, wild thyme (Origanum syriacum), and protected cedar stands.',
        educationalReference: 'Shouf & Jbeil Biosphere Cultural Landscape Studies.',
      },
    ],
    importantFigures: [
      {
        id: 'fig:LB:ahiram',
        name: 'Scribes of the Ahiram Inscription',
        role: 'Phoenician Royal Epigraphers',
        era: 'c. 1000 BCE',
        classification: 'ARCHAEOLOGICAL_RECORD',
        contribution: 'Carved the earliest fully developed monumental Phoenician alphabetic inscription on the Sarcophagus of King Ahiram.',
      },
      {
        id: 'fig:LB:teta_nahla',
        name: 'Teta Nahla (MiraVerse Cultural Mentor)',
        role: 'Harbor Baker & Heritage Storykeeper',
        era: 'Contemporary Living Tradition',
        classification: 'LIVING_TRADITION',
        contribution: 'Guides learners through Lebanese Arabic hospitality phrases, wild za’atar stewardship, and saj bread baking.',
      },
    ],
    architectureAndLandmarksSummary: [
      'Triple-arched central hall house (lewan / mandaloun) carved from golden local ramleh limestone',
      'Vaulted ground-floor souk workshops with heavy cedarwood shutters',
      'Domed cast-iron saj hearth set in a shaded courtyard terrace',
      'Phoenician ashlar masonry and Crusader reutilized Roman granite columns',
    ],
    foodAndCrafts: {
      dishName: "Za'atar & Olive Oil Man'oushe on the Saj",
      dishDescription:
        'Unleavened or lightly leavened wheat dough stretched paper-thin over a cushion and baked on a convex heated saj dome, brushed with mountain olive oil, wild thyme, toasted sesame, and crimson sumac.',
      craftName: 'Phoenician Alphabetic Carving & Cedar Joinery',
      craftDescription:
        'Incising linear consonantal letters in limestone tablets and crafting pegged aromatic cedar chests and boat ribs.',
    },
    timeline: [
      {
        era: 'c. 5000 BCE',
        title: 'Neolithic Coastal Village',
        classification: 'ARCHAEOLOGICAL_RECORD',
        description: 'Early Mediterranean fishermen build lime-plastered stone huts on the Byblos headland.',
      },
      {
        era: 'c. 2800–2000 BCE',
        title: 'Bronze Age Cedar & Papyrus Trade',
        classification: 'ESTABLISHED_HISTORY',
        description: 'Byblos becomes the primary timber trade partner of Old Kingdom Egypt; Temple of Baalat Gebal constructed.',
      },
      {
        era: 'c. 1000 BCE',
        title: 'Ahiram Alphabetic Inscription',
        classification: 'ARCHAEOLOGICAL_RECORD',
        description: 'The 22-letter Phoenician consonantal alphabet is immortalized on the Sarcophagus of Ahiram.',
      },
      {
        era: 'Classical Antiquity',
        title: 'Mythology of Adonis & Roman Colonnade',
        classification: 'FOLKLORE_AND_MYTHOLOGY',
        description: 'Regional folklore links the seasonal crimson waters of the Nahr Ibrahim river to the myth of Adonis.',
      },
      {
        era: 'Present Day',
        title: 'UNESCO World Heritage & Living Culinary Culture',
        classification: 'LIVING_TRADITION',
        description: 'Jbeil preserves its layered archaeological park alongside active harbor fishing and traditional saj bakeries.',
      },
    ],
    artifacts: [
      {
        artifactId: 'art:LB:alphabet_tablet',
        country: 'LB',
        name: 'Byblos Phoenician Alphabet Tablet',
        nativeName: 'لوح الأبجدية الفينيقية الجبيلية',
        materialAndPeriod: 'Carved Limestone & Cedar Frame · Iron Age Replica (c. 1000 BCE tradition)',
        classification: 'ARCHAEOLOGICAL_RECORD',
        description: 'Displays the 22 consonantal signs (Aleph, Beth, Gimel, Daleth...) that revolutionized human literacy.',
        provenanceNote: 'Inspired by the Ahiram Sarcophagus inscription in the National Museum of Beirut.',
        imageUrl: '/art/v13/cultural-artifacts-treasury.jpg',
        unlockedByQuestAct: 5,
      },
      {
        artifactId: 'art:LB:cedar_galley',
        country: 'LB',
        name: 'Miniature Phoenician Cedar Galley',
        nativeName: 'مركب الأرز الفينيقي',
        materialAndPeriod: 'Hand-carved Cedrus libani · Maritime Trade Study Model',
        classification: 'ESTABLISHED_HISTORY',
        description: 'Features a curved horse-head prow (hippos), square striped sail, and mortise-and-tenon hull planking.',
        provenanceNote: 'Based on Levantine Bronze and Iron Age maritime reliefs and terracotta ship models.',
        imageUrl: '/art/p0/world-cover-LB.jpg',
        unlockedByQuestAct: 3,
      },
    ],
    verifiedReferences: [
      {
        title: 'UNESCO World Heritage Centre — Byblos (Site #295)',
        source: 'whc.unesco.org/en/list/295',
        classification: 'ARCHAEOLOGICAL_RECORD',
      },
      {
        title: 'National Museum of Beirut — Epigraphy & Ahiram Sarcophagus Collection',
        source: 'Direction Générale des Antiquités, Lebanon',
        classification: 'ARCHAEOLOGICAL_RECORD',
      },
    ],
    platformInfo: {
      robloxSummary:
        'Flagship RC1 Playable World: Explore Byblos Harbor with Teta Nahla, gather mountain za’atar in 2-player co-op, restore the limestone arch, and bake saj man’oushe.',
      robloxPlayableNow: true,
      minecraftSummary:
        'RC2 Bedrock Companion Add-On Ready: Download miraverse.mcaddon to place the Byblos Harbor structure and custom limestone, cedar, and saj hearth blocks.',
      minecraftAddonReady: true,
    },
  },

  IQ: {
    country: 'IQ',
    orderIndex: 2,
    cityName: 'Baghdad',
    countryNameEn: 'Iraq',
    countryNameNative: 'العراق · بغداد',
    storyLang: 'ar-IQ',
    coverArtUrl: '/art/p0/world-cover-IQ.jpg',
    questMapArtUrl: '/art/v13/quest-map-IQ.jpg',
    mentorPortraitUrl: '/art/p0/portrait-mentor-IQ.jpg',
    stampArtUrl: '/art/v08/stamps/stamp-IQ.svg',
    heroTagline: 'Abbasid House of Wisdom, Al-Mutanabbi Literary Street & Tigris Shanashil Heritage',
    historicalIntroduction:
      'Founded in 762 CE along the fertile bends of the Tigris River as Madinat al-Salam (the City of Peace), Baghdad became a global crossroads of mathematics, astronomy, medicine, and literature. In the academies of the Abbasid era and along historic Al-Mutanabbi Street today, scholars, calligraphers, and families preserve a deep reverence for books, celestial observation, and warm courtyard hospitality.',
    culturalThemes: [
      {
        title: 'Bayt al-Hikma (The House of Wisdom) & Abbasid Scholarship',
        classification: 'ESTABLISHED_HISTORY',
        body: 'During the 8th–10th centuries CE, scholars in Baghdad translated and expanded Greek, Persian, Syriac, and Sanskrit treatises, pioneering algebra (al-jabr), optics, and astronomical tables.',
      },
      {
        title: 'Al-Mutanabbi Street & Baghdad’s Living Literary Culture',
        classification: 'LIVING_TRADITION',
        body: 'Named after the 10th-century poet Al-Mutanabbi, this historic Tigris-side street of booksellers and open-air bookstalls exemplifies the Iraqi proverb: "Cairo writes, Beirut publishes, and Baghdad reads."',
      },
      {
        title: 'Shanashil Architecture & Courtyard Microclimates',
        classification: 'ARCHAEOLOGICAL_RECORD',
        body: 'Traditional Baghdadi brick houses arrange rooms around a shaded central courtyard (hosh) with projecting wooden lattice oriel windows (shanashil) that cool river breezes and filter intense sunlight.',
      },
      {
        title: 'Celestial Navigation & Brass Astrolabes',
        classification: 'ESTABLISHED_HISTORY',
        body: 'Abbasid instrument makers crafted precision brass planispheric astrolabes used to measure stellar altitudes, tell time, and determine geographic latitude.',
      },
      {
        title: 'Date Palm Orchards & Festive Cardamom Kleicha',
        classification: 'LIVING_TRADITION',
        body: 'Along the Tigris banks, families harvest amber dates to roll into geometric wooden-stamped kleicha pastries scented with cardamom and rosewater during holidays.',
      },
    ],
    coordinatesCenter: [33.3406, 44.4009],
    boundingBox: [33.33, 44.385, 33.352, 44.415],
    geographicSummary:
      'Situated on the alluvial plain of central Mesopotamia along the meandering Tigris River, approximately 50 km north of ancient Babylon.',
    landmarks: [
      {
        landmarkId: 'geo:IQ:mutanabbi',
        country: 'IQ',
        name: 'Al-Mutanabbi Book Street & Tigris Quay',
        nativeName: 'شارع المتنبي وضفة دجلة',
        coordinates: [33.3405, 44.3891],
        eraOrCentury: 'Abbasid Origins · Modern Literary Hub',
        classification: 'LIVING_TRADITION',
        summary: 'Historic pedestrian thoroughfare of bookshops, calligraphers, and printing presses overlooking the Tigris River.',
        educationalReference: 'UNESCO Creative Cities Network — Baghdad City of Literature.',
      },
      {
        landmarkId: 'geo:IQ:mustansiriya',
        country: 'IQ',
        name: 'Al-Mustansiriya Madrasa Courtyard',
        nativeName: 'المدرسة المستنصرية',
        coordinates: [33.3386, 44.3905],
        eraOrCentury: '1227 CE (Abbasid Era)',
        classification: 'ARCHAEOLOGICAL_RECORD',
        summary: 'Monumental brick courtyard university on the Tigris featuring geometric brick muqarnas and pointed arches.',
        educationalReference: 'State Board of Antiquities and Heritage (Iraq) — Abbasid Architecture Archive.',
      },
      {
        landmarkId: 'geo:IQ:shanashil',
        country: 'IQ',
        name: 'Historic Baghdadi Shanashil Quarter',
        nativeName: 'بيوت الشناشيل البغدادية',
        coordinates: [33.3422, 44.3878],
        eraOrCentury: '19th – Early 20th Century CE',
        classification: 'ARCHAEOLOGICAL_RECORD',
        summary: 'Heritage courtyard homes with carved timber and stained-glass projecting balconies.',
        educationalReference: 'World Monuments Fund — Traditional Houses of Baghdad.',
      },
      {
        landmarkId: 'geo:IQ:tigris_palms',
        country: 'IQ',
        name: 'Tigris Riverfront & Date Palm Groves',
        nativeName: 'بساتين النخيل على نهر دجلة',
        coordinates: [33.335, 44.384],
        eraOrCentury: 'Millennial Mesopotamian Agriculture',
        classification: 'LIVING_TRADITION',
        summary: 'Irrigated riverine orchards cultivating Phoenix dactylifera dates and citrus beneath palm shade.',
        educationalReference: 'Mesopotamian Date Palm Agricultural Heritage Studies.',
      },
    ],
    importantFigures: [
      {
        id: 'fig:IQ:khwarizmi',
        name: 'Muhammad ibn Musa al-Khwarizmi',
        role: 'Mathematician & Astronomer at Bayt al-Hikma',
        era: 'c. 780–850 CE',
        classification: 'ESTABLISHED_HISTORY',
        contribution: 'Authored Kitab al-Jabr (the foundational text of algebra) and introduced Hindu-Arabic positional numerals to the wider world.',
      },
      {
        id: 'fig:IQ:ustadh_zayd',
        name: 'Ustadh Zayd & Bibi Amal (MiraVerse Mentors)',
        role: 'Courtyard Calligrapher, Astronomer & Culinary Host',
        era: 'Contemporary Living Tradition',
        classification: 'LIVING_TRADITION',
        contribution: 'Guide young explorers through Baghdadi greetings, astrolabe star-charting, shanashil carpentry, and kleicha baking.',
      },
    ],
    architectureAndLandmarksSummary: [
      'Buff-brick pointed Abbasid courtyard arches with carved terracotta arabesques',
      'Turquoise-glazed geometric tile spandrels and octagonal cooling fountains',
      'Projecting wooden shanashil oriel windows with colored glass transoms',
      'Shaded riverfront arcades along the Tigris embankment',
    ],
    foodAndCrafts: {
      dishName: 'Baghdadi Cardamom Date Kleicha',
      dishDescription:
        'Fragrant wheel- and pinwheel-shaped pastries filled with pressed Zahidi dates, crushed green cardamom, and toasted walnuts, stamped with carved wooden molds.',
      craftName: 'Brass Astrolabe Engraving & Arabic Calligraphy',
      craftDescription:
        'Engraving celestial coordinate retes onto polished brass plates and writing reed-pen (qalam) calligraphy on handmade paper.',
    },
    timeline: [
      {
        era: '762 CE',
        title: 'Foundation of the Round City',
        classification: 'ESTABLISHED_HISTORY',
        description: 'Baghdad is established on the Tigris River as Madinat al-Salam with concentric walls and four cardinal gates.',
      },
      {
        era: '9th Century CE',
        title: 'Flourishing of Bayt al-Hikma',
        classification: 'ESTABLISHED_HISTORY',
        description: 'Mathematicians, astronomers, and translators advance algebra, trigonometry, and observational astronomy.',
      },
      {
        era: '1227 CE',
        title: 'Construction of Al-Mustansiriya',
        classification: 'ARCHAEOLOGICAL_RECORD',
        description: 'One of the oldest surviving brick courtyard universities is erected directly on the eastern bank of the Tigris.',
      },
      {
        era: '2015–Present',
        title: 'UNESCO City of Literature',
        classification: 'LIVING_TRADITION',
        description: 'Al-Mutanabbi Street’s Friday book markets continue Baghdad’s unbroken love of poetry, books, and public dialogue.',
      },
    ],
    artifacts: [
      {
        artifactId: 'art:IQ:astrolabe',
        country: 'IQ',
        name: 'Baghdad Brass Celestial Astrolabe',
        nativeName: 'أسطرلاب بغداد النحاسي',
        materialAndPeriod: 'Engraved Brass · Abbasid Scientific Tradition (9th–10th Century CE)',
        classification: 'ESTABLISHED_HISTORY',
        description: 'A rotating star map (rete) and altitude sight (alidade) used by Baghdad astronomers to measure the night sky.',
        provenanceNote: 'Modeled on surviving Abbasid-era astrolabes preserved in museum collections.',
        imageUrl: '/art/v13/cultural-artifacts-treasury.jpg',
        unlockedByQuestAct: 5,
      },
      {
        artifactId: 'art:IQ:calligraphy_scroll',
        country: 'IQ',
        name: 'Illuminated Al-Mutanabbi Geometric Scroll',
        nativeName: 'مخطوطة الزخرفة والخط البغدادي',
        materialAndPeriod: 'Reed Ink & Gold Leaf on Paper · Baghdadi Script Tradition',
        classification: 'LIVING_TRADITION',
        description: 'Combines proportioned Arabic calligraphy with twelve-fold geometric star illumination.',
        provenanceNote: 'Honors the scribal tradition of ibn Muqla and ibn al-Bawwab in Baghdad.',
        imageUrl: '/art/p0/world-cover-IQ.jpg',
        unlockedByQuestAct: 4,
      },
    ],
    verifiedReferences: [
      {
        title: 'UNESCO Creative Cities Network — Baghdad (Literature)',
        source: 'unesco.org/en/creative-cities/baghdad',
        classification: 'LIVING_TRADITION',
      },
      {
        title: 'History of Mathematical Astronomy in Abbasid Baghdad',
        source: 'Museum of the History of Science, Oxford — Islamic Astrolabe Collection',
        classification: 'ESTABLISHED_HISTORY',
      },
    ],
    platformInfo: {
      robloxSummary:
        'Interactive Web Quest Map & Story Live · Roblox RC3 World Pack: Explore the House of Wisdom courtyard and Tigris riverfront.',
      robloxPlayableNow: false,
      minecraftSummary:
        'Included in miraverse.mcaddon: Features custom Baghdadi glazed brick, turquoise muqarnas, shanashil screens, and kleicha oven blocks.',
      minecraftAddonReady: true,
    },
  },

  EG: {
    country: 'EG',
    orderIndex: 3,
    cityName: 'Cairo',
    countryNameEn: 'Egypt',
    countryNameNative: 'مصر · القاهرة',
    storyLang: 'ar-EG',
    coverArtUrl: '/art/p0/world-cover-EG.jpg',
    questMapArtUrl: '/art/v13/quest-map-EG.jpg',
    mentorPortraitUrl: '/art/p0/portrait-mentor-EG.jpg',
    stampArtUrl: '/art/v08/stamps/stamp-EG.svg',
    heroTagline: 'Fatimid Courtyards, Khan el-Khalili Fanous Lantern Craftsmanship & Nile Feluccas',
    historicalIntroduction:
      'Along the life-giving Nile River stands Historic Cairo (Al-Qahira), founded in 969 CE and renowned for its carved stone gates, shaded courtyards, and centuries-old artisan guilds. In the workshops of Khan el-Khalili and Darb al-Ahmar, tinsmiths and glassworkers transform recycled brass and colored glass into glowing fanous lanterns that illuminate neighborhood streets during festive gatherings.',
    culturalThemes: [
      {
        title: 'Fanous Lantern Craftsmanship & Fatimid Tradition',
        classification: 'LIVING_TRADITION',
        body: 'Originating in Fatimid Cairo, the traditional fanous lantern is hand-soldered from pierced sheet brass and fitted with jewel-toned stained glass, symbolizing community warmth and hospitality.',
      },
      {
        title: 'Historic Cairo & Khan el-Khalili Artisan Guilds',
        classification: 'ESTABLISHED_HISTORY',
        body: 'Established in the 14th century CE as a caravanserai along Al-Muizz Street, Khan el-Khalili remains a living center for coppersmiths, woodturners, and textile weavers.',
      },
      {
        title: 'Mashrabiya Latticework & Passive Cooling',
        classification: 'ARCHAEOLOGICAL_RECORD',
        body: 'Intricately turned wooden lattice balconies (mashrabiya) allow residents to catch cool Nile breezes and view the street below while shading interior rooms from desert heat.',
      },
      {
        title: 'Nile River Navigation & White-Sailed Feluccas',
        classification: 'ESTABLISHED_HISTORY',
        body: 'Lateen-rigged wooden felucca boats have navigated the Nile’s northward current and southward prevailing wind for millennia.',
      },
      {
        title: 'Cairene Koshari & Shared Neighborhood Tables',
        classification: 'LIVING_TRADITION',
        body: 'Combining lentils, rice, pasta, chickpeas, spiced tomato sauce, and caramelized onions, koshari reflects Cairo’s vibrant culinary synthesis.',
      },
    ],
    coordinatesCenter: [30.0478, 31.2622],
    boundingBox: [30.038, 31.245, 30.058, 31.275],
    geographicSummary:
      'Located at the apex of the Nile Delta where Upper and Lower Egypt meet, flanked by the Nile River to the west and the Muqattam limestone hills to the east.',
    landmarks: [
      {
        landmarkId: 'geo:EG:khan',
        country: 'EG',
        name: 'Khan el-Khalili & Al-Muizz Street',
        nativeName: 'خان الخليلي وشارع المعز',
        coordinates: [30.0477, 31.2623],
        eraOrCentury: '969 CE (Fatimid) / 1382 CE (Mamluk Caravanserai)',
        classification: 'ESTABLISHED_HISTORY',
        summary: 'Historic market quarter of stone archways, lantern workshops, and spice stalls in the heart of Islamic Cairo.',
        educationalReference: 'UNESCO World Heritage List — Historic Cairo (#89).',
      },
      {
        landmarkId: 'geo:EG:bab_futuh',
        country: 'EG',
        name: 'Bab al-Futuh & Northern Fatimid Walls',
        nativeName: 'باب الفتوح وأسوار القاهرة الفاطمية',
        coordinates: [30.0543, 31.2635],
        eraOrCentury: '1087 CE',
        classification: 'ARCHAEOLOGICAL_RECORD',
        summary: 'Monumental stone city gate with carved geometric arches and cushioned ashlar masonry.',
        educationalReference: 'Supreme Council of Antiquities (Egypt) — Historic Cairo Conservation.',
      },
      {
        landmarkId: 'geo:EG:suhaymi',
        country: 'EG',
        name: 'Bayt al-Suhaymi Mashrabiya Courtyard',
        nativeName: 'بيت السحيمي',
        coordinates: [30.0522, 31.2625],
        eraOrCentury: '1648 CE (Ottoman Era)',
        classification: 'ARCHAEOLOGICAL_RECORD',
        summary: 'Classic Cairene courtyard house showcasing turned-wood mashrabiya screens, marble fountains, and wind-catchers (malqaf).',
        educationalReference: 'Egyptian Heritage Rescue & Historic House Documentation.',
      },
      {
        landmarkId: 'geo:EG:nile_corniche',
        country: 'EG',
        name: 'Nile River Felucca Quays at Zamalek',
        nativeName: 'مرسى الفلوكة على النيل',
        coordinates: [30.0444, 31.229],
        eraOrCentury: 'Ancient to Present',
        classification: 'LIVING_TRADITION',
        summary: 'Riverfront piers where traditional wooden felucca sailboats catch the evening breeze along the Nile.',
        educationalReference: 'Nile River Maritime Ethnography Archive.',
      },
    ],
    importantFigures: [
      {
        id: 'fig:EG:ibn_al_haytham',
        name: 'Ibn al-Haytham (Alhazen)',
        role: 'Physicist & Pioneer of Optics in Cairo',
        era: 'c. 965–1040 CE',
        classification: 'ESTABLISHED_HISTORY',
        contribution: 'Wrote Kitab al-Manazir (Book of Optics) in Cairo, proving that vision occurs when light rays enter the eye and describing the camera obscura.',
      },
      {
        id: 'fig:EG:uncle_tariq',
        name: 'Uncle Tariq & Teta Samira (MiraVerse Mentors)',
        role: 'Master Fanous Artisan & Courtyard Culinary Host',
        era: 'Contemporary Living Tradition',
        classification: 'LIVING_TRADITION',
        contribution: 'Teach learners how stained-glass fanous lanterns refract light and how Cairene families layer spiced koshari.',
      },
    ],
    architectureAndLandmarksSummary: [
      'Turned-wood mashrabiya latticework windows that cool airflow without blocking light',
      'Ablaq alternating red-and-cream stone masonry arches',
      'Pierced brass and multicolored stained-glass fanous courtyard lanterns',
      'Rooftop malqaf (wind-catcher) shafts directing north winds into courtyard rooms',
    ],
    foodAndCrafts: {
      dishName: 'Cairo Spiced Koshari',
      dishDescription:
        'A hearty, plant-based Cairene favorite layering brown lentils, short-grain rice, macaroni, chickpeas, cumin-garlic tomato sauce (salsa), and crisp golden onions (ta’liya).',
      craftName: 'Pierced Brass & Stained-Glass Fanous Making',
      craftDescription:
        'Cutting geometric star patterns into sheet brass and fitting ruby, emerald, and amber glass panes.',
    },
    timeline: [
      {
        era: '969 CE',
        title: 'Foundation of Al-Qahira',
        classification: 'ESTABLISHED_HISTORY',
        description: 'Fatimid builders lay out the walled city of Cairo along the ceremonial spine of Al-Muizz Street.',
      },
      {
        era: '1011–1021 CE',
        title: 'Ibn al-Haytham’s Book of Optics',
        classification: 'ESTABLISHED_HISTORY',
        description: 'Working in Cairo, Ibn al-Haytham conducts experimental studies on light, reflection, and refraction.',
      },
      {
        era: '1382 CE',
        title: 'Establishment of Khan el-Khalili',
        classification: 'ARCHAEOLOGICAL_RECORD',
        description: 'Amir Djaharks el-Khalili builds a major merchant caravanserai that anchors Cairo’s artisan guilds.',
      },
      {
        era: 'Present Day',
        title: 'Living Lantern & Courtyard Heritage',
        classification: 'LIVING_TRADITION',
        description: 'Historic Cairo’s lantern makers and courtyard kitchens preserve centuries of craftsmanship and hospitality.',
      },
    ],
    artifacts: [
      {
        artifactId: 'art:EG:fanous_lantern',
        country: 'EG',
        name: 'Khan el-Khalili Stained-Glass Fanous',
        nativeName: 'فانوس خان الخليلي المعشق',
        materialAndPeriod: 'Pierced Brass & Colored Glass · Cairene Guild Tradition',
        classification: 'LIVING_TRADITION',
        description: 'Casts jewel-toned geometric star patterns across courtyard walls when lit at dusk.',
        provenanceNote: 'Crafted in the style of traditional Bab al-Sha’riya and Under-al-Ruba’ lantern workshops.',
        imageUrl: '/art/v13/cultural-artifacts-treasury.jpg',
        unlockedByQuestAct: 4,
      },
      {
        artifactId: 'art:EG:mashrabiya_panel',
        country: 'EG',
        name: 'Interlocking Turned-Wood Mashrabiya Panel',
        nativeName: 'لوحة مشربية خشبية مخروطة',
        materialAndPeriod: 'Beech & Cedar Joinery (No Nails or Glue) · Historic Cairo',
        classification: 'ARCHAEOLOGICAL_RECORD',
        description: 'Hundreds of hand-turned wooden spools fitted together to expand and contract naturally with humidity.',
        provenanceNote: 'Modeled on 17th-century Bayt al-Suhaymi lattice screens.',
        imageUrl: '/art/p0/world-cover-EG.jpg',
        unlockedByQuestAct: 3,
      },
    ],
    verifiedReferences: [
      {
        title: 'UNESCO World Heritage Centre — Historic Cairo (Site #89)',
        source: 'whc.unesco.org/en/list/89',
        classification: 'ESTABLISHED_HISTORY',
      },
      {
        title: 'Ibn al-Haytham and the Science of Light in 11th-Century Cairo',
        source: 'UNESCO International Year of Light Historical Dossier',
        classification: 'ESTABLISHED_HISTORY',
      },
    ],
    platformInfo: {
      robloxSummary:
        'Interactive Web Quest Map & Story Live · Roblox RC3 World Pack: Restore Khan el-Khalili’s lantern arches and sail Nile feluccas.',
      robloxPlayableNow: false,
      minecraftSummary:
        'Included in miraverse.mcaddon: Features custom Cairo mashrabiya, fanous lantern blocks, alabaster lamps, and koshari cauldron blocks.',
      minecraftAddonReady: true,
    },
  },

  FR: {
    country: 'FR',
    orderIndex: 4,
    cityName: 'Lyon (Vieux Lyon)',
    countryNameEn: 'France',
    countryNameNative: 'France · Vieux Lyon',
    storyLang: 'fr',
    coverArtUrl: '/art/p0/world-cover-FR.jpg',
    questMapArtUrl: '/art/v13/quest-map-FR.jpg',
    mentorPortraitUrl: '/art/p0/portrait-mentor-FR.jpg',
    stampArtUrl: '/art/v08/stamps/stamp-FR.svg',
    heroTagline: 'Renaissance Traboules, Canut Silk-Weaving Innovation & Les Mères Lyonnaises Culinary Heritage',
    historicalIntroduction:
      'Nestled at the confluence of the Rhône and Saône rivers, Lyon was the capital of Roman Gaul (Lugdunum) before blossoming during the Renaissance as Europe’s silk-weaving and printing powerhouse. Beneath the ochre facades of Vieux Lyon and the tall windows of Croix-Rousse run the traboules—vaulted stone passageways used by silk weavers to shelter delicate fabrics from rain and later by the French Resistance during World War II.',
    culturalThemes: [
      {
        title: 'Lyon Traboules: Secret Vaulted Passageways',
        classification: 'ARCHAEOLOGICAL_RECORD',
        body: 'From the Latin transambulare ("to walk through"), Lyon’s over 400 traboules connect streets directly through Renaissance interior courtyards, spiral towers, and rib-vaulted galleries.',
      },
      {
        title: 'The Canuts & the Jacquard Punched-Card Loom',
        classification: 'ESTABLISHED_HISTORY',
        body: 'In 1804, Lyon weaver Joseph Marie Jacquard invented a loom controlled by chains of punched pasteboard cards—not only revolutionizing silk brocade weaving but inspiring Charles Babbage and Ada Lovelace’s early computing concepts.',
      },
      {
        title: 'Traboules in World War II Resistance History',
        classification: 'ESTABLISHED_HISTORY',
        body: 'During the 1940–1944 occupation, members of the French Resistance in Lyon used the labyrinthine traboules to evade patrols, deliver underground newspapers, and shelter couriers.',
      },
      {
        title: 'Les Mères Lyonnaises & Neighborhood Boulangeries',
        classification: 'LIVING_TRADITION',
        body: 'Beginning in the 18th and 19th centuries, female chefs known as Les Mères Lyonnaises established culinary excellence built on honest regional ingredients, alongside artisan boulangeries baking golden brioche and Galette des Rois.',
      },
    ],
    coordinatesCenter: [45.762, 4.827],
    boundingBox: [45.754, 4.818, 45.775, 4.838],
    geographicSummary:
      'Located in east-central France at the confluence of the Rhône and Saône rivers, framed by the steep hills of Fourvière ("the hill that prays") and Croix-Rousse ("the hill that works").',
    landmarks: [
      {
        landmarkId: 'geo:FR:vieux_lyon',
        country: 'FR',
        name: 'Vieux Lyon & La Longue Traboule (Rue Saint-Jean)',
        nativeName: 'Vieux Lyon et la Longue Traboule',
        coordinates: [45.7623, 4.8274],
        eraOrCentury: '15th–16th Century CE (Renaissance)',
        classification: 'ARCHAEOLOGICAL_RECORD',
        summary: 'Four-courtyard Renaissance passageway linking Rue Saint-Jean to Rue du Bœuf beneath vaulted stone arches.',
        educationalReference: 'UNESCO World Heritage List — Historic Site of Lyon (#872).',
      },
      {
        landmarkId: 'geo:FR:canuts',
        country: 'FR',
        name: 'Maison des Canuts (Croix-Rousse Silk Quarter)',
        nativeName: 'Maison des Canuts · La Croix-Rousse',
        coordinates: [45.7768, 4.8323],
        eraOrCentury: '19th Century CE',
        classification: 'ESTABLISHED_HISTORY',
        summary: 'High-ceilinged workshops designed to house 4-meter-tall wooden Jacquard drawlooms.',
        educationalReference: 'Musée des Tissus et des Arts Décoratifs de Lyon.',
      },
      {
        landmarkId: 'geo:FR:fourviere',
        country: 'FR',
        name: 'Fourvière Hill & Gallo-Roman Amphitheatre',
        nativeName: 'Colline de Fourvière et Théâtre Gallo-Romain',
        coordinates: [45.7597, 4.8199],
        eraOrCentury: '15 BCE – 19th Century CE',
        classification: 'ARCHAEOLOGICAL_RECORD',
        summary: 'Overlooks Vieux Lyon from the site of ancient Roman Lugdunum.',
        educationalReference: 'Lugdunum — Musée et Théâtres Romains (Lyon).',
      },
      {
        landmarkId: 'geo:FR:halles',
        country: 'FR',
        name: 'Boulangeries & Culinary Guilds of Lyon',
        nativeName: 'Boulangeries et Tradition des Mères Lyonnaises',
        coordinates: [45.7634, 4.8505],
        eraOrCentury: '19th Century – Present',
        classification: 'LIVING_TRADITION',
        summary: 'Celebrated neighborhood bakeries and culinary halls honoring the Mères Lyonnaises heritage.',
        educationalReference: 'Patrimoine Gastronomique de Lyon — Archives Municipales.',
      },
    ],
    importantFigures: [
      {
        id: 'fig:FR:jacquard',
        name: 'Joseph Marie Jacquard',
        role: 'Lyon Weaver & Inventor of the Programmable Loom',
        era: '1752–1834 CE',
        classification: 'ESTABLISHED_HISTORY',
        contribution: 'Created the punched-card attachment for silk looms in Lyon, laying the conceptual foundation for binary data storage.',
      },
      {
        id: 'fig:FR:chef_elodie',
        name: 'Chef Élodie & Mamie Claire (MiraVerse Mentors)',
        role: 'Master Boulangère & Traboule Heritage Guide',
        era: 'Contemporary Living Tradition',
        classification: 'LIVING_TRADITION',
        contribution: 'Introduce learners to French culinary vocabulary, Vieux Lyon traboule architecture, and pastry lamination.',
      },
    ],
    architectureAndLandmarksSummary: [
      'Ochre, rose, and sienna lime-rendered Renaissance facades in Vieux Lyon',
      'Rib-vaulted stone traboule corridors and open spiral stair towers (tours d’escalier)',
      '4-meter-tall Croix-Rousse workshop ceilings with exposed oak beams for silk looms',
      'Carved limestone lion fountains and warm timber boulangerie storefronts',
    ],
    foodAndCrafts: {
      dishName: 'Brioche Praline & Golden Galette des Rois',
      dishDescription:
        'Flaky laminated puff pastry filled with almond frangipane or studded with rose-tinted caramelized almonds, scored with geometric spiral patterns before baking.',
      craftName: 'Jacquard Silk Weaving & Punched-Card Patterning',
      craftDescription:
        'Threading warp and weft silk filaments on wooden looms guided by perforated pattern cards.',
    },
    timeline: [
      {
        era: '43 BCE',
        title: 'Roman Lugdunum Founded',
        classification: 'ARCHAEOLOGICAL_RECORD',
        description: 'Lugdunum is founded on Fourvière hill and becomes the administrative hub of Roman Gaul.',
      },
      {
        era: '1460–1550 CE',
        title: 'Renaissance Silk Monopoly & Traboules',
        classification: 'ESTABLISHED_HISTORY',
        description: 'Royal charters establish Lyon’s silk trade fairs; merchants construct vaulted traboules through Vieux Lyon.',
      },
      {
        era: '1804 CE',
        title: 'The Jacquard Loom',
        classification: 'ESTABLISHED_HISTORY',
        description: 'Joseph Marie Jacquard demonstrates his punched-card loom mechanism for complex silk brocades.',
      },
      {
        era: '1940–1944 CE',
        title: 'Traboules in the Resistance',
        classification: 'ESTABLISHED_HISTORY',
        description: 'Lyon’s hidden traboule networks provide vital cover for Resistance couriers and printing presses.',
      },
    ],
    artifacts: [
      {
        artifactId: 'art:FR:silk_shuttle',
        country: 'FR',
        name: 'Canut Silk-Weaver’s Wooden Shuttle & Pattern Card',
        nativeName: 'Navette de Canut et Carte Perforée Jacquard',
        materialAndPeriod: 'Polished Boxwood, Silk Thread & Pasteboard · 19th-Century Lyon Tradition',
        classification: 'ESTABLISHED_HISTORY',
        description: 'Carries shimmering crimson-and-gold weft thread across the loom while punched holes encode the floral pattern.',
        provenanceNote: 'Inspired by working looms at the Maison des Canuts in Lyon.',
        imageUrl: '/art/v13/cultural-artifacts-treasury.jpg',
        unlockedByQuestAct: 3,
      },
      {
        artifactId: 'art:FR:feve_crown',
        country: 'FR',
        name: 'Porcelain Fève & Golden Boulangerie Crown',
        nativeName: 'Fève en Porcelaine et Couronne Dorée',
        materialAndPeriod: 'Hand-painted Porcelain · French Epiphany Baking Tradition',
        classification: 'LIVING_TRADITION',
        description: 'Hidden inside the Galette des Rois to celebrate shared family meals in winter.',
        provenanceNote: 'Represents Lyon’s living boulangerie and pâtisserie traditions.',
        imageUrl: '/art/p0/world-cover-FR.jpg',
        unlockedByQuestAct: 5,
      },
    ],
    verifiedReferences: [
      {
        title: 'UNESCO World Heritage Centre — Historic Site of Lyon (Site #872)',
        source: 'whc.unesco.org/en/list/872',
        classification: 'ESTABLISHED_HISTORY',
      },
      {
        title: 'Maison des Canuts — History of Silk & the Jacquard Loom',
        source: 'maisondescanuts.fr / Musée des Tissus de Lyon',
        classification: 'ESTABLISHED_HISTORY',
      },
    ],
    platformInfo: {
      robloxSummary:
        'Interactive Web Quest Map & Story Live · Roblox RC3 World Pack: Navigate Vieux Lyon’s traboules and bake with Chef Élodie.',
      robloxPlayableNow: false,
      minecraftSummary:
        'Included in miraverse.mcaddon: Features custom Lyon ochre stucco, traboule vault stone, mansard slate shingles, and bakery wood oven blocks.',
      minecraftAddonReady: true,
    },
  },

  KR: {
    country: 'KR',
    orderIndex: 5,
    cityName: 'Jeonju (Hanok Village)',
    countryNameEn: 'South Korea',
    countryNameNative: '대한민국 · 전주 한옥마을',
    storyLang: 'ko',
    coverArtUrl: '/art/p0/world-cover-KR.jpg',
    questMapArtUrl: '/art/v13/quest-map-KR.jpg',
    mentorPortraitUrl: '/art/p0/portrait-mentor-KR.jpg',
    stampArtUrl: '/art/v08/stamps/stamp-KR.svg',
    heroTagline: 'Giwa Hanok Architecture, Obangsaek Five-Color Harmony & Hanji Paper Craftsmanship',
    historicalIntroduction:
      'In southwestern Korea lies Jeonju, ancestral seat of the Joseon Dynasty and home to over 700 contiguous traditional Korean wooden houses (hanok). Built in harmony with surrounding mountains and streams (baesanimsu), Jeonju preserves Korea’s intangible heritage of handmade mulberry paper (hanji), breathable earthen fermentation jars (onggi), and the five-color nutritional and philosophical balance (Obangsaek) celebrated in Jeonju Bibimbap.',
    culturalThemes: [
      {
        title: 'Hanok Architecture: Ondol Heating & Maru Cooling',
        classification: 'ARCHAEOLOGICAL_RECORD',
        body: 'Traditional Korean hanok homes combine stone-flue underfloor radiant heating (ondol) for winter with an elevated ventilated wooden floor hall (maru) for summer, topped by sweeping dark-clay giwa roof tiles.',
      },
      {
        title: 'Obangsaek (Five-Color Philosophy) in Jeonju Bibimbap',
        classification: 'LIVING_TRADITION',
        body: 'Jeonju Bibimbap arranges ingredients across the five traditional Korean directional colors (Obangsaek): green/blue (east/wood/spinach), red (south/fire/gochujang & carrots), yellow (center/earth/egg yolk & bean sprouts), white (west/metal/radish & rice), and black (north/water/shiitake & gim).',
      },
      {
        title: 'Jeonju Hanji: Thousand-Year Mulberry Paper',
        classification: 'LIVING_TRADITION',
        body: 'Crafted from the inner bark of paper mulberry (dak) trees using crisscrossing sheet-formation (webul-materi), Jeonju hanji regulates humidity on sliding lattice doors (changhoji) and preserves historical annals for centuries.',
      },
      {
        title: 'Jangdokdae & Breathable Onggi Earthenware',
        classification: 'ESTABLISHED_HISTORY',
        body: 'In every sunlit hanok courtyard stands the jangdokdae terrace of microporous glazed clay jars (onggi) that allow air to circulate while fermenting soy sauce (ganjang), chili paste (gochujang), and soybean paste (doenjang).',
      },
    ],
    coordinatesCenter: [35.8147, 127.1526],
    boundingBox: [35.808, 127.145, 35.822, 127.162],
    geographicSummary:
      'Located in North Jeolla Province (Jeonbuk), South Korea, nestled between the Noryeong mountain foothills and the Jeonjucheon stream.',
    landmarks: [
      {
        landmarkId: 'geo:KR:hanok_village',
        country: 'KR',
        name: 'Jeonju Hanok Village (Pungnam-dong & Gyo-dong)',
        nativeName: '전주 한옥마을',
        coordinates: [35.8147, 127.1526],
        eraOrCentury: 'Early 20th Century – Present (Joseon Architectural Tradition)',
        classification: 'LIVING_TRADITION',
        summary: 'Cluster of over 700 traditional giwa-roofed timber hanok residences, craft studios, and courtyards.',
        educationalReference: 'Korea Heritage Service — Jeonju Hanok Preservation District.',
      },
      {
        landmarkId: 'geo:KR:gyeonggijeon',
        country: 'KR',
        name: 'Gyeonggijeon Shrine & Jeonju Sago (Royal Annals Archive)',
        nativeName: '전주 경기전과 전주사고',
        coordinates: [35.8153, 127.1498],
        eraOrCentury: '1410 CE / 1614 CE (Joseon Dynasty)',
        classification: 'ESTABLISHED_HISTORY',
        summary: 'Historic Joseon shrine and repository that safeguarded the Veritable Records of the Joseon Dynasty (Joseon Wangjo Sillok) on hanji paper.',
        educationalReference: 'UNESCO Memory of the World — Annals of the Joseon Dynasty.',
      },
      {
        landmarkId: 'geo:KR:omokdae',
        country: 'KR',
        name: 'Omokdae Ridge & Giwa Rooftop Viewpoint',
        nativeName: '오목대',
        coordinates: [35.8142, 127.1563],
        eraOrCentury: '1380 CE / Joseon Pavilion',
        classification: 'ARCHAEOLOGICAL_RECORD',
        summary: 'Wooded hillock overlooking the sweeping curved rooflines of Jeonju Hanok Village.',
        educationalReference: 'Jeollabuk-do Provincial Cultural Monument #16.',
      },
      {
        landmarkId: 'geo:KR:hanji_museum',
        country: 'KR',
        name: 'Jeonju Traditional Hanji & Culinary Courtyards',
        nativeName: '전주 전통 한지 및 음식 마당',
        coordinates: [35.8161, 127.1541],
        eraOrCentury: 'Living Intangible Heritage',
        classification: 'LIVING_TRADITION',
        summary: 'Workshops demonstrating dak-fiber papermaking and Obangsaek seasonal cooking.',
        educationalReference: 'UNESCO Creative Cities Network — Jeonju City of Gastronomy.',
      },
    ],
    importantFigures: [
      {
        id: 'fig:KR:sillok_keepers',
        name: 'Scholars of the Jeonju Sago (Annals Keepers)',
        role: 'Guardians of the Joseon Veritable Records',
        era: '1592 CE',
        classification: 'ESTABLISHED_HISTORY',
        contribution: 'Local Jeonju scholars An Ui and Son Hong-rok carried the 800-volume Joseon Wangjo Sillok on hanji paper to safety in MountNaejangsan, preserving the only surviving copy of the early dynasty’s history.',
      },
      {
        id: 'fig:KR:halmeoni_seoyeon',
        name: 'Halmeoni Seo-Yeon (MiraVerse Mentor)',
        role: 'Hanji Lantern Artisan & Culinary Elder',
        era: 'Contemporary Living Tradition',
        classification: 'LIVING_TRADITION',
        contribution: 'Teaches learners Korean harvest greetings, hanok joinery, Obangsaek color harmony, and pine-steamed songpyeon.',
      },
    ],
    architectureAndLandmarksSummary: [
      'Upward-curving dark clay giwa roof eaves (cheoma) calibrated to winter and summer sun angles',
      'Mortise-and-tenon Korean red pine timber framing (daemokjang) assembled without iron nails',
      'Translucent changhoji mulberry-paper lattice doors that breathe and diffuse sunlight',
      'Dual ondol stone-flue heated rooms and open maru wooden verandas',
    ],
    foodAndCrafts: {
      dishName: 'Jeonju Five-Color Bibimbap & Pine-Steamed Songpyeon',
      dishDescription:
        'Warm rice cooked in broth and topped with thirty seasonal namul vegetables arranged in the five Obangsaek colors, paired with half-moon rice cakes steamed over fragrant pine needles.',
      craftName: 'Dak-Bark Hanji Papermaking & Celadon Inlay',
      craftDescription:
        'Beating steamed mulberry bark fibers in clear stream water with mucilage (dakpul) to form breathable, centuries-durable sheets.',
    },
    timeline: [
      {
        era: '892–936 CE',
        title: 'Historic Regional Capital of Hubaekje',
        classification: 'ESTABLISHED_HISTORY',
        description: 'Jeonju serves as a major cultural and administrative center of the southwestern Korean peninsula.',
      },
      {
        era: '1410 & 1592 CE',
        title: 'Gyeonggijeon & Rescue of the Joseon Annals',
        classification: 'ESTABLISHED_HISTORY',
        description: 'Jeonju’s archive preserves the sole surviving copy of the early Joseon Dynasty annals written on hanji paper.',
      },
      {
        era: '1920s–1930s CE',
        title: 'Expansion of the Contiguous Hanok Quarter',
        classification: 'ARCHAEOLOGICAL_RECORD',
        description: 'Korean residents build hundreds of traditional giwa-roofed hanok houses in Gyo-dong and Pungnam-dong as an expression of cultural identity.',
      },
      {
        era: '2012–Present',
        title: 'UNESCO City of Gastronomy',
        classification: 'LIVING_TRADITION',
        description: 'Jeonju is recognized globally for its traditional fermentation, bibimbap, and living hanok artisan community.',
      },
    ],
    artifacts: [
      {
        artifactId: 'art:KR:obangsaek_bowl',
        country: 'KR',
        name: 'Inlaid Celadon Obangsaek Bowl & Hanji Lantern',
        nativeName: '오방색 청자 대접과 전주 한지 등불',
        materialAndPeriod: 'Sanggam Inlaid Celadon & Mulberry Paper · Korean Heritage Craft',
        classification: 'LIVING_TRADITION',
        description: 'Illustrates the five directional colors (blue, red, yellow, white, black) alongside a warm dak-bark paper lantern.',
        provenanceNote: 'Honors Jeonju’s UNESCO Gastronomy and Hanji Intangible Cultural Heritage traditions.',
        imageUrl: '/art/v13/cultural-artifacts-treasury.jpg',
        unlockedByQuestAct: 4,
      },
      {
        artifactId: 'art:KR:giwa_tile',
        country: 'KR',
        name: 'Carved Lotus Sumaksae Eave Tile',
        nativeName: '연꽃무늬 수막새 기와',
        materialAndPeriod: 'Kiln-Fired Gray Clay · Traditional Korean Roof Craft (Jegawajang)',
        classification: 'ARCHAEOLOGICAL_RECORD',
        description: 'Circular end-cap roof tile embossed with a lotus blossom that seals the curved giwa ridge against rain.',
        provenanceNote: 'Modeled on traditional Korean hanok roof-tile architecture.',
        imageUrl: '/art/p0/world-cover-KR.jpg',
        unlockedByQuestAct: 3,
      },
    ],
    verifiedReferences: [
      {
        title: 'UNESCO Creative Cities Network — Jeonju (Gastronomy)',
        source: 'unesco.org/en/creative-cities/jeonju',
        classification: 'LIVING_TRADITION',
      },
      {
        title: 'UNESCO Memory of the World — The Annals of the Joseon Dynasty (Jeonju Sago)',
        source: 'unesco.org/en/memory-world',
        classification: 'ESTABLISHED_HISTORY',
      },
    ],
    platformInfo: {
      robloxSummary:
        'Interactive Web Quest Map & Story Live · Roblox RC3 World Pack: Explore Jeonju Hanok Village and prepare Obangsaek dishes.',
      robloxPlayableNow: false,
      minecraftSummary:
        'Included in miraverse.mcaddon: Features custom giwa eave tiles, hanji sliding screens, ondol hearth stones, and onggi fermentation jar blocks.',
      minecraftAddonReady: true,
    },
  },
};

const ACT_BLUEPRINTS: {
  actNumber: 1 | 2 | 3 | 4 | 5;
  challengeType: ChallengeType;
  actBadge: string;
}[] = [
  { actNumber: 1, challengeType: 'gather', actBadge: 'Act I · Field & Terrace Discovery' },
  { actNumber: 2, challengeType: 'trade', actBadge: 'Act II · Market & Artisan Exchange' },
  { actNumber: 3, challengeType: 'build', actBadge: 'Act III · Architectural Restoration' },
  { actNumber: 4, challengeType: 'cook', actBadge: 'Act IV · Culinary Heritage & Hearth' },
  { actNumber: 5, challengeType: 'word', actBadge: 'Act V · Language, Epigraphy & Keepsake' },
];

const COUNTRY_QUEST_SEEDS: Record<
  CountryCode,
  Record<
    ChallengeType,
    {
      legacyPackId: string;
      legacyObjId: string;
      titleEn: string;
      titleNative: string;
      zoneLabel: string;
      npcId: string;
      npcName: string;
      npcRole: string;
      supplies: string[];
      intro: string;
      culturalLesson: string;
      epistemic: EpistemicClassification;
      epistemicNote: string;
      robloxMech: string;
      minecraftMech: string;
      waypoints: [number, number, string][];
    }
  >
> = {
  LB: {
    gather: {
      legacyPackId: 'LB-1-gather',
      legacyObjId: 'LB:ch1:harbor:gather',
      titleEn: 'Pantry & Terrace Harvest in Byblos',
      titleNative: 'حصاد المدرجات وميناء جبيل',
      zoneLabel: 'Mount Lebanon Olive & Za’atar Terraces (East Ridge)',
      npcId: 'npc:LB:teta_nahla',
      npcName: 'Teta Nahla',
      npcRole: 'Harbor Baker & Heritage Storykeeper',
      supplies: ['Wild Mountain Za’atar (Origanum syriacum)', 'First-Press Olive Oil', 'Stone-Milled Wheat Flour'],
      intro: 'Follow Teta Nahla up the sunlit limestone steps above Byblos Harbor to harvest fragrant wild thyme and golden olive oil.',
      culturalLesson: 'Sustainable foraging in Lebanon leaves the root crown of wild za’atar intact so mountain terraces regenerate each spring.',
      epistemic: 'LIVING_TRADITION',
      epistemicNote: 'Verified Levantine ethnobotanical & agricultural practice.',
      robloxMech: '2-player co-op herb foraging nodes along the Byblos hillside with proximity harvest prompts.',
      minecraftMech: 'Harvest custom lb_zaatar_drying_rack and olive terrace blocks included in miraverse.mcaddon.',
      waypoints: [
        [22, 62, 'Harbor Quay Start'],
        [48, 52, 'Teta Nahla’s Courtyard Gate'],
        [78, 28, 'Upper Olive & Za’atar Terrace'],
      ],
    },
    trade: {
      legacyPackId: 'LB-1-trade',
      legacyObjId: 'LB:ch1:harbor:trade',
      titleEn: 'Share with the Byblos Souk Spice Merchant',
      titleNative: 'تبادل السماق في سوق جبيل القديم',
      zoneLabel: 'Vaulted Limestone Old Souk (Central Market Lane)',
      npcId: 'npc:LB:amo_farid',
      npcName: 'Amo Farid',
      npcRole: 'Byblos Old Souk Spice & Sumac Merchant',
      supplies: ['Crimson Ground Sumac (Rhus coriaria)', 'Toasted White Sesame Seeds', 'Woven Reed Basket'],
      intro: 'Step beneath the vaulted stone arches of Jbeil’s historic market to greet Amo Farid and exchange fresh harvest goods for tangy crimson sumac.',
      culturalLesson: 'Byblos’s souk continues a 5,000-year tradition of Mediterranean coastal exchange linking mountain farmers and harbor mariners.',
      epistemic: 'ESTABLISHED_HISTORY',
      epistemicNote: 'Documented in Ottoman, Mamluk, and ancient Levantine trade records.',
      robloxMech: 'Respectful bilingual dialogue wheel with Amo Farid at the souk spice stall.',
      minecraftMech: 'Interact with the Byblos market stall structure and custom spice jars.',
      waypoints: [
        [48, 52, 'Courtyard Archway'],
        [56, 66, 'Amo Farid’s Spice Stall'],
        [62, 58, 'Souk Weigh-Station'],
      ],
    },
    build: {
      legacyPackId: 'LB-1-build',
      legacyObjId: 'LB:ch1:harbor:build',
      titleEn: 'Restore the Triple-Arched Limestone House',
      titleNative: 'ترميم القناطر الحجرية وخشب الأرز',
      zoneLabel: 'Byblos Sea Castle & Mandaloun Archway (Harbor Overlook)',
      npcId: 'npc:LB:nadim_builder',
      npcName: 'Ustadh Nadim',
      npcRole: 'Master Stonemason & Cedar Carpenter',
      supplies: ['Golden Ramleh Limestone Blocks', 'Aromatic Cedar Roof Beams', 'Red Terracotta Marseilles Tiles'],
      intro: 'Work alongside Ustadh Nadim to align the keystone of the triple-arched mandaloun window and secure the cedar roof beams overlooking the sea.',
      culturalLesson: 'Traditional Lebanese triple-arch windows frame the Mediterranean horizon while thick limestone walls keep interiors naturally cool.',
      epistemic: 'ARCHAEOLOGICAL_RECORD',
      epistemicNote: 'Verified architectural typology of historic Jbeil and Mount Lebanon.',
      robloxMech: 'Owner-permissioned 3-stage courtyard restoration (foundation -> limestone arches -> cedar & terracotta roof).',
      minecraftMech: 'Place custom lb_byblos_limestone, lb_carved_arch_stone, lb_cedar_shutter, and lb_terracotta_roof_tile blocks.',
      waypoints: [
        [36, 44, 'Crusader & Phoenician Citadel Overlook'],
        [52, 46, 'Triple-Arched Limestone Courtyard'],
        [64, 42, 'Cedar Timber Workshop'],
      ],
    },
    cook: {
      legacyPackId: 'LB-1-cook',
      legacyObjId: 'LB:ch1:harbor:cook',
      titleEn: 'Bake Za’atar Man’oushe on Teta Nahla’s Saj',
      titleNative: 'خبز المنقوشة عالصاج مع تيتا نهلة',
      zoneLabel: 'Sunlit Saj Bakery Courtyard (South Harbor Terrace)',
      npcId: 'npc:LB:teta_nahla',
      npcName: 'Teta Nahla',
      npcRole: 'Harbor Baker & Heritage Storykeeper',
      supplies: ['Rested Wheat Dough', 'Za’atar & Sumac Blend', 'Olive Oil & Saj Cushion (Kara)'],
      intro: 'Gather around the glowing domed cast-iron saj hearth as Teta Nahla demonstrates how to stretch dough over the padded kara cushion and bake golden man’oushe.',
      culturalLesson: 'The convex saj oven distributes heat rapidly, baking flatbread in under a minute while preserving the herbal aroma of wild thyme and olive oil.',
      epistemic: 'LIVING_TRADITION',
      epistemicNote: 'UNESCO-recognized Levantine flatbread and communal hearth tradition.',
      robloxMech: 'Step-by-step interactive saj baking station (stretch dough -> brush olive oil & za’atar -> bake on domed hearth).',
      minecraftMech: 'Use the custom lb_saj_hearth_block and craft warm man’oushe items.',
      waypoints: [
        [58, 64, 'Stone Dough Prep Table'],
        [66, 62, 'Glowing Domed Saj Hearth'],
        [70, 68, 'Family Breakfast Terrace'],
      ],
    },
    word: {
      legacyPackId: 'LB-1-word',
      legacyObjId: 'LB:ch1:harbor:word',
      titleEn: 'Phoenician Letters & Words from Teta’s Kitchen',
      titleNative: 'أبجدية جبيل وكلمات الضيافة اللبنانية',
      zoneLabel: 'Byblos Epigraphy Portico & Harbor Pier',
      npcId: 'npc:LB:teta_nahla',
      npcName: 'Teta Nahla',
      npcRole: 'Harbor Baker & Heritage Storykeeper',
      supplies: ['Phoenician Alphabet Guide', 'Lebanese Arabic Phrasebook', 'Byblos Harbor Wax Seal'],
      intro: 'Trace the ancient 22-letter Phoenician script of Byblos into modern Arabic and Latin letters while practicing warm Lebanese Arabic greetings with Teta Nahla.',
      culturalLesson: 'From Aleph (𐤀) to Taw (𐤕), Byblos’s consonantal alphabet linked ancient Mediterranean cultures and lives on in the scripts we read today.',
      epistemic: 'ARCHAEOLOGICAL_RECORD',
      epistemicNote: 'Grounded in the 10th-century BCE Ahiram Sarcophagus inscription from Byblos.',
      robloxMech: 'Bilingual audio-visual word matching and Passport stamp unlocking in Roblox DataStoreService.',
      minecraftMech: 'Complete the mentor dialogue journal and collect the Byblos Passport Stamp item.',
      waypoints: [
        [40, 48, 'Ahiram Epigraphy Portico'],
        [66, 62, 'Teta Nahla’s Courtyard'],
        [26, 68, 'Phoenician Harbor Lighthouse'],
      ],
    },
  },

  IQ: {
    gather: {
      legacyPackId: 'IQ-1-gather',
      legacyObjId: 'IQ:ch1:shanasheel:gather',
      titleEn: 'Harvest Golden Dates by the Tigris',
      titleNative: 'قطاف التمر والهيل على ضفاف دجلة',
      zoneLabel: 'Tigris Riverfront Date Palm Orchard (West Bank)',
      npcId: 'npc:IQ:bibi_amal',
      npcName: 'Bibi Amal',
      npcRole: 'Orchard Host & Culinary Elder',
      supplies: ['Amber Zahidi Dates', 'Green Cardamom Pods', 'Stone-Ground Wheat Flour'],
      intro: 'Walk beneath the swaying date palms along the Tigris River with Bibi Amal to gather sun-ripened dates and fragrant cardamom pods.',
      culturalLesson: 'Mesopotamian date palm groves create a two-story oasis microclimate, shading citrus trees and herb gardens beneath their canopy.',
      epistemic: 'LIVING_TRADITION',
      epistemicNote: 'Documented across 4,000 years of Mesopotamian agricultural history.',
      robloxMech: ' Planned RC3 Tigris orchard gathering loop with cooperative basket carrying.',
      minecraftMech: 'Harvest date palm and cardamom items using the custom Baghdad behavior pack.',
      waypoints: [
        [14, 24, 'Upper Date Palm Grove'],
        [18, 56, 'Orchard Irrigation Canal'],
        [24, 74, 'Bibi Amal’s Courtyard Pantry'],
      ],
    },
    trade: {
      legacyPackId: 'IQ-1-trade',
      legacyObjId: 'IQ:ch1:shanasheel:trade',
      titleEn: 'Books, Astrolabes & Tea on Al-Mutanabbi Street',
      titleNative: 'المخطوطات والشاي في شارع المتنبي',
      zoneLabel: 'Al-Mutanabbi Book & Coppersmith Street (Central Quay)',
      npcId: 'npc:IQ:abu_zaid',
      npcName: 'Ustadh Zayd & Abu Zaid',
      npcRole: 'Astronomer, Calligrapher & Coppersmith',
      supplies: ['Polished Brass Samovar Teapot', 'Rag Paper & Reed Qalam', 'Carved Wooden Kleicha Stamp'],
      intro: 'Browse the open-air bookstalls of Al-Mutanabbi Street and exchange warm hospitality with the neighborhood calligrapher and coppersmith.',
      culturalLesson: 'Baghdad’s paper mills introduced in the late 8th century CE made books accessible to scholars, poets, and students across the Abbasid world.',
      epistemic: 'ESTABLISHED_HISTORY',
      epistemicNote: 'Verified history of Abbasid papermaking (Dar al-Qazz) and Al-Mutanabbi Street.',
      robloxMech: 'Planned RC3 scholar & artisan exchange in the Al-Mutanabbi book market.',
      minecraftMech: 'Trade with the Baghdad mentor entity near iq_copper_samovar_stand blocks.',
      waypoints: [
        [36, 20, 'Al-Mutanabbi Bookstalls'],
        [26, 38, 'Calligraphy & Astrolabe Studio'],
        [48, 56, 'Tigris Arched Stone Bridge'],
      ],
    },
    build: {
      legacyPackId: 'IQ-1-build',
      legacyObjId: 'IQ:ch1:shanasheel:build',
      titleEn: 'Restore the House of Wisdom Courtyard & Shanashil',
      titleNative: 'بناء إيوان الحكمة وشناشيل بغداد',
      zoneLabel: 'House of Wisdom Courtyard & Turquoise Dome (East Bank)',
      npcId: 'npc:IQ:sinan_carpenter',
      npcName: 'Master Sinan',
      npcRole: 'Master Bricklayer & Shanashil Joiner',
      supplies: ['Buff-Fired Mesopotamian Bricks', 'Turquoise-Glazed Muqarnas Tiles', 'Carved Palm-Wood Shanashil Screens'],
      intro: 'Help Master Sinan restore the pointed brick courtyard arches, the octagonal cooling fountain, and the projecting wooden shanashil windows.',
      culturalLesson: 'Geometric tilework and courtyard fountains use evaporative cooling and shade to lower indoor temperatures by up to 10°C in summer.',
      epistemic: 'ARCHAEOLOGICAL_RECORD',
      epistemicNote: 'Grounded in surviving Abbasid brick masonry (Al-Mustansiriya) and Baghdadi heritage houses.',
      robloxMech: 'Planned RC3 3-stage courtyard arch, turquoise dome, and shanashil restoration.',
      minecraftMech: 'Build with iq_baghdadi_courtyard_arch, iq_turquoise_muqarnas, and iq_shanasheel_oriel_screen blocks.',
      waypoints: [
        [68, 42, 'Octagonal Turquoise Fountain'],
        [76, 30, 'Azure Geometric Dome & Arches'],
        [84, 48, 'East Scholar Arcade'],
      ],
    },
    cook: {
      legacyPackId: 'IQ-1-cook',
      legacyObjId: 'IQ:ch1:shanasheel:cook',
      titleEn: 'Bake Cardamom Date Kleicha with Bibi Amal',
      titleNative: 'خبز كليجة العيد بالتمر والهيل',
      zoneLabel: 'Baghdadi Brick-Oven Courtyard Kitchen (South West)',
      npcId: 'npc:IQ:bibi_amal',
      npcName: 'Bibi Amal',
      npcRole: 'Orchard Host & Culinary Elder',
      supplies: ['Spiced Dough', 'Softened Date & Cardamom Filling', 'Wooden Geometric Pastry Mold'],
      intro: 'Roll spiced dough around sweet date paste, press geometric star patterns with a wooden mold, and bake golden kleicha in Bibi Amal’s brick oven.',
      culturalLesson: 'Kleicha traces its lineage to ancient Mesopotamian festival breads (qullupu) baked in domed clay and brick ovens.',
      epistemic: 'LIVING_TRADITION',
      epistemicNote: 'Documented Iraqi culinary heritage with ancient Mesopotamian roots.',
      robloxMech: 'Planned RC3 cooperative pastry rolling, stamping, and brick-oven baking.',
      minecraftMech: 'Craft kleicha at the custom iq_kleicha_brick_oven block.',
      waypoints: [
        [20, 74, 'Courtyard Pastry Table'],
        [26, 72, 'Domed Brick Kleicha Oven'],
        [32, 80, 'Courtyard Tea Rug'],
      ],
    },
    word: {
      legacyPackId: 'IQ-1-word',
      legacyObjId: 'IQ:ch1:shanasheel:word',
      titleEn: 'Star Names, Algebra & Words from Baghdad',
      titleNative: 'أسماء النجوم وكلمات الضيافة البغدادية',
      zoneLabel: 'Riverside Astrolabe Observatory & Fountain',
      npcId: 'npc:IQ:bibi_amal',
      npcName: 'Ustadh Zayd & Bibi Amal',
      npcRole: 'Astronomer & Courtyard Host',
      supplies: ['Brass Planispheric Astrolabe', 'Iraqi Arabic Vocabulary Cards', 'Baghdad Wax Seal'],
      intro: 'Discover how Arabic words like algebra (al-jabr), algorithm (al-Khwarizmi), and star names (Aldebaran, Vega, Altair) traveled from Baghdad to the world.',
      culturalLesson: 'Over 200 bright stars in modern international astronomy retain their Arabic names charted in medieval astronomical tables (zij).',
      epistemic: 'ESTABLISHED_HISTORY',
      epistemicNote: 'Verified by International Astronomical Union (IAU) star nomenclature.',
      robloxMech: 'Planned RC3 constellation alignment puzzle and Iraqi Arabic dialogue practice.',
      minecraftMech: 'Unlock the Baghdad Astrolabe & Stamp keepsakes in the companion pack.',
      waypoints: [
        [76, 44, 'Courtyard Star-Viewing Terrace'],
        [52, 68, 'Tigris Riverfront Pier'],
        [88, 78, 'Compass Rose Observatory'],
      ],
    },
  },

  EG: {
    gather: {
      legacyPackId: 'EG-1-gather',
      legacyObjId: 'EG:ch1:lantern:gather',
      titleEn: 'Pantry Harvest Along the Nile Corniche',
      titleNative: 'خيرات النيل وسوق التوابل',
      zoneLabel: 'Nile Felucca Quays & Spice Market (West Shore)',
      npcId: 'npc:EG:teta_samira',
      npcName: 'Teta Samira',
      npcRole: 'Courtyard Culinary Host',
      supplies: ['Nile Delta Rice & Brown Lentils', 'Roasted Cumin & Coriander', 'Ripe Red Tomatoes & Chickpeas'],
      intro: 'Meet Teta Samira by the white-sailed Nile feluccas to gather lentils, grains, and fragrant cumin from the riverside market stalls.',
      culturalLesson: 'For over 5,000 years, the fertile alluvial soil of the Nile Valley and Delta has sustained staple harvests of lentils, wheat, and legumes.',
      epistemic: 'ESTABLISHED_HISTORY',
      epistemicNote: 'Verified Nile agricultural history.',
      robloxMech: 'Planned RC3 riverside spice and grain collection with Teta Samira.',
      minecraftMech: 'Gather custom koshari ingredients near eg_spice_bazaar_canopy blocks.',
      waypoints: [
        [18, 66, 'Nile Felucca Pier'],
        [34, 62, 'Riverside Spice & Grain Stalls'],
        [44, 52, 'Fatimid Twin-Tower Gate'],
      ],
    },
    trade: {
      legacyPackId: 'EG-1-trade',
      legacyObjId: 'EG:ch1:lantern:trade',
      titleEn: 'Stained Glass & Brass in Khan el-Khalili',
      titleNative: 'فوانيس النحاس والزجاج في خان الخليلي',
      zoneLabel: 'Khan el-Khalili Lantern Alley (Central Souk)',
      npcId: 'npc:EG:am_hassan',
      npcName: 'Uncle Tariq & Am Hassan',
      npcRole: 'Master Fanous Lantern Artisans',
      supplies: ['Pierced Sheet Brass Panels', 'Ruby, Emerald & Amber Glass Panes', 'Beeswax Candle & Wire'],
      intro: 'Walk beneath strings of glowing fanous lanterns in Khan el-Khalili to trade with Uncle Tariq and select colored glass panes for the courtyard archway.',
      culturalLesson: 'Cairo’s lantern artisans upcycle sheet metal and colored glass, soldering intricate geometric polyhedra that cast starlight patterns.',
      epistemic: 'LIVING_TRADITION',
      epistemicNote: 'Documented Cairene craft guild tradition in Darb al-Ahmar and Khan el-Khalili.',
      robloxMech: 'Planned RC3 color-refraction puzzle and artisan trade in the lantern bazaar.',
      minecraftMech: 'Craft and place glowing eg_fanous_lantern_block and eg_alabaster_lamp blocks.',
      waypoints: [
        [52, 46, 'Al-Muizz Street Archway'],
        [60, 62, 'Glowing Fanous Lantern Alley'],
        [66, 74, 'Uncle Tariq’s Brass Workshop'],
      ],
    },
    build: {
      legacyPackId: 'EG-1-build',
      legacyObjId: 'EG:ch1:lantern:build',
      titleEn: 'Assemble the Nile Felucca & Mashrabiya Arch',
      titleNative: 'بناء الفلوكة النيلية والمشربية الخشبية',
      zoneLabel: 'Courtyard Mashrabiya Balcony & Nile Boatyard',
      npcId: 'npc:EG:karim_artisan',
      npcName: 'Master Karim',
      npcRole: 'Mashrabiya Woodturner & Boatwright',
      supplies: ['Acacia Hull Planks & Tall Linen Sail', 'Turned Beechwood Mashrabiya Spools', 'Carved Sandstone Arch Stones'],
      intro: 'Help Master Karim fit interlocking wooden spools into a cooling mashrabiya balcony screen and rig the white lateen sail of a Nile felucca.',
      culturalLesson: 'Mashrabiya screens use hundreds of small turned-wood cylinders joined without nails so the wood never cracks in dry desert air.',
      epistemic: 'ARCHAEOLOGICAL_RECORD',
      epistemicNote: 'Verified conservation principle of Ottoman and Mamluk mashrabiya joinery.',
      robloxMech: 'Planned RC3 mashrabiya lattice assembly and felucca sail rigging.',
      minecraftMech: 'Build with eg_cairo_mashrabiya, eg_khan_arch_stone, and eg_courtyard_fountain_tile blocks.',
      waypoints: [
        [14, 78, 'Nile Felucca Boatyard'],
        [58, 52, 'Mashrabiya Balcony Overlook'],
        [72, 48, 'Courtyard Archway'],
      ],
    },
    cook: {
      legacyPackId: 'EG-1-cook',
      legacyObjId: 'EG:ch1:lantern:cook',
      titleEn: 'Layer Festive Cairo Koshari with Teta Samira',
      titleNative: 'تحضير الكشري المصري في الحارة',
      zoneLabel: 'Festive Cairene Courtyard Kitchen (East Quarter)',
      npcId: 'npc:EG:teta_samira',
      npcName: 'Teta Samira',
      npcRole: 'Courtyard Culinary Host',
      supplies: ['Simmered Lentils & Rice', 'Cumin-Garlic Tomato Salsa', 'Golden Caramelized Onions (Ta’liya)'],
      intro: 'Join Teta Samira around the steaming copper cauldron to layer rice, brown lentils, pasta, spiced tomato sauce, and crispy golden onions.',
      culturalLesson: 'Koshari brings together grains and legumes into a complete protein dish shared across every neighborhood of Cairo.',
      epistemic: 'LIVING_TRADITION',
      epistemicNote: 'Signature contemporary Egyptian culinary heritage.',
      robloxMech: 'Planned RC3 sequential layering mini-game at the courtyard kitchen.',
      minecraftMech: 'Prepare koshari bowls at the custom eg_koshari_cauldron_block.',
      waypoints: [
        [78, 56, 'Twin Stone Ovens'],
        [82, 64, 'Steaming Copper Koshari Cauldron'],
        [78, 72, 'Courtyard Dining Tables'],
      ],
    },
    word: {
      legacyPackId: 'EG-1-word',
      legacyObjId: 'EG:ch1:lantern:word',
      titleEn: 'Optics of Light & Everyday Words from Cairo',
      titleNative: 'علم الضوء وكلمات القاهرة اليومية',
      zoneLabel: 'Citadel Overlook & Lantern Courtyard',
      npcId: 'npc:EG:teta_samira',
      npcName: 'Uncle Tariq & Teta Samira',
      npcRole: 'Master Artisan & Courtyard Host',
      supplies: ['Ibn al-Haytham Pinhole Light Box', 'Egyptian Arabic Phrase Cards', 'Cairo Fanous Stamp Seal'],
      intro: 'Observe how stained-glass fanous lanterns travel in straight light rays—just as Ibn al-Haytham demonstrated in 11th-century Cairo—while practicing Cairene Arabic greetings.',
      culturalLesson: 'Ibn al-Haytham’s experiments in Cairo established that light travels in straight lines through apertures, founding modern optics.',
      epistemic: 'ESTABLISHED_HISTORY',
      epistemicNote: 'Grounded in Ibn al-Haytham’s Kitab al-Manazir (Book of Optics, c. 1011–1021 CE).',
      robloxMech: 'Planned RC3 light-beam mirror alignment and Egyptian Arabic dialogue.',
      minecraftMech: 'Complete the Cairo mentor dialogue book and earn the Cairo Souvenir Stamp.',
      waypoints: [
        [64, 30, 'Historic Mosque & Madrasa Courtyard'],
        [86, 12, 'Eastern Citadel Overlook'],
        [60, 86, 'Southern Lantern Gate'],
      ],
    },
  },

  FR: {
    gather: {
      legacyPackId: 'FR-1-gather',
      legacyObjId: 'FR:ch1:bakery:gather',
      titleEn: 'Morning Market Harvest Along the Saône',
      titleNative: 'Marché du Matin sur les Quais de Saône',
      zoneLabel: 'Quais de Saône & Fourvière Garden Terraces',
      npcId: 'npc:FR:mamie_claire',
      npcName: 'Chef Élodie & Mamie Claire',
      npcRole: 'Master Boulangère of Vieux Lyon',
      supplies: ['Charentes-Poitou Cultured Butter', 'Finely Ground Sweet Almonds', ' Stone-Milled Pastry Flour & Porcelain Fève'],
      intro: 'Stroll the sunlit cobblestone quays of the Saône River with Chef Élodie to gather cultured butter, sweet almonds, and a tiny porcelain fève charm.',
      culturalLesson: 'Lyon sits at the crossroads of fertile agricultural regions—Bresse, Beaujolais, Dauphiné, and Savoy—making its morning markets legendary.',
      epistemic: 'LIVING_TRADITION',
      epistemicNote: 'Verified culinary geography of Lyon and the Rhône-Alpes region.',
      robloxMech: 'Planned RC3 market basket gathering along the Vieux Lyon riverfront.',
      minecraftMech: 'Collect baking ingredients across the Vieux Lyon market stalls.',
      waypoints: [
        [20, 74, 'Saône Stone Bridge'],
        [34, 22, 'Fourvière Hillside Gardens'],
        [64, 62, 'Lion Fountain Square'],
      ],
    },
    trade: {
      legacyPackId: 'FR-1-trade',
      legacyObjId: 'FR:ch1:bakery:trade',
      titleEn: 'Silk Threads & Punched Cards at the Canut Workshop',
      titleNative: 'Atelier des Canuts et Métier Jacquard',
      zoneLabel: 'Cutaway Canut Silk Workshop (West Quarter)',
      npcId: 'npc:FR:monsieur_henri',
      npcName: 'Monsieur Henri',
      npcRole: 'Master Canut Silk Weaver',
      supplies: ['Crimson & Gold Silk Spools', 'Perforated Jacquard Pattern Card', 'Golden Baker’s Ribbon'],
      intro: 'Step inside Monsieur Henri’s high-ceilinged silk workshop to see a wooden Jacquard loom weave intricate patterns from perforated pasteboard cards.',
      culturalLesson: 'Each hole in a Jacquard card acts like a binary 1 or 0—lifting or lowering a warp thread to weave complex silk brocade automatically.',
      epistemic: 'ESTABLISHED_HISTORY',
      epistemicNote: 'Verified history of Joseph Marie Jacquard (1804) and the history of computing.',
      robloxMech: 'Planned RC3 binary punched-card pattern puzzle on a virtual silk loom.',
      minecraftMech: 'Trade with the Lyon artisan and inspect custom silk banner patterns.',
      waypoints: [
        [18, 48, 'Canut Silk Loom Workshop'],
        [36, 36, 'Vaulted Traboule Entrance'],
        [52, 38, 'Spiral Staircase Tower'],
      ],
    },
    build: {
      legacyPackId: 'FR-1-build',
      legacyObjId: 'FR:ch1:bakery:build',
      titleEn: 'Restore the Vieux Lyon Traboule & Boulangerie Facade',
      titleNative: 'Restaurer la Traboule et la Boulangerie du Vieux Lyon',
      zoneLabel: 'Renaissance Traboule Courtyard & Spiral Tower (Center)',
      npcId: 'npc:FR:camille_mason',
      npcName: 'Compagnon Camille',
      npcRole: 'Heritage Stonemason & Carpenter',
      supplies: ['Golden Pierres Dorées Limestone', 'Ochre Lime Stucco & Slate Shingles', 'Carved Oak Boulangerie Shutters'],
      intro: 'Work with Compagnon Camille to repair the rib-vaulted traboule passageway, the spiral stone stair tower, and the oak shutters of the corner boulangerie.',
      culturalLesson: 'Traboules allowed silk workers to carry bolts of silk from workshops to river barges sheltered from rain, and later aided Resistance couriers in WWII.',
      epistemic: 'ARCHAEOLOGICAL_RECORD',
      epistemicNote: 'UNESCO-documented Renaissance architecture of Vieux Lyon.',
      robloxMech: 'Planned RC3 traboule archway and boulangerie storefront restoration.',
      minecraftMech: 'Build with fr_traboule_vault_stone, fr_lyon_ochre_stucco, and fr_carved_oak_shutter blocks.',
      waypoints: [
        [40, 56, 'Courtyard Rib-Vaulted Traboule'],
        [46, 74, 'Rue Saint-Jean Archway'],
        [76, 34, 'Upper Passageway Arch'],
      ],
    },
    cook: {
      legacyPackId: 'FR-1-cook',
      legacyObjId: 'FR:ch1:bakery:cook',
      titleEn: 'Bake the Golden Galette & Brioche with Chef Élodie',
      titleNative: 'Cuire la Galette Dorée et la Brioche Lyonnaise',
      zoneLabel: 'Corner Boulangerie du Soleil (East Square)',
      npcId: 'npc:FR:mamie_claire',
      npcName: 'Chef Élodie',
      npcRole: 'Master Boulangère of Vieux Lyon',
      supplies: ['Laminated Puff Pastry (Pâte Feuilletée)', 'Almond Frangipane Cream', 'Egg Wash & Scoring Knife'],
      intro: 'Fold butter into puff pastry layers, pipe sweet almond cream, hide the porcelain fève, and score a spiral sun pattern before baking in the wood-fired oven.',
      culturalLesson: 'Steam trapped between hundreds of paper-thin butter and dough layers causes puff pastry (pâte feuilletée) to rise into crisp, golden honeycomb flakes.',
      epistemic: 'LIVING_TRADITION',
      epistemicNote: 'Verified French boulangerie and pâtisserie culinary science.',
      robloxMech: 'Planned RC3 pastry folding, rosette scoring, and wood-oven baking station.',
      minecraftMech: 'Bake golden pastries using the custom fr_boulangerie_wood_oven block.',
      waypoints: [
        [80, 62, 'Glowing Boulangerie Display Window'],
        [86, 52, 'Wood-Fired Bakery Hearth'],
        [68, 66, 'Lion Fountain Tasting Courtyard'],
      ],
    },
    word: {
      legacyPackId: 'FR-1-word',
      legacyObjId: 'FR:ch1:bakery:word',
      titleEn: 'Words of the Canuts, Traboules & French Kitchen',
      titleNative: 'Les Mots du Vieux Lyon et de la Boulangerie',
      zoneLabel: 'Saône River Bridge & Boulangerie Square',
      npcId: 'npc:FR:mamie_claire',
      npcName: 'Chef Élodie',
      npcRole: 'Master Boulangère of Vieux Lyon',
      supplies: ['French Culinary & Architecture Glossary', 'Lyon Silk Bookmark', 'Vieux Lyon Wax Seal'],
      intro: 'Practice everyday French greetings and discover Lyonnais heritage terms like trabouler (to walk through hidden passages) and canut (master silk weaver).',
      culturalLesson: 'Lyon’s distinct regional vocabulary preserves centuries of Franco-Provençal craft, silk weaving, and culinary history.',
      epistemic: 'LIVING_TRADITION',
      epistemicNote: 'Grounded in Lyonnais linguistic and cultural history.',
      robloxMech: 'Planned RC3 French dialogue cards and Passport stamp unlock.',
      minecraftMech: 'Complete the Lyon mentor journal and collect the Vieux Lyon Souvenir Stamp.',
      waypoints: [
        [64, 52, 'Place du Lion'],
        [94, 62, 'East Riverfront Promenade'],
        [74, 82, 'Pont de Pierre Overlook'],
      ],
    },
  },

  KR: {
    gather: {
      legacyPackId: 'KR-1-gather',
      legacyObjId: 'KR:ch1:hanok:gather',
      titleEn: 'Harvest Obangsaek Ingredients & Pine Needles in Jeonju',
      titleNative: '전주 오방색 나물과 솔잎 채집',
      zoneLabel: 'Ginkgo Lane & Garden Courtyards (West Village)',
      npcId: 'npc:KR:halmeoni',
      npcName: 'Halmeoni Seo-Yeon',
      npcRole: 'Hanji Artisan & Culinary Elder',
      supplies: ['Freshly Milled Rice Flour & Sesame-Honey', 'Five-Color Namul Vegetables (Spinach, Carrot, Bean Sprouts, Radish, Shiitake)', 'Fragrant Red Pine Needles (Sol-ip)'],
      intro: 'Walk down the golden ginkgo lane with Halmeoni Seo-Yeon to gather seasonal namul vegetables representing all five Obangsaek colors and fresh pine needles.',
      culturalLesson: 'In Korean culinary philosophy, combining five colors (green, red, yellow, white, black) ensures both visual harmony and balanced nutrition.',
      epistemic: 'LIVING_TRADITION',
      epistemicNote: 'Verified Jeonju gastronomy and Obangsaek dietary tradition.',
      robloxMech: 'Planned RC3 five-color ingredient foraging across Jeonju’s garden courtyards.',
      minecraftMech: 'Harvest pine needles and seasonal crops in the Jeonju Hanok companion pack.',
      waypoints: [
        [26, 78, 'South Ginkgo & Cherry Blossom Gate'],
        [36, 46, ' Onggi Fermentation Terrace (Jangdokdae)'],
        [58, 42, 'Central Stepping-Stone Lane'],
      ],
    },
    trade: {
      legacyPackId: 'KR-1-trade',
      legacyObjId: 'KR:ch1:hanok:trade',
      titleEn: 'Mulberry Hanji Paper & Celadon in the Artisan Courtyard',
      titleNative: '전주 한지 공방과 청자 다완 나눔',
      zoneLabel: 'Hanji Drying Courtyard & Ceramic Studio (West Pavilion)',
      npcId: 'npc:KR:ajusshi_min',
      npcName: 'Master Min',
      npcRole: 'Jeonju Hanji Papermaker & Potter',
      supplies: ['Dak Mulberry-Bark Hanji Sheets', 'Inlaid Celadon Bowl', 'Red-and-Blue Cheongsachorong Silk Lantern'],
      intro: 'Visit Master Min’s sunlit courtyard where white sheets of dak-bark hanji paper dry on wooden racks, and exchange warm songpyeon for an inlaid celadon bowl.',
      culturalLesson: 'Unlike acidic wood-pulp paper that yellows in decades, alkaline Jeonju hanji made from mulberry bark fibers remains strong for over 1,000 years.',
      epistemic: 'ESTABLISHED_HISTORY',
      epistemicNote: 'Verified by conservation studies of the Joseon Wangjo Sillok and Mugujeonggwang Dharani Sutra.',
      robloxMech: 'Planned RC3 hanji sheet-lifting rhythm activity and artisan trade.',
      minecraftMech: 'Craft kr_hanji_sliding_screen and trade with the Jeonju mentor entity.',
      waypoints: [
        [18, 60, 'Hanji Mulberry-Paper Drying Racks'],
        [24, 34, 'West Artisan Courtyard'],
        [46, 26, 'North Scholar Hall'],
      ],
    },
    build: {
      legacyPackId: 'KR-1-build',
      legacyObjId: 'KR:ch1:hanok:build',
      titleEn: 'Restore the Giwa Hanok Roof, Maru & Changhoji Doors',
      titleNative: '한옥 기와지붕과 한지 창호 수리',
      zoneLabel: 'Main Giwa Hanok Pavilion & Garden (North-East)',
      npcId: 'npc:KR:moksu_jihoon',
      npcName: 'Daemokjang Ji-Hoon',
      npcRole: 'Master Hanok Timber Carpenter',
      supplies: ['Curved Dark-Clay Giwa Roof Tiles', 'Interlocking Red Pine Brackets (Gongpo)', 'Translucent Hanji Lattice Doors'],
      intro: 'Help Daemokjang Ji-Hoon fit interlocking pine beams without nails, align the curved giwa roof tiles, and apply fresh hanji paper to the sliding doors.',
      culturalLesson: 'The gentle upward curve of a hanok roof (cheoma) blocks high summer sunlight to keep the maru cool while letting low winter sun warm the rooms.',
      epistemic: 'ARCHAEOLOGICAL_RECORD',
      epistemicNote: 'UNESCO-inscribed Daemokjang (traditional Korean wooden architecture) principles.',
      robloxMech: 'Planned RC3 mortise-and-tenon beam puzzle and giwa roof tile placement.',
      minecraftMech: 'Place custom kr_giwa_eave_tile, kr_pine_beam_bracket, and kr_ondol_hearth_stone blocks.',
      waypoints: [
        [64, 10, 'North Garden Courtyard'],
        [80, 42, 'East Giwa Hanok Pavilion'],
        [54, 82, 'South Gate Lantern Walk'],
      ],
    },
    cook: {
      legacyPackId: 'KR-1-cook',
      legacyObjId: 'KR:ch1:hanok:cook',
      titleEn: 'Prepare Obangsaek Bibimbap & Steam Pine Songpyeon',
      titleNative: '전주 비빔밥과 솔잎 송편 빚기',
      zoneLabel: 'Obangsaek Culinary Courtyard (South-East)',
      npcId: 'npc:KR:halmeoni',
      npcName: 'Halmeoni Seo-Yeon',
      npcRole: 'Hanji Artisan & Culinary Elder',
      supplies: ['Five-Color Bibimbap Bowl', 'Half-Moon Songpyeon Dough', 'Earthenware Steamer (Siru) & Pine Needles'],
      intro: 'Arrange the five Obangsaek colors in a warm stone bowl and fold half-moon songpyeon rice cakes over fragrant pine needles with Halmeoni Seo-Yeon.',
      culturalLesson: 'Steaming songpyeon over fresh pine needles prevents the rice cakes from sticking while infusing them with natural phytoncides and forest aroma.',
      epistemic: 'LIVING_TRADITION',
      epistemicNote: 'Verified Korean Chuseok and Jeonju culinary tradition.',
      robloxMech: 'Planned RC3 five-color arrangement and half-moon songpyeon folding station.',
      minecraftMech: 'Use the custom kr_songpyeon_steamer_block and kr_onggi_fermentation_jar block.',
      waypoints: [
        [68, 66, 'Obangsaek Five-Color Prep Bowls'],
        [72, 62, 'Courtyard Hearth & Steamer'],
        [36, 46, 'Onggi Jangdokdae Terrace'],
      ],
    },
    word: {
      legacyPackId: 'KR-1-word',
      legacyObjId: 'KR:ch1:hanok:word',
      titleEn: 'Hangul Feature Design & Jeonju Harvest Words',
      titleNative: '한글 창제 원리와 전주 문화 어휘',
      zoneLabel: 'Scholar’s Maru Veranda & Gyeonggijeon Path',
      npcId: 'npc:KR:halmeoni',
      npcName: 'Halmeoni Seo-Yeon',
      npcRole: 'Hanji Artisan & Culinary Elder',
      supplies: ['Hangul Consonant & Vowel Chart', 'Korean Harvest Vocabulary Cards', 'Jeonju Hanok Stamp Seal'],
      intro: 'Learn how the Korean alphabet (Hangul, 1443 CE) shapes its consonants after the physical organs of speech and its vowels after sky (ㆍ), earth (ㅡ), and human (ㅣ).',
      culturalLesson: 'Created under King Sejong in 1443 CE (Hunminjeongeum), Hangul is a featural alphabet designed so any person can learn to read and write quickly.',
      epistemic: 'ESTABLISHED_HISTORY',
      epistemicNote: 'UNESCO Memory of the World — Hunminjeongeum Haerye (1446 CE).',
      robloxMech: 'Planned RC3 Hangul syllable block builder and Korean greeting dialogue.',
      minecraftMech: 'Complete the Jeonju mentor journal and unlock the Jeonju Souvenir Stamp.',
      waypoints: [
        [46, 26, 'Scholar’s Maru Veranda'],
        [58, 42, 'Lantern-Lit Stone Lane'],
        [90, 16, 'East Compass Rose Pavilion'],
      ],
    },
  },
};

function buildAgeTierStages(
  country: CountryCode,
  actNumber: 1 | 2 | 3 | 4 | 5,
  seed: (typeof COUNTRY_QUEST_SEEDS)['LB']['gather']
): Record<AgeTierId, AgeTierStageSpecV13> {
  return {
    '5-7': {
      ageTier: '5-7',
      stageId: `${country}:act${actNumber}:5-7`,
      focusTitle: `Ages 5–7 · Visual Discovery: ${seed.titleEn}`,
      learningObjective: `Spot the colors, shapes, and friendly mentor tools in ${seed.zoneLabel} and say one warm greeting aloud.`,
      guidedActivity: `Tap the glowing waypoints on the illustrated map to find ${seed.supplies[0]} with ${seed.npcName}.`,
      challengePrompt: `Picture Match: Which tool or ingredient belongs in ${seed.zoneLabel}?`,
      historicalReflection: `Why do families in ${V13_COUNTRY_EXPERIENCES[country].cityName} share this tradition together?`,
    },
    '8-10': {
      ageTier: '8-10',
      stageId: `${country}:act${actNumber}:8-10`,
      focusTitle: `Ages 8–10 · Hands-On Craft & Collection: ${seed.titleEn}`,
      learningObjective: `Collect all three supplies (${seed.supplies.join(', ')}) and complete the step-by-step craft or kitchen sequence.`,
      guidedActivity: `${seed.intro} Follow the 3-step sequence and practice the native phrase "${seed.titleNative}".`,
      challengePrompt: `Sequence Puzzle: Arrange ${seed.supplies.join(' → ')} in the order used by ${seed.npcName}.`,
      historicalReflection: seed.culturalLesson,
    },
    '11-13': {
      ageTier: '11-13',
      stageId: `${country}:act${actNumber}:11-13`,
      focusTitle: `Ages 11–13 · Systems & Co-Op Investigation: ${seed.titleEn}`,
      learningObjective: `Analyze how climate, geography, and material science shape ${seed.titleEn} in ${V13_COUNTRY_EXPERIENCES[country].cityName}.`,
      guidedActivity: `Compare the illustrated adventure map with the real-world Geographic Atlas coordinates of ${V13_COUNTRY_EXPERIENCES[country].cityName} and solve the cooperative design challenge.`,
      challengePrompt: `Investigation: How does the local environment of ${V13_COUNTRY_EXPERIENCES[country].cityName} explain the design of ${seed.supplies[0]}?`,
      historicalReflection: `${seed.culturalLesson} (${seed.epistemicNote})`,
    },
    '14-17': {
      ageTier: '14-17',
      stageId: `${country}:act${actNumber}:14-17`,
      focusTitle: `Ages 14–17 · Historical Interpretation & Primary Sources: ${seed.titleEn}`,
      learningObjective: `Evaluate primary archaeological/historical evidence (${seed.epistemic}) versus folklore and trace cross-regional trade and knowledge exchange.`,
      guidedActivity: `Examine the epistemic classification (${seed.epistemic}) and museum/UNESCO provenance notes for ${V13_COUNTRY_EXPERIENCES[country].cityName}.`,
      challengePrompt: `Historiography Prompt: Distinguish established archaeological/historical evidence from oral tradition in ${seed.titleEn}, and connect it to another MiraVerse region.`,
      historicalReflection: `Source Note: ${seed.epistemicNote} — ${seed.culturalLesson}`,
    },
  };
}

export const V13_QUEST_ENCYCLOPEDIA: QuestEncyclopediaEntryV13[] = V13_COUNTRIES_ORDERED.flatMap((country) => {
  const exp = V13_COUNTRY_EXPERIENCES[country];
  return ACT_BLUEPRINTS.map(({ actNumber, challengeType }) => {
    const seed = COUNTRY_QUEST_SEEDS[country][challengeType];
    const questId = `${country}-act-${actNumber}`;
    const questMapId = `qmap:${country}:${actNumber}`;
    const rewardArtifact = exp.artifacts[actNumber % exp.artifacts.length];

    const waypoints: QuestMapWaypointV13[] = [
      {
        waypointId: `${questMapId}:wp1`,
        label: seed.waypoints[0][2],
        kind: 'START',
        xPct: seed.waypoints[0][0],
        yPct: seed.waypoints[0][1],
        detail: `Start Act ${actNumber} at ${seed.waypoints[0][2]}.`,
      },
      {
        waypointId: `${questMapId}:wp2`,
        label: `${seed.npcName} (${seed.waypoints[1][2]})`,
        kind: 'NPC',
        xPct: seed.waypoints[1][0],
        yPct: seed.waypoints[1][1],
        detail: `Speak with ${seed.npcName} (${seed.npcRole}) to receive guidance and supplies.`,
      },
      {
        waypointId: `${questMapId}:wp3`,
        label: seed.waypoints[2][2],
        kind: 'OBJECTIVE',
        xPct: seed.waypoints[2][0],
        yPct: seed.waypoints[2][1],
        detail: `Complete ${seed.titleEn} using ${seed.supplies.join(', ')}.`,
      },
    ];

    return {
      questId,
      legacyPackChallengeId: seed.legacyPackId,
      legacyObjectiveId: seed.legacyObjId,
      country,
      actNumber,
      challengeType,
      titleEn: seed.titleEn,
      titleNative: seed.titleNative,
      narrativeIntro: seed.intro,
      learningObjectives: [
        seed.culturalLesson,
        `Identify key materials and cultural terms: ${seed.supplies.join(', ')}.`,
        `Distinguish ${seed.epistemic.replace(/_/g, ' ').toLowerCase()} in ${exp.cityName}.`,
      ],
      npcs: [{ id: seed.npcId, name: seed.npcName, role: seed.npcRole }],
      questMapId,
      questMapImageUrl: exp.questMapArtUrl,
      questMapZoneLabel: seed.zoneLabel,
      waypoints,
      suppliesRequired: seed.supplies,
      activitiesAndChallenges: [
        `Locate ${seed.waypoints[0][2]} on the ${exp.cityName} Illustrated Quest Map.`,
        `Gather or inspect ${seed.supplies.join(', ')} alongside ${seed.npcName}.`,
        `Complete the age-adapted activity track (Ages 5–7, 8–10, 11–13, or 14–17) to unlock your Passport milestone.`,
      ],
      culturalKnowledgeSummary: seed.culturalLesson,
      epistemicClassification: seed.epistemic,
      epistemicNote: seed.epistemicNote,
      rewardArtifactId: rewardArtifact.artifactId,
      rewardTokens: 25,
      robloxMechanics: seed.robloxMech,
      minecraftMechanics: seed.minecraftMech,
      verifiedAvailability: {
        webCompanionInteractive: true,
        robloxStatus: country === 'LB' ? 'PLAYABLE_RC1_BYBLOS' : 'PLANNED_RC3_WORLD_PACK',
        minecraftStatus: 'INCLUDED_IN_MCADDON_PACK',
        availabilityLabel:
          country === 'LB'
            ? 'Playable in Web Companion, Roblox RC1 (Byblos) & Minecraft Bedrock Add-On'
            : 'Playable in Web Companion & Minecraft Bedrock Add-On · Roblox RC3 World Pack Planned',
      },
      ageTiers: buildAgeTierStages(country, actNumber, seed),
    };
  });
});

export const V13_TOTAL_QUEST_MAPS = V13_QUEST_ENCYCLOPEDIA.length; // 25
export const V13_TOTAL_AGE_STAGES = V13_QUEST_ENCYCLOPEDIA.length * V13_AGE_TIERS.length; // 100
export { V08_WORLD_VISUAL_MAP };
