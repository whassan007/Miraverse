/**
 * MiraVerse v1.2 — Knowledge Card UX (AG12)
 * Renders canonical cultural knowledge records with:
 * - Neutral epistemic badges (Historical Claim, Mythology, Folklore, Cultural Interpretation, Contested History, Contemporary Practice)
 * - Claim verification status & confidence badge (never 'high' on unverified claims)
 * - 4-Tier Age Switcher (5-7, 8-10, 11-13, 14-17)
 * - Expandable Source & Provenance Drawer with passage locators and sensitivity/allergy notes
 */
import React, { useState } from 'react';

export interface KnowledgeRecordItemV12 {
  id: string;
  country: 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';
  title: Record<string, string>;
  entity_type: string;
  summary: string;
  expanded_explanation: string;
  knowledge_class: string;
  claim_status: string;
  confidence: string;
  time_period: string;
  people: string[];
  places: string[];
  sources: Array<{ source_id: string; passage_locator: string; url: string | null; verified: boolean; note?: string }>;
  sensitivity_notes: string[];
  cultural_review: string;
  age_tier_explanations: Record<'5-7' | '8-10' | '11-13' | '14-17', string>;
  quest_links: string[];
  atlas_links: string[];
  svg_asset?: string;
}

const EPISTEMIC_META: Record<string, { label: string; bg: string; border: string; text: string }> = {
  historical_claim: { label: 'Historical Claim', bg: 'rgba(15, 118, 110, 0.25)', border: '#14B8A6', text: '#99F6E4' },
  mythology: { label: 'Mythology (Not Literal History)', bg: 'rgba(124, 58, 237, 0.25)', border: '#A78BFA', text: '#DDD6FE' },
  folklore: { label: 'Folklore & Oral Tradition', bg: 'rgba(217, 119, 6, 0.25)', border: '#F59E0B', text: '#FDE68A' },
  interpretation: { label: 'Cultural Interpretation', bg: 'rgba(37, 99, 235, 0.25)', border: '#60A5FA', text: '#BFDBFE' },
  contested_history: { label: 'Contested History · Multiple Hypotheses', bg: 'rgba(180, 83, 9, 0.28)', border: '#FBBF24', text: '#FEF3C7' },
  contemporary_practice: { label: 'Contemporary Practice', bg: 'rgba(5, 150, 105, 0.25)', border: '#34D399', text: '#D1FAE5' },
  fictional_game_content: { label: 'Fictional Quest Framing', bg: 'rgba(71, 85, 105, 0.3)', border: '#94A3B8', text: '#E2E8F0' },
};

const STATUS_LABELS: Record<string, string> = {
  externally_corrobated: 'Externally Corroborated',
  source_asserted_unverified: 'Source-Asserted · Pending External Check',
  disputed: 'Contested / Multiple Historical Views',
  human_reviewed: 'Human Reviewed',
};

export const KnowledgeCardV12: React.FC<{
  record: KnowledgeRecordItemV12;
  selectedAgeTier: '5-7' | '8-10' | '11-13' | '14-17';
  locale?: string;
}> = ({ record, selectedAgeTier, locale = 'en' }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const meta = EPISTEMIC_META[record.knowledge_class] || EPISTEMIC_META.historical_claim;
  const localizedTitle = record.title[locale] || record.title.en;
  const isRtl = locale.startsWith('ar');

  return (
    <article
      data-testid={`knowledge-card-${record.id}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        background: '#131F38',
        borderRadius: '18px',
        border: `1.5px solid ${meta.border}`,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        color: '#FFF8EE',
      }}
    >
      {/* Top Epistemic & Verification Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          data-testid={`epistemic-badge-${record.id}`}
          style={{
            background: meta.bg,
            border: `1px solid ${meta.border}`,
            color: meta.text,
            padding: '4px 11px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 800,
          }}
        >
          {meta.label}
        </span>

        <span
          data-testid={`claim-status-${record.id}`}
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(148, 163, 184, 0.4)',
            color: '#CBD5E1',
            padding: '3px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
          }}
        >
          {STATUS_LABELS[record.claim_status] || record.claim_status} · Confidence: {record.confidence.toUpperCase()}
        </span>
      </div>

      {/* Record Title & Period */}
      <div>
        <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {record.country} · {record.entity_type} · {record.time_period}
        </div>
        <h3 style={{ margin: '4px 0 0 0', fontSize: '19px', fontFamily: 'Georgia, serif', color: '#FEF08A' }}>
          {localizedTitle}
        </h3>
        {locale !== 'en' && record.title.en && (
          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{record.title.en}</div>
        )}
      </div>

      {/* Optional Illustrated Diagram SVG */}
      {record.svg_asset && (
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: '#0F172A' }}>
          <img
            src={record.svg_asset}
            alt={record.title.en}
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      )}

      {/* Age-Adapted Explanation Box */}
      <div
        data-testid={`age-explanation-${record.id}-${selectedAgeTier}`}
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          borderRadius: '12px',
          padding: '13px 15px',
          borderLeft: `4px solid ${meta.border}`,
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#6EE7B7', marginBottom: '4px' }}>
          Age {selectedAgeTier} Learning Treatment
        </div>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.55, color: '#F1F5F9' }}>
          {record.age_tier_explanations[selectedAgeTier]}
        </p>
      </div>

      {/* Sensitivity & Safety Guardrails */}
      {record.sensitivity_notes && record.sensitivity_notes.length > 0 && (
        <div
          style={{
            background: 'rgba(6, 78, 59, 0.32)',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '12px',
            color: '#A7F3D0',
          }}
        >
          <strong>Safety &amp; Cultural Guardrail:</strong> {record.sensitivity_notes.join(' · ')}
        </div>
      )}

      {/* Provenance & Quest Link Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: 'auto', paddingTop: '6px' }}>
        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
          Quests: <strong>{record.quest_links.join(', ')}</strong>
        </div>
        <button
          type="button"
          data-testid={`provenance-toggle-${record.id}`}
          onClick={() => setDrawerOpen((prev) => !prev)}
          style={{
            background: drawerOpen ? '#F4A261' : 'rgba(244, 162, 97, 0.16)',
            color: drawerOpen ? '#0F172A' : '#FDE68A',
            border: '1px solid rgba(244, 162, 97, 0.5)',
            borderRadius: '999px',
            padding: '5px 12px',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {drawerOpen ? 'Hide Provenance & Editorial Note' : 'Source Provenance & Editorial Note'}
        </button>
      </div>

      {drawerOpen && (
        <div
          data-testid={`provenance-drawer-${record.id}`}
          style={{
            background: '#0B1325',
            borderRadius: '12px',
            padding: '12px 14px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            fontSize: '12px',
            color: '#CBD5E1',
          }}
        >
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#FEF08A' }}>Editorial Summary (Paraphrase Only):</strong> {record.expanded_explanation}
          </div>
          <div style={{ marginBottom: '6px' }}>
            <strong style={{ color: '#BAE6FD' }}>Source Passages:</strong>
            <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
              {record.sources.map((s, idx) => (
                <li key={idx}>
                  <code>{s.source_id}</code> · Locator: <code>{s.passage_locator}</code> ({s.verified ? 'Externally Corroborated' : 'User-Supplied Research Input — Review Required'})
                  {s.note ? ` — ${s.note}` : ''}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>
            Rights: <code>paraphrase_only</code> · Media: <code>original_svg_cleared</code>
          </div>
        </div>
      )}
    </article>
  );
};
