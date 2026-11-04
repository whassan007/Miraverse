/**
 * MiraVerse v0.7 (Option A) — Official Roblox Launch & Minecraft Bedrock Companion Pages (`CX08`)
 * - Truthful "Play free on Roblox" launcher with non-secret destination hints (LB, EG, IQ, KR, FR)
 * - Neutral Roblox account/app requirement guidance and fallback
 * - Never claims browser cookies or localStorage reflect Roblox DataStoreService state
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { COUNTRIES, COUNTRY_META, type CountryCode } from '../../../../packages/contracts/index';
import { V06_WORLD_AVAILABILITY } from '../../../../packages/contracts/v06/index';

export interface RobloxLaunchConfig {
  configuredPlaceId: string | null;
  officialShareUrl: string | null;
  publishingStatus: 'STAGING_UNPUBLISHED_HUMAN_APPROVAL_REQUIRED' | 'PUBLISHED';
}

export const DEFAULT_ROBLOX_LAUNCH_CONFIG: RobloxLaunchConfig = {
  configuredPlaceId: null,
  officialShareUrl: null,
  publishingStatus: 'STAGING_UNPUBLISHED_HUMAN_APPROVAL_REQUIRED',
};

export function buildRobloxLaunchInfo(countryHint?: string, config = DEFAULT_ROBLOX_LAUNCH_CONFIG) {
  const normalized = (countryHint || 'LB').toUpperCase() as CountryCode;
  const validCountry: CountryCode = COUNTRIES.includes(normalized) ? normalized : 'LB';
  const availability = V06_WORLD_AVAILABILITY[validCountry];
  const launchDataPayload = JSON.stringify({ destinationHint: validCountry, untrustedHintOnly: true });

  return {
    targetCountry: validCountry,
    availability,
    publishingStatus: config.publishingStatus,
    officialShareUrl: config.officialShareUrl,
    deepLinkFallback: config.configuredPlaceId
      ? `roblox://experiences/start?placeId=${config.configuredPlaceId}&launchData=${encodeURIComponent(launchDataPayload)}`
      : null,
    requiresRobloxAccountAndApp: true,
    syncsBrowserStateToRoblox: false,
  };
}

export const RobloxLaunchBanner: React.FC<{ countryCode?: CountryCode }> = ({ countryCode = 'LB' }) => {
  const info = buildRobloxLaunchInfo(countryCode);
  const meta = COUNTRY_META[info.targetCountry];

  return (
    <section
      data-testid="roblox-launch-panel"
      aria-label="Official Roblox Experience Launcher"
      style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        border: '1px solid rgba(0, 176, 111, 0.55)',
        borderRadius: '18px',
        padding: '20px 24px',
        margin: '16px auto',
        maxWidth: '1120px',
        color: '#FFF8EE',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(0, 176, 111, 0.18)',
              border: '1px solid #00B06F',
              color: '#6EE7B7',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            Flagship Experience · Play free on Roblox · Destination: {meta.nameEn} ({info.availability.release_wave})
          </span>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontFamily: 'Georgia, serif' }}>
            Launch MiraVerse on Roblox — {info.availability.chapter_title}
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#CBD5E1', maxWidth: '680px' }}>
            Requires the free Roblox app (Windows, macOS, iOS, Android, Console) and a Roblox account. In-game quest progress, Passport stamps, and earned Mira Tokens are saved inside Roblox DataStoreService and are never fabricated by website cookies.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
          <a
            href={info.officialShareUrl || 'https://www.roblox.com/download'}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="btn-launch-roblox-official"
            style={{
              background: '#00B06F',
              color: '#052E16',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '999px',
              fontWeight: 900,
              fontSize: '15px',
            }}
          >
            ▶ Play free on Roblox ({meta.nameEn})
          </a>
          <span data-testid="roblox-publish-status" style={{ fontSize: '12px', color: '#FCD34D' }}>
            Build: apps/roblox/dist/miraverse.rbxlx (Verified) · Public Place ID: Pending Creator Publish Approval
          </span>
        </div>
      </div>
    </section>
  );
};

export const MinecraftCompanionPage: React.FC = () => {
  return (
    <div
      data-testid="minecraft-companion-page"
      style={{
        minHeight: '85vh',
        background: '#0B1325',
        color: '#FFF8EE',
        padding: '36px clamp(16px, 4vw, 56px)',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <span
          style={{
            display: 'inline-block',
            background: 'rgba(217, 119, 6, 0.2)',
            border: '1px solid #F59E0B',
            color: '#FDE68A',
            padding: '5px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          Companion Edition · Play in Minecraft Bedrock
        </span>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 44px)', margin: '0 0 12px 0' }}>
          MiraVerse for Minecraft Bedrock Edition — Byblos Block-Building Companion
        </h1>
        <p style={{ color: '#CBD5E1', fontSize: '16px', lineHeight: 1.6, marginBottom: '24px' }}>
          Requires a licensed copy of <strong>Minecraft Bedrock Edition (v1.21.50+)</strong> on Windows, iOS, Android, Xbox, PlayStation, or Nintendo Switch. This companion focuses on hands-on block restoration of Teta Nahla’s Byblos stone courtyard and harbor market, with independent Bedrock-local progression. It does not run in a web browser.
        </p>

        <div
          style={{
            borderRadius: '18px',
            overflow: 'hidden',
            border: '2px solid rgba(245, 158, 11, 0.55)',
            marginBottom: '24px',
            aspectRatio: '16 / 9',
          }}
        >
          <img
            src="/art/p0/minecraft-bedrock-byblos.jpg"
            alt="Byblos Harbor Block-Building Companion Diorama"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(244, 162, 97, 0.4)',
            borderRadius: '18px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <h2 style={{ marginTop: 0, color: '#FFE29F' }}>Verified Companion Artifacts &amp; Compatibility</h2>
          <ul style={{ lineHeight: 1.8, color: '#E2E8F0' }}>
            <li>
              <strong>Behavior &amp; Resource Add-On (`miraverse.mcaddon`):</strong> Verified stable `@minecraft/server@1.17.0` &amp; `@minecraft/server-ui@1.3.0` package with 6 authored `.mcstructure` templates (`hub`, `LB`, `FR`, `EG`, `IQ`, `KR`).
            </li>
            <li>
              <strong>Download Add-On Package:</strong>{' '}
              <a href="/downloads/miraverse.mcaddon" style={{ color: '#6EE7B7', fontWeight: 700 }}>
                Download miraverse.mcaddon (Free Companion Add-On)
              </a>
            </li>
            <li>
              <strong>Binary LevelDB World (`.mcworld`):</strong> Template manifest &amp; structure placement scripts verified; native Bedrock GUI LevelDB export is marked <code>BUILD VERIFIED / RUNTIME BLOCKED</code> on headless Linux ARM64 CI until exported from a Windows/mobile Bedrock client.
            </li>
          </ul>
        </div>

        <Link to="/play/LB" style={{ color: '#F4A261', fontWeight: 700 }}>
          ← Return to Roblox Flagship Launch Page
        </Link>
      </div>
    </div>
  );
};
