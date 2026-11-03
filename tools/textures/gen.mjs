import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const outItemsDir = path.resolve(repoRoot, 'apps/minecraft/rp/textures/items');
const outEntityDir = path.resolve(repoRoot, 'apps/minecraft/rp/textures/entity');
const packsDir = path.resolve(repoRoot, 'packages/content/packs');

fs.mkdirSync(outItemsDir, { recursive: true });
fs.mkdirSync(outEntityDir, { recursive: true });

function parseHex(hex) {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function clamp(val) {
  return Math.max(0, Math.min(255, Math.round(val)));
}

function shadeColor({ r, g, b }, factor, add = 0) {
  return {
    r: clamp(r * factor + add),
    g: clamp(g * factor + add),
    b: clamp(b * factor + add),
  };
}

function setPixel(png, x, y, { r, g, b }, a = 255) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const idx = (png.width * y + x) << 2;
  png.data[idx] = r;
  png.data[idx + 1] = g;
  png.data[idx + 2] = b;
  png.data[idx + 3] = a;
}

function fillRect(png, x, y, w, h, color, a = 255) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(png, x + dx, y + dy, color, a);
    }
  }
}

// -------------------------------------------------------------
// Passport Texture Generator (16x16)
// -------------------------------------------------------------
function generatePassportTexture() {
  const png = new PNG({ width: 16, height: 16 });

  const D = { r: 12, g: 22, b: 38 }; // Dark outline
  const B1 = { r: 24, g: 54, b: 92 }; // Cover base navy
  const B2 = { r: 38, g: 76, b: 124 }; // Cover highlight
  const B3 = { r: 16, g: 38, b: 68 }; // Cover shadow
  const G1 = { r: 255, g: 215, b: 0 }; // Gold bright
  const G2 = { r: 205, g: 155, b: 25 }; // Gold shade
  const P1 = { r: 244, g: 240, b: 230 }; // Page paper light
  const P2 = { r: 215, g: 208, b: 195 }; // Page paper shadow

  // Passport grid map
  // . = transparent
  const layout = [
    '................',
    '...DDDDDDDDD....',
    '..DB2B2B2B2B2B2B2BDD...',
    '..DB2B1B1G1G1B1B1B3DP1D..',
    '..DB2B1G1G1G1G1B1B3DP2D..',
    '..DB2B1B1G1G1B1B1B3DP1D..',
    '..DB2B1G2B1B1G2B1B3DP2D..',
    '..DB2B1G1G1G1G1B1B3DP1D..',
    '..DB2B1G2B1B1G2B1B3DP2D..',
    '..DB2B1B1G1G1B1B1B3DP1D..',
    '..DB2B1G1G1G1G1B1B3DP2D..',
    '..DB2B1B1B1B1B1B1B3DP1D..',
    '..DB3B3B3B3B3B3B3B3DP2D..',
    '..DDDDDDDDDDDP1D..',
    '...DP2P2P2P2P2P2P2P2P2D...',
    '....DDDDDDDDDD..',
  ];

  const colorMap = {
    D,
    B1,
    B2,
    B3,
    G1,
    G2,
    P1,
    P2,
  };

  for (let y = 0; y < 16; y++) {
    const row = layout[y];
    let x = 0;
    let idx = 0;
    while (idx < row.length && x < 16) {
      if (row[idx] === '.') {
        idx++;
        x++;
      } else {
        // check 2-letter tokens or single-letter
        let token = row.slice(idx, idx + 2);
        if (!colorMap[token]) {
          token = row[idx];
          idx++;
        } else {
          idx += 2;
        }
        if (colorMap[token]) {
          setPixel(png, x, y, colorMap[token], 255);
        }
        x++;
      }
    }
  }

  return png;
}

