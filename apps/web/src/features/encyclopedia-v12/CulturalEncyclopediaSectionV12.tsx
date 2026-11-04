/**
 * MiraVerse v1.2 — Source-Grounded Cultural Knowledge Encyclopedia & Dual-Layer Atlas Panel (CX03)
 * Integrates:
 * - Age-tier selector (5-7, 8-10, 11-13, 14-17)
 * - Epistemic class filter (Historical Claim, Mythology, Contested History, Cultural Interpretation, Contemporary Practice)
 * - Language & Dialect switcher (en, ar-LB, ar-IQ, ar-EG, fr, ko) with RTL layout support
 * - Dual-layer Real-World WGS84 vs In-Game Quest Map (AG13)
 * - Knowledge Cards with Source Provenance Drawer (AG12)
 */
import React, { useState } from 'react';
import knowledgeV12Data from '../../generated/knowledgeV12.json';
import { KnowledgeCardV12, type KnowledgeRecordItemV12 } from '../knowledge-cards/KnowledgeCardV12';
import { AtlasDualMapV12, type InGameQuestMarkerV12, type RealWorldPinV12 } from '../atlas-dual-map/AtlasDualMapV12';

export type AgeTierV12 = '5-7' | '8-10' | '11-13' | '14-17';

export const CulturalEncyclopediaSectionV12: React.FC<{
  countryFilter?: 'LB' | 'IQ' | 'EG' | 'FR' | 'KR' | 'ALL';
}> = ({ countryFilter = 'ALL' }) => {
  const [selectedCountry, setSelectedCountry] = useState<'LB' | 'IQ' | 'EG' | 'FR' | 'KR' | 'ALL'>(countryFilter);
  const [ageTier, setAgeTier] = useState<AgeTierV12>('11-13');
  const [epistemicFilter, setEpistemicFilter] = useState<string>('ALL');
  const [locale, setLocale] = useState<string>('en');

  const allRecords = (knowledgeV12Data.records as unknown) as KnowledgeRecordItemV12[];
  const realWorldPins = (knowledgeV12Data.real_world_places as unknown) as RealWorldPinV12[];
  const questMarkers = (knowledgeV12Data.in_game_quest_markers as unknown) as InGameQuestMarkerV12[];

  const activeCountry = countryFilter !== 'ALL' ? countryFilter : selectedCountry;

  const visibleRecords = allRecords.filter((rec) => {
    const matchCountry = activeCountry === 'ALL' || rec.country === activeCountry;
    const matchClass = epistemicFilter === 'ALL' || rec.knowledge_class === epistemicFilter;
    return matchCountry && matchClass;
  });

  return (
    <section
      data-testid={`v12-encyclopedia-section-${activeCountry}`}
      style={{
        marginTop: '36px',
        padding: '28px',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, #0F172A 0%, #0B1325 100%)',
        border: '2px solid rgba(244, 162, 97, 0.45)',
        color: '#FFF8EE',
      }}
    >
      {/* Header & Epistemic Guardrail Notice */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '1.3px' }}>
            MiraVerse v1.2 · Source-Grounded Cultural Knowledge Enrichment
          </span>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 3vw, 34px)', margin: '6px 0 8px 0' }}>
            Cultural Knowledge Encyclopedia &amp; Provenance Atlas
          </h2>
          <p style={{ margin: 0, color: '#CBD5E1', fontSize: '14px', maxWidth: '820px', lineHeight: 1.55 }}>
            Explore 25 source-grounded cultural records across <strong>Lebanon → Iraq → Egypt → France → South Korea</strong>. Every entry separates verified historical claims from mythology, folklore, and contested origin hypotheses, with four age-adapted learning treatments.
          </p>
        </div>

        <img
          src="/art/v12/passport/v12-passport-collectible-stamps.svg"
          alt="MiraVerse v1.2 Five-Country Collectible Stamps"
          style={{ maxWidth: '340px', width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}
        />
      </div>

      {/* Control Bar: Age Tier, Country Sequence, Epistemic Class, and Dialect */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '14px',
          background: '#131F38',
          padding: '16px',
          borderRadius: '16px',
          marginBottom: '24px',
          border: '1px solid rgba(148, 163, 184, 0.25)',
        }}
      >
        {/* Age Tier Selector */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#FDE68A', marginBottom: '6px', textTransform: 'uppercase' }}>
            1. Select Age Tier Treatment
          </div>
          <div role="group" aria-label="Age Tier Selector" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['5-7', '8-10', '11-13', '14-17'] as AgeTierV12[]).map((tier) => (
              <button
                key={tier}
                type="button"
                data-testid={`age-tier-btn-${tier}`}
                onClick={() => setAgeTier(tier)}
                style={{
                  background: ageTier === tier ? '#10B981' : '#0F172A',
                  color: ageTier === tier ? '#042F2E' : '#E2E8F0',
                  border: '1px solid #10B981',
                  borderRadius: '999px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Ages {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Country Filter (shown when countryFilter === 'ALL') */}
        {countryFilter === 'ALL' && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#FDE68A', marginBottom: '6px', textTransform: 'uppercase' }}>
              2. Country Sequence (LB → IQ → EG → FR → KR)
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(['ALL', 'LB', 'IQ', 'EG', 'FR', 'KR'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  data-testid={`v12-country-btn-${code}`}
                  onClick={() => setSelectedCountry(code)}
                  style={{
                    background: selectedCountry === code ? '#F4A261' : '#0F172A',
                    color: selectedCountry === code ? '#0F172A' : '#E2E8F0',
                    border: '1px solid rgba(244, 162, 97, 0.5)',
                    borderRadius: '999px',
                    padding: '6px 11px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Epistemic Class Filter */}
        <div>
          <label htmlFor="v12-epistemic-filter" style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#FDE68A', marginBottom: '6px', textTransform: 'uppercase' }}>
            3. Filter by Epistemic Class
          </label>
          <select
            id="v12-epistemic-filter"
            data-testid="v12-epistemic-select"
            value={epistemicFilter}
            onChange={(e) => setEpistemicFilter(e.target.value)}
            style={{
              width: '100%',
              background: '#0F172A',
              color: '#F8FAFC',
              border: '1px solid rgba(148, 163, 184, 0.5)',
              borderRadius: '8px',
              padding: '7px 10px',
              fontSize: '12px',
            }}
          >
            <option value="ALL">All Epistemic Classes ({allRecords.length})</option>
            <option value="historical_claim">Historical Claim (Verified)</option>
            <option value="mythology">Mythology (Non-Literal)</option>
            <option value="contested_history">Contested History / Multiple Hypotheses</option>
            <option value="interpretation">Cultural Interpretation</option>
            <option value="contemporary_practice">Contemporary Practice</option>
          </select>
        </div>

        {/* Dialect / Language Preview */}
        <div>
          <label htmlFor="v12-locale-select" style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#FDE68A', marginBottom: '6px', textTransform: 'uppercase' }}>
            4. Title Locale &amp; Dialect (RTL Ready)
          </label>
          <select
            id="v12-locale-select"
            data-testid="v12-locale-select"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            style={{
              width: '100%',
              background: '#0F172A',
              color: '#F8FAFC',
              border: '1px solid rgba(148, 163, 184, 0.5)',
              borderRadius: '8px',
              padding: '7px 10px',
              fontSize: '12px',
            }}
          >
            <option value="en">English (en)</option>
            <option value="ar-LB">Lebanese Arabic (ar-LB · لبنان)</option>
            <option value="ar-IQ">Iraqi Arabic (ar-IQ · العراق)</option>
            <option value="ar-EG">Egyptian Arabic (ar-EG · مصر)</option>
            <option value="fr">Français · Lyon (fr)</option>
            <option value="ko">한국어 · 전주 (ko)</option>
          </select>
        </div>
      </div>

      {/* Dual-Layer Real-World vs In-Game Quest Atlas */}
      <AtlasDualMapV12
        country={activeCountry}
        realWorldPins={realWorldPins}
        questMarkers={questMarkers}
      />

      {/* Knowledge Cards Grid */}
      <div
        data-testid="v12-knowledge-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: '18px',
        }}
      >
        {visibleRecords.map((rec) => (
          <KnowledgeCardV12
            key={rec.id}
            record={rec}
            selectedAgeTier={ageTier}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
};
