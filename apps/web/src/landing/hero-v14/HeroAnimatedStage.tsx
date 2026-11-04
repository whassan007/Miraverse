import React from 'react';

export interface HeroAnimatedStageProps {
  activeCountry: 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';
  heroDesktopJpg: string;
  heroDesktopWebp: string;
  heroMobileJpg?: string;
  heroMobileWebp?: string;
  ambientOverlaySvgUrl: string;
  altText: string;
  ambientMotionDescription: string;
  reducedMotion: boolean;
  isPlaying: boolean;
  primaryColorHex: string;
}

export const HeroAnimatedStage: React.FC<HeroAnimatedStageProps> = ({
  activeCountry,
  heroDesktopJpg,
  heroDesktopWebp,
  heroMobileJpg,
  heroMobileWebp,
  ambientOverlaySvgUrl,
  altText,
  ambientMotionDescription,
  reducedMotion,
  isPlaying,
  primaryColorHex,
}) => {
  const shouldAnimate = !reducedMotion && isPlaying;

  return (
    <div
      data-testid="hero-animated-stage"
      data-country={activeCountry}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        aspectRatio: '16 / 9.4',
        background: '#0B1933',
        isolation: 'isolate',
      }}
    >
      <style>
        {`
          @keyframes mvHeroKenBurns {
            0% {
              transform: scale(1) translate3d(0, 0, 0);
            }
            100% {
              transform: scale(1.065) translate3d(-1.2%, -0.8%, 0);
            }
          }

          @keyframes mvHeroFadeIn {
            0% {
              opacity: 0.35;
            }
            100% {
              opacity: 1;
            }
          }

          @keyframes mvHeroLiveDotPulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.35);
              opacity: 0.65;
            }
          }
        `}
      </style>

      <picture
        key={activeCountry}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          animation: reducedMotion
            ? 'none'
            : 'mvHeroFadeIn 480ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        }}
      >
        {activeCountry === 'LB' && heroMobileWebp ? (
          <source media="(max-width: 640px)" srcSet={heroMobileWebp} type="image/webp" />
        ) : null}
        {activeCountry === 'LB' && heroMobileJpg ? (
          <source media="(max-width: 640px)" srcSet={heroMobileJpg} type="image/jpeg" />
        ) : null}
        <source srcSet={heroDesktopWebp} type="image/webp" />
        <img
          data-testid="hero-primary-artwork"
          src={heroDesktopJpg}
          alt={altText}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            willChange: reducedMotion ? 'auto' : 'transform, opacity',
            transform: reducedMotion ? 'none' : undefined,
            animation: reducedMotion
              ? 'none'
              : 'mvHeroKenBurns 5.2s ease-in-out infinite alternate',
            animationPlayState: shouldAnimate ? 'running' : 'paused',
          }}
        />
      </picture>

      {/* Country-Specific Animated Ambient SVG Overlay */}
      <img
        key={`overlay-${activeCountry}`}
        data-testid="hero-ambient-overlay"
        src={ambientOverlaySvgUrl}
        alt=""
        aria-hidden="true"
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: reducedMotion ? 0.55 : 0.88,
          mixBlendMode: 'screen',
          transform: reducedMotion ? 'none' : undefined,
          animation: reducedMotion
            ? 'none'
            : 'mvHeroFadeIn 480ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        }}
      />

      {/* Subtle Top-Left Live Country Atmosphere Pill */}
      <div
        data-testid="hero-live-country-pill"
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 2,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 12px',
          borderRadius: '14px',
          maxWidth: 'calc(100% - 24px)',
          background: 'rgba(11, 19, 37, 0.78)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${primaryColorHex}88`,
          color: '#FFF8EE',
          fontSize: '11.5px',
          fontWeight: 700,
          letterSpacing: '0.01em',
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.38)',
          pointerEvents: 'none',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: primaryColorHex,
            boxShadow: `0 0 8px ${primaryColorHex}`,
            flexShrink: 0,
            transform: reducedMotion ? 'none' : undefined,
            animation: shouldAnimate
              ? 'mvHeroLiveDotPulse 2.2s ease-in-out infinite'
              : 'none',
          }}
        />
        <span>{ambientMotionDescription}</span>
      </div>
    </div>
  );
};

export default HeroAnimatedStage;
