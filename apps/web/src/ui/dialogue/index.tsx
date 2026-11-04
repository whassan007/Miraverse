/**
 * NPC Portrait & Typewriter Dialogue Panel (`apps/web/src/ui/dialogue/index.tsx`)
 * Owner: AG19
 * Supports instant skip, native script (with Arabic RTL dir="rtl" and Korean Hangul),
 * transliteration, English translation, and authored quest choices.
 */
import React, { useEffect, useState } from 'react';
import type { DialogueNodeSpec } from '../../../../../packages/contracts/index';

export interface DialoguePanelProps {
  node: DialogueNodeSpec | null;
  lang: string;
  reducedMotion?: boolean;
  onSelectChoice: (choiceId: string, nextNodeId: string, triggersObjectiveId?: string) => void;
  onClose: () => void;
}

export const DialoguePanel: React.FC<DialoguePanelProps> = ({
  node,
  lang,
  reducedMotion = false,
  onSelectChoice,
  onClose,
}) => {
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (!node) return;
    if (reducedMotion) {
      setCharCount(node.textEn.length);
      return;
    }
    setCharCount(0);
    const timer = setInterval(() => {
      setCharCount((prev) => {
        if (prev >= node.textEn.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 3;
      });
    }, 18);
    return () => clearInterval(timer);
  }, [node, reducedMotion]);

  if (!node) return null;
  const isRtl = lang.startsWith('ar');
  const fullShown = charCount >= node.textEn.length;

  return (
    <section
      aria-label={`Conversation with ${node.speakerName}`}
      data-testid="npc-dialogue-panel"
      style={{
        position: 'absolute',
        bottom: '84px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '92%',
        maxWidth: '680px',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '2px solid #F4A261',
        borderRadius: '18px',
        padding: '18px 22px',
        color: '#FFF8EE',
        zIndex: 25,
        boxShadow: '0 14px 36px rgba(0,0,0,0.55)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <strong style={{ fontSize: '17px', color: '#FFE29F' }}>{node.speakerName}</strong>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8' }}>{node.emotion}</span>
      </div>

      {/* Native Script Line (RTL for Arabic, Hangul for Korean, French for FR) */}
      <p
        dir={isRtl ? 'rtl' : 'ltr'}
        lang={lang}
        data-testid="dialogue-native-text"
        style={{
          margin: '4px 0',
          fontSize: '18px',
          fontWeight: 700,
          color: '#F4A261',
          lineHeight: 1.5,
        }}
      >
        {node.textNative}
      </p>

      {/* Pronunciation / Transliteration */}
      <p style={{ margin: '2px 0 8px 0', fontSize: '12px', fontStyle: 'italic', color: '#CBD5E1' }}>
        {node.textTranslit}
      </p>

      {/* Typewriter English Gloss */}
      <p data-testid="dialogue-english-text" style={{ margin: '0 0 14px 0', fontSize: '15px', lineHeight: 1.45 }}>
        {node.textEn.slice(0, charCount)}
      </p>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {!fullShown && (
          <button
            type="button"
            data-testid="dialogue-skip-btn"
            onClick={() => setCharCount(node.textEn.length)}
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: '#FFF8EE',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '8px',
              padding: '7px 14px',
              cursor: 'pointer',
            }}
          >
            Skip Typewriter
          </button>
        )}
        {(node.choices || []).map((ch) => (
          <button
            key={ch.choiceId}
            type="button"
            data-testid={`dialogue-choice-${ch.choiceId}`}
            onClick={() => onSelectChoice(ch.choiceId, ch.nextNodeId, ch.triggersObjectiveId)}
            style={{
              background: '#F4A261',
              color: '#0F172A',
              fontWeight: 800,
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            {ch.labelEn}
          </button>
        ))}
        <button
          type="button"
          data-testid="dialogue-close-btn"
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.15)',
            color: '#FFF8EE',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          Continue Exploring
        </button>
      </div>
    </section>
  );
};
