import { world, system } from '@minecraft/server';
import { COUNTRIES, type CountryId } from '../../../../packages/content/schema.js';
import {
  MINECRAFT_ALL_COUNTRIES,
  MINECRAFT_COUNTRY_DESTINATIONS,
  MINECRAFT_GEO_DESTINATIONS,
  getMinecraftGeoDestination,
  canTravelMinecraft,
  buildDestinationTerrainOps,
  buildAll21DestinationsTerrainOps,
  type MinecraftGeoDestination,
} from '../generated/geo-terrain.js';

export {
  MINECRAFT_ALL_COUNTRIES,
  MINECRAFT_COUNTRY_DESTINATIONS,
  MINECRAFT_GEO_DESTINATIONS,
  getMinecraftGeoDestination,
  canTravelMinecraft,
  buildDestinationTerrainOps,
  buildAll21DestinationsTerrainOps,
  type MinecraftGeoDestination,
};

export interface BlockPos {
  x: number;
  y: number;
  z: number;
}

export const WORLD_BUILT_PROP = 'mv:world_built';
export const LOBBY_ORIGIN: BlockPos = { x: 0, y: 100, z: 0 };

export const COUNTRY_BLOCKS: Record<CountryId, string> = {
  LB: 'minecraft:stone_bricks',
  EG: 'minecraft:sandstone',
  IQ: 'minecraft:terracotta',
  KR: 'minecraft:spruce_planks',
  FR: 'minecraft:quartz_block',
};

const MARKER_BLOCKS: Record<'spawn' | 'mentor' | 'build', string> = {
  spawn: 'minecraft:quartz_block',
  mentor: 'minecraft:terracotta',
  build: 'minecraft:stone_bricks',
};

export const spawns: Record<CountryId, BlockPos> = {
  LB: { x: 200, y: 100, z: 0 },
  EG: { x: 400, y: 100, z: 0 },
  IQ: { x: 600, y: 100, z: 0 },
  KR: { x: 800, y: 100, z: 0 },
  FR: { x: 1000, y: 100, z: 0 },
};

export const mentorSpots: Record<CountryId, BlockPos> = {
  LB: { x: 204, y: 100, z: 0 },
  EG: { x: 404, y: 100, z: 0 },
  IQ: { x: 604, y: 100, z: 0 },
  KR: { x: 804, y: 100, z: 0 },
  FR: { x: 1004, y: 100, z: 0 },
};

export const buildOrigins: Record<CountryId, BlockPos> = {
  LB: { x: 195, y: 100, z: 4 },
  EG: { x: 395, y: 100, z: 4 },
  IQ: { x: 595, y: 100, z: 4 },
  KR: { x: 795, y: 100, z: 4 },
  FR: { x: 995, y: 100, z: 4 },
};

export const countryGates: Record<CountryId, BlockPos> = {
  LB: { x: -8, y: 100, z: 8 },
  EG: { x: -4, y: 100, z: 8 },
  IQ: { x: 0, y: 100, z: 8 },
  KR: { x: 4, y: 100, z: 8 },
  FR: { x: 8, y: 100, z: 8 },
};

const readyAreas = new Set<CountryId>();
let activeBuildPromise: Promise<void> | null = null;

function safeSetBlock(
  dim: { getBlock?: (pos: BlockPos) => { setType?: (blockId: string) => void } | undefined; setBlockType?: (pos: BlockPos, blockId: string) => void },
  pos: BlockPos,
  blockId: string,
): boolean {
  try {
    if (typeof dim.setBlockType === 'function') {
      dim.setBlockType(pos, blockId);
      return true;
    }
    const block = dim.getBlock?.(pos);
    if (!block) return false;
    block.setType?.(blockId);
    return true;
  } catch {
    // Unloaded chunk or out-of-bounds block operation; skip safely.
    return false;
  }
}

