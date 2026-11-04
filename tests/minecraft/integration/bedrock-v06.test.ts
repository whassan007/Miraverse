import { describe, expect, it } from 'vitest';
import { createInitialBedrockProgress } from '../../../apps/minecraft/scripts/core/v06-bootstrap';
import { verifyBedrockBlockPlacementV06 } from '../../../apps/minecraft/scripts/challenges/v06-byblos-challenges';

describe('CX12 — Minecraft Bedrock Companion Manifest, Plot Boundaries & Block-Building Restoration', () => {
  it('validates allowed Byblos sandstone blocks inside plot bounds and awards Bedrock-local tokens after 6 placements', () => {
    let state = createInitialBedrockProgress('LB');
    const outOfBounds = verifyBedrockBlockPlacementV06(state, 'minecraft:smooth_sandstone', [500, 64, 500]);
    expect(outOfBounds.accepted).toBe(false);
    expect(outOfBounds.reason).toBe('OUTSIDE_DESIGNATED_BUILD_PLOT');

    const disallowed = verifyBedrockBlockPlacementV06(state, 'minecraft:tnt', [-200, 65, 0]);
    expect(disallowed.accepted).toBe(false);
    expect(disallowed.reason).toBe('DISALLOWED_BLOCK_TYPE');

    for (let i = 0; i < 6; i++) {
      const res = verifyBedrockBlockPlacementV06(state, 'minecraft:smooth_sandstone', [-200 + i, 65, 0]);
      expect(res.accepted).toBe(true);
      state = res.updated;
    }
    expect(state.completedSteps).toContain('build');
    expect(state.bedrockMiraTokens).toBe(30);
  });
});
