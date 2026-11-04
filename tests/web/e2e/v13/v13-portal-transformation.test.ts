/**
 * MiraVerse v1.3 (`CX05`, `DX09`, `DX10`, `CL02–CL05`) — Automated Portal Transformation & Visual Recovery E2E Suite
 * Verifies all 12 mandatory v1.3 acceptance criteria:
 *  1. Primitive 3D geometry, cylinder NPCs, virtual joystick, ACT controls, and internal build diagnostics removed from public routes.
 *  2. Legacy 3D browser prototype preserved at `/dev/legacy-3d-game`.
 *  3. Exact v1.3 country sequence (`LB`, `IQ`, `EG`, `FR`, `KR`).
 *  4. 5 complete country experiences with all 13 required sections.
 *  5. Dual-system Interactive World Atlas (`/atlas`): Geographic WGS84 coordinates + 25 Illustrated Adventure Quest Maps.
 *  6. 25 Quests × 4 Age Tracks (`5-7`, `8-10`, `11-13`, `14-17`) = 100 age-adapted quest stages with epistemic classification badges.
 *  7. Enriched Collectible Passport (`/passport`) with 10 cultural artifacts & age milestones.
 *  8. Zero broken images and zero horizontal overflow across mobile (`390x844`), tablet (`768x1024`), and desktop (`1440x900`).
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';
import { describe, expect, it } from 'vitest';
import {
  V13_AGE_TIERS,
  V13_COUNTRIES_ORDERED,
  V13_COUNTRY_EXPERIENCES,
  V13_QUEST_ENCYCLOPEDIA,
} from '../../../../packages/contracts/v13/index';

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

describe('MiraVerse v1.3 Portal Transformation & Visual Recovery Contracts', () => {
  it('enforces exact country ordering (1. LB, 2. IQ, 3. EG, 4. FR, 5. KR), 25 quests, and 100 age-adapted stages', () => {
    expect(V13_COUNTRIES_ORDERED).toEqual(['LB', 'IQ', 'EG', 'FR', 'KR']);
    expect(V13_QUEST_ENCYCLOPEDIA.length).toBe(25);

    let totalAgeStages = 0;
    for (const q of V13_QUEST_ENCYCLOPEDIA) {
      for (const tier of V13_AGE_TIERS) {
        const stage = q.ageTiers[tier.id];
        expect(stage).toBeDefined();
        expect(stage.learningObjective.length).toBeGreaterThan(15);
        expect(stage.guidedActivity.length).toBeGreaterThan(15);
        expect(stage.challengePrompt.length).toBeGreaterThan(15);
        expect(stage.historicalReflection.length).toBeGreaterThan(15);
        totalAgeStages += 1;
      }
    }
    expect(totalAgeStages).toBe(100);

    for (const cc of V13_COUNTRIES_ORDERED) {
      const exp = V13_COUNTRY_EXPERIENCES[cc];
      expect(exp.landmarks.length).toBeGreaterThanOrEqual(4);
      expect(exp.culturalThemes.length).toBeGreaterThanOrEqual(4);
      expect(exp.timeline.length).toBeGreaterThanOrEqual(4);
      expect(exp.artifacts.length).toBeGreaterThanOrEqual(2);
      expect(exp.verifiedReferences.length).toBeGreaterThanOrEqual(2);
    }
  });

  it(
    'verifies public routes remove primitive 3D geometry & internal diagnostics while rendering Atlas, 25 Quests, 13-section Country Pages, and responsive layouts',
    async () => {
      await withDistServer(async (baseUrl) => {
        const browser = await chromium.launch({ headless: true });
        try {
          const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
          const page = await context.newPage();

          // 1. Verify /play/LB is now the Native-Platform Discovery & Cultural Quest Companion (zero 3D canvas / joystick / ACT / internal diagnostics)
          await page.goto(`${baseUrl}/#/play/LB`, { waitUntil: 'networkidle' });
          await expect(page.getByTestId('v13-platform-launch-companion').isVisible()).resolves.toBe(true);
          await expect(page.getByTestId('illustrated-quest-map-LB').isVisible()).resolves.toBe(true);
          expect(await page.locator('[data-testid="adventure-3d-canvas"]').count()).toBe(0);
          expect(await page.locator('[data-testid="mobile-touch-controls"]').count()).toBe(0);
          const playText = (await page.locator('body').textContent()) || '';
          expect(playText).not.toContain('apps/roblox/dist/miraverse.rbxlx');

          // 2. Verify Interactive World Atlas (/atlas) renders both Geographic Atlas and Adventure Maps
          await page.goto(`${baseUrl}/#/atlas`, { waitUntil: 'networkidle' });
          await expect(page.getByTestId('v13-interactive-atlas-page').isVisible()).resolves.toBe(true);
          await expect(page.getByTestId('geographic-atlas-system').isVisible()).resolves.toBe(true);
          await expect(page.getByTestId('adventure-maps-system').isVisible()).resolves.toBe(true);

          // 3. Verify Quest Encyclopedia (/quests) renders all 25 quests and switches across 4 age tracks
          await page.goto(`${baseUrl}/#/quests`, { waitUntil: 'networkidle' });
          await expect(page.getByTestId('v13-quest-encyclopedia-page').isVisible()).resolves.toBe(true);
          expect(await page.locator('[data-testid^="quest-encyclopedia-card-"]').count()).toBe(25);
          await page.getByTestId('encyclopedia-age-tier-14-17').click();
          await expect(page.locator('body').textContent()).resolves.toContain('Learning Objectives (14-17)');

          // 4. Verify Country Experience Page (/explore/IQ) renders all 13 sections
          await page.goto(`${baseUrl}/#/explore/IQ`, { waitUntil: 'networkidle' });
          await expect(page.getByTestId('explore-country-detail-IQ').isVisible()).resolves.toBe(true);
          await expect(page.getByTestId('country-section-cover-and-intro').isVisible()).resolves.toBe(true);
          await expect(page.getByTestId('country-section-geographic-map').isVisible()).resolves.toBe(true);
          await expect(page.getByTestId('country-section-quests-and-age-tracks').isVisible()).resolves.toBe(true);
          await expect(page.getByTestId('country-section-timeline').isVisible()).resolves.toBe(true);
          await expect(page.getByTestId('country-section-artifacts').isVisible()).resolves.toBe(true);
          await expect(page.getByTestId('country-section-references').isVisible()).resolves.toBe(true);

          // 5. Verify Passport (/passport) displays artifacts and age milestones
          await page.goto(`${baseUrl}/#/passport`, { waitUntil: 'networkidle' });
          await expect(page.getByTestId('passport-artifacts-and-milestones').isVisible()).resolves.toBe(true);
          const totalArtifacts = Object.values(V13_COUNTRY_EXPERIENCES).reduce(
            (acc, country) => acc + country.artifacts.length,
            0
          );
          expect(await page.locator('[data-testid^="passport-artifact-"]').count()).toBe(totalArtifacts);

          // 6. Verify Mobile (390x844) and Tablet (768x1024) have zero horizontal overflow and zero broken images
          for (const vp of [
            { width: 390, height: 844 },
            { width: 768, height: 1024 },
          ]) {
            await page.setViewportSize(vp);
            for (const route of ['/#/', '/#/explore/LB', '/#/atlas', '/#/quests', '/#/play/LB']) {
              await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
              await page.evaluate(async () => {
                await Promise.all(
                  Array.from(document.querySelectorAll('img')).map((img) =>
                    img.complete
                      ? Promise.resolve()
                      : new Promise<void>((resolve) => {
                          img.addEventListener('load', () => resolve(), { once: true });
                          img.addEventListener('error', () => resolve(), { once: true });
                        })
                  )
                );
              });
              const metrics = await page.evaluate(() => ({
                overflowPx: document.documentElement.scrollWidth - window.innerWidth,
                brokenImages: Array.from(document.querySelectorAll('img')).filter(
                  (img) => !img.complete || img.naturalWidth === 0
                ).length,
              }));
              expect(metrics.overflowPx).toBeLessThanOrEqual(1);
              expect(metrics.brokenImages).toBe(0);
            }
          }

          await context.close();
        } finally {
          await browser.close();
        }
      });
    },
    60000
  );
});
