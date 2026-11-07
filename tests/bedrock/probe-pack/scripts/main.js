// Reports what really exists on the running server, using only stable APIs.
// Dynamic properties are private to each pack, so this checks blocks and entities instead.
import { BlockPermutation, system, world } from '@minecraft/server';

const CHECKS = [
  ['quay', 3030, 101, 30],
  ['mole', 3020, 101, 10],
  ['gap', 3013, 101, 10],
  ['sea', 3013, 100, 10],
  ['timber', 3030, 102, 4],
  ['marker', 3025, 102, 11],
  ['souk', 3042, 102, 29],
  ['castle', 3059, 110, 34],
  ['roof', 3030, 107, 18],
  ['DE floor', 1200, 100, 0],
  ['MA floor', 2200, 100, 0],
  ['lobby', 0, 100, 0],
];

system.runTimeout(() => {
  const dimension = world.getDimension('overworld');
  for (const id of ['minecraft:terracotta', 'minecraft:hardened_clay', 'minecraft:stone_bricks', 'minecraft:quartz_block', 'minecraft:spruce_planks', 'minecraft:sandstone']) {
    try {
      BlockPermutation.resolve(id);
      console.warn(`[probe] id ok: ${id}`);
    } catch (error) {
      console.warn(`[probe] id INVALID: ${id}: ${error}`);
    }
  }
  void dimension;
}, 60);

system.runInterval(() => {
  const dimension = world.getDimension('overworld');
  const parts = CHECKS.map(([label, x, y, z]) => {
    try {
      return `${label}=${(dimension.getBlock({ x, y, z })?.typeId ?? 'unloaded').replace('minecraft:', '').replace('miraverse:', '*')}`;
    } catch {
      return `${label}=err`;
    }
  });
  console.warn(`[probe] t=${system.currentTick} ${parts.join(' ')}`);
  const npcs = dimension.getEntities({ families: ['npc'] }).map((e) => {
    const { x, y, z } = e.location;
    return `${e.typeId.replace('miraverse:', '')}@${x.toFixed(0)},${y.toFixed(0)},${z.toFixed(0)}`;
  });
  const karim = dimension.getEntities({ type: 'miraverse:family_lb_karim' })[0];
  const where = karim ? `${karim.location.x.toFixed(1)},${karim.location.y.toFixed(1)},${karim.location.z.toFixed(1)}` : 'none';
  console.warn(`[probe] t=${system.currentTick} karim=${where} npcs=${npcs.length} ${npcs.slice(0, 3).join(' ')}`);
}, 200);
