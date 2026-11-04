import { useEffect, useState } from 'react';

export interface HeroPreloadSlide {
  heroDesktopJpg: string;
  heroDesktopWebp: string;
  ambientOverlaySvgUrl: string;
  questMapUrl: string;
}

export interface UseHeroImagePreloaderResult {
  preloadedCount: number;
  isReady: boolean;
}

/**
 * Preloads hero showcase images, ambient SVG overlays, and quest map thumbnails
 * during idle time (or after a short 150ms timeout) so auto-advancing across
 * LB -> IQ -> EG -> FR -> KR occurs with zero network flicker or blank frames.
 */
export function useHeroImagePreloader(
  slides: Array<HeroPreloadSlide>
): UseHeroImagePreloaderResult {
  const [preloadedCount, setPreloadedCount] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      return;
    }

    if (!slides || slides.length === 0) {
      setPreloadedCount(0);
      setIsReady(true);
      return;
    }

    // Collect unique valid asset URLs across all slides
    const urls = Array.from(
      new Set(
        slides
          .flatMap((slide) => [
            slide.heroDesktopWebp,
            slide.heroDesktopJpg,
            slide.ambientOverlaySvgUrl,
            slide.questMapUrl,
          ])
          .filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
      )
    );

    if (urls.length === 0) {
      setPreloadedCount(0);
      setIsReady(true);
      return;
    }

    let isCancelled = false;
    let completed = 0;
    const total = urls.length;
    const activeImages: HTMLImageElement[] = [];

    const markSingleDone = () => {
      if (isCancelled) return;
      completed += 1;
      setPreloadedCount(completed);
      if (completed >= total) {
        setIsReady(true);
      }
    };

    const startPreloading = () => {
      if (isCancelled) return;

      urls.forEach((url) => {
        const img = new Image();
        img.decoding = 'async';
        activeImages.push(img);

        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          markSingleDone();
        };

        img.onload = settle;
        img.onerror = settle;
        img.src = url;

        if (img.complete) {
          settle();
        }
      });
    };

    const win = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number }
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    let idleHandle: number | null = null;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    if (typeof win.requestIdleCallback === 'function') {
      idleHandle = win.requestIdleCallback(startPreloading, { timeout: 150 });
    } else {
      timeoutHandle = setTimeout(startPreloading, 150);
    }

    return () => {
      isCancelled = true;
      if (idleHandle !== null && typeof win.cancelIdleCallback === 'function') {
        win.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== null) {
        clearTimeout(timeoutHandle);
      }
      activeImages.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [slides]);

  return { preloadedCount, isReady };
}

export default useHeroImagePreloader;
