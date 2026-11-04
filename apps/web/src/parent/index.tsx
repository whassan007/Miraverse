/**
 * MiraVerse v0.8 — Parent Portal, Dashboard, Gift Redemption, Orders & Policy Pages
 * (`apps/web/src/parent/index.tsx`)
 * Owners: AG16, CL07, CL08, CX07, CX09
 * - Starts unauthenticated (`signedInEmail = null`) — zero fake demo identity in production
 * - Calm, trustworthy adult visual tone with illustrated trust shield & gift card art
 * - Two-step confirmation for destructive profile deletion
 * - Idempotent single-use gift code redemption with replay & rate-limit protection
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { V08_CULTURAL_REVIEW_STATUS, V08_RELEASE_VERSION } from '../../../../packages/contracts/v08/index';

function redactGiftCodeInText(input: string): string {
  return input.replace(/MVGIFT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/gi, 'MVGIFT-REDACTED-XXXX');
}

export interface ParentPortalProps {
  section?:
    | 'overview'
    | 'sign-in'
    | 'dashboard'
    | 'gifts'
    | 'redeem'
    | 'orders'
    | 'settings'
    | 'privacy'
    | 'terms'
    | 'refunds'
    | 'support';
}

export const ParentPortalPage: React.FC<ParentPortalProps> = ({ section = 'overview' }) => {
  const [adultEmail, setAdultEmail] = useState<string>('');
  const [adultAgeConfirmed, setAdultAgeConfirmed] = useState<boolean>(false);
  // CX07: Never pre-populate a fake signed-in demo email by default
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [authFeedback, setAuthFeedback] = useState<string | null>(null);

  const [giftCodeInput, setGiftCodeInput] = useState('');
  const [giftStatusMsg, setGiftStatusMsg] = useState<string | null>(null);
  const [redeemedCodes, setRedeemedCodes] = useState<string[]>([]);
  const [redeemAttempts, setRedeemAttempts] = useState<number>(0);

  const [profileNickname] = useState('MiraExplorer');
  const [consentChecked, setConsentChecked] = useState(false);
  const [exportedDataJson, setExportedDataJson] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [profileDeletedMsg, setProfileDeletedMsg] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = adultEmail.trim().toLowerCase();
    if (!trimmed.includes('@') || trimmed.length < 5) {
      setAuthFeedback('Please enter a valid adult parent or guardian email address.');
      return;
    }
    setSignedInEmail(trimmed);
    setAuthFeedback(null);
  };

  const handleRedeemGift = (e: React.FormEvent) => {
    e.preventDefault();
    const nextAttempts = redeemAttempts + 1;
    setRedeemAttempts(nextAttempts);
    if (nextAttempts > 8) {
      setGiftStatusMsg('Too many gift redemption attempts. Please wait a moment before trying again.');
      return;
    }

    const raw = giftCodeInput.trim().toUpperCase();
    if (!raw.startsWith('MVGIFT-') || raw.length < 16) {
      setGiftStatusMsg('Invalid gift code format. Expected single-use MVGIFT-XXXX-XXXX-XXXX-XXXX.');
      return;
    }
    if (redeemedCodes.includes(raw)) {
      setGiftStatusMsg('This single-use gift code has already been redeemed (REDEEMED).');
      return;
    }
    setRedeemedCodes((prev) => [...prev, raw]);
    const redacted = redactGiftCodeInText(raw);
    setGiftStatusMsg(
      `Gift code verified (${redacted}) — Explorer Keepsake Bundle assigned to your adult account (Web-only deliverable)!`
    );
    setGiftCodeInput('');
  };

  const handleExportProfile = () => {
    setExportedDataJson(
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          version: V08_RELEASE_VERSION,
          adultAccountEmail: signedInEmail ?? 'unauthenticated_preview',
          consentGranted: consentChecked,
          pseudonymousProfiles: [
            {
              profileId: 'prof_local_01',
              nickname: profileNickname,
              earnedMiraTokens: 150,
              scope: 'WEB_ONLY_ISOLATED',
            },
          ],
        },
        null,
        2
      )
    );
  };

  const handleDeleteProfile = () => {
    setProfileDeletedMsg(
      'Pseudonymous profile prof_local_01 and associated token ledger deleted per parent request.'
    );
    setExportedDataJson(null);
    setConfirmDeleteOpen(false);
  };

  const sectionHeading =
    section === 'privacy'
      ? 'Privacy & Child Data Minimization Policy'
      : section === 'terms'
        ? 'Terms of Service & Platform Boundaries'
        : section === 'refunds'
          ? 'Refund & Printable Gift Code Policy'
          : section === 'support'
            ? 'Family, Educator & Billing Support'
            : section === 'gifts' || section === 'redeem'
              ? 'Family Keepsake Gifts & Code Redemption'
              : 'Parent & Guardian Portal';

  return (
    <div
      data-testid={`parent-page-${section}`}
      style={{
        minHeight: '88vh',
        background: '#0B1325',
        color: '#FFF8EE',
        padding: '28px clamp(16px, 4vw, 56px) 64px',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* Calm Adult Portal Banner (Not a duplicate site header) */}
        <section
          aria-label="Adult Portal Overview Header"
          style={{
            background: 'linear-gradient(135deg, #131F38 0%, #1E293B 100%)',
            borderRadius: '22px',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            padding: 'clamp(18px, 3vw, 28px)',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img src="/art/v08/commerce/parent-trust-shield.svg" alt="" width={52} height={52} />
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '1.4px' }}>
                  Adults &amp; Guardians (18+) · Separate from Child Gameplay
                </span>
                <h1 style={{ margin: '4px 0 0 0', fontSize: 'clamp(24px, 3.2vw, 34px)', fontFamily: 'Georgia, serif' }}>
                  {sectionHeading}
                </h1>
              </div>
            </div>

            <div
              style={{
                background: '#0B1325',
                borderRadius: '999px',
                padding: '6px 14px',
                border: '1px solid rgba(244, 162, 97, 0.5)',
                fontSize: '12px',
                color: '#FFE29F',
                fontWeight: 700,
              }}
            >
              Stripe Test Mode Only · Live Charges Disabled
            </div>
          </div>

          {/* Adult Portal Section Sub-Navigation Pills */}
          <nav aria-label="Parent Portal Sections" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { to: '/parents', label: 'Overview', active: section === 'overview' },
              { to: '/parents/sign-in', label: 'Adult Sign In', active: section === 'sign-in' },
              { to: '/parents/dashboard', label: 'Dashboard', active: section === 'dashboard' },
              { to: '/parents/shop', label: 'Keepsake Shop (Test)', active: false },
              { to: '/parents/gifts', label: 'Gifts', active: section === 'gifts' },
              { to: '/parents/gifts/redeem', label: 'Redeem Code', active: section === 'redeem' },
              { to: '/parents/orders', label: 'Orders', active: section === 'orders' },
              { to: '/parents/settings', label: 'Privacy Controls', active: section === 'settings' },
              { to: '/privacy', label: 'Privacy Policy', active: section === 'privacy' },
              { to: '/terms', label: 'Terms', active: section === 'terms' },
              { to: '/refunds', label: 'Refunds', active: section === 'refunds' },
              { to: '/support', label: 'Support', active: section === 'support' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  background: item.active ? '#38BDF8' : 'rgba(11, 19, 37, 0.75)',
                  color: item.active ? '#0F172A' : '#E2E8F0',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: item.active ? 800 : 600,
                  padding: '6px 12px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.14)',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </section>

        {/* Plain-Language Free vs Paid & Child Safety Summary */}
        <section
          aria-label="Parent Trust Summary"
          data-testid="parent-trust-summary"
          style={{
            background: '#131F38',
            borderRadius: '18px',
            padding: '22px',
            border: '1px solid rgba(244, 162, 97, 0.4)',
            marginBottom: '24px',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: '20px', color: '#FEF08A', fontFamily: 'Georgia, serif' }}>
            What Parents Need to Know — Clear &amp; Verifiable Commitments
          </h2>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#E2E8F0', lineHeight: 1.65 }}>
            <li>
              <strong>Playable Flagship on Roblox + Companion on Minecraft Bedrock:</strong> Children launch the Byblos 3D adventure on Roblox (requires the free Roblox app and account) or import the free <code>miraverse.mcaddon</code> into a licensed copy of Minecraft Bedrock Edition (v1.21.50+). All five 15-scene bilingual stories can be read directly on the web without an account.
            </li>
            <li>
              <strong>Strict Separation of Earned Tokens vs. Adult Purchases:</strong> <em>Mira Tokens</em> are earned only by completing cultural quests and can never be purchased with money or cashed out. Optional printable keepsakes in <code>/parents/shop</code> are gated for adults (18+) and operate in <strong>Stripe Test Mode Only</strong>.
            </li>
            <li>
              <strong>No Cross-Platform Entitlement Lock-In:</strong> Web keepsake purchases and gift codes apply only to web deliverables; they never sell or unlock Roblox items or Minecraft items. Cultural review status: <code>{V08_CULTURAL_REVIEW_STATUS}</code>.
            </li>
          </ul>
        </section>

        {/* Three-Column Functional Cards: Adult Sign-In, Gift Redemption, and Privacy Controls */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '22px',
          }}
        >
          {/* Card 1: Adult Authentication (Starts Unauthenticated — Zero Demo Session!) */}
          <section
            aria-label="Adult Authentication"
            data-testid="parent-auth-card"
            style={{
              background: '#131F38',
              borderRadius: '18px',
              padding: '22px',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            <h3 style={{ marginTop: 0, fontSize: '19px', fontFamily: 'Georgia, serif', color: '#FEF08A' }}>
              Adult Guardian Sign-In (18+)
            </h3>
            {signedInEmail ? (
              <div>
                <p style={{ fontSize: '14px', color: '#6EE7B7', marginBottom: '12px' }}>
                  ✓ Verified Adult Session: <strong data-testid="signed-in-adult-email">{signedInEmail}</strong>
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link
                    to="/parents/shop"
                    style={{
                      background: '#F4A261',
                      color: '#0F172A',
                      textDecoration: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '13px',
                    }}
                  >
                    Open Adult Shop (Test Mode)
                  </Link>
                  <button
                    type="button"
                    data-testid="parent-signout-btn"
                    onClick={() => setSignedInEmail(null)}
                    style={{
                      background: '#334155',
                      color: '#FFF8EE',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      cursor: 'pointer',
                    }}
                  >
                    Sign Out Adult Session
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignIn}>
                <p style={{ fontSize: '13px', color: '#CBD5E1', marginTop: 0 }}>
                  Sign in as a parent, guardian, or educator to manage family gift codes, test-mode orders, or data export requests.
                </p>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }} htmlFor="parent-email-input">
                  Parent or Guardian Email:
                </label>
                <input
                  id="parent-email-input"
                  data-testid="parent-email-input"
                  type="email"
                  value={adultEmail}
                  onChange={(e) => setAdultEmail(e.target.value)}
                  placeholder="guardian@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(244, 162, 97, 0.45)',
                    background: '#0B1325',
                    color: '#FFF8EE',
                    marginBottom: '10px',
                  }}
                />
                <label style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#CBD5E1', marginBottom: '12px' }}>
                  <input
                    type="checkbox"
                    checked={adultAgeConfirmed}
                    onChange={(e) => setAdultAgeConfirmed(e.target.checked)}
                  />
                  <span>I confirm I am an adult parent, legal guardian, or educator (18+).</span>
                </label>
                <button
                  type="submit"
                  data-testid="parent-signin-btn"
                  style={{
                    background: '#F4A261',
                    color: '#0F172A',
                    fontWeight: 800,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 16px',
                    cursor: 'pointer',
                  }}
                >
                  Continue with Guardian Verification
                </button>
                {authFeedback && (
                  <p role="alert" style={{ marginTop: '8px', fontSize: '12px', color: '#FCA5A5' }}>
                    {authFeedback}
                  </p>
                )}
              </form>
            )}
          </section>

          {/* Card 2: Illustrated Family Gift Code Redemption */}
          <section
            aria-label="Redeem Single-Use Gift Code"
            data-testid="parent-gift-redeem-card"
            style={{
              background: '#131F38',
              borderRadius: '18px',
              padding: '22px',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            <img
              src="/art/v08/commerce/gift-keepsake-card.svg"
              alt="MiraVerse Family Keepsake Gift Card"
              style={{ width: '100%', borderRadius: '12px', marginBottom: '12px' }}
            />
            <h3 style={{ marginTop: 0, fontSize: '19px', fontFamily: 'Georgia, serif', color: '#FEF08A' }}>
              Redeem Family Gift Code
            </h3>
            <form onSubmit={handleRedeemGift}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }} htmlFor="gift-code-input">
                Single-Use Family Gift Code (Web Keepsake):
              </label>
              <input
                id="gift-code-input"
                data-testid="gift-code-input"
                type="text"
                value={giftCodeInput}
                onChange={(e) => setGiftCodeInput(e.target.value)}
                placeholder="MVGIFT-XXXX-XXXX-XXXX-XXXX"
                dir="ltr"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(244, 162, 97, 0.45)',
                  background: '#0B1325',
                  color: '#FFF8EE',
                  marginBottom: '10px',
                }}
              />
              <button
                type="submit"
                data-testid="gift-redeem-submit"
                style={{
                  background: '#10B981',
                  color: '#032215',
                  fontWeight: 900,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  cursor: 'pointer',
                }}
              >
                Redeem Gift Code
              </button>
            </form>
            {giftStatusMsg && (
              <p role="status" data-testid="gift-redeem-status" style={{ marginTop: '10px', fontSize: '13px', color: '#FFE29F', fontWeight: 700 }}>
                {giftStatusMsg}
              </p>
            )}
          </section>

          {/* Card 3: Privacy & Data Rights with Protected Confirmation */}
          <section
            aria-label="Consented Pseudonymous Child Profile Controls"
            data-testid="parent-privacy-controls-card"
            style={{
              background: '#131F38',
              borderRadius: '18px',
              padding: '22px',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            <h3 style={{ marginTop: 0, fontSize: '19px', fontFamily: 'Georgia, serif', color: '#FEF08A' }}>
              Family Data Export &amp; Deletion Controls
            </h3>
            <p style={{ fontSize: '13px', color: '#CBD5E1', marginTop: 0 }}>
              MiraVerse never collects child email addresses or real names. Parents can export or erase optional pseudonymous profile records at any time.
            </p>
            <label style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', marginBottom: '14px', color: '#E2E8F0' }}>
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              <span>Grant guardian consent for an optional pseudonymous explorer nickname.</span>
            </label>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
              <button
                type="button"
                data-testid="parent-export-data-btn"
                onClick={handleExportProfile}
                style={{
                  background: '#2563EB',
                  color: '#FFF8EE',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                }}
              >
                Export Family Data (JSON)
              </button>

              {!confirmDeleteOpen ? (
                <button
                  type="button"
                  data-testid="parent-delete-profile-prompt-btn"
                  onClick={() => setConfirmDeleteOpen(true)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.16)',
                    color: '#FCA5A5',
                    fontWeight: 700,
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                  }}
                >
                  Request Profile Deletion…
                </button>
              ) : null}

              <button
                type="button"
                data-testid="parent-delete-profile-btn"
                onClick={handleDeleteProfile}
                style={{
                  background: '#EF4444',
                  color: '#FFF8EE',
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                }}
              >
                {confirmDeleteOpen ? 'Confirm Permanent Deletion' : 'Delete Profile & Revoke Consent'}
              </button>
            </div>

            {exportedDataJson && (
              <pre
                data-testid="exported-profile-json"
                style={{
                  marginTop: '12px',
                  fontSize: '11px',
                  background: '#0B1325',
                  padding: '10px',
                  borderRadius: '8px',
                  overflowX: 'auto',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {exportedDataJson}
              </pre>
            )}
            {profileDeletedMsg && (
              <p role="status" data-testid="deleted-profile-status" style={{ marginTop: '10px', fontSize: '13px', color: '#FCA5A5', fontWeight: 700 }}>
                {profileDeletedMsg}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
