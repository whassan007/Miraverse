/**
 * MiraVerse v1.3 (Option A) — Official Roblox Launch, Minecraft Bedrock Companion & Admin Diagnostics (`CX01`, `P7`)
 * - Truthful "Play free on Roblox" launcher with non-secret destination hints (LB, IQ, EG, FR, KR)
 * - Child-friendly platform requirements on public pages (no internal build paths on child-facing routes)
 * - AdminDiagnosticsPage at `/admin/diagnostics` for internal build, place-ID, and deployment diagnostics
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { COUNTRIES, COUNTRY_META, type CountryCode } from '../../../../packages/contracts/index';
import { V06_WORLD_AVAILABILITY } from '../../../../packages/contracts/v06/index';
import { V13_COUNTRIES_ORDERED, V13_COUNTRY_EXPERIENCES, V13_RELEASE_VERSION } from '../../../../packages/contracts/v13/index';

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

export type RobloxPlayAction =
  | { kind: 'launch'; href: string; label: string }
  | { kind: 'not-published'; href: string; label: string; explanation: string };

/**
 * Decides what the Play button may truthfully do.
 * A button labelled "Play" is only ever produced when a verified, published
 * destination exists. Otherwise we never imply gameplay: the child gets an
 * honest explanation and the official (non-game) Roblox download page.
 */
export function resolveRobloxPlayAction(config = DEFAULT_ROBLOX_LAUNCH_CONFIG, countryName = 'Miraverse'): RobloxPlayAction {
  if (config.publishingStatus === 'PUBLISHED' && config.officialShareUrl) {
    return { kind: 'launch', href: config.officialShareUrl, label: `▶ Play free on Roblox (${countryName})` };
  }
  return {
    kind: 'not-published',
    href: 'https://www.roblox.com/download',
    label: 'Get the free Roblox app (the Miraverse world is not open yet)',
    explanation: 'The Miraverse world on Roblox is not published yet, so there is nothing to play there today. You can get the Roblox app ready with a parent, and explore the web quests or the Minecraft add-on now.',
  };
}

export const RobloxLaunchBanner: React.FC<{ countryCode?: CountryCode }> = ({ countryCode = 'LB' }) => {
  const info = buildRobloxLaunchInfo(countryCode);
  const meta = COUNTRY_META[info.targetCountry];
  const v13Country = V13_COUNTRY_EXPERIENCES[info.targetCountry];
  const playAction = resolveRobloxPlayAction(DEFAULT_ROBLOX_LAUNCH_CONFIG, meta.nameEn);

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
            {playAction.kind === 'launch' && v13Country.platformInfo.robloxPlayableNow
              ? 'RC1 Flagship · Playable on Roblox'
              : 'Roblox world coming soon · Web Companion Ready'} · Destination: {meta.nameEn} ({meta.regionName})
          </span>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontFamily: 'Georgia, serif' }}>
            Launch MiraVerse on Roblox — {info.availability.chapter_title}
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#CBD5E1', maxWidth: '680px', lineHeight: 1.55 }}>
            Requires the free Roblox app (Windows, macOS, iOS, Android, Console) and a Roblox account. In-game quest progress, Passport stamps, and earned Mira Tokens are saved inside Roblox DataStoreService and are never fabricated by website cookies.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
          <a
            href={playAction.href}
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
            {playAction.label}
          </a>
          {playAction.kind === 'not-published' && (
            <span data-testid="roblox-not-published-note" style={{ fontSize: '13px', color: '#E2E8F0', maxWidth: '360px' }}>
              {playAction.explanation}
            </span>
          )}
          <span data-testid="roblox-publish-status" style={{ fontSize: '12px', color: '#FCD34D' }}>
            {playAction.kind === 'launch'
              ? 'Free Roblox App and account required'
              : 'Roblox world not published yet · Explore Web Quests & Bedrock Add-On Today'}
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
          Companion Edition · Play in Minecraft Bedrock (Global v1.1 · 11 Countries · 66 Chapters · 14 Languages)
        </span>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 44px)', margin: '0 0 12px 0' }}>
          MiraVerse for Minecraft Bedrock Edition — Echoes of Home: The Atlas of Belonging
        </h1>
        <p style={{ color: '#CBD5E1', fontSize: '16px', lineHeight: 1.6, marginBottom: '24px' }}>
          Requires a licensed copy of <strong>Minecraft Bedrock Edition (v1.21.50+)</strong> on Windows, iOS, Android, Xbox, PlayStation, or Nintendo Switch. Explore <strong>The Atlas Observatory</strong> and all <strong>11 cultural destinations</strong> (Lebanon, Iraq, Egypt, France, South Korea, Germany, China, Japan, Russia, Ukraine, and Morocco) with 66 sequential chapters, 264 age-adapted variants (Ages 5–7, 8–10, 11–13, and 14–17), and 14 supported language profiles.
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
          <h2 style={{ marginTop: 0, color: '#FFE29F' }}>Verified Companion Add-On &amp; Installation Guide</h2>
          <ul style={{ lineHeight: 1.8, color: '#E2E8F0' }}>
            <li>
              <strong>Global v1.1 Add-On (`miraverse-global.mcaddon`):</strong> Complete 11-country campaign (<em>Echoes of Home: The Atlas of Belonging</em>) with 66 chapters, 264 age-track variants, 88 custom cultural blocks, 55 Blockbench NPC models, and 14 localized language profiles:
              {' '}
              <a href="/downloads/miraverse-global.mcaddon" style={{ color: '#6EE7B7', fontWeight: 800 }}>
                Download miraverse-global.mcaddon (11 Countries · 66 Chapters · 14 Languages)
              </a>
            </li>
            <li>
              <strong>Core 5-Country Add-On (`miraverse.mcaddon`):</strong> Verified `@minecraft/server@1.17.0` &amp; `@minecraft/server-ui@1.3.0` package with 6 authored `.mcstructure` cultural templates (`hub`, `LB`, `IQ`, `EG`, `FR`, `KR`):
              {' '}
              <a href="/downloads/miraverse.mcaddon" style={{ color: '#93C5FD', fontWeight: 700 }}>
                Download miraverse.mcaddon (Free Companion Add-On)
              </a>
            </li>
            <li>
              <strong>How to Import:</strong> Download <code>miraverse-global.mcaddon</code> (or <code>miraverse.mcaddon</code>) on a device with Minecraft Bedrock Edition installed, open the file to trigger automatic pack import, and activate both the MiraVerse Behavior Pack and Resource Pack on your world.
            </li>
          </ul>
        </div>

        <Link to="/play/LB" style={{ color: '#F4A261', fontWeight: 700 }}>
          ← Return to Platform Launch &amp; Cultural Quest Companion
        </Link>
      </div>
    </div>
  );
};

