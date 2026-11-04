/**
 * MiraVerse v1.6 (CX01 / GM02 / GM18) — Arabian Peninsula & Gulf Diaspora Portal Section
 * (apps/web/src/features/gulf-atlas-v16/GulfExpansionSectionV16.tsx)
 *
 * Features:
 * - Child-friendly script/language toggle: العربية / Arabizi / English (overrides navigator.language automatic detection)
 * - Distinct brand header: عالم يرا (Arabic) / 3alam Mira (Arabizi) / Mira's World (English)
 * - 6 Gulf Destinations (QA, AE, KW, SA, OM + 6th country BH) with stable IDs (country.qa .. country.bh)
 * - Explicit notice that Yemen (YE) is a potential future destination awaiting dedicated research & cultural review
 * - Dual Map Mode: Verified Real-World Geographic Coordinates (WGS84) vs Illustrated Adventure Quest Maps (30 maps)
 * - 30 Canonical Quest Acts × 4 Age Tracks (5–7, 8–10, 11–13, 14–17) = 120 age-adapted stages
 * - 48+ Artifacts, 36+ Regional Dialect & MSA/Arabizi Glossary items, and optional non-recorded Family Conversation Prompts
 * - Truth-in-marketing platform status badges (PLAYABLE VERIFIED on Web vs TEST BUILD / UNVERIFIED/BLOCKED native client GUI on Linux host)
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import gulfData from '../../generated/gulfV16.json';
import type {
  GulfCountryCode,
  GulfCountryExperienceV16,
  ScriptVariantV16,
} from '../../../../../packages/contracts/v16/index';
import type { AgeTierId } from '../../../../../packages/contracts/v13/index';

const GULF_COUNTRIES = (gulfData.countries as unknown) as GulfCountryExperienceV16[];

export const GulfExpansionSectionV16: React.FC<{ initialCountry?: GulfCountryCode }> = ({
  initialCountry = 'QA',
}) => {
  const [selectedCountry, setSelectedCountry] = useState<GulfCountryCode>(initialCountry);
  const [scriptMode, setScriptMode] = useState<ScriptVariantV16>('en');
  const [selectedActNum, setSelectedActNum] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedAgeTier, setSelectedAgeTier] = useState<AgeTierId>('8-10');
  const [mapLayerMode, setMapLayerMode] = useState<'BOTH' | 'QUEST_MAP' | 'REAL_GEO'>('BOTH');

  const country = GULF_COUNTRIES.find((c) => c.countryCode === selectedCountry) ?? GULF_COUNTRIES[0];
  const activeAct = country.questActs.find((a) => a.actNumber === selectedActNum) ?? country.questActs[0];
  const activeStage = activeAct.ageTiers[selectedAgeTier];
  const isRtl = scriptMode === 'Arab';

  const pickText = (ar: string, arabizi: string, en: string) => {
    if (scriptMode === 'Arab') return ar;
    if (scriptMode === 'Latn') return arabizi;
    return en;
  };

  return (
    <section
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid="gulf-v16-expansion-portal"
      data-script-mode={scriptMode}
      style={{
        background: 'linear-gradient(180deg, #091326 0%, #111C33 50%, #091326 100%)',
        border: `2px solid ${country.palette.secondary}`,
        borderRadius: '24px',
        padding: 'clamp(16px, 3vw, 32px)',
        margin: '28px auto',
        maxWidth: '1280px',
        color: '#FFF8EE',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      {/* Top Brand & Script Toggle Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          paddingBottom: '18px',
          marginBottom: '20px',
          borderBottom: '1px solid rgba(255, 248, 238, 0.16)',
        }}
      >
        <div>
          <div
            data-testid="gulf-v16-brand-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(245, 158, 11, 0.16)',
              border: '1px solid rgba(245, 158, 11, 0.55)',
              color: '#FDE68A',
              padding: '5px 14px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 800,
              marginBottom: '8px',
            }}
          >
            <span lang="ar">عالم يرا</span>
            <span>·</span>
            <span>Mira&apos;s World</span>
            <span>·</span>
            <span>v1.6 Arabian Peninsula &amp; Gulf Expansion</span>
          </div>
          <h2
            style={{
              margin: '0 0 6px 0',
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(22px, 3.2vw, 34px)',
            }}
          >
            {pickText(
              'مغامرات الخليج والجزيرة العربية (٦ دول · ٣٠ فصلاً · ١٢٠ مرحلة عمرية)',
              'Mughamarat il-Khalij wal-Jazira il-3arabiya (6 Countries · 30 Acts · 120 Stages)',
              'Arabian Peninsula & Gulf Cultural Adventures (6 Countries · 30 Quest Acts · 120 Age Stages)'
            )}
          </h2>
          <p style={{ margin: 0, color: '#CBD5E1', fontSize: '14px', maxWidth: '820px', lineHeight: 1.55 }}>
            {pickText(
              'استكشف قطر والإمارات والكويت والسعودية وعُمان والبحرين (الوجهة السادسة المضافة من البحث). ملاحظة: اليمن وجهة مستقبلية مقترحة تتطلب بحثاً ومراجعة ثقافية مستقلة قبل إضافتها.',
              'Istakshif Qatar, il-Imarat, il-Kuwait, il-Su3udiya, 3uman, wal-Bahrain (6th added country). Mulahaza: Al-Yaman (Yemen) wijha mustaqbaliya تتطلب muraja3a thaqafiya.',
              'Explore Qatar, UAE, Kuwait, Saudi Arabia, Oman, and Bahrain (6th country added from Dilmun & pearling research). Note: Yemen is a potential future destination awaiting dedicated research and cultural review—not an inferred 7th release country.'
            )}
          </p>
        </div>

        {/* Child-Friendly Script / Language Toggle: العربية / Arabizi / English */}
        <div
          role="group"
          aria-label="Script and Language Display Preference"
          data-testid="gulf-script-toggle-group"
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            background: '#0B1325',
            padding: '6px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 248, 238, 0.2)',
          }}
        >
          {(
            [
              { id: 'Arab' as const, label: 'العربية (Arabic RTL)' },
              { id: 'Latn' as const, label: 'Arabizi (Latin LTR)' },
              { id: 'en' as const, label: 'English (LTR)' },
            ]
          ).map((mode) => {
            const active = scriptMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                data-testid={`gulf-script-btn-${mode.id}`}
                aria-pressed={active}
                onClick={() => setScriptMode(mode.id)}
                style={{
                  background: active ? '#F59E0B' : 'transparent',
                  color: active ? '#0F172A' : '#FFF8EE',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6 Gulf Country Selector Tabs */}
      <div
        role="tablist"
        aria-label="Gulf Destination Selector"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: '10px',
          marginBottom: '22px',
        }}
      >
        {GULF_COUNTRIES.map((c) => {
          const active = c.countryCode === country.countryCode;
          return (
            <button
              key={c.stableId}
              role="tab"
              type="button"
              aria-selected={active}
              data-testid={`gulf-country-tab-${c.countryCode}`}
              onClick={() => {
                setSelectedCountry(c.countryCode);
                setSelectedActNum(1);
              }}
              style={{
                background: active ? c.palette.primary : 'rgba(15, 23, 42, 0.9)',
                color: '#FFF8EE',
                border: active ? `2px solid ${c.palette.secondary}` : '1px solid rgba(255,248,238,0.18)',
                borderRadius: '14px',
                padding: '10px 12px',
                textAlign: isRtl ? 'right' : 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '11px', color: '#FDE68A', fontWeight: 800 }}>
                {c.stableId} · {c.dialectCode} {c.isSixthAddedCountry ? '· ★ 6th Added' : ''}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 900, marginTop: '2px' }}>
                {pickText(c.nameAr, c.nameArabizi, c.nameEn)} ({c.countryCode})
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '2px' }}>
                {pickText(c.storyArcTitleAr, c.storyArcTitleArabizi, c.storyArcTitleEn)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Country Hero Banner + Fictional Mentor Card */}
      <div
        data-testid={`gulf-country-hero-${country.countryCode}`}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '20px',
          background: 'rgba(15, 23, 42, 0.85)',
          borderRadius: '18px',
          padding: '18px',
          border: '1px solid rgba(255, 248, 238, 0.14)',
          marginBottom: '22px',
        }}
      >
        <div>
          <img
            src={country.keyArtUrl}
            alt={`${country.nameEn} — ${country.storyArcTitleEn}`}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '14px',
              border: `2px solid ${country.palette.secondary}`,
              display: 'block',
            }}
          />
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginTop: '10px',
              fontSize: '12px',
            }}
          >
            <span style={{ background: '#065F46', color: '#A7F3D0', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>
              Website: {country.platformStatus.website}
            </span>
            <span style={{ background: '#1E3A8A', color: '#BFDBFE', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>
              Roblox (ar-001): {country.platformStatus.roblox}
            </span>
            <span style={{ background: '#78350F', color: '#FDE68A', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>
              Minecraft Bedrock: {country.platformStatus.minecraftBedrock}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#FDE68A', fontWeight: 800 }}>
              {country.stableId} · {country.dialectCode} · {country.passportStampCodeExample}
            </span>
            <h3 style={{ margin: '4px 0 8px 0', fontSize: '24px', fontFamily: 'Georgia, serif' }}>
              {pickText(
                `${country.nameAr} — ${country.storyArcTitleAr}`,
                `${country.nameArabizi} — ${country.storyArcTitleArabizi}`,
                `${country.nameEn} — "${country.storyArcTitleEn}"`
              )}
            </h3>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#E2E8F0', lineHeight: 1.55 }}>
              {pickText(country.settingSummaryAr, country.settingSummaryArabizi, country.settingSummaryEn)}
            </p>
            <div
              data-testid={`gulf-epistemic-box-${country.countryCode}`}
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.45)',
                borderRadius: '12px',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#FDE68A',
                lineHeight: 1.5,
              }}
            >
              {pickText(
                country.folkloreAndEpistemicFrameAr,
                country.folkloreAndEpistemicFrameArabizi,
                country.folkloreAndEpistemicFrameEn
              )}
            </div>
          </div>

          {/* Mentor Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#09111E',
              padding: '12px',
              borderRadius: '14px',
              border: '1px solid rgba(255,248,238,0.14)',
            }}
          >
            <img
              src={country.mentor.portraitSvgUrl}
              alt={country.mentor.nameEn}
              width={68}
              height={68}
              style={{ borderRadius: '12px', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 800 }}>
                Original Fictional Mentor ({country.mentor.npcId})
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800 }}>
                {pickText(country.mentor.nameAr, country.mentor.nameArabizi, country.mentor.nameEn)}
              </div>
              <div style={{ fontSize: '13px', color: '#CBD5E1', marginTop: '3px' }}>
                &ldquo;{pickText(country.mentor.greetingAr, country.mentor.greetingArabizi, country.mentor.greetingEn)}&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Cartographic Section: Real-World WGS84 Coordinates vs Illustrated Quest Map */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          borderRadius: '18px',
          padding: '18px',
          border: '1px solid rgba(255,248,238,0.14)',
          marginBottom: '22px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '19px', fontFamily: 'Georgia, serif' }}>
            {pickText(
              'النظام الخرائطي المزدوج: المواقع الجغرافية الحقيقية (WGS84) مقابل خريطة المغامرة المرسومة',
              'Nizam il-Kharait il-Muzdawaj: Jughrafiya Waqi3iya (WGS84) vs Kharitat il-Mughamara',
              'Dual Cartographic System: Verified Geographic Coordinates (WGS84) vs Illustrated Quest Map'
            )}
          </h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['BOTH', 'QUEST_MAP', 'REAL_GEO'] as const).map((m) => (
              <button
                key={m}
                type="button"
                data-testid={`gulf-map-mode-${m}`}
                onClick={() => setMapLayerMode(m)}
                style={{
                  background: mapLayerMode === m ? '#38BDF8' : '#0B1325',
                  color: mapLayerMode === m ? '#0F172A' : '#FFF8EE',
                  border: '1px solid rgba(56,189,248,0.4)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {m === 'BOTH' ? 'Show Both Layers' : m === 'QUEST_MAP' ? 'Illustrated Quest Map' : 'Real Geography (WGS84)'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '16px' }}>
          {(mapLayerMode === 'BOTH' || mapLayerMode === 'QUEST_MAP') && (
            <div data-testid="gulf-quest-map-panel">
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#FDE68A', marginBottom: '6px' }}>
                Creative Fictional Quest Map (Not a Satellite or Survey Map) — Act {activeAct.actNumber}: {activeAct.titleEn}
              </div>
              <img
                src={activeAct.mapCheckpoint.questMapSvgUrl}
                alt={`${country.nameEn} Act ${activeAct.actNumber} Quest Map`}
                style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }}
              />
            </div>
          )}

          {(mapLayerMode === 'BOTH' || mapLayerMode === 'REAL_GEO') && (
            <div data-testid="gulf-real-geo-panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#38BDF8' }}>
                Verified Real-World Cultural &amp; UNESCO Heritage Coordinates (WGS84)
              </div>
              {country.realGeographicPins.map((pin) => (
                <div
                  key={pin.siteId}
                  style={{
                    background: '#09111E',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFF8EE' }}>
                    {pickText(pin.nameAr, pin.nameArabizi, pin.nameEn)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7DD3FC', fontFamily: 'monospace', marginTop: '2px' }}>
                    WGS84: {pin.coordinates[0].toFixed(4)}°N, {pin.coordinates[1].toFixed(4)}°E (±{pin.uncertaintyMeters}m) · {pin.era}
                  </div>
                  <p style={{ margin: '6px 0', fontSize: '13px', color: '#CBD5E1' }}>
                    {pickText(pin.summaryAr, pin.summaryArabizi, pin.summaryEn)}
                  </p>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Attribution: {pin.attributionSource} ({pin.category.toUpperCase()})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5 Quest Acts × 4 Age Tiers Interactive Explorer */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          borderRadius: '18px',
          padding: '18px',
          border: '1px solid rgba(255,248,238,0.14)',
          marginBottom: '22px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '19px', fontFamily: 'Georgia, serif' }}>
            {pickText(
              `الأعمال الخمسة والمراحل العمرية الأربع — ${country.nameAr}`,
              `Il-A3mal il-Khamsa wal-Marahil il-3umriya — ${country.nameArabizi}`,
              `Five Canonical Quest Acts & Four Age Tracks — ${country.nameEn}`
            )}
          </h3>

          {/* Age-Tier Selector */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['5-7', '8-10', '11-13', '14-17'] as AgeTierId[]).map((tier) => (
              <button
                key={tier}
                type="button"
                data-testid={`gulf-age-tier-btn-${tier}`}
                onClick={() => setSelectedAgeTier(tier)}
                style={{
                  background: selectedAgeTier === tier ? '#10B981' : '#0B1325',
                  color: selectedAgeTier === tier ? '#052E16' : '#FFF8EE',
                  border: '1px solid rgba(16,185,129,0.45)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Ages {tier}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Act Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '8px', marginBottom: '16px' }}>
          {country.questActs.map((act) => {
            const active = act.actNumber === activeAct.actNumber;
            return (
              <button
                key={act.id}
                type="button"
                data-testid={`gulf-act-btn-${act.id}`}
                onClick={() => setSelectedActNum(act.actNumber)}
                style={{
                  background: active ? country.palette.secondary : '#09111E',
                  color: active ? '#0F172A' : '#FFF8EE',
                  border: '1px solid rgba(255,248,238,0.2)',
                  borderRadius: '10px',
                  padding: '10px',
                  textAlign: isRtl ? 'right' : 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.85 }}>
                  {act.id} · Act {act.actNumber} ({act.countrySpecificAlias})
                </div>
                <div style={{ fontSize: '14px', fontWeight: 900, marginTop: '2px' }}>
                  {pickText(act.titleAr, act.titleArabizi, act.titleEn)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Act + Age Stage Card */}
        <div
          data-testid={`gulf-active-stage-${activeStage.stageId}`}
          style={{
            background: '#09111E',
            borderRadius: '14px',
            padding: '16px',
            border: `1px solid ${country.palette.secondary}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#FDE68A', fontWeight: 800 }}>
              Stage ID: {activeStage.stageId} · Duration: {activeStage.durationMinutes} · Short-Session Override: {activeStage.shorterSessionOverrideMinutes}m
            </span>
            <span style={{ fontSize: '12px', color: '#6EE7B7', fontWeight: 800 }}>
              Reward: {activeAct.reward.collectibleArtifactId} (+{activeAct.reward.miraTokensEarned} Mira Tokens)
            </span>
          </div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '20px', fontFamily: 'Georgia, serif' }}>
            {pickText(activeStage.titleAr, activeStage.titleArabizi, activeStage.titleEn)}
          </h4>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#E2E8F0', lineHeight: 1.55 }}>
            {pickText(activeStage.objectiveAr, activeStage.objectiveArabizi, activeStage.objectiveEn)}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '10px', fontSize: '13px', color: '#CBD5E1' }}>
            <div style={{ background: 'rgba(30,41,59,0.65)', padding: '10px', borderRadius: '10px' }}>
              <strong>Age-Adapted Mechanics:</strong> {activeStage.puzzleMechanicsEn}
            </div>
            <div style={{ background: 'rgba(30,41,59,0.65)', padding: '10px', borderRadius: '10px' }}>
              <strong>Roblox ({activeAct.robloxImplementation.moduleName}):</strong> {activeStage.robloxAdapterMechanics}
            </div>
            <div style={{ background: 'rgba(30,41,59,0.65)', padding: '10px', borderRadius: '10px' }}>
              <strong>Minecraft Bedrock ({activeAct.bedrockImplementation.structureTemplateId}):</strong> {activeStage.bedrockAdapterMechanics}
            </div>
          </div>
        </div>
      </div>

      {/* 8+ Reviewed Artifacts & Multilingual Glossary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '18px' }}>
        {/* Artifact Museum (8 per country) */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            borderRadius: '18px',
            padding: '16px',
            border: '1px solid rgba(255,248,238,0.14)',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontFamily: 'Georgia, serif' }}>
            {pickText(
              `متحف المقتنيات (${country.artifacts.length} قطع موثقة)`,
              `Mat7af il-Muqtaniyat (${country.artifacts.length} Artifacts)`,
              `Artifact Museum (${country.artifacts.length} Reviewed Artifacts)`
            )}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '10px' }}>
            {country.artifacts.map((art) => (
              <div
                key={art.id}
                data-testid={`gulf-artifact-card-${art.id}`}
                style={{
                  background: '#09111E',
                  borderRadius: '10px',
                  padding: '8px',
                  border: '1px solid rgba(255,248,238,0.12)',
                }}
              >
                <img
                  src={art.imageUrl}
                  alt={art.nameEn}
                  style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block', marginBottom: '6px' }}
                />
                <div style={{ fontSize: '12px', fontWeight: 800 }}>
                  {pickText(art.nameAr, art.nameArabizi, art.nameEn)}
                </div>
                <div style={{ fontSize: '10px', color: '#FDE68A', fontFamily: 'monospace', marginTop: '2px' }}>
                  {art.id} · {art.category}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multilingual Dialect / MSA / Arabizi Glossary + Family Prompts */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            borderRadius: '18px',
            padding: '16px',
            border: '1px solid rgba(255,248,238,0.14)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontFamily: 'Georgia, serif' }}>
              {pickText(
                `المعجم اللغوي (${country.dialectCode} · الفصحى · العربيزي · الإنجليزية)`,
                `Il-Mu3jam il-Lughawi (${country.dialectCode} · MSA · Arabizi · English)`,
                `Multilingual Glossary (${country.dialectCode} · MSA · Arabizi · English)`
              )}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {country.glossary.map((g) => (
                <div
                  key={g.termId}
                  style={{
                    background: '#09111E',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,248,238,0.12)',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', fontWeight: 800 }}>
                    <span lang="ar" style={{ color: '#FDE68A' }}>{g.arabicScript}</span>
                    <span style={{ color: '#7DD3FC' }}>5–7: {g.arabiziPhonetic5To7} · 11–17: {g.arabiziStandard11To17}</span>
                  </div>
                  <div style={{ color: '#FFF8EE', marginTop: '3px' }}>{g.englishGloss}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                    MSA: {g.msaEquivalent} · Pronunciation: {g.audioPhoneticHint}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Generational Family Conversation Prompts (Zero PII Collection) */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#6EE7B7', marginBottom: '6px' }}>
              Cross-Generational Family Conversation Prompt (Offline Only · Zero Child PII Collected)
            </div>
            {country.familyConversationPrompts.map((fp) => (
              <div key={fp.promptId} style={{ fontSize: '13px', color: '#E2E8F0', marginBottom: '6px' }}>
                <div>{pickText(fp.questionAr, fp.questionArabizi, fp.questionEn)}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{fp.privacyNoteEn}</div>
              </div>
            ))}
            <div style={{ marginTop: '8px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link to={`/explore/${country.countryCode}`} style={{ color: '#FDE68A', fontSize: '12px', fontWeight: 800 }}>
                Open Full {country.nameEn} Guidebook →
              </Link>
              <Link to="/passport" style={{ color: '#7DD3FC', fontSize: '12px', fontWeight: 800 }}>
                View Gulf Stamps in Passport →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
