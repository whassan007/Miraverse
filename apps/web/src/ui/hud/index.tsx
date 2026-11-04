/**
 * Web 3D Adventure Edge HUD (`apps/web/src/ui/hud/index.tsx`)
 * Owner: AG17
 * Edge-aligned overlay: top-left Quest Objective Tracker, top-right Minimap & Compass,
 * bottom-center Satchel Inventory, contextual [E] / Tap prompt, and Earned Mira Token counter.
 * Strictly zero pricing, checkout, or payment CTAs in child gameplay.
 */
import React from 'react';
import {
  CHALLENGE_TYPES,
  COUNTRY_META,
  type ChallengeType,
  type CountryCode,
} from '../../../../../packages/contracts/index';

export interface AdventureHudProps {
  activeWorld: CountryCode | 'HUB';
  playerPosition: [number, number, number];
  completedChallenges: ChallengeType[];
  activeObjectiveTitle: string;
  activeObjectiveDesc: string;
  inventory: Record<string, number>;
  guestMiraTokens: number;
  nearestPrompt: { id: string; labelEn: string; labelNative: string; kind: string } | null;
  onTriggerInteract: () => void;
  onSelectChallengeStep: (challenge: ChallengeType) => void;
  onReturnToHub: () => void;
  onOpenPassport: () => void;
  onOpenSettings: () => void;
  onOpenStorybook: () => void;
}

export const AdventureHud: React.FC<AdventureHudProps> = ({
  activeWorld,
  playerPosition,
  completedChallenges,
  activeObjectiveTitle,
  activeObjectiveDesc,
  inventory,
  guestMiraTokens,
  nearestPrompt,
  onTriggerInteract,
  onSelectChallengeStep,
  onReturnToHub,
  onOpenPassport,
  onOpenSettings,
  onOpenStorybook,
}) => {
  const isHub = activeWorld === 'HUB';
  const meta = !isHub ? COUNTRY_META[activeWorld] : null;
  const invEntries = Object.entries(inventory).filter(([, qty]) => qty > 0);

  return (
    <div
      className="mv-hud-overlay"
      data-testid="adventure-hud"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#FFF8EE',
        zIndex: 10,
      }}
    >
      {/* Top Edge Row: Quest Tracker (Top-Left) + Minimap/Compass & Quick Actions (Top-Right) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
        {/* Top-Left Quest Objective Tracker */}
        <section
          aria-label="Quest Tracker"
          data-testid="hud-quest-tracker"
          style={{
            pointerEvents: 'auto',
            background: 'rgba(18, 28, 45, 0.84)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(244, 162, 97, 0.55)',
            borderRadius: '14px',
            padding: '12px 16px',
            maxWidth: '350px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.4px', color: '#F4A261', fontWeight: 700 }}>
            {isHub ? '3D World Hub · Compass Plaza' : `${meta?.nameEn} · ${meta?.regionName}`}
          </div>
          <h2 style={{ margin: '4px 0', fontSize: '16px', fontWeight: 700 }}>{activeObjectiveTitle}</h2>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#E2E8F0', lineHeight: 1.35 }}>{activeObjectiveDesc}</p>

          {!isHub && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }} role="group" aria-label="Chapter Quest Steps">
              {CHALLENGE_TYPES.map((ch) => {
                const done = completedChallenges.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    data-testid={`hud-step-${ch}`}
                    onClick={() => onSelectChallengeStep(ch)}
                    style={{
                      padding: '4px 9px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      borderRadius: '999px',
                      border: done ? '1px solid #34D399' : '1px solid rgba(255,255,255,0.28)',
                      background: done ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                      color: done ? '#A7F3D0' : '#FFF8EE',
                      cursor: 'pointer',
                    }}
                  >
                    {done ? '✓ ' : ''}{ch}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Top-Right Compass / Minimap & Earned Token Counter */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', pointerEvents: 'auto' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              data-testid="hud-mira-tokens"
              title="Earned through exploration and quests — saved on this device"
              style={{
                background: 'rgba(18, 28, 45, 0.86)',
                border: '1px solid #F4A261',
                borderRadius: '999px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#FFE29F',
              }}
            >
              ✦ {guestMiraTokens} Mira Tokens
            </div>
            {!isHub && (
              <button
                type="button"
                data-testid="hud-return-hub"
                onClick={onReturnToHub}
                style={{
                  background: 'rgba(29, 53, 87, 0.9)',
                  color: '#FFF8EE',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ⌂ World Hub
              </button>
            )}
            <button
              type="button"
              data-testid="hud-open-storybook"
              onClick={onOpenStorybook}
              style={{
                background: 'rgba(29, 53, 87, 0.9)',
                color: '#FFF8EE',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📖 Story
            </button>
            <button
              type="button"
              data-testid="hud-open-passport"
              onClick={onOpenPassport}
              style={{
                background: 'rgba(29, 53, 87, 0.9)',
                color: '#FFF8EE',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🛂 Passport
            </button>
            <button
              type="button"
              data-testid="hud-open-settings"
              onClick={onOpenSettings}
              style={{
                background: 'rgba(29, 53, 87, 0.9)',
                color: '#FFF8EE',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ⚙ Settings
            </button>
          </div>

          {/* Compact Circular Minimap Radar */}
          <div
            aria-label="Compass Minimap"
            data-testid="hud-minimap"
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(29,53,87,0.9) 0%, rgba(12,20,35,0.95) 100%)',
              border: '2px solid rgba(244, 162, 97, 0.65)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
            }}
          >
            <span style={{ position: 'absolute', top: '4px', fontSize: '9px', fontWeight: 700, color: '#F4A261' }}>N</span>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#38BDF8',
                transform: `translate(${Math.max(-32, Math.min(32, playerPosition[0] * 1.4))}px, ${Math.max(-32, Math.min(32, -playerPosition[2] * 1.4))}px)`,
                boxShadow: '0 0 6px #38BDF8',
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Edge Row: Contextual Interact Hint + Satchel Inventory */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        {nearestPrompt && (
          <button
            type="button"
            data-testid="hud-interact-prompt"
            onClick={onTriggerInteract}
            style={{
              pointerEvents: 'auto',
              background: 'linear-gradient(135deg, #F4A261 0%, #E76F51 100%)',
              color: '#121C2D',
              border: '2px solid #FFF8EE',
              borderRadius: '999px',
              padding: '9px 22px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.45)',
            }}
          >
            [E / Tap] {nearestPrompt.labelEn} · <span lang="auto">{nearestPrompt.labelNative}</span>
          </button>
        )}

        <div
          aria-label="Explorer Satchel Inventory"
          data-testid="hud-inventory-bar"
          style={{
            pointerEvents: 'auto',
            background: 'rgba(18, 28, 45, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            borderRadius: '14px',
            padding: '8px 16px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            minHeight: '42px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#F4A261', textTransform: 'uppercase' }}>Satchel:</span>
          {invEntries.length === 0 ? (
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>Explore &amp; gather cultural ingredients in the 3D world</span>
          ) : (
            invEntries.slice(0, 6).map(([itemId, count]) => (
              <span
                key={itemId}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  padding: '3px 8px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {itemId.split(':').pop()?.replace(/_/g, ' ')} ×{count}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
