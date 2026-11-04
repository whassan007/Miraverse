import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  V14_HERO_COUNTRIES,
  V14_HERO_CYCLE_MS,
  V14_HERO_SLIDES,
  V14_HERO_SLIDES_ORDERED,
  V14_RELEASE_VERSION,
} from '../../../../packages/contracts/v14/index';
import { HERO_SEQUENCE } from '../../../../apps/web/src/landing/hero-v14/useHeroAutoplay';

const WEB_PUBLIC_DIR = path.resolve(process.cwd(), 'apps/web/public');

function resolvePublicFilePath(publicUrl: string): string {
  const normalizedRelative = publicUrl.replace(/^\/+/, '');
  return path.join(WEB_PUBLIC_DIR, normalizedRelative);
}

describe('MiraVerse v1.4 Dynamic Hero Showcase Contracts & State-Machine Invariants', () => {
  it('enforces V14_HERO_COUNTRIES sequence [LB, IQ, EG, FR, KR] and V14_HERO_CYCLE_MS === 5200', () => {
    expect(V14_RELEASE_VERSION).toBe('1.4.0');
    expect(V14_HERO_COUNTRIES).toEqual(['LB', 'IQ', 'EG', 'FR', 'KR']);
    expect(V14_HERO_CYCLE_MS).toBe(5200);
    expect(HERO_SEQUENCE).toEqual(['LB', 'IQ', 'EG', 'FR', 'KR']);
    expect(V14_HERO_SLIDES_ORDERED.map((slide) => slide.country)).toEqual([
      'LB',
      'IQ',
      'EG',
      'FR',
      'KR',
    ]);
    expect(V14_HERO_SLIDES_ORDERED.map((slide) => slide.orderIndex)).toEqual([1, 2, 3, 4, 5]);
  });

  it('verifies every country in V14_HERO_SLIDES has valid asset URLs, existing files under apps/web/public, and non-empty cultural metadata', () => {
    for (const country of V14_HERO_COUNTRIES) {
      const slide = V14_HERO_SLIDES[country];
      expect(slide).toBeDefined();
      expect(slide.country).toBe(country);

      // Verify URL formats
      expect(slide.heroDesktopJpg).toMatch(/^\/art\/.+\.jpg$/);
      expect(slide.heroDesktopWebp).toMatch(/^\/art\/.+\.webp$/);
      expect(slide.ambientOverlaySvgUrl).toBe(`/art/v14/hero-overlays/overlay-${country}.svg`);
      expect(slide.questMapUrl).toMatch(/^\/art\/.+\.(jpg|webp|svg)$/);
      expect(slide.mentorPortraitUrl).toMatch(/^\/art\/.+\.(jpg|webp|svg)$/);

      // Verify corresponding files exist on disk under apps/web/public
      const requiredAssetUrls = [
        slide.heroDesktopJpg,
        slide.heroDesktopWebp,
        slide.ambientOverlaySvgUrl,
        slide.questMapUrl,
        slide.mentorPortraitUrl,
      ];

      if (slide.heroMobileJpg) {
        requiredAssetUrls.push(slide.heroMobileJpg);
      }
      if (slide.heroMobileWebp) {
        requiredAssetUrls.push(slide.heroMobileWebp);
      }

      for (const assetUrl of requiredAssetUrls) {
        const diskPath = resolvePublicFilePath(assetUrl);
        expect(
          fs.existsSync(diskPath),
          `Expected public asset for ${country} to exist at ${diskPath} (from ${assetUrl})`
        ).toBe(true);
        const stat = fs.statSync(diskPath);
        expect(stat.isFile()).toBe(true);
        expect(stat.size).toBeGreaterThan(0);
      }

      // Verify non-empty required cultural and styling strings
      expect(slide.mentorGreetingNative.trim().length).toBeGreaterThan(0);
      expect(slide.mentorGreetingEn.trim().length).toBeGreaterThan(0);
      expect(slide.epistemicHighlight.trim().length).toBeGreaterThan(0);
      expect(slide.ambientMotionDescription.trim().length).toBeGreaterThan(0);
      expect(slide.radialGradientCss.trim().length).toBeGreaterThan(0);
      expect(slide.radialGradientCss).toContain('radial-gradient(');
    }
  });

  it('verifies every animated ambient SVG overlay contains valid <svg, @keyframes, and @media (prefers-reduced-motion: reduce)', () => {
    const overlayFiles = [
      'overlay-LB.svg',
      'overlay-IQ.svg',
      'overlay-EG.svg',
      'overlay-FR.svg',
      'overlay-KR.svg',
    ] as const;

    for (const fileName of overlayFiles) {
      const svgPath = path.join(WEB_PUBLIC_DIR, 'art/v14/hero-overlays', fileName);
      expect(fs.existsSync(svgPath), `Missing SVG overlay: ${svgPath}`).toBe(true);

      const svgContent = fs.readFileSync(svgPath, 'utf-8');
      expect(svgContent).toContain('<svg');
      expect(svgContent).toContain('</svg>');
      expect(svgContent).toContain('@keyframes');
      expect(svgContent).toContain('@media (prefers-reduced-motion: reduce)');
    }
  });
});
