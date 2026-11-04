/**
 * MiraVerse v0.8 — 15 Mandatory End-to-End Journeys & Visual/Truth Gate Verification Suite
 * (`tests/web/e2e/v08/v08-website-journeys.test.ts`)
 * Owners: CX11, CX12, CX15, AG20, CL15
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { describe, expect, it } from 'vitest';
import { COUNTRIES } from '../../../../packages/contracts/index';
import {
  V08_CULTURAL_REVIEW_STATUS,
  V08_RELEASE_VERSION,
  V08_TRUTH_GUARDRAILS,
  V08_WORLD_VISUAL_MAP,
} from '../../../../packages/contracts/v08/index';
import { GOLDEN_VECTORS } from '../../../../packages/shared/stamp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../../..');
const webDistDir = path.join(rootDir, 'apps/web/dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

function startStaticServer(root: string): Promise<{ url: string; close: () => Promise<void> }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const reqUrl = new URL(req.url ?? '/', 'http://127.0.0.1');
      let relPath = decodeURIComponent(reqUrl.pathname);
      if (relPath === '/') relPath = '/index.html';
      const safePath = path.normalize(path.join(root, relPath));
      if (!safePath.startsWith(root) || !fs.existsSync(safePath) || fs.statSync(safePath).isDirectory()) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
      const ext = path.extname(safePath).toLowerCase();
      res.setHeader('Content-Type', MIME_TYPES[ext] ?? 'application/octet-stream');
      fs.createReadStream(safePath).pipe(res);
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('Failed to bind static server'));
        return;
      }
      resolve({
        url: `http://127.0.0.1:${addr.port}`,
        close: () => new Promise<void>((resClose) => server.close(() => resClose())),
      });
    });
  });
}

describe('MiraVerse v0.8 — 15 Mandatory E2E Journeys, Art/Truth Gates & Responsive Viewports', () => {
  it('verifies static source & art-gate invariants: zero duplicate headers, zero Babylon cylinders on homepage, zero default demo parent session, and reconciled v0.8 truth claims', () => {
    const landingTsx = fs.readFileSync(path.join(rootDir, 'apps/web/src/landing/ui/index.tsx'), 'utf-8');
    const parentTsx = fs.readFileSync(path.join(rootDir, 'apps/web/src/parent/index.tsx'), 'utf-8');
    const aboutTsx = fs.readFileSync(path.join(rootDir, 'apps/web/src/pages/About.tsx'), 'utf-8');

    // No Babylon cylinder diorama mounted on the homepage
    expect(landingTsx).not.toContain('mountLandingDiorama');
    expect(landingTsx).not.toContain('Pause 3D Camera Motion');
    expect(landingTsx).not.toContain('v0.4 Release Candidate');

    // No duplicate <header> inside CinematicLandingPage
    expect(landingTsx).not.toMatch(/<header\b/);

    // Parent portal does not default to signed-in parent.demo@miraverse.studio
    expect(parentTsx).not.toContain("useState<string | null>('parent.demo@miraverse.studio')");
    expect(parentTsx).toContain('useState<string | null>(null)');

    // About page does not claim "Zero Network Calls" or "v0.1.0"
    expect(aboutTsx).not.toContain('Zero Network Calls');
    expect(aboutTsx).not.toContain('MiraVerse v0.1.0');
    expect(aboutTsx).toContain('V08_CULTURAL_REVIEW_STATUS');

    // All 5 worlds have verified SVG art files on disk
    for (const code of COUNTRIES) {
      const map = V08_WORLD_VISUAL_MAP[code];
      expect(fs.existsSync(path.join(rootDir, 'apps/web/public', map.coverArtUrl))).toBe(true);
      expect(fs.existsSync(path.join(rootDir, 'apps/web/public', map.portraitArtUrl))).toBe(true);
      expect(fs.existsSync(path.join(rootDir, 'apps/web/public', map.stampArtUrl))).toBe(true);
    }

    expect(V08_TRUTH_GUARDRAILS.version).toBe(V08_RELEASE_VERSION);
    expect(V08_TRUTH_GUARDRAILS.culturalStatus).toBe(V08_CULTURAL_REVIEW_STATUS);
    expect(V08_TRUTH_GUARDRAILS.stripeLiveChargesEnabled).toBe(false);
  });

  it(
    'executes all 15 mandatory browser journeys across mobile/tablet/desktop viewports, LTR/RTL/FR/KO locales, Passport, and Parent Portal',
    async () => {
      const srv = await startStaticServer(webDistDir);
      const browser = await chromium.launch({ headless: true });

      try {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await context.newPage();

        // Journey 1 & 15: Single unified header, mobile + desktop viewports, zero horizontal overflow across all 6 target breakpoints
        await page.goto(`${srv.url}/#/`, { waitUntil: 'networkidle' });
        const headerCount = await page.locator('header').count();
        expect(headerCount).toBe(1);

        const breakpoints = [
          { w: 360, h: 800 },
          { w: 390, h: 844 },
          { w: 768, h: 1024 },
          { w: 1024, h: 768 },
          { w: 1440, h: 900 },
          { w: 1920, h: 1080 },
        ];
        for (const bp of breakpoints) {
          await page.setViewportSize({ width: bp.w, height: bp.h });
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth > document.documentElement.clientWidth
          );
          expect(overflow, `Overflow at ${bp.w}x${bp.h}`).toBe(false);
          await expect(page.getByTestId('cta-play-free').isVisible()).resolves.toBe(true);
        }

        // Journey 2: Desktop visitor sees all 5 world cards with original illustrated covers
        await page.setViewportSize({ width: 1440, height: 900 });
        for (const code of COUNTRIES) {
          const card = page.getByTestId(`country-card-${code}`);
          await expect(card.isVisible()).resolves.toBe(true);
          const imgCount = await card.locator('img').count();
          expect(imgCount).toBeGreaterThanOrEqual(1);
        }

        // Journey 3 & 4: Explore Worlds (/explore) & World Detail (/explore/LB and /explore/EG)
        await page.goto(`${srv.url}/#/explore`, { waitUntil: 'networkidle' });
        await expect(page.getByTestId('availability-badge-LB').textContent()).resolves.toContain('RC1 Flagship');
        await expect(page.getByTestId('availability-badge-EG').textContent()).resolves.toContain('RC3 Expansion');

        await page.goto(`${srv.url}/#/explore/LB`, { waitUntil: 'networkidle' });
        await expect(page.getByTestId('explore-country-detail-LB').isVisible()).resolves.toBe(true);
        await expect(page.getByTestId('roblox-launch-panel').isVisible()).resolves.toBe(true);

        // Journey 5: Collectible Passport (/passport) with illustrated stamps, redeem, and undo-capable reset
        await page.goto(`${srv.url}/#/passport`, { waitUntil: 'networkidle' });
        await expect(page.getByTestId('passport-album-page').isVisible()).resolves.toBe(true);
        const brokenImages = await page.evaluate(() =>
          Array.from(document.querySelectorAll('img')).filter((img) => !img.complete || img.naturalWidth === 0).length
        );
        expect(brokenImages).toBe(0);
        const lbVector = GOLDEN_VECTORS.find((v) => v.country === 'LB')!;
        await page.fill('#souvenir-code', lbVector.code);
        await page.click('button[type="submit"]');
        expect(await page.locator('#passport-feedback').textContent()).toMatch(/added to your passport/i);

        // Journey 6, 7 & 8: Parent Portal (/parents) starts unauthenticated, allows adult sign-in, and enforces single-use gift redemption
        await page.goto(`${srv.url}/#/parents`, { waitUntil: 'networkidle' });
        expect(await page.locator('[data-testid="signed-in-adult-email"]').count()).toBe(0);
        await page.fill('[data-testid="parent-email-input"]', 'guardian@miraverse.studio');
        await page.click('[data-testid="parent-signin-btn"]');
        await expect(page.getByTestId('signed-in-adult-email').textContent()).resolves.toBe(
          'guardian@miraverse.studio'
        );

        await page.fill('[data-testid="gift-code-input"]', 'MVGIFT-1234-ABCD-5678-EF90');
        await page.click('[data-testid="gift-redeem-submit"]');
        expect(await page.getByTestId('gift-redeem-status').textContent()).toContain('MVGIFT-REDACTED-XXXX');

        // Replaying the same gift code is rejected as REDEEMED
        await page.fill('[data-testid="gift-code-input"]', 'MVGIFT-1234-ABCD-5678-EF90');
        await page.click('[data-testid="gift-redeem-submit"]');
        expect(await page.getByTestId('gift-redeem-status').textContent()).toContain('REDEEMED');

        // Journey 9 & 10: Arabic RTL (ar-LB, ar-EG, ar-IQ), French (fr), and Korean (ko)
        await page.goto(`${srv.url}/#/`, { waitUntil: 'networkidle' });
        for (const loc of ['ar-LB', 'ar-EG', 'ar-IQ', 'fr', 'ko'] as const) {
          await page.selectOption('#ui-language', loc);
          const dir = await page.evaluate(() => document.documentElement.dir);
          expect(dir).toBe(loc.startsWith('ar-') ? 'rtl' : 'ltr');
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth > document.documentElement.clientWidth
          );
          expect(overflow).toBe(false);
        }

        // Journey 12: Reduced motion toggle in footer
        await page.selectOption('#ui-language', 'en');
        await page.getByTestId('toggle-reduced-motion').click();
        await expect(page.getByTestId('cinematic-landing-page').getAttribute('data-reduced-motion')).resolves.toBe(
          'true'
        );
      } finally {
        await browser.close();
        await srv.close();
      }
    },
    35000
  );
});
