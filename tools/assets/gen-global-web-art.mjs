/**
 * Generate local SVG art assets for the 6 global expansion countries (DE, CN, JP, RU, UA, MA)
 * so every <img> on /, /explore, /explore/:country, /atlas, /quests, /characters, and /passport
 * loads locally with naturalWidth > 0 and zero external network requests.
 */
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve(process.cwd(), 'apps/web/public/art/global');
fs.mkdirSync(outDir, { recursive: true });

const COUNTRIES = [
  {
    code: 'DE',
    order: 6,
    name: 'Germany',
    city: 'Rhine Valley and Lorelei',
    native: 'Deutschland · Mittelrhein',
    subtitle: 'The Song and the Healing Question',
    mentor: 'Klara and Lukas',
    mentorRole: 'River Navigator and Heritage Historian',
    stampLabel: 'RHINE AND GRAIL',
    bg1: '#0F2537',
    bg2: '#1E3A5F',
    accent: '#D4AC4C',
    secondary: '#5E8098',
    highlight: '#FDE68A',
    iconSvg: `
      <path d="M120 260 Q320 200 520 250 T800 220 L800 500 L0 500 L0 280 Z" fill="#1E4E68" opacity="0.85"/>
      <polygon points="560,110 610,45 660,110 660,235 560,235" fill="#334155" stroke="#D4AC4C" stroke-width="3"/>
      <rect x="580" y="130" width="22" height="40" rx="11" fill="#FDE68A"/>
      <rect x="618" y="130" width="22" height="40" rx="11" fill="#FDE68A"/>
      <polygon points="180,150 230,95 280,150 280,255 180,255" fill="#475569" stroke="#FDE68A" stroke-width="2.5"/>
      <circle cx="400" cy="120" r="42" fill="#FDE68A" opacity="0.25"/>
      <circle cx="400" cy="120" r="26" fill="#FDE68A" opacity="0.75"/>
    `,
  },
  {
    code: 'CN',
    order: 7,
    name: 'China',
    city: 'Peach Blossom Valley (Wuling)',
    native: '中国 · 桃花源',
    subtitle: 'The Valley Beyond the Blossoms',
    mentor: 'Elder Lin and Mei',
    mentorRole: 'Valley Storykeeper and Orchard Steward',
    stampLabel: 'PEACH SPRING',
    bg1: '#23192D',
    bg2: '#3B234A',
    accent: '#F472B6',
    secondary: '#448E6C',
    highlight: '#FBCFE8',
    iconSvg: `
      <path d="M0 320 Q240 240 460 310 T800 280 L800 500 L0 500 Z" fill="#1E3F3B" opacity="0.9"/>
      <path d="M220 330 Q400 240 580 330" fill="none" stroke="#FBCFE8" stroke-width="10"/>
      <polygon points="330,170 400,125 470,170 450,178 350,178" fill="#E11D48" stroke="#FDE68A" stroke-width="2.5"/>
      <rect x="355" y="178" width="90" height="75" fill="#FFF1F2" stroke="#475569" stroke-width="3"/>
      <circle cx="190" cy="160" r="48" fill="#F472B6" opacity="0.65"/>
      <circle cx="240" cy="140" r="36" fill="#FBCFE8" opacity="0.75"/>
      <circle cx="620" cy="120" r="38" fill="#FEF08A" opacity="0.85"/>
    `,
  },
  {
    code: 'JP',
    order: 8,
    name: 'Japan',
    city: 'Michinoku Waystations (Tohoku)',
    native: '日本 · みちのくの旅路',
    subtitle: 'The Narrow Road Home',
    mentor: 'Haruka and Poet Aoi',
    mentorRole: 'Waystation Guide and Haiku Chronicler',
    stampLabel: 'NARROW ROAD',
    bg1: '#142824',
    bg2: '#1F3A33',
    accent: '#FB7185',
    secondary: '#769A84',
    highlight: '#FECDD3',
    iconSvg: `
      <polygon points="400,85 570,290 230,290" fill="#334155" stroke="#E2E8F0" stroke-width="3"/>
      <polygon points="400,85 455,160 345,160" fill="#F8FAFC"/>
      <rect x="170" y="180" width="140" height="14" rx="6" fill="#E11D48"/>
      <rect x="185" y="205" width="110" height="10" rx="4" fill="#E11D48"/>
      <rect x="198" y="190" width="12" height="110" fill="#E11D48"/>
      <rect x="270" y="190" width="12" height="110" fill="#E11D48"/>
      <path d="M0 320 Q360 270 800 330 L800 500 L0 500 Z" fill="#0F2922"/>
      <circle cx="630" cy="130" r="42" fill="#FDA4AF" opacity="0.8"/>
    `,
  },
  {
    code: 'RU',
    order: 9,
    name: 'Russia',
    city: 'Lake Svetloyar and Northern Pines',
    native: 'Россия · Озеро Светлояр',
    subtitle: 'The Bells Beneath the Lake',
    mentor: 'Yelena and Pavel',
    mentorRole: 'Lake Storykeeper and Oral Tradition Historian',
    stampLabel: 'LAKE SVETLOYAR',
    bg1: '#102338',
    bg2: '#1E3A5F',
    accent: '#F59E0B',
    secondary: '#5686A8',
    highlight: '#FDE68A',
    iconSvg: `
      <rect x="0" y="290" width="800" height="210" fill="#0C4A6E"/>
      <polygon points="360,155 400,90 440,155 428,285 372,285" fill="#92400E" stroke="#FDE68A" stroke-width="3"/>
      <circle cx="400" cy="82" r="18" fill="#F59E0B"/>
      <polygon points="140,160 185,285 95,285" fill="#065F46"/>
      <polygon points="210,145 255,285 165,285" fill="#047857"/>
      <polygon points="590,150 635,285 545,285" fill="#047857"/>
      <ellipse cx="400" cy="350" rx="180" ry="26" fill="none" stroke="#7DD3FC" stroke-width="3" stroke-dasharray="8 6"/>
    `,
  },
  {
    code: 'UA',
    order: 10,
    name: 'Ukraine',
    city: 'Kyiv Hills and Dnipro Music Square',
    native: 'Україна · Київські пагорби',
    subtitle: 'The Guardian of Songs',
    mentor: 'Lybid and Kobzar Mykola',
    mentorRole: 'Hilltop Guide and Bandura Luthier',
    stampLabel: 'KYIV SONG HILLS',
    bg1: '#0F2547',
    bg2: '#1D4ED8',
    accent: '#FACC15',
    secondary: '#38BDF8',
    highlight: '#FEF08A',
    iconSvg: `
      <path d="M0 300 Q260 210 520 285 T800 260 L800 500 L0 500 Z" fill="#1E3A8A"/>
      <circle cx="200" cy="230" r="36" fill="#FACC15" stroke="#78350F" stroke-width="6"/>
      <circle cx="270" cy="245" r="30" fill="#FACC15" stroke="#78350F" stroke-width="5"/>
      <polygon points="480,150 515,95 550,150 550,275 480,275" fill="#F8FAFC" stroke="#FACC15" stroke-width="3"/>
      <circle cx="515" cy="86" r="16" fill="#FACC15"/>
      <ellipse cx="380" cy="215" rx="28" ry="42" fill="#B45309" stroke="#FEF08A" stroke-width="3"/>
    `,
  },
  {
    code: 'MA',
    order: 11,
    name: 'Morocco',
    city: 'Marrakesh Medina and Riad Courtyard',
    native: 'المغرب · مراكش',
    subtitle: 'The Living Circle',
    mentor: 'Hakawati Driss and Kenza',
    mentorRole: 'Master Storyteller and Mint Garden Host',
    stampLabel: 'MARRAKESH CIRCLE',
    bg1: '#3B1812',
    bg2: '#7C2D12',
    accent: '#14B8A6',
    secondary: '#F59E0B',
    highlight: '#99F6E4',
    iconSvg: `
      <rect x="0" y="290" width="800" height="210" fill="#431407"/>
      <path d="M290 290 L290 175 A110 110 0 0 1 510 175 L510 290 Z" fill="#0F766E" stroke="#F59E0B" stroke-width="5"/>
      <circle cx="400" cy="185" r="46" fill="none" stroke="#FDE68A" stroke-width="4" stroke-dasharray="10 6"/>
      <polygon points="150,115 195,115 195,290 150,290" fill="#C2410C" stroke="#FDE68A" stroke-width="3"/>
      <circle cx="172" cy="98" r="14" fill="#FBBF24"/>
      <circle cx="620" cy="150" r="38" fill="#F59E0B" opacity="0.8"/>
    `,
  },
];

