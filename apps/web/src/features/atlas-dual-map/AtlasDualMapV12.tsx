/**
 * MiraVerse v1.2 — Dual-Layer Atlas UX (AG13)
 * Strictly separates:
 * 1. Verified Real-World Geodata (WGS84 latitude/longitude pins with coordinate source & uncertainty)
 * 2. Illustrated In-Game Quest Maps (explicitly badged "in-game map / not to geographic scale")
 */
import React, { useState } from 'react';

export interface RealWorldPinV12 {
  place_id: string;
  country: 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';
  name: Record<string, string>;
  latitude: number;
  longitude: number;
  coordinate_source: string;
  uncertainty_meters: number;
  status: string;
  linked_records: string[];
}

export interface InGameQuestMarkerV12 {
  marker_id: string;
  country: 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';
  world_id: string;
  platform: string;
  in_game_coordinate_system: string;
  svg_x_pct: number;
  svg_y_pct: number;
  roblox_pos: number[];
  bedrock_pos: number[];
  act_id: string;
  level: number;
  unlock_rule: string;
  asset_reference: string;
  scale_label: string;
}

export const AtlasDualMapV12: React.FC<{
  country: 'LB' | 'IQ' | 'EG' | 'FR' | 'KR' | 'ALL';
  realWorldPins: RealWorldPinV12[];
  questMarkers: InGameQuestMarkerV12[];
}> = ({ country, realWorldPins, questMarkers }) => {
  const [layer, setLayer] = useState<'REAL_WORLD' | 'QUEST_MAP'>('REAL_WORLD');

  const filteredPins = country === 'ALL' ? realWorldPins : realWorldPins.filter((p) => p.country === country);
  const filteredMarkers = country === 'ALL' ? questMarkers : questMarkers.filter((m) => m.country === country);

  return (
    <section
      data-testid="atlas-dual-map-v12"
      style={{
        background: '#111C33',
        borderRadius: '20px',
        border: '1.5px solid rgba(56, 189, 248, 0.45)',
        padding: '22px',
        marginBottom: '28px',
        color: '#FFF8EE',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
            MiraVerse v1.2 Cartographic Integrity · Dual-Layer Atlas
          </span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', fontFamily: 'Georgia, serif' }}>
            {layer === 'REAL_WORLD'
              ? 'Layer 1: Verified Real-World Cultural Geodata (WGS84)'
              : 'Layer 2: Illustrated Quest Map (in-game map / not to geographic scale)'}
          </h3>
        </div>

        <div role="tablist" aria-label="Atlas Layer Mode" style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            role="tab"
            data-testid="atlas-tab-real-world"
            aria-selected={layer === 'REAL_WORLD'}
            onClick={() => setLayer('REAL_WORLD')}
            style={{
              background: layer === 'REAL_WORLD' ? '#0284C7' : '#1E293B',
              color: '#F8FAFC',
              border: '1px solid #38BDF8',
              borderRadius: '999px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🌍 Real-World Geodata ({filteredPins.length} Verified Pins)
          </button>
          <button
            type="button"
            role="tab"
            data-testid="atlas-tab-quest-map"
            aria-selected={layer === 'QUEST_MAP'}
            onClick={() => setLayer('QUEST_MAP')}
            style={{
              background: layer === 'QUEST_MAP' ? '#D97706' : '#1E293B',
              color: '#F8FAFC',
              border: '1px solid #FBBF24',
              borderRadius: '999px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🧭 Illustrated Quest Map ({filteredMarkers.length} Nodes)
          </button>
        </div>
      </div>

      {layer === 'REAL_WORLD' ? (
        <div data-testid="real-world-pins-panel">
          <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#CBD5E1' }}>
            Every real-world pin below uses externally corroborated WGS84 coordinates with explicit source attribution and uncertainty radius. Fictional NPCs and in-game quest triggers are never plotted as real-world coordinates.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '14px' }}>
            {filteredPins.map((pin) => (
              <div
                key={pin.place_id}
                data-testid={`real-pin-${pin.place_id}`}
                style={{
                  background: '#1E293B',
                  borderRadius: '14px',
                  padding: '14px',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#7DD3FC', fontWeight: 700 }}>
                  <span>{pin.country} · {pin.status}</span>
                  <span>±{pin.uncertainty_meters}m</span>
                </div>
                <strong style={{ display: 'block', fontSize: '15px', color: '#FEF08A', marginTop: '4px' }}>
                  {pin.name.en}
                </strong>
                <div style={{ fontSize: '12px', color: '#E2E8F0', fontFamily: 'monospace', marginTop: '6px' }}>
                  Lat: {pin.latitude.toFixed(4)}° N · Lon: {pin.longitude.toFixed(4)}° E
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
                  Source: {pin.coordinate_source}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div data-testid="quest-map-nodes-panel">
          <div
            data-testid="quest-map-scale-disclaimer"
            style={{
              display: 'inline-block',
              background: '#475569',
              color: '#F8FAFC',
              padding: '5px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '12px',
            }}
          >
            in-game map / not to geographic scale
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '14px' }}>
            {filteredMarkers.map((qm) => (
              <div
                key={qm.marker_id}
                data-testid={`quest-marker-${qm.marker_id}`}
                style={{
                  background: '#1E293B',
                  borderRadius: '14px',
                  padding: '14px',
                  border: '1px solid rgba(251, 191, 36, 0.4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#FDE68A', fontWeight: 700 }}>
                  <span>{qm.country} · World: {qm.world_id}</span>
                  <span>Act: {qm.act_id} (Lv.{qm.level})</span>
                </div>
                <div style={{ marginTop: '8px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={qm.asset_reference} alt={qm.act_id} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '8px' }}>
                  In-Game Coords: SVG ({qm.svg_x_pct}%, {qm.svg_y_pct}%) · Roblox [{qm.roblox_pos.join(', ')}] · Bedrock [{qm.bedrock_pos.join(', ')}]
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                  Label: <strong>{qm.scale_label}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
