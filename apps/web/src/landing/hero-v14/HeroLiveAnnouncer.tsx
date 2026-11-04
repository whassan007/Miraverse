/**
 * MiraVerse v1.4 Hero Keyboard & Screen-Reader Live Announcer Component
 * (`apps/web/src/landing/hero-v14/HeroLiveAnnouncer.tsx`)
 * Owner: AG12
 */
import React from 'react';

export interface HeroLiveAnnouncerProps {
  activeCountry: 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';
  countryNameEn: string;
  cityName: string;
  chapterTitle: string;
  mentorName: string;
  signatureDish: string;
  isPlaying: boolean;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onTogglePlayPause: () => void;
}

export const HeroLiveAnnouncer: React.FC<HeroLiveAnnouncerProps> = ({
  activeCountry,
  countryNameEn,
  cityName,
  chapterTitle,
  mentorName,
  signatureDish,
  isPlaying,
  onPrevSlide,
  onNextSlide,
  onTogglePlayPause,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onPrevSlide();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onNextSlide();
    } else if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      onTogglePlayPause();
    }
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        position: 'relative',
      }}
    >
      {/* 1. Polite Screen-Reader Status Region (aria-live="off" during auto-tour to avoid spam) */}
      <div
        role="status"
        aria-live={isPlaying ? 'off' : 'polite'}
        aria-atomic="true"
        data-testid="hero-live-announcer"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {`Now showcasing ${cityName}, ${countryNameEn} (${activeCountry}): ${chapterTitle}. Cultural mentor: ${mentorName}. Signature dish: ${signatureDish}.`}
      </div>

      {/* 2. Compact Keyboard-Shortcut Hint Pill */}
      <div
        data-testid="hero-keyboard-hint"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Hero showcase keyboard shortcuts: Left and Right arrow keys switch worlds, Space pauses or resumes auto-tour"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.375rem',
          padding: '0.3rem 0.65rem',
          borderRadius: '9999px',
          background: 'rgba(15, 23, 42, 0.76)',
          border: '1px solid rgba(244, 162, 97, 0.32)',
          color: '#E2E8F0',
          fontSize: '0.72rem',
          fontWeight: 500,
          lineHeight: 1.3,
          userSelect: 'none',
          outlineOffset: '2px',
        }}
      >
        <kbd
          style={{
            padding: '0.1rem 0.35rem',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            color: '#FDE68A',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '0.68rem',
            fontWeight: 700,
          }}
        >
          ← / →
        </kbd>
        <span>Switch worlds</span>
        <span aria-hidden="true" style={{ opacity: 0.45 }}>
          ·
        </span>
        <kbd
          style={{
            padding: '0.1rem 0.35rem',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            color: '#FDE68A',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '0.68rem',
            fontWeight: 700,
          }}
        >
          Space
        </kbd>
        <span>{isPlaying ? 'Pause auto-tour' : 'Resume auto-tour'}</span>
      </div>
    </div>
  );
};

export default HeroLiveAnnouncer;
