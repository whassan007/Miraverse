/**
 * MiraVerse v0.8 — Illustrated Collectible Explorer Passport (`apps/web/src/pages/Passport.tsx`)
 * Owners: AG10, AG15, CL06, CX06
 * - Styled as a warm leather & parchment collectible stamp album
 * - Perforated cultural stamp illustrations (`/art/v08/stamps/stamp-{id}.svg`)
 * - Clear separation of Browser Souvenir Stamps (`localStorage`) vs. Roblox DataStore & Bedrock progress
 * - Safe Reset section separated from main stamp album (while preserving E2E selector compatibility)
 */
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { clearStamps, loadStamps, saveStamp, verify } from '../../../../packages/shared/stamp';
import { V08_WORLD_VISUAL_MAP } from '../../../../packages/contracts/v08/index';
import {
  V13_AGE_TIERS,
  V13_COUNTRIES_ORDERED,
  V13_COUNTRY_EXPERIENCES,
} from '../../../../packages/contracts/v13/index';
import type { CountryCode } from '../../../../packages/contracts/index';
import { useI18n } from '../i18n';

const COUNTRIES: Array<{ id: CountryCode; name: string; colors: [string, string] }> = [
  { id: 'LB', name: '1. Lebanon: Byblos', colors: ['#0D9488', '#F4A261'] },
  { id: 'IQ', name: '2. Iraq: Baghdad', colors: ['#0284C7', '#38BDF8'] },
  { id: 'EG', name: '3. Egypt: Cairo', colors: ['#D97706', '#FBBF24'] },
  { id: 'FR', name: '4. France: Lyon', colors: ['#2563EB', '#F59E0B'] },
  { id: 'KR', name: '5. South Korea: Jeonju', colors: ['#4F46E5', '#A5B4FC'] },
];

