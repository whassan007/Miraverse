import React, { useState } from 'react';
import {
  RTL,
  type Pack,
  type Story,
} from '../../../../../packages/content/schema';
import { useI18n } from '../../i18n';
import {
  COUNTRY_NATIVE_NAMES,
  LANG_DISPLAY_LABELS,
  getCountryCoordinatesLabel,
} from './fallbackPacks';
import { resolveHomeCopy } from './homeI18n';

export interface CountryCardProps {
  pack: Pack;
  story?: Story;
}

export const CountryCard: React.FC<CountryCardProps> = ({ pack, story }) => {
  const { lang, dir, t } = useI18n();
  const copy = resolveHomeCopy(lang, t);
  const [imgError, setImgError] = useState(false);

  const primaryColor = pack.colors?.primary || '#1d4ed8';
  const secondaryColor = pack.colors?.secondary || '#d97706';
  const coverSrc = `/art/${pack.country}/cover.svg`;
  const storyHref = `/story/${pack.lang}`;
  const playHref = `/play/${pack.country}`;
  const isPackLangRtl = RTL.includes(pack.lang);
  const localizedCountryName =
    copy.countryNames[pack.country] || pack.name_en;
  const nativeCountryName = COUNTRY_NATIVE_NAMES[pack.country];
  const coordinatesLabel = getCountryCoordinatesLabel(pack.country);
  const firstChapter = pack.chapters?.[0];

  return (
    <article
      id={`country-card-${pack.country}`}
      dir={dir}
      data-testid={`country-card-${pack.country}`}
      data-country={pack.country}
      data-lang={pack.lang}
      data-primary-color={primaryColor}
      data-secondary-color={secondaryColor}
      style={
        {
          '--pack-primary': primaryColor,
          '--pack-secondary': secondaryColor,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          overflow: 'hidden',
          border: `2px solid ${primaryColor}`,
          boxShadow: '0 8px 24px -6px rgba(15, 23, 42, 0.1)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          minWidth: 0,
        } as React.CSSProperties
      }
    >
      {/* Top Color Accent Bar */}
      <div
        aria-hidden="true"
        style={{
          height: '0.45rem',
          background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      />

      {/* Cover Illustration Banner */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '10.5rem',
          background: `linear-gradient(135deg, ${primaryColor}22 0%, ${secondaryColor}33 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderBottom: `1px solid ${primaryColor}26`,
        }}
      >
        <img
          src={coverSrc}
          alt={`${pack.name_en} (${localizedCountryName}) cover illustration`}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: imgError ? 'none' : 'block',
          }}
        />

        {imgError ? (
          <div
            aria-hidden="true"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              padding: '1rem',
              textAlign: 'center',
              color: primaryColor,
            }}
          >
            <span style={{ fontSize: '2rem', fontWeight: 800 }}>
              {pack.country}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {pack.name_en} · {nativeCountryName}
            </span>
          </div>
        ) : null}

        {/* Country Code & Language Pill Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '0.65rem',
            insetInlineStart: '0.65rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            paddingBlock: '0.25rem',
            paddingInline: '0.6rem',
            borderRadius: '9999px',
            backgroundColor: primaryColor,
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          <span>{pack.country}</span>
          <span aria-hidden="true">·</span>
          <span>{pack.lang}</span>
        </div>

        <div
          style={{
            position: 'absolute',
            top: '0.65rem',
            insetInlineEnd: '0.65rem',
            paddingBlock: '0.2rem',
            paddingInline: '0.55rem',
            borderRadius: '9999px',
            backgroundColor: secondaryColor,
            color: '#ffffff',
            fontSize: '0.72rem',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
          }}
        >
          {nativeCountryName}
        </div>
      </div>

      {/* Card Body */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.9rem',
          padding: 'clamp(0.95rem, 3vw, 1.25rem)',
          flex: 1,
        }}
      >
        {/* Country Header */}
        <div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '0.4rem',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0f172a',
              }}
            >
              {localizedCountryName}
              {localizedCountryName !== pack.name_en ? (
                <span
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    color: '#64748b',
                    marginInlineStart: '0.4rem',
                  }}
                >
                  ({pack.name_en})
                </span>
              ) : null}
            </h3>
          </div>

          <p
            style={{
              margin: '0.2rem 0 0',
              fontSize: '0.78rem',
              color: '#475569',
            }}
          >
            {LANG_DISPLAY_LABELS[pack.lang]}
            {coordinatesLabel ? ` · ${coordinatesLabel}` : ''}
          </p>
        </div>

        {/* Mentor Box */}
        <div
          style={{
            borderRadius: '0.75rem',
            padding: '0.75rem',
            backgroundColor: '#f8fafc',
            borderInlineStart: `4px solid ${primaryColor}`,
            borderTop: '1px solid #e2e8f0',
            borderInlineEnd: '1px solid #e2e8f0',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              marginBottom: '0.3rem',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: primaryColor,
              }}
            >
              {copy.mentorLabel}
            </span>
            <strong
              style={{
                fontSize: '0.9rem',
                color: '#0f172a',
              }}
            >
              {pack.mentor.name}
            </strong>
          </div>

          <p
            lang={pack.lang}
            dir={isPackLangRtl ? 'rtl' : 'ltr'}
            style={{
              margin: '0 0 0.25rem',
              fontSize: '0.92rem',
              fontWeight: 600,
              color: '#1e293b',
              lineHeight: 1.45,
            }}
          >
            “{pack.mentor.greeting}”
          </p>

          <p
            style={{
              margin: 0,
              fontSize: '0.8rem',
              color: '#475569',
              fontStyle: 'italic',
              lineHeight: 1.4,
            }}
          >
            “{pack.mentor.greeting_en}”
          </p>
        </div>

        {/* Region Badges */}
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#475569',
              marginBottom: '0.4rem',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            {copy.regionsLabel}
          </div>
          <div
            role="list"
            aria-label={`${pack.name_en} regions`}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.4rem',
            }}
          >
            {pack.regions.map((region) => (
              <span
                key={region.id}
                role="listitem"
                data-region-id={region.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  paddingBlock: '0.22rem',
                  paddingInline: '0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  backgroundColor: `${secondaryColor}18`,
                  color: '#1e293b',
                  border: `1px solid ${secondaryColor}55`,
                }}
              >
                {region.name_en}
              </span>
            ))}
          </div>
        </div>

        {/* Optional Story / Chapter Subtitle */}
        {(story || firstChapter) ? (
          <div
            style={{
              fontSize: '0.8rem',
              color: '#334155',
              backgroundColor: '#f1f5f9',
              paddingBlock: '0.45rem',
              paddingInline: '0.65rem',
              borderRadius: '0.5rem',
            }}
          >
            <span style={{ fontWeight: 700, color: primaryColor }}>
              {copy.storyPreviewLabel}:{' '}
            </span>
            {story ? (
              <span>
                <span lang={story.lang} dir={isPackLangRtl ? 'rtl' : 'ltr'}>
                  {story.title}
                </span>{' '}
                ({story.title_en})
              </span>
            ) : (
              <span>{firstChapter?.title_en}</span>
            )}
          </div>
        ) : null}

        {/* Action Links: Read Story & Play Chapter */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.6rem',
            marginTop: 'auto',
            paddingTop: '0.4rem',
          }}
        >
          <a
            href={storyHref}
            data-testid={`read-story-${pack.country}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              paddingBlock: '0.65rem',
              paddingInline: '0.75rem',
              borderRadius: '0.65rem',
              backgroundColor: primaryColor,
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.86rem',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            <span aria-hidden="true">📖</span>
            <span>{copy.readStory}</span>
          </a>

          <a
            href={playHref}
            data-testid={`play-chapter-${pack.country}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              paddingBlock: '0.65rem',
              paddingInline: '0.75rem',
              borderRadius: '0.65rem',
              backgroundColor: secondaryColor,
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.86rem',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            <span aria-hidden="true">🎮</span>
            <span>{copy.playChapter}</span>
          </a>
        </div>
      </div>
    </article>
  );
};

export default CountryCard;
