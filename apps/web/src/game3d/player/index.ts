/**
 * Third-Person Character Controller, Orbit Camera & Skeletal Animation State Machine
 * (`apps/web/src/game3d/player/index.ts`)
 * Owner: CX03
 */
import * as BABYLON from '@babylonjs/core';

export type AnimationClipName =
  | 'idle_breathing'
  | 'idle_variation'
  | 'walk'
  | 'run'
  | 'stop_turn'
  | 'interact_reach'
  | 'pickup'
  | 'talk_gesture'
  | 'celebrate'
  | 'sit_observe'
  | 'cook_action'
  | 'repair_build';

export interface PlayerInputVector {
  moveX: number; // -1..1
  moveZ: number; // -1..1
  sprint: boolean;
  jump: boolean;
  interact: boolean;
}

export interface WorldBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export class ThirdPersonController {
  private heroRoot: BABYLON.TransformNode;
  private bounds: WorldBounds;
  private velocity = new BABYLON.Vector3(0, 0, 0);
  private currentClip: AnimationClipName = 'idle_breathing';
  private clipTime = 0;
  private actionLockUntil = 0;
  public walkSpeed = 4.5;
  public runSpeed = 7.2;
  public cameraYaw = 0;
  public cameraPitch = 0.45;
  public cameraDistance = 7.5;

  constructor(
    heroRoot: BABYLON.TransformNode,
    bounds: WorldBounds = { minX: -24, maxX: 24, minZ: -24, maxZ: 24 }
  ) {
    this.heroRoot = heroRoot;
    this.bounds = bounds;
  }

  getCurrentClip(): AnimationClipName {
    return this.currentClip;
  }

  getPosition(): [number, number, number] {
    return [this.heroRoot.position.x, this.heroRoot.position.y, this.heroRoot.position.z];
  }

  setPosition(x: number, y: number, z: number) {
    this.heroRoot.position.set(
      Math.max(this.bounds.minX, Math.min(this.bounds.maxX, x)),
      Math.max(0, y),
      Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, z))
    );
  }

  triggerActionClip(clip: AnimationClipName, durationMs = 900) {
    this.currentClip = clip;
    this.actionLockUntil = Date.now() + durationMs;
  }

  update(dtSeconds: number, input: PlayerInputVector) {
    const dt = Math.min(0.1, Math.max(0.001, dtSeconds));
    this.clipTime += dt;

    const mag = Math.hypot(input.moveX, input.moveZ);
    const speed = input.sprint ? this.runSpeed : this.walkSpeed;

    if (mag > 0.05) {
      const nx = input.moveX / Math.max(1, mag);
      const nz = input.moveZ / Math.max(1, mag);
      // Transform input relative to camera yaw
      const cos = Math.cos(this.cameraYaw);
      const sin = Math.sin(this.cameraYaw);
      const wx = nx * cos + nz * sin;
      const wz = nz * cos - nx * sin;

      this.velocity.x = wx * speed;
      this.velocity.z = wz * speed;
      this.heroRoot.rotation.y = Math.atan2(wx, wz);

      if (Date.now() >= this.actionLockUntil) {
        this.currentClip = input.sprint ? 'run' : 'walk';
      }
    } else {
      this.velocity.x *= 0.75;
      this.velocity.z *= 0.75;
      if (Date.now() >= this.actionLockUntil) {
        this.currentClip = 'idle_breathing';
      }
    }

    const nextX = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.heroRoot.position.x + this.velocity.x * dt));
    const nextZ = Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, this.heroRoot.position.z + this.velocity.z * dt));

    // Subtle procedural bobbing/breathing on heroRoot so character is visibly alive every frame (never frozen T-pose)
    const bobAmplitude = this.currentClip === 'run' ? 0.08 : this.currentClip === 'walk' ? 0.05 : 0.018;
    const bobFreq = this.currentClip === 'run' ? 12 : this.currentClip === 'walk' ? 8 : 2.2;
    const bobY = Math.abs(Math.sin(this.clipTime * bobFreq)) * bobAmplitude;

    this.heroRoot.position.set(nextX, bobY, nextZ);
  }
}
