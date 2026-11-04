/**
 * MiraVerse v0.8 — World Library (/explore), World Detail (/explore/:country),
 * Adventures (/adventures), and Characters (/characters) Pages
 * Owners: AG12, AG13, AG14, CL05, CX05
 */
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { COUNTRIES, type CountryCode } from '../../../../../packages/contracts/index';
import {
  V08_QUEST_LOOP_STEPS,
  V08_WORLD_VISUAL_MAP,
} from '../../../../../packages/contracts/v08/index';
import { RobloxLaunchBanner } from '../../launch/RobloxLaunchPage';

export const ExploreAtlasPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'FLAGSHIP' | 'STORIES'>('ALL');
  const byblos = V08_WORLD_VISUAL_MAP.LB;
  const expansionCodes: CountryCode[] = ['EG', 'IQ', 'KR', 'FR'];

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#F4A261', textTransform: 'uppercase', letterSpacing: '1.4px' }}>
              MiraVerse World Library · Option A Release Matrix
            </span>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 44px)', margin: '6px 0 8px 0' }}>
              Explore Five Cultural Worlds
            </h1>
            <p style={{ color: '#CBD5E1', margin: 0, maxWidth: '720px', fontSize: '15px' }}>
              Begin your flagship 3D adventure in <strong>Byblos, Lebanon</strong> on Roblox and the Minecraft Bedrock companion, or read and preview all five 15-scene bilingual stories.
            </p>
          </div>

          {/* Helpful Destination Filter Tabs */}
          <div role="tablist" aria-label="Filter Destinations" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL' as const, label: 'All 5 Worlds' },
              { id: 'FLAGSHIP' as const, label: 'Playable Flagship (RC1)' },
              { id: 'STORIES' as const, label: '15-Scene Stories & Preview' },
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

        {/* Featured Byblos Flagship Hero Card (Always shown) */}
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
              alt={`${byblos.nameEn} — ${byblos.locationLabel}`}
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
              RC1 Flagship · Available First on Roblox &amp; Minecraft Bedrock
            </span>

            <h2 style={{ margin: '0 0 8px 0', fontSize: 'clamp(22px, 3vw, 30px)', fontFamily: 'Georgia, serif' }}>
              {byblos.nameEn} · {byblos.locationLabel} (<span lang="ar-LB">{byblos.nameNative}</span>)
            </h2>

            <p style={{ fontSize: '15px', color: '#E2E8F0', lineHeight: 1.55, marginBottom: '14px' }}>
              {byblos.adventureHook}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <img src={byblos.portraitArtUrl} alt={byblos.mentorName} width={38} height={38} style={{ borderRadius: '50%' }} />
              <span style={{ fontSize: '13px', color: '#CBD5E1' }}>
                Mentor: <strong>{byblos.mentorName}</strong> · Dish: <strong>{byblos.signatureDish}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
                ▶ Play free on Roblox
              </Link>
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
                World Details &amp; Gallery
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

        {/* Symmetrical 4-Column Expansion Grid (EG, IQ, KR, FR — Zero 4+1 Orphan Layout!) */}
        {filter !== 'FLAGSHIP' && (
          <div className="mv-world-grid-4">
            {expansionCodes.map((code) => {
              const world = V08_WORLD_VISUAL_MAP[code];
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
                        alt={`${world.nameEn} — ${world.locationLabel}`}
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
                        RC3 Expansion World · Story &amp; Preview Live
                      </span>

                      <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontFamily: 'Georgia, serif' }}>
                        {world.nameEn} · {world.locationLabel}
                      </h2>
                      <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.48, marginBottom: '12px' }}>
                        {world.adventureHook}
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
                      World Details
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
                      Preview &amp; Launch
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

  return (
    <div
      data-testid={`explore-country-detail-${code}`}
      style={{
        minHeight: '88vh',
        background: '#0B1325',
        color: '#FFF8EE',
        padding: '28px clamp(16px, 4vw, 56px) 64px',
      }}
    >
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <div style={{ marginBottom: '16px' }}>
          <Link to="/explore" style={{ color: '#FFE29F', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>
            ← Back to Five Worlds Library
          </Link>
        </div>

        {/* Art-Directed World Hero Card */}
        <section
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
              src={world.coverArtUrl}
              alt={`${world.nameEn} — ${world.landmarkName}`}
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
              {world.isFlagshipSlice ? 'RC1 Flagship Destination · Roblox & Bedrock' : 'RC3 Expansion Destination · Story & Preview Live'}
            </span>

            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 42px)', margin: '4px 0 10px 0' }}>
              {world.chapterTitle} ({world.nameEn} · <span lang={world.storyLang}>{world.nameNative}</span>)
            </h1>

            <p style={{ color: '#E2E8F0', fontSize: '16px', lineHeight: 1.6, marginBottom: '16px' }}>
              {world.adventureHook}
            </p>

            {/* Mentor Greeting Box */}
            <div
              style={{
                background: 'rgba(11, 19, 37, 0.78)',
                borderRadius: '16px',
                padding: '14px 16px',
                border: '1px solid rgba(244, 162, 97, 0.4)',
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <img src={world.portraitArtUrl} alt={world.mentorName} width={56} height={56} style={{ borderRadius: '50%', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#FEF08A', fontSize: '15px' }}>
                  {world.mentorName} · {world.mentorTitle}
                </strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#CBD5E1' }}>
                  “{world.mentorGreetingEn}”
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                to={`/play/${code}`}
                style={{
                  background: '#00B06F',
                  color: '#032215',
                  textDecoration: 'none',
                  padding: '12px 24px',
                  borderRadius: '999px',
                  fontWeight: 900,
                  fontSize: '15px',
                }}
              >
                ▶ Play free on Roblox ({world.nameEn})
              </Link>
              <Link
                to="/minecraft"
                style={{
                  background: 'rgba(245, 158, 11, 0.22)',
                  border: '1px solid #F59E0B',
                  color: '#FDE68A',
                  textDecoration: 'none',
                  padding: '12px 22px',
                  borderRadius: '999px',
                  fontWeight: 800,
                  fontSize: '14px',
                }}
              >
                Play in Minecraft Bedrock
              </Link>
              <Link
                to={`/story/${world.storyLang}`}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#FFF8EE',
                  textDecoration: 'none',
                  padding: '12px 20px',
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                Read Illustrated Story ({world.storyLang})
              </Link>
            </div>
          </div>
        </section>

        {/* Official Roblox Launch Status Banner */}
        <RobloxLaunchBanner countryCode={code} />

        {/* Architectural Cues & Collectible Stamp Showcase */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '22px',
            marginTop: '28px',
            marginBottom: '32px',
          }}
        >
          <section
            style={{
              background: '#131F38',
              borderRadius: '18px',
              padding: '22px',
              border: '1px solid rgba(244, 162, 97, 0.35)',
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: '20px', fontFamily: 'Georgia, serif', color: '#FEF08A' }}>
              Authentic Architectural &amp; Cultural Details
            </h2>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#E2E8F0', fontSize: '14px', lineHeight: 1.7 }}>
              {world.architecturalCues.map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
              <li>
                Signature Culinary Tradition: <strong>{world.signatureDish}</strong>
              </li>
            </ul>
          </section>

          <section
            style={{
              background: '#131F38',
              borderRadius: '18px',
              padding: '22px',
              border: '1px solid rgba(244, 162, 97, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
            }}
          >
            <img src={world.stampArtUrl} alt={`${world.nameEn} Passport Stamp`} width={96} height={96} style={{ flexShrink: 0 }} />
            <div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontFamily: 'Georgia, serif', color: '#FEF08A' }}>
                Chapter 1 Collectible Stamp
              </h2>
              <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5 }}>
                Complete all five cultural quests (Gather, Trade, Build, Cook, and Word) to earn the {world.nameEn} souvenir stamp in your Passport.
              </p>
              <Link to="/passport" style={{ color: '#6EE7B7', fontWeight: 800, fontSize: '13px' }}>
                View in My Passport →
              </Link>
            </div>
          </section>
        </div>

        {/* 5 Illustrated Story & Quest Scene Cards */}
        <section>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', marginBottom: '14px' }}>
            Illustrated Chapter Scenes ({world.nameEn})
          </h2>
          <div className="mv-quest-grid-5">
            {world.sceneArtUrls.map((sceneUrl, idx) => {
              const step = V08_QUEST_LOOP_STEPS[idx];
              return (
                <article
                  key={sceneUrl}
                  style={{
                    background: '#131F38',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <img
                    src={sceneUrl}
                    alt={`${world.nameEn} Scene ${idx + 1}: ${step?.title || ''}`}
                    loading="eager"
                    style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '12px' }}>
                    <strong style={{ fontSize: '13px', color: '#FEF08A', display: 'block' }}>
                      {idx + 1}. {step?.title}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#CBD5E1' }}>{step?.badge}</span>
                  </div>
                </article>
              );
            })}
          </div>
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
        How to Play MiraVerse · Ages 8–12
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
          to="/play/LB"
          style={{
            background: '#00B06F',
            color: '#032215',
            padding: '12px 24px',
            borderRadius: '999px',
            fontWeight: 900,
            textDecoration: 'none',
          }}
        >
          ▶ Play free on Roblox (Byblos)
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
        Meet Mira, Our Elder Mentors &amp; the Roblox Avatar Studio
      </h1>
      <p style={{ color: '#CBD5E1', marginBottom: '28px', maxWidth: '760px' }}>
        Customize your hero inside the Roblox Avatar Studio using earned-only Mira Tokens: equip the Byblos Artisan Heritage Vest, Cedar Explorer Satchel, Cairo Fanous Daypack, Baghdad Sun-Weave Hat, Jeonju Durumagi Jacket, and Vieux Lyon Boulangerie Beret.
      </p>

      <div className="mv-mentor-grid-6">
        <article style={{ background: '#131F38', borderRadius: '18px', padding: '20px', border: '2px solid #F4A261' }}>
          <img src="/art/p0/portrait-mira.jpg" alt="Mira" width={84} height={84} style={{ borderRadius: '50%', marginBottom: '12px', objectFit: 'cover', border: '2px solid #F4A261' }} />
          <h2 style={{ margin: '0 0 6px 0', fontSize: '20px' }}>Mira · Explorer Hero</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1' }}>
            Travels across all five cultural destinations with her illustrated Passport, learning local greetings and restoring neighborhood landmarks alongside community elders.
          </p>
        </article>

        {COUNTRIES.map((code) => {
          const w = V08_WORLD_VISUAL_MAP[code];
          return (
            <article key={code} style={{ background: '#131F38', borderRadius: '18px', padding: '20px', border: `1px solid ${w.primaryColorHex}` }}>
              <img src={w.portraitArtUrl} alt={w.mentorName} width={84} height={84} style={{ borderRadius: '50%', marginBottom: '12px' }} />
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{w.mentorName}</h2>
              <div style={{ fontSize: '12px', color: w.accentColorHex, fontWeight: 700, marginBottom: '8px' }}>
                {w.nameEn} · {w.mentorTitle}
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1' }}>“{w.mentorGreetingEn}”</p>
            </article>
          );
        })}
      </div>
    </div>
  </div>
);
