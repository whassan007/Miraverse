#!/usr/bin/env node
/**
 * MiraVerse v1.2 — Playwright Visual & Behavioral Verification (`tools/v12/release/capture-v12-screenshots.mjs`)
 * Launches a local static server for `apps/web/dist` and captures real Chromium screenshots of:
 * 1. `/explore` (`#/atlas`) — Cultural Knowledge Encyclopedia & Dual-Layer Real-World WGS84 Atlas
 * 2. `/explore` (`#/atlas`) — Illustrated Quest Map tab showing "in-game map / not to geographic scale"
 * 3. `/explore/LB` — Lebanon Secrets of Byblos with Provenance Drawer open & Ages 5-7 selected
 * 4. `/explore/IQ` — Iraq Legacy of Baghdad with Arabic RTL (`ar-IQ`) title locale selected
 * 5. `/explore/KR` — South Korea Spirit of Jeonju with Obangsaek wheel & food safety notes
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'apps/web/dist');
const SCREENS_DIR = path.join(ROOT, 'reports/v12/screens');
fs.mkdirSync(SCREENS_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

function startServer(port = 4179) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const cleanUrl = (req.url || '/').split('?')[0];
      let filePath = path.join(DIST_DIR, cleanUrl === '/' ? 'index.html' : cleanUrl);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html');
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

async function main() {
  const port = 4179;
  const server = await startServer(port);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });

  try {
    // 1. /#/atlas Real-World Geodata view
    await page.goto(`http://127.0.0.1:${port}/#/atlas`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="v12-encyclopedia-section-ALL"]');
    const encSection = page.locator('[data-testid="v12-encyclopedia-section-ALL"]');
    await encSection.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(SCREENS_DIR, '01-atlas-real-world-wgs84.png'), fullPage: false });

    // 2. Switch to Illustrated Quest Map tab ("in-game map / not to geographic scale")
    await page.click('[data-testid="atlas-tab-quest-map"]');
    await page.waitForSelector('[data-testid="quest-map-scale-disclaimer"]');
    await page.screenshot({ path: path.join(SCREENS_DIR, '02-atlas-quest-map-not-to-scale.png'), fullPage: false });

    // 3. /#/explore/LB with Ages 5-7 and Provenance Drawer expanded
    await page.goto(`http://127.0.0.1:${port}/#/explore/LB`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="v12-encyclopedia-section-LB"]');
    await page.locator('[data-testid="v12-encyclopedia-section-LB"]').scrollIntoViewIfNeeded();
    await page.click('[data-testid="age-tier-btn-5-7"]');
    await page.click('[data-testid="provenance-toggle-LB-KB-PLACE-BYBLOS-PORT"]');
    await page.waitForSelector('[data-testid="provenance-drawer-LB-KB-PLACE-BYBLOS-PORT"]');
    await page.screenshot({ path: path.join(SCREENS_DIR, '03-lebanon-age-5-7-provenance-drawer.png'), fullPage: false });

    // 4. /#/explore/IQ with Iraqi Arabic (ar-IQ) RTL preview
    await page.goto(`http://127.0.0.1:${port}/#/explore/IQ`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="v12-encyclopedia-section-IQ"]');
    await page.locator('[data-testid="v12-encyclopedia-section-IQ"]').scrollIntoViewIfNeeded();
    await page.selectOption('[data-testid="v12-locale-select"]', 'ar-IQ');
    await page.screenshot({ path: path.join(SCREENS_DIR, '04-iraq-ar-IQ-rtl-encyclopedia.png'), fullPage: false });

    // 5. /#/explore/KR with Obangsaek wheel & Ages 14-17 source-critical mode
    await page.goto(`http://127.0.0.1:${port}/#/explore/KR`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="v12-encyclopedia-section-KR"]');
    await page.selectOption('[data-testid="v12-locale-select"]', 'ko');
    await page.click('[data-testid="age-tier-btn-14-17"]');
    await page.locator('[data-testid="v12-knowledge-cards-grid"]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(SCREENS_DIR, '05-korea-obangsaek-age-14-17.png'), fullPage: false });

    console.log('Captured 5 Playwright screenshots in reports/v12/screens/');
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
