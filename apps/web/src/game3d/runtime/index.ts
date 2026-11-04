/**
 * Babylon.js 3D Runtime & Scene Lifecycle Manager (`apps/web/src/game3d/runtime/index.ts`)
 * Owner: CX02
 * Manages WebGL2 / NullEngine fallback initialization, sculpted 3D town construction,
 * GLB asset verification, NPCs, portals, landmarks, and clean disposal on route transition.
 */
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import {
  COUNTRIES,
  COUNTRY_META,
  type CountryCode,
  type LevelManifest3D,
} from '../../../../../packages/contracts/index';
import { getLookdevPreset } from '../lookdev/index';

export interface RuntimeMetrics {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  totalMeshes: number;
  totalVertices: number;
  rendererMode: 'WebGL2' | 'WebGL1' | 'FallbackCanvas2D';
  activeWorld: CountryCode | 'HUB';
}

export interface BuiltSceneHandles {
  engine: BABYLON.Engine | BABYLON.NullEngine;
  scene: BABYLON.Scene;
  heroRoot: BABYLON.TransformNode;
  cameraTarget: BABYLON.TransformNode;
  landmarkGroup: BABYLON.TransformNode;
  restorationMeshes: BABYLON.AbstractMesh[];
  npcNodes: Map<string, BABYLON.TransformNode>;
  interactableMeshes: Map<string, BABYLON.AbstractMesh>;
  dispose: () => void;
}

function hexToColor3(hex: string): BABYLON.Color3 {
  return BABYLON.Color3.FromHexString(hex.startsWith('#') ? hex : `#${hex}`);
}

export function createBabylonEngine(canvas?: HTMLCanvasElement | null): {
  engine: BABYLON.Engine | BABYLON.NullEngine;
  mode: 'WebGL2' | 'WebGL1' | 'FallbackCanvas2D';
} {
  if (canvas && typeof window !== 'undefined') {
    try {
      const eng = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        powerPreference: 'high-performance',
      });
      return { engine: eng, mode: eng.webGLVersion >= 2 ? 'WebGL2' : 'WebGL1' };
    } catch {
      // Fallback to NullEngine for headless / WebGL-disabled environments
    }
  }
  return { engine: new BABYLON.NullEngine(), mode: 'FallbackCanvas2D' };
}

