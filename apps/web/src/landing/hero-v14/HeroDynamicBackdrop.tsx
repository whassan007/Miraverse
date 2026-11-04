/**
 * MiraVerse v1.4 Hero Ambient Backdrop & Dynamic Radial Aura Engine (`apps/web/src/landing/hero-v14/HeroDynamicBackdrop.tsx`)
 * Owner: AG11
 * - Renders the full-bleed background poster layer and country-specific radial aura
 * - Smoothly transitions across LB -> IQ -> EG -> FR -> KR while respecting prefers-reduced-motion
 */
import React from 'react';

export interface HeroDynamicBackdropProps {
  activeCountry: 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';
  heroDesktopJpg: string;
  radialGradientCss: string;
  reducedMotion: boolean;
}

export const HeroDynamicBackdrop: React.FC<HeroDynamicBackdropProps> = ({
  activeCountry,
  heroDesktopJpg,
  radialGradientCss,
  reducedMotion,
}) => {
  const transitionStyle = reducedMotion
    ? 'none'
    : 'background-image 600ms ease, opacity 600ms ease';

  return (
    <div
      data-testid="landing-hero-fallback"
      data-active-country={activeCountry}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `${radialGradientCss}, linear-gradient(95deg, rgba(11,19,37,0.94) 0%, rgba(11,19,37,0.84) 48%, rgba(11,19,37,0.58) 100%), url('${heroDesktopJpg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        pointerEvents: 'none',
        zIndex: 1,
        transition: transitionStyle,
      }}
    >
      <div
        data-testid="landing-hero-dynamic-aura"
        data-active-country={activeCountry}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `${radialGradientCss}, url('${heroDesktopJpg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.42,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          transition: transitionStyle,
        }}
      />
    </div>
  );
};

export default HeroDynamicBackdrop;
