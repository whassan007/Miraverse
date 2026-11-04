/**
 * MiraVerse v1.3 (`CX02`, `P2`, `P5`) — World Library (/explore), 13-Section Country Experience (/explore/:country),
 * Adventures (/adventures), and Characters (/characters) Pages
 * - Enforces exact v1.3 country sequence: 1. Lebanon: Byblos (LB), 2. Iraq: Baghdad (IQ), 3. Egypt: Cairo (EG),
 *   4. France: Lyon (FR), 5. South Korea: Jeonju (KR).
 * - Renders all 13 mandatory P2 cultural, geographic, quest-map, age-tier, timeline, artifact, and citation sections.
 */
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { COUNTRIES, type CountryCode } from '../../../../../packages/contracts/index';
import {
  V08_QUEST_LOOP_STEPS,
  V08_WORLD_VISUAL_MAP,
} from '../../../../../packages/contracts/v08/index';
import {
  EPISTEMIC_BADGE_LABELS,
  V13_AGE_TIERS,
  V13_COUNTRIES_ORDERED,
  V13_COUNTRY_EXPERIENCES,
  V13_QUEST_ENCYCLOPEDIA,
  type AgeTierId,
} from '../../../../../packages/contracts/v13/index';
import { RobloxLaunchBanner } from '../../launch/RobloxLaunchPage';

