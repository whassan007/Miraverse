/**
 * MiraVerse v0.7 (Option A) — Homepage Option A Truthfulness & Companion Strip (`AG16`)
 * Renders truthful "Play free on Roblox" & "Play in Minecraft Bedrock" guidance
 * and explicit RC1 Flagship (Lebanon) vs RC3 Expansion availability badges.
 */
import React from 'react';
import { Link } from 'react-router-dom';

export const OptionALandingStrip: React.FC = () => {
  return (
    <section
      data-testid="option-a-platform-strip"
      aria-label="How to Play MiraVerse Across Roblox and Minecraft Bedrock"
      style={{
        padding: '32px clamp(16px, 4vw, 56px)',
        background: 'linear-gradient(180deg, #0F172A 0%, #0B1325 100%)',
        borderBottom: '1px solid rgba(244, 162, 97, 0.3)',
      }}
    >
      <div
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        <div
          data-testid="card-flagship-roblox"
          style={{
            background: 'rgba(0, 176, 111, 0.1)',
            border: '1px solid rgba(0, 176, 111, 0.5)',
            borderRadius: '18px',
            padding: '22px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#6EE7B7', textTransform: 'uppercase' }}>
            RC1 Flagship · Primary Experience
          </span>
          <h3 style={{ margin: '8px 0', fontSize: '21px', color: '#FFF8EE' }}>
            Play free on Roblox — Lebanon: Summer at Teta’s
          </h3>
          <p style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.55 }}>
            Explore Byblos Harbor in 3D, meet Teta Nahla, gather wild za’atar, bake warm man’oushe on the saj, restore a limestone courtyard house, and customize your hero in the Avatar Studio. Requires the free Roblox app and account.
          </p>
          <Link
            to="/play/LB"
            data-testid="strip-cta-play-roblox"
            style={{
              display: 'inline-block',
              marginTop: '10px',
              background: '#00B06F',
              color: '#052E16',
              textDecoration: 'none',
              padding: '10px 20px',
              borderRadius: '999px',
              fontWeight: 900,
              fontSize: '14px',
            }}
          >
            ▶ Play free on Roblox
          </Link>
        </div>

        <div
          data-testid="card-companion-minecraft"
          style={{
            background: 'rgba(217, 119, 6, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            borderRadius: '18px',
            padding: '22px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#FCD34D', textTransform: 'uppercase' }}>
            RC2 Companion · Block-Building Edition
          </span>
          <h3 style={{ margin: '8px 0', fontSize: '21px', color: '#FFF8EE' }}>
            Play in Minecraft Bedrock — Byblos Construction Companion
          </h3>
          <p style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.55 }}>
            Requires Minecraft Bedrock Edition (v1.21.50+). Build and restore Byblos harbor structures block-by-block with independent Bedrock progression and free downloadable add-on packs.
          </p>
          <Link
            to="/minecraft"
            data-testid="strip-cta-play-minecraft"
            style={{
              display: 'inline-block',
              marginTop: '10px',
              background: '#F59E0B',
              color: '#0F172A',
              textDecoration: 'none',
              padding: '10px 20px',
              borderRadius: '999px',
              fontWeight: 900,
              fontSize: '14px',
            }}
          >
            Play in Minecraft Bedrock
          </Link>
        </div>
      </div>
    </section>
  );
};
