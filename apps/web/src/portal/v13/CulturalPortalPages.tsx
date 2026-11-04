/**
 * MiraVerse v1.3 (`CX03`, `CX04`, `P3`, `P4`) — Interactive World Atlas (`/atlas`) & Quest Encyclopedia (`/quests`, `/quests/:questId`)
 * - Two strictly separated map systems on `/atlas`:
 *   1. Geographic Atlas: Verified WGS84 real-world coordinates, 20 landmark pins, historical context, educational citations, and map attribution.
 *   2. Illustrated Adventure Maps: 25 fictional gameplay quest maps (5 countries × 5 acts) with NPCs, waypoints, supplies, and rewards.
 * - Quest Encyclopedia (`/quests` & `/quests/:questId`):
 *   - 25 cultural quests × 4 age tracks (`5-7`, `8-10`, `11-13`, `14-17`) = 100 age-adapted quest stages.
 */
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { CountryCode } from '../../../../../packages/contracts/index';
import { CulturalEncyclopediaSectionV12 } from '../../features/encyclopedia-v12/CulturalEncyclopediaSectionV12';
import {
  EPISTEMIC_BADGE_LABELS,
  V13_AGE_TIERS,
  V13_COUNTRIES_ORDERED,
  V13_COUNTRY_EXPERIENCES,
  V13_QUEST_ENCYCLOPEDIA,
  type AgeTierId,
} from '../../../../../packages/contracts/v13/index';
import {
  GLOBAL_CHAPTERS_CATALOG,
  GLOBAL_COUNTRIES_CATALOG,
  GLOBAL_COUNTRIES_ORDERED,
  GLOBAL_COUNTRY_MAP,
  isCoreCountryCode,
  type GlobalCountryCode,
} from '../../lib/globalCatalog';

