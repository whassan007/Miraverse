/**
 * Web 3D Shader & Look-Dev Presets (`apps/web/src/game3d/lookdev/index.ts`)
 * Owner: AG02
 * Provides per-country painterly PBR/toon hybrid lighting, atmospheric fog,
 * sky dome colors, and shadow configurations for Babylon.js scenes.
 */
import type { CountryCode } from '../../../../../packages/contracts/index';

export interface LookdevPreset {
  id: string;
  world: CountryCode | 'HUB';
  clearColor: [number, number, number, number];
  ambientColor: [number, number, number];
  sunDirection: [number, number, number];
  sunColor: [number, number, number];
  sunIntensity: number;
  hemiGroundColor: [number, number, number];
  hemiIntensity: number;
  fogDensity: number;
  fogColor: [number, number, number];
  accentLightColor: [number, number, number];
  groundPrimaryHex: string;
  groundSecondaryHex: string;
}

export const LOOKDEV_PRESETS: Record<CountryCode | 'HUB', LookdevPreset> = {
  HUB: {
    id: 'lookdev:HUB',
    world: 'HUB',
    clearColor: [0.14, 0.23, 0.38, 1.0],
    ambientColor: [0.95, 0.91, 0.82],
    sunDirection: [-0.45, -0.82, 0.35],
    sunColor: [1.0, 0.94, 0.82],
    sunIntensity: 1.35,
    hemiGroundColor: [0.42, 0.36, 0.3],
    hemiIntensity: 0.78,
    fogDensity: 0.008,
    fogColor: [0.92, 0.85, 0.76],
    accentLightColor: [0.96, 0.72, 0.32],
    groundPrimaryHex: '#D8CFC4',
    groundSecondaryHex: '#B7A99A',
  },
  FR: {
    id: 'lookdev:FR',
    world: 'FR',
    clearColor: [0.23, 0.43, 0.65, 1.0],
    ambientColor: [0.96, 0.9, 0.82],
    sunDirection: [-0.5, -0.8, 0.3],
    sunColor: [1.0, 0.92, 0.78],
    sunIntensity: 1.35,
    hemiGroundColor: [0.48, 0.38, 0.32],
    hemiIntensity: 0.8,
    fogDensity: 0.009,
    fogColor: [0.95, 0.89, 0.81],
    accentLightColor: [0.95, 0.68, 0.25],
    groundPrimaryHex: '#C5B4A2',
    groundSecondaryHex: '#8E7F70',
  },
  LB: {
    id: 'lookdev:LB',
    world: 'LB',
    clearColor: [0.16, 0.56, 0.68, 1.0],
    ambientColor: [0.98, 0.94, 0.86],
    sunDirection: [-0.35, -0.88, 0.28],
    sunColor: [1.0, 0.96, 0.86],
    sunIntensity: 1.45,
    hemiGroundColor: [0.55, 0.48, 0.38],
    hemiIntensity: 0.85,
    fogDensity: 0.006,
    fogColor: [0.92, 0.94, 0.95],
    accentLightColor: [0.94, 0.55, 0.24],
    groundPrimaryHex: '#E6CCB2',
    groundSecondaryHex: '#1E7A68',
  },
  EG: {
    id: 'lookdev:EG',
    world: 'EG',
    clearColor: [0.15, 0.2, 0.36, 1.0],
    ambientColor: [0.92, 0.78, 0.62],
    sunDirection: [-0.6, -0.65, 0.4],
    sunColor: [0.98, 0.76, 0.45],
    sunIntensity: 1.1,
    hemiGroundColor: [0.42, 0.28, 0.22],
    hemiIntensity: 0.72,
    fogDensity: 0.01,
    fogColor: [0.28, 0.24, 0.38],
    accentLightColor: [0.98, 0.75, 0.22],
    groundPrimaryHex: '#D4A373',
    groundSecondaryHex: '#9C6644',
  },
  IQ: {
    id: 'lookdev:IQ',
    world: 'IQ',
    clearColor: [0.2, 0.36, 0.48, 1.0],
    ambientColor: [0.95, 0.85, 0.72],
    sunDirection: [-0.52, -0.75, 0.38],
    sunColor: [1.0, 0.84, 0.58],
    sunIntensity: 1.28,
    hemiGroundColor: [0.5, 0.35, 0.25],
    hemiIntensity: 0.78,
    fogDensity: 0.008,
    fogColor: [0.92, 0.78, 0.62],
    accentLightColor: [0.23, 0.65, 0.73],
    groundPrimaryHex: '#C68B59',
    groundSecondaryHex: '#3AA6B9',
  },
  KR: {
    id: 'lookdev:KR',
    world: 'KR',
    clearColor: [0.22, 0.3, 0.45, 1.0],
    ambientColor: [0.94, 0.88, 0.86],
    sunDirection: [-0.42, -0.8, 0.4],
    sunColor: [0.98, 0.88, 0.82],
    sunIntensity: 1.22,
    hemiGroundColor: [0.38, 0.42, 0.36],
    hemiIntensity: 0.76,
    fogDensity: 0.008,
    fogColor: [0.88, 0.82, 0.78],
    accentLightColor: [0.85, 0.42, 0.44],
    groundPrimaryHex: '#D8C3A5',
    groundSecondaryHex: '#3D405B',
  },
};

export function getLookdevPreset(world: CountryCode | 'HUB'): LookdevPreset {
  return LOOKDEV_PRESETS[world] || LOOKDEV_PRESETS.HUB;
}
