import type { Challenge, Lang, Pack } from '../../../../../packages/content/schema';

export interface SceneData { pack: Pack; challenge: Challenge; lang: Lang }
export interface ChallengeDone { challengeId: string }
export const SCENE_KEYS = ['globe', 'cook', 'build', 'gather', 'trade', 'word'] as const;
export type SceneKey = typeof SCENE_KEYS[number];

/** Deterministic WGS84 equirectangular projection, with north at the top. */
export function projectWGS84(lat: number, lon: number, width: number, height: number) {
  if (![lat, lon, width, height].every(Number.isFinite) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || width < 0 || height < 0) {
    throw new RangeError('Expected valid WGS84 coordinates and nonnegative canvas dimensions.');
  }
  return { x: ((lon + 180) / 360) * width, y: ((90 - lat) / 180) * height };
}

export function isChallengeDone(value: unknown): value is ChallengeDone {
  return typeof value === 'object' && value !== null && 'challengeId' in value && typeof value.challengeId === 'string';
}
