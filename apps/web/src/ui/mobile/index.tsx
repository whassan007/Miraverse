/**
 * Responsive Mobile & Tablet Touch Controls (`apps/web/src/ui/mobile/index.tsx`)
 * Owner: AG26
 * Provides virtual D-pad / twin-stick movement pad (bottom-left) and
 * context-sensitive Action button (bottom-right) for touch viewports (360px-1024px).
 */
import React from 'react';

export interface MobileTouchControlsProps {
  onMoveInput: (dx: number, dz: number) => void;
  onActionPress: () => void;
  actionLabel?: string;
}

export const MobileTouchControls: React.FC<MobileTouchControlsProps> = ({
  onMoveInput,
  onActionPress,
  actionLabel = 'Interact',
}) => {
  return (
    <div
      className="mv-mobile-controls"
      data-testid="mobile-touch-controls"
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        right: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        pointerEvents: 'none',
        zIndex: 18,
      }}
    >
      {/* Left Virtual Movement Pad */}
      <div
        role="group"
        aria-label="Touch Movement Controls"
        data-testid="mobile-joystick-pad"
        style={{
          pointerEvents: 'auto',
          width: '108px',
          height: '108px',
          borderRadius: '50%',
          background: 'rgba(15, 23, 42, 0.72)',
          border: '2px solid rgba(244, 162, 97, 0.55)',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr 1fr',
          padding: '6px',
        }}
      >
        <div />
        <button
          type="button"
          aria-label="Move Forward"
          data-testid="touch-move-up"
          onMouseDown={() => onMoveInput(0, 1)}
          onMouseUp={() => onMoveInput(0, 0)}
          onTouchStart={() => onMoveInput(0, 1)}
          onTouchEnd={() => onMoveInput(0, 0)}
          style={{ background: 'rgba(255,255,255,0.18)', color: '#FFF8EE', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
        >
          ▲
        </button>
        <div />
        <button
          type="button"
          aria-label="Move Left"
          data-testid="touch-move-left"
          onMouseDown={() => onMoveInput(-1, 0)}
          onMouseUp={() => onMoveInput(0, 0)}
          onTouchStart={() => onMoveInput(-1, 0)}
          onTouchEnd={() => onMoveInput(0, 0)}
          style={{ background: 'rgba(255,255,255,0.18)', color: '#FFF8EE', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
        >
          ◀
        </button>
        <div style={{ borderRadius: '50%', background: 'rgba(244,162,97,0.4)', margin: '4px' }} />
        <button
          type="button"
          aria-label="Move Right"
          data-testid="touch-move-right"
          onMouseDown={() => onMoveInput(1, 0)}
          onMouseUp={() => onMoveInput(0, 0)}
          onTouchStart={() => onMoveInput(1, 0)}
          onTouchEnd={() => onMoveInput(0, 0)}
          style={{ background: 'rgba(255,255,255,0.18)', color: '#FFF8EE', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
        >
          ▶
        </button>
        <div />
        <button
          type="button"
          aria-label="Move Backward"
          data-testid="touch-move-down"
          onMouseDown={() => onMoveInput(0, -1)}
          onMouseUp={() => onMoveInput(0, 0)}
          onTouchStart={() => onMoveInput(0, -1)}
          onTouchEnd={() => onMoveInput(0, 0)}
          style={{ background: 'rgba(255,255,255,0.18)', color: '#FFF8EE', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
        >
          ▼
        </button>
        <div />
      </div>

      {/* Right Context Action Button */}
      <button
        type="button"
        aria-label={actionLabel}
        data-testid="mobile-action-btn"
        onClick={onActionPress}
        style={{
          pointerEvents: 'auto',
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #F4A261 0%, #E76F51 100%)',
          color: '#0F172A',
          border: '2px solid #FFF8EE',
          fontWeight: 800,
          fontSize: '12px',
          cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(0,0,0,0.45)',
        }}
      >
        ACT
      </button>
    </div>
  );
};
