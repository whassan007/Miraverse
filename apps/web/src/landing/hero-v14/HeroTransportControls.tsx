import React from 'react';

export interface HeroTransportControlsProps {
  activeCountry: 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';
  slideIndex: number;
  totalSlides: number;
  isPlaying: boolean;
  reducedMotion: boolean;
  progressPct: number;
  onTogglePlayPause: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  accentColorHex: string;
}

export const HeroTransportControls: React.FC<HeroTransportControlsProps> = ({
  activeCountry,
  slideIndex,
  totalSlides,
  isPlaying,
  reducedMotion,
  progressPct,
  onTogglePlayPause,
  onPrevSlide,
  onNextSlide,
  accentColorHex,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progressPct));
  const roundedProgress = Math.round(clampedProgress);
  const effectiveIsPlaying = isPlaying && !reducedMotion;

  return (
    <div
      role="group"
      aria-label="Hero World Showcase Playback Controls"
      data-testid="hero-transport-controls"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 0.875rem',
        borderRadius: '9999px',
        background: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${accentColorHex}44`,
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '0.8125rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.28)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <button
          type="button"
          data-testid="hero-prev-slide"
          aria-label="Previous cultural world"
          onClick={onPrevSlide}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2rem',
            height: '2rem',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            background: 'rgba(255, 255, 255, 0.06)',
            color: '#f8fafc',
            cursor: 'pointer',
            fontSize: '0.875rem',
            lineHeight: 1,
          }}
        >
          ◀
        </button>

        <button
          type="button"
          data-testid="hero-play-pause-btn"
          aria-pressed={!isPlaying}
          onClick={onTogglePlayPause}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '9999px',
            border: `1px solid ${accentColorHex}88`,
            background: effectiveIsPlaying
              ? `${accentColorHex}22`
              : 'rgba(255, 255, 255, 0.08)',
            color: '#f8fafc',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.01em',
          }}
        >
          {effectiveIsPlaying ? '⏸ Auto-Tour On' : '▶ Auto-Tour Paused'}
        </button>

        <button
          type="button"
          data-testid="hero-next-slide"
          aria-label="Next cultural world"
          onClick={onNextSlide}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2rem',
            height: '2rem',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            background: 'rgba(255, 255, 255, 0.06)',
            color: '#f8fafc',
            cursor: 'pointer',
            fontSize: '0.875rem',
            lineHeight: 1,
          }}
        >
          ▶
        </button>
      </div>

      <span
        data-testid="hero-slide-counter"
        style={{
          padding: '0.25rem 0.625rem',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.08)',
          fontWeight: 600,
          fontSize: '0.75rem',
          color: '#e2e8f0',
          whiteSpace: 'nowrap',
        }}
      >
        {`World ${slideIndex + 1} / ${totalSlides} · ${activeCountry}`}
      </span>

      <div
        data-testid="hero-autoplay-progress"
        role="progressbar"
        aria-label="Time progress toward next country transition"
        aria-valuenow={roundedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          position: 'relative',
          width: '5.5rem',
          height: '0.375rem',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.14)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${clampedProgress}%`,
            height: '100%',
            borderRadius: '9999px',
            background: accentColorHex,
            transition: reducedMotion ? 'none' : 'width 120ms linear',
          }}
        />
      </div>
    </div>
  );
};

export default HeroTransportControls;