// -------------------------------------------------------------
// Item Icon Generator (16x16)
// -------------------------------------------------------------
function generateItemTexture(id, hexColor) {
  const png = new PNG({ width: 16, height: 16 });
  const base = parseHex(hexColor);

  const dark = {
    r: clamp(base.r * 0.25),
    g: clamp(base.g * 0.25),
    b: clamp(base.b * 0.25),
  };
  const shadow = shadeColor(base, 0.65);
  const light = shadeColor(base, 1.25, 30);
  const highlight = shadeColor(base, 1.45, 55);

  const lowerId = id.toLowerCase();

  if (lowerId.includes('scroll') || lowerId.includes('papyrus') || lowerId.includes('hanji') || lowerId.includes('paper')) {
    // Rolled parchment / scroll
    const rollDark = shadeColor(base, 0.45);
    const textDark = shadeColor(base, 0.35);

    // Outline
    fillRect(png, 3, 2, 10, 12, dark);
    // Main paper body
    fillRect(png, 4, 3, 8, 10, base);
    // Rolled top edge
    fillRect(png, 3, 2, 10, 2, rollDark);
    fillRect(png, 4, 2, 8, 1, light);
    // Rolled bottom edge
    fillRect(png, 3, 12, 10, 2, rollDark);
    fillRect(png, 4, 13, 8, 1, shadow);
    // Center highlight
    fillRect(png, 5, 4, 3, 7, light);
    // Faux inscribed lines
    fillRect(png, 6, 5, 4, 1, textDark);
    fillRect(png, 6, 7, 4, 1, textDark);
    fillRect(png, 6, 9, 3, 1, textDark);
  } else if (
    lowerId.includes('tablet') ||
    lowerId.includes('brick') ||
    lowerId.includes('tile') ||
    lowerId.includes('soap') ||
    lowerId.includes('stone') ||
    lowerId.includes('limestone')
  ) {
    // Beveled tablet / stone plaque
    fillRect(png, 2, 2, 12, 12, dark);
    fillRect(png, 3, 3, 10, 10, base);
    // Bevel highlights (top & left)
    fillRect(png, 3, 3, 10, 1, light);
    fillRect(png, 3, 3, 1, 10, light);
    setPixel(png, 3, 3, highlight);
    // Bevel shadow (bottom & right)
    fillRect(png, 3, 12, 10, 1, shadow);
    fillRect(png, 12, 3, 1, 10, shadow);
    // Carved emblem in center
    fillRect(png, 6, 6, 4, 4, shadow);
    fillRect(png, 7, 7, 2, 2, highlight);
  } else if (
    lowerId.includes('bread') ||
    lowerId.includes('pita') ||
    lowerId.includes('samoon') ||
    lowerId.includes('baguette') ||
    lowerId.includes('croissant') ||
    lowerId.includes('cake')
  ) {
    // Baked bread / loaf
    fillRect(png, 2, 5, 12, 6, dark);
    fillRect(png, 3, 4, 10, 8, dark);
    fillRect(png, 3, 5, 10, 6, base);
    // Crust highlight
    fillRect(png, 4, 4, 8, 2, light);
    setPixel(png, 5, 4, highlight);
    setPixel(png, 8, 4, highlight);
    // Bakery score marks
    fillRect(png, 5, 6, 1, 4, shadow);
    fillRect(png, 8, 6, 1, 4, shadow);
    fillRect(png, 11, 7, 1, 3, shadow);
    fillRect(png, 3, 10, 10, 1, shadow);
  } else if (
    lowerId.includes('pot') ||
    lowerId.includes('pottery') ||
    lowerId.includes('cup') ||
    lowerId.includes('oil') ||
    lowerId.includes('faience') ||
    lowerId.includes('kimchi') ||
    lowerId.includes('koshari')
  ) {
    // Vase / Ceramic pot / Jar
    // Rim
    fillRect(png, 5, 2, 6, 2, dark);
    fillRect(png, 6, 3, 4, 1, light);
    // Neck
    fillRect(png, 6, 4, 4, 2, dark);
    fillRect(png, 7, 4, 2, 2, base);
    // Body
    fillRect(png, 3, 6, 10, 7, dark);
    fillRect(png, 4, 6, 8, 6, base);
    // Left sheen highlight
    fillRect(png, 4, 7, 2, 4, light);
    setPixel(png, 5, 8, highlight);
    // Right shadow
    fillRect(png, 10, 7, 2, 4, shadow);
    // Base
    fillRect(png, 5, 12, 6, 2, dark);
    fillRect(png, 6, 12, 4, 1, shadow);
  } else if (
    lowerId.includes('pen') ||
    lowerId.includes('brush') ||
    lowerId.includes('quill') ||
    lowerId.includes('bamboo') ||
    lowerId.includes('sapling')
  ) {
    // Diagonal tool / quill / stylus / bamboo
    for (let i = 0; i < 11; i++) {
      const x = 3 + i;
      const y = 13 - i;
      // Border
      setPixel(png, x - 1, y, dark);
      setPixel(png, x + 1, y, dark);
      setPixel(png, x, y - 1, dark);
      setPixel(png, x, y + 1, dark);
      // Shaft
      setPixel(png, x, y, i > 7 ? highlight : base);
    }
    // Tip at (13, 3)
    setPixel(png, 13, 3, highlight);
    setPixel(png, 14, 2, dark);
    // Handle end at (2, 14)
    setPixel(png, 2, 14, shadow);
  } else if (
    lowerId.includes('gem') ||
    lowerId.includes('lapis') ||
    lowerId.includes('turquoise') ||
    lowerId.includes('sun_stone') ||
    lowerId.includes('mirror')
  ) {
    // Faceted diamond / gem
    // Silhouette
    fillRect(png, 5, 2, 6, 2, dark);
    fillRect(png, 3, 4, 10, 4, dark);
    fillRect(png, 4, 8, 8, 3, dark);
    fillRect(png, 6, 11, 4, 2, dark);
    setPixel(png, 7, 13, dark);
    setPixel(png, 8, 13, dark);

    // Inner facets
    fillRect(png, 5, 3, 6, 1, light);
    fillRect(png, 4, 4, 8, 4, base);
    fillRect(png, 5, 8, 6, 3, shadow);
    fillRect(png, 7, 11, 2, 2, shadow);

    // Facet lines & spark
    fillRect(png, 6, 4, 4, 3, light);
    setPixel(png, 6, 5, highlight);
    setPixel(png, 7, 4, highlight);
    fillRect(png, 4, 7, 2, 2, highlight);
  } else if (lowerId.includes('ingot')) {
    // Minecraft style metal ingot
    fillRect(png, 3, 6, 10, 6, dark);
    fillRect(png, 4, 5, 8, 6, dark);
    fillRect(png, 4, 6, 8, 4, base);
    fillRect(png, 4, 6, 7, 1, highlight);
    fillRect(png, 4, 7, 1, 3, light);
    fillRect(png, 11, 7, 1, 3, shadow);
    fillRect(png, 5, 9, 6, 1, shadow);
  } else if (
    lowerId.includes('zaatar') ||
    lowerId.includes('lavender') ||
    lowerId.includes('olives') ||
    lowerId.includes('dates') ||
    lowerId.includes('pomegranate') ||
    lowerId.includes('grape') ||
    lowerId.includes('pine') ||
    lowerId.includes('cedar')
  ) {
    // Botanical foliage / fruit cluster
    const greenDark = { r: 25, g: 50, b: 20 };
    const greenStem = { r: 50, g: 110, b: 40 };

    // Stem
    setPixel(png, 8, 2, greenDark);
    setPixel(png, 8, 3, greenStem);
    setPixel(png, 7, 4, greenStem);
    setPixel(png, 8, 5, greenStem);

    // Fruit/leaf clusters
    fillRect(png, 4, 5, 8, 8, dark);
    fillRect(png, 5, 6, 6, 6, base);
    // Highlights
    fillRect(png, 5, 6, 3, 3, light);
    setPixel(png, 6, 7, highlight);
    // Shadows
    fillRect(png, 7, 9, 4, 3, shadow);
  } else {
    // Default: Regal bordered artifact badge
    fillRect(png, 3, 2, 10, 12, dark);
    fillRect(png, 2, 3, 12, 10, dark);
    fillRect(png, 3, 3, 10, 10, base);

    // Top-left beveled highlight
    fillRect(png, 4, 3, 8, 1, light);
    fillRect(png, 3, 4, 1, 8, light);
    setPixel(png, 4, 4, highlight);

    // Bottom-right shadow
    fillRect(png, 4, 12, 8, 1, shadow);
    fillRect(png, 12, 4, 1, 8, shadow);

    // Center jewel / motif
    fillRect(png, 6, 6, 4, 4, highlight);
    fillRect(png, 7, 7, 2, 2, light);
    setPixel(png, 7, 7, { r: 255, g: 255, b: 255 });
  }

  return png;
}