function buildPlatformOps(center: BlockPos, radius: number, floorBlock: string, borderBlock: string): Array<{ pos: BlockPos; blockId: string }> {
  const ops: Array<{ pos: BlockPos; blockId: string }> = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dz = -radius; dz <= radius; dz++) {
      const isEdge = Math.abs(dx) === radius || Math.abs(dz) === radius;
      const x = center.x + dx;
      const z = center.z + dz;
      ops.push({
        pos: { x, y: center.y, z },
        blockId: isEdge ? borderBlock : floorBlock,
      });
      if (isEdge) {
        ops.push({
          pos: { x, y: center.y + 1, z },
          blockId: borderBlock,
        });
      }
    }
  }
  return ops;
}

function buildLobbyOps(): Array<{ pos: BlockPos; blockId: string }> {
  const ops = buildPlatformOps(LOBBY_ORIGIN, 10, 'minecraft:quartz_block', 'minecraft:stone_bricks');

  // Center airport beacon/terminal marker at (0, 100, 0)
  ops.push({ pos: { x: LOBBY_ORIGIN.x, y: LOBBY_ORIGIN.y, z: LOBBY_ORIGIN.z }, blockId: 'minecraft:quartz_block' });

  // Construct 5 country gates along the north side of the lobby
  COUNTRIES.forEach((cc, i) => {
    const gateX = -8 + i * 4;
    const gateZ = 8;
    const gateBlock = COUNTRY_BLOCKS[cc];
    const gateCenter: BlockPos = { x: gateX, y: LOBBY_ORIGIN.y, z: gateZ };
    countryGates[cc] = gateCenter;

    // Gate threshold pad
    ops.push({ pos: gateCenter, blockId: gateBlock });
    // Left and right gate pillars
    ops.push({ pos: { x: gateX - 1, y: LOBBY_ORIGIN.y + 1, z: gateZ }, blockId: gateBlock });
    ops.push({ pos: { x: gateX - 1, y: LOBBY_ORIGIN.y + 2, z: gateZ }, blockId: gateBlock });
    ops.push({ pos: { x: gateX + 1, y: LOBBY_ORIGIN.y + 1, z: gateZ }, blockId: gateBlock });
    ops.push({ pos: { x: gateX + 1, y: LOBBY_ORIGIN.y + 2, z: gateZ }, blockId: gateBlock });
    // Gate lintel arch
    ops.push({ pos: { x: gateX - 1, y: LOBBY_ORIGIN.y + 3, z: gateZ }, blockId: gateBlock });
    ops.push({ pos: { x: gateX, y: LOBBY_ORIGIN.y + 3, z: gateZ }, blockId: gateBlock });
    ops.push({ pos: { x: gateX + 1, y: LOBBY_ORIGIN.y + 3, z: gateZ }, blockId: gateBlock });
  });

  return ops;
}

function buildCountryPlazaOps(cc: CountryId, index: number): Array<{ pos: BlockPos; blockId: string }> {
  const centerX = 200 * (index + 1);
  const center: BlockPos = { x: centerX, y: 100, z: 0 };
  const themeBlock = COUNTRY_BLOCKS[cc];
  const borderBlock = themeBlock === 'minecraft:stone_bricks' ? 'minecraft:quartz_block' : 'minecraft:stone_bricks';

  const ops = buildPlatformOps(center, 8, themeBlock, borderBlock);

  const spawnPos = spawns[cc];
  const mentorPos = mentorSpots[cc];
  const buildOriginPos = buildOrigins[cc];

  // Mark spawn, mentor spot, and build origin distinctly on the plaza
  ops.push({ pos: { x: spawnPos.x, y: spawnPos.y, z: spawnPos.z }, blockId: MARKER_BLOCKS.spawn });
  ops.push({ pos: { x: mentorPos.x, y: mentorPos.y, z: mentorPos.z }, blockId: MARKER_BLOCKS.mentor });
  ops.push({ pos: { x: buildOriginPos.x, y: buildOriginPos.y, z: buildOriginPos.z }, blockId: MARKER_BLOCKS.build });

  // Frame the build origin corner so players can see where blueprints start
  ops.push({ pos: { x: buildOriginPos.x - 1, y: buildOriginPos.y, z: buildOriginPos.z - 1 }, blockId: themeBlock });
  ops.push({ pos: { x: buildOriginPos.x + 1, y: buildOriginPos.y, z: buildOriginPos.z - 1 }, blockId: themeBlock });
  ops.push({ pos: { x: buildOriginPos.x - 1, y: buildOriginPos.y, z: buildOriginPos.z + 1 }, blockId: themeBlock });

  return ops;
}