export const ExploreAtlasPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'FLAGSHIP' | 'STORIES'>('ALL');
  const byblos = V08_WORLD_VISUAL_MAP.LB;
  const byblosV13 = V13_COUNTRY_EXPERIENCES.LB;
  // Exact v1.3 expansion sequence: 2. Iraq (IQ), 3. Egypt (EG), 4. France (FR), 5. South Korea (KR)
  const expansionCodes: CountryCode[] = ['IQ', 'EG', 'FR', 'KR'];

  return (
    <div
      data-testid="explore-atlas-page"
      style={{
        minHeight: '88vh',
        background: '#0B1325',
        color: '#FFF8EE',
        padding: '36px clamp(16px, 4vw, 56px) 64px',
      }}
    >
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#F4A261',
                textTransform: 'uppercase',
                letterSpacing: '1.4px',
              }}
            >
              MiraVerse v1.3 Cultural Adventure Portal · Five Country Experiences
            </span>
            <h1
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(28px, 4vw, 44px)',
                margin: '6px 0 8px 0',
              }}
            >
              Explore Five Cultural Worlds (Lebanon, Iraq, Egypt, France &amp; South Korea)
            </h1>
            <p style={{ color: '#CBD5E1', margin: 0, maxWidth: '780px', fontSize: '15px', lineHeight: 1.55 }}>
              Discover real-world geography, 25 illustrated quest maps, 100 age-adapted quest stages, historical timelines, and cultural artifacts across all five destinations.
            </p>
          </div>

          <div role="tablist" aria-label="Filter Destinations" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL' as const, label: 'All 5 Worlds (1–5)' },
              { id: 'FLAGSHIP' as const, label: 'Playable Flagship (RC1)' },
              { id: 'STORIES' as const, label: '15-Scene Stories & Quests' },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={filter === tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  background: filter === tab.id ? '#F4A261' : '#131F38',
                  color: filter === tab.id ? '#0F172A' : '#E2E8F0',
                  border: '1px solid rgba(244, 162, 97, 0.5)',
                  borderRadius: '999px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Lebanon: Byblos Flagship Card */}
        <article
          data-testid="explore-card-LB"
          style={{
            background: 'linear-gradient(135deg, #112A34 0%, #131F38 65%, #0F172A 100%)',
            border: '2px solid #00B06F',
            borderRadius: '22px',
            padding: 'clamp(18px, 3vw, 28px)',
            marginBottom: '26px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          <div style={{ borderRadius: '16px', overflow: 'hidden', aspectRatio: '16 / 10', border: '1px solid rgba(244, 162, 97, 0.45)' }}>
            <img
              src={byblos.coverArtUrl}
              alt={`1. ${byblosV13.countryNameEn}: ${byblosV13.cityName}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div>
            <span
              data-testid="availability-badge-LB"
              style={{
                display: 'inline-block',
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 800,
                background: 'rgba(0, 176, 111, 0.22)',
                color: '#6EE7B7',
                border: '1px solid #10B981',
                marginBottom: '10px',
              }}
            >
              1. RC1 Flagship · Available First on Roblox &amp; Minecraft Bedrock
            </span>

            <h2 style={{ margin: '0 0 8px 0', fontSize: 'clamp(22px, 3vw, 30px)', fontFamily: 'Georgia, serif' }}>
              1. {byblosV13.countryNameEn}: {byblosV13.cityName} (<span lang="ar-LB">{byblos.nameNative}</span>)
            </h2>

            <p style={{ fontSize: '15px', color: '#E2E8F0', lineHeight: 1.55, marginBottom: '14px' }}>
              {byblosV13.heroTagline} — {byblos.adventureHook}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <img src={byblos.portraitArtUrl} alt={byblos.mentorName} width={38} height={38} style={{ borderRadius: '50%' }} />
              <span style={{ fontSize: '13px', color: '#CBD5E1' }}>
                Mentor: <strong>{byblos.mentorName}</strong> · Dish: <strong>{byblos.signatureDish}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link
                to="/explore/LB"
                style={{
                  background: '#F4A261',
                  color: '#0F172A',
                  textDecoration: 'none',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  fontWeight: 800,
                  fontSize: '14px',
                }}
              >
                Explore Lebanon Experience (13 Sections)
              </Link>
              <Link
                to="/play/LB"
                style={{
                  background: '#00B06F',
                  color: '#032215',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  fontWeight: 900,
                  fontSize: '14px',
                }}
              >
                ▶ Launch &amp; Quest Map
              </Link>
              <Link
                to="/story/ar-LB"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#FFF8EE',
                  textDecoration: 'none',
                  padding: '10px 16px',
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                Read Story
              </Link>
            </div>
          </div>
        </article>

        {/* Symmetrical 4-Column Grid in Exact v1.3 Order: 2. Iraq (IQ), 3. Egypt (EG), 4. France (FR), 5. South Korea (KR) */}
        {filter !== 'FLAGSHIP' && (
          <div className="mv-world-grid-4">
            {expansionCodes.map((code) => {
              const world = V08_WORLD_VISUAL_MAP[code];
              const v13Exp = V13_COUNTRY_EXPERIENCES[code];
              return (
                <article
                  key={code}
                  data-testid={`explore-card-${code}`}
                  style={{
                    background: `linear-gradient(180deg, ${world.surfaceTintHex} 0%, #131F38 100%)`,
                    border: `1px solid ${world.primaryColorHex}`,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden', background: '#0F172A' }}>
                      <img
                        src={world.coverArtUrl}
                        alt={`${v13Exp.orderIndex}. ${v13Exp.countryNameEn}: ${v13Exp.cityName}`}
                        loading="eager"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ padding: '16px 18px 10px' }}>
                      <span
                        data-testid={`availability-badge-${code}`}
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: 'rgba(244, 162, 97, 0.16)',
                          color: '#FCD34D',
                          marginBottom: '8px',
                        }}
                      >
                        {v13Exp.orderIndex}. RC3 Expansion World · Cultural Portal &amp; Bedrock Add-On Ready
                      </span>

                      <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontFamily: 'Georgia, serif' }}>
                        {v13Exp.orderIndex}. {v13Exp.countryNameEn}: {v13Exp.cityName}
                      </h2>
                      <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.48, marginBottom: '12px' }}>
                        {v13Exp.heroTagline}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#E2E8F0' }}>
                        <img src={world.portraitArtUrl} alt={world.mentorName} width={28} height={28} style={{ borderRadius: '50%' }} />
                        <span>
                          Mentor: <strong>{world.mentorName}</strong> · Dish: <strong>{world.signatureDish}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '12px 18px 18px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Link
                      to={`/explore/${code}`}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        background: '#F4A261',
                        color: '#0F172A',
                        textDecoration: 'none',
                        padding: '9px 12px',
                        borderRadius: '999px',
                        fontWeight: 800,
                        fontSize: '12px',
                      }}
                    >
                      Country Experience
                    </Link>
                    <Link
                      to={`/play/${code}`}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        background: world.primaryColorHex,
                        color: '#FFF8EE',
                        textDecoration: 'none',
                        padding: '9px 12px',
                        borderRadius: '999px',
                        fontWeight: 800,
                        fontSize: '12px',
                      }}
                    >
                      Quest Map &amp; Launch
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const ExploreCountryDetailPage: React.FC = () => {
  const { country } = useParams<{ country: string }>();
  const code = (
    COUNTRIES.includes((country || '').toUpperCase() as CountryCode)
      ? (country || '').toUpperCase()
      : 'LB'
  ) as CountryCode;

  const world = V08_WORLD_VISUAL_MAP[code];
  const v13Exp = V13_COUNTRY_EXPERIENCES[code];
  const countryQuests = V13_QUEST_ENCYCLOPEDIA.filter((q) => q.country === code);

  const [selectedAct, setSelectedAct] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedAgeTier, setSelectedAgeTier] = useState<AgeTierId>('8-10');

  const activeQuest = countryQuests.find((q) => q.actNumber === selectedAct) ?? countryQuests[0];
  const activeStage = activeQuest.ageTiers[selectedAgeTier];

  return (
    <div
      data-testid={`explore-country-detail-${code}`}
      style={{
        minHeight: '88vh',
        background: '#0B1325',
        color: '#FFF8EE',
        padding: '28px clamp(16px, 4vw, 56px) 72px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Top Country Switcher in Exact v1.3 Order (1. LB, 2. IQ, 3. EG, 4. FR, 5. KR) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '18px',
          }}
        >
          <Link to="/explore" style={{ color: '#FFE29F', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>
            ← Back to Five Worlds Library
          </Link>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {V13_COUNTRIES_ORDERED.map((cc) => {
              const exp = V13_COUNTRY_EXPERIENCES[cc];
              const isCurrent = cc === code;
              return (
                <Link
                  key={cc}
                  to={`/explore/${cc}`}
                  data-testid={`country-switch-${cc}`}
                  style={{
                    background: isCurrent ? '#F4A261' : 'rgba(30, 41, 59, 0.9)',
                    color: isCurrent ? '#0B1325' : '#FFF8EE',
                    textDecoration: 'none',
                    padding: '6px 13px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 800,
                    border: '1px solid rgba(244, 162, 97, 0.45)',
                  }}
                >
                  {exp.orderIndex}. {exp.countryNameEn}: {exp.cityName}
                </Link>
              );
            })}
          </div>
        </div>

        {/* SECTION 1 & 2: Original Cover Artwork + Historical & Cultural Introduction */}
        <section
          data-testid="country-section-cover-and-intro"
          style={{
            background: `linear-gradient(135deg, ${world.surfaceTintHex} 0%, #131F38 100%)`,
            borderRadius: '24px',
            border: `2px solid ${world.primaryColorHex}`,
            padding: 'clamp(20px, 3vw, 32px)',
            marginBottom: '28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            gap: '28px',
            alignItems: 'center',
          }}
        >
          <div style={{ borderRadius: '18px', overflow: 'hidden', aspectRatio: '16 / 10', border: '1px solid rgba(244, 162, 97, 0.5)' }}>
            <img
              src={v13Exp.coverArtUrl}
              alt={`${v13Exp.countryNameEn}: ${v13Exp.cityName}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div>
            <span
              style={{
                display: 'inline-block',
                background: world.isFlagshipSlice ? 'rgba(16, 185, 129, 0.22)' : 'rgba(244, 162, 97, 0.2)',
                color: world.isFlagshipSlice ? '#6EE7B7' : '#FCD34D',
                border: `1px solid ${world.isFlagshipSlice ? '#10B981' : '#F4A261'}`,
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 800,
                marginBottom: '10px',
              }}
            >
              Destination #{v13Exp.orderIndex} of 5 ·{' '}
              {v13Exp.platformInfo.robloxPlayableNow ? 'RC1 Flagship Playable' : 'RC3 Expansion World'}
            </span>

            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3.8vw, 40px)', margin: '4px 0 8px 0' }}>
              {v13Exp.orderIndex}. {v13Exp.countryNameEn}: {v13Exp.cityName} (<span lang={world.storyLang}>{v13Exp.countryNameNative}</span>)
            </h1>
            <p style={{ color: '#FFE29F', fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0' }}>
              {v13Exp.heroTagline}
            </p>
            <p style={{ color: '#E2E8F0', fontSize: '14px', lineHeight: 1.65, marginBottom: '16px' }}>
              {v13Exp.historicalIntroduction}
            </p>

            {/* Mentor Greeting */}
            <div
              style={{
                background: 'rgba(11, 19, 37, 0.78)',
                borderRadius: '16px',
                padding: '12px 16px',
                border: '1px solid rgba(244, 162, 97, 0.4)',
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                marginBottom: '18px',
              }}
            >
              <img src={v13Exp.mentorPortraitUrl} alt={world.mentorName} width={54} height={54} style={{ borderRadius: '50%', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#FEF08A', fontSize: '14px' }}>
                  {world.mentorName} · {world.mentorTitle}
                </strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#CBD5E1' }}>
                  “{world.mentorGreetingEn}”
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link
                to={`/play/${code}`}
                style={{
                  background: '#00B06F',
                  color: '#032215',
                  textDecoration: 'none',
                  padding: '11px 20px',
                  borderRadius: '999px',
                  fontWeight: 900,
                  fontSize: '14px',
                }}
              >
                ▶ Launch Platform &amp; Quest Map ({v13Exp.cityName})
              </Link>
              <Link
                to="/atlas"
                style={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid #38BDF8',
                  color: '#BAE6FD',
                  textDecoration: 'none',
                  padding: '11px 18px',
                  borderRadius: '999px',
                  fontWeight: 800,
                  fontSize: '14px',
                }}
              >
                🗺️ Open World Atlas
              </Link>
              <Link
                to={`/story/${world.storyLang}`}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#FFF8EE',
                  textDecoration: 'none',
                  padding: '11px 18px',
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                Read 15-Scene Story
              </Link>
            </div>
          </div>
        </section>

        {/* Cultural Knowledge Themes (Historical vs Mythological Epistemic Badges) */}
        <section
          data-testid="country-section-cultural-themes"
          style={{
            background: '#131F38',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(244, 162, 97, 0.35)',
            marginBottom: '28px',
          }}
        >
          <h2 style={{ marginTop: 0, fontFamily: 'Georgia, serif', fontSize: '24px', color: '#FFE29F' }}>
            2. Cultural Heritage, History &amp; Epistemic Classification
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '14px', lineHeight: 1.6, marginBottom: '18px' }}>
            {v13Exp.geographicSummary}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
            {v13Exp.culturalThemes.map((theme) => (
              <article
                key={theme.title}
                style={{
                  background: 'rgba(9, 18, 36, 0.85)',
                  borderRadius: '14px',
                  padding: '16px',
                  border: '1px solid rgba(255, 248, 238, 0.12)',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    background: 'rgba(56, 189, 248, 0.16)',
                    border: '1px solid #38BDF8',
                    color: '#BAE6FD',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: 800,
                    marginBottom: '8px',
                  }}
                >
                  {EPISTEMIC_BADGE_LABELS[theme.classification]}
                </span>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#FFF8EE' }}>{theme.title}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1', lineHeight: 1.55 }}>{theme.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 3: Interactive Real-World Geographic Map */}
        <section
          data-testid="country-section-geographic-map"
          style={{
            background: '#131F38',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: '24px', color: '#7DD3FC' }}>
                3. Real-World Geographic Atlas ({v13Exp.cityName}: {v13Exp.coordinatesCenter[0].toFixed(4)}°N, {v13Exp.coordinatesCenter[1].toFixed(4)}°E)
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94A3B8' }}>
                Verified WGS84 coordinates and archaeological/architectural landmarks — separated from fictional adventure checkpoints.
              </p>
            </div>
            <Link to="/atlas" style={{ color: '#7DD3FC', fontWeight: 800, fontSize: '13px' }}>
              Open Full Interactive World Atlas →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
            {v13Exp.landmarks.map((lm) => (
              <article
                key={lm.landmarkId}
                style={{
                  background: 'rgba(9, 18, 36, 0.88)',
                  borderRadius: '14px',
                  padding: '15px',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#7DD3FC', fontWeight: 800, marginBottom: '4px' }}>
                  WGS84: {lm.coordinates[0].toFixed(4)}°N, {lm.coordinates[1].toFixed(4)}°E
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#FFF8EE' }}>
                  {lm.name} ({lm.nativeName})
                </h3>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5 }}>
                  {lm.summary}
                </p>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Ref: {lm.educationalReference}</div>
              </article>
            ))}
          </div>
        </section>

        {/* SECTIONS 4, 5 & 6: 5 Illustrated Quest Maps + 5 Quest Acts + 4 Age-Specific Difficulty Tracks */}
        <section
          data-testid="country-section-quests-and-age-tracks"
          style={{
            background: '#131F38',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(244, 162, 97, 0.45)',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: '24px', color: '#FFE29F' }}>
                4–6. Five Illustrated Quest Maps, Five Quest Acts &amp; Four Age-Adapted Learning Tracks
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#CBD5E1' }}>
                Select any of the 5 quest acts and switch between Ages 5–7, 8–10, 11–13, and 14–17.
              </p>
            </div>

            {/* 4 Age-Specific Difficulty Tracks */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {V13_AGE_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  data-testid={`country-age-tier-${tier.id}`}
                  onClick={() => setSelectedAgeTier(tier.id)}
                  style={{
                    background: selectedAgeTier === tier.id ? '#38BDF8' : 'rgba(9, 18, 36, 0.9)',
                    color: selectedAgeTier === tier.id ? '#082F49' : '#E2E8F0',
                    border: '1px solid rgba(56, 189, 248, 0.45)',
                    borderRadius: '999px',
                    padding: '6px 13px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5 Quest Act Selector */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
            {countryQuests.map((q) => (
              <button
                key={q.questId}
                type="button"
                data-testid={`country-quest-act-${q.actNumber}`}
                onClick={() => setSelectedAct(q.actNumber)}
                style={{
                  background: selectedAct === q.actNumber ? '#F4A261' : 'rgba(9, 18, 36, 0.9)',
                  color: selectedAct === q.actNumber ? '#0B1325' : '#FFF8EE',
                  border: '1px solid rgba(244, 162, 97, 0.45)',
                  borderRadius: '999px',
                  padding: '8px 15px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Act {q.actNumber}: {q.titleEn}
              </button>
            ))}
          </div>

          {/* Active Illustrated Quest Map + 5 Quest Acts Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px', alignItems: 'start' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
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
                    background: wp.kind === 'START' ? '#38BDF8' : wp.kind === 'NPC' ? '#F4A261' : '#10B981',
                    color: '#0B1325',
                    padding: '4px 9px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 900,
                    border: '2px solid #FFF8EE',
                  }}
                >
                  {wp.kind}: {wp.label}
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(9, 18, 36, 0.88)', borderRadius: '16px', padding: '18px' }}>
              <span style={{ fontSize: '11px', color: '#7DD3FC', fontWeight: 800 }}>
                Act {activeQuest.actNumber} of 5 · Track: Ages {selectedAgeTier} · {EPISTEMIC_BADGE_LABELS[activeQuest.epistemicClassification]}
              </span>
              <h3 style={{ margin: '4px 0 8px 0', fontSize: '20px', fontFamily: 'Georgia, serif' }}>
                {activeQuest.titleEn} ({activeQuest.titleNative})
              </h3>
              <p style={{ fontSize: '14px', color: '#E2E8F0', lineHeight: 1.55, marginBottom: '10px' }}>
                {activeQuest.narrativeIntro}
              </p>
              <p style={{ fontSize: '13px', color: '#FDE68A', marginBottom: '10px' }}>
                <strong>Activity ({selectedAgeTier} · {activeStage.focusTitle}):</strong> {activeStage.guidedActivity} — {activeStage.challengePrompt}
              </p>
              <p style={{ fontSize: '13px', color: '#A7F3D0', marginBottom: '12px' }}>
                <strong>Cultural Knowledge:</strong> {activeQuest.culturalKnowledgeSummary} ({activeStage.historicalReflection})
              </p>
              <Link
                to={`/quests/${activeQuest.questId}`}
                style={{ color: '#F4A261', fontWeight: 800, fontSize: '13px' }}
              >
                Open Full Quest Entry in Encyclopedia →
              </Link>
            </div>
          </div>
        </section>

        {/* SECTIONS 7, 8 & 9: Important People & Cultural Figures + Architecture & Landmarks + Food & Traditional Crafts */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            marginBottom: '28px',
          }}
        >
          {/* 7. Important People & Cultural Figures */}
          <section
            data-testid="country-section-figures"
            style={{
              background: '#131F38',
              borderRadius: '18px',
              padding: '20px',
              border: '1px solid rgba(244, 162, 97, 0.35)',
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: '20px', fontFamily: 'Georgia, serif', color: '#FFE29F' }}>
              7. Important People &amp; Cultural Figures
            </h2>
            {v13Exp.importantFigures.map((fig) => (
              <div key={fig.id} style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <strong style={{ color: '#FFF8EE', fontSize: '15px' }}>{fig.name}</strong>{' '}
                <span style={{ fontSize: '12px', color: '#93C5FD' }}>({fig.era})</span>
                <div style={{ fontSize: '12px', color: '#F4A261', fontWeight: 700, marginBottom: '4px' }}>{fig.role}</div>
                <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5 }}>{fig.contribution}</p>
              </div>
            ))}
          </section>

          {/* 8. Architecture & Landmarks */}
          <section
            data-testid="country-section-architecture"
            style={{
              background: '#131F38',
              borderRadius: '18px',
              padding: '20px',
              border: '1px solid rgba(244, 162, 97, 0.35)',
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: '20px', fontFamily: 'Georgia, serif', color: '#FFE29F' }}>
              8. Architecture &amp; Landmarks
            </h2>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#E2E8F0', fontSize: '13px', lineHeight: 1.7 }}>
              {v13Exp.architectureAndLandmarksSummary.map((item) => (
                <li key={item} style={{ marginBottom: '8px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 9. Food & Traditional Crafts */}
          <section
            data-testid="country-section-food-crafts"
            style={{
              background: '#131F38',
              borderRadius: '18px',
              padding: '20px',
              border: '1px solid rgba(244, 162, 97, 0.35)',
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: '20px', fontFamily: 'Georgia, serif', color: '#FFE29F' }}>
              9. Food &amp; Traditional Crafts
            </h2>
            <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#F4A261' }}>[CULINARY HERITAGE]</span>{' '}
              <strong style={{ color: '#FFF8EE', fontSize: '15px' }}>{v13Exp.foodAndCrafts.dishName}</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5 }}>
                {v13Exp.foodAndCrafts.dishDescription}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#6EE7B7' }}>[ARTISAN CRAFT]</span>{' '}
              <strong style={{ color: '#FFF8EE', fontSize: '15px' }}>{v13Exp.foodAndCrafts.craftName}</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5 }}>
                {v13Exp.foodAndCrafts.craftDescription}
              </p>
            </div>
          </section>
        </div>

        {/* SECTION 10: Historical Timeline */}
        <section
          data-testid="country-section-timeline"
          style={{
            background: '#131F38',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(244, 162, 97, 0.35)',
            marginBottom: '28px',
          }}
        >
          <h2 style={{ marginTop: 0, fontFamily: 'Georgia, serif', fontSize: '24px', color: '#FFE29F' }}>
            10. Interactive Historical Timeline ({v13Exp.countryNameEn})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {v13Exp.timeline.map((ev) => (
              <article
                key={ev.title}
                style={{
                  background: 'rgba(9, 18, 36, 0.88)',
                  borderRadius: '14px',
                  padding: '16px',
                  borderLeft: '4px solid #F4A261',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#F4A261', marginBottom: '4px' }}>
                  {ev.era}
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#FFF8EE' }}>{ev.title}</h3>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5 }}>{ev.description}</p>
                <span style={{ fontSize: '10px', color: '#7DD3FC', fontWeight: 800 }}>
                  {EPISTEMIC_BADGE_LABELS[ev.classification]}
                </span>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 11 & 12: Cultural Artifact Gallery + Verified Learning References */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px',
            marginBottom: '28px',
          }}
        >
          {/* 11. Artifact Gallery */}
          <section
            data-testid="country-section-artifacts"
            style={{
              background: '#131F38',
              borderRadius: '20px',
              padding: '22px',
              border: '1px solid rgba(244, 162, 97, 0.35)',
            }}
          >
            <h2 style={{ marginTop: 0, fontFamily: 'Georgia, serif', fontSize: '22px', color: '#FFE29F' }}>
              11. Collectible Cultural Artifacts Gallery
            </h2>
            <img
              src="/art/v13/cultural-artifacts-treasury.jpg"
              alt="MiraVerse Cultural Artifacts Treasury"
              style={{ width: '100%', borderRadius: '12px', aspectRatio: '16 / 9', objectFit: 'cover', marginBottom: '14px' }}
            />
            {v13Exp.artifacts.map((art) => (
              <div key={art.artifactId} style={{ marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <strong style={{ color: '#FFF8EE', fontSize: '15px' }}>
                  {art.name} ({art.nativeName})
                </strong>{' '}
                <span style={{ fontSize: '12px', color: '#93C5FD' }}>· {art.materialAndPeriod}</span>
                <p style={{ margin: '4px 0', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5 }}>
                  {art.description}
                </p>
              </div>
            ))}
          </section>

          {/* 12. Verified Learning References */}
          <section
            data-testid="country-section-references"
            style={{
              background: '#131F38',
              borderRadius: '20px',
              padding: '22px',
              border: '1px solid rgba(56, 189, 248, 0.35)',
            }}
          >
            <h2 style={{ marginTop: 0, fontFamily: 'Georgia, serif', fontSize: '22px', color: '#7DD3FC' }}>
              12. Verified Learning References &amp; Citations
            </h2>
            <p style={{ fontSize: '13px', color: '#CBD5E1', marginBottom: '14px' }}>
              Every cultural, archaeological, and historical lesson in {v13Exp.countryNameEn} is grounded in verified museum and heritage documentation:
            </p>
            {v13Exp.verifiedReferences.map((ref) => (
              <div
                key={ref.title}
                style={{
                  background: 'rgba(9, 18, 36, 0.85)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '12px',
                }}
              >
                <strong style={{ color: '#FFF8EE', fontSize: '14px', display: 'block' }}>{ref.title}</strong>
                <div style={{ fontSize: '12px', color: '#F4A261', fontWeight: 700, margin: '2px 0 6px' }}>
                  Source: {ref.source}
                </div>
                <div style={{ fontSize: '11px', color: '#7DD3FC' }}>
                  Classification: {EPISTEMIC_BADGE_LABELS[ref.classification]}
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* SECTION 13: Truthful Roblox & Minecraft Quest Information */}
        <section
          data-testid="country-section-platform-info"
          style={{
            background: '#131F38',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(0, 176, 111, 0.4)',
          }}
        >
          <h2 style={{ marginTop: 0, fontFamily: 'Georgia, serif', fontSize: '24px', color: '#6EE7B7' }}>
            13. Verified Roblox &amp; Minecraft Bedrock Quest Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(9, 18, 36, 0.85)', padding: '16px', borderRadius: '14px' }}>
              <strong style={{ color: '#6EE7B7', fontSize: '15px', display: 'block', marginBottom: '6px' }}>
                Roblox Social Adventure ({v13Exp.platformInfo.robloxPlayableNow ? 'RC1 Playable Now' : 'RC3 Expansion Planned'})
              </strong>
              <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1', lineHeight: 1.55 }}>
                {v13Exp.platformInfo.robloxSummary}
              </p>
            </div>
            <div style={{ background: 'rgba(9, 18, 36, 0.85)', padding: '16px', borderRadius: '14px' }}>
              <strong style={{ color: '#FDE68A', fontSize: '15px', display: 'block', marginBottom: '6px' }}>
                Minecraft Bedrock Companion ({v13Exp.platformInfo.minecraftAddonReady ? 'RC2 .mcaddon Ready' : 'Planned'})
              </strong>
              <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1', lineHeight: 1.55 }}>
                {v13Exp.platformInfo.minecraftSummary}
              </p>
            </div>
          </div>
          <RobloxLaunchBanner countryCode={code} />
        </section>
      </div>
    </div>
  );
};

export const AdventuresCatalogPage: React.FC = () => (
  <div
    data-testid="adventures-catalog-page"
    style={{
      minHeight: '85vh',
      background: '#0B1325',
      color: '#FFF8EE',
      padding: '36px clamp(16px, 4vw, 56px) 64px',
    }}
  >
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      <span style={{ fontSize: '12px', fontWeight: 800, color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '1.4px' }}>
        How to Play MiraVerse · Ages 5–17 (4 Age-Adapted Tracks)
      </span>
      <h1 style={{ fontFamily: 'Georgia, serif', margin: '6px 0 12px 0' }}>
        Five Hands-On Cultural Quest Mechanics
      </h1>
      <p style={{ color: '#CBD5E1', marginBottom: '28px', maxWidth: '720px' }}>
        Every MiraVerse chapter combines five cozy, non-violent challenge types with zero purchase pressure: <strong>Gather</strong>, <strong>Trade</strong>, <strong>Build</strong>, <strong>Cook</strong>, and <strong>Discover Words</strong>.
      </p>

      <div className="mv-quest-grid-5" style={{ marginBottom: '32px' }}>
        {V08_QUEST_LOOP_STEPS.map((item) => (
          <article
            key={item.type}
            style={{
              background: '#131F38',
              borderRadius: '18px',
              overflow: 'hidden',
              border: '1px solid rgba(244, 162, 97, 0.4)',
            }}
          >
            <img src={item.sceneIllustrationUrl} alt={item.title} style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover' }} />
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <img src={item.iconUrl} alt="" width={32} height={32} />
                <strong style={{ color: '#FEF08A', fontSize: '16px' }}>{item.title}</strong>
              </div>
              <p style={{ fontSize: '13px', color: '#CBD5E1', margin: '0 0 8px 0' }}>{item.description}</p>
              <p style={{ fontSize: '12px', color: '#6EE7B7', margin: 0 }}>{item.byblosExample}</p>
            </div>
          </article>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link
          to="/quests"
          style={{
            background: '#00B06F',
            color: '#032215',
            padding: '12px 24px',
            borderRadius: '999px',
            fontWeight: 900,
            textDecoration: 'none',
          }}
        >
          📖 Open 25-Quest Encyclopedia
        </Link>
        <Link
          to="/explore"
          style={{
            background: '#F4A261',
            color: '#0F172A',
            padding: '12px 22px',
            borderRadius: '999px',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          Explore All 5 Worlds
        </Link>
      </div>
    </div>
  </div>
);

export const CharactersShowcasePage: React.FC = () => (
  <div
    data-testid="characters-showcase-page"
    style={{
      minHeight: '85vh',
      background: '#0B1325',
      color: '#FFF8EE',
      padding: '36px clamp(16px, 4vw, 56px) 64px',
    }}
  >
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      <span style={{ fontSize: '12px', fontWeight: 800, color: '#F4A261', textTransform: 'uppercase', letterSpacing: '1.4px' }}>
        Original Character Cast &amp; Earned Wardrobe
      </span>
      <h1 style={{ fontFamily: 'Georgia, serif', margin: '6px 0 12px 0' }}>
        Meet Mira, Our Five Cultural Mentors &amp; the Roblox Avatar Studio
      </h1>
      <p style={{ color: '#CBD5E1', marginBottom: '20px', maxWidth: '760px' }}>
        Customize your hero inside the Roblox Avatar Studio using earned-only Mira Tokens: equip the Byblos Artisan Heritage Vest, Cedar Explorer Satchel, Cairo Fanous Daypack, Baghdad Sun-Weave Hat, Jeonju Durumagi Jacket, and Vieux Lyon Boulangerie Beret.
      </p>

      <div
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          border: '2px solid rgba(244, 162, 97, 0.5)',
          aspectRatio: '16 / 9',
          marginBottom: '28px',
        }}
      >
        <img
          src="/art/v13/mentors-ensemble.jpg"
          alt="Mira and the Five Cultural Mentors Ensemble"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      <div className="mv-mentor-grid-6">
        <article style={{ background: '#131F38', borderRadius: '18px', padding: '20px', border: '2px solid #F4A261' }}>
          <img src="/art/p0/portrait-mira.jpg" alt="Mira" width={84} height={84} style={{ borderRadius: '50%', marginBottom: '12px', objectFit: 'cover', border: '2px solid #F4A261' }} />
          <h2 style={{ margin: '0 0 6px 0', fontSize: '20px' }}>Mira · Explorer Hero</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1' }}>
            Travels across all five cultural destinations with her illustrated Passport, learning local greetings and restoring neighborhood landmarks alongside community elders.
          </p>
        </article>

        {V13_COUNTRIES_ORDERED.map((code) => {
          const w = V08_WORLD_VISUAL_MAP[code];
          const exp = V13_COUNTRY_EXPERIENCES[code];
          return (
            <article key={code} style={{ background: '#131F38', borderRadius: '18px', padding: '20px', border: `1px solid ${w.primaryColorHex}` }}>
              <img src={w.portraitArtUrl} alt={w.mentorName} width={84} height={84} style={{ borderRadius: '50%', marginBottom: '12px' }} />
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{w.mentorName}</h2>
              <div style={{ fontSize: '12px', color: w.accentColorHex, fontWeight: 700, marginBottom: '8px' }}>
                {exp.orderIndex}. {exp.countryNameEn}: {exp.cityName} · {w.mentorTitle}
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1' }}>“{w.mentorGreetingEn}”</p>
            </article>
          );
        })}
      </div>
    </div>
  </div>
);
