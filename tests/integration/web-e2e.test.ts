import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { describe, expect, it } from 'vitest';
import { COUNTRIES, UI_LANGS } from '../../packages/content/schema.js';
import { GOLDEN_VECTORS, verify } from '../../packages/shared/stamp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const webDistDir = path.join(rootDir, 'apps/web/dist');
const screenshotDir = path.join(rootDir, 'dist/screenshots');

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

describe('Gate G3 — Web build E2E smoke test and responsive LTR/RTL screenshots', () => {
  it(
    'completes Home, Story (1..15 + gloss + vocab), Play (5 challenges -> stamp), Passport (redeem/reject/reset), and responsive screenshots with zero errors or external requests',
    async () => {
      expect(fs.existsSync(path.join(webDistDir, 'index.html'))).toBe(true);
      fs.mkdirSync(screenshotDir, { recursive: true });

      const srv = await startStaticServer(webDistDir);
      const browser = await chromium.launch({ headless: true });

      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const failedAssets: string[] = [];
      const externalRequests: string[] = [];

      try {
        const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
        const page = await context.newPage();

        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        page.on('pageerror', (err) => {
          pageErrors.push(err.message);
        });
        page.on('requestfailed', (req) => {
          failedAssets.push(`${req.url()} (${req.failure()?.errorText ?? 'failed'})`);
        });
        page.on('request', (req) => {
          const u = req.url();
          if (!u.startsWith(srv.url) && !u.startsWith('data:') && !u.startsWith('blob:')) {
            externalRequests.push(u);
          }
        });

        // 1. Boot Home route
        await page.goto(`${srv.url}/#/`, { waitUntil: 'networkidle' });

        // Verify all 11 country cards and all 14 language options exist
        for (const cc of ['LB', 'IQ', 'EG', 'FR', 'KR', 'DE', 'CN', 'JP', 'RU', 'UA', 'MA'] as const) {
          await expect(page.getByTestId(`country-card-${cc}`).isVisible()).resolves.toBe(true);
        }
        const langOptions = await page.locator('#ui-language option').evaluateAll((opts) =>
          opts.map((o) => (o as HTMLOptionElement).value)
        );
        expect(langOptions).toEqual([
          ...UI_LANGS,
          'fr-CA',
          'de-DE',
          'zh-Hans-CN',
          'ja-JP',
          'ru-RU',
          'uk-UA',
          'ar',
          'ar-MA',
        ]);

        // 2. Capture responsive screenshots at 360px, 768px, and 1280px for LTR ('en') and RTL ('ar-LB')
        const widths = [
          { w: 360, h: 800 },
          { w: 768, h: 1024 },
          { w: 1280, h: 800 },
        ];

        for (const locale of ['en', 'ar-LB'] as const) {
          await page.selectOption('#ui-language', locale);
          const expectedDir = locale === 'ar-LB' ? 'rtl' : 'ltr';
          const docDir = await page.evaluate(() => document.documentElement.dir);
          expect(docDir).toBe(expectedDir);

          for (const { w, h } of widths) {
            await page.setViewportSize({ width: w, height: h });
            const hasHorizontalOverflow = await page.evaluate(
              () => document.documentElement.scrollWidth > document.documentElement.clientWidth
            );
            expect(hasHorizontalOverflow, `Horizontal overflow at ${w}px in ${locale}`).toBe(false);
            const shotPath = path.join(screenshotDir, `${locale}-${w}px.png`);
            await page.screenshot({ path: shotPath, fullPage: false });
            expect(fs.existsSync(shotPath)).toBe(true);
            expect(fs.statSync(shotPath).size).toBeGreaterThan(1000);
          }
        }

        // Switch back to English at 1280x800 for functional journey
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.selectOption('#ui-language', 'en');

        // 3. Navigate to Lebanon Story (#/story/ar-LB) via Home card CTA
        await page.getByTestId('read-story-LB').click();
        await page.waitForSelector('.story-counter');
        expect(await page.locator('.story-counter').textContent()).toContain('Scene 1 / 15');

        // Toggle English gloss and verify gloss text appears
        const glossBtn = page.getByRole('button', { name: /English gloss/i });
        await glossBtn.click();
        const glossVisible = await page.locator('#story-gloss').isVisible();
        expect(glossVisible).toBe(true);
        const glossText = (await page.locator('#story-gloss').textContent())?.trim() ?? '';
        expect(glossText.length).toBeGreaterThan(20);

        // Navigate Scene 1 -> 15
        const nextBtn = page.getByRole('button', { name: /Next/i });
        for (let s = 2; s <= 15; s++) {
          await nextBtn.click();
          expect(await page.locator('.story-counter').textContent()).toContain(`Scene ${s} / 15`);
        }

        // Verify vocabulary review opens automatically on Scene 15 with 10 words
        const vocabItems = await page.locator('ul.story-vocab li').count();
        expect(vocabItems).toBe(10);

        // 4. Navigate to Play (#/play/LB) and complete all 5 challenges
        await page.locator('a.story-play').click();
        await page.waitForSelector('#chapter-progress');

        for (let step = 0; step < 5; step++) {
          const completeBtn = page.getByRole('button', { name: /Complete challenge:/i });
          await completeBtn.click();
        }

        // Verify chapter complete and valid stamp code issued
        const issuedStamp = (await page.locator('output').textContent())?.trim() ?? '';
        expect(verify(issuedStamp)).toEqual(
          expect.objectContaining({ valid: true, country: 'LB', chapter: 1 })
        );

        // 5. Navigate to Passport (#/passport) and verify stamp operations
        await page.goto(`${srv.url}/#/passport`, { waitUntil: 'networkidle' });
        const bodyTextAfterPlay = (await page.locator('#main-content').textContent()) ?? '';
        expect(bodyTextAfterPlay).toContain(issuedStamp);

        // Redeem a valid external stamp (Egypt golden vector)
        const egCode = GOLDEN_VECTORS.find((v) => v.country === 'EG')!.code;
        await page.fill('#souvenir-code', egCode);
        await page.click('button[type="submit"]');
        expect(await page.locator('#passport-feedback').textContent()).toMatch(/added to your passport/i);
        expect(await page.locator('#main-content').textContent()).toContain(egCode);

        // Reject duplicate code
        await page.fill('#souvenir-code', egCode);
        await page.click('button[type="submit"]');
        expect(await page.locator('#passport-feedback').textContent()).toMatch(/already collected/i);

        // Reject malformed code
        await page.fill('#souvenir-code', 'MV-LB1-0000-0000');
        await page.click('button[type="submit"]');
        expect(await page.locator('#passport-feedback').textContent()).toMatch(/invalid/i);

        // Reset local passport
        await page.getByRole('button', { name: /Clear \/ Reset Passport/i }).click();
        expect(await page.locator('#passport-feedback').textContent()).toMatch(/cleared/i);
        expect(await page.locator('#main-content').textContent()).not.toContain(egCode);

        expect(consoleErrors).toEqual([]);
        expect(pageErrors).toEqual([]);
        expect(failedAssets).toEqual([]);
        expect(externalRequests).toEqual([]);
      } finally {
        await browser.close();
        await srv.close();
      }
    },
    30000
  );
});
