/**
 * MiraVerse v0.8 Cinematic Public Homepage (`apps/web/src/landing/ui/index.tsx`)
 * Owners: AG03, AG11, AG14, AG19, CL04, CX04
 * - Original illustrated Byblos Harbor hero scene with Mira & Teta Nahla (zero flat-shaded cylinders)
 * - Single shared site header in App.tsx (no duplicate header on homepage)
 * - Balanced World Discovery Shelf: Featured Byblos Flagship card + 4-column expansion grid (never 4+1 orphan row)
 * - Illustrated 5-step quest loop, character portraits, Passport preview, Roblox co-op & Bedrock companion
 * - Zero product pricing, cart, or purchase buttons in child-facing surfaces (C01..C04 preserved)
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { COUNTRIES, type CountryCode } from '../../../../../packages/contracts/index';
import {
  V08_CULTURAL_REVIEW_STATUS,
  V08_QUEST_LOOP_STEPS,
  V08_RELEASE_VERSION,
  V08_WORLD_VISUAL_MAP,
} from '../../../../../packages/contracts/v08/index';

const EXPANSION_COUNTRIES: CountryCode[] = ['EG', 'IQ', 'KR', 'FR'];

export const CinematicLandingPage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('LB');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    setReducedMotion(Boolean(mq?.matches));
  }, []);

  const activeWorld = V08_WORLD_VISUAL_MAP[selectedCountry];
  const byblos = V08_WORLD_VISUAL_MAP.LB;

  return (
    <div
      className="mv-cinematic-landing"
      data-testid="cinematic-landing-page"
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      style={{
        minHeight: '100vh',
        background: '#0B1325',
        color: '#FFF8EE',
        overflowX: 'hidden',
      }}
    >
      {/* 1. CINEMATIC HERO: Mira & Teta Nahla in Byblos Harbor */}
      <section
        aria-label="MiraVerse Cinematic World Hero"
        data-testid="landing-hero-viewport"
        style={{
          position: 'relative',
          padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 56px)',
          background:
            'radial-gradient(circle at 70% 28%, rgba(13, 148, 136, 0.28) 0%, rgba(30, 58, 138, 0.36) 45%, #0B1325 85%)',
          borderBottom: '1px solid rgba(244, 162, 97, 0.35)',
        }}
      >
        {/* Static Poster Fallback Layer for LCP and Reduced Motion */}
        <div
          data-testid="landing-hero-fallback"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(11,19,37,0.35) 0%, rgba(11,19,37,0.92) 100%), radial-gradient(circle at 65% 40%, ${activeWorld.primaryColorHex}44 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 3,
            maxWidth: '1320px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))',
            gap: 'clamp(20px, 3.5vw, 40px)',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Story-Led Headline, Honest Platform Badges & Primary Roblox CTA */}
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(16, 185, 129, 0.18)',
                  border: '1px solid #10B981',
                  color: '#A7F3D0',
                  padding: '5px 14px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                ★ Ages 8–12 Cultural Adventure · Flagship on Roblox
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'rgba(244, 162, 97, 0.16)',
                  border: '1px solid rgba(244, 162, 97, 0.55)',
                  color: '#FFE29F',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                Byblos, Lebanon Chapter Ready
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(30px, 4.6vw, 54px)',
                lineHeight: 1.08,
                margin: '0 0 14px 0',
                color: '#FFF8EE',
              }}
            >
              Five Living Worlds. One Unforgettable Cultural Adventure.
            </h1>

            <p
              style={{
                fontSize: 'clamp(15px, 1.8vw, 18px)',
                color: '#E2E8F0',
                lineHeight: 1.55,
                margin: '0 0 22px 0',
                maxWidth: '600px',
              }}
            >
              Join <strong>Mira</strong> and warm community elders across{' '}
              <strong>Byblos Harbor</strong>, <strong>Historic Cairo</strong>,{' '}
              <strong>Baghdad’s Tigris Courtyards</strong>, <strong>Jeonju Hanok Village</strong>, and{' '}
              <strong>Vieux Lyon</strong>. Gather local herbs, restore treasured landmarks, bake signature dishes, and collect illustrated Passport stamps.
            </p>

            {/* Primary & Secondary CTAs */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
              <Link
                to="/play/LB"
                data-testid="cta-play-free"
                style={{
                  background: 'linear-gradient(135deg, #00B06F 0%, #059669 100%)',
                  color: '#032215',
                  textDecoration: 'none',
                  padding: '14px 28px',
                  borderRadius: '999px',
                  fontSize: '17px',
                  fontWeight: 900,
                  boxShadow: '0 10px 24px rgba(0, 176, 111, 0.35)',
                  border: '2px solid #A7F3D0',
                }}
              >
                ▶ Play free on Roblox
              </Link>

              <Link
                to="/explore"
                data-testid="cta-explore-worlds"
                style={{
                  background: 'rgba(244, 162, 97, 0.18)',
                  color: '#FEF08A',
                  textDecoration: 'none',
                  padding: '13px 22px',
                  borderRadius: '999px',
                  fontSize: '15px',
                  fontWeight: 800,
                  border: '1px solid #F4A261',
                }}
              >
                Explore 5 Worlds
              </Link>

              <Link
                to="/minecraft"
                data-testid="cta-enter-hub"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FDE68A',
                  textDecoration: 'none',
                  padding: '12px 18px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                }}
              >
                Play in Minecraft Bedrock
              </Link>

              <Link
                to="/play/FR"
                data-testid="cta-preview-fr"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#CBD5E1',
                  textDecoration: 'none',
                  padding: '11px 16px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                }}
              >
                Web 3D Preview (FR)
              </Link>
            </div>

            <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.45 }}>
              <strong>Truthful Platform Access:</strong> Roblox play requires the free Roblox app and account. Minecraft companion requires Minecraft Bedrock Edition (v1.21.50+). Illustrated bilingual stories and local Passport souvenirs work directly in your browser.
            </p>
          </div>

          {/* Right Column: Art-Directed Multi-Layered Byblos Harbor Illustration Card */}
          <div
            style={{
              background: '#131F38',
              borderRadius: '24px',
              padding: '12px',
              border: '2px solid rgba(244, 162, 97, 0.65)',
              boxShadow: '0 22px 48px rgba(0, 0, 0, 0.55)',
            }}
          >
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16 / 9.4', background: '#0B1933' }}>
              <img
                src={selectedCountry === 'LB' ? '/art/v08/hero-byblos-scene.svg' : activeWorld.coverArtUrl}
                alt={`${activeWorld.nameEn} — ${activeWorld.locationLabel} with ${activeWorld.mentorName}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Overlay Scene Caption Pill */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  background: 'rgba(11, 19, 37, 0.88)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  border: '1px solid rgba(244, 162, 97, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={activeWorld.portraitArtUrl}
                    alt={activeWorld.mentorName}
                    width={42}
                    height={42}
                    style={{ borderRadius: '50%', border: '2px solid #F4A261', flexShrink: 0 }}
                  />
                  <div>
                    <strong style={{ fontSize: '14px', color: '#FEF08A', display: 'block' }}>
                      {activeWorld.nameEn}: {activeWorld.chapterTitle} ({activeWorld.locationLabel})
                    </strong>
                    <span style={{ fontSize: '12px', color: '#CBD5E1' }}>
                      Mentor: <strong>{activeWorld.mentorName}</strong> · Dish: <strong>{activeWorld.signatureDish}</strong>
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    background: activeWorld.isFlagshipSlice ? 'rgba(16, 185, 129, 0.22)' : 'rgba(244, 162, 97, 0.2)',
                    color: activeWorld.isFlagshipSlice ? '#6EE7B7' : '#FDE68A',
                    border: `1px solid ${activeWorld.isFlagshipSlice ? '#10B981' : '#F4A261'}`,
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  {activeWorld.robloxStatusLabel}
                </span>
              </div>
            </div>

            {/* Interactive 5-World Scene Switcher inside Hero Artwork Frame */}
            <div
              role="region"
              aria-label="Interactive Destination Preview"
              data-testid="hero-world-switcher"
              style={{
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '4px 6px',
              }}
            >
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }} role="tablist" aria-label="Five Cultural Worlds">
                {COUNTRIES.map((code) => {
                  const w = V08_WORLD_VISUAL_MAP[code];
                  const active = selectedCountry === code;
                  return (
                    <button
                      key={code}
                      role="tab"
                      aria-selected={active}
                      data-testid={`preview-tab-${code}`}
                      type="button"
                      onClick={() => setSelectedCountry(code)}
                      style={{
                        padding: '6px 12px',
                        minBlockSize: '34px',
                        borderRadius: '999px',
                        border: active ? '2px solid #FEF08A' : '1px solid rgba(255,255,255,0.2)',
                        background: active ? w.primaryColorHex : 'rgba(255,255,255,0.06)',
                        color: '#FFF8EE',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      {w.nameEn} · <span lang={w.storyLang}>{w.nameNative.split('·').pop()?.trim()}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to={`/explore/${selectedCountry}`}
                  data-testid={`launch-world-${selectedCountry}`}
                  style={{
                    background: '#F4A261',
                    color: '#0F172A',
                    textDecoration: 'none',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  Explore {activeWorld.nameEn} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WORLD DISCOVERY SHELF: Featured Byblos Flagship + Balanced 4-World Grid (Zero 4+1 Orphan!) */}
      <section
        id="worlds"
        aria-label="Five Living Cultural Worlds"
        style={{ padding: '52px clamp(16px, 4vw, 56px)', maxWidth: '1360px', margin: '0 auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '26px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#F4A261', textTransform: 'uppercase', letterSpacing: '1.4px' }}>
              Cultural World Library · Five Destinations
            </span>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3.4vw, 38px)', margin: '6px 0 8px 0' }}>
              Choose Your Cultural Destination
            </h2>
            <p style={{ color: '#CBD5E1', margin: 0, maxWidth: '720px', fontSize: '15px' }}>
              Start in our flagship <strong>Byblos Harbor, Lebanon</strong> adventure on Roblox and Minecraft Bedrock, or read and preview all five 15-scene bilingual stories.
            </p>
          </div>
          <Link
            to="/explore"
            style={{
              color: '#FEF08A',
              fontWeight: 800,
              fontSize: '14px',
              textDecoration: 'none',
              padding: '10px 18px',
              borderRadius: '999px',
              border: '1px solid rgba(244, 162, 97, 0.5)',
              background: '#131F38',
            }}
          >
            Open Full World Atlas →
          </Link>
        </div>

        {/* Featured Flagship Spotlight Card: Byblos, Lebanon (LB) */}
        <article
          data-testid="country-card-LB"
          style={{
            background: 'linear-gradient(135deg, #112A34 0%, #131F38 60%, #0F172A 100%)',
            borderRadius: '22px',
            border: '2px solid #10B981',
            padding: 'clamp(18px, 3vw, 28px)',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
            gap: '24px',
            alignItems: 'center',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.35)',
          }}
        >
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(244, 162, 97, 0.45)', aspectRatio: '16 / 10' }}>
            <img
              src={byblos.coverArtUrl}
              alt="Byblos Harbor & Traditional Lebanese Saj Bakery"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div data-testid="world-card-LB">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.22)',
                  color: '#6EE7B7',
                  border: '1px solid #10B981',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                ★ {byblos.robloxStatusLabel}
              </span>
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#FDE68A',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {byblos.minecraftStatusLabel}
              </span>
            </div>

            <h3 style={{ margin: '4px 0 8px 0', fontSize: 'clamp(22px, 2.8vw, 30px)', fontFamily: 'Georgia, serif' }}>
              {byblos.nameEn}: {byblos.chapterTitle} · <span lang="ar-LB">{byblos.nameNative}</span>
            </h3>

            <p style={{ fontSize: '15px', color: '#E2E8F0', lineHeight: 1.55, margin: '0 0 14px 0' }}>
              {byblos.adventureHook}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '14px' }}>
              <img src={byblos.portraitArtUrl} alt={byblos.mentorName} width={44} height={44} style={{ borderRadius: '50%', border: '2px solid #F4A261' }} />
              <div style={{ fontSize: '13px', color: '#CBD5E1' }}>
                <strong style={{ color: '#FEF08A' }}>{byblos.mentorName}</strong> ({byblos.mentorTitle})
                <div lang="ar-LB" dir="rtl" style={{ color: '#A7F3D0', fontWeight: 700 }}>{byblos.mentorGreetingNative}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link
                to="/play/LB"
                data-testid="play-chapter-LB"
                style={{
                  background: 'linear-gradient(135deg, #00B06F 0%, #059669 100%)',
                  color: '#032215',
                  textDecoration: 'none',
                  padding: '11px 22px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 900,
                }}
              >
                ▶ Play free on Roblox (Byblos)
              </Link>
              <Link
                to="/explore/LB"
                style={{
                  background: '#F4A261',
                  color: '#0F172A',
                  textDecoration: 'none',
                  padding: '11px 18px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 800,
                }}
              >
                World Guide &amp; Quests
              </Link>
              <Link
                to={`/story/${byblos.storyLang}`}
                data-testid="read-story-LB"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#FFF8EE',
                  textDecoration: 'none',
                  padding: '11px 18px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                Read Story ({byblos.storyLang})
              </Link>
            </div>
          </div>
        </article>

        {/* Balanced 4-Column Shelf for Cairo, Baghdad, Jeonju, and Vieux Lyon (Never 4+1 Orphan!) */}
        <div className="mv-world-grid-4">
          {EXPANSION_COUNTRIES.map((code) => {
            const world = V08_WORLD_VISUAL_MAP[code];
            return (
              <article
                key={code}
                data-testid={`country-card-${code}`}
                style={{
                  background: `linear-gradient(180deg, ${world.surfaceTintHex} 0%, #131F38 100%)`,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: `1px solid ${world.primaryColorHex}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div>
                  <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden', background: '#0F172A' }}>
                    <img
                      src={world.coverArtUrl}
                      alt={`${world.nameEn} — ${world.landmarkName}`}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(11, 19, 37, 0.86)',
                        color: '#FDE68A',
                        border: '1px solid rgba(244, 162, 97, 0.6)',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {world.robloxStatusLabel}
                    </span>
                  </div>

                  <div data-testid={`world-card-${code}`} style={{ padding: '16px 18px 10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: world.accentColorHex, textTransform: 'uppercase' }}>
                      {world.locationLabel}
                    </div>
                    <h3 style={{ margin: '4px 0 6px 0', fontSize: '20px', fontFamily: 'Georgia, serif' }}>
                      {world.nameEn} · <span lang={world.storyLang}>{world.nameNative.split('·').pop()?.trim()}</span>
                    </h3>
                    <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.48, margin: '0 0 12px 0' }}>
                      {world.adventureHook}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#E2E8F0' }}>
                      <img src={world.portraitArtUrl} alt={world.mentorName} width={28} height={28} style={{ borderRadius: '50%' }} />
                      <span>Mentor: <strong>{world.mentorName}</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '12px 18px 18px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Link
                    to={`/play/${code}`}
                    data-testid={`play-chapter-${code}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      background: world.primaryColorHex,
                      color: '#FFF8EE',
                      textDecoration: 'none',
                      padding: '9px 10px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    Preview &amp; Launch
                  </Link>
                  <Link
                    to={`/story/${world.storyLang}`}
                    data-testid={`read-story-${code}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#FFF8EE',
                      textDecoration: 'none',
                      padding: '9px 10px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    Read Story
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. HOW IT PLAYS: Illustrated 5-Step Cultural Quest Loop */}
      <section
        aria-label="How Adventure Learning Works"
        style={{
          background: '#131F38',
          padding: '52px clamp(16px, 4vw, 56px)',
          borderTop: '1px solid rgba(244, 162, 97, 0.25)',
          borderBottom: '1px solid rgba(244, 162, 97, 0.25)',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '1.4px' }}>
            How MiraVerse Plays · Zero Combat, Zero Loot Boxes
          </span>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3.2vw, 36px)', margin: '6px 0 8px 0' }}>
            Explore → Meet → Build → Cook → Earn Your Stamp
          </h2>
          <p style={{ color: '#CBD5E1', marginBottom: '26px', maxWidth: '720px', fontSize: '15px' }}>
            Every chapter guides players through five cozy, hands-on cultural activities designed for ages 8–12.
          </p>

          <div className="mv-quest-grid-5">
            {V08_QUEST_LOOP_STEPS.map((item) => (
              <article
                key={item.type}
                data-testid={`quest-step-card-${item.type}`}
                style={{
                  background: '#0B1325',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '1px solid rgba(244, 162, 97, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '16 / 10', background: '#1E293B' }}>
                  <img
                    src={item.sceneIllustrationUrl}
                    alt={item.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <img
                    src={item.iconUrl}
                    alt=""
                    width={38}
                    height={38}
                    style={{ position: 'absolute', bottom: '8px', right: '8px', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
                  />
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#F4A261', textTransform: 'uppercase' }}>
                    {item.badge}
                  </span>
                  <h3 style={{ margin: '4px 0 6px 0', fontSize: '17px' }}>{item.title}</h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.45 }}>{item.description}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#A7F3D0', fontStyle: 'italic' }}>
                    Byblos: {item.byblosExample}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MEET THE CHARACTERS & MENTORS */}
      <section
        aria-label="Meet Mira and the Cultural Mentors"
        style={{ padding: '52px clamp(16px, 4vw, 56px)', maxWidth: '1360px', margin: '0 auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#F4A261', textTransform: 'uppercase', letterSpacing: '1.4px' }}>
              Original Cast &amp; Roblox Avatar Studio
            </span>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3.2vw, 36px)', margin: '6px 0 6px 0' }}>
              Meet Mira &amp; Our Five Community Mentors
            </h2>
          </div>
          <Link to="/characters" style={{ color: '#FEF08A', fontWeight: 800, fontSize: '14px', textDecoration: 'none' }}>
            View Character &amp; Avatar Wardrobe →
          </Link>
        </div>

        <div className="mv-mentor-grid-6">
          <article
            style={{
              background: 'linear-gradient(135deg, #1E3A8A 0%, #131F38 100%)',
              borderRadius: '18px',
              padding: '18px',
              border: '1px solid #F4A261',
              display: 'flex',
              gap: '14px',
              alignItems: 'center',
            }}
          >
            <img src="/art/v08/portraits/mira.svg" alt="Mira" width={68} height={68} style={{ borderRadius: '50%', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#FEF08A' }}>PLAYABLE HERO</span>
              <h3 style={{ margin: '2px 0 4px 0', fontSize: '18px' }}>Mira</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#E2E8F0' }}>
                Curious young traveler who collects cultural words, restores neighborhood landmarks, and earns heritage attire in the Roblox Avatar Studio.
              </p>
            </div>
          </article>

          {COUNTRIES.map((code) => {
            const w = V08_WORLD_VISUAL_MAP[code];
            return (
              <article
                key={code}
                style={{
                  background: '#131F38',
                  borderRadius: '18px',
                  padding: '18px',
                  border: `1px solid ${w.primaryColorHex}`,
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                }}
              >
                <img src={w.portraitArtUrl} alt={w.mentorName} width={68} height={68} style={{ borderRadius: '50%', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: w.accentColorHex }}>
                    {w.nameEn.toUpperCase()} MENTOR
                  </span>
                  <h3 style={{ margin: '2px 0 4px 0', fontSize: '18px' }}>{w.mentorName}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1' }}>
                    “{w.mentorGreetingEn}”
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 5. COLLECTIBLE PASSPORT, ROBLOX CO-OP, MINECRAFT BEDROCK & PARENT TRUST */}
      <section
        aria-label="Passport, Platforms, and Family Safety"
        style={{
          background: '#131F38',
          padding: '52px clamp(16px, 4vw, 56px)',
          borderTop: '1px solid rgba(244, 162, 97, 0.25)',
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            gap: '22px',
          }}
        >
          {/* Collectible Passport Card */}
          <div
            style={{
              background: '#0B1325',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(244, 162, 97, 0.45)',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', overflowX: 'auto' }}>
              {COUNTRIES.map((code) => (
                <img
                  key={code}
                  src={V08_WORLD_VISUAL_MAP[code].stampArtUrl}
                  alt={`${V08_WORLD_VISUAL_MAP[code].nameEn} Stamp`}
                  width={56}
                  height={56}
                  loading="lazy"
                  style={{ borderRadius: '10px', flexShrink: 0 }}
                />
              ))}
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '21px', fontFamily: 'Georgia, serif', color: '#FEF08A' }}>
              Illustrated Explorer Passport &amp; Souvenir Stamps
            </h3>
            <p style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.55, margin: '0 0 16px 0' }}>
              Collect perforated cultural stamps for every chapter! Browser souvenir stamps are stored locally on your device, while Roblox quest progress and earned Mira Tokens are saved inside Roblox DataStoreService.
            </p>
            <Link
              to="/passport"
              style={{
                display: 'inline-block',
                background: '#F4A261',
                color: '#0F172A',
                textDecoration: 'none',
                padding: '10px 20px',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '14px',
              }}
            >
              Open My Explorer Passport →
            </Link>
          </div>

          {/* Roblox Co-op & Minecraft Bedrock Companion Card */}
          <div
            data-testid="option-a-platform-strip"
            style={{
              background: '#0B1325',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(16, 185, 129, 0.45)',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#6EE7B7', textTransform: 'uppercase' }}>
              Safe Co-Op on Roblox + Minecraft Bedrock Companion
            </span>
            <h3 style={{ margin: '6px 0 8px 0', fontSize: '21px', fontFamily: 'Georgia, serif' }}>
              Play With Friends &amp; Build Block-by-Block
            </h3>
            <p style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.55, margin: '0 0 16px 0' }}>
              In Roblox, invite trusted friends via native <code>SocialService</code> for 2-player Byblos herb gathering and owner-permissioned courtyard building using safe predefined phrases (no open text chat). Or download the free <code>.mcaddon</code> for <strong>Minecraft Bedrock Edition (v1.21.50+)</strong>.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link
                to="/play/LB"
                data-testid="strip-cta-play-roblox"
                style={{
                  background: '#00B06F',
                  color: '#032215',
                  textDecoration: 'none',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  fontWeight: 900,
                  fontSize: '13px',
                }}
              >
                ▶ Play free on Roblox
              </Link>
              <Link
                to="/minecraft"
                data-testid="strip-cta-play-minecraft"
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#FDE68A',
                  border: '1px solid #F59E0B',
                  textDecoration: 'none',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  fontWeight: 800,
                  fontSize: '13px',
                }}
              >
                Play in Minecraft Bedrock
              </Link>
            </div>
          </div>

          {/* For Parents & Guardians Trust Card */}
          <div
            style={{
              background: '#0B1325',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(56, 189, 248, 0.45)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <img src="/art/v08/commerce/parent-trust-shield.svg" alt="" width={42} height={42} />
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase' }}>
                  For Parents, Guardians &amp; Educators
                </span>
                <h3 style={{ margin: 0, fontSize: '20px', fontFamily: 'Georgia, serif' }}>
                  Safe by Design · Adult-Gated Gifts
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.55, margin: '0 0 16px 0' }}>
              Zero ads, zero loot boxes, and zero purchase prompts in child gameplay. Earned Mira Tokens never mix with real money. Optional printable family gifts in the Parent Portal operate in <strong>Stripe Test Mode Only</strong>.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link
                to="/parents"
                data-testid="cta-for-parents"
                style={{
                  background: '#38BDF8',
                  color: '#0F172A',
                  textDecoration: 'none',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  fontWeight: 800,
                  fontSize: '13px',
                }}
              >
                Parent &amp; Guardian Portal
              </Link>
              <Link
                to="/about"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#E2E8F0',
                  textDecoration: 'none',
                  padding: '10px 16px',
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                Educator &amp; Safety Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUTHFUL FOOTER WITH ACCESSIBILITY MOTION CONTROL */}
      <footer
        role="contentinfo"
        data-testid="landing-footer"
        style={{
          padding: '36px clamp(16px, 4vw, 56px)',
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          fontSize: '13px',
          color: '#94A3B8',
        }}
      >
        <div>
          <strong style={{ color: '#FFF8EE' }}>
            MiraVerse Studio · v{V08_RELEASE_VERSION} (Option A Release Candidate)
          </strong>
          <p style={{ margin: '4px 0 0 0', maxWidth: '680px' }}>
            Cultural Content Status: <code>{V08_CULTURAL_REVIEW_STATUS}</code>. Designed with child-privacy and data-minimization safeguards (no open chat, no behavioral ads, no paid progression). Roblox and Minecraft are trademarks of their respective owners.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            data-testid="toggle-reduced-motion"
            onClick={() => setReducedMotion((prev) => !prev)}
            style={{
              background: '#131F38',
              color: '#CBD5E1',
              border: '1px solid rgba(244, 162, 97, 0.4)',
              borderRadius: '999px',
              padding: '6px 14px',
              minBlockSize: '34px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {reducedMotion ? 'Animation: Reduced Motion On' : 'Animation: Comfort Motion'}
          </button>
          <Link to="/parents" style={{ color: '#FFE29F', textDecoration: 'none' }}>Parent Portal</Link>
          <Link to="/privacy" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/terms" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Terms</Link>
          <Link to="/refunds" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Refunds</Link>
          <Link to="/support" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Support</Link>
          <Link to="/about" style={{ color: '#CBD5E1', textDecoration: 'none' }}>About &amp; Educators</Link>
        </div>
      </footer>
    </div>
  );
};
