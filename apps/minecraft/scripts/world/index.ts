import type { CountryId } from '../../../../packages/content/schema.js';

export const spawns: Partial<Record<CountryId, { x: number; y: number; z: number }>> = {};
export const mentorSpots: Partial<Record<CountryId, { x: number; y: number; z: number }>> = {};
export const buildOrigins: Partial<Record<CountryId, { x: number; y: number; z: number }>> = {};

export async function buildWorld(): Promise<void> {}
