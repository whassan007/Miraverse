import React from 'react';
import { COUNTRIES, COUNTRY_WGS84 } from '../../../../../packages/content/schema';
import { useI18n } from '../../i18n';
import { COUNTRY_NATIVE_NAMES } from './fallbackPacks';
import { resolveHomeCopy } from './homeI18n';

export interface HeroSectionProps {
  totalCountries?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  totalCountries = COUNTRIES.length,
}) => {
  const { lang, dir, t } = useI18n();
  const copy = resolveHomeCopy(lang, t);

  return (
    <section
      dir={dir}
      aria-labelledby="miraverse-hero-heading"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '1.25rem',
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e293b 52%, #1d4ed8 100%)',
        color: '#f8fafc',
        padding: 'clamp(1.25rem, 4vw, 2.75rem)',
        marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
        boxShadow: '0 16px 40px -12px rgba(15, 23, 42, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          maxWidth: '54rem',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            alignSelf: 'flex-start',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            borderRadius: '9999px',
            paddingBlock: '0.35rem',
            paddingInline: '0.85rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: '#e2e8f0',
          }}
        >
          <span aria-hidden="true">✦</span>
          <span>{copy.badge}</span>
        </div>

        <h1
          id="miraverse-hero-heading"
          style={{
            margin: 0,
            fontSize: 'clamp(1.65rem, 4.5vw, 2.75rem)',
            lineHeight: 1.18,
            fontWeight: 800,
            letterSpacing: '-0.015em',
            color: '#ffffff',
          }}
        >
          {copy.heroTitle}
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 'clamp(0.95rem, 2.2vw, 1.125rem)',
            lineHeight: 1.65,
            color: '#cbd5e1',
            maxWidth: '46rem',
          }}
        >
          {copy.heroSubtitle}
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '0.25rem',
          }}
        >
          <a
            href="/passport"
            data-testid="hero-cta-passport"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              paddingBlock: '0.75rem',
              paddingInline: '1.25rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f59e0b',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              minWidth: '9.5rem',
              flex: '1 1 auto',
              maxWidth: '16rem',
            }}
          >
            <span aria-hidden="true">🛂</span>
            <span>{copy.ctaPassport}</span>
          </a>

          <a
            href="/about"
            data-testid="hero-cta-about"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              paddingBlock: '0.75rem',
              paddingInline: '1.25rem',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
              minWidth: '9.5rem',
              flex: '1 1 auto',
              maxWidth: '16rem',
            }}
          >
            <span aria-hidden="true">🧭</span>
            <span>{copy.ctaAbout}</span>
          </a>

          <a
            href="#choose-country-adventure"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              paddingBlock: '0.75rem',
              paddingInline: '1rem',
              borderRadius: '0.75rem',
              color: '#93c5fd',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            <span>{copy.ctaExplore}</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div
          aria-label={`${totalCountries} canonical destinations`}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          {COUNTRIES.map((countryId) => {
            const geo = COUNTRY_WGS84[countryId];
            return (
              <a
                key={countryId}
                href={`#country-card-${countryId}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  paddingBlock: '0.3rem',
                  paddingInline: '0.65rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  color: '#e2e8f0',
                  fontSize: '0.78rem',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                <strong style={{ color: '#fbbf24' }}>{countryId}</strong>
                <span>{copy.countryNames[countryId]}</span>
                <span style={{ opacity: 0.75 }}>· {COUNTRY_NATIVE_NAMES[countryId]}</span>
                {geo ? (
                  <span style={{ opacity: 0.6, fontSize: '0.72rem' }}>
                    ({geo.capital_en})
                  </span>
                ) : null}
              </a>
            );
          })}
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '0.78rem',
            color: '#94a3b8',
          }}
        >
          {copy.privacyNote}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
