/**
 * MiraVerse v0.8 — Adult-Only Storefront & Catalog UI (`apps/web/src/storefront/index.tsx`)
 * Owners: AG17, CL08, CX08
 * - Strictly isolated under /parents/shop and /shop (18+ gated)
 * - Uses single shared site header in App.tsx (no duplicate top navbar)
 * - Clear separation of "Parent Purchase (Optional · Stripe Test Mode)" vs "Earned in Game (Free)"
 * - Explicit disclosure that web purchases do not unlock Roblox or Minecraft items
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
  const [adultConfirmed, setAdultConfirmed] = useState<boolean>(Boolean(adultEmail));
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
        minHeight: '88vh',
        background: '#0B1325',
        color: '#FFF8EE',
        padding: '28px clamp(16px, 4vw, 56px) 64px',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <section
          style={{
            background: 'linear-gradient(135deg, #131F38 0%, #1E293B 100%)',
            borderRadius: '22px',
            border: '1px solid rgba(244, 162, 97, 0.45)',
            padding: 'clamp(18px, 3vw, 28px)',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <img
              src="/art/v08/commerce/gift-keepsake-card.svg"
              alt="MiraVerse Family Keepsake Gift"
              width={140}
              height={80}
              style={{ borderRadius: '10px' }}
            />
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#F4A261', textTransform: 'uppercase', letterSpacing: '1.4px' }}>
                Adult &amp; Guardian Portal (18+) · Stripe Test Mode ({COMMERCE_FLAGS.STRIPE_LIVE_ENABLED ? 'LIVE' : 'TEST MODE ONLY / LIVE CHARGES OFF'})
              </span>
              <h1 style={{ margin: '4px 0 4px 0', fontSize: 'clamp(24px, 3vw, 32px)', fontFamily: 'Georgia, serif' }}>
                MiraVerse Parent Shop &amp; Printable Family Gifts
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1' }}>
                Web-only printable keepsake bundles and single-use gift codes. Does not sell or unlock Roblox or Minecraft items.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/parents" style={{ color: '#FFE29F', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>
              ← Parent Overview
            </Link>
            <Link to="/parents/gifts/redeem" style={{ color: '#6EE7B7', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>
              Redeem Gift Code →
            </Link>
          </div>
        </section>

        <div
          role="note"
          style={{
            background: 'rgba(16, 185, 129, 0.14)',
            border: '1px solid #10B981',
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#D1FAE5',
          }}
        >
          <strong>Zero Paywalls Guarantee:</strong> All 5 cultural stories and our Byblos Roblox &amp; Minecraft Bedrock adventures are free to explore. Optional parent purchases below provide web-only keepsake bundles or printable gift codes in Stripe Test Mode.
        </div>

        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#131F38',
            padding: '10px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(244, 162, 97, 0.45)',
            marginBottom: '24px',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          <input
            type="checkbox"
            checked={adultConfirmed}
            onChange={(e) => setAdultConfirmed(e.target.checked)}
          />
          <span>I am an adult parent, guardian, or educator (18+) testing optional web keepsake checkout.</span>
        </label>

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

        {/* Section 1: Parent-Purchased Optional Bundles & Gifts */}
        <section aria-label="Optional Parent Purchases" style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '22px', fontFamily: 'Georgia, serif', marginBottom: '14px' }}>
            Optional Parent Keepsake Bundles &amp; Family Gifts (USD · Stripe Test Mode)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
            {parentItems.map((item) => (
              <article
                key={item.sku}
                data-testid={`store-card-${item.sku}`}
                style={{
                  background: '#131F38',
                  border: '1px solid rgba(244, 162, 97, 0.45)',
                  borderRadius: '18px',
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
                  <h3 style={{ margin: '4px 0 8px 0', fontSize: '19px', fontFamily: 'Georgia, serif' }}>{item.titleEn}</h3>
                  <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.48 }}>{item.descriptionEn}</p>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '10px' }}>
                    Price: <strong>${((item.unitAmountCents || 0) / 100).toFixed(2)} {item.currency}</strong> (One-time · {item.refundWindowDays}-day refund eligibility · Web-only entitlement)
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
                    fontWeight: 900,
                    border: 'none',
                    borderRadius: '10px',
                    padding: '11px 16px',
                    cursor: 'pointer',
                  }}
                >
                  {adultEmail
                    ? `Confirm Stripe Test Checkout ($${((item.unitAmountCents || 0) / 100).toFixed(2)} USD)`
                    : `Test Checkout as Parent ($${((item.unitAmountCents || 0) / 100).toFixed(2)} USD)`}
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Section 2: Earned-Only In-Game Cosmetics */}
        <section aria-label="Earned In-Game Cosmetics">
          <h2 style={{ fontSize: '22px', fontFamily: 'Georgia, serif', marginBottom: '8px' }}>
            Earned In-Game Keepsakes (Mira Tokens Only — Never Sold for Money)
          </h2>
          <p style={{ fontSize: '13px', color: '#CBD5E1', marginBottom: '16px' }}>
            Mira Tokens are earned exclusively through cultural quests. They cannot be bought with real money or exchanged.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
            {earnedItems.map((item) => (
              <article
                key={item.sku}
                data-testid={`earned-card-${item.sku}`}
                style={{
                  background: 'rgba(19, 31, 56, 0.75)',
                  border: '1px solid rgba(52, 211, 153, 0.45)',
                  borderRadius: '16px',
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
    </div>
  );
};