// -------------------------------------------------------------
// Mentor 64x64 Humanoid Skin Generator
// -------------------------------------------------------------
function generateMentorSkin(country) {
  const png = new PNG({ width: 64, height: 64 });
  const cc = country.toLowerCase();

  const palettes = {
    lb: {
      skin: { r: 216, g: 165, b: 131 },
      skinShade: { r: 186, g: 135, b: 105 },
      hair: { r: 44, g: 27, b: 20 },
      eyes: { r: 55, g: 35, b: 25 },
      primary: { r: 27, g: 77, b: 62 }, // Cedar green
      primaryLight: { r: 42, g: 110, b: 88 },
      primaryDark: { r: 18, g: 52, b: 42 },
      accent: { r: 200, g: 16, b: 46 }, // Crimson
      trim: { r: 212, g: 175, b: 55 }, // Gold
      shirt: { r: 245, g: 242, b: 235 }, // Warm linen
      pants: { r: 50, g: 40, b: 35 },
      shoes: { r: 70, g: 45, b: 35 },
    },
    eg: {
      skin: { r: 198, g: 134, b: 66 },
      skinShade: { r: 170, g: 106, b: 56 },
      hair: { r: 26, g: 26, b: 26 },
      eyes: { r: 35, g: 25, b: 20 },
      primary: { r: 250, g: 240, b: 230 }, // Egyptian white linen
      primaryLight: { r: 255, g: 250, b: 245 },
      primaryDark: { r: 220, g: 210, b: 200 },
      accent: { r: 0, g: 128, b: 128 }, // Turquoise
      trim: { r: 255, g: 215, b: 0 }, // Gold
      shirt: { r: 31, g: 78, b: 121 }, // Lapis
      pants: { r: 235, g: 225, b: 215 },
      shoes: { r: 141, g: 110, b: 99 },
    },
    iq: {
      skin: { r: 205, g: 133, b: 63 },
      skinShade: { r: 175, g: 110, b: 50 },
      hair: { r: 32, g: 27, b: 21 },
      eyes: { r: 40, g: 28, b: 20 },
      primary: { r: 30, g: 63, b: 102 }, // Babylon lapis azure
      primaryLight: { r: 45, g: 90, b: 145 },
      primaryDark: { r: 20, g: 42, b: 70 },
      accent: { r: 229, g: 169, b: 60 }, // Gold embroidery
      trim: { r: 45, g: 90, b: 39 }, // Palm green
      shirt: { r: 240, g: 234, b: 214 }, // Parchment cream
      pants: { r: 35, g: 45, b: 60 },
      shoes: { r: 60, g: 40, b: 30 },
    },
    kr: {
      skin: { r: 243, g: 201, b: 159 },
      skinShade: { r: 220, g: 175, b: 135 },
      hair: { r: 17, g: 17, b: 17 },
      eyes: { r: 45, g: 32, b: 24 },
      primary: { r: 15, g: 76, b: 129 }, // Royal Hanbok blue
      primaryLight: { r: 25, g: 105, b: 175 },
      primaryDark: { r: 10, g: 50, b: 85 },
      accent: { r: 194, g: 24, b: 91 }, // Crimson goreum ribbon
      trim: { r: 125, g: 170, b: 146 }, // Celadon jade
      shirt: { r: 255, g: 255, b: 255 }, // Dongjeong white collar
      pants: { r: 245, g: 245, b: 240 },
      shoes: { r: 25, g: 25, b: 25 },
    },
    fr: {
      skin: { r: 250, g: 208, b: 176 },
      skinShade: { r: 225, g: 180, b: 150 },
      hair: { r: 74, g: 46, b: 24 },
      eyes: { r: 46, g: 91, b: 136 },
      primary: { r: 0, g: 38, b: 84 }, // Marine blue
      primaryLight: { r: 20, g: 60, b: 120 },
      primaryDark: { r: 0, g: 22, b: 50 },
      accent: { r: 237, g: 41, b: 57 }, // Rouge foulard
      trim: { r: 255, g: 255, b: 255 }, // Marinière white
      shirt: { r: 245, g: 245, b: 245 },
      pants: { r: 26, g: 37, b: 48 },
      shoes: { r: 62, g: 39, b: 35 },
    },
  };

  const pal = palettes[cc] || palettes.lb;

  // 1. HEAD (Standard Minecraft coordinates: X=0..32, Y=0..16)
  // Fill all head faces with base skin tone
  fillRect(png, 0, 0, 32, 16, pal.skin);

  // Hair on top of head (8, 0, 8, 8)
  fillRect(png, 8, 0, 8, 8, pal.hair);
  // Hair on back of head (24, 8, 8, 8)
  fillRect(png, 24, 8, 8, 8, pal.hair);
  // Hair on sides of head (right: 0, 8, 8, 8; left: 16, 8, 8, 8)
  fillRect(png, 0, 8, 8, 4, pal.hair);
  fillRect(png, 16, 8, 8, 4, pal.hair);

  // Face (front: 8, 8, 8, 8)
  // Forehead hair
  fillRect(png, 8, 8, 8, 2, pal.hair);
  if (cc === 'eg') {
    // Gold head circlet
    fillRect(png, 8, 9, 8, 1, pal.trim);
  }

  // Eyebrows at Y=10
  fillRect(png, 9, 10, 2, 1, pal.hair);
  fillRect(png, 13, 10, 2, 1, pal.hair);

  // Eyes at Y=11
  setPixel(png, 9, 11, { r: 255, g: 255, b: 255 }); // Sclera
  setPixel(png, 10, 11, pal.eyes); // Iris
  setPixel(png, 13, 11, pal.eyes); // Iris
  setPixel(png, 14, 11, { r: 255, g: 255, b: 255 }); // Sclera

  // Nose shading at (11, 12)-(12, 12)
  setPixel(png, 11, 12, pal.skinShade);
  setPixel(png, 12, 12, pal.skinShade);

  // Mouth / smile at Y=13
  setPixel(png, 11, 13, pal.skinShade);
  setPixel(png, 12, 13, pal.skinShade);

  // Mentor beard/mustache for LB, IQ
  if (cc === 'lb' || cc === 'iq') {
    fillRect(png, 10, 13, 4, 1, pal.hair);
    fillRect(png, 9, 14, 6, 2, pal.hair);
  }

  // 2. HEAD OVERLAY / HAT LAYER (X=32..64, Y=0..16)
  if (cc === 'fr') {
    // French classic beret on head overlay
    fillRect(png, 40, 0, 8, 8, pal.primaryDark); // Top
    fillRect(png, 40, 8, 8, 3, pal.primaryDark); // Front rim
    fillRect(png, 32, 8, 8, 3, pal.primaryDark); // Right rim
    fillRect(png, 48, 8, 8, 3, pal.primaryDark); // Left rim
    fillRect(png, 56, 8, 8, 3, pal.primaryDark); // Back rim
    setPixel(png, 43, 8, pal.accent); // Subtle cockade
  } else if (cc === 'kr') {
    // Joseon Gat / Headband overlay
    fillRect(png, 40, 0, 8, 8, { r: 20, g: 20, b: 20 }, 220);
    fillRect(png, 40, 8, 8, 2, { r: 15, g: 15, b: 15 }, 240);
    setPixel(png, 43, 9, pal.trim); // Gat ornament
  } else if (cc === 'lb') {
    // Cedar embroidered head trim
    fillRect(png, 40, 8, 8, 1, pal.trim);
  }

  // 3. TORSO (Region: X=16..40, Y=16..32)
  // Fill all torso faces with primary robe/clothing color
  fillRect(png, 16, 16, 24, 16, pal.primary);

  // Torso Front (20, 20, 8, 12)
  if (cc === 'fr') {
    // Marinière stripes on chest
    fillRect(png, 20, 20, 8, 1, pal.accent); // Rouge scarf
    fillRect(png, 20, 21, 8, 1, pal.trim); // White stripe
    fillRect(png, 20, 22, 8, 1, pal.primary); // Navy stripe
    fillRect(png, 20, 23, 8, 1, pal.trim); // White stripe
    fillRect(png, 20, 24, 8, 1, pal.primary); // Navy stripe
    fillRect(png, 20, 25, 8, 1, pal.trim); // White stripe
    fillRect(png, 20, 26, 8, 1, pal.primary); // Navy stripe
    fillRect(png, 20, 27, 8, 1, pal.trim); // White stripe
    fillRect(png, 20, 28, 8, 2, { r: 90, g: 60, b: 40 }); // Leather belt
    fillRect(png, 20, 30, 8, 2, pal.pants);
  } else if (cc === 'eg') {
    // Broad Egyptian Collar (Wesekh) with Turquoise, Lapis, and Gold
    fillRect(png, 20, 20, 8, 1, pal.trim); // Gold collar band
    fillRect(png, 20, 21, 8, 1, pal.accent); // Turquoise
    fillRect(png, 21, 22, 6, 1, pal.shirt); // Lapis
    fillRect(png, 20, 23, 8, 5, pal.primary); // Linen robe
    fillRect(png, 20, 28, 8, 2, pal.trim); // Gold sash belt
    fillRect(png, 20, 30, 8, 2, pal.primaryDark);
  } else if (cc === 'kr') {
    // Hanbok Jeogori with Dongjeong collar and Goreum ribbon
    fillRect(png, 20, 20, 8, 2, pal.primary);
    fillRect(png, 22, 20, 4, 1, pal.shirt); // White collar
    setPixel(png, 23, 21, pal.accent); // Red knot
    fillRect(png, 23, 22, 1, 5, pal.accent); // Hanging goreum ribbon
    fillRect(png, 20, 27, 8, 1, pal.trim); // Celadon sash
    fillRect(png, 20, 28, 8, 4, pal.primaryDark);
  } else if (cc === 'lb') {
    // Cedar green vest with crimson/gold trim & white inner shirt
    fillRect(png, 22, 20, 4, 4, pal.shirt); // Linen shirt
    fillRect(png, 20, 20, 2, 8, pal.primaryLight); // Vest left
    fillRect(png, 26, 20, 2, 8, pal.primaryLight); // Vest right
    fillRect(png, 20, 28, 8, 2, pal.accent); // Crimson cummerbund sash
    fillRect(png, 23, 28, 2, 2, pal.trim); // Gold sash knot
    fillRect(png, 20, 30, 8, 2, pal.pants);
  } else {
    // Iraq / Scholar robe with embroidered lapels
    fillRect(png, 22, 20, 4, 4, pal.shirt); // Inner tunic
    fillRect(png, 21, 20, 1, 8, pal.accent); // Gold embroidered lapel
    fillRect(png, 26, 20, 1, 8, pal.accent); // Gold embroidered lapel
    fillRect(png, 20, 28, 8, 2, pal.trim); // Palm green belt
    fillRect(png, 20, 30, 8, 2, pal.primaryDark);
  }

  // 4. RIGHT ARM (X=40..56, Y=16..32)
  fillRect(png, 40, 16, 16, 12, pal.primary); // Sleeve
  fillRect(png, 40, 28, 16, 4, pal.skin); // Hand

  // 5. LEFT ARM (X=32..48, Y=48..64)
  fillRect(png, 32, 48, 16, 12, pal.primary); // Sleeve
  fillRect(png, 32, 60, 16, 4, pal.skin); // Hand

  // 6. RIGHT LEG (X=0..16, Y=16..32)
  fillRect(png, 0, 16, 16, 10, pal.pants); // Pants
  fillRect(png, 0, 26, 16, 6, pal.shoes); // Shoes/Boots

  // 7. LEFT LEG (X=16..32, Y=48..64)
  fillRect(png, 16, 48, 16, 10, pal.pants); // Pants
  fillRect(png, 16, 58, 16, 6, pal.shoes); // Shoes/Boots

  return png;
}

