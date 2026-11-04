/**
 * MiraVerse v1.4 — Dynamic 5-Country Hero Showcase Playwright E2E & Visual Progression Suite
 * Owner: AG19
 *
 * Verifies:
 *  1. Initial render on `/#/` starts deterministically on `LB` (`hero-primary-artwork` has `src="/art/p0/hero-byblos-desktop.jpg"`, `hero-ambient-overlay` has `src="/art/v14/hero-overlays/overlay-LB.svg"`).
 *  2. The Hero Transport Controls (`hero-transport-controls`, `hero-play-pause-btn`, `hero-next-slide`, `hero-prev-slide`, `hero-autoplay-progress`) and Filmstrip Scrubber (`hero-filmstrip-scrubber`, `hero-filmstrip-card-LB`..`KR`) are visible and interactive.
 *  3. Clicking `hero-next-slide` advances the hero dynamically from `LB` -> `IQ` (`/art/p0/world-cover-IQ.jpg` + `/art/v14/hero-overlays/overlay-IQ.svg`), then `EG`, `FR`, `KR`, and wraps back to `LB`, updating the dynamic background aura (`landing-hero-dynamic-aura`), mentor greeting banner (`hero-mentor-greeting-banner`), and cultural telemetry bar (`hero-cultural-telemetry-bar`) on every country so the landing page is never stuck on one country.
 *  4. Clicking `toggle-reduced-motion` sets `data-reduced-motion="true"` and pauses auto-cycling.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';
import { describe, expect, it } from 'vitest';
import {
  V14_HERO_COUNTRIES,
  V14_HERO_SLIDES,
  type HeroCountryCodeV14,
} from '../../../../packages/contracts/v14/index';

const DIST_DIR = join(process.cwd(), 'apps/web/dist');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8',
  '.mcaddon': 'application/octet-stream',
};

async function withDistServer<T>(run: (url: string) => Promise<T>): Promise<T> {
  const server = createServer(async (req, res) => {
    try {
      const reqPath = (req.url || '/').split('?')[0];
      const filePath = join(
        DIST_DIR,
        reqPath === '/' || !extname(reqPath) ? 'index.html' : reqPath
      );
      const data = await readFile(filePath);
      res.writeHead(200, {
        'Content-Type': MIME[extname(filePath)] || 'application/octet-stream',
      });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  try {
    return await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

describe('MiraVerse v1.4 Dynamic 5-Country Hero Showcase E2E & Visual Progression', () => {
  it('verifies v1.4 hero contracts define all 5 ordered countries (LB, IQ, EG, FR, KR) with desktop art and ambient SVG overlays', () => {
    expect(V14_HERO_COUNTRIES).toEqual(['LB', 'IQ', 'EG', 'FR', 'KR']);
    expect(V14_HERO_SLIDES.LB.heroDesktopJpg).toBe('/art/p0/hero-byblos-desktop.jpg');
    expect(V14_HERO_SLIDES.LB.ambientOverlaySvgUrl).toBe('/art/v14/hero-overlays/overlay-LB.svg');
    expect(V14_HERO_SLIDES.IQ.heroDesktopJpg).toBe('/art/p0/world-cover-IQ.jpg');
    expect(V14_HERO_SLIDES.IQ.ambientOverlaySvgUrl).toBe('/art/v14/hero-overlays/overlay-IQ.svg');
  });

  it(
    'verifies deterministic LB initial render, transport & filmstrip controls, full 5-country progression (LB -> IQ -> EG -> FR -> KR -> LB), and reduced-motion pause',
    async () => {
      await withDistServer(async (baseUrl) => {
        const browser = await chromium.launch({ headless: true });
        try {
          const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
          const page = await context.newPage();

          // 1. Initial render on `/#/` starts deterministically on `LB`
          await page.goto(`${baseUrl}/#/`, { waitUntil: 'networkidle' });

          const primaryArtwork = page.getByTestId('hero-primary-artwork');
          const ambientOverlay = page.getByTestId('hero-ambient-overlay');
          await expect(primaryArtwork.isVisible()).resolves.toBe(true);
          await expect(ambientOverlay.isVisible()).resolves.toBe(true);
          await expect(primaryArtwork.getAttribute('src')).resolves.toBe(
            '/art/p0/hero-byblos-desktop.jpg'
          );
          await expect(ambientOverlay.getAttribute('src')).resolves.toBe(
            '/art/v14/hero-overlays/overlay-LB.svg'
          );

          // 2. Hero Transport Controls & Filmstrip Scrubber are visible and interactive
          await expect(page.getByTestId('hero-transport-controls').isVisible()).resolves.toBe(true);
          await expect(page.getByTestId('hero-play-pause-btn').isVisible()).resolves.toBe(true);
          await expect(page.getByTestId('hero-next-slide').isVisible()).resolves.toBe(true);
          await expect(page.getByTestId('hero-prev-slide').isVisible()).resolves.toBe(true);
          await expect(page.getByTestId('hero-autoplay-progress').isVisible()).resolves.toBe(true);

          await expect(page.getByTestId('hero-filmstrip-scrubber').isVisible()).resolves.toBe(true);
          for (const code of V14_HERO_COUNTRIES) {
            await expect(
              page.getByTestId(`hero-filmstrip-card-${code}`).isVisible()
            ).resolves.toBe(true);
          }

          // Verify initial LB state on aura, mentor banner, and cultural telemetry bar
          const dynamicAura = page.getByTestId('landing-hero-dynamic-aura');
          const mentorBanner = page.getByTestId('hero-mentor-greeting-banner');
          const telemetryBar = page.getByTestId('hero-cultural-telemetry-bar');

          await expect(dynamicAura.getAttribute('data-active-country')).resolves.toBe('LB');
          await expect(mentorBanner.isVisible()).resolves.toBe(true);
          await expect(mentorBanner.textContent()).resolves.toContain(V14_HERO_SLIDES.LB.mentorName);
          await expect(telemetryBar.isVisible()).resolves.toBe(true);
          await expect(telemetryBar.textContent()).resolves.toContain(
            V14_HERO_SLIDES.LB.epistemicHighlight
          );

          // 3. Clicking `hero-next-slide` advances LB -> IQ -> EG -> FR -> KR and wraps back to LB
          const expectedProgression: HeroCountryCodeV14[] = ['IQ', 'EG', 'FR', 'KR', 'LB'];

          for (const expectedCountry of expectedProgression) {
            await page.getByTestId('hero-next-slide').click();
            const slideSpec = V14_HERO_SLIDES[expectedCountry];

            await expect(primaryArtwork.getAttribute('src')).resolves.toBe(
              slideSpec.heroDesktopJpg
            );
            await expect(ambientOverlay.getAttribute('src')).resolves.toBe(
              slideSpec.ambientOverlaySvgUrl
            );
            await expect(dynamicAura.getAttribute('data-active-country')).resolves.toBe(
              expectedCountry
            );
            await expect(dynamicAura.getAttribute('style')).resolves.toContain(
              slideSpec.heroDesktopJpg
            );
            await expect(mentorBanner.getAttribute('data-country')).resolves.toBe(expectedCountry);
            await expect(mentorBanner.textContent()).resolves.toContain(slideSpec.mentorName);
            await expect(mentorBanner.textContent()).resolves.toContain(
              slideSpec.mentorGreetingNative
            );
            await expect(telemetryBar.textContent()).resolves.toContain(slideSpec.cityName);
            await expect(telemetryBar.textContent()).resolves.toContain(
              slideSpec.epistemicHighlight
            );
            await expect(
              page.getByTestId(`hero-filmstrip-card-${expectedCountry}`).getAttribute('aria-pressed')
            ).resolves.toBe('true');
          }

          // Verify filmstrip card & prev-slide interactivity
          await page.getByTestId('hero-filmstrip-card-FR').click();
          await expect(primaryArtwork.getAttribute('src')).resolves.toBe(
            V14_HERO_SLIDES.FR.heroDesktopJpg
          );
          await page.getByTestId('hero-prev-slide').click();
          await expect(primaryArtwork.getAttribute('src')).resolves.toBe(
            V14_HERO_SLIDES.EG.heroDesktopJpg
          );

          // 4. Clicking `toggle-reduced-motion` sets `data-reduced-motion="true"` and pauses auto-cycling
          const landingRoot = page.getByTestId('cinematic-landing-page');
          await expect(landingRoot.getAttribute('data-reduced-motion')).resolves.toBe('false');

          await page.getByTestId('toggle-reduced-motion').click();
          await expect(landingRoot.getAttribute('data-reduced-motion')).resolves.toBe('true');
          await expect(
            page.getByTestId('hero-animated-stage').getAttribute('data-reduced-motion')
          ).resolves.toBe('true');
          await expect(page.getByTestId('hero-play-pause-btn').textContent()).resolves.toContain(
            'Paused'
          );
          await expect(
            page.getByTestId('hero-autoplay-progress').getAttribute('aria-valuenow')
          ).resolves.toBe('0');

          await context.close();
        } finally {
          await browser.close();
        }
      });
    },
    60000
  );
});
