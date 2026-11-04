/**
 * MiraVerse v0.4 Cinematic Public Homepage (`apps/web/src/landing/ui/index.tsx`)
 * Owner: AG26 (Stage V4-03)
 * - Full-bleed animated 3D diorama hero + immediate high-craft static poster fallback
 * - Prominent "Play Free" primary CTA (/play), secondary "Explore Worlds", distinct "For Parents" (/parents)
 * - Zero product pricing, cart, or purchase buttons in child-facing hero (C01, C02, C03, C04)
 * - Interactive 5-world switcher, character intros, muted in-engine preview, how adventure learning works
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  COUNTRIES,
  COUNTRY_META,
  type CountryCode,
} from '../../../../../packages/contracts/index';
import { mountLandingDiorama, type LandingDioramaController } from '../scene/index';

export const CinematicLandingPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerRef = useRef<LandingDioramaController | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('FR');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [rendererMode, setRendererMode] = useState<string>('StaticPosterFallback');

  useEffect(() => {
    const mq = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    const isReduced = Boolean(mq?.matches);
    setReducedMotion(isReduced);

    const ctrl = mountLandingDiorama(canvasRef.current, {
      initialCountry: 'FR',
      reducedMotion: isReduced,
    });
    controllerRef.current = ctrl;
    setRendererMode(ctrl.mode);

    return () => {
      ctrl.dispose();
      controllerRef.current = null;
    };
  }, []);

  const handleSelectWorld = (code: CountryCode) => {
    setSelectedCountry(code);
    controllerRef.current?.focusCountry(code);
  };

  const activeMeta = COUNTRY_META[selectedCountry];

  return (
    <div
      className="mv-cinematic-landing"
      data-testid="cinematic-landing-page"
      style={{
        minHeight: '100vh',
        background: '#0B1325',
        color: '#FFF8EE',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflowX: 'hidden',
      }}
    >
      {/* First Viewport: Full-Bleed 3D Panorama + Static Poster Fallback */}
      <section
        aria-label="MiraVerse Cinematic World Hero"
        data-testid="landing-hero-viewport"
        style={{
          position: 'relative',
          minHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px clamp(16px, 4vw, 56px) 40px',
          background: 'radial-gradient(circle at 50% 32%, #1E3A8A 0%, #0F172A 72%)',
          borderBottom: '2px solid rgba(244, 162, 97, 0.35)',
        }}
      >
        {/* Static SVG Poster Fallback Layer (Always rendered immediately for LCP and WebGL-disabled browsers) */}
        <div
          data-testid="landing-hero-fallback"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(11,19,37,0.45) 0%, rgba(11,19,37,0.88) 100%), radial-gradient(circle at 50% 45%, ${activeMeta.primaryColorHex}55 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Real-Time Babylon.js 3D Diorama Layer */}
        <canvas
          ref={canvasRef}
          data-testid="landing-3d-canvas"
          aria-label="Interactive 3D World Panorama"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0.72,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* Top Restrained Navigation Bar */}
        <header
          style={{
            position: 'relative',
            zIndex: 5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F4A261 0%, #E76F51 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: '#0F172A',
                fontSize: '20px',
              }}
            >
              ✦
            </div>
            <div>
              <strong style={{ fontSize: '22px', letterSpacing: '0.8px', fontFamily: 'Georgia, serif', display: 'block' }}>
                MiraVerse
              </strong>
              <span style={{ fontSize: '11px', color: '#F4A261', letterSpacing: '1.8px', textTransform: 'uppercase' }}>
                3D Cultural Storybook Adventure
              </span>
            </div>
          </div>

          <nav aria-label="Landing Navigation" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a
              href="#worlds"
              style={{ color: '#E2E8F0', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '6px 10px' }}
            >
              Explore Worlds
            </a>
            <Link
              to="/passport"
              style={{ color: '#E2E8F0', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '6px 10px' }}
            >
              Passport
            </Link>
            <Link
              to="/parents"
              data-testid="cta-for-parents"
              style={{
                color: '#FFE29F',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700,
                padding: '7px 14px',
                borderRadius: '999px',
                border: '1px solid rgba(244, 162, 97, 0.55)',
                background: 'rgba(15, 23, 42, 0.75)',
              }}
            >
              For Parents &amp; Guardians
            </Link>
          </nav>
        </header>

        {/* Center Hero Foreground & Primary Play Free CTA */}
        <div
          style={{
            position: 'relative',
            zIndex: 5,
            maxWidth: '760px',
            margin: 'auto 0',
            padding: '28px 0',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(244, 162, 97, 0.18)',
              border: '1px solid #F4A261',
              color: '#FFE29F',
              padding: '5px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '14px',
            }}
          >
            Five Living 3D Cultural Destinations · Free Guest Play · Zero Accounts Required
          </span>

          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(30px, 5vw, 56px)',
              lineHeight: 1.12,
              margin: '0 0 16px 0',
              color: '#FFF8EE',
            }}
          >
            Step Into a Handcrafted 3D World of Stories, Architecture &amp; Heritage
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 2vw, 19px)',
              color: '#CBD5E1',
              lineHeight: 1.55,
              margin: '0 0 26px 0',
              maxWidth: '640px',
            }}
          >
            Roam Vieux Lyon, Byblos Harbor, Cairo’s Lantern Courtyards, Baghdad’s Tigris Shanasheel, and Jeonju’s Hanok Village. Meet warm elder mentors, restore historic landmarks in 3D, and prepare traditional dishes together.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              to="/play/FR"
              data-testid="cta-play-free"
              style={{
                background: 'linear-gradient(135deg, #F4A261 0%, #E76F51 100%)',
                color: '#0F172A',
                textDecoration: 'none',
                padding: '15px 32px',
                borderRadius: '999px',
                fontSize: '18px',
                fontWeight: 900,
                boxShadow: '0 12px 28px rgba(231, 111, 81, 0.4)',
              }}
            >
              ▶ Play Free Now
            </Link>

            <Link
              to="/play"
              data-testid="cta-enter-hub"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#FFF8EE',
                textDecoration: 'none',
                padding: '14px 24px',
                borderRadius: '999px',
                fontSize: '16px',
                fontWeight: 700,
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              Explore 3D World Hub
            </Link>

            <button
              type="button"
              data-testid="toggle-reduced-motion"
              onClick={() => {
                const next = !reducedMotion;
                setReducedMotion(next);
                controllerRef.current?.setReducedMotion(next);
              }}
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#CBD5E1',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: '999px',
                padding: '10px 16px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {reducedMotion ? 'Motion: Static Camera' : 'Pause 3D Camera Motion'}
            </button>
          </div>
        </div>

        {/* Interactive 5-World Vignette Switcher in First Viewport */}
        <div
          role="region"
          aria-label="Interactive Destination Preview"
          data-testid="hero-world-switcher"
          style={{
            position: 'relative',
            zIndex: 5,
            background: 'rgba(15, 23, 42, 0.86)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(244, 162, 97, 0.45)',
            borderRadius: '20px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} role="tablist" aria-label="Five Cultural Worlds">
            {COUNTRIES.map((code) => {
              const meta = COUNTRY_META[code];
              const active = selectedCountry === code;
              return (
                <button
                  key={code}
                  role="tab"
                  aria-selected={active}
                  data-testid={`preview-tab-${code}`}
                  type="button"
                  onClick={() => handleSelectWorld(code)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '999px',
                    border: active ? '2px solid #F4A261' : '1px solid rgba(255,255,255,0.2)',
                    background: active ? meta.primaryColorHex : 'rgba(255,255,255,0.06)',
                    color: '#FFF8EE',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {meta.nameEn} · <span lang={meta.storyLang}>{meta.nameNative.split('·').pop()?.trim()}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <strong style={{ fontSize: '17px', color: '#FFE29F' }}>
                {activeMeta.nameEn}: {activeMeta.regionName}
              </strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#CBD5E1' }}>
                Mentor: <strong>{activeMeta.mentorName}</strong> · Landmark: <strong>{activeMeta.landmarkName}</strong> · Dish: <strong>{activeMeta.signatureDish}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link
                to={`/play/${selectedCountry}`}
                data-testid={`launch-world-${selectedCountry}`}
                style={{
                  background: '#F4A261',
                  color: '#0F172A',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                }}
              >
                Enter {activeMeta.nameEn} in 3D →
              </Link>
              <Link
                to={`/story/${activeMeta.storyLang}`}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: '#FFF8EE',
                  textDecoration: 'none',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                Read Story ({activeMeta.storyLang})
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Below the Fold 1: Five World Showcase Cards */}
      <section
        id="worlds"
        aria-label="Five Living Cultural Worlds"
        style={{ padding: '56px clamp(16px, 4vw, 56px)', maxWidth: '1360px', margin: '0 auto' }}
      >
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', marginBottom: '8px' }}>
          Five Distinct Cultural Worlds — Built for Exploration
        </h2>
        <p style={{ color: '#CBD5E1', marginBottom: '28px', maxWidth: '720px' }}>
          Every destination features authentic architectural silhouettes, 4–6 animated local characters, a landmark restoration quest, and a bilingual 15-scene family story.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {COUNTRIES.map((code) => {
            const meta = COUNTRY_META[code];
            return (
              <article
                key={code}
                data-testid={`world-card-${code}`}
                style={{
                  background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
                  borderRadius: '18px',
                  padding: '20px',
                  border: `1px solid ${meta.primaryColorHex}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: meta.accentColorHex, textTransform: 'uppercase' }}>
                    {meta.regionName}
                  </span>
                  <h3 style={{ margin: '6px 0', fontSize: '21px' }}>
                    {meta.nameEn} · <span lang={meta.storyLang}>{meta.nameNative}</span>
                  </h3>
                  <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.45 }}>
                    Meet <strong>{meta.mentorName}</strong> at <strong>{meta.landmarkName}</strong>, restore the neighborhood architecture, and prepare <em>{meta.signatureDish}</em>.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <Link
                    to={`/play/${code}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      background: meta.primaryColorHex,
                      color: '#FFF8EE',
                      textDecoration: 'none',
                      padding: '9px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  >
                    Play 3D Chapter
                  </Link>
                  <Link
                    to={`/story/${meta.storyLang}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#FFF8EE',
                      textDecoration: 'none',
                      padding: '9px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 600,
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

      {/* Below the Fold 2: How Adventure Learning Works & Native Platforms */}
      <section
        aria-label="How Adventure Learning Works"
        style={{
          background: '#131E36',
          padding: '48px clamp(16px, 4vw, 56px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', marginTop: 0 }}>
            Five Diegetic Quests in Every Chapter — Across Web 3D, Roblox &amp; Minecraft Bedrock
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
            {[
              { step: '1. Gather', desc: 'Find diegetic ingredients and artisan materials across the 3D town streets.' },
              { step: '2. Trade', desc: 'Converse with local market vendors to exchange supplies respectfully.' },
              { step: '3. Build', desc: 'Physically restore roofs, shutters, lanterns, and balconies with before/after reveals.' },
              { step: '4. Cook', desc: 'Prepare the signature cultural dish step-by-step alongside your elder mentor.' },
              { step: '5. Word', desc: 'Discover authentic cultural words in native script, transliteration, and English.' },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  borderRadius: '14px',
                  padding: '16px',
                  border: '1px solid rgba(244, 162, 97, 0.3)',
                }}
              >
                <strong style={{ color: '#F4A261', fontSize: '15px' }}>{item.step}</strong>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.4 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessible Footer with Policies, Support & Parent Trust */}
      <footer
        role="contentinfo"
        data-testid="landing-footer"
        style={{
          padding: '36px clamp(16px, 4vw, 56px)',
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          fontSize: '13px',
          color: '#94A3B8',
        }}
      >
        <div>
          <strong style={{ color: '#FFF8EE' }}>MiraVerse Studio · v0.4 Release Candidate</strong>
          <p style={{ margin: '4px 0 0 0' }}>
            Child-Safe by Design: Zero ads, zero free-text chat, zero loot boxes, and zero personal data required for guest play. ({rendererMode})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/parents" style={{ color: '#FFE29F', textDecoration: 'none' }}>Parent Portal</Link>
          <Link to="/privacy" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/terms" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Terms of Service</Link>
          <Link to="/refunds" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Refund Policy</Link>
          <Link to="/support" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Support</Link>
          <Link to="/about" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Educator Guide</Link>
        </div>
      </footer>
    </div>
  );
};
