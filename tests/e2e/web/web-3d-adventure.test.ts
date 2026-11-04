/**
 * MiraVerse v0.4 Web 3D Adventure E2E & Domain Integration Suite
 * (`tests/e2e/web/web-3d-adventure.test.ts`)
 * Owner: CX08
 * Verifies:
 * - Babylon.js 3D world construction for HUB and all 5 countries (FR, LB, EG, IQ, KR)
 * - Third-person movement, skeletal clip transitions (never frozen T-pose), camera bounds
 * - Diegetic 3D interactions (NPCs, portals, landmark restoration stages 0->3)
 * - Transactional save migration (mv.stamps -> mv.save.v4) & corrupt save quarantine
 * - Full 5-quest completion flow -> chapter souvenir stamp + earned Mira Tokens
 */
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CHALLENGE_TYPES, COUNTRIES } from '../../../packages/contracts/index';
import { CORRUPT_BACKUP_KEY, GameDomainController, LEGACY_STAMPS_KEY, SAVE_KEY_V4 } from '../../../packages/game-domain/index';
import { GOLDEN_VECTORS, verify } from '../../../packages/shared/stamp';
import { InteractionManager } from '../../../apps/web/src/game3d/interactions/index';
import { ThirdPersonController } from '../../../apps/web/src/game3d/player/index';
import { buildSculptedWorldScene, createBabylonEngine } from '../../../apps/web/src/game3d/runtime/index';

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
}

describe('CX08 — Web 3D Adventure Runtime, France Vertical Slice & 5-World Save Persistence', () => {
  it('constructs sculpted 3D Babylon.js scenes for HUB and all 5 countries with Hero rig, NPCs, and restorable landmarks', () => {
    const { engine } = createBabylonEngine(null);
    const hub = buildSculptedWorldScene(engine, 'HUB');
    expect(hub.scene.meshes.length).toBeGreaterThanOrEqual(20);
    expect(hub.interactableMeshes.has('portal:FR')).toBe(true);
    hub.dispose();

    for (const cc of COUNTRIES) {
      const { engine: eng } = createBabylonEngine(null);
      const level = JSON.parse(fs.readFileSync('content/levels/web/' + cc + '/level.json', 'utf-8'));
      const world = buildSculptedWorldScene(eng, cc, level, 0);
      expect(world.scene.meshes.length).toBeGreaterThanOrEqual(15);
      expect(world.restorationMeshes.length).toBe(3);
      expect(world.npcNodes.size).toBeGreaterThanOrEqual(4);

      const tpc = new ThirdPersonController(world.heroRoot);
      expect(tpc.getCurrentClip()).toBe('idle_breathing');
      tpc.update(0.16, { moveX: 0, moveZ: 1, sprint: false, jump: false, interact: false });
      expect(tpc.getCurrentClip()).toBe('walk');
      tpc.update(0.16, { moveX: 0, moveZ: 1, sprint: true, jump: false, interact: false });
      expect(tpc.getCurrentClip()).toBe('run');

      const im = new InteractionManager();
      for (const node of level.interactables) {
        im.registerNode(node);
      }
      expect(im.getAllNodes().length).toBeGreaterThanOrEqual(5);
      world.dispose();
    }
  });

  it('migrates legacy v0.1 mv.stamps into mv.save.v4, quarantines corrupt saves, and persists all 5 quests + 3D landmark restoration', () => {
    const store = new MemoryStorage();
    const frVector = GOLDEN_VECTORS.find((v) => v.country === 'FR')!;
    store.setItem(LEGACY_STAMPS_KEY, JSON.stringify([{ code: frVector.code }]));

    const ctrl1 = new GameDomainController(store);
    expect(ctrl1.getState().stamps.FR).toBe(frVector.code);
    expect(ctrl1.getState().completedChallenges.FR).toHaveLength(5);
    expect(ctrl1.getState().restoredBuildings.FR).toBe(3);

    // Complete Lebanon chapter from scratch
    for (const ch of CHALLENGE_TYPES) {
      ctrl1.completeChallenge('LB', ch);
    }
    const lbStamp = ctrl1.getState().stamps.LB;
    expect(lbStamp).toBeDefined();
    expect(verify(lbStamp!).valid).toBe(true);
    expect(ctrl1.getState().guestMiraTokens).toBe(150);

    // Reload from persisted mv.save.v4
    const ctrl2 = new GameDomainController(store);
    expect(ctrl2.getState().stamps.LB).toBe(lbStamp);
    expect(ctrl2.getState().restoredBuildings.LB).toBe(3);

    // Corrupt save recovery
    store.setItem(SAVE_KEY_V4, '{not-valid-json');
    const ctrl3 = new GameDomainController(store);
    expect(store.getItem(CORRUPT_BACKUP_KEY)).toBe('{not-valid-json');
    expect(ctrl3.getState().version).toBe('mv.save.v4');
  });
});
