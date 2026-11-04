/**
 * Adult-Only Storefront & Catalog UI (`apps/web/src/storefront/index.tsx`)
 * Owner: AG17 (Stage V4-04)
 * - Strictly isolated under /parents/shop
 * - Unambiguous badges for "Parent Purchase (Optional)" vs "Earned in Game (Free)"
 * - Never mixes Mira Tokens with real money in a single price label
 * - Displays unit price, currency, tax disclosure, and refund window before Stripe test Checkout
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { listPublicCatalog, COMMERCE_FLAGS } from '../../../api/src/catalog/index';

export interface AdultStorefrontProps {
  adultEmail?: string | null;
  onStartTestCheckout?: (sku: string, isGift: boolean) => void;
}

export const AdultStorefront: React.FC<AdultStorefrontProps> = ({
  adultEmail,
  onStartTestCheckout,
}) => {
  const catalog = listPublicCatalog();
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [checkoutConfirmation, setCheckoutConfirmation] = useState<string | null>(null);

  const parentItems = catalog.filter((i) => i.economy === 'PARENT_PURCHASE');
  const earnedItems = catalog.filter((i) => i.economy === 'EARNED_MIRA_TOKENS');

  const handleCheckout = (sku: string, isGift: boolean) => {
    setSelectedSku(sku);
    const item = catalog.find((c) => c.sku === sku);
    if (item) {
      setCheckoutConfirmation(
        `Stripe Test Checkout Session created for ${item.titleEn} ($${((item.unitAmountCents || 0) / 100).toFixed(2)} ${item.currency}) [TEST MODE ONLY — LIVE CHARGES DISABLED]`
      );
    }
    onStartTestCheckout?.(sku, isGift);
  };

  return (
    <div
      data-testid="adult-storefront-page"
      style={{
        minHeight: '100vh',
        background: '#0F172A',
        color: '#FFF8EE',
        padding: '28px clamp(16px, 4vw, 56px)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#F4A261', textTransform: 'uppercase', letterSpacing: '1.4px' }}>
            Adult &amp; Guardian Portal Only · Stripe Test Mode ({COMMERCE_FLAGS.STRIPE_LIVE_ENABLED ? 'LIVE' : 'TEST MODE COMPLETE / LIVE BLOCKED'})
          </span>
          <h1 style={{ margin: '4px 0 0 0', fontSize: '28px', fontFamily: 'Georgia, serif' }}>
            MiraVerse Parent Shop &amp; Family Gifts
          </h1>
        </div>
        <nav style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/parents" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Parent Overview</Link>
          <Link to="/parents/dashboard" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/parents/gifts/redeem" style={{ color: '#FFE29F', textDecoration: 'none' }}>Redeem Gift Code</Link>
          <Link to="/parents/orders" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Order History</Link>
          <Link to="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>← Public Homepage</Link>
        </nav>
      </header>

      <div
        role="note"
        style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid #10B981',
          borderRadius: '14px',
          padding: '14px 18px',
          marginBottom: '28px',
          fontSize: '14px',
          color: '#D1FAE5',
        }}
      >
        <strong>Zero Paywalls Guarantee:</strong> All 5 country adventures (France, Lebanon, Egypt, Iraq, South Korea), all 25 cultural challenges, and all 5 bilingual stories are <strong>100% free</strong>. Optional parent purchases below provide decorative keepsake bundles or printable gift codes only.
      </div>

      {checkoutConfirmation && (
        <div
          role="status"
          data-testid="stripe-test-checkout-banner"
          style={{
            background: 'rgba(244, 162, 97, 0.2)',
            border: '2px solid #F4A261',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '24px',
            color: '#FFE29F',
            fontWeight: 700,
          }}
        >
          ✓ {checkoutConfirmation} (Selected SKU: {selectedSku})
        </div>
      )}

      {/* Section 1: Parent-Purchased Optional Bundles & Gifts (Real Currency — Adult Only) */}
      <section aria-label="Optional Parent Purchases" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', marginBottom: '14px' }}>Optional Parent Purchases &amp; Printable Family Gifts (USD · Test Mode)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {parentItems.map((item) => (
            <article
              key={item.sku}
              data-testid={`store-card-${item.sku}`}
              style={{
                background: '#1E293B',
                border: '1px solid rgba(244, 162, 97, 0.45)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span
                  data-testid={`badge-${item.sku}`}
                  style={{
                    display: 'inline-block',
                    background: 'rgba(244, 162, 97, 0.2)',
                    color: '#FFE29F',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                    marginBottom: '10px',
                  }}
                >
                  {item.previewBadgeText}
                </span>
                <h3 style={{ margin: '4px 0 8px 0', fontSize: '19px' }}>{item.titleEn}</h3>
                <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.45 }}>{item.descriptionEn}</p>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '10px' }}>
                  Price: <strong>$${((item.unitAmountCents || 0) / 100).toFixed(2)} ${item.currency}</strong> (One-time · Taxes calculated at checkout · {item.refundWindowDays}-day refund eligibility · Web-only entitlement)
                </p>
              </div>
              <button
                type="button"
                data-testid={`checkout-btn-${item.sku}`}
                onClick={() => handleCheckout(item.sku, Boolean(item.isGiftable))}
                style={{
                  marginTop: '14px',
                  background: '#F4A261',
                  color: '#0F172A',
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  cursor: 'pointer',
                }}
              >
                {adultEmail ? `Confirm Stripe Test Checkout ($${((item.unitAmountCents || 0) / 100).toFixed(2)} USD)` : `Test Checkout as Parent ($${((item.unitAmountCents || 0) / 100).toFixed(2)} USD)`}
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Section 2: Earned-Only In-Game Cosmetics (Mira Tokens — Never Sold for Money) */}
      <section aria-label="Earned In-Game Cosmetics">
        <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Earned In-Game Keepsakes (Mira Tokens Only — Never For Sale)</h2>
        <p style={{ fontSize: '13px', color: '#CBD5E1', marginBottom: '16px' }}>
          Mira Tokens are earned exclusively through safe exploration and completing cultural quests. They cannot be bought with real money or exchanged.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {earnedItems.map((item) => (
            <article
              key={item.sku}
              data-testid={`earned-card-${item.sku}`}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                borderRadius: '14px',
                padding: '18px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#A7F3D0',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 800,
                  marginBottom: '8px',
                }}
              >
                {item.previewBadgeText}
              </span>
              <h3 style={{ margin: '4px 0', fontSize: '17px' }}>{item.titleEn}</h3>
              <p style={{ fontSize: '13px', color: '#CBD5E1', margin: '6px 0 0 0' }}>{item.descriptionEn}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
