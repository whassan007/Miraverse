/**
 * StructureBuilderV10 — Chunk-safe multi-tick structure placement & 3-stage landmark restoration
 * Owner: CX03
 */
import type { CountryId } from '../../../../../packages/content/schema.js';
import { REGIONS_V10 } from '../regions/index.js';

export type RestorationStageIndex = 0 | 1 | 2;

export interface BlockPlacementOp {
  x: number;
  y: number;
  z: number;
  blockId: string;
}

export class StructureBuilderV10 {
  private readonly maxBlocksPerTick: number;
  private readonly queue: BlockPlacementOp[] = [];
  private readonly activeStage = new Map<CountryId, RestorationStageIndex>();

  constructor(maxBlocksPerTick = 64) {
    this.maxBlocksPerTick = maxBlocksPerTick;
  }

  enqueueOperations(ops: BlockPlacementOp[]): number {
    this.queue.push(...ops);
    return this.queue.length;
  }

  processTick(applyBlock: (op: BlockPlacementOp) => void): number {
    const batch = this.queue.splice(0, this.maxBlocksPerTick);
    for (const op of batch) {
      applyBlock(op);
    }
    return batch.length;
  }

  getPendingCount(): number {
    return this.queue.length;
  }

  applyRestorationStage(country: CountryId, stage: RestorationStageIndex): { ops: BlockPlacementOp[]; descriptionEn: string } {
    const region = REGIONS_V10[country];
    const spec = region?.restorationStages.find((s) => s.stage === stage);
    if (!region || !spec) {
      return { ops: [], descriptionEn: 'unknown_stage' };
    }
    const ops: BlockPlacementOp[] = spec.blockPlacements.map((p) => ({
      x: region.restorationOrigin.x + p.offset.x,
      y: region.restorationOrigin.y + p.offset.y,
      z: region.restorationOrigin.z + p.offset.z,
      blockId: p.blockId,
    }));
    this.activeStage.set(country, stage);
    this.enqueueOperations(ops);
    return { ops, descriptionEn: spec.descriptionEn };
  }

  getRestorationStage(country: CountryId): RestorationStageIndex {
    return this.activeStage.get(country) ?? 0;
  }
}
