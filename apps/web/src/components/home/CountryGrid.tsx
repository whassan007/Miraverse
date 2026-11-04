import React, { useMemo } from 'react';
import type { Pack } from '../../../../../packages/content/schema';
import { useI18n } from '../../i18n';
import { PACKS, getStory } from '../../lib/content';
import { CountryCard } from './CountryCard';
import { resolveHomePacks } from './fallbackPacks';
import { resolveHomeCopy } from './homeI18n';

export interface CountryGridProps {
  packs?: readonly Pack[];
}

export const CountryGrid: React.FC<CountryGridProps> = ({ packs = PACKS }) => {
  const { lang, dir, t } = useI18n();
  const copy = resolveHomeCopy(lang, t);

  const canonicalPacks = useMemo(() => resolveHomePacks(packs), [packs]);

  return (
    <section
      id="choose-country-adventure"
      dir={dir}
      aria-labelledby="choose-country-heading"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}
      >
        <h2
          id="choose-country-heading"
          style={{
            margin: 0,
            fontSize: 'clamp(1.35rem, 3.2vw, 1.85rem)',
            fontWeight: 800,
            color: '#0f172a',
          }}
        >
          {copy.chooseCountryTitle}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(0.9rem, 2vw, 1rem)',
            color: '#475569',
            maxWidth: '48rem',
            lineHeight: 1.55,
          }}
        >
          {copy.chooseCountrySubtitle}
        </p>
      </div>

      <div
        data-testid="country-adventure-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(1rem, 2.5vw, 1.5rem)',
          width: '100%',
        }}
      >
        {canonicalPacks.map((pack) => (
          <CountryCard
            key={pack.country}
            pack={pack}
            story={getStory(pack.lang)}
          />
        ))}
      </div>
    </section>
  );
};

export default CountryGrid;
