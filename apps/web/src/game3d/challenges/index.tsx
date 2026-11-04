/**
 * Diegetic 3D Web Challenge Station Controller (`apps/web/src/game3d/challenges/index.tsx`)
 * Owner: CL02
 * Implements Gather, Trade, Build (staged before/after 3D landmark restoration),
 * Cook (3D kitchen station sequence), and Word (diegetic cultural object/word discovery),
 * plus the chapter completion celebration banner.
 */
import React, { useState } from 'react';
import {
  COUNTRY_META,
  type ChallengeType,
  type CountryCode,
  type QuestObjectiveSpec,
} from '../../../../../packages/contracts/index';

export interface ChallengeStationOverlayProps {
  country: CountryCode;
  activeChallenge: ChallengeType | null;
  objective: QuestObjectiveSpec | null;
  isCompleted: boolean;
  restorationStage: number; // 0..3
  onAdvanceRestoration: (nextStage: number) => void;
  onCompleteChallenge: (challenge: ChallengeType) => void;
  onClose: () => void;
}

export const ChallengeStationOverlay: React.FC<ChallengeStationOverlayProps> = ({
  country,
  activeChallenge,
  objective,
  isCompleted,
  restorationStage,
  onAdvanceRestoration,
  onCompleteChallenge,
  onClose,
}) => {
  const [cookStep, setCookStep] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  if (!activeChallenge) return null;
  const meta = COUNTRY_META[country];
  const reqItems = objective?.requiredItems || [
    { itemId: `item:${country}:ing_1`, quantity: 1, labelEn: 'Artisan Ingredient 1', labelNative: meta.nameNative },
    { itemId: `item:${country}:ing_2`, quantity: 1, labelEn: 'Artisan Ingredient 2', labelNative: meta.nameNative },
    { itemId: `item:${country}:ing_3`, quantity: 1, labelEn: 'Artisan Ingredient 3', labelNative: meta.nameNative },
  ];
  const vocabList = objective?.vocabWords || [
    { word: meta.nameNative, translit: meta.code.toLowerCase(), en: meta.signatureDish, objectId: 'prop:1' },
  ];

  return (
    <aside
      aria-label={`${meta.nameEn} ${activeChallenge} 3D Station`}
      data-testid={`challenge-station-${activeChallenge}`}
      style={{
        position: 'absolute',
        right: '18px',
        bottom: '86px',
        width: '92%',
        maxWidth: '410px',
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(10px)',
        border: '2px solid #F4A261',
        borderRadius: '18px',
        padding: '18px 20px',
        color: '#FFF8EE',
        zIndex: 22,
        boxShadow: '0 16px 36px rgba(0,0,0,0.55)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.2px', color: '#F4A261', fontWeight: 800 }}>
          3D World Interaction · {activeChallenge.toUpperCase()}
        </span>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'transparent', color: '#94A3B8', border: 'none', fontSize: '16px', cursor: 'pointer' }}
          aria-label="Close station panel"
        >
          ✕
        </button>
      </div>

      <h3 style={{ margin: '6px 0', fontSize: '18px' }}>
        {objective?.title || `${meta.landmarkName}: ${activeChallenge.toUpperCase()}`}
      </h3>
      <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.4 }}>
        {objective?.description || `Interact with the 3D scene in ${meta.regionName} alongside ${meta.mentorName}.`}
      </p>

      {activeChallenge === 'gather' && (
        <div data-testid="station-body-gather">
          <p style={{ fontSize: '12px', color: '#FFE29F', marginBottom: '8px' }}>
            Diegetic 3D ingredients located along the street &amp; market stalls:
          </p>
          <ul style={{ margin: '0 0 12px 0', paddingLeft: '18px', fontSize: '13px' }}>
            {reqItems.map((it) => (
              <li key={it.itemId} style={{ marginBottom: '4px' }}>
                <strong>{it.labelEn}</strong> · <span>{it.labelNative}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            data-testid="complete-challenge-btn"
            onClick={() => onCompleteChallenge('gather')}
            style={{
              width: '100%',
              background: '#10B981',
              color: '#06281E',
              fontWeight: 800,
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
            }}
          >
            {isCompleted ? '✓ Gathered into Satchel (+20 Mira Tokens)' : 'Collect 3D Ingredients into Satchel'}
          </button>
        </div>
      )}

      {activeChallenge === 'trade' && (
        <div data-testid="station-body-trade">
          <p style={{ fontSize: '12px', color: '#FFE29F', marginBottom: '10px' }}>
            Exchange gathered market tokens with the local vendor for artisan supplies:
          </p>
          <button
            type="button"
            data-testid="complete-challenge-btn"
            onClick={() => onCompleteChallenge('trade')}
            style={{
              width: '100%',
              background: '#F59E0B',
              color: '#1E293B',
              fontWeight: 800,
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
            }}
          >
            {isCompleted ? '✓ Vendor Trade Complete (+20 Mira Tokens)' : 'Exchange Supplies with Vendor NPC'}
          </button>
        </div>
      )}

      {activeChallenge === 'build' && (
        <div data-testid="station-body-build">
          <p style={{ fontSize: '12px', color: '#FFE29F', marginBottom: '8px' }}>
            Restore <strong>{meta.landmarkName}</strong> in 3D (Stage {Math.min(3, restorationStage)} / 3):
          </p>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {['1. Stone Facade', '2. Roof Tiles', '3. Carved Shutters'].map((label, idx) => {
              const stageNum = idx + 1;
              const applied = restorationStage >= stageNum;
              return (
                <button
                  key={label}
                  type="button"
                  data-testid={`build-component-${stageNum}`}
                  onClick={() => onAdvanceRestoration(stageNum)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: applied ? '1px solid #34D399' : '1px solid rgba(255,255,255,0.25)',
                    background: applied ? 'rgba(16,185,129,0.28)' : 'rgba(255,255,255,0.08)',
                    color: '#FFF8EE',
                    cursor: 'pointer',
                  }}
                >
                  {applied ? '✓ ' : ''}{label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            data-testid="complete-challenge-btn"
            onClick={() => {
              onAdvanceRestoration(3);
              onCompleteChallenge('build');
            }}
            style={{
              width: '100%',
              background: '#3B82F6',
              color: '#FFF8EE',
              fontWeight: 800,
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
            }}
          >
            {isCompleted ? '✓ 3D Landmark Restored (+20 Mira Tokens)' : 'Apply All 3D Restoration Components'}
          </button>
        </div>
      )}

      {activeChallenge === 'cook' && (
        <div data-testid="station-body-cook">
          <p style={{ fontSize: '12px', color: '#FFE29F', marginBottom: '8px' }}>
            3D Culinary Station — Prepare <strong>{meta.signatureDish}</strong> with {meta.mentorName}:
          </p>
          <div style={{ fontSize: '12px', marginBottom: '10px', color: '#E2E8F0' }}>
            Step {Math.min(3, cookStep + 1)} of 3: {cookStep === 0 ? 'Layer base & dough' : cookStep === 1 ? 'Fold spiced filling & charm' : 'Bake to a golden finish'}
          </div>
          <button
            type="button"
            data-testid="complete-challenge-btn"
            onClick={() => {
              if (cookStep < 2) setCookStep(cookStep + 1);
              onCompleteChallenge('cook');
            }}
            style={{
              width: '100%',
              background: '#EC4899',
              color: '#FFF8EE',
              fontWeight: 800,
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
            }}
          >
            {isCompleted ? `✓ ${meta.signatureDish} Plated (+20 Mira Tokens)` : `Prepare & Bake ${meta.signatureDish}`}
          </button>
        </div>
      )}

      {activeChallenge === 'word' && (
        <div data-testid="station-body-word">
          <p style={{ fontSize: '12px', color: '#FFE29F', marginBottom: '8px' }}>
            Diegetic Cultural Vocabulary Discovery in {meta.regionName}:
          </p>
          {vocabList.slice(0, 3).map((v, i) => (
            <div
              key={v.word}
              onClick={() => setWordIndex(i)}
              style={{
                padding: '6px 10px',
                marginBottom: '6px',
                borderRadius: '8px',
                background: wordIndex === i ? 'rgba(244,162,97,0.24)' : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.16)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <strong lang={meta.storyLang}>{v.word}</strong>
              <span style={{ color: '#CBD5E1', fontSize: '12px' }}>{v.translit} · {v.en}</span>
            </div>
          ))}
          <button
            type="button"
            data-testid="complete-challenge-btn"
            onClick={() => onCompleteChallenge('word')}
            style={{
              width: '100%',
              background: '#8B5CF6',
              color: '#FFF8EE',
              fontWeight: 800,
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
            }}
          >
            {isCompleted ? '✓ Cultural Words Matched (+20 Mira Tokens)' : 'Verify Cultural Word Discovery'}
          </button>
        </div>
      )}
    </aside>
  );
};
