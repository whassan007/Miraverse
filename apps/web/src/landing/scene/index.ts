/**
 * Cinematic Homepage 3D Diorama Scene (`apps/web/src/landing/scene/index.ts`)
 * Owner: CX02 (Stage V4-02 code owner)
 * Renders a lightweight, rotatable 3D panorama of the MiraVerse world vignettes
 * with instant static fallback when WebGL is unavailable or reduced-motion is enabled.
 */
import * as BABYLON from '@babylonjs/core';
import { COUNTRIES, COUNTRY_META, type CountryCode } from '../../../../../packages/contracts/index';
import { createBabylonEngine } from '../../game3d/runtime/index';

export interface LandingDioramaController {
  focusCountry: (country: CountryCode) => void;
  setReducedMotion: (reduced: boolean) => void;
  dispose: () => void;
  mode: 'WebGL2' | 'WebGL1' | 'FallbackCanvas2D';
}

export function mountLandingDiorama(
  canvas: HTMLCanvasElement | null,
  options: { initialCountry?: CountryCode; reducedMotion?: boolean } = {}
): LandingDioramaController {
  const { engine, mode } = createBabylonEngine(canvas);
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.09, 0.16, 0.28, 1.0);

  const camera = new BABYLON.ArcRotateCamera(
    'landingCamera',
    -Math.PI / 2,
    Math.PI / 2.7,
    18,
    new BABYLON.Vector3(0, 1.6, 0),
    scene
  );

  const hemi = new BABYLON.HemisphericLight('landingHemi', new BABYLON.Vector3(0, 1, 0), scene);
  hemi.intensity = 0.9;
  const dir = new BABYLON.DirectionalLight('landingSun', new BABYLON.Vector3(-0.4, -0.8, 0.4), scene);
  dir.intensity = 1.25;

  const root = new BABYLON.TransformNode('dioramaRoot', scene);
  COUNTRIES.forEach((code, idx) => {
    const angle = (idx / COUNTRIES.length) * Math.PI * 2;
    const meta = COUNTRY_META[code];
    const island = BABYLON.MeshBuilder.CreateCylinder(
      `vignette_${code}`,
      { diameterTop: 4.4, diameterBottom: 3.2, height: 1.2, tessellation: 20 },
      scene
    );
    island.position.set(Math.cos(angle) * 6.5, 0.6, Math.sin(angle) * 6.5);
    const mat = new BABYLON.StandardMaterial(`vignetteMat_${code}`, scene);
    mat.diffuseColor = BABYLON.Color3.FromHexString(meta.primaryColorHex);
    mat.emissiveColor = BABYLON.Color3.FromHexString(meta.accentColorHex).scale(0.22);
    island.material = mat;
    island.parent = root;
  });

  let reduced = Boolean(options.reducedMotion);
  let targetAlpha = -Math.PI / 2;

  scene.onBeforeRenderObservable.add(() => {
    if (!reduced) {
      camera.alpha += (targetAlpha - camera.alpha) * 0.08 + 0.0015;
    } else {
      camera.alpha = targetAlpha;
    }
  });

  if (mode !== 'FallbackCanvas2D') {
    engine.runRenderLoop(() => {
      scene.render();
    });
  }

  return {
    mode,
    focusCountry: (country: CountryCode) => {
      const idx = COUNTRIES.indexOf(country);
      if (idx >= 0) {
        targetAlpha = -(idx / COUNTRIES.length) * Math.PI * 2 - Math.PI / 2;
      }
    },
    setReducedMotion: (val: boolean) => {
      reduced = val;
    },
    dispose: () => {
      engine.stopRenderLoop();
      scene.dispose();
      engine.dispose();
    },
  };
}
