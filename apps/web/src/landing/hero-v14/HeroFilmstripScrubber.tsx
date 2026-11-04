/**
 * MiraVerse v1.4 Hero Filmstrip Thumbnail Scrubber Component
 * (`apps/web/src/landing/hero-v14/HeroFilmstripScrubber.tsx`)
 * Owner: AG14
 */
import React from 'react';

export type HeroFilmstripCountryCode = 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';

export interface HeroFilmstripScrubberProps {
  activeCountry: 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';
  progressPct: number;
  isPlaying: boolean;
  reducedMotion: boolean;
  onSelectCountry: (code: 'LB' | 'IQ' | 'EG' | 'FR' | 'KR') => void;
}

interface FilmstripItem {
  index: number;
  code: HeroFilmstripCountryCode;
  city: string;
  country: string;
  thumbnailUrl: string;
  accentColor: string;
}

const FILMSTRIP_ITEMS: ReadonlyArray<FilmstripItem> = [
  {
    index: 1,
    code: 'LB',
    city: 'Byblos',
    country: 'Lebanon',
    thumbnailUrl: '/art/p0/world-cover-LB.jpg',
    accentColor: '#F4A261',
  },
  {
    index: 2,
    code: 'IQ',
    city: 'Baghdad',
    country: 'Iraq',
    thumbnailUrl: '/art/p0/world-cover-IQ.jpg',
    accentColor: '#E9C46A',
  },
  {
    index: 3,
    code: 'EG',
    city: 'Cairo',
    country: 'Egypt',
    thumbnailUrl: '/art/p0/world-cover-EG.jpg',
    accentColor: '#2DD4BF',
  },
  {
    index: 4,
    code: 'FR',
    city: 'Lyon',
    country: 'France',
    thumbnailUrl: '/art/p0/world-cover-FR.jpg',
    accentColor: '#60A5FA',
  },
  {
    index: 5,
    code: 'KR',
    city: 'Jeonju',
    country: 'South Korea',
    thumbnailUrl: '/art/p0/world-cover-KR.jpg',
    accentColor: '#F472B6',
  },
];

export const HeroFilmstripScrubber: React.FC<HeroFilmstripScrubberProps> = ({
  activeCountry,
  progressPct,
  isPlaying,
  reducedMotion,
  onSelectCountry,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progressPct));

  return (
    <div
      data-testid="hero-filmstrip-scrubber"
      role="group"
      aria-label="5-country hero showcase filmstrip scrubber"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '8px',
        padding: '10px 14px',
        background: 'rgba(11, 19, 37, 0.92)',
        borderTop: '1px solid rgba(255, 248, 238, 0.12)',
      }}
    >
      {FILMSTRIP_ITEMS.map((item) => {
        const isActive = item.code === activeCountry;
        const labelText = `${item.index}. ${item.code} · ${item.city}`;

        return (
          <button
            key={item.code}
            type="button"
            data-testid={`hero-filmstrip-card-${item.code}`}
            aria-pressed={isActive}
            aria-label={`Select ${labelText} (${item.country})${
              isActive ? (isPlaying && !reducedMotion ? ' — currently playing' : ' — active') : ''
            }`}
            onClick={() => onSelectCountry(item.code)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px 10px 8px',
              borderRadius: '10px',
              border: isActive
                ? `2px solid ${item.accentColor}`
                : '1px solid rgba(255, 248, 238, 0.18)',
              background: isActive
                ? 'rgba(30, 41, 59, 0.95)'
                : 'rgba(15, 23, 42, 0.68)',
              color: isActive ? '#FFF8EE' : '#CBD5E1',
              cursor: 'pointer',
              textAlign: 'left',
              overflow: 'hidden',
              transition: reducedMotion ? 'none' : 'border-color 160ms ease, background 160ms ease',
              boxShadow: isActive ? `0 0 14px ${item.accentColor}33` : 'none',
            }}
          >
            <img
              src={item.thumbnailUrl}
              alt={`${item.city}, ${item.country} world cover thumbnail`}
              width={44}
              height={28}
              decoding="async"
              style={{
                width: '44px',
                height: '28px',
                objectFit: 'cover',
                borderRadius: '6px',
                flexShrink: 0,
                border: isActive
                  ? `1px solid ${item.accentColor}`
                  : '1px solid rgba(255, 248, 238, 0.2)',
                background: '#0B1325',
              }}
            />

            <span
              style={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                lineHeight: 1.25,
              }}
            >
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#FFF8EE' : '#E2E8F0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {labelText}
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  color: isActive ? item.accentColor : '#94A3B8',
                  fontWeight: 600,
                }}
              >
                {item.country}
              </span>
            </span>

            {/* Bottom progress fill bar on the active card */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '3px',
                background: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
              }}
            >
              {isActive && (
                <div
                  data-testid={`hero-filmstrip-progress-${item.code}`}
                  style={{
                    width: `${clampedProgress}%`,
                    height: '100%',
                    background: item.accentColor,
                    transition: reducedMotion ? 'none' : 'width 120ms linear',
                  }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default HeroFilmstripScrubber;
