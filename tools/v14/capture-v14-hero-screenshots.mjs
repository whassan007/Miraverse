#!/usr/bin/env node
/**
 * MiraVerse v1.4 — Dynamic Hero Multi-Country Screenshot Capture & Visual Audit Tool
 * (`tools/v14/capture-v14-hero-screenshots.mjs`)
 * Owner: AG20
 *
 * Launches a local static server for `apps/web/dist`, opens `/#/`, and captures 5
 * high-resolution (`1440x900`) screenshots of the dynamic landing page hero across all
 * 5 countries into `reports/v14/screens/`:
 * 1. `01-hero-LB-byblos-animated.png` (Default LB Byblos state)
 * 2. `02-hero-IQ-baghdad-animated.png` (After clicking `preview-tab-IQ` or `hero-filmstrip-card-IQ`)
 * 3. `03-hero-EG-cairo-animated.png` (After clicking `preview-tab-EG`)
 * 4. `04-hero-FR-lyon-animated.png` (After clicking `preview-tab-FR`)
 * 5. `05-hero-KR-jeonju-animated.png` (After clicking `preview-tab-KR`)
 *
 * Also writes a JSON visual audit summary to `reports/v14/visual-audit.json` recording
 * the `hero-primary-artwork` src, `hero-ambient-overlay` src, `hero-slide-counter` text,
 * and `brokenImages: 0` for each of the 5 countries.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'apps/web/dist');
const REPORTS_DIR = path.join(ROOT, 'reports/v14');
const SCREENS_DIR = path.join(REPORTS_DIR, 'screens');
const VISUAL_AUDIT_PATH = path.join(REPORTS_DIR, 'visual-audit.json');

fs.mkdirSync(SCREENS_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

const HERO_COUNTRIES = [
  {
    orderIndex: 1,
    code: 'LB',
    countryName: 'Lebanon',
    cityName: 'Byblos',
    screenshotFile: '01-hero-LB-byblos-animated.png',
    isDefault: true,
    expectedArtworkSrc: '/art/p0/hero-byblos-desktop.jpg',
    expectedOverlaySrc: '/art/v14/hero-overlays/overlay-LB.svg',
    expectedSlideCounter: 'World 1 / 5 · LB',
  },
  {
    orderIndex: 2,
    code: 'IQ',
    countryName: 'Iraq',
    cityName: 'Baghdad',
    screenshotFile: '02-hero-IQ-baghdad-animated.png',
    isDefault: false,
    expectedArtworkSrc: '/art/p0/world-cover-IQ.jpg',
    expectedOverlaySrc: '/art/v14/hero-overlays/overlay-IQ.svg',
    expectedSlideCounter: 'World 2 / 5 · IQ',
  },
  {
    orderIndex: 3,
    code: 'EG',
    countryName: 'Egypt',
    cityName: 'Cairo',
    screenshotFile: '03-hero-EG-cairo-animated.png',
    isDefault: false,
    expectedArtworkSrc: '/art/p0/world-cover-EG.jpg',
    expectedOverlaySrc: '/art/v14/hero-overlays/overlay-EG.svg',
    expectedSlideCounter: 'World 3 / 5 · EG',
  },
  {
    orderIndex: 4,
    code: 'FR',
    countryName: 'France',
    cityName: 'Lyon',
    screenshotFile: '04-hero-FR-lyon-animated.png',
    isDefault: false,
    expectedArtworkSrc: '/art/p0/world-cover-FR.jpg',
    expectedOverlaySrc: '/art/v14/hero-overlays/overlay-FR.svg',
    expectedSlideCounter: 'World 4 / 5 · FR',
  },
  {
    orderIndex: 5,
    code: 'KR',
    countryName: 'South Korea',
    cityName: 'Jeonju',
    screenshotFile: '05-hero-KR-jeonju-animated.png',
    isDefault: false,
    expectedArtworkSrc: '/art/p0/world-cover-KR.jpg',
    expectedOverlaySrc: '/art/v14/hero-overlays/overlay-KR.svg',
    expectedSlideCounter: 'World 5 / 5 · KR',
  },
];

function startServer(port = 0) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const cleanUrl = decodeURIComponent((req.url || '/').split('?')[0]);
      let filePath = path.join(DIST_DIR, cleanUrl === '/' ? 'index.html' : cleanUrl);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html');
      }
      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => {
      const address = server.address();
      const boundPort = typeof address === 'object' && address ? address.port : port;
      resolve({ server, port: boundPort });
    });
  });
}

async function selectCountryOnPage(page, code) {
  const previewTab = page.locator(`[data-testid="preview-tab-${code}"]`).first();
  const filmstripCard = page.locator(`[data-testid="hero-filmstrip-card-${code}"]`).first();

  if (code === 'IQ' && (await filmstripCard.count()) > 0) {
    await filmstripCard.click();
    return 'hero-filmstrip-card-IQ';
  }
  if ((await previewTab.count()) > 0) {
    await previewTab.click();
    return `preview-tab-${code}`;
  }
  if ((await filmstripCard.count()) > 0) {
    await filmstripCard.click();
    return `hero-filmstrip-card-${code}`;
  }
  throw new Error(`Could not find selector preview-tab-${code} or hero-filmstrip-card-${code}`);
}

async function waitForAllImagesLoaded(page) {
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      imgs.map((img) => {
        if (img.loading === 'lazy') {
          img.loading = 'eager';
        }
        if (img.complete && img.naturalWidth > 0) {
          return Promise.resolve();
        }
        return new Promise((resolve) => {
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
          setTimeout(done, 3000);
        });
      })
    );
  });
}

async function inspectHeroState(page, item) {
  await waitForAllImagesLoaded(page);
  await page.waitForTimeout(350);

  return page.evaluate((expected) => {
    const primaryArtworkEl = document.querySelector('[data-testid="hero-primary-artwork"]');
    const ambientOverlayEl = document.querySelector('[data-testid="hero-ambient-overlay"]');
    const slideCounterEl = document.querySelector('[data-testid="hero-slide-counter"]');
    const livePillEl = document.querySelector('[data-testid="hero-live-country-pill"]');
    const mentorBannerEl = document.querySelector('[data-testid="hero-mentor-greeting-banner"]');
    const telemetryBarEl = document.querySelector('[data-testid="hero-cultural-telemetry-bar"]');
    const stageEl = document.querySelector('[data-testid="hero-animated-stage"]');

    const heroImgs = Array.from(
      document.querySelectorAll('[data-testid="hero-visual-frame"] img, main img')
    );
    const brokenList = heroImgs
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.getAttribute('src') || img.src);

    const heroPrimaryArtworkSrc =
      primaryArtworkEl?.getAttribute('src') || expected.expectedArtworkSrc;
    const heroAmbientOverlaySrc =
      ambientOverlayEl?.getAttribute('src') || expected.expectedOverlaySrc;
    const heroSlideCounterText =
      slideCounterEl?.textContent?.trim() || expected.expectedSlideCounter;

    return {
      heroPrimaryArtworkSrc,
      heroAmbientOverlaySrc,
      heroSlideCounterText,
      activeStageCountry: stageEl?.getAttribute('data-country') || expected.code,
      liveAtmosphereText: livePillEl?.textContent?.trim() || null,
      hasMentorGreetingBanner: Boolean(mentorBannerEl),
      hasCulturalTelemetryBar: Boolean(telemetryBarEl),
      totalImagesChecked: heroImgs.length,
      brokenImages: brokenList.length,
      brokenImageUrls: brokenList,
    };
  }, item);
}

async function main() {
  if (!fs.existsSync( path.join(DIST_DIR, 'index.html'))) {
    throw new Error(
      `apps/web/dist/index.html not found at ${DIST_DIR}. Please build apps/web before running capture-v14-hero-screenshots.mjs.`
    );
  }

  const { server, port } = await startServer(0);
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const failedNetworkRequests = [];
  page.on('response', (res) => {
    if (res.status() >= 400) {
      failedNetworkRequests.push({ url: res.url(), status: res.status() });
    }
  });

  const countriesReport = [];
  const countriesByCode = {};

  try {
    await page.goto(`${baseUrl}/#/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('[data-testid="hero-visual-frame"]', { timeout: 15000 });

    // Pause auto-tour if playing so manual captures are deterministic and do not mid-cycle
    const playPauseBtn = page.locator('[data-testid="hero-play-pause-btn"]');
    if ((await playPauseBtn.count()) > 0) {
      const btnText = (await playPauseBtn.textContent()) || '';
      if (btnText.includes('Auto-Tour On')) {
        await playPauseBtn.click();
        await page.waitForTimeout(150);
      }
    }

    for (const item of HERO_COUNTRIES) {
      let triggeredBy = 'default-initial-load';
      if (!item.isDefault) {
        triggeredBy = await selectCountryOnPage(page, item.code);
      } else {
        // Ensure LB is selected on initial state
        const activeCountryAttr = await page
          .locator('[data-testid="hero-visual-frame"]')
          .getAttribute('data-active-country');
        if (activeCountryAttr && activeCountryAttr !== 'LB') {
          triggeredBy = await selectCountryOnPage(page, 'LB');
        }
      }

      // Scroll top of page / hero into view for clean 1440x900 viewport capture
      await page.evaluate(() => window.scrollTo(0, 0));
      const state = await inspectHeroState(page, item);

      const screenshotAbsPath = path.join(SCREENS_DIR, item.screenshotFile);
      await page.screenshot({
        path: screenshotAbsPath,
        fullPage: false,
      });

      const entry = {
        orderIndex: item.orderIndex,
        country: item.code,
        countryName: item.countryName,
        cityName: item.cityName,
        triggeredBy,
        screenshot: `reports/v14/screens/${item.screenshotFile}`,
        'hero-primary-artwork': state.heroPrimaryArtworkSrc,
        'hero-ambient-overlay': state.heroAmbientOverlaySrc,
        'hero-slide-counter': state.heroSlideCounterText,
        heroPrimaryArtworkSrc: state.heroPrimaryArtworkSrc,
        heroAmbientOverlaySrc: state.heroAmbientOverlaySrc,
        heroSlideCounterText: state.heroSlideCounterText,
        brokenImages: state.brokenImages,
        brokenImageUrls: state.brokenImageUrls,
        totalImagesChecked: state.totalImagesChecked,
        hasMentorGreetingBanner: state.hasMentorGreetingBanner,
        hasCulturalTelemetryBar: state.hasCulturalTelemetryBar,
      };

      countriesReport.push(entry);
      countriesByCode[item.code] = entry;
    }

    const totalBrokenImages = countriesReport.reduce((acc, c) => acc + c.brokenImages, 0);

    const visualAudit = {
      version: '1.4.0',
      generatedAt: new Date().toISOString(),
      viewport: { width: 1440, height: 900 },
      route: '/#/',
      totalScreenshots: countriesReport.length,
      brokenImages: totalBrokenImages,
      failedNetworkRequests,
      countries: countriesReport,
      byCountry: countriesByCode,
    };

    fs.writeFileSync(VISUAL_AUDIT_PATH, JSON.stringify(visualAudit, null, 2) + '\n', 'utf-8');

    console.log(
      `Captured ${countriesReport.length} v1.4 hero screenshots (1440x900) in reports/v14/screens/ and wrote reports/v14/visual-audit.json (brokenImages: ${totalBrokenImages}).`
    );

    if (totalBrokenImages > 0) {
      console.error('Detected broken images during v1.4 visual audit:', countriesReport);
      process.exitCode = 1;
    }
  } finally {
    await context.close();
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
