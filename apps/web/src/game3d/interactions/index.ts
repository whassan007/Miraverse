/**
 * 3D World Interaction System (`apps/web/src/game3d/interactions/index.ts`)
 * Owner: CX05
 * Implements proximity detection, pickable objects, interactable state transitions
 * (canInteract, interact, state, visualState) without relying on UI state.
 */
import type { InteractableNode3D } from '../../../../../packages/contracts/index';

export type InteractableRuntimeState = 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'LOCKED';

export interface WorldInteractable {
  spec: InteractableNode3D;
  state: InteractableRuntimeState;
  visualState: 'default' | 'highlighted' | 'restored' | 'collected';
  canInteract: (playerPos: [number, number, number]) => boolean;
  interact: () => { ok: boolean; interactableId: string; kind: InteractableNode3D['kind']; nextState: InteractableRuntimeState };
}

export class InteractionManager {
  private nodes = new Map<string, WorldInteractable>();

  registerNode(spec: InteractableNode3D): WorldInteractable {
    const item: WorldInteractable = {
      spec,
      state: 'AVAILABLE',
      visualState: 'default',
      canInteract: (playerPos: [number, number, number]) => {
        if (item.state === 'LOCKED') return false;
        const dx = playerPos[0] - spec.position[0];
        const dz = playerPos[2] - spec.position[2];
        return Math.hypot(dx, dz) <= (spec.interactionRadius || 3.2);
      },
      interact: () => {
        if (item.state === 'LOCKED') {
          return { ok: false, interactableId: spec.interactableId, kind: spec.kind, nextState: item.state };
        }
        item.state = spec.kind === 'gather_prop' ? 'COMPLETED' : 'ACTIVE';
        item.visualState = spec.kind === 'gather_prop' ? 'collected' : spec.kind === 'build_site' ? 'restored' : 'highlighted';
        return { ok: true, interactableId: spec.interactableId, kind: spec.kind, nextState: item.state };
      },
    };
    this.nodes.set(spec.interactableId, item);
    return item;
  }

  getNearestInteractable(playerPos: [number, number, number]): WorldInteractable | null {
    let best: WorldInteractable | null = null;
    let bestDist = Infinity;
    for (const node of this.nodes.values()) {
      if (!node.canInteract(playerPos)) continue;
      const dx = playerPos[0] - node.spec.position[0];
      const dz = playerPos[2] - node.spec.position[2];
      const dist = Math.hypot(dx, dz);
      if (dist < bestDist) {
        bestDist = dist;
        best = node;
      }
    }
    return best;
  }

  getAllNodes(): WorldInteractable[] {
    return Array.from(this.nodes.values());
  }
}
