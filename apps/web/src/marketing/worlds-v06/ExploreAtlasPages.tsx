/**
 * MiraVerse v0.7 (Option A) — Public Atlas (/explore, /explore/:country), /adventures, and /characters Pages (`AG17`)
 * Truthfully distinguishes RC1 Flagship (Byblos, Lebanon) from RC3 Expansion destinations.
 */
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { COUNTRIES, COUNTRY_META, type CountryCode } from '../../../../../packages/contracts/index';
import { V06_WORLD_AVAILABILITY } from '../../../../../packages/contracts/v06/index';

export const ExploreAtlasPage: React.FC = () => {
  return (
    <div data-testid="explore-atlas-page" style={{ minHeight: '85vh', background: '#0B1325', color: '#FFF8EE', padding: '36px clamp(16px, 4vw, 56px)' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: '8px' }}>
          Explore Five Cultural Worlds
        </h1>
        <p style={{ color: '#CBD5E1', marginBottom: '28px', maxWidth: '720px' }}>
          Begin your flagship adventure in <strong>Byblos, Lebanon</strong> on Roblox (and the Minecraft Bedrock block-building companion), then explore Cairo, Baghdad, Jeonju, and Vieux Lyon as our five-world cultural atlas expands.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {COUNTRIES.map((code) => {
            const meta = COUNTRY_META[code];
            const avail = V06_WORLD_AVAILABILITY[code];
            const isFlagship = avail.release_wave === 'RC1_FLAGSHIP';
            return (
              <article
                key={code}
                data-testid={`explore-card-${code}`}
                style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: isFlagship ? '2px solid #00B06F' : '1px solid rgba(244, 162, 97, 0.35)',
                  borderRadius: '18px',
                  padding: '20px',
                }}
              >
                <span
                  data-testid={`availability-badge-${code}`}
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: isFlagship ? 'rgba(0, 176, 111, 0.2)' : 'rgba(244, 162, 97, 0.15)',
                    color: isFlagship ? '#6EE7B7' : '#FCD34D',
                    marginBottom: '10px',
                  }}
                >
                  {isFlagship ? 'RC1 Flagship · Available First on Roblox & Bedrock' : 'RC3 Expansion World · In Native Validation'}
                </span>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '20px' }}>{meta.nameEn} · {meta.regionName}</h2>
                <p style={{ fontSize: '13px', color: '#CBD5E1', marginBottom: '16px' }}>
                  Mentor: <strong>{meta.mentorName}</strong> · Dish: <strong>{meta.signatureDish}</strong>
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link
                    to={`/explore/${code}`}
                    style={{ background: '#F4A261', color: '#0F172A', textDecoration: 'none', padding: '8px 14px', borderRadius: '999px', fontWeight: 700, fontSize: '13px' }}
                  >
                    World Details
                  </Link>
                  <Link
                    to={`/play/${code}`}
                    style={{ background: '#00B06F', color: '#052E16', textDecoration: 'none', padding: '8px 14px', borderRadius: '999px', fontWeight: 800, fontSize: '13px' }}
                  >
                    Play free on Roblox
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const ExploreCountryDetailPage: React.FC = () => {
  const { country } = useParams<{ country: string }>();
  const code = (COUNTRIES.includes((country || '').toUpperCase() as CountryCode) ? (country || '').toUpperCase() : 'LB') as CountryCode;
  const meta = COUNTRY_META[code];
  const avail = V06_WORLD_AVAILABILITY[code];

  return (
    <div data-testid={`explore-country-detail-${code}`} style={{ minHeight: '85vh', background: '#0B1325', color: '#FFF8EE', padding: '36px clamp(16px, 4vw, 56px)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <span style={{ color: '#6EE7B7', fontWeight: 700, fontSize: '12px' }}>
          {avail.release_wave === 'RC1_FLAGSHIP' ? 'RC1 Flagship Destination' : 'RC3 Expansion Destination'}
        </span>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 44px)', margin: '6px 0 12px 0' }}>
          {avail.chapter_title} ({meta.nameEn})
        </h1>
        <p style={{ color: '#CBD5E1', fontSize: '16px', lineHeight: 1.6 }}>
          Join <strong>{meta.mentorName}</strong> at <strong>{meta.landmarkName}</strong> to gather local ingredients, trade in the market, prepare <strong>{meta.signatureDish}</strong>, restore traditional architecture, and learn authentic local expressions.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
          <Link to={`/play/${code}`} style={{ background: '#00B06F', color: '#052E16', textDecoration: 'none', padding: '12px 24px', borderRadius: '999px', fontWeight: 900 }}>
            ▶ Play free on Roblox
          </Link>
          <Link to="/minecraft" style={{ background: 'rgba(217, 119, 6, 0.25)', border: '1px solid #F59E0B', color: '#FDE68A', textDecoration: 'none', padding: '12px 24px', borderRadius: '999px', fontWeight: 700 }}>
            Play in Minecraft Bedrock
          </Link>
          <Link to={`/story/${meta.storyLang}`} style={{ color: '#FFE29F', padding: '12px 16px' }}>
            Read Illustrated Story
          </Link>
        </div>
      </div>
    </div>
  );
};

export const AdventuresCatalogPage: React.FC = () => (
  <div data-testid="adventures-catalog-page" style={{ minHeight: '80vh', background: '#0B1325', color: '#FFF8EE', padding: '36px clamp(16px, 4vw, 56px)' }}>
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Georgia, serif' }}>Five Cultural Quest Mechanics</h1>
      <p style={{ color: '#CBD5E1' }}>
        Every MiraVerse chapter combines five hands-on challenge types designed for ages 8–12 with zero purchase pressure: <strong>Gather</strong>, <strong>Trade</strong>, <strong>Cook</strong>, <strong>Build</strong>, and <strong>Discover Words</strong>.
      </p>
      <Link to="/play/LB" style={{ display: 'inline-block', marginTop: '16px', background: '#00B06F', color: '#052E16', padding: '12px 24px', borderRadius: '999px', fontWeight: 900, textDecoration: 'none' }}>
        ▶ Play free on Roblox
      </Link>
    </div>
  </div>
);

export const CharactersShowcasePage: React.FC = () => (
  <div data-testid="characters-showcase-page" style={{ minHeight: '80vh', background: '#0B1325', color: '#FFF8EE', padding: '36px clamp(16px, 4vw, 56px)' }}>
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Georgia, serif' }}>Meet Mira, Elder Mentors &amp; the In-Experience Avatar Studio</h1>
      <p style={{ color: '#CBD5E1' }}>
        Customize your hero inside the Roblox Avatar Studio using earned-only Mira Tokens: equip the Byblos Artisan Heritage Vest, Cedar Explorer Satchel, Cairo Fanous Daypack, Baghdad Sun-Weave Hat, Jeonju Durumagi Jacket, and Vieux Lyon Boulangerie Beret.
      </p>
    </div>
  </div>
);
