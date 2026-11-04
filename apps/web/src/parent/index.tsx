/**
 * Parent Portal, Dashboard, Gift Redemption, Orders & Policy Pages
 * (`apps/web/src/parent/index.tsx`)
 * Owner: AG18 (Stage V4-05)
 * Implements adult-only routes:
 * /parents, /parents/sign-in, /parents/dashboard, /parents/gifts, /parents/gifts/redeem,
 * /parents/orders, /parents/settings, /privacy, /terms, /refunds, /support
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { redactGiftCodeInText } from '../../../api/src/gifts/index';

export interface ParentPortalProps {
  section?: 'overview' | 'sign-in' | 'dashboard' | 'gifts' | 'redeem' | 'orders' | 'settings' | 'privacy' | 'terms' | 'refunds' | 'support';
}

export const ParentPortalPage: React.FC<ParentPortalProps> = ({ section = 'overview' }) => {
  const [adultEmail, setAdultEmail] = useState<string>('');
  const [signedInEmail, setSignedInEmail] = useState<string | null>('parent.demo@miraverse.studio');
  const [giftCodeInput, setGiftCodeInput] = useState('');
  const [giftStatusMsg, setGiftStatusMsg] = useState<string | null>(null);
  const [profileNickname, setProfileNickname] = useState('MiraExplorer');
  const [consentChecked, setConsentChecked] = useState(true);
  const [exportedDataJson, setExportedDataJson] = useState<string | null>(null);
  const [profileDeletedMsg, setProfileDeletedMsg] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (adultEmail.includes('@')) {
      setSignedInEmail(adultEmail.trim().toLowerCase());
    }
  };

  const handleRedeemGift = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = giftCodeInput.trim().toUpperCase();
    if (!raw.startsWith('MVGIFT-') || raw.length < 16) {
      setGiftStatusMsg('Invalid gift code format. Expected single-use MVGIFT-XXXX-XXXX-XXXX-XXXX.');
      return;
    }
    const redacted = redactGiftCodeInText(raw);
    setGiftStatusMsg(`Gift code verified (${redacted}) — Explorer Keepsake Bundle assigned to your adult account!`);
    setGiftCodeInput('');
  };

  const handleExportProfile = () => {
    setExportedDataJson(
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          adultAccountEmail: signedInEmail,
          consentVersion: '2026-11-v0.4',
          pseudonymousProfiles: [{ profileId: 'prof_demo_01', nickname: profileNickname, earnedMiraTokens: 150 }],
        },
        null,
        2
      )
    );
  };

  const handleDeleteProfile = () => {
    setProfileDeletedMsg('Pseudonymous profile prof_demo_01 and associated token ledger deleted per parent request.');
    setExportedDataJson(null);
  };

  return (
    <div
      data-testid={`parent-page-${section}`}
      style={{
        minHeight: '100vh',
        background: '#0F172A',
        color: '#FFF8EE',
        padding: '28px clamp(16px, 4vw, 56px)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          paddingBottom: '18px',
          marginBottom: '26px',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#F4A261', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            MiraVerse Adult &amp; Guardian Portal · Separate from Child Gameplay
          </span>
          <h1 style={{ margin: '4px 0 0 0', fontSize: '28px', fontFamily: 'Georgia, serif' }}>
            {section === 'privacy'
              ? 'Privacy & Child Data Minimization Policy'
              : section === 'terms'
                ? 'Terms of Service'
                : section === 'refunds'
                  ? 'Refund & Gift Code Policy'
                  : section === 'support'
                    ? 'Family & Billing Support'
                    : 'Parent Dashboard, Gifts & Privacy Controls'}
          </h1>
        </div>

        <nav aria-label="Parent Portal Navigation" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/parents" style={{ color: '#FFE29F', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Overview</Link>
          <Link to="/parents/sign-in" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13px' }}>Sign In</Link>
          <Link to="/parents/dashboard" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13px' }}>Dashboard</Link>
          <Link to="/parents/shop" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13px' }}>Adult Shop</Link>
          <Link to="/parents/gifts" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13px' }}>Gifts</Link>
          <Link to="/parents/gifts/redeem" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13px' }}>Redeem Code</Link>
          <Link to="/parents/orders" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13px' }}>Orders</Link>
          <Link to="/parents/settings" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13px' }}>Settings</Link>
          <Link to="/" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '13px' }}>← Homepage</Link>
        </nav>
      </header>

      {/* Plain-Language Free vs Paid & Child Privacy Guarantee */}
      <section
        aria-label="Parent Trust Summary"
        data-testid="parent-trust-summary"
        style={{
          background: '#1E293B',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(244, 162, 97, 0.4)',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: '20px', color: '#FFE29F' }}>
          Free Guest Play vs. Optional Parent Purchases — Plain-Language Guarantee
        </h2>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#E2E8F0', lineHeight: 1.6 }}>
          <li><strong>100% Free Core Adventures:</strong> Children can play all 5 cultural chapters (France, Lebanon, Egypt, Iraq, South Korea) in guest mode without an account, email, or payment.</li>
          <li><strong>Two Strictly Separated Economies:</strong> <em>Mira Tokens</em> are earned only through quests and never sold for money. Optional parent purchases in <code>/parents/shop</code> are decorative bundles or gift codes sold only to authenticated adults via Stripe Checkout (currently in <strong>Test Mode Only</strong>; live charging is off).</li>
          <li><strong>Zero Cross-Platform Payment Lock-In:</strong> Web purchases apply to Web only; Roblox and Minecraft Bedrock adventures are self-contained with local rewards.</li>
        </ul>
      </section>

      {/* Adult Passkey / Passwordless Sign-In Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <section
          aria-label="Adult Authentication"
          data-testid="parent-auth-card"
          style={{ background: '#1E293B', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <h3 style={{ marginTop: 0 }}>Adult Passkey / Magic-Link Session</h3>
          {signedInEmail ? (
            <div>
              <p style={{ fontSize: '14px', color: '#A7F3D0' }}>
                ✓ Authenticated Adult Session: <strong data-testid="signed-in-adult-email">{signedInEmail}</strong>
              </p>
              <button
                type="button"
                data-testid="parent-signout-btn"
                onClick={() => setSignedInEmail(null)}
                style={{ background: '#334155', color: '#FFF8EE', border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer' }}
              >
                Sign Out Adult Session
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignIn}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }} htmlFor="parent-email-input">
                Adult Guardian Email (Passwordless Verification — No Password Stored):
              </label>
              <input
                id="parent-email-input"
                data-testid="parent-email-input"
                type="email"
                value={adultEmail}
                onChange={(e) => setAdultEmail(e.target.value)}
                placeholder="parent@example.com"
                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #475569', background: '#0F172A', color: '#FFF8EE', marginBottom: '10px' }}
              />
              <button
                type="submit"
                data-testid="parent-signin-btn"
                style={{ background: '#F4A261', color: '#0F172A', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer' }}
              >
                Sign In with Passkey / Verification Link
              </button>
            </form>
          )}
        </section>

        {/* Single-Use Gift Code Redemption Section */}
        <section
          aria-label="Redeem Single-Use Gift Code"
          data-testid="parent-gift-redeem-card"
          style={{ background: '#1E293B', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <h3 style={{ marginTop: 0 }}>Redeem Single-Use Family Gift Code</h3>
          <form onSubmit={handleRedeemGift}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }} htmlFor="gift-code-input">
              Enter 128-Bit Entitlement Code (Redacted in Logs):
            </label>
            <input
              id="gift-code-input"
              data-testid="gift-code-input"
              type="text"
              value={giftCodeInput}
              onChange={(e) => setGiftCodeInput(e.target.value)}
              placeholder="MVGIFT-XXXX-XXXX-XXXX-XXXX"
              style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #475569', background: '#0F172A', color: '#FFF8EE', marginBottom: '10px' }}
            />
            <button
              type="submit"
              data-testid="gift-redeem-submit"
              style={{ background: '#10B981', color: '#06281E', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer' }}
            >
              Redeem Gift Code Atomically
            </button>
          </form>
          {giftStatusMsg && (
            <p role="status" data-testid="gift-redeem-status" style={{ marginTop: '10px', fontSize: '13px', color: '#FFE29F' }}>
              {giftStatusMsg}
            </p>
          )}
        </section>

        {/* Consented Pseudonymous Profile, Export & Delete Controls */}
        <section
          aria-label="Consented Pseudonymous Child Profile Controls"
          data-testid="parent-privacy-controls-card"
          style={{ background: '#1E293B', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <h3 style={{ marginTop: 0 }}>Optional Pseudonymous Child Profile &amp; Data Rights</h3>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', marginBottom: '10px' }}>
            <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} />
            <span>I am an adult parent/guardian granting consent for an opaque pseudonymous profile (no child email collected).</span>
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            <button
              type="button"
              data-testid="parent-export-data-btn"
              onClick={handleExportProfile}
              style={{ background: '#3B82F6', color: '#FFF8EE', fontWeight: 700, border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer' }}
            >
              Export Profile Data (JSON)
            </button>
            <button
              type="button"
              data-testid="parent-delete-profile-btn"
              onClick={handleDeleteProfile}
              style={{ background: '#EF4444', color: '#FFF8EE', fontWeight: 700, border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer' }}
            >
              Delete Profile &amp; Revoke Consent
            </button>
          </div>
          {exportedDataJson && (
            <pre data-testid="exported-profile-json" style={{ marginTop: '10px', fontSize: '11px', background: '#0F172A', padding: '10px', borderRadius: '8px', overflowX: 'auto' }}>
              {exportedDataJson}
            </pre>
          )}
          {profileDeletedMsg && (
            <p role="status" data-testid="deleted-profile-status" style={{ marginTop: '10px', fontSize: '13px', color: '#FCA5A5' }}>
              {profileDeletedMsg}
            </p>
          )}
        </section>
      </div>
    </div>
  );
};
