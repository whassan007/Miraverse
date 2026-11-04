/**
 * MiraVerse v1.6 — Unified 6-Country Gulf Catalog & SVG Art Generator (`swarm/gulf-v16/gulf-all-countries.mjs`)
 */
import { GULF_COUNTRIES_DATA } from './gulf-master-data.mjs';
import { REMAINING_GULF_COUNTRIES } from './gulf-remaining-countries.mjs';
import { KW_SA_GULF_COUNTRIES } from './gulf-kw-sa.mjs';
import { OMAN_AND_BAHRAIN_COUNTRIES } from './gulf-om-bh.mjs';

export const ALL_GULF_COUNTRIES_V16 = [
  ...GULF_COUNTRIES_DATA,
  ...REMAINING_GULF_COUNTRIES,
  ...KW_SA_GULF_COUNTRIES,
  ...OMAN_AND_BAHRAIN_COUNTRIES,
];

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function renderCountryKeyArtSvg(country) {
  const { countryCode, nameEn, nameAr, storyArcTitleEn, storyArcTitleAr, palette, mentor } = country;
  // Distinct architectural & landscape silhouettes per country
  const motifs = {
    QA: `<path d="M80 480 L340 480 L360 430 L60 430 Z" fill="${palette.secondary}" opacity="0.9"/>
         <path d="M210 210 L210 430 M210 220 L340 380 L210 395 Z" fill="#FFF8EE" stroke="${palette.secondary}" stroke-width="3"/>
         <rect x="620" y="290" width="460" height="190" rx="8" fill="#D6C3A5" stroke="${palette.primary}" stroke-width="4"/>
         <circle cx="850" cy="380" r="36" fill="${palette.primary}" stroke="${palette.secondary}" stroke-width="4"/>`,
    AE: `<rect x="140" y="210" width="110" height="270" fill="#D9B99B" stroke="${palette.secondary}" stroke-width="4"/>
         <line x1="155" y1="220" x2="235" y2="290" stroke="${palette.primary}" stroke-width="4"/>
         <line x1="235" y1="220" x2="155" y2="290" stroke="${palette.primary}" stroke-width="4"/>
         <path d="M640 480 Q780 410 1120 450" stroke="#38BDF8" stroke-width="18" fill="none"/>
         <circle cx="820" cy="310" r="65" fill="#15803D" opacity="0.85"/>
         <rect x="812" y="360" width="16" height="110" fill="#78350F"/>`,
    KW: `<path d="M120 465 L470 465 L520 395 L90 405 Z" fill="#92400E" stroke="${palette.secondary}" stroke-width="4"/>
         <path d="M470 400 L565 355 L550 375 L470 420 Z" fill="${palette.secondary}"/>
         <rect x="680" y="310" width="380" height="165" rx="6" fill="#C2B280" stroke="${palette.primary}" stroke-width="4"/>
         <circle cx="310" cy="240" r="32" fill="#FDE047" opacity="0.8"/>`,
    SA: `<path d="M0 470 Q320 370 640 450 T1280 430 L1280 560 L0 560 Z" fill="#B45309" opacity="0.75"/>
         <rect x="440" y="250" width="420" height="210" rx="12" fill="#C28E5C" stroke="${palette.secondary}" stroke-width="4"/>
         <polygon points="440,250 470,220 500,250 530,220 560,250 590,220 620,250 650,220 680,250 710,220 740,250 770,220 800,250 830,220 860,250" fill="${palette.secondary}"/>`,
    OM: `<polygon points="60,480 280,190 520,480" fill="#3F6212" opacity="0.8"/>
         <polygon points="360,480 620,160 880,480" fill="#14532D" opacity="0.85"/>
         <path d="M260 360 Q540 410 1080 465" stroke="#38BDF8" stroke-width="22" fill="none"/>
         <rect x="740" y="310" width="320" height="150" rx="10" fill="#D6C7B2" stroke="${palette.secondary}" stroke-width="4"/>`,
    BH: `<rect x="110" y="360" width="430" height="115" fill="#A16207" stroke="${palette.secondary}" stroke-width="3"/>
         <rect x="145" y="285" width="360" height="75" fill="#CA8A04" stroke="${palette.secondary}" stroke-width="3"/>
         <circle cx="325" cy="220" r="48" fill="${palette.secondary}" stroke="${palette.primary}" stroke-width="5"/>
         <rect x="700" y="275" width="410" height="195" rx="8" fill="#E2E8F0" stroke="${palette.primary}" stroke-width="4"/>`,
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720" role="img" aria-label="${escapeXml(nameEn)} — ${escapeXml(storyArcTitleEn)}">
  <defs>
    <linearGradient id="bg-${countryCode}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.surfaceBg}"/>
      <stop offset="55%" stop-color="${palette.primary}"/>
      <stop offset="100%" stop-color="${palette.accent}"/>
    </linearGradient>
    <radialGradient id="glow-${countryCode}" cx="75%" cy="22%" r="45%">
      <stop offset="0%" stop-color="${palette.secondary}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${palette.secondary}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg-${countryCode})"/>
  <rect width="1280" height="720" fill="url(#glow-${countryCode})"/>
  <rect x="24" y="24" width="1232" height="672" rx="24" fill="none" stroke="${palette.secondary}" stroke-width="3" opacity="0.75"/>
  ${motifs[countryCode] || ''}
  <rect x="0" y="475" width="1280" height="245" fill="#09111E" opacity="0.84"/>
  <text x="64" y="100" fill="${palette.secondary}" font-family="Georgia, serif" font-size="22" font-weight="bold">عالم يرا · Mira's World — Gulf Diaspora Expansion v1.6 (${country.stableId})</text>
  <text x="64" y="158" fill="#FFF8EE" font-family="Georgia, serif" font-size="46" font-weight="bold">${escapeXml(nameEn)} (${countryCode}) — ${escapeXml(storyArcTitleEn)}</text>
  <text x="64" y="208" fill="#FDE68A" font-family="sans-serif" font-size="30" font-weight="bold">${escapeXml(nameAr)} — ${escapeXml(storyArcTitleAr)}</text>
  <text x="64" y="545" fill="#E2E8F0" font-family="sans-serif" font-size="22">Mentor: ${escapeXml(mentor.nameEn)} · Dialect: ${country.dialectCode}</text>
  <text x="64" y="585" fill="#94A3B8" font-family="sans-serif" font-size="18">${escapeXml(country.settingSummaryEn.slice(0, 118))}...</text>
  <text x="64" y="640" fill="${palette.secondary}" font-family="monospace" font-size="17">5 Canonical Acts × 4 Age Tracks (5–7, 8–10, 11–13, 14–17) · العربية / Arabizi / English</text>
</svg>\n`;
}

export function renderQuestMapSvg(country, act = null) {
  const { countryCode, nameEn, nameAr, palette, questActs } = country;
  const title = act ? `Act ${act.actNumber}: ${act.titleEn}` : `${nameEn} (${countryCode}) — 5-Act Illustrated Adventure Map`;
  const subtitleAr = act ? `الفصل ${act.actNumber}: ${act.titleAr}` : `خريطة المغامرة المرسومة — ${nameAr} (ليست خريطة أقمار صناعية)`;

  const nodesSvg = questActs
    .map((qa) => {
      const cx = Math.round((qa.mapCheckpoint.markerXPercent / 100) * 1000) + 100;
      const cy = Math.round((qa.mapCheckpoint.markerYPercent / 100) * 420) + 140;
      const isCurrent = act && act.actNumber === qa.actNumber;
      const r = isCurrent ? 30 : 22;
      const fill = isCurrent ? palette.secondary : palette.primary;
      return `<g transform="translate(${cx},${cy})">
        <circle r="${r + 6}" fill="${palette.secondary}" opacity="${isCurrent ? '0.45' : '0.18'}"/>
        <circle r="${r}" fill="${fill}" stroke="#FFF8EE" stroke-width="3"/>
        <text y="6" text-anchor="middle" fill="${isCurrent ? '#0F172A' : '#FFF8EE'}" font-family="sans-serif" font-size="16" font-weight="bold">${qa.actNumber}</text>
        <rect x="-95" y="${r + 10}" width="190" height="30" rx="8" fill="#0F172A" stroke="${palette.secondary}" stroke-width="1.5"/>
        <text y="${r + 30}" text-anchor="middle" fill="#FFF8EE" font-family="sans-serif" font-size="12" font-weight="bold">${escapeXml(qa.titleEn)}</text>
      </g>`;
    })
    .join('\n');

  const pathPoints = questActs
    .map((qa) => {
      const cx = Math.round((qa.mapCheckpoint.markerXPercent / 100) * 1000) + 100;
      const cy = Math.round((qa.mapCheckpoint.markerYPercent / 100) * 420) + 140;
      return `${cx},${cy}`;
    })
    .join(' ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" width="1200" height="700" role="img" aria-label="${escapeXml(title)}">
  <rect width="1200" height="700" fill="#0B1325"/>
  <rect x="24" y="24" width="1152" height="652" rx="22" fill="${palette.surfaceBg}" stroke="${palette.secondary}" stroke-width="3"/>
  <path d="M80 520 Q360 390 640 470 T1120 380" fill="none" stroke="${palette.accent}" stroke-width="28" opacity="0.25"/>
  <polyline points="${pathPoints}" fill="none" stroke="${palette.secondary}" stroke-width="5" stroke-dasharray="12 8"/>
  ${nodesSvg}
  <rect x="48" y="44" width="1104" height="86" rx="14" fill="#09111E" opacity="0.9" stroke="${palette.secondary}" stroke-width="1.5"/>
  <text x="72" y="80" fill="#FFF8EE" font-family="Georgia, serif" font-size="24" font-weight="bold">${escapeXml(title)}</text>
  <text x="72" y="112" fill="${palette.secondary}" font-family="sans-serif" font-size="18">${escapeXml(subtitleAr)} · Illustrated Game Quest Map (Not to Geographic Survey Scale)</text>
  <rect x="48" y="608" width="1104" height="46" rx="10" fill="#09111E" opacity="0.9"/>
  <text x="72" y="636" fill="#CBD5E1" font-family="sans-serif" font-size="14">Legend: [1] Gather · [2] Trade · [3] Build · [4] Story/Cook · [5] Word &amp; Cultural Finale · Stable ID: ${act ? act.id : country.stableId}</text>
</svg>\n`;
}

export function renderMentorPortraitSvg(country) {
  const { countryCode, palette, mentor } = country;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${escapeXml(mentor.nameEn)}">
  <rect width="400" height="400" rx="36" fill="${palette.surfaceBg}" stroke="${palette.secondary}" stroke-width="6"/>
  <circle cx="200" cy="175" r="110" fill="${palette.primary}" opacity="0.35"/>
  <path d="M110 330 Q200 245 290 330 L310 380 L90 380 Z" fill="${palette.primary}" stroke="${palette.secondary}" stroke-width="4"/>
  <circle cx="200" cy="155" r="56" fill="#F3C69F" stroke="${palette.secondary}" stroke-width="3"/>
  <path d="M135 145 Q200 75 265 145" fill="none" stroke="${palette.secondary}" stroke-width="10" stroke-linecap="round"/>
  <circle cx="182" cy="150" r="5" fill="#1E293B"/>
  <circle cx="218" cy="150" r="5" fill="#1E293B"/>
  <path d="M184 174 Q200 186 216 174" fill="none" stroke="#7C2D12" stroke-width="3.5" stroke-linecap="round"/>
  <rect x="24" y="318" width="352" height="62" rx="12" fill="#09111E" opacity="0.92" stroke="${palette.secondary}" stroke-width="2"/>
  <text x="200" y="344" text-anchor="middle" fill="#FFF8EE" font-family="Georgia, serif" font-size="15" font-weight="bold">${escapeXml(mentor.nameEn)}</text>
  <text x="200" y="368" text-anchor="middle" fill="${palette.secondary}" font-family="sans-serif" font-size="13">${escapeXml(mentor.nameAr)} · ${countryCode}</text>
</svg>\n`;
}

export function renderPassportStampSvg(country) {
  const { countryCode, nameEn, nameAr, palette, storyArcTitleEn } = country;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320" role="img" aria-label="Passport Stamp ${escapeXml(nameEn)}">
  <rect x="14" y="14" width="292" height="292" rx="24" fill="${palette.surfaceBg}" stroke="${palette.secondary}" stroke-width="6" stroke-dasharray="10 6"/>
  <circle cx="160" cy="160" r="118" fill="none" stroke="${palette.primary}" stroke-width="6"/>
  <circle cx="160" cy="160" r="98" fill="${palette.primary}" opacity="0.22" stroke="${palette.secondary}" stroke-width="2"/>
  <text x="160" y="96" text-anchor="middle" fill="${palette.secondary}" font-family="monospace" font-size="15" font-weight="bold">عالم يرا · MIRA'S WORLD</text>
  <text x="160" y="145" text-anchor="middle" fill="#FFF8EE" font-family="Georgia, serif" font-size="38" font-weight="bold">${countryCode}</text>
  <text x="160" y="180" text-anchor="middle" fill="#FDE68A" font-family="sans-serif" font-size="22" font-weight="bold">${escapeXml(nameAr)}</text>
  <text x="160" y="210" text-anchor="middle" fill="#FFF8EE" font-family="Georgia, serif" font-size="16">${escapeXml(nameEn)}</text>
  <text x="160" y="236" text-anchor="middle" fill="#CBD5E1" font-family="sans-serif" font-size="11">${escapeXml(storyArcTitleEn)}</text>
</svg>\n`;
}

export function renderArtifactSvg(country, artifact) {
  const { palette } = country;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 300" width="420" height="300" role="img" aria-label="${escapeXml(artifact.nameEn)}">
  <rect width="420" height="300" rx="20" fill="${palette.surfaceBg}" stroke="${palette.secondary}" stroke-width="4"/>
  <circle cx="210" cy="122" r="64" fill="${palette.primary}" opacity="0.4" stroke="${palette.secondary}" stroke-width="3"/>
  <polygon points="210,68 254,122 210,176 166,122" fill="${palette.secondary}" opacity="0.85" stroke="#FFF8EE" stroke-width="2"/>
  <rect x="20" y="200" width="380" height="80" rx="12" fill="#09111E" opacity="0.92"/>
  <text x="210" y="228" text-anchor="middle" fill="#FFF8EE" font-family="Georgia, serif" font-size="15" font-weight="bold">${escapeXml(artifact.nameEn.slice(0, 44))}</text>
  <text x="210" y="252" text-anchor="middle" fill="${palette.secondary}" font-family="sans-serif" font-size="14">${escapeXml(artifact.nameAr.slice(0, 46))}</text>
  <text x="210" y="272" text-anchor="middle" fill="#94A3B8" font-family="monospace" font-size="11">${escapeXml(artifact.id)} · ${escapeXml(artifact.category.toUpperCase())}</text>
</svg>\n`;
}