// -------------------------------------------------------------
// Canonical Default Items (5 Countries)
// -------------------------------------------------------------
const CANONICAL_DEFAULTS = [
  // Lebanon (LB)
  { country: 'lb', id: 'cedar_wood', color: '#8B4513' },
  { country: 'lb', id: 'cedar_sapling', color: '#2E8B57' },
  { country: 'lb', id: 'zaatar', color: '#556B2F' },
  { country: 'lb', id: 'olive_oil', color: '#808000' },
  { country: 'lb', id: 'olives', color: '#556B2F' },
  { country: 'lb', id: 'pita', color: '#DEB887' },
  { country: 'lb', id: 'flatbread', color: '#D2B48C' },
  { country: 'lb', id: 'pottery', color: '#CD853F' },
  { country: 'lb', id: 'clay_pot', color: '#A0522D' },
  { country: 'lb', id: 'embroidery', color: '#B22222' },
  { country: 'lb', id: 'soap', color: '#F5F5DC' },
  { country: 'lb', id: 'mosaic_tile', color: '#4682B4' },

  // Egypt (EG)
  { country: 'eg', id: 'papyrus', color: '#9ACD32' },
  { country: 'eg', id: 'papyrus_scroll', color: '#F5DEB3' },
  { country: 'eg', id: 'linen', color: '#FAF0E6' },
  { country: 'eg', id: 'sun_stone', color: '#FFD700' },
  { country: 'eg', id: 'turquoise', color: '#40E0D0' },
  { country: 'eg', id: 'koshari', color: '#D2691E' },
  { country: 'eg', id: 'faience', color: '#00CED1' },
  { country: 'eg', id: 'lapis_bead', color: '#1E3F66' },
  { country: 'eg', id: 'clay_brick', color: '#B87333' },
  { country: 'eg', id: 'date_fruit', color: '#5C2C16' },

  // Iraq (IQ)
  { country: 'iq', id: 'clay_tablet', color: '#C19A6B' },
  { country: 'iq', id: 'reed_pen', color: '#8FBC8F' },
  { country: 'iq', id: 'date_palm', color: '#2E8B57' },
  { country: 'iq', id: 'dates', color: '#4A2E18' },
  { country: 'iq', id: 'samoon', color: '#F4A460' },
  { country: 'iq', id: 'lapis', color: '#26619C' },
  { country: 'iq', id: 'copper_ingot', color: '#B87333' },
  { country: 'iq', id: 'copper_ore', color: '#7E4B28' },
  { country: 'iq', id: 'ceramic_tile', color: '#008080' },
  { country: 'iq', id: 'pomegranate', color: '#C71585' },

  // Korea (KR)
  { country: 'kr', id: 'hanji', color: '#FDF5E6' },
  { country: 'kr', id: 'celadon', color: '#7DAA92' },
  { country: 'kr', id: 'celadon_cup', color: '#8FB89E' },
  { country: 'kr', id: 'kimchi', color: '#C0392B' },
  { country: 'kr', id: 'inkstone', color: '#2F4F4F' },
  { country: 'kr', id: 'calligraphy_brush', color: '#8B4513' },
  { country: 'kr', id: 'bamboo', color: '#3CB371' },
  { country: 'kr', id: 'silk_thread', color: '#E6C280' },
  { country: 'kr', id: 'rice_cake', color: '#FFFAFA' },
  { country: 'kr', id: 'bronze_mirror', color: '#CD7F32' },

  // France (FR)
  { country: 'fr', id: 'baguette', color: '#D4A373' },
  { country: 'fr', id: 'lavender', color: '#967BB6' },
  { country: 'fr', id: 'lavender_oil', color: '#7E57C2' },
  { country: 'fr', id: 'fleur_de_sel', color: '#F8F9FA' },
  { country: 'fr', id: 'croissant', color: '#E5A93C' },
  { country: 'fr', id: 'limestone', color: '#E0D7C6' },
  { country: 'fr', id: 'stained_glass', color: '#2980B9' },
  { country: 'fr', id: 'tapestry', color: '#8E44AD' },
  { country: 'fr', id: 'cheese_wheel', color: '#F4D03F' },
  { country: 'fr', id: 'grape_cluster', color: '#5B2C6F' },
];