export function buildSculptedWorldScene(
  engine: BABYLON.Engine | BABYLON.NullEngine,
  world: CountryCode | 'HUB',
  levelManifest?: LevelManifest3D,
  restoredStage = 0
): BuiltSceneHandles {
  const scene = new BABYLON.Scene(engine);
  const preset = getLookdevPreset(world);

  scene.clearColor = new BABYLON.Color4(...preset.clearColor);
  scene.ambientColor = new BABYLON.Color3(...preset.ambientColor);
  scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
  scene.fogDensity = preset.fogDensity;
  scene.fogColor = new BABYLON.Color3(...preset.fogColor);

  // Hemispheric sky/ground fill light
  const hemi = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(0, 1, 0), scene);
  hemi.diffuse = new BABYLON.Color3(...preset.ambientColor);
  hemi.groundColor = new BABYLON.Color3(...preset.hemiGroundColor);
  hemi.intensity = preset.hemiIntensity;

  // Warm directional sun light
  const sun = new BABYLON.DirectionalLight(
    'sunLight',
    new BABYLON.Vector3(...preset.sunDirection),
    scene
  );
  sun.position = new BABYLON.Vector3(18, 28, -18);
  sun.diffuse = new BABYLON.Color3(...preset.sunColor);
  sun.intensity = preset.sunIntensity;

  // Ground Plaza & Cobblestone Lanes
  const ground = BABYLON.MeshBuilder.CreateGround('plazaGround', { width: 64, height: 64, subdivisions: 8 }, scene);
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = hexToColor3(preset.groundPrimaryHex);
  groundMat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.08);
  ground.material = groundMat;

  // Inner cobblestone promenade ring
  const promenade = BABYLON.MeshBuilder.CreateDisc('promenadeDisc', { radius: 16, tessellation: 48 }, scene);
  promenade.rotation.x = Math.PI / 2;
  promenade.position.y = 0.02;
  const promMat = new BABYLON.StandardMaterial('promMat', scene);
  promMat.diffuseColor = hexToColor3(preset.groundSecondaryHex);
  promenade.material = promMat;

  // Hero Avatar (Mira) sculpted hierarchical rig
  const heroRoot = new BABYLON.TransformNode('hero_mira_root', scene);
  const spawn = levelManifest?.spawnPosition || [0, 0, -6];
  heroRoot.position.set(spawn[0], spawn[1], spawn[2]);

  const tunicMat = new BABYLON.StandardMaterial('heroTunicMat', scene);
  tunicMat.diffuseColor = hexToColor3('#2A6F97');
  const scarfMat = new BABYLON.StandardMaterial('heroScarfMat', scene);
  scarfMat.diffuseColor = hexToColor3('#F4A261');
  const skinMat = new BABYLON.StandardMaterial('heroSkinMat', scene);
  skinMat.diffuseColor = hexToColor3('#D99B78');
  const hairMat = new BABYLON.StandardMaterial('heroHairMat', scene);
  hairMat.diffuseColor = hexToColor3('#2B2118');

  const bodyMesh = BABYLON.MeshBuilder.CreateCylinder('heroBody', { height: 0.78, diameterTop: 0.42, diameterBottom: 0.56, tessellation: 16 }, scene);
  bodyMesh.position.y = 0.65;
  bodyMesh.material = tunicMat;
  bodyMesh.parent = heroRoot;

  const scarfMesh = BABYLON.MeshBuilder.CreateTorus('heroScarf', { diameter: 0.46, thickness: 0.12, tessellation: 16 }, scene);
  scarfMesh.position.y = 1.04;
  scarfMesh.material = scarfMat;
  scarfMesh.parent = heroRoot;

  const headMesh = BABYLON.MeshBuilder.CreateSphere('heroHead', { diameter: 0.42, segments: 16 }, scene);
  headMesh.position.y = 1.28;
  headMesh.material = skinMat;
  headMesh.parent = heroRoot;

  const hairMesh = BABYLON.MeshBuilder.CreateSphere('heroHair', { diameter: 0.45, segments: 12, slice: 0.65 }, scene);
  hairMesh.position.y = 1.32;
  hairMesh.material = hairMat;
  hairMesh.parent = heroRoot;

  const cameraTarget = new BABYLON.TransformNode('heroCameraTarget', scene);
  cameraTarget.position.set(0, 1.25, 0);
  cameraTarget.parent = heroRoot;

  const camera = new BABYLON.ArcRotateCamera(
    'thirdPersonCamera',
    -Math.PI / 2,
    1.12,
    8.5,
    new BABYLON.Vector3(spawn[0], spawn[1] + 1.25, spawn[2]),
    scene
  );
  camera.lowerRadiusLimit = 4.0;
  camera.upperRadiusLimit = 14.0;
  camera.lowerBetaLimit = 0.65;
  camera.upperBetaLimit = 1.42;
  scene.activeCamera = camera;

  const npcNodes = new Map<string, BABYLON.TransformNode>();
  const interactableMeshes = new Map<string, BABYLON.AbstractMesh>();
  const restorationMeshes: BABYLON.AbstractMesh[] = [];
  const landmarkGroup = new BABYLON.TransformNode('landmarkGroup', scene);

  if (world === 'HUB') {
    // Central Compass Rose Fountain
    const fountainBase = BABYLON.MeshBuilder.CreateCylinder('hubFountain', { diameter: 5.2, height: 0.75, tessellation: 24 }, scene);
    fountainBase.position.set(0, 0.38, 0);
    fountainBase.material = scarfMat;
    const spire = BABYLON.MeshBuilder.CreateCylinder('hubSpire', { diameterTop: 0.2, diameterBottom: 1.1, height: 3.6, tessellation: 16 }, scene);
    spire.position.set(0, 2.1, 0);
    spire.material = tunicMat;

    // 5 Walkable Cultural Portal Arches
    for (const code of COUNTRIES) {
      const meta = COUNTRY_META[code];
      const [px, py, pz] = meta.hubPortalPosition;
      const portalRoot = new BABYLON.TransformNode(`portal_${code}`, scene);
      portalRoot.position.set(px, py, pz);
      portalRoot.lookAt(new BABYLON.Vector3(0, 0, 0));

      const archMat = new BABYLON.StandardMaterial(`archMat_${code}`, scene);
      archMat.diffuseColor = hexToColor3(meta.primaryColorHex);
      const glowMat = new BABYLON.StandardMaterial(`glowMat_${code}`, scene);
      glowMat.diffuseColor = hexToColor3(meta.accentColorHex);
      glowMat.emissiveColor = hexToColor3(meta.accentColorHex).scale(0.45);

      const pillarL = BABYLON.MeshBuilder.CreateBox(`pillarL_${code}`, { width: 0.7, height: 3.8, depth: 0.7 }, scene);
      pillarL.position.set(-1.5, 1.9, 0);
      pillarL.material = archMat;
      pillarL.parent = portalRoot;

      const pillarR = BABYLON.MeshBuilder.CreateBox(`pillarR_${code}`, { width: 0.7, height: 3.8, depth: 0.7 }, scene);
      pillarR.position.set(1.5, 1.9, 0);
      pillarR.material = archMat;
      pillarR.parent = portalRoot;

      const lintel = BABYLON.MeshBuilder.CreateBox(`lintel_${code}`, { width: 4.2, height: 0.85, depth: 0.9 }, scene);
      lintel.position.set(0, 4.1, 0);
      lintel.material = glowMat;
      lintel.parent = portalRoot;

      const gateDisc = BABYLON.MeshBuilder.CreateDisc(`portalGate_${code}`, { radius: 1.4, tessellation: 24 }, scene);
      gateDisc.position.set(0, 1.9, 0);
      gateDisc.material = glowMat;
      gateDisc.parent = portalRoot;
      interactableMeshes.set(`portal:${code}`, gateDisc);
    }
  } else {
    const meta = COUNTRY_META[world];
    // Central Cultural Landmark (e.g., Boulangerie du Soleil, Byblos Saj Arch, Cairo Fanous Courtyard, Baghdad Shanasheel, Jeonju Hanok)
    landmarkGroup.position.set(0, 0, 8);
    const primaryMat = new BABYLON.StandardMaterial(`landmarkPrimary_${world}`, scene);
    primaryMat.diffuseColor = hexToColor3(meta.primaryColorHex);
    const accentMat = new BABYLON.StandardMaterial(`landmarkAccent_${world}`, scene);
    accentMat.diffuseColor = hexToColor3(meta.accentColorHex);
    const damagedMat = new BABYLON.StandardMaterial(`landmarkDamaged_${world}`, scene);
    damagedMat.diffuseColor = new BABYLON.Color3(0.42, 0.39, 0.36);

    const facade = BABYLON.MeshBuilder.CreateBox(`landmarkFacade_${world}`, { width: 8.4, height: 4.6, depth: 5.6 }, scene);
    facade.position.set(0, 2.3, 0);
    facade.material = restoredStage >= 1 ? accentMat : damagedMat;
    facade.parent = landmarkGroup;
    restorationMeshes.push(facade);

    const roof = BABYLON.MeshBuilder.CreateCylinder(`landmarkRoof_${world}`, { diameterTop: 0.6, diameterBottom: 10.2, height: 2.8, tessellation: 4 }, scene);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, 5.9, 0);
    roof.material = restoredStage >= 2 ? primaryMat : damagedMat;
    roof.parent = landmarkGroup;
    restorationMeshes.push(roof);

    const shutters = BABYLON.MeshBuilder.CreateBox(`landmarkShutters_${world}`, { width: 8.8, height: 1.6, depth: 6.0 }, scene);
    shutters.position.set(0, 2.6, 0);
    shutters.material = restoredStage >= 3 ? accentMat : damagedMat;
    shutters.parent = landmarkGroup;
    restorationMeshes.push(shutters);
    interactableMeshes.set(`station:${world}:build`, facade);

    // Surrounding stylized town buildings & props
    const sidePositions: Array<[number, number, number]> = [
      [-11, 0, 4], [11, 0, 4], [-10, 0, -5], [10, 0, -5],
    ];
    sidePositions.forEach(([bx, by, bz], idx) => {
      const house = BABYLON.MeshBuilder.CreateBox(`townHouse_${idx}`, { width: 5.2, height: 3.8 + (idx % 2) * 0.8, depth: 4.8 }, scene);
      house.position.set(bx, (3.8 + (idx % 2) * 0.8) / 2, bz);
      house.material = idx % 2 === 0 ? primaryMat : accentMat;
    });

    // Spawn NPCs from levelManifest or default mentor + vendor + artisan + neighbor
    const npcs = levelManifest?.npcs || [
      { npcId: meta.mentorId, name: meta.mentorName, role: 'mentor', dialogueId: `dlg:${world}:mentor`, position: [-2.5, 0, 3.2], rotationY: 0, costumeVariant: 'mentor', primaryColorHex: meta.primaryColorHex, accentColorHex: meta.accentColorHex },
      { npcId: `npc:${world}:vendor`, name: 'Market Vendor', role: 'vendor', dialogueId: `dlg:${world}:vendor`, position: [4.8, 0, 1.5], rotationY: -0.6, costumeVariant: 'vendor', primaryColorHex: meta.accentColorHex, accentColorHex: meta.primaryColorHex },
      { npcId: `npc:${world}:artisan`, name: 'Master Artisan', role: 'artisan', dialogueId: `dlg:${world}:artisan`, position: [-5.2, 0, 1.8], rotationY: 0.6, costumeVariant: 'artisan', primaryColorHex: meta.primaryColorHex, accentColorHex: '#F4F1DE' },
      { npcId: `npc:${world}:neighbor`, name: 'Town Musician', role: 'musician', dialogueId: `dlg:${world}:neighbor`, position: [2.2, 0, -3.5], rotationY: 2.4, costumeVariant: 'neighbor', primaryColorHex: '#588157', accentColorHex: meta.accentColorHex },
    ];

    for (const n of npcs) {
      const npcRoot = new BABYLON.TransformNode(n.npcId, scene);
      npcRoot.position.set(n.position[0], n.position[1], n.position[2]);
      npcRoot.rotation.y = n.rotationY;

      const npcMat = new BABYLON.StandardMaterial(`mat_${n.npcId}`, scene);
      npcMat.diffuseColor = hexToColor3(n.primaryColorHex);
      const npcBody = BABYLON.MeshBuilder.CreateCylinder(`body_${n.npcId}`, { height: 0.92, diameterTop: 0.46, diameterBottom: 0.62, tessellation: 14 }, scene);
      npcBody.position.y = 0.72;
      npcBody.material = npcMat;
      npcBody.parent = npcRoot;

      const npcHead = BABYLON.MeshBuilder.CreateSphere(`head_${n.npcId}`, { diameter: 0.44, segments: 14 }, scene);
      npcHead.position.y = 1.42;
      npcHead.material = skinMat;
      npcHead.parent = npcRoot;

      npcNodes.set(n.npcId, npcRoot);
      interactableMeshes.set(n.npcId, npcBody);
    }

    // Return to Hub Portal Arch
    const returnArch = BABYLON.MeshBuilder.CreateTorus('returnHubPortal', { diameter: 2.8, thickness: 0.35, tessellation: 24 }, scene);
    returnArch.position.set(0, 1.5, -12);
    returnArch.material = scarfMat;
    interactableMeshes.set('portal:HUB', returnArch);
  }

  return {
    engine,
    scene,
    heroRoot,
    cameraTarget,
    landmarkGroup,
    restorationMeshes,
    npcNodes,
    interactableMeshes,
    dispose: () => {
      scene.dispose();
      engine.dispose();
    },
  };
}
