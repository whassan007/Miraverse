/** Turns a compiled region into ordered Minecraft block fills. No engine imports, so it is testable. */
import { PHOENICIA } from './gate.js';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface FillOp {
  min: Vec3;
  max: Vec3;
  block: string;
}

const BARRIER_HEIGHT = 24;

export function regionOrigin(regionId: string): Vec3 {
  const [x, z] = PHOENICIA.regions[regionId].origins.minecraft;
  return { x, y: PHOENICIA.projection.minecraftSeaLevelY, z };
}

export function planRegion(regionId: string): FillOp[] {
  const region = PHOENICIA.regions[regionId];
  const { seabedY, seaLevelY } = PHOENICIA.projection;
  const o = regionOrigin(regionId);
  const b = region.bounds;
  const fill = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, block: string): FillOp => ({
    min: { x: o.x + x0, y: o.y + y0, z: o.z + z0 },
    max: { x: o.x + x1, y: o.y + y1, z: o.z + z1 },
    block,
  });

  const ops: FillOp[] = [fill(-b, seabedY, -b, b, seabedY, b, 'minecraft:sand')];
  for (let y = seabedY + 1; y <= seaLevelY; y++) ops.push(fill(-b, y, -b, b, y, b, 'minecraft:water'));

  // Invisible walls hold the raised sea in and keep players inside the region.
  const top = seaLevelY + BARRIER_HEIGHT;
  const edge = b + 1;
  ops.push(
    fill(-edge, seabedY, -edge, edge, top, -edge, 'minecraft:barrier'),
    fill(-edge, seabedY, edge, edge, top, edge, 'minecraft:barrier'),
    fill(-edge, seabedY, -edge, -edge, top, edge, 'minecraft:barrier'),
    fill(edge, seabedY, -edge, edge, top, edge, 'minecraft:barrier')
  );

  for (const row of region.landRows) {
    for (const [x0, x1] of row.spans) {
      ops.push(fill(x0, seabedY + 1, row.z, x1, row.y - 1, row.z, 'minecraft:sandstone'));
      ops.push(fill(x0, row.y, row.z, x1, row.y, row.z, 'minecraft:smooth_sandstone'));
    }
  }
  for (const box of region.boxes) {
    const block = PHOENICIA.materials[box.material].minecraft;
    ops.push(fill(box.min[0], box.min[1], box.min[2], box.max[0], box.max[1], box.max[2], block));
  }
  return ops;
}

export function volumeOf(op: FillOp): number {
  return (op.max.x - op.min.x + 1) * (op.max.y - op.min.y + 1) * (op.max.z - op.min.z + 1);
}
