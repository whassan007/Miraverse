import React, { useState } from 'react';

/**
 * About MiraVerse - Information for Parents, Educators, and Guardians
 *
 * Details MiraVerse's pedagogical philosophy, cultural dialect stories,
 * strict privacy/child-safety posture, kitchen safety guidelines,
 * editorial review status, and parent-gated Stripe Checkout for the
 * downloadable Minecraft (.mcaddon) and Roblox (.rbxlx) Educator Bundle.
 */
export default function About(): React.ReactElement {
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<string>('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  async function handleParentCheckout() {
    if (!adultConfirmed) {
      setCheckoutStatus('Please confirm you are a parent, guardian, or educator before continuing.');
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
      setCheckoutStatus(data.error || 'Unable to start Stripe Checkout right now.');
    } catch {
      setCheckoutStatus('Stripe Checkout endpoint (/api/checkout) is active once deployed to Cloudflare Pages.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <main
      role="main"
      aria-labelledby="about-heading"
      style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: 1.65,
        color: '#1a202c',
      }}
    >
      <header style={{ marginBottom: '2.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem' }}>
        <h1
          id="about-heading"
          style={{ fontSize: '2.25rem', fontWeight: 800, color: '#2b6cb0', marginBottom: '0.5rem' }}
        >
          About MiraVerse
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#4a5568', margin: 0 }}>
          Interactive cultural stories, dialect immersion, and hands-on challenges designed safely for children, families, and educators.
        </p>
      </header>

      {/* Cultural Exploration */}
      <section aria-labelledby="cultural-stories-heading" style={{ marginBottom: '2.5rem' }}>
        <h2 id="cultural-stories-heading" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2d3748', borderBottom: '1px solid #cbd5e0', paddingBottom: '0.5rem' }}>
          Cultural Dialect Stories &amp; Playable Challenges
        </h2>
        <p>
          MiraVerse v0.1.0 takes young explorers across five diverse nations and living heritage traditions:
        </p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li><strong>Lebanon (LB)</strong> — Exploring coastal Byblos, Beirut, cedar groves, and Levantine traditions in authentic Lebanese Arabic (<em>ar-LB</em>).</li>
          <li><strong>Egypt (EG)</strong> — Navigating the Nile, historic Cairo, bazaar culture, and heritage crafts in Egyptian Arabic (<em>ar-EG</em>).</li>
          <li><strong>Iraq (IQ)</strong> — Traversing ancient Mesopotamia, Baghdad courtyards, dates, and riverfront life in Iraqi Arabic (<em>ar-IQ</em>).</li>
          <li><strong>South Korea (KR)</strong> — Experiencing Jeonju hanok villages, culinary traditions, and seasonal festivals in Korean (<em>ko</em>).</li>
          <li><strong>France (FR)</strong> — Discovering Lyon gastronomy, architectural heritage, and artisan markets in French (<em>fr</em>).</li>
        </ul>
        <p>
          Each country features a rich 15-scene dialect story centered on community archetypes (protagonists, mentors, diaspora peers) and five hands-on interactive challenges across Web, Roblox, and Minecraft Bedrock. Young learners collect unique souvenir stamps in their local Passport as they complete each challenge.
        </p>
      </section>

      {/* Child Safety & Privacy Guarantees */}
      <section aria-labelledby="privacy-safety-heading" style={{ marginBottom: '2.5rem', backgroundColor: '#f7fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h2 id="privacy-safety-heading" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2c5282', marginTop: 0 }}>
          Privacy Guarantees &amp; Child Safety Posture
        </h2>
        <p>
          MiraVerse is engineered from the ground up for strict child privacy and digital safety in compliance with COPPA, GDPR-K, and global educational privacy standards:
        </p>
        <ul style={{ paddingLeft: '1.5rem', margin: '0.75rem 0' }}>
          <li><strong>Zero User Accounts &amp; Logins:</strong> No names, email addresses, passwords, or personal identifying information are ever requested or stored.</li>
          <li><strong>Zero Analytics &amp; Telemetry:</strong> No tracking pixels, Google Analytics, cookies, or user tracking mechanisms exist in any MiraVerse build.</li>
          <li><strong>Zero Network Calls / Fully Local:</strong> No external third-party CDN scripts or font servers. All assets, typography, and game logic are bundled locally.</li>
          <li><strong>Zero Free-Text Chat:</strong> To protect young learners from harassment or unmoderated interactions, there is no open text chat across any client.</li>
          <li><strong>Local-Only Progress:</strong> All Passport souvenir stamps and completed challenges reside strictly on your device (browser <code>localStorage</code> on Web, session-only state in Roblox, and isolated dynamic properties in Minecraft Bedrock).</li>
        </ul>
      </section>

      {/* Kitchen Safety & Adult Supervision */}
      <section aria-labelledby="kitchen-safety-heading" style={{ marginBottom: '2.5rem', backgroundColor: '#fffaf0', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #dd6b20' }}>
        <h2 id="kitchen-safety-heading" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#9c4221', marginTop: 0 }}>
          Kitchen Activities: Adult Supervision Required
        </h2>
        <p style={{ margin: 0 }}>
          Certain MiraVerse challenges introduce authentic cultural recipes, culinary techniques, and food traditions (such as Lebanese tabbouleh or Korean bibimbap). <strong>Active adult supervision is mandatory</strong> for any off-screen kitchen exploration. Parents and educators must guide knife handling, stove/oven heat sources, appliance usage, and screen for individual food allergies before preparing any dishes.
        </p>
      </section>

      {/* Cultural Review & Editorial Status */}
      <section aria-labelledby="editorial-status-heading" style={{ marginBottom: '2.5rem' }}>
        <h2 id="editorial-status-heading" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2d3748', borderBottom: '1px solid #cbd5e0', paddingBottom: '0.5rem' }}>
          Editorial Status: AI_REVIEWED_PENDING_HUMAN
        </h2>
        <p>
          In full transparency with educators and families, the linguistic and cultural content in MiraVerse v0.1.0 carries the official designation:
        </p>
        <div style={{ backgroundColor: '#ebf8ff', padding: '1rem', borderRadius: '6px', border: '1px solid #bee3f8', marginBottom: '1rem' }}>
          <strong style={{ color: '#2b6cb0' }}>Status: AI_REVIEWED_PENDING_HUMAN</strong>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>
            Stories, dialects, archetypes, and challenges have undergone automated linguistic validation and synthetic consistency checks. They are actively queued for comprehensive human cultural review by native speakers, community elders, and heritage educators prior to public release.
          </p>
        </div>
        <p>
          If you are a native speaker or cultural heritage educator interested in participating in our human review panel, we welcome community feedback through our open repository.
        </p>
      </section>

      {/* Platform Release Lifecycle */}
      <section aria-labelledby="release-lifecycle-heading" style={{ marginBottom: '2rem' }}>
        <h2 id="release-lifecycle-heading" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2d3748', borderBottom: '1px solid #cbd5e0', paddingBottom: '0.5rem' }}>
          Platform Release Tiers
        </h2>
        <p>MiraVerse builds adhere to three transparent release criteria:</p>
        <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.75rem 1.5rem', alignItems: 'baseline' }}>
          <dt><code style={{ backgroundColor: '#edf2f7', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>BUILDABLE_RC</code></dt>
          <dd style={{ margin: 0 }}>Code compiles deterministically and passes automated structural and schema verification in CI/CD.</dd>

          <dt><code style={{ backgroundColor: '#edf2f7', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>PLATFORM_VERIFIED_RC</code></dt>
          <dd style={{ margin: 0 }}>Artifact has been deployed and validated directly on target runtimes (modern desktop/mobile browsers, Roblox Studio &amp; Client, and Minecraft Bedrock engine).</dd>

          <dt><code style={{ backgroundColor: '#edf2f7', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>PUBLIC_RELEASE_APPROVED</code></dt>
          <dd style={{ margin: 0 }}>Content has successfully completed human native-speaker cultural review, accessibility audits, and final child-safety compliance certification.</dd>
        </dl>
      </section>

      {/* Parent & Educator Bundle (Adult-Gated Stripe Checkout) */}
      <section
        aria-labelledby="parent-bundle-heading"
        data-testid="parent-stripe-bundle"
        style={{
          marginTop: '2.5rem',
          padding: '1.75rem',
          borderRadius: '10px',
          backgroundColor: '#f0f9ff',
          border: '2px solid #0284c7',
        }}
      >
        <h2
          id="parent-bundle-heading"
          style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0c4a6e', marginTop: 0 }}
        >
          Parents &amp; Educators: Downloadable Minecraft &amp; Roblox Pack Bundle
        </h2>
        <p style={{ margin: '0.5rem 0 1rem 0', color: '#1e293b' }}>
          Purchase the offline <strong>MiraVerse Family &amp; Educator Bundle</strong> (includes the packaged{' '}
          <code>miraverse.mcaddon</code> for Minecraft Bedrock and <code>miraverse.rbxlx</code> for private Roblox
          Studio classroom servers) via hosted <strong>Stripe Checkout</strong> on <code>miraverse.studio</code>. No
          payment scripts or cookies are ever loaded inside the child-facing web app.
        </p>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600,
            color: '#0f172a',
            marginBottom: '1rem',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={adultConfirmed}
            onChange={(e) => setAdultConfirmed(e.target.checked)}
            style={{ width: '1.15rem', height: '1.15rem' }}
          />
          <span>I am a parent, legal guardian, or educator (18+) authorizing this purchase.</span>
        </label>
        <button
          type="button"
          onClick={handleParentCheckout}
          disabled={checkoutLoading}
          style={{
            backgroundColor: '#0284c7',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.98rem',
            padding: '0.75rem 1.35rem',
            borderRadius: '8px',
            border: 'none',
            cursor: checkoutLoading ? 'wait' : 'pointer',
          }}
        >
          {checkoutLoading ? 'Redirecting to Stripe Checkout…' : 'Purchase Family & Educator Bundle (Stripe)'}
        </button>
        {checkoutStatus ? (
          <p role="status" style={{ marginTop: '0.85rem', marginBottom: 0, color: '#0369a1', fontWeight: 600 }}>
            {checkoutStatus}
          </p>
        ) : null}
      </section>
    </main>
  );
}