export default function Passport() {
  const { t, dir } = useI18n();
  const [stamps, setStamps] = useState(loadStamps);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [lastBackup, setLastBackup] = useState<string[]>([]);

  function redeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = verify(code);
    setInvalid(!result.valid);
    if (!result.valid) {
      setFeedback(
        t(
          'passport.invalid',
          'That souvenir code is invalid. Check the country, chapter, and every character.'
        )
      );
      return;
    }
    const current = loadStamps();
    setStamps(current);
    if (current.some((stamp) => stamp.country === result.country && stamp.chapter === result.chapter)) {
      setFeedback(t('passport.duplicate', 'You already collected this country and chapter stamp.'));
      return;
    }
    if (!saveStamp(result.code)) {
      setFeedback(
        t(
          'passport.storageError',
          'The stamp could not be saved. Check that browser storage is enabled and try again.'
        )
      );
      return;
    }
    setStamps(loadStamps());
    setCode('');
    setFeedback(t('passport.saved', 'Souvenir stamp added to your passport!'));
  }

  function reset() {
    const currentCodes = loadStamps().map((s) => s.code);
    if (!clearStamps()) {
      setFeedback(
        t('passport.resetError', 'The passport could not be cleared. Check browser storage and try again.')
      );
      return;
    }
    setLastBackup(currentCodes);
    setStamps([]);
    setCode('');
    setInvalid(false);
    setFeedback(t('passport.cleared', 'Your local passport has been cleared.'));
  }

  function restoreLastBackup() {
    for (const c of lastBackup) {
      saveStamp(c);
    }
    setStamps(loadStamps());
    setLastBackup([]);
    setFeedback('Restored your previously cleared souvenir stamps!');
  }

  const earnedCount = COUNTRIES.filter((c) =>
    stamps.some((item) => item.country === c.id && item.chapter === 1)
  ).length;

  return (
    <div
      dir={dir}
      data-testid="passport-album-page"
      style={{
        minHeight: '88vh',
        background: '#0B1325',
        color: '#FFF8EE',
        padding: '32px clamp(16px, 4vw, 56px) 64px',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* Passport Cover Header */}
        <header
          style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #131F38 60%, #271C19 100%)',
            borderRadius: '24px',
            border: '2px solid #F4A261',
            padding: 'clamp(20px, 3vw, 32px)',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <img
              src="/art/v08/brand-crest.svg"
              alt="MiraVerse Explorer Crest"
              width={64}
              height={64}
              style={{ borderRadius: '16px', flexShrink: 0 }}
            />
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#F4A261',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                }}
              >
                Collectible Cultural Souvenir Album · Guest Browser Edition
              </span>
              <h1 style={{ margin: '4px 0 6px 0', fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3.6vw, 38px)' }}>
                {t('passport.title', 'My Passport')}
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#CBD5E1', maxWidth: '680px' }}>
                {t(
                  'passport.disclosure',
                  'Stamps are decorative local souvenirs stored only in this browser. They grant no rewards or privileges and are not synced or sent anywhere. Clearing browser data removes them.'
                )}
              </p>
            </div>
          </div>

          <div
            style={{
              background: '#0B1325',
              borderRadius: '16px',
              padding: '14px 20px',
              border: '1px solid rgba(244, 162, 97, 0.5)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#FEF08A' }}>
              {earnedCount} / 5
            </div>
            <div style={{ fontSize: '12px', color: '#CBD5E1', fontWeight: 700 }}>
              Chapter 1 Stamps Collected
            </div>
          </div>

          <div
            style={{
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(244, 162, 97, 0.45)',
              maxHeight: '220px',
            }}
          >
            <img
              src="/art/p0/passport-collectible-desk.jpg"
              alt="MiraVerse Collectible Explorer Passport Desk"
              style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </header>

        {/* Honest Platform Persistence Notice */}
        <section
          aria-label="Platform Progress Ownership"
          style={{
            background: 'rgba(13, 148, 136, 0.14)',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            borderRadius: '16px',
            padding: '14px 18px',
            marginBottom: '26px',
            fontSize: '13px',
            color: '#D1FAE5',
          }}
        >
          <strong>How Progress Works Across Platforms:</strong> Browser Souvenir Stamps below live in this browser’s <code>localStorage</code>. When you play <strong>MiraVerse on Roblox</strong>, your authoritative quest progress, stamps, and earned Mira Tokens are saved inside Roblox <code>DataStoreService</code>. In <strong>Minecraft Bedrock</strong>, progress is saved in your local Bedrock world. Browser stamps never unlock paid goods or sync automatically to Roblox.
        </section>

        {/* Collectible Stamp Album Grid */}
        <ul
          aria-label={t('passport.slots', 'Country souvenir stamps')}
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 32px 0',
            display: 'grid',
            gap: '18px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          }}
        >
          {COUNTRIES.map((country) => {
            const stamp = stamps.find((item) => item.country === country.id && item.chapter === 1);
            const world = V08_WORLD_VISUAL_MAP[country.id];
            return (
              <li
                key={country.id}
                data-testid={`passport-slot-${country.id}`}
                style={{
                  background: stamp
                    ? 'linear-gradient(180deg, #1E293B 0%, #131F38 100%)'
                    : 'rgba(19, 31, 56, 0.72)',
                  border: `2px solid ${stamp ? country.colors[1] : 'rgba(255,255,255,0.16)'}`,
                  borderInlineStart: `8px solid ${country.colors[0]}`,
                  borderRadius: '18px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: stamp ? '0 12px 28px rgba(0,0,0,0.35)' : 'none',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: stamp ? 'rgba(16, 185, 129, 0.22)' : 'rgba(148, 163, 184, 0.16)',
                        color: stamp ? '#6EE7B7' : '#CBD5E1',
                      }}
                    >
                      {stamp
                        ? t('passport.earned', 'Earned — Chapter 1')
                        : t('passport.locked', 'Locked — Chapter 1')}
                    </span>
                    <span style={{ fontSize: '12px', color: '#F4A261', fontWeight: 700 }} lang={world.storyLang}>
                      {world.nameNative.split('·').pop()?.trim()}
                    </span>
                  </div>

                  {/* Illustrated Perforated Stamp Emblem */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '10px',
                      background: 'rgba(11, 19, 37, 0.65)',
                      borderRadius: '14px',
                      marginBottom: '12px',
                    }}
                  >
                    <img
                      src={world.stampArtUrl}
                      alt={`${country.name} Souvenir Stamp`}
                      width={124}
                      height={124}
                      style={{
                        opacity: stamp ? 1 : 0.42,
                        filter: stamp ? 'none' : 'grayscale(55%)',
                        transform: stamp ? 'rotate(-3deg)' : 'none',
                        transition: 'transform 0.2s ease, opacity 0.2s ease',
                      }}
                    />
                  </div>

                  <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontFamily: 'Georgia, serif' }}>
                    {t(`country.${country.id}`, country.name)}
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#CBD5E1' }}>
                    {world.chapterTitle} · Mentor: {world.mentorName}
                  </p>
                </div>

                {stamp ? (
                  <div
                    style={{
                      background: '#0B1325',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: '1px dashed rgba(244, 162, 97, 0.5)',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: '#94A3B8', display: 'block', fontSize: '10px' }}>VERIFIED SOUVENIR CODE</span>
                    <code dir="ltr" style={{ color: '#FEF08A', fontWeight: 800, overflowWrap: 'anywhere' }}>
                      {stamp.code}
                    </code>
                  </div>
                ) : (
                  <Link
                    to={`/play/${country.id}`}
                    style={{
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.08)',
                      color: '#FFE29F',
                      textDecoration: 'none',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    Explore {country.name} Chapter →
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* v1.3 Collected Cultural Artifacts, Historical Discoveries & Age-Adapted Learning Milestones */}
        <section
          data-testid="passport-artifacts-and-milestones"
          aria-label="Cultural Artifacts, Historical Discoveries, and Learning Milestones"
          style={{
            background: '#131F38',
            borderRadius: '22px',
            padding: '24px',
            border: '1px solid rgba(244, 162, 97, 0.45)',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '22px', alignItems: 'start', marginBottom: '22px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#F4A261', textTransform: 'uppercase' }}>
                Passport Treasury · 10 Cultural Artifacts &amp; Discoveries
              </span>
              <h2 style={{ margin: '4px 0 8px 0', fontSize: '24px', fontFamily: 'Georgia, serif', color: '#FEF08A' }}>
                Collected Cultural Artifacts &amp; Historical Discoveries
              </h2>
              <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.55 }}>
                Each country stamp unlocks two regional cultural artifacts and historical discoveries in your Explorer Passport album, spanning Phoenician maritime trade, Baghdad’s House of Wisdom, Fatimid Cairo fanous craft, Lyon silk weaving, and Jeonju Obangsaek harmony.
              </p>
              <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(244, 162, 97, 0.4)', aspectRatio: '16 / 9' }}>
                <img
                  src="/art/v13/cultural-artifacts-treasury.jpg"
                  alt="MiraVerse Cultural Artifacts Treasury"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>

            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#7DD3FC', fontFamily: 'Georgia, serif' }}>
                Age-Adapted Learning Milestones (Ages 5–17)
              </h3>
              <div style={{ display: 'grid', gap: '10px', marginBottom: '16px' }}>
                {V13_AGE_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    data-testid={`passport-milestone-${tier.id}`}
                    style={{
                      background: 'rgba(11, 19, 37, 0.85)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#BAE6FD' }}>
                      {tier.label} · {tier.readingLevel}
                    </div>
                    <div style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '3px' }}>
                      {tier.pedagogyFocus}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 10 Regional Cultural Artifacts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {V13_COUNTRIES_ORDERED.flatMap((cc) => {
              const exp = V13_COUNTRY_EXPERIENCES[cc];
              const unlocked = stamps.some((s) => s.country === cc && s.chapter === 1);
              return exp.artifacts.map((art) => (
                <article
                  key={art.artifactId}
                  data-testid={`passport-artifact-${art.artifactId}`}
                  style={{
                    background: unlocked ? 'rgba(16, 185, 129, 0.14)' : 'rgba(11, 19, 37, 0.78)',
                    borderRadius: '12px',
                    padding: '12px',
                    border: unlocked ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 800, color: unlocked ? '#6EE7B7' : '#94A3B8' }}>
                    {exp.orderIndex}. {exp.countryNameEn} · {unlocked ? 'UNLOCKED IN PASSPORT' : 'EARN STAMP TO UNLOCK'}
                  </div>
                  <strong style={{ fontSize: '14px', color: '#FFF8EE', display: 'block', margin: '4px 0' }}>
                    {art.name} ({art.nativeName})
                  </strong>
                  <p style={{ margin: 0, fontSize: '12px', color: '#CBD5E1', lineHeight: 1.45 }}>
                    {art.description}
                  </p>
                </article>
              ));
            })}
          </div>
        </section>

        {/* Two-Column Bottom Row: Redeem Souvenir Code Card + Safe Storage Settings Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '22px',
          }}
        >
          {/* Redeem Souvenir Stamp Form */}
          <section
            aria-label="Redeem Souvenir Stamp Code"
            style={{
              background: '#131F38',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(244, 162, 97, 0.45)',
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: '20px', fontFamily: 'Georgia, serif', color: '#FEF08A' }}>
              Add a Chapter Souvenir Stamp
            </h2>
            <form onSubmit={redeem}>
              <label htmlFor="souvenir-code" style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                {t('passport.redeem', 'Redeem Souvenir Code')}
              </label>
              <p id="souvenir-help" style={{ fontSize: '13px', color: '#CBD5E1', margin: '0 0 12px 0' }}>
                {t(
                  'passport.format',
                  'Enter a code in the format MV-LB1-2345-HBWS. Letter case does not matter.'
                )}
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  id="souvenir-code"
                  name="souvenir-code"
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value);
                    setInvalid(false);
                  }}
                  placeholder="MV-LB1-2345-HBWS"
                  dir="ltr"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={80}
                  required
                  aria-invalid={invalid}
                  aria-describedby="souvenir-help passport-feedback"
                  style={{ flex: 1, minWidth: '210px', background: '#0B1325', color: '#FFF8EE' }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#F4A261',
                    color: '#0F172A',
                    fontWeight: 900,
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                  }}
                >
                  {t('passport.submit', 'Redeem Code')}
                </button>
              </div>
            </form>
            <p
              id="passport-feedback"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              style={{
                marginTop: '12px',
                marginBottom: 0,
                fontSize: '14px',
                fontWeight: 700,
                color: invalid ? '#FCA5A5' : '#6EE7B7',
              }}
            >
              {feedback}
            </p>
          </section>

          {/* Local Storage & Safe Reset Controls (Separated from Primary Album) */}
          <section
            aria-label="Passport Device Storage and Reset Controls"
            style={{
              background: '#131F38',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: '18px', color: '#E2E8F0' }}>
              Device Storage &amp; Reset Settings
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, marginBottom: '16px' }}>
              Sharing a family computer or classroom tablet? You can clear local souvenir stamps from this browser at any time. If you clear by mistake during this session, you can immediately undo.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  background: 'rgba(239, 68, 68, 0.16)',
                  color: '#FCA5A5',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                {t('passport.reset', 'Clear / Reset Passport')}
              </button>

              {lastBackup.length > 0 && (
                <button
                  type="button"
                  data-testid="passport-undo-reset-btn"
                  onClick={restoreLastBackup}
                  style={{
                    background: '#0D9488',
                    color: '#FFF8EE',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 800,
                  }}
                >
                  Undo Reset ({lastBackup.length} stamp{lastBackup.length === 1 ? '' : 's'})
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
