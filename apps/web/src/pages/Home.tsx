import React from 'react';
import { CountryGrid, HeroSection } from '../components/home';
import { useI18n } from '../i18n';
import { PACKS } from '../lib/content';

export function Home() {
  const { dir } = useI18n();

  return (
    <div
      dir={dir}
      data-testid="home-page"
      style={{
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '76rem',
        marginInline: 'auto',
        paddingInline: 'clamp(0.75rem, 3vw, 1.5rem)',
        paddingBlock: 'clamp(1rem, 3vw, 2.25rem)',
      }}
    >
      <HeroSection totalCountries={5} />
      <CountryGrid packs={PACKS} />
    </div>
  );
}

export default Home;
