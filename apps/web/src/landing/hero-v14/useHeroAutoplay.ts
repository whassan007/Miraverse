import { useCallback, useEffect, useRef, useState } from 'react';

export type HeroCountryCode = 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';

export const HERO_SEQUENCE: readonly HeroCountryCode[] = ['LB', 'IQ', 'EG', 'FR', 'KR'] as const;

export interface UseHeroAutoplayOptions {
  initialCountry?: HeroCountryCode;
  cycleDurationMs?: number;
  reducedMotion?: boolean;
}

export interface UseHeroAutoplayResult {
  selectedCountry: HeroCountryCode;
  previousCountry: HeroCountryCode;
  slideIndex: number;
  isPlaying: boolean;
  isPausedByHoverOrFocus: boolean;
  progressPct: number;
  selectCountry: (code: HeroCountryCode, pauseAutoplay?: boolean) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  togglePlayPause: () => void;
  setHoverOrFocusPause: (paused: boolean) => void;
}

const DEFAULT_CYCLE_DURATION_MS = 5200;
const PROGRESS_TICK_MS = 100;

export function useHeroAutoplay(options: UseHeroAutoplayOptions = {}): UseHeroAutoplayResult {
  const {
    initialCountry = 'LB',
    cycleDurationMs = DEFAULT_CYCLE_DURATION_MS,
    reducedMotion = false,
  } = options;

  const initialSlideIndex = Math.max(0, HERO_SEQUENCE.indexOf(initialCountry));

  const [selectedCountry, setSelectedCountry] = useState<HeroCountryCode>(
    HERO_SEQUENCE[initialSlideIndex] ?? 'LB'
  );
  const [previousCountry, setPreviousCountry] = useState<HeroCountryCode>(
    HERO_SEQUENCE[initialSlideIndex] ?? 'LB'
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(() => !reducedMotion);
  const [isPausedByHoverOrFocus, setIsPausedByHoverOrFocus] = useState<boolean>(false);
  const [progressPct, setProgressPct] = useState<number>(0);

  const elapsedMsRef = useRef<number>(0);
  const selectedCountryRef = useRef<HeroCountryCode>(selectedCountry);
  selectedCountryRef.current = selectedCountry;

  const slideIndex = Math.max(0, HERO_SEQUENCE.indexOf(selectedCountry));

  const transitionToCountry = useCallback((nextCode: HeroCountryCode) => {
    setSelectedCountry((current) => {
      if (current !== nextCode) {
        setPreviousCountry(current);
      }
      return nextCode;
    });
    elapsedMsRef.current = 0;
    setProgressPct(0);
  }, []);

  const selectCountry = useCallback(
    (code: HeroCountryCode, pauseAutoplay = false) => {
      if (!HERO_SEQUENCE.includes(code)) {
        return;
      }
      transitionToCountry(code);
      if (pauseAutoplay) {
        setIsPlaying(false);
      }
    },
    [transitionToCountry]
  );

  const nextSlide = useCallback(() => {
    const currentIndex = Math.max(0, HERO_SEQUENCE.indexOf(selectedCountryRef.current));
    const nextIndex = (currentIndex + 1) % HERO_SEQUENCE.length;
    transitionToCountry(HERO_SEQUENCE[nextIndex]);
  }, [transitionToCountry]);

  const prevSlide = useCallback(() => {
    const currentIndex = Math.max(0, HERO_SEQUENCE.indexOf(selectedCountryRef.current));
    const prevIndex = (currentIndex - 1 + HERO_SEQUENCE.length) % HERO_SEQUENCE.length;
    transitionToCountry(HERO_SEQUENCE[prevIndex]);
  }, [transitionToCountry]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => {
      const nextPlaying = !prev;
      if (!nextPlaying) {
        elapsedMsRef.current = 0;
        setProgressPct(0);
      }
      return nextPlaying;
    });
  }, []);

  const setHoverOrFocusPause = useCallback((paused: boolean) => {
    setIsPausedByHoverOrFocus(paused);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setIsPlaying(false);
      elapsedMsRef.current = 0;
      setProgressPct(0);
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (!isPlaying || isPausedByHoverOrFocus || reducedMotion) {
      return;
    }

    const safeCycleDuration = Math.max(PROGRESS_TICK_MS, cycleDurationMs);

    const intervalId = window.setInterval(() => {
      elapsedMsRef.current += PROGRESS_TICK_MS;

      if (elapsedMsRef.current >= safeCycleDuration) {
        elapsedMsRef.current = 0;
        setProgressPct(0);
        const currentIndex = Math.max(0, HERO_SEQUENCE.indexOf(selectedCountryRef.current));
        const nextIndex = (currentIndex + 1) % HERO_SEQUENCE.length;
        const nextCode = HERO_SEQUENCE[nextIndex];
        setPreviousCountry(selectedCountryRef.current);
        setSelectedCountry(nextCode);
      } else {
        const nextPct = Math.min(100, Math.round((elapsedMsRef.current / safeCycleDuration) * 100));
        setProgressPct(nextPct);
      }
    }, PROGRESS_TICK_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPlaying, isPausedByHoverOrFocus, reducedMotion, cycleDurationMs]);

  return {
    selectedCountry,
    previousCountry,
    slideIndex,
    isPlaying: isPlaying && !reducedMotion,
    isPausedByHoverOrFocus,
    progressPct: reducedMotion ? 0 : progressPct,
    selectCountry,
    nextSlide,
    prevSlide,
    togglePlayPause,
    setHoverOrFocusPause,
  };
}
