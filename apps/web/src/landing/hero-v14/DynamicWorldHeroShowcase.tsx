/**
 * MiraVerse v1.4 Dynamic Hero Showcase Master Composite Component
 * (`apps/web/src/landing/hero-v14/DynamicWorldHeroShowcase.tsx`)
 * Owner: AG15
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { V14_HERO_SLIDES } from '../../../../../packages/contracts/v14/index';
import { V08_WORLD_VISUAL_MAP } from '../../../../../packages/contracts/v08/index';
import {
  V13_COUNTRIES_ORDERED,
  V13_COUNTRY_EXPERIENCES,
} from '../../../../../packages/contracts/v13/index';
import { HeroAnimatedStage } from './HeroAnimatedStage';
import { HeroTransportControls } from './HeroTransportControls';
import { HeroCulturalTelemetryBar } from './HeroCulturalTelemetryBar';
import { HeroMentorGreetingBanner } from './HeroMentorGreetingBanner';
import { HeroFilmstripScrubber } from './HeroFilmstripScrubber';
import { HeroLiveAnnouncer } from './HeroLiveAnnouncer';

export interface DynamicWorldHeroShowcaseProps {
  selectedCountry: 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';
  slideIndex: number;
  isPlaying: boolean;
  progressPct: number;
  reducedMotion: boolean;
  onSelectCountry: (code: 'LB' | 'IQ' | 'EG' | 'FR' | 'KR') => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onTogglePlayPause: () => void;
  onHoverOrFocusChange: (paused: boolean) => void;
}

export const DynamicWorldHeroShowcase: React.FC<DynamicWorldHeroShowcaseProps> = ({
  selectedCountry,
  slideIndex,
  isPlaying,
  progressPct,
  reducedMotion,
  onSelectCountry,
  onPrevSlide,
  onNextSlide,
  onTogglePlayPause,
  onHoverOrFocusChange,
}) => {
  const activeSlide = V14_HERO_SLIDES[selectedCountry];
  const activeWorld = V08_WORLD_VISUAL_MAP[selectedCountry];

  const handleContainerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onPrevSlide();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onNextSlide();
    }
  };

  const altText =
    selectedCountry === 'LB'
      ? `${activeWorld.nameEn} — ${activeWorld.locationLabel} with Mira and ${activeWorld.mentorName}`
      : `${activeWorld.nameEn} — ${activeWorld.locationLabel} with ${activeWorld.mentorName}`;

  return (
    <div
      data-testid="hero-visual-frame"
      data-active-country={selectedCountry}
      data-autoplay-active={isPlaying && !reducedMotion ? 'true' : 'false'}
      onMouseEnter={() => onHoverOrFocusChange(true)}
      onMouseLeave={() => onHoverOrFocusChange(false)}
      onKeyDown={handleContainerKeyDown}
      style={{
        background: '#131F38',
        borderRadius: '24px',
        padding: '12px',
        border: `2px solid ${activeSlide.accentColorHex}C7`,
        boxShadow: '0 24px 56px rgba(0, 0, 0, 0.65)',
        transition: reducedMotion ? 'none' : 'border-color 320ms ease',
      }}
    >
      {/* 1. Primary Animated Artwork & Ambient Cultural SVG Overlay Stage */}
      <HeroAnimatedStage
        activeCountry={selectedCountry}
        heroDesktopJpg={activeSlide.heroDesktopJpg}
        heroDesktopWebp={activeSlide.heroDesktopWebp}
        heroMobileJpg={activeSlide.heroMobileJpg}
        heroMobileWebp={activeSlide.heroMobileWebp}
        ambientOverlaySvgUrl={activeSlide.ambientOverlaySvgUrl}
        altText={altText}
        ambientMotionDescription={activeSlide.ambientMotionDescription}
        reducedMotion={reducedMotion}
        isPlaying={isPlaying}
        primaryColorHex={activeSlide.primaryColorHex}
      />

      {/* 2. Transport Controls Bar Directly Below Artwork Stage */}
      <div
        style={{
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <HeroTransportControls
          activeCountry={selectedCountry}
          slideIndex={slideIndex}
          totalSlides={V13_COUNTRIES_ORDERED.length}
          isPlaying={isPlaying}
          reducedMotion={reducedMotion}
          progressPct={progressPct}
          onTogglePlayPause={onTogglePlayPause}
          onPrevSlide={onPrevSlide}
          onNextSlide={onNextSlide}
          accentColorHex={activeSlide.accentColorHex}
        />

        <HeroLiveAnnouncer
          activeCountry={selectedCountry}
          countryNameEn={activeSlide.countryNameEn}
          cityName={activeSlide.cityName}
          chapterTitle={activeSlide.chapterTitle}
          mentorName={activeSlide.mentorName}
          signatureDish={activeSlide.signatureDish}
          isPlaying={isPlaying}
          onPrevSlide={onPrevSlide}
          onNextSlide={onNextSlide}
          onTogglePlayPause={onTogglePlayPause}
        />
      </div>

      {/* 3. Real-Time 5-World Filmstrip Scrubber */}
      <div
        style={{
          marginTop: '10px',
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 248, 238, 0.14)',
        }}
      >
        <HeroFilmstripScrubber
          activeCountry={selectedCountry}
          progressPct={progressPct}
          isPlaying={isPlaying}
          reducedMotion={reducedMotion}
          onSelectCountry={onSelectCountry}
        />
      </div>

      {/* 4. Scene Caption Bar Below Hero Artwork (Unobstructed on Mobile & Desktop) */}
      <div
        style={{
          marginTop: '10px',
          background: 'rgba(11, 19, 37, 0.92)',
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
            style={{
              borderRadius: '50%',
              border: '2px solid #F4A261',
              flexShrink: 0,
              objectFit: 'cover',
            }}
          />
          <div>
            <strong style={{ fontSize: '14px', color: '#FEF08A', display: 'block' }}>
              {activeWorld.nameEn}: {activeWorld.chapterTitle} ({activeWorld.locationLabel})
            </strong>
            <span style={{ fontSize: '12px', color: '#CBD5E1' }}>
              Mentor: <strong>{activeWorld.mentorName}</strong> · Dish:{' '}
              <strong>{activeWorld.signatureDish}</strong>
            </span>
          </div>
        </div>
        <span
          style={{
            background: activeWorld.isFlagshipSlice
              ? 'rgba(16, 185, 129, 0.22)'
              : 'rgba(244, 162, 97, 0.2)',
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

      {/* 5. Bilingual Mentor Greeting Banner */}
      <div style={{ marginTop: '10px' }}>
        <HeroMentorGreetingBanner
          activeCountry={selectedCountry}
          storyLang={activeWorld.storyLang}
          mentorName={activeSlide.mentorName}
          mentorTitle={activeSlide.mentorTitle}
          mentorPortraitUrl={activeSlide.mentorPortraitUrl}
          mentorGreetingNative={activeSlide.mentorGreetingNative}
          mentorGreetingEn={activeSlide.mentorGreetingEn}
          primaryColorHex={activeSlide.primaryColorHex}
          accentColorHex={activeSlide.accentColorHex}
        />
      </div>

      {/* 6. Cultural Telemetry & Route Strip */}
      <div
        style={{
          marginTop: '10px',
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid rgba(244, 162, 97, 0.28)',
        }}
      >
        <HeroCulturalTelemetryBar
          activeCountry={selectedCountry}
          cityName={activeSlide.cityName}
          countryNameEn={activeSlide.countryNameEn}
          countryNameNative={activeSlide.countryNameNative}
          epistemicHighlight={activeSlide.epistemicHighlight}
          signatureDish={activeSlide.signatureDish}
          questMapUrl={activeSlide.questMapUrl}
          onSelectCountry={onSelectCountry}
        />
      </div>

      {/* 7. Interactive 5-World Scene Switcher inside Hero Artwork Frame */}
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
        <div
          style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}
          role="tablist"
          aria-label="Five Cultural Worlds"
        >
          {V13_COUNTRIES_ORDERED.map((code) => {
            const w = V08_WORLD_VISUAL_MAP[code];
            const v13Exp = V13_COUNTRY_EXPERIENCES[code];
            const active = selectedCountry === code;
            return (
              <button
                key={code}
                role="tab"
                aria-selected={active}
                data-testid={`preview-tab-${code}`}
                type="button"
                onClick={() => onSelectCountry(code)}
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
                {v13Exp.orderIndex}. {v13Exp.countryNameEn}: {v13Exp.cityName}
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
  );
};

export default DynamicWorldHeroShowcase;
