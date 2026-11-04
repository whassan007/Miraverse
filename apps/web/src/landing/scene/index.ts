/**
 * Deprecated Homepage 3D Diorama Stub (`apps/web/src/landing/scene/index.ts`)
 * Owner: CX02 (P0 Visual Replacement)
 * All primitive cylinder geometry (`MeshBuilder.CreateCylinder`) has been removed.
 * The homepage renders the painted cinematic Byblos Harbor artwork (`/art/p0/hero-byblos-desktop.jpg`).
 */
import type { CountryCode } from '../../../../../packages/contracts/index';

export interface LandingDioramaController {
  focusCountry: (country: CountryCode) => void;
  setReducedMotion: (reduced: boolean) => void;
  dispose: () => void;
  mode: 'StaticCinematicArtwork';
}

export function mountLandingDiorama(): LandingDioramaController {
  return {
    mode: 'StaticCinematicArtwork',
    focusCountry: () => {},
    setReducedMotion: () => {},
    dispose: () => {},
  };
}
