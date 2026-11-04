/**
 * MiraVerse v1.4 Hero Interactive Route & Cultural Telemetry Overlay Strip
 * (`apps/web/src/landing/hero-v14/HeroCulturalTelemetryBar.tsx`)
 * Owner: AG10
 */
import React from 'react';
import { Link } from 'react-router-dom';

export type HeroCountryCode = 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';

export interface HeroCulturalTelemetryBarProps {
  activeCountry: HeroCountryCode;
  cityName: string;
  countryNameEn: string;
  countryNameNative: string;
  epistemicHighlight: string;
  signatureDish: string;
  questMapUrl: string;
  onSelectCountry: (code: HeroCountryCode) => void;
}

const ROUTE_NODES: ReadonlyArray<{
  code: HeroCountryCode;
  city: string;
  country: string;
  accentColor: string;
}> = [
  { code: 'LB', city: 'Byblos', country: 'Lebanon', accentColor: '#F4A261' },
  { code: 'IQ', city: 'Baghdad', country: 'Iraq', accentColor: '#E9C46A' },
  { code: 'EG', city: 'Cairo', country: 'Egypt', accentColor: '#2DD4BF' },
  { code: 'FR', city: 'Lyon', country: 'France', accentColor: '#60A5FA' },
  { code: 'KR', city: 'Jeonju', country: 'South Korea', accentColor: '#F472B6' },
];

export const HeroCulturalTelemetryBar: React.FC<HeroCulturalTelemetryBarProps> = ({
  activeCountry,
  cityName,
  countryNameEn,
  countryNameNative,
  epistemicHighlight,
  signatureDish,
  questMapUrl,
  onSelectCountry,
}) => {
  const activeNodeIndex = ROUTE_NODES.findIndex((node) => node.code === activeCountry);
  const activeAccent = ROUTE_NODES[activeNodeIndex]?.accentColor ?? '#F4A261';

  return (
    <div
      data-testid="hero-cultural-telemetry-bar"
      role="region"
      aria-label={`Cultural telemetry and 5-country journey route — currently viewing ${cityName}, ${countryNameEn}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '10px 14px',
        background:
          'linear-gradient(95deg, rgba(11, 19, 37, 0.94) 0%, rgba(15, 29, 56, 0.92) 55%, rgba(11, 19, 37, 0.95) 100%)',
        borderTop: '1px solid rgba(244, 162, 97, 0.28)',
        color: '#FFF8EE',
        fontSize: '0.8rem',
      }}
    >
      {/* 1. Connected 5-Node Mini Journey Indicator (LB → IQ → EG → FR → KR) */}
      <div
        aria-label="5-country showcase journey route"
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '4px',
        }}
      >
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: '#F4A261',
            marginRight: '6px',
          }}
        >
          Route
        </span>
        {ROUTE_NODES.map((node, index) => {
          const isActive = node.code === activeCountry;
          return (
            <React.Fragment key={node.code}>
              <button
                type="button"
                data-testid={`hero-route-node-${node.code}`}
                onClick={() => onSelectCountry(node.code)}
                aria-pressed={isActive}
                aria-label={`Switch showcase to ${node.city}, ${node.country} (${node.code})`}
                title={`${node.city}, ${node.country}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 9px',
                  borderRadius: '999px',
                  border: isActive
                    ? `1.5px solid ${node.accentColor}`
                    : '1px solid rgba(255, 248, 238, 0.2)',
                  background: isActive
                    ? 'rgba(244, 162, 97, 0.22)'
                    : 'rgba(15, 23, 42, 0.65)',
                  color: isActive ? '#FFF8EE' : '#CBD5E1',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.73rem',
                  cursor: 'pointer',
                  transition: 'all 160ms ease',
                  boxShadow: isActive ? `0 0 10px ${node.accentColor}33` : 'none',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '999px',
                    background: isActive ? node.accentColor : 'rgba(203, 213, 225, 0.45)',
                  }}
                />
                <span>{node.code}</span>
                {isActive && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: '#FDE68A',
                      fontWeight: 700,
                    }}
                  >
                    · {cityName}
                  </span>
                )}
              </button>
              {index < ROUTE_NODES.length - 1 && (
                <span
                  aria-hidden="true"
                  style={{
                    color: 'rgba(244, 162, 97, 0.55)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    userSelect: 'none',
                    padding: '0 1px',
                  }}
                >
                  →
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 2. Active Country Epistemic Highlight & Cultural Telemetry */}
      <div
        style={{
          flex: '1 1 240px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px 12px',
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 9px',
            borderRadius: '6px',
            background: 'rgba(13, 148, 136, 0.16)',
            border: '1px solid rgba(45, 212, 191, 0.32)',
            color: '#99F6E4',
            fontSize: '0.72rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          <span>{countryNameEn}</span>
          <span aria-hidden="true" style={{ opacity: 0.6 }}>
            •
          </span>
          <span style={{ color: '#FDE68A' }}>{countryNameNative}</span>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '6px 10px',
            color: '#E2E8F0',
            fontSize: '0.76rem',
            lineHeight: 1.35,
          }}
        >
          <span>
            <strong style={{ color: activeAccent, fontWeight: 700 }}>Discovery:</strong>{' '}
            {epistemicHighlight}
          </span>
          <span aria-hidden="true" style={{ color: 'rgba(255, 248, 238, 0.28)' }}>
            |
          </span>
          <span style={{ color: '#CBD5E1', fontSize: '0.73rem' }}>
            <strong style={{ color: '#F4A261', fontWeight: 700 }}>Table:</strong> {signatureDish}
          </span>
        </div>
      </div>

      {/* 3. Illustrated Quest Map Thumbnail Preview + Quick Link to /atlas */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Link
          to="/atlas"
          data-testid="hero-telemetry-atlas-link"
          aria-label={`Open ${cityName}, ${countryNameEn} quest map in Interactive World Atlas`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px 4px 5px',
            borderRadius: '8px',
            background: 'rgba(30, 58, 138, 0.38)',
            border: '1px solid rgba(244, 162, 97, 0.42)',
            color: '#FFF8EE',
            textDecoration: 'none',
            fontSize: '0.73rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          <img
            src={questMapUrl}
            alt={`${cityName} (${countryNameEn}) illustrated quest map thumbnail`}
            width={56}
            height={34}
            decoding="async"
            style={{
              width: '56px',
              height: '34px',
              objectFit: 'cover',
              borderRadius: '5px',
              border: '1px solid rgba(255, 248, 238, 0.25)',
              background: '#0B1325',
              flexShrink: 0,
            }}
          />
          <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ color: '#FDE68A', fontSize: '0.66rem', textTransform: 'uppercase' }}>
              Quest Map
            </span>
            <span>Open Atlas →</span>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default HeroCulturalTelemetryBar;
