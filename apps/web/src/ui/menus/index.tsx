/**
 * In-Game 3D World Portal Table, Settings Modal & Chapter Celebration Overlay
 * (`apps/web/src/ui/menus/index.tsx`)
 * Owner: AG18
 */
import React from 'react';
import { COUNTRIES, COUNTRY_META, type CountryCode } from '../../../../../packages/contracts/index';

export interface HubPortalRibbonProps {
  activeWorld: CountryCode | 'HUB';
  stamps: Partial<Record<CountryCode, string>>;
  onEnterCountryPortal: (country: CountryCode) => void;
}

export const HubPortalRibbon: React.FC<HubPortalRibbonProps> = ({
  activeWorld,
  stamps,
  onEnterCountryPortal,
}) => {
  if (activeWorld !== 'HUB') return null;
  return (
    <nav
      aria-label="3D World Hub Portals"
      data-testid="hub-portal-ribbon"
      style={{
        position: 'absolute',
        bottom: '76px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 12,
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        padding: '10px 16px',
        borderRadius: '18px',
        border: '1px solid rgba(244, 162, 97, 0.5)',
        boxShadow: '0 10px 28px rgba(0,0,0,0.45)',
      }}
    >
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#F4A261', alignSelf: 'center', marginRight: '4px' }}>
        Walk into a Portal Arch or Warp:
      </span>
      {COUNTRIES.map((code) => {
        const meta = COUNTRY_META[code];
        const hasStamp = Boolean(stamps[code]);
        return (
          <button
            key={code}
            type="button"
            data-testid={`hub-portal-${code}`}
            onClick={() => onEnterCountryPortal(code)}
            style={{
              background: `linear-gradient(135deg, ${meta.primaryColorHex} 0%, #1E293B 100%)`,
              color: '#FFF8EE',
              border: hasStamp ? '2px solid #34D399' : '1px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              padding: '7px 13px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {hasStamp ? '★ ' : '⛩ '} {meta.nameEn} · <span lang={meta.storyLang}>{meta.nameNative.split('·').pop()?.trim()}</span>
          </button>
        );
      })}
    </nav>
  );
};

export interface SettingsModalProps {
  open: boolean;
  muted: boolean;
  reducedMotion: boolean;
  qualityTier: 'auto' | 'low' | 'medium' | 'high';
  onUpdate: (patch: { muted?: boolean; reducedMotion?: boolean; qualityTier?: 'auto' | 'low' | 'medium' | 'high' }) => void;
  onResetSave: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  muted,
  reducedMotion,
  qualityTier,
  onUpdate,
  onResetSave,
  onClose,
}) => {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Adventure Settings"
      data-testid="settings-modal"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 15, 28, 0.78)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 40,
      }}
    >
      <div
        style={{
          background: '#1E293B',
          color: '#FFF8EE',
          borderRadius: '18px',
          padding: '24px',
          width: '92%',
          maxWidth: '420px',
          border: '1px solid #F4A261',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Adventure Settings</h2>
        <label style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0' }}>
          <span>Mute Sound &amp; Ambience</span>
          <input type="checkbox" checked={muted} onChange={(e) => onUpdate({ muted: e.target.checked })} />
        </label>
        <label style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0' }}>
          <span>Reduced Motion &amp; Camera Ease</span>
          <input type="checkbox" checked={reducedMotion} onChange={(e) => onUpdate({ reducedMotion: e.target.checked })} />
        </label>
        <label style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0' }}>
          <span>3D Graphics Quality</span>
          <select
            value={qualityTier}
            onChange={(e) => onUpdate({ qualityTier: e.target.value as any })}
            style={{ background: '#0F172A', color: '#FFF8EE', padding: '4px 8px', borderRadius: '6px' }}
          >
            <option value="auto">Auto Adapt</option>
            <option value="low">Low (Battery Saver)</option>
            <option value="medium">Medium</option>
            <option value="high">High (Painterly PBR)</option>
          </select>
        </label>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button
            type="button"
            onClick={onResetSave}
            style={{ background: '#7F1D1D', color: '#FECACA', border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer' }}
          >
            Reset Local Save
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ background: '#F4A261', color: '#1E293B', fontWeight: 700, border: 'none', borderRadius: '8px', padding: '8px 18px', cursor: 'pointer' }}
          >
            Resume Adventure
          </button>
        </div>
      </div>
    </div>
  );
};
