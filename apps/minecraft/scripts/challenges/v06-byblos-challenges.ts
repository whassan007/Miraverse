/**
 * MiraVerse v0.7 (Option A) — Minecraft Bedrock Native Five-Challenge Adapter (`CL11`)
 * Focuses on block-building restoration in Byblos plus data-driven expansion across EG, IQ, KR, FR.
 */
import type { BedrockPlayerProgressV06 } from '../core/v06-bootstrap';

export const ALLOWED_BYBLOS_RESTORATION_BLOCKS = new Set([
  'minecraft:smooth_sandstone',
  'minecraft:cut_sandstone',
  'minecraft:spruce_planks',
  'minecraft:lantern',
  'minecraft:brick_block',
  'minecraft:terracotta',
]);

export function verifyBedrockBlockPlacementV06(
  progress: BedrockPlayerProgressV06,
  blockTypeId: string,
  pos: [number, number, number],
  plotOrigin: [number, number, number] = [-200, 64, 0]
): { accepted: boolean; reason: string; updated: BedrockPlayerProgressV06 } {
  if (!ALLOWED_BYBLOS_RESTORATION_BLOCKS.has(blockTypeId)) {
    return { accepted: false, reason: 'DISALLOWED_BLOCK_TYPE', updated: progress };
  }
  const dx = Math.abs(pos[0] - plotOrigin[0]);
  const dy = Math.abs(pos[1] - plotOrigin[1]);
  const dz = Math.abs(pos[2] - plotOrigin[2]);
  if (dx > 24 || dy > 16 || dz > 24) {
    return { accepted: false, reason: 'OUTSIDE_DESIGNATED_BUILD_PLOT', updated: progress };
  }

  const nextCount = progress.restoredBlockCount + 1;
  const nextSteps = [...progress.completedSteps];
  let nextTokens = progress.bedrockMiraTokens;

  if (nextCount >= 6 && !nextSteps.includes('build')) {
    nextSteps.push('build');
    nextTokens += 30;
  }

  return {
    accepted: true,
    reason: 'BLOCK_RESTORATION_RECORDED',
    updated: {
      ...progress,
      restoredBlockCount: nextCount,
      completedSteps: nextSteps,
      bedrockMiraTokens: nextTokens,
      passportStampUnlocked: nextSteps.length >= 5,
    },
  };
}
