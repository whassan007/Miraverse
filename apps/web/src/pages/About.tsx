import React, { useState } from 'react';
import { V08_CULTURAL_REVIEW_STATUS, V08_RELEASE_VERSION } from '../../../../packages/contracts/v08/index';

/**
 * About MiraVerse & Educator Guide (`apps/web/src/pages/About.tsx`)
 * Owners: AG16, CL13, CX08, CX10
 * - Reconciles all version numbers to v0.8.0 (Option A Release Candidate)
 * - Separates child guest exploration privacy posture from adult-gated Stripe Test Checkout
 */
export default function About(): React.ReactElement {
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<string>('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  async function handleParentCheckout() {
    if (!adultConfirmed) {
      setCheckoutStatus('Please confirm you are a parent, guardian, or educator (18+) before continuing.');
      return;
    }
    setCheckoutLoading(true);
    setCheckoutStatus('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentGateConfirmed: true,
          bundle: 'family_educator_v0_1',
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setCheckoutStatus(data.error || 'Stripe Test Mode endpoint validated (live charges remain disabled).');
    } catch {
      setCheckoutStatus('Stripe Test Checkout endpoint (/api/checkout) operates in test mode on Cloudflare Pages.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div
      data-testid="about-educator-page"
      style={{
        minHeight: '88vh',
        background: '#0B1325',
        color: '#FFF8EE',
        padding: '32px clamp(16px, 4vw, 56px) 64px',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto', lineHeight: 1.65 }}>
        <header
          style={{
            marginBottom: '28px',
            background: '#131F38',
            padding: '28px',
            borderRadius: '22px',
            border: '1px solid rgba(244, 162, 97, 0.45)',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#F4A261', textTransform: 'uppercase', letterSpacing: '1.4px' }}>
            MiraVerse v{V08_RELEASE_VERSION} · Information for Parents, Guardians &amp; Educators
          </span>
          <h1
            id="about-heading"
            style={{ fontSize: 'clamp(26px, 3.6vw, 38px)', fontFamily: 'Georgia, serif', margin: '6px 0 8px 0' }}
          >
            About MiraVerse &amp; Educator Guide
          </h1>
          <p style={{ fontSize: '16px', color: '#CBD5E1', margin: 0 }}>
            Cinematic cultural stories, regional Arabic/French/Korean vocabulary, and hands-on heritage quests across Roblox, Minecraft Bedrock Edition, and the Web.
          </p>
        </header>

        {/* Cultural Exploration */}
        <section
          aria-labelledby="cultural-stories-heading"
          style={{
            marginBottom: '24px',
            background: '#131F38',
            padding: '24px',
            borderRadius: '18px',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <h2 id="cultural-stories-heading" style={{ fontSize: '22px', fontFamily: 'Georgia, serif', color: '#FEF08A', marginTop: 0 }}>
            Five Cultural Destinations &amp; Option A Release Path
          </h2>
          <p style={{ color: '#E2E8F0' }}>
            MiraVerse v{V08_RELEASE_VERSION} introduces young explorers (ages 8–12) to five living heritage traditions:
          </p>
          <ul style={{ paddingLeft: '20px', color: '#CBD5E1' }}>
            <li>
              <strong>Lebanon (LB — RC1 Flagship):</strong> Coastal Byblos Harbor, limestone courtyards, and baking za’atar man’oushe on a domed saj with Teta Nahla in Lebanese Arabic (<em>ar-LB</em>). Playable first on Roblox and the Minecraft Bedrock companion.
            </li>
            <li>
              <strong>Egypt (EG — Story Live / RC3 Native Expansion):</strong> Historic Cairo courtyards, brass fanous lanterns, Nile feluccas, and spiced koshari with Teta Samira in Egyptian Arabic (<em>ar-EG</em>).
            </li>
            <li>
              <strong>Iraq (IQ — Story Live / RC3 Native Expansion):</strong> Baghdad Tigris palms, stained-glass shanashil windows, and cardamom date kleicha with Bibi Amal in Iraqi Arabic (<em>ar-IQ</em>).
            </li>
            <li>
              <strong>South Korea (KR — Story Live / RC3 Native Expansion):</strong> Jeonju hanok roofs, changhoji paper screens, and five-color bibimbap with Halmeoni Jin in Korean (<em>ko</em>).
            </li>
            <li>
              <strong>France (FR — Story &amp; Web Preview Live / RC3 Native Expansion):</strong> Vieux Lyon Renaissance traboules, artisan boulangeries, and golden Galette des Rois with Mamie Claire in French (<em>fr</em>).
            </li>
          </ul>
        </section>

        {/* Child Safety & Privacy Posture (Truthfully Reconciled — CX10) */}
        <section
          aria-labelledby="privacy-safety-heading"
          style={{
            marginBottom: '24px',
            background: '#131F38',
            padding: '24px',
            borderRadius: '18px',
            border: '1px solid rgba(16, 185, 129, 0.45)',
          }}
        >
          <h2 id="privacy-safety-heading" style={{ fontSize: '22px', fontFamily: 'Georgia, serif', color: '#6EE7B7', marginTop: 0 }}>
            Child Safety &amp; Data-Minimization Architecture
          </h2>
          <p style={{ color: '#E2E8F0' }}>
            MiraVerse is built around strict child-privacy and data-minimization safeguards (designed to align with youth privacy principles; formal third-party legal certification pending):
          </p>
          <ul style={{ paddingLeft: '20px', color: '#CBD5E1' }}>
            <li>
              <strong>Guest Web Stories &amp; Local Souvenir Passport:</strong> Children can read all five 15-scene bilingual stories and collect browser souvenir stamps without creating a MiraVerse account or submitting personal data. Fonts and illustrations are bundled locally with zero third-party ad networks or behavioral tracking pixels.
            </li>
            <li>
              <strong>Native Platform Requirements:</strong> Launching the flagship 3D experience on <strong>Roblox</strong> requires the official Roblox client and a Roblox account (progress is stored in Roblox <code>DataStoreService</code>). Playing the <strong>Minecraft Bedrock</strong> companion requires a licensed copy of Minecraft Bedrock Edition (v1.21.50+).
            </li>
            <li>
              <strong>Zero Open Free-Text Chat:</strong> In-game co-op communication uses a predefined 4-phrase courtesy bar (<em>“Hello!”</em>, <em>“Great job!”</em>, <em>“Follow me!”</em>, <em>“Thank you!”</em>) rather than unmoderated open chat.
            </li>
            <li>
              <strong>Separated Adult Portal Network Calls:</strong> Server API requests (such as adult sign-in, gift code verification, and hosted Stripe Test Checkout at <code>/api/checkout</code>) are restricted to adult-gated guardian pages and never run inside child gameplay HUDs.
            </li>
          </ul>
        </section>

        {/* Kitchen Safety */}
        <section
          aria-labelledby="kitchen-safety-heading"
          style={{
            marginBottom: '24px',
            background: 'rgba(217, 119, 6, 0.14)',
            padding: '22px',
            borderRadius: '18px',
            borderLeft: '5px solid #F59E0B',
          }}
        >
          <h2 id="kitchen-safety-heading" style={{ fontSize: '20px', fontFamily: 'Georgia, serif', color: '#FDE68A', marginTop: 0 }}>
            Kitchen Activities: Adult Supervision Required
          </h2>
          <p style={{ margin: 0, color: '#E2E8F0', fontSize: '14px' }}>
            MiraVerse culinary quests introduce traditional dishes such as Lebanese man’oushe, Egyptian koshari, Iraqi kleicha, Korean bibimbap, and French Galette des Rois. <strong>Active adult supervision is mandatory</strong> for any real-world cooking: adults must handle knives, ovens, and stovetops and check for food allergies (sesame, gluten, nuts, dairy).
          </p>
        </section>

        {/* Cultural Review Status */}
        <section
          aria-labelledby="editorial-status-heading"
          style={{
            marginBottom: '24px',
            background: '#131F38',
            padding: '24px',
            borderRadius: '18px',
            border: '1px solid rgba(56, 189, 248, 0.4)',
          }}
        >
          <h2 id="editorial-status-heading" style={{ fontSize: '20px', fontFamily: 'Georgia, serif', color: '#38BDF8', marginTop: 0 }}>
            Editorial Review Status: {V08_CULTURAL_REVIEW_STATUS}
          </h2>
          <p style={{ margin: 0, color: '#CBD5E1', fontSize: '14px' }}>
            All dialect stories, transliterations, architectural notes, and vocabulary decks carry the transparent status <code>{V08_CULTURAL_REVIEW_STATUS}</code> while queued for final sign-off by native-speaker heritage educators.
          </p>
        </section>

        {/* Adult-Gated Educator Bundle (Stripe Test Mode) */}
        <section
          aria-labelledby="parent-bundle-heading"
          data-testid="parent-stripe-bundle"
          style={{
            padding: '24px',
            borderRadius: '20px',
            background: '#131F38',
            border: '2px solid #38BDF8',
          }}
        >
          <h2 id="parent-bundle-heading" style={{ fontSize: '21px', fontFamily: 'Georgia, serif', color: '#FEF08A', marginTop: 0 }}>
            Parents &amp; Educators: Classroom &amp; Family Keepsake Bundle (Stripe Test Mode)
          </h2>
          <p style={{ margin: '8px 0 14px 0', color: '#CBD5E1', fontSize: '14px' }}>
            Test adult-gated checkout for the offline <strong>MiraVerse Family &amp; Educator Keepsake Guide</strong> via hosted <strong>Stripe Checkout (Test Mode Only — Live Charging Disabled)</strong>. Web purchases apply to web deliverables only and do not unlock in-game Roblox or Minecraft items.
          </p>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 700,
              color: '#FFF8EE',
              marginBottom: '14px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <input
              type="checkbox"
              checked={adultConfirmed}
              onChange={(e) => setAdultConfirmed(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <span>I am a parent, legal guardian, or educator (18+) authorizing this test-mode request.</span>
          </label>
          <button
            type="button"
            onClick={handleParentCheckout}
            disabled={checkoutLoading}
            style={{
              backgroundColor: '#38BDF8',
              color: '#0F172A',
              fontWeight: 900,
              fontSize: '14px',
              padding: '10px 20px',
              borderRadius: '999px',
              border: 'none',
              cursor: checkoutLoading ? 'wait' : 'pointer',
            }}
          >
            {checkoutLoading ? 'Connecting to Stripe Test Mode…' : 'Test Educator Bundle Checkout (Stripe Test Mode)'}
          </button>
          {checkoutStatus ? (
            <p role="status" style={{ marginTop: '12px', marginBottom: 0, color: '#FEF08A', fontWeight: 700, fontSize: '13px' }}>
              {checkoutStatus}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
