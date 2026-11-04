/**
 * MiraVerse v1.3 (`CX01`, `P0`, `P7`) — Platform Launch & Interactive Cultural Quest Companion (`/play` & `/play/:country`)
 * - Removes the unfinished browser-based 3D Babylon scene, primitive geometry, cylinder NPCs, virtual joystick,
 *   ACT button, overlapping labels, duplicate country tabs, and internal build diagnostics from public routes.
 * - Preserves the legacy 3D browser prototype exclusively at `/dev/legacy-3d-game` (`LegacyBrowser3DGame.tsx`).
 * - Provides verified Roblox Social Adventure & Minecraft Bedrock Creative Adventure launch options,
 *   interactive illustrated quest maps (`/art/v13/quest-map-{CC}.jpg`), age-adapted quest stages (`5-7`, `8-10`, `11-13`, `14-17`),
 *   and interactive web quest completion with Passport stamp issuance (`#chapter-progress` + `<output>`).
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CHALLENGE_TYPES,
  COUNTRIES,
  COUNTRY_META,
  type ChallengeType,
  type CountryCode,
} from '../../../../packages/contracts/index';
import {
  EPISTEMIC_BADGE_LABELS,
  V13_AGE_TIERS,
  V13_COUNTRIES_ORDERED,
  V13_COUNTRY_EXPERIENCES,
  V13_QUEST_ENCYCLOPEDIA,
  type AgeTierId,
} from '../../../../packages/contracts/v13/index';
import { GameDomainController } from '../../../../packages/game-domain/index';
import { loadStamps, make, saveStamp } from '../../../../packages/shared/stamp';
import { RobloxLaunchBanner } from '../launch/RobloxLaunchPage';
import { PACKS } from '../lib/content';

export default function Play() {
  const navigate = useNavigate();
  const params = useParams<{ country?: string }>();

  const resolvedParam = params.country?.toUpperCase() as CountryCode | undefined;
  const activeCountryCode: CountryCode =
    resolvedParam && COUNTRIES.includes(resolvedParam) ? resolvedParam : 'LB';

  const domainRef = useRef<GameDomainController | null>(null);
  if (!domainRef.current) {
    domainRef.current = new GameDomainController();
  }

  const [saveState, setSaveState] = useState(() => domainRef.current!.getState());
  const [selectedAgeTier, setSelectedAgeTier] = useState<AgeTierId>('8-10');
  const [selectedActNumber, setSelectedActNumber] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [completionFeedback, setCompletionFeedback] = useState<string>('');

  useEffect(() => {
    domainRef.current?.setActiveCountry(activeCountryCode);
    setSaveState({ ...domainRef.current!.getState() });
    setSelectedActNumber(1);
    setCompletionFeedback('');
  }, [activeCountryCode]);

  const countryExp = V13_COUNTRY_EXPERIENCES[activeCountryCode];
  const meta = COUNTRY_META[activeCountryCode];
  const countryQuests = V13_QUEST_ENCYCLOPEDIA.filter((q) => q.country === activeCountryCode);
  const activeQuest =
    countryQuests.find((q) => q.actNumber === selectedActNumber) ?? countryQuests[0];
  const activeStage = activeQuest.ageTiers[selectedAgeTier];
  const primaryNpc = activeQuest.npcs[0] ?? { name: meta.mentorName, role: 'Cultural Mentor' };

  const pack = PACKS.find((entry) => entry.country === activeCountryCode) ?? PACKS[0];
  const challenges = pack?.chapters[0]?.challenges ?? [];
  const completedTypes: ChallengeType[] = saveState.completedChallenges[activeCountryCode] || [];
  const currentChallengeIdx = completedTypes.length;
  const currentPackChallenge = challenges[currentChallengeIdx];
  const currentStamp = saveState.stamps[activeCountryCode] || '';

  function completeQuestAct(idx: number) {
    if (!domainRef.current) return;
    const targetChallenge = challenges[idx];
    if (!targetChallenge) return;
    const cType = CHALLENGE_TYPES[idx] ?? 'gather';
    const dom = domainRef.current;

    if (cType === 'gather') {
      dom.addItem(`${activeCountryCode.toLowerCase()}:ingredient_primary`, 2);
    } else if (cType === 'trade') {
      dom.addItem(`${activeCountryCode.toLowerCase()}:artisan_spice`, 1);
    }

    const res = dom.completeChallenge(activeCountryCode, cType);
    const updatedCompleted = dom.getState().completedChallenges[activeCountryCode] || [];

    if (res.chapterCompleted || updatedCompleted.length >= 5) {
      const existing = loadStamps().find((r) => r.country === activeCountryCode && r.chapter === 1);
      const code = existing?.code ?? res.stampCode ?? make(activeCountryCode, 1);
      saveStamp(code);
      dom.getState().stamps[activeCountryCode] = code;
      setCompletionFeedback(
        `All 5 cultural quest acts in ${countryExp.cityName} complete! Passport Stamp ${code} saved to your Web Passport.`
      );
    } else {
      const nextAct = Math.min(5, updatedCompleted.length + 1) as 1 | 2 | 3 | 4 | 5;
      setSelectedActNumber(nextAct);
      setCompletionFeedback(
        `Completed Act ${idx + 1}: ${targetChallenge.title_en} (${updatedCompleted.length}/5 acts complete).`
      );
    }
    setSaveState({ ...dom.getState() });
  }

  return (
    <div
      data-testid="v13-platform-launch-companion"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #091224 0%, #0F172A 48%, #091224 100%)',
        color: '#FFF8EE',
        padding: '28px clamp(16px, 4vw, 48px) 64px',
      }}
    >
      <div style={{ maxWidth: '1220px', margin: '0 auto' }}>
        {/* Header & Single Destination Selector (Ordered LB, IQ, EG, FR, KR) */}
        <header style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(244, 162, 97, 0.16)',
                  border: '1px solid rgba(244, 162, 97, 0.5)',
                  color: '#F4A261',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 800,
                  marginBottom: '8px',
                }}
              >
                Platform Launch &amp; Cultural Quest Companion · Destination #{countryExp.orderIndex} of 5
              </span>
              <h1
                style={{
                  margin: '0 0 6px 0',
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(26px, 3.8vw, 40px)',
                }}
              >
                {countryExp.countryNameEn}: {countryExp.cityName} ({countryExp.countryNameNative})
              </h1>
              <p style={{ margin: 0, color: '#CBD5E1', fontSize: '15px', maxWidth: '760px', lineHeight: 1.55 }}>
                {countryExp.heroTagline} — Launch the native social adventure on <strong>Roblox</strong>, import the{' '}
                <strong>Minecraft Bedrock</strong> building companion, or complete the 5 illustrated cultural quest acts right here to earn your Web Passport stamp.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link
                to={`/explore/${activeCountryCode}`}
                style={{
                  background: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(244, 162, 97, 0.55)',
                  color: '#FFE29F',
                  textDecoration: 'none',
                  padding: '10px 16px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                📖 Country Encyclopedia ({countryExp.cityName})
              </Link>
              <Link
                to="/atlas"
                style={{
                  background: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(96, 165, 250, 0.55)',
                  color: '#93C5FD',
                  textDecoration: 'none',
                  padding: '10px 16px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                🗺️ Interactive World Atlas
              </Link>
            </div>
          </div>

          {/* Single Destination Switcher (Ordered 1..5: LB, IQ, EG, FR, KR) */}
          <nav
            aria-label="Select Cultural Destination"
            data-testid="play-destination-selector"
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              background: 'rgba(15, 23, 42, 0.85)',
              padding: '10px 14px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 248, 238, 0.14)',
            }}
          >
            {V13_COUNTRIES_ORDERED.map((cc) => {
              const exp = V13_COUNTRY_EXPERIENCES[cc];
              const isSelected = cc === activeCountryCode;
              return (
                <button
                  key={cc}
                  type="button"
                  data-testid={`select-play-country-${cc}`}
                  onClick={() => navigate(`/play/${cc}`)}
                  style={{
                    background: isSelected ? '#F4A261' : 'rgba(30, 41, 59, 0.9)',
                    color: isSelected ? '#0B1325' : '#FFF8EE',
                    border: isSelected
                      ? '1px solid #F4A261'
                      : '1px solid rgba(255, 248, 238, 0.2)',
                    borderRadius: '999px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {exp.orderIndex}. {exp.countryNameEn}: {exp.cityName}
                </button>
              );
            })}
          </nav>
        </header>

        {/* Official Roblox Launch Banner */}
        <RobloxLaunchBanner countryCode={activeCountryCode} />

        {/* Dual Native Platform Cards: Roblox Social Adventure + Minecraft Bedrock Creative Adventure */}
        <section
          aria-label="Verified Native Game Platforms"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: '20px',
            margin: '20px 0 28px',
          }}
        >
          {/* Roblox Card */}
          <article
            data-testid="platform-card-roblox"
            style={{
              background: 'rgba(15, 23, 42, 0.92)',
              border: '1px solid rgba(0, 176, 111, 0.45)',
              borderRadius: '18px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ aspectRatio: '16 / 9', overflow: 'hidden', position: 'relative' }}>
              <img
                src={
                  activeCountryCode === 'LB'
                    ? '/art/p0/roblox-coop-byblos.jpg'
                    : countryExp.coverArtUrl
                }
                alt={`${countryExp.cityName} Roblox Social Adventure`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(5, 46, 22, 0.92)',
                  border: '1px solid #00B06F',
                  color: '#6EE7B7',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {countryExp.platformInfo.robloxPlayableNow
                  ? 'RC1 Flagship · Playable on Roblox'
                  : 'RC3 Roblox World Planned'}
              </span>
            </div>
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#6EE7B7', fontFamily: 'Georgia, serif' }}>
                  Roblox: Social Adventure ({countryExp.cityName})
                </h2>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#E2E8F0', lineHeight: 1.55 }}>
                  {countryExp.platformInfo.robloxSummary}
                </p>
                <ul style={{ margin: '0 0 16px 0', paddingLeft: '18px', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.65 }}>
                  <li><strong>Mentor NPC:</strong> {meta.mentorName}</li>
                  <li><strong>Platform Requirements:</strong> Free Roblox app + account on Windows, macOS, iOS, Android, or Console</li>
                  <li><strong>Progression:</strong> Saved natively in Roblox DataStoreService (independent of browser storage)</li>
                </ul>
              </div>
              <a
                href="https://www.roblox.com/download"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  textAlign: 'center',
                  background: '#00B06F',
                  color: '#052E16',
                  textDecoration: 'none',
                  padding: '11px 18px',
                  borderRadius: '999px',
                  fontWeight: 900,
                  fontSize: '14px',
                }}
              >
                ▶ Open in Roblox App ({countryExp.countryNameEn})
              </a>
            </div>
          </article>

          {/* Minecraft Bedrock Card */}
          <article
            data-testid="platform-card-minecraft"
            style={{
              background: 'rgba(15, 23, 42, 0.92)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              borderRadius: '18px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ aspectRatio: '16 / 9', overflow: 'hidden', position: 'relative' }}>
              <img
                src="/art/p0/minecraft-bedrock-byblos.jpg"
                alt={`${countryExp.cityName} Minecraft Bedrock Creative Companion`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(69, 26, 3, 0.92)',
                  border: '1px solid #F59E0B',
                  color: '#FDE68A',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {countryExp.platformInfo.minecraftAddonReady
                  ? 'RC2 Companion · .mcaddon Ready'
                  : 'Planned Companion'}
              </span>
            </div>
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#FDE68A', fontFamily: 'Georgia, serif' }}>
                  Minecraft Bedrock: Creative Companion
                </h2>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#E2E8F0', lineHeight: 1.55 }}>
                  {countryExp.platformInfo.minecraftSummary}
                </p>
                <ul style={{ margin: '0 0 16px 0', paddingLeft: '18px', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.65 }}>
                  <li><strong>Add-On Structure:</strong> Includes <code>{activeCountryCode.toLowerCase()}</code> cultural structure template inside <code>miraverse.mcaddon</code></li>
                  <li><strong>Platform Requirements:</strong> Minecraft Bedrock Edition v1.21.50+</li>
                  <li><strong>Progression:</strong> Saved locally inside your Minecraft Bedrock world</li>
                </ul>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href="/downloads/miraverse.mcaddon"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    background: '#F59E0B',
                    color: '#0B1325',
                    textDecoration: 'none',
                    padding: '11px 16px',
                    borderRadius: '999px',
                    fontWeight: 900,
                    fontSize: '14px',
                  }}
                >
                  ⬇ Download .mcaddon
                </a>
                <Link
                  to="/minecraft"
                  style={{
                    textAlign: 'center',
                    background: 'rgba(30, 41, 59, 0.9)',
                    border: '1px solid rgba(245, 158, 11, 0.5)',
                    color: '#FDE68A',
                    textDecoration: 'none',
                    padding: '11px 16px',
                    borderRadius: '999px',
                    fontWeight: 800,
                    fontSize: '14px',
                  }}
                >
                  Setup Guide
                </Link>
              </div>
            </div>
          </article>
        </section>

        {/* Interactive Web Cultural Quest Companion & Illustrated Quest Map */}
        <section
          aria-label="Interactive Web Cultural Quest Companion"
          data-testid="web-quest-companion-section"
          style={{
            background: 'rgba(15, 23, 42, 0.94)',
            border: '1px solid rgba(244, 162, 97, 0.45)',
            borderRadius: '22px',
            padding: 'clamp(18px, 3vw, 28px)',
          }}
        >
          {/* Progress Bar & Quick-Complete Challenge Action for E2E & Web Companion */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              paddingBottom: '18px',
              marginBottom: '20px',
              borderBottom: '1px solid rgba(255, 248, 238, 0.14)',
            }}
          >
            <div>
              <span
                id="chapter-progress"
                data-testid="chapter-progress"
                style={{
                  display: 'inline-block',
                  background: 'rgba(244, 162, 97, 0.2)',
                  border: '1px solid #F4A261',
                  color: '#FFE29F',
                  padding: '5px 14px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 800,
                  marginBottom: '6px',
                }}
              >
                Web Quest Companion Progress: {completedTypes.length}/5 Acts Completed ({countryExp.cityName})
              </span>
              <h2 style={{ margin: 0, fontSize: 'clamp(20px, 2.8vw, 28px)', fontFamily: 'Georgia, serif' }}>
                Illustrated Quest Map &amp; 5-Act Cultural Expedition
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {currentPackChallenge && completedTypes.length < 5 && (
                <button
                  type="button"
                  data-testid="quick-complete-challenge-btn"
                  onClick={() => void completeQuestAct(currentChallengeIdx)}
                  style={{
                    background: 'linear-gradient(135deg, #F4A261 0%, #E76F51 100%)',
                    color: '#0B1325',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '12px 22px',
                    fontWeight: 900,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(231, 111, 81, 0.35)',
                  }}
                >
                  Complete challenge: {currentPackChallenge.title_en}
                </button>
              )}

              {currentStamp && (
                <div
                  style={{
                    background: 'rgba(0, 176, 111, 0.18)',
                    border: '1px solid #00B06F',
                    borderRadius: '14px',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#6EE7B7', fontWeight: 700 }}>
                    Issued Passport Stamp:
                  </span>
                  <output
                    data-testid="issued-stamp-output"
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 900,
                      fontSize: '14px',
                      color: '#FFF8EE',
                      background: 'rgba(5, 46, 22, 0.85)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                    }}
                  >
                    {currentStamp}
                  </output>
                  <Link
                    to="/passport"
                    style={{ color: '#FFE29F', fontSize: '13px', fontWeight: 800 }}
                  >
                    Open Passport →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {completionFeedback && (
            <div
              role="status"
              style={{
                background: 'rgba(16, 185, 129, 0.16)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                color: '#A7F3D0',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '18px',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              {completionFeedback}
            </div>
          )}

          {/* Age-Tier Difficulty Track Selector (5-7, 8-10, 11-13, 14-17) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 700 }}>
                Age-Adapted Learning Track:
              </span>
              {V13_AGE_TIERS.map((tier) => {
                const active = selectedAgeTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    data-testid={`play-age-tier-${tier.id}`}
                    onClick={() => setSelectedAgeTier(tier.id)}
                    style={{
                      background: active ? '#38BDF8' : 'rgba(30, 41, 59, 0.9)',
                      color: active ? '#082F49' : '#E2E8F0',
                      border: active ? '1px solid #38BDF8' : '1px solid rgba(148, 163, 184, 0.35)',
                      borderRadius: '999px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {countryQuests.map((q) => {
                const isDone = completedTypes.length >= q.actNumber;
                const isSelected = selectedActNumber === q.actNumber;
                return (
                  <button
                    key={q.questId}
                    type="button"
                    data-testid={`play-select-act-${q.actNumber}`}
                    onClick={() => setSelectedActNumber(q.actNumber)}
                    style={{
                      background: isSelected
                        ? '#F4A261'
                        : isDone
                          ? 'rgba(0, 176, 111, 0.22)'
                          : 'rgba(30, 41, 59, 0.9)',
                      color: isSelected ? '#0B1325' : isDone ? '#6EE7B7' : '#FFF8EE',
                      border: isSelected
                        ? '1px solid #F4A261'
                        : isDone
                          ? '1px solid #00B06F'
                          : '1px solid rgba(255, 248, 238, 0.2)',
                      borderRadius: '999px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {isDone ? '✓ ' : ''}Act {q.actNumber}: {q.challengeType.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Illustrated Quest Map + Active Quest Stage Details */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '22px',
              alignItems: 'start',
            }}
          >
            {/* Illustrated Bird's-Eye Quest Map with Waypoint Pins */}
            <div>
              <div
                data-testid={`illustrated-quest-map-${activeCountryCode}`}
                style={{
                  position: 'relative',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '2px solid rgba(244, 162, 97, 0.6)',
                  aspectRatio: '16 / 9',
                  background: '#091224',
                }}
              >
                <img
                  src={activeQuest.questMapImageUrl}
                  alt={activeQuest.questMapZoneLabel}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {activeQuest.waypoints.map((wp) => (
                  <div
                    key={wp.waypointId}
                    title={`${wp.label}: ${wp.detail}`}
                    style={{
                      position: 'absolute',
                      left: `${wp.xPct}%`,
                      top: `${wp.yPct}%`,
                      transform: 'translate(-50%, -50%)',
                      background:
                        wp.kind === 'START'
                          ? '#38BDF8'
                          : wp.kind === 'NPC'
                            ? '#F4A261'
                            : '#10B981',
                      color: '#0B1325',
                      padding: '4px 9px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 900,
                      border: '2px solid #FFF8EE',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.65)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {wp.kind}: {wp.label}
                  </div>
                ))}
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                <strong>Illustrated Adventure Map ({activeQuest.questMapZoneLabel}):</strong> Fictional gameplay checkpoints for Act {activeQuest.actNumber}. Real-world WGS84 geographic coordinates are shown separately in the{' '}
                <Link to="/atlas" style={{ color: '#93C5FD' }}>
                  Geographic Atlas
                </Link>
                .
              </p>
            </div>

            {/* Active Quest Stage Card */}
            <div
              data-testid="active-quest-stage-card"
              style={{
                background: 'rgba(9, 18, 36, 0.88)',
                border: '1px solid rgba(255, 248, 238, 0.16)',
                borderRadius: '18px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <span
                  style={{
                    background: 'rgba(244, 162, 97, 0.2)',
                    border: '1px solid #F4A261',
                    color: '#FFE29F',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  Act {activeQuest.actNumber} of 5 · Ages {selectedAgeTier}
                </span>
                <span
                  style={{
                    background: 'rgba(56, 189, 248, 0.16)',
                    border: '1px solid #38BDF8',
                    color: '#BAE6FD',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  {EPISTEMIC_BADGE_LABELS[activeQuest.epistemicClassification]}
                </span>
              </div>

              <h3 style={{ margin: '0 0 6px 0', fontSize: '22px', fontFamily: 'Georgia, serif', color: '#FFF8EE' }}>
                {activeQuest.titleEn} ({activeQuest.titleNative})
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#F4A261', fontWeight: 700 }}>
                Guided by {primaryNpc.name} — {primaryNpc.role}
              </p>

              <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#E2E8F0', lineHeight: 1.6 }}>
                {activeQuest.narrativeIntro}
              </p>

              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.65)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#93C5FD', marginBottom: '4px' }}>
                  Activity &amp; Challenge ({activeStage.focusTitle})
                </div>
                <div style={{ fontSize: '13px', color: '#FFF8EE', lineHeight: 1.5 }}>
                  {activeStage.guidedActivity} — {activeStage.challengePrompt}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.65)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#FDE68A', marginBottom: '4px' }}>
                  Cultural Knowledge &amp; Historical Reflection
                </div>
                <div style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: 1.5 }}>
                  {activeQuest.culturalKnowledgeSummary} ({activeStage.historicalReflection})
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '14px' }}>
                <div>
                  <strong>Reward Artifact:</strong> {activeQuest.rewardArtifactId} (+{activeQuest.rewardTokens} Mira Tokens)
                </div>
                <div>
                  <strong>Roblox Mechanics:</strong> {activeQuest.robloxMechanics}
                </div>
                <div>
                  <strong>Minecraft Mechanics:</strong> {activeQuest.minecraftMechanics}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link
                  to={`/quests/${activeQuest.questId}`}
                  style={{
                    background: 'rgba(56, 189, 248, 0.18)',
                    border: '1px solid #38BDF8',
                    color: '#BAE6FD',
                    textDecoration: 'none',
                    padding: '9px 16px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 800,
                  }}
                >
                  Open in Quest Encyclopedia →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