function scheduleNextTick(fn: () => void): void {
  if (typeof system?.runTimeout === 'function') {
    system.runTimeout(fn, 1);
  } else if (typeof system?.run === 'function') {
    system.run(fn);
  } else {
    fn();
  }
}

export function isAreaReady(cc: CountryId): boolean {
  if (!COUNTRIES.includes(cc)) {
    return false;
  }

  try {
    if (world?.getDynamicProperty?.(WORLD_BUILT_PROP) === true) {
      readyAreas.add(cc);
    }
  } catch {
    // Dynamic property lookup may fail if world is not ready.
  }

  if (!readyAreas.has(cc)) {
    return false;
  }

  try {
    const dim = world?.getDimension?.('overworld');
    if (dim && typeof dim.getBlock === 'function') {
      const block = dim.getBlock(spawns[cc]);
      if (!block) {
        return false;
      }
    }
  } catch {
    // Chunk containing the country spawn is currently unloaded.
    return false;
  }

  return true;
}

export async function buildWorld(): Promise<void> {
  try {
    if (world?.getDynamicProperty?.(WORLD_BUILT_PROP) === true) {
      for (const cc of COUNTRIES) {
        readyAreas.add(cc);
      }
      return;
    }
  } catch {
    // Proceed with build if property read fails.
  }

  if (activeBuildPromise) {
    return activeBuildPromise;
  }

  activeBuildPromise = new Promise<void>((resolve) => {
    let dim: ReturnType<typeof world.getDimension> | undefined;
    try {
      dim = world?.getDimension?.('overworld');
    } catch {
      dim = undefined;
    }

    const stages: Array<{ cc?: CountryId; ops: Array<{ pos: BlockPos; blockId: string }> }> = [
      { ops: buildLobbyOps() },
      ...COUNTRIES.map((cc, idx) => ({
        cc,
        ops: buildCountryPlazaOps(cc, idx),
      })),
      ...buildAll21DestinationsTerrainOps().map((stage: { ops: Array<{ pos: BlockPos; blockId: string }> }) => ({
        ops: stage.ops,
      })),
    ];

    const MAX_BLOCKS_PER_TICK = 128;
    let stageIndex = 0;
    let opIndex = 0;

    const step = (): void => {
      if (stageIndex >= stages.length) {
        try {
          world?.setDynamicProperty?.(WORLD_BUILT_PROP, true);
        } catch {
          // Ignore dynamic property persistence errors in restricted test environments.
        }
        activeBuildPromise = null;
        resolve();
        return;
      }

      const currentStage = stages[stageIndex];
      const endOp = Math.min(opIndex + MAX_BLOCKS_PER_TICK, currentStage.ops.length);

      if (dim) {
        for (let i = opIndex; i < endOp; i++) {
          const op = currentStage.ops[i];
          safeSetBlock(dim, op.pos, op.blockId);
        }
      }

      opIndex = endOp;
      if (opIndex >= currentStage.ops.length) {
        if (currentStage.cc) {
          readyAreas.add(currentStage.cc);
        }
        stageIndex++;
        opIndex = 0;
      }

      scheduleNextTick(step);
    };

    scheduleNextTick(step);
  });

  return activeBuildPromise;
}
