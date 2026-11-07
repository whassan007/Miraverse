/**
 * Places a list of block fills, waiting for chunks to load. Retrying a failed fill on every
 * script step starved the server of time on a real Bedrock server, so a fill that hits
 * unloaded chunks now waits a full second before trying again. Progress goes to the log.
 */
import { BlockVolume, UnloadedChunksError, system, world } from '@minecraft/server';

const RETRY_TICKS = 20;
const MAX_WAIT_TICKS = 6000;
const FILLS_PER_TICK = 16;
const PROGRESS_EVERY = 200;

export type PackedFill = [number, number, number, number, number, number, number];

export interface FillJob {
  label: string;
  areaName: string;
  bounds: { min: number[]; max: number[] };
  palette: string[];
  packedFills: PackedFill[];
}

const sleep = (ticks: number) => new Promise<void>((resolve) => system.runTimeout(() => resolve(), ticks));

/** Returns how many fills failed. Zero means everything was placed. */
export async function runFills(job: FillJob): Promise<number> {
  const dimension = world.getDimension('overworld');
  const { min, max } = job.bounds;
  try {
    const result = dimension.runCommand(
      `tickingarea add ${min[0]} ${min[1]} ${min[2]} ${max[0]} ${max[1]} ${max[2]} ${job.areaName} true`
    );
    console.warn(`[build] ${job.label}: ticking area result ${result.successCount}`);
  } catch (error) {
    // It can already exist from an earlier attempt, so carry on and let the fills decide.
    console.warn(`[build] ${job.label}: ticking area not added: ${error}`);
  }

  let failed = 0;
  let waits = 0;
  for (let i = 0; i < job.packedFills.length; i++) {
    const [ax, ay, az, bx, by, bz, blockIndex] = job.packedFills[i];
    const block = job.palette[blockIndex];
    const deadline = system.currentTick + MAX_WAIT_TICKS;
    for (;;) {
      try {
        dimension.fillBlocks(new BlockVolume({ x: ax, y: ay, z: az }, { x: bx, y: by, z: bz }), block);
        break;
      } catch (error) {
        if (error instanceof UnloadedChunksError && system.currentTick < deadline) {
          waits += 1;
          if (waits % 30 === 1) console.warn(`[build] ${job.label}: waiting for chunks at fill ${i}: ${error.message}`);
          await sleep(RETRY_TICKS);
          continue;
        }
        failed += 1;
        console.warn(`[build] ${job.label}: fill ${i} failed for ${block}: ${error}`);
        break;
      }
    }
    if (i % FILLS_PER_TICK === FILLS_PER_TICK - 1) await sleep(1);
    if (i % PROGRESS_EVERY === PROGRESS_EVERY - 1) console.warn(`[build] ${job.label}: ${i + 1}/${job.packedFills.length} fills`);
  }
  console.warn(`[build] ${job.label}: finished at tick ${system.currentTick} with ${failed} failed`);
  return failed;
}

/** Releases a ticking area after a successful build, so it doesn't hold chunks loaded forever. */
export function releaseArea(areaName: string): void {
  try {
    world.getDimension('overworld').runCommand(`tickingarea remove ${areaName}`);
  } catch {
    // Already gone.
  }
}