function main() {
  const itemsMap = new Map();

  // 1. Add canonical defaults
  for (const it of CANONICAL_DEFAULTS) {
    const key = `${it.country}_${it.id}`;
    itemsMap.set(key, { country: it.country, id: it.id, color: it.color });
  }

  // 2. Read packs if present
  if (fs.existsSync(packsDir)) {
    const packFiles = fs.readdirSync(packsDir).filter((f) => f.endsWith('.json'));
    for (const file of packFiles) {
      try {
        const content = fs.readFileSync(path.join(packsDir, file), 'utf8');
        const pack = JSON.parse(content);
        if (pack.country && Array.isArray(pack.items)) {
          const cc_lower = pack.country.toLowerCase();
          for (const item of pack.items) {
            if (item.id && item.color) {
              const key = `${cc_lower}_${item.id}`;
              itemsMap.set(key, { country: cc_lower, id: item.id, color: item.color });
            }
          }
        }
      } catch (err) {
        console.warn(`Could not parse pack file ${file}:`, err.message);
      }
    }
  }

  // 3. Write item textures
  let itemCount = 0;
  for (const item of itemsMap.values()) {
    const cc_lower = item.country.toLowerCase();
    const png = generateItemTexture(item.id, item.color);
    const buf = PNG.sync.write(png);

    const bareId = item.id.startsWith(`${cc_lower}_`) ? item.id.slice(cc_lower.length + 1) : item.id;
    const prefixedId = item.id.startsWith(`${cc_lower}_`) ? item.id : `${cc_lower}_${item.id}`;

    // Write both <cc_lower>_<item.id>.png and <item.id>.png
    fs.writeFileSync(path.join(outItemsDir, `${prefixedId}.png`), buf);
    fs.writeFileSync(path.join(outItemsDir, `${bareId}.png`), buf);
    if (`${cc_lower}_${item.id}` !== prefixedId) {
      fs.writeFileSync(path.join(outItemsDir, `${cc_lower}_${item.id}.png`), buf);
    }
    fs.writeFileSync(path.join(outItemsDir, `${item.id}.png`), buf);

    itemCount++;
  }
  console.log(`Generated textures for ${itemCount} items.`);

  // 4. Write passport.png
  const passportPng = generatePassportTexture();
  fs.writeFileSync(path.join(outItemsDir, 'passport.png'), PNG.sync.write(passportPng));
  console.log('Generated apps/minecraft/rp/textures/items/passport.png');

  // 5. Write 5 mentor entity skins
  const countries = ['lb', 'eg', 'iq', 'kr', 'fr'];
  for (const cc of countries) {
    const mentorPng = generateMentorSkin(cc);
    const mentorPath = path.join(outEntityDir, `mentor_${cc}.png`);
    fs.writeFileSync(mentorPath, PNG.sync.write(mentorPng));
    console.log(`Generated ${mentorPath}`);
  }

  console.log('Texture generation complete.');
}

main();