for (const c of COUNTRIES) {
  // 1. World Cover Art SVG (800x500)
  const coverSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500" role="img" aria-label="${c.order}. ${c.name}: ${c.city}">
  <defs>
    <linearGradient id="bg-${c.code}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.bg1}"/>
      <stop offset="100%" stop-color="${c.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bg-${c.code})"/>
  ${c.iconSvg}
  <rect x="28" y="24" width="744" height="452" rx="22" fill="none" stroke="${c.accent}" stroke-width="3" opacity="0.75"/>
  <rect x="44" y="330" width="712" height="126" rx="16" fill="#091224" opacity="0.88" stroke="${c.accent}" stroke-width="2"/>
  <text x="68" y="368" fill="${c.highlight}" font-family="system-ui, sans-serif" font-size="15" font-weight="800" letter-spacing="1.2">DESTINATION #${c.order} OF 11 · ECHOES OF HOME</text>
  <text x="68" y="404" fill="#FFF8EE" font-family="Georgia, serif" font-size="30" font-weight="900">${c.order}. ${c.name}: ${c.city}</text>
  <text x="68" y="436" fill="#CBD5E1" font-family="system-ui, sans-serif" font-size="18" font-weight="700">${c.native} — ${c.subtitle}</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, `world-cover-${c.code}.svg`), coverSvg, 'utf8');

  // 2. Mentor Portrait SVG (240x240)
  const portraitSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240" role="img" aria-label="${c.mentor} Portrait">
  <circle cx="120" cy="120" r="116" fill="${c.bg2}" stroke="${c.accent}" stroke-width="6"/>
  <circle cx="120" cy="92" r="42" fill="#FDE68A" stroke="#FFF8EE" stroke-width="3"/>
  <path d="M56 204 C62 152 178 152 184 204 Z" fill="${c.accent}" stroke="#FFF8EE" stroke-width="3"/>
  <rect x="28" y="182" width="184" height="34" rx="17" fill="#0B1325" stroke="${c.accent}" stroke-width="2"/>
  <text x="120" y="204" text-anchor="middle" fill="#FFF8EE" font-family="system-ui, sans-serif" font-size="13" font-weight="800">${c.mentor}</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, `portrait-mentor-${c.code}.svg`), portraitSvg, 'utf8');

  // 3. Quest Map SVG (800x450)
  const questMapSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" role="img" aria-label="${c.name} Illustrated Adventure Quest Map">
  <rect width="800" height="450" fill="${c.bg1}"/>
  <rect x="20" y="20" width="760" height="410" rx="18" fill="${c.bg2}" stroke="${c.accent}" stroke-width="3" stroke-dasharray="10 6"/>
  <path d="M90 340 C220 180 340 360 480 210 C580 120 650 260 720 140" fill="none" stroke="${c.highlight}" stroke-width="6" stroke-dasharray="12 8"/>
  <circle cx="90" cy="340" r="16" fill="#38BDF8" stroke="#FFF8EE" stroke-width="3"/>
  <circle cx="290" cy="265" r="16" fill="${c.accent}" stroke="#FFF8EE" stroke-width="3"/>
  <circle cx="480" cy="210" r="16" fill="#10B981" stroke="#FFF8EE" stroke-width="3"/>
  <circle cx="720" cy="140" r="18" fill="#F59E0B" stroke="#FFF8EE" stroke-width="3"/>
  <text x="48" y="64" fill="#FFF8EE" font-family="Georgia, serif" font-size="24" font-weight="900">${c.order}. ${c.name} (${c.city}) — 6-Chapter Adventure Map</text>
  <text x="48" y="94" fill="${c.highlight}" font-family="system-ui, sans-serif" font-size="15" font-weight="700">${c.subtitle} · 6 Sequential Quests × 4 Age Tracks</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, `quest-map-${c.code}.svg`), questMapSvg, 'utf8');

  // 4. Collectible Stamp SVG (200x200)
  const stampSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200" role="img" aria-label="${c.name} Collectible Passport Stamp">
  <rect x="14" y="14" width="172" height="172" rx="18" fill="${c.bg2}" stroke="${c.accent}" stroke-width="5" stroke-dasharray="8 6"/>
  <rect x="24" y="24" width="152" height="152" rx="12" fill="none" stroke="#FFF8EE" stroke-width="2" opacity="0.65"/>
  <circle cx="100" cy="84" r="42" fill="${c.bg1}" stroke="${c.accent}" stroke-width="3"/>
  <text x="100" y="94" text-anchor="middle" fill="${c.highlight}" font-family="Georgia, serif" font-size="28" font-weight="900">${c.code}</text>
  <text x="100" y="146" text-anchor="middle" fill="#FFF8EE" font-family="Georgia, serif" font-size="13" font-weight="900" letter-spacing="1">${c.stampLabel}</text>
  <text x="100" y="164" text-anchor="middle" fill="${c.highlight}" font-family="system-ui, sans-serif" font-size="11" font-weight="700">${c.native}</text>
  <text x="100" y="38" text-anchor="middle" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="9" font-weight="800" letter-spacing="1.2">ATLAS OF BELONGING · #${c.order}</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, `stamp-${c.code}.svg`), stampSvg, 'utf8');
}

console.log('Generated 24 SVG art files in apps/web/public/art/global');
