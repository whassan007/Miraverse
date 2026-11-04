#!/usr/bin/env node
/**
 * MiraVerse P0 — Phase 6 Live Deployed Verification & Screenshot Proof
 * Captures screenshots and DOM/network telemetry directly from https://miraverse.pages.dev/
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'reports/p0-visual-recovery/screens/deployed-after');
fs.mkdirSync(OUT_DIR, { recursive: true });

const LIVE_URL = 'https://miraverse.pages.dev';

async function main() {
  const browser = await chromium.launch();
  const viewports = [
    { w: 390, h: 844 },
    { w: 768, h: 1024 },
    { w: 1440, h: 900 },
    { w: 1920, h: 1080 },
  ];

  const liveAudit = {
    deployedUrl: LIVE_URL,
    verifiedAt: new Date().toISOString(),
    viewports: {},
  };

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await context.newPage();
    const failedAssets = [];
    page.on('response', (res) => {
      if (res.status() >= 400) {
        failedAssets.push({ url: res.url(), status: res.status() });
      }
    });

    await page.goto(`${LIVE_URL}/#/`, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(800);

    const shotPath = path.join(OUT_DIR, `deployed-home-${vp.w}x${vp.h}.png`);
    await page.screenshot({ path: shotPath, fullPage: true });

    const domState = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      const scripts = Array.from(document.querySelectorAll('script[src]')).map((s) => s.getAttribute('src'));
      return {
        scripts,
        headerCount: document.querySelectorAll('header').length,
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        heroSrc: document.querySelector('[data-testid="hero-primary-artwork"]')?.getAttribute('src'),
        robloxCtaText: document.querySelector('[data-testid="cta-play-free"]')?.textContent?.trim(),
        worldCovers: ['LB', 'EG', 'IQ', 'KR', 'FR'].map((cc) =>
          document.querySelector(`[data-testid="country-card-${cc}"] img`)?.getAttribute('src')
        ),
        totalImages: imgs.length,
        brokenImages: imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src),
      };
    });

    liveAudit.viewports[`${vp.w}x${vp.h}`] = {
      ...domState,
      failedAssets,
    };

    await context.close();
  }

  // Capture additional live deployed routes at 1440x900
  const extraRoutes = [
    { file: 'deployed-explore-1440x900.png', route: '/#/explore' },
    { file: 'deployed-passport-1440x900.png', route: '/#/passport' },
    { file: 'deployed-minecraft-1440x900.png', route: '/#/minecraft' },
  ];
  for (const r of extraRoutes) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${LIVE_URL}${r.route}`, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, r.file), fullPage: true });
    await page.close();
  }

  await browser.close();

  fs.writeFileSync(
    path.join(ROOT, 'reports/p0-visual-recovery/phase6-live-deployed-audit.json'),
    JSON.stringify(liveAudit, null, 2)
  );
  console.log('Phase 6 Live Deployed Audit (1440x900):', JSON.stringify(liveAudit.viewports['1440x900'], null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
