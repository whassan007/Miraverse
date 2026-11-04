/**
 * MiraVerse v0.7 (Option A) — Adult-Only Web Commerce & Separate Economy Notice (`AG18`)
 */
import React from 'react';

export const AdultCommerceNotice: React.FC = () => (
  <aside
    data-testid="option-a-commerce-boundary-notice"
    style={{
      background: 'rgba(15, 23, 42, 0.92)',
      border: '1px solid rgba(244, 162, 97, 0.5)',
      borderRadius: '14px',
      padding: '14px 18px',
      margin: '12px 0',
      color: '#FDE68A',
      fontSize: '13px',
      lineHeight: 1.5,
    }}
  >
    <strong>Option A Economy Disclosure (Stripe Test Mode Only):</strong> Web purchases and gift codes fulfill downloadable printable family storybook &amp; activity kits on this website only. They never purchase Robux, Minecoins, Roblox GamePasses, or in-game progression.
  </aside>
);