export const AdminDiagnosticsPage: React.FC = () => {
  return (
    <div
      data-testid="admin-diagnostics-page"
      style={{
        minHeight: '85vh',
        background: '#090D16',
        color: '#E2E8F0',
        padding: '36px clamp(16px, 4vw, 56px)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <span
          style={{
            display: 'inline-block',
            background: 'rgba(239, 68, 68, 0.16)',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            color: '#FCA5A5',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          Internal Release &amp; Publishing Diagnostics (Admin Only · Removed from Child-Facing Routes)
        </span>
        <h1 style={{ margin: '0 0 12px 0', fontSize: '28px', color: '#FFF8EE' }}>
          MiraVerse v{V13_RELEASE_VERSION} — Platform Build &amp; Publishing Diagnostics
        </h1>
        <p style={{ color: '#94A3B8', lineHeight: 1.6, marginBottom: '24px' }}>
          Internal diagnostic strings, build artifact paths, and publishing approval gates are isolated on this route so child-facing discovery and launch pages remain clean.
        </p>

        <div
          style={{
            background: '#111827',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: '18px', color: '#6EE7B7' }}>Roblox Build &amp; Publishing Gate</h2>
          <p style={{ margin: '6px 0', fontFamily: 'monospace', fontSize: '13px' }}>
            Build: apps/roblox/dist/miraverse.rbxlx (Verified) · Public Place ID: Pending Creator Publish Approval
          </p>
          <p style={{ margin: '6px 0', fontSize: '13px', color: '#CBD5E1' }}>
            Publishing Status: <code>STAGING_UNPUBLISHED_HUMAN_APPROVAL_REQUIRED</code> (Creator-controlled human gate)
          </p>
        </div>

        <div
          style={{
            background: '#111827',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: '18px', color: '#FDE68A' }}>Minecraft Bedrock Build Diagnostics</h2>
          <p style={{ margin: '6px 0', fontFamily: 'monospace', fontSize: '13px' }}>
            Add-On Artifact: public/downloads/miraverse.mcaddon (Verified @minecraft/server@1.17.0 &amp; @minecraft/server-ui@1.3.0)
          </p>
          <p style={{ margin: '6px 0', fontSize: '13px', color: '#CBD5E1' }}>
            Binary LevelDB World (<code>.mcworld</code>): Template manifest verified; native LevelDB world export requires Windows/mobile Bedrock client.
          </p>
        </div>

        <div
          style={{
            background: '#111827',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: '14px',
            padding: '20px',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: '18px', color: '#93C5FD' }}>Destination Release Matrix (v1.3 Order)</h2>
          <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.8, fontSize: '14px' }}>
            {V13_COUNTRIES_ORDERED.map((cc) => {
              const exp = V13_COUNTRY_EXPERIENCES[cc];
              return (
                <li key={cc}>
                  <strong>
                    {exp.orderIndex}. {exp.countryNameEn}: {exp.cityName} ({cc})
                  </strong>{' '}
                  — Roblox: <code>{exp.platformInfo.robloxPlayableNow ? 'RC1_PLAYABLE' : 'RC3_PLANNED'}</code> · Minecraft:{' '}
                  <code>{exp.platformInfo.minecraftAddonReady ? 'MCADDON_READY' : 'PENDING'}</code>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