function formatCoord(lat: number, lng: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${ns}, ${Math.abs(lng).toFixed(4)}°${ew}`;
}

function projectWgs84ToPercent(lat: number, lng: number): { x: number; y: number } {
  const x = Math.min(94, Math.max(6, ((lng - -10) / (140 - -10)) * 100));
  const y = Math.min(90, Math.max(10, ((55 - lat) / (55 - 18)) * 100));
  return { x, y };
}

export const InteractiveWorldAtlasPage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<GlobalCountryCode>('LB');
  const [selectedAct, setSelectedAct] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedGlobalIdx, setSelectedGlobalIdx] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [activeMapSystem, setActiveMapSystem] = useState<'BOTH' | 'GEOGRAPHIC' | 'ADVENTURE'>('BOTH');

  const isCore = isCoreCountryCode(selectedCountry);
  const globalMeta = GLOBAL_COUNTRY_MAP[selectedCountry];
  const countryExp = isCore ? V13_COUNTRY_EXPERIENCES[selectedCountry as CountryCode] : undefined;
  const countryQuests = isCore
    ? V13_QUEST_ENCYCLOPEDIA.filter((q) => q.country === selectedCountry)
    : V13_QUEST_ENCYCLOPEDIA.filter((q) => q.country === 'LB');
  const activeQuest = countryQuests.find((q) => q.actNumber === selectedAct) ?? countryQuests[0];
  const primaryNpc = activeQuest.npcs[0] ?? { name: 'Community Mentor', role: 'Cultural Guide' };
  const globalChapters = GLOBAL_CHAPTERS_CATALOG.filter((ch) => ch.countryCode === selectedCountry);
  const activeGlobalChapter = globalChapters.find((ch) => ch.chapterIndex === selectedGlobalIdx) ?? globalChapters[0];
  const activeLandmarks = isCore && countryExp ? countryExp.landmarks : globalMeta.landmarks;

  return (
    <div
      data-testid="v13-interactive-atlas-page"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #071020 0%, #0F172A 50%, #071020 100%)',
        color: '#FFF8EE',
        padding: '32px clamp(16px, 4vw, 48px) 72px',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <header style={{ marginBottom: '24px' }}>
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(56, 189, 248, 0.16)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              color: '#7DD3FC',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '8px',
            }}
          >
            MiraVerse v1.3 Interactive World Atlas · Dual Cartographic System
          </span>
          <h1
            style={{
              margin: '0 0 8px 0',
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 44px)',
            }}
          >
            Interactive World Atlas: Real-World Geography &amp; Illustrated Quest Maps
          </h1>
          <p style={{ margin: 0, color: '#CBD5E1', fontSize: '15px', maxWidth: '840px', lineHeight: 1.6 }}>
            MiraVerse separates verified <strong>Real-World Geographic Survey Coordinates (WGS84)</strong> from{' '}
            <strong>Illustrated Adventure Quest Maps</strong>. Fictional gameplay checkpoints are never positioned as real-world geographic survey pins.
          </p>
        </header>

        {/* Country Selector (Exact v1.3 Order: LB, IQ, EG, FR, KR) + Map System Filter */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '24px',
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '14px 18px',
            borderRadius: '18px',
            border: '1px solid rgba(255, 248, 238, 0.14)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {GLOBAL_COUNTRIES_ORDERED.map((cc) => {
              const g = GLOBAL_COUNTRY_MAP[cc];
              const active = cc === selectedCountry;
              return (
                <button
                  key={cc}
                  type="button"
                  data-testid={`atlas-country-btn-${cc}`}
                  onClick={() => setSelectedCountry(cc)}
                  style={{
                    background: active ? '#F4A261' : 'rgba(30, 41, 59, 0.9)',
                    color: active ? '#0B1325' : '#FFF8EE',
                    border: active ? '1px solid #F4A261' : '1px solid rgba(255,248,238,0.2)',
                    borderRadius: '999px',
                    padding: '8px 15px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {g.order}. {g.name}: {g.city}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['BOTH', 'GEOGRAPHIC', 'ADVENTURE'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                data-testid={`atlas-mode-${mode}`}
                onClick={() => setActiveMapSystem(mode)}
                style={{
                  background: activeMapSystem === mode ? '#38BDF8' : 'rgba(30, 41, 59, 0.9)',
                  color: activeMapSystem === mode ? '#082F49' : '#CBD5E1',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                  borderRadius: '999px',
                  padding: '6px 13px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {mode === 'BOTH'
                  ? 'Show Both Map Systems'
                  : mode === 'GEOGRAPHIC'
                    ? '1. Geographic Atlas Only'
                    : '2. Adventure Quest Maps Only'}
              </button>
            ))}
          </div>
        </div>

        {/* SYSTEM 1: Real-World Geographic Atlas */}
        {(activeMapSystem === 'BOTH' || activeMapSystem === 'GEOGRAPHIC') && (
          <section
            data-testid="geographic-atlas-system"
            aria-label="System 1: Real-World Geographic Atlas"
            style={{
              background: 'rgba(15, 23, 42, 0.94)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              borderRadius: '22px',
              padding: 'clamp(18px, 3vw, 28px)',
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '18px',
              }}
            >
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    background: 'rgba(56, 189, 248, 0.18)',
                    border: '1px solid #38BDF8',
                    color: '#BAE6FD',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                    marginBottom: '6px',
                  }}
                >
                  Map System 1 · Verified Real-World WGS84 Coordinates
                </span>
                <h2 style={{ margin: 0, fontSize: '24px', fontFamily: 'Georgia, serif' }}>
                  Geographic Survey Atlas — {globalMeta.name}: {globalMeta.city} (
                  {formatCoord(globalMeta.coordinatesCenter[0], globalMeta.coordinatesCenter[1])})
                </h2>
              </div>
              <div
                data-testid="geographic-atlas-attribution"
                style={{
                  fontSize: '12px',
                  color: '#94A3B8',
                  background: 'rgba(9, 18, 36, 0.85)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                }}
              >
                Attribution: WGS84 Geodesic Survey · UNESCO World Heritage &amp; OpenStreetMap Contributors
              </div>
            </div>

            {/* Interactive SVG World Coordinate Projection Map */}
            <div
              style={{
                background: '#06101E',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
              }}
            >
              <svg
                viewBox="0 0 1000 360"
                role="img"
                aria-label="WGS84 Coordinate Projection of the Five MiraVerse Cultural Destinations"
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '10px', background: '#08172E' }}
              >
                {[60, 120, 180, 240, 300].map((y) => (
                  <line
                    key={`lat-${y}`}
                    x1={0}
                    y1={y}
                    x2={1000}
                    y2={y}
                    stroke="rgba(148, 163, 184, 0.16)"
                    strokeDasharray="4 4"
                  />
                ))}
                {[150, 300, 450, 600, 750, 900].map((x) => (
                  <line
                    key={`lng-${x}`}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={360}
                    stroke="rgba(148, 163, 184, 0.16)"
                    strokeDasharray="4 4"
                  />
                ))}

                <polyline
                  fill="none"
                  stroke="rgba(244, 162, 97, 0.55)"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  points={GLOBAL_COUNTRIES_ORDERED.map((cc) => {
                    const c = GLOBAL_COUNTRY_MAP[cc].coordinatesCenter;
                    const p = projectWgs84ToPercent(c[0], c[1]);
                    return `${(p.x * 10).toFixed(1)},${(p.y * 3.6).toFixed(1)}`;
                  }).join(' ')}
                />

                {GLOBAL_COUNTRIES_ORDERED.map((cc) => {
                  const g = GLOBAL_COUNTRY_MAP[cc];
                  const p = projectWgs84ToPercent(g.coordinatesCenter[0], g.coordinatesCenter[1]);
                  const cx = p.x * 10;
                  const cy = p.y * 3.6;
                  const isActive = cc === selectedCountry;
                  return (
                    <g
                      key={cc}
                      onClick={() => setSelectedCountry(cc)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isActive ? 13 : 9}
                        fill={isActive ? '#F4A261' : '#38BDF8'}
                        stroke="#FFF8EE"
                        strokeWidth={2.5}
                      />
                      <text
                        x={cx}
                        y={cy - 16}
                        textAnchor="middle"
                        fill={isActive ? '#FFE29F' : '#E2E8F0'}
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {g.order}. {g.name} ({cc})
                      </text>
                      <text
                        x={cx}
                        y={cy + 24}
                        textAnchor="middle"
                        fill="#93C5FD"
                        fontSize="10"
                      >
                        {formatCoord(g.coordinatesCenter[0], g.coordinatesCenter[1])}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Verified Landmarks for Selected Country */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '14px',
              }}
            >
              {activeLandmarks.map((lm) => (
                <article
                  key={lm.landmarkId}
                  data-testid={`geographic-landmark-${lm.landmarkId}`}
                  style={{
                    background: 'rgba(9, 18, 36, 0.9)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '14px',
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#7DD3FC',
                        fontFamily: 'monospace',
                      }}
                    >
                      {formatCoord(lm.coordinates[0], lm.coordinates[1])}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: '#FDE68A',
                        background: 'rgba(245, 158, 11, 0.16)',
                        padding: '2px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      {EPISTEMIC_BADGE_LABELS[lm.classification]}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#FFF8EE' }}>
                    {lm.name} ({lm.nativeName})
                  </h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.55 }}>
                    {lm.summary}
                  </p>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                    <strong>Reference:</strong> {lm.educationalReference}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* SYSTEM 2: Illustrated Adventure Maps (25 Fictional Quest Maps: 5 Countries × 5 Acts) */}
        {(activeMapSystem === 'BOTH' || activeMapSystem === 'ADVENTURE') && (
          <section
            data-testid="adventure-maps-system"
            aria-label="System 2: Illustrated Adventure Quest Maps"
            style={{
              background: 'rgba(15, 23, 42, 0.94)',
              border: '1px solid rgba(244, 162, 97, 0.45)',
              borderRadius: '22px',
              padding: 'clamp(18px, 3vw, 28px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
                marginBottom: '18px',
              }}
            >
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    background: 'rgba(244, 162, 97, 0.2)',
                    border: '1px solid #F4A261',
                    color: '#FFE29F',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                    marginBottom: '6px',
                  }}
                >
                  Map System 2 · 25 Illustrated Adventure Quest Maps (Fictional Gameplay Geography)
                </span>
                <h2 style={{ margin: 0, fontSize: '24px', fontFamily: 'Georgia, serif' }}>
                  {activeQuest.questMapZoneLabel} — {activeQuest.titleEn}
                </h2>
              </div>

              {/* Act 1..5 Selector for Selected Country */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {countryQuests.map((q) => (
                  <button
                    key={q.questId}
                    type="button"
                    data-testid={`atlas-adventure-act-${q.actNumber}`}
                    onClick={() => setSelectedAct(q.actNumber)}
                    style={{
                      background: selectedAct === q.actNumber ? '#F4A261' : 'rgba(30, 41, 59, 0.9)',
                      color: selectedAct === q.actNumber ? '#0B1325' : '#FFF8EE',
                      border: '1px solid rgba(244, 162, 97, 0.45)',
                      borderRadius: '999px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Act {q.actNumber}: {q.challengeType.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '22px',
                alignItems: 'start',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '2px solid rgba(244, 162, 97, 0.6)',
                  aspectRatio: '16 / 9',
                }}
              >
                <img
                  src={activeQuest.questMapImageUrl}
                  alt={activeQuest.questMapZoneLabel}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {activeQuest.waypoints.map((wp) => (
                  <div
                    key={wp.waypointId}
                    style={{
                      position: 'absolute',
                      left: `${wp.xPct}%`,
                      top: `${wp.yPct}%`,
                      transform: 'translate(-50%, -50%)',
                      background:
                        wp.kind === 'START'
                          ? '#38BDF8'
                          : wp.kind === 'NPC'
                            ? '#F4A261'
                            : '#10B981',
                      color: '#0B1325',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 900,
                      border: '2px solid #FFF8EE',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.65)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {wp.kind}: {wp.label}
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: 'rgba(9, 18, 36, 0.9)',
                  borderRadius: '18px',
                  padding: '20px',
                  border: '1px solid rgba(255, 248, 238, 0.14)',
                }}
              >
                <h3 style={{ marginTop: 0, fontSize: '20px', color: '#FFE29F', fontFamily: 'Georgia, serif' }}>
                  Adventure Checkpoints, Supplies &amp; Rewards
                </h3>
                <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.55 }}>
                  <strong>Mentor NPC:</strong> {primaryNpc.name} ({primaryNpc.role})
                </p>
                <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#E2E8F0', lineHeight: 1.7 }}>
                  {activeQuest.waypoints.map((wp) => (
                    <li key={wp.waypointId}>
                      <strong>[{wp.kind}] {wp.label}:</strong> {wp.detail}
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize: '13px', color: '#A7F3D0', marginBottom: '12px' }}>
                  <strong>Quest Supplies:</strong> {activeQuest.suppliesRequired.join(', ')}
                </div>
                <div style={{ fontSize: '13px', color: '#FDE68A', marginBottom: '16px' }}>
                  <strong>Collectible Reward:</strong> {activeQuest.rewardArtifactId} (+{activeQuest.rewardTokens} Mira Tokens)
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link
                    to={`/quests/${activeQuest.questId}`}
                    style={{
                      background: '#F4A261',
                      color: '#0B1325',
                      textDecoration: 'none',
                      padding: '9px 16px',
                      borderRadius: '999px',
                      fontWeight: 800,
                      fontSize: '13px',
                    }}
                  >
                    Inspect Full Quest Entry →
                  </Link>
                  <Link
                    to={isCore ? `/play/${selectedCountry}` : '/minecraft'}
                    style={{
                      background: 'rgba(0, 176, 111, 0.2)',
                      border: '1px solid #00B06F',
                      color: '#6EE7B7',
                      textDecoration: 'none',
                      padding: '9px 16px',
                      borderRadius: '999px',
                      fontWeight: 800,
                      fontSize: '13px',
                    }}
                  >
                    Launch {globalMeta.city} Quest →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Source-Grounded Cultural Knowledge Encyclopedia & Dual-Layer Provenance Atlas (v1.2) */}
        <CulturalEncyclopediaSectionV12 countryFilter="ALL" />
      </div>
    </div>
  );
};

export const QuestEncyclopediaPage: React.FC = () => {
  const params = useParams<{ questId?: string }>();
  const [countryFilter, setCountryFilter] = useState<GlobalCountryCode | 'ALL'>('ALL');
  const [selectedAgeTier, setSelectedAgeTier] = useState<AgeTierId>('8-10');

  const focusedQuest = params.questId
    ? V13_QUEST_ENCYCLOPEDIA.find((q) => q.questId.toLowerCase() === params.questId!.toLowerCase())
    : undefined;

  const filteredQuests = focusedQuest
    ? [focusedQuest]
    : V13_QUEST_ENCYCLOPEDIA.filter((q) => countryFilter === 'ALL' || q.country === countryFilter);

  const filteredGlobalChapters = GLOBAL_CHAPTERS_CATALOG.filter(
    (ch) => countryFilter === 'ALL' || ch.countryCode === countryFilter
  );

  return (
    <div
      data-testid="v13-quest-encyclopedia-page"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #081121 0%, #0F172A 50%, #081121 100%)',
        color: '#FFF8EE',
        padding: '32px clamp(16px, 4vw, 48px) 72px',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <header style={{ marginBottom: '24px' }}>
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(244, 162, 97, 0.18)',
              border: '1px solid #F4A261',
              color: '#FFE29F',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '8px',
            }}
          >
            MiraVerse Global Quest Encyclopedia · 11 Countries · 66 Chapters × 4 Age Tracks = 264 Variants (+ 25 Core Quests)
          </span>
          <h1
            style={{
              margin: '0 0 8px 0',
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 44px)',
            }}
          >
            Cultural Quest Encyclopedia &amp; Age-Adapted Learning Guide (All 11 Countries)
          </h1>
          <p style={{ margin: 0, color: '#CBD5E1', fontSize: '15px', maxWidth: '840px', lineHeight: 1.6 }}>
            Explore all 11 cultural destinations (Lebanon, Iraq, Egypt, France, South Korea, Germany, China, Japan, Russia, Ukraine, and Morocco) with 66 connected chapters and 264 age-adapted variants across <strong>Ages 5–7, 8–10, 11–13, and 14–17</strong>.
          </p>
        </header>

        {/* Filter Bar: Country Filter + 4 Age Track Selector */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '24px',
            background: 'rgba(15, 23, 42, 0.92)',
            padding: '14px 18px',
            borderRadius: '18px',
            border: '1px solid rgba(255, 248, 238, 0.14)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              data-testid="quest-filter-ALL"
              onClick={() => setCountryFilter('ALL')}
              style={{
                background: countryFilter === 'ALL' ? '#F4A261' : 'rgba(30, 41, 59, 0.9)',
                color: countryFilter === 'ALL' ? '#0B1325' : '#FFF8EE',
                border: '1px solid rgba(244, 162, 97, 0.45)',
                borderRadius: '999px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              All 11 Countries (66 Chapters + 25 Core Quests)
            </button>
            {GLOBAL_COUNTRIES_ORDERED.map((cc) => {
              const g = GLOBAL_COUNTRY_MAP[cc];
              const active = countryFilter === cc;
              return (
                <button
                  key={cc}
                  type="button"
                  data-testid={`quest-filter-${cc}`}
                  onClick={() => setCountryFilter(cc)}
                  style={{
                    background: active ? '#F4A261' : 'rgba(30, 41, 59, 0.9)',
                    color: active ? '#0B1325' : '#FFF8EE',
                    border: '1px solid rgba(244, 162, 97, 0.45)',
                    borderRadius: '999px',
                    padding: '7px 14px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {g.order}. {g.name} ({g.city})
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 800 }}>Age Track:</span>
            {V13_AGE_TIERS.map((t) => (
              <button
                key={t.id}
                type="button"
                data-testid={`encyclopedia-age-tier-${t.id}`}
                onClick={() => setSelectedAgeTier(t.id)}
                style={{
                  background: selectedAgeTier === t.id ? '#38BDF8' : 'rgba(30, 41, 59, 0.9)',
                  color: selectedAgeTier === t.id ? '#082F49' : '#E2E8F0',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                  borderRadius: '999px',
                  padding: '6px 13px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {focusedQuest && (
          <div style={{ marginBottom: '18px' }}>
            <Link to="/quests" style={{ color: '#F4A261', fontWeight: 800, fontSize: '14px' }}>
              ← View All 25 Quests in the Encyclopedia
            </Link>
          </div>
        )}

        {/* Quest Encyclopedia Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredQuests.map((quest) => {
            const stage = quest.ageTiers[selectedAgeTier];
            const exp = V13_COUNTRY_EXPERIENCES[quest.country];
            const npc = quest.npcs[0] ?? { name: 'Community Mentor', role: 'Cultural Guide' };
            return (
              <article
                key={quest.questId}
                data-testid={`quest-encyclopedia-card-${quest.questId}`}
                style={{
                  background: 'rgba(15, 23, 42, 0.94)',
                  border: '1px solid rgba(244, 162, 97, 0.38)',
                  borderRadius: '20px',
                  padding: '22px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '22px',
                  alignItems: 'start',
                }}
              >
                {/* Illustrated Quest Map Preview */}
                <div>
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      border: '1px solid rgba(244, 162, 97, 0.5)',
                      aspectRatio: '16 / 9',
                      marginBottom: '10px',
                    }}
                  >
                    <img
                      src={quest.questMapImageUrl}
                      alt={quest.questMapZoneLabel}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(9, 18, 36, 0.9)',
                        color: '#FFE29F',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {exp.countryNameEn} · Act {quest.actNumber} of 5
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.55 }}>
                    <div>
                      <strong>Quest Map:</strong> {quest.questMapZoneLabel}
                    </div>
                    <div>
                      <strong>Mentor NPC:</strong> {npc.name} ({npc.role})
                    </div>
                    <div>
                      <strong>Reward Artifact:</strong> {quest.rewardArtifactId} (+{quest.rewardTokens} Mira Tokens)
                    </div>
                  </div>
                </div>

                {/* Age-Adapted Quest Details */}
                <div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span
                      style={{
                        background: 'rgba(56, 189, 248, 0.18)',
                        border: '1px solid #38BDF8',
                        color: '#BAE6FD',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {EPISTEMIC_BADGE_LABELS[quest.epistemicClassification]}
                    </span>
                    <span
                      style={{
                        background: 'rgba(0, 176, 111, 0.18)',
                        border: '1px solid #00B06F',
                        color: '#6EE7B7',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {quest.verifiedAvailability.availabilityLabel}
                    </span>
                  </div>

                  <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontFamily: 'Georgia, serif' }}>
                    {quest.titleEn} ({quest.titleNative})
                  </h2>

                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#E2E8F0', lineHeight: 1.6 }}>
                    {quest.narrativeIntro}
                  </p>

                  <div style={{ marginBottom: '10px', fontSize: '13px', color: '#CBD5E1' }}>
                    <strong style={{ color: '#93C5FD' }}>Learning Objectives ({selectedAgeTier}):</strong>
                    <div style={{ marginTop: '4px' }}>{stage.learningObjective}</div>
                  </div>

                  <div style={{ fontSize: '13px', color: '#E2E8F0', marginBottom: '8px' }}>
                    <strong style={{ color: '#FDE68A' }}>Activity ({stage.focusTitle}):</strong> {stage.guidedActivity} — {stage.challengePrompt}
                  </div>
                  <div style={{ fontSize: '13px', color: '#CBD5E1', marginBottom: '12px' }}>
                    <strong style={{ color: '#A7F3D0' }}>Cultural Knowledge:</strong> {quest.culturalKnowledgeSummary} ({stage.historicalReflection})
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '10px',
                      background: 'rgba(9, 18, 36, 0.85)',
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#CBD5E1',
                      marginBottom: '12px',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#6EE7B7' }}>Roblox Mechanics:</strong> {quest.robloxMechanics}
                    </div>
                    <div>
                      <strong style={{ color: '#FDE68A' }}>Minecraft Mechanics:</strong> {quest.minecraftMechanics}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Link
                      to={`/play/${quest.country}`}
                      style={{
                        background: '#00B06F',
                        color: '#052E16',
                        textDecoration: 'none',
                        padding: '8px 15px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 900,
                      }}
                    >
                      ▶ Launch Quest in {exp.cityName}
                    </Link>
                    <Link
                      to={`/explore/${quest.country}`}
                      style={{
                        background: 'rgba(30, 41, 59, 0.9)',
                        border: '1px solid rgba(244, 162, 97, 0.45)',
                        color: '#FFE29F',
                        textDecoration: 'none',
                        padding: '8px 15px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 800,
                      }}
                    >
                      Explore {exp.countryNameEn} Guide →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Global v1.1 66-Chapter Catalog (11 Countries × 6 Chapters × 4 Age Variants = 264 Variants) */}
        {!focusedQuest && (
          <section
            data-testid="global-66-chapters-encyclopedia"
            style={{ marginTop: '36px' }}
          >
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: '#FFE29F', margin: '0 0 8px 0' }}>
              Echoes of Home: 66 Connected Chapters Across All 11 Countries ({filteredGlobalChapters.length} Shown · Track: Ages {selectedAgeTier})
            </h2>
            <p style={{ color: '#CBD5E1', fontSize: '14px', margin: '0 0 18px 0' }}>
              Every country in the Global v1.1 campaign includes 6 sequential chapters (`01`–`06`) with 4 authored age-track behavior variants (`Explorer 5–7`, `Adventurer 8–10`, `Investigator 11–13`, `Architect / Curator 14–17`).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredGlobalChapters.map((ch) => {
                const g = GLOBAL_COUNTRY_MAP[ch.countryCode];
                const v = ch.ageVariants[selectedAgeTier];
                return (
                  <article
                    key={ch.id}
                    data-testid={`global-chapter-card-${ch.id}`}
                    style={{
                      background: 'rgba(15, 23, 42, 0.94)',
                      border: `1px solid ${g.primaryColorHex}`,
                      borderRadius: '16px',
                      padding: '18px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#6EE7B7' }}>
                        {g.order}. {g.name} · {ch.id} (Chapter {ch.chapterIndex}/6)
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#93C5FD' }}>
                        [{ch.sourceType}]
                      </span>
                    </div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontFamily: 'Georgia, serif', color: '#FFF8EE' }}>
                      {ch.title}
                    </h3>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#E2E8F0', lineHeight: 1.5 }}>
                      {ch.activity}
                    </p>
                    <div style={{ fontSize: '12px', color: '#FDE68A', marginBottom: '8px' }}>
                      <strong>{v.track} (Ages {selectedAgeTier}):</strong> {v.activitySummary} ({v.steps} steps)
                    </div>
                    <div style={{ fontSize: '12px', color: '#A7F3D0', marginBottom: '10px' }}>
                      <strong>Earned Artifact:</strong> {ch.reward.artifactName} (+{ch.reward.storySparks} Story Sparks)
                    </div>
                    <Link
                      to={`/explore/${ch.countryCode}`}
                      style={{ color: '#F4A261', fontSize: '12px', fontWeight: 800, textDecoration: 'none' }}
                    >
                      Open {g.name} Country Guide →
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
