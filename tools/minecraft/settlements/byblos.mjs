/**
 * Byblos harbor settlement: a coastal port with its own terrain and street plan.
 * Local axes: +x = east (inland), +z = south. The Mediterranean lies to the west, as it
 * does at the real Byblos. Layout is an interpretive game-scale reconstruction.
 *
 * Coordinates are deterministic and need no random seed.
 */
const SEA_Y = 0;
const QUAY_X = 24;
const SOUK_X = 40;
const CASTLE_X = 56;
const WIDTH = 72;
const DEPTH = 60;

const LIMESTONE = 'miraverse:lb_byblos_limestone';
const ARCH = 'miraverse:lb_carved_arch_stone';
const ROOF = 'miraverse:lb_terracotta_roof_tile';
const SHUTTER = 'miraverse:lb_cedar_shutter';
const BOLLARD = 'miraverse:lb_harbor_bollard';
const MOSAIC = 'miraverse:lb_mosaic_courtyard_tile';
const PLANK = 'minecraft:spruce_planks';
const WATER = 'minecraft:water';
const SAND = 'minecraft:sand';
const AIR = 'minecraft:air';

// The mole runs west from the quay. Its gap is what the player repairs.
const MOLE_Z = 10;
const MOLE_WIDTH = 3;
const MOLE_END_X = 4;
const GAP = { x0: 12, x1: 14 };
const STACK = { x0: 30, x1: 31, z0: 4, z1: 6, y: 2 };

export function buildByblos(origin) {
  const fills = [];
  const fill = (x0, y0, z0, x1, y1, z1, block) => fills.push({
    min: [origin.x + x0, origin.y + y0, origin.z + z0],
    max: [origin.x + x1, origin.y + y1, origin.z + z1],
    block,
  });
  const at = (x, y, z) => ({ x: origin.x + x, y: origin.y + y, z: origin.z + z });

  // Sea and seabed across the whole site, held in by an invisible wall.
  fill(-1, -3, -1, WIDTH, -3, DEPTH, SAND);
  for (let y = -2; y <= SEA_Y; y++) fill(0, y, 0, WIDTH - 1, y, DEPTH - 1, WATER);
  fill(-1, -3, -1, WIDTH, 12, -1, 'minecraft:barrier');
  fill(-1, -3, DEPTH, WIDTH, 12, DEPTH, 'minecraft:barrier');
  fill(-1, -3, -1, -1, 12, DEPTH, 'minecraft:barrier');
  fill(WIDTH, -3, -1, WIDTH, 12, DEPTH, 'minecraft:barrier');

  // Land rises in steps from the quay to the castle mound.
  fill(QUAY_X, -2, 0, WIDTH - 1, 1, DEPTH - 1, LIMESTONE);
  fill(SOUK_X, 2, 0, WIDTH - 1, 2, DEPTH - 1, LIMESTONE);
  fill(CASTLE_X, 3, 0, WIDTH - 1, 5, DEPTH - 1, LIMESTONE);

  // The harbor's southern arm curves round to shelter the basin.
  fill(4, -2, 40, QUAY_X - 1, 1, 42, LIMESTONE);
  fill(4, -2, 26, 6, 1, 40, LIMESTONE);

  // The northern mole, with a gap left unbuilt for the repair.
  const moleZ1 = MOLE_Z + MOLE_WIDTH - 1;
  fill(GAP.x1 + 1, -2, MOLE_Z, QUAY_X - 1, 1, moleZ1, LIMESTONE);
  fill(MOLE_END_X, -2, MOLE_Z, GAP.x0 - 1, 1, moleZ1, LIMESTONE);
  fill(MOLE_END_X, 2, MOLE_Z, MOLE_END_X, 2, MOLE_Z, BOLLARD);
  fill(MOLE_END_X, 2, moleZ1, MOLE_END_X, 2, moleZ1, BOLLARD);

  // Two moored boats in the basin.
  for (const [x, z] of [[14, 28], [18, 34]]) {
    fill(x - 3, 1, z, x + 3, 1, z + 2, PLANK);
    fill(x, 2, z + 1, x, 6, z + 1, 'minecraft:spruce_fence');
  }

  // Warehouses on the quay.
  const building = (x0, z0, x1, z1, floorY, height, wall = LIMESTONE) => {
    const top = floorY + height;
    fill(x0, floorY, z0, x1, top, z0, wall);
    fill(x0, floorY, z1, x1, top, z1, wall);
    fill(x0, floorY, z0, x0, top, z1, wall);
    fill(x1, floorY, z0, x1, top, z1, wall);
    fill(x0, top + 1, z0, x1, top + 1, z1, ROOF);
    const doorZ = Math.floor((z0 + z1) / 2);
    fill(x0, floorY, doorZ, x0, floorY + 1, doorZ, AIR);
    fill(x0, floorY + 2, doorZ - 1, x0, floorY + 2, doorZ + 1, SHUTTER);
  };
  building(27, 14, 34, 22, 2, 4);
  building(27, 44, 36, 54, 2, 4);

  // Old souk: a winding covered lane, changing direction instead of running straight.
  const lane = [
    [SOUK_X, 28, SOUK_X + 5, 30],
    [SOUK_X + 5, 22, SOUK_X + 7, 30],
    [SOUK_X + 7, 22, SOUK_X + 14, 24],
  ];
  for (const [x0, z0, x1, z1] of lane) {
    fill(x0, 2, z0, x1, 2, z1, MOSAIC);
    fill(x0, 6, z0, x1, 6, z1, ROOF);
  }
  building(SOUK_X, 19, SOUK_X + 4, 26, 3, 2);
  building(SOUK_X, 32, SOUK_X + 6, 38, 3, 2);
  building(SOUK_X + 9, 26, SOUK_X + 14, 33, 3, 2);
  building(SOUK_X + 8, 13, SOUK_X + 14, 20, 3, 2);

  // Byblos Castle on the high ground: a square keep with an arched gate.
  fill(CASTLE_X + 3, 6, 34, CASTLE_X + 13, 15, 44, LIMESTONE);
  fill(CASTLE_X + 4, 6, 35, CASTLE_X + 12, 14, 43, AIR);
  fill(CASTLE_X + 3, 6, 38, CASTLE_X + 3, 8, 40, AIR);
  fill(CASTLE_X + 3, 9, 37, CASTLE_X + 3, 9, 41, ARCH);

  // Timber the player breaks by hand, and the marker Karim walks to.
  fill(STACK.x0, STACK.y, STACK.z0, STACK.x1, STACK.y + 2, STACK.z1, PLANK);
  fill(QUAY_X + 1, 2, MOLE_Z + 1, QUAY_X + 1, 2, MOLE_Z + 1, 'minecraft:lodestone');

  const repairCells = [];
  for (let x = GAP.x0; x <= GAP.x1; x++) {
    for (let z = MOLE_Z; z <= moleZ1; z++) repairCells.push(at(x, 1, z));
  }

  const cells = {
    repairCells,
    repairBlock: PLANK,
    timberStack: { min: at(STACK.x0, STACK.y, STACK.z0), max: at(STACK.x1, STACK.y + 2, STACK.z1) },
    gapLookout: at(GAP.x1 + 2, 2, MOLE_Z + 1),
    moleEnd: at(MOLE_END_X + 1, 2, MOLE_Z + 1),
    dock: at(QUAY_X + 3, 2, MOLE_Z + 1),
    spawn: at(QUAY_X + 4, 2, MOLE_Z + 8),
    karimStart: at(SOUK_X - 3, 2, 24),
    soukEntrance: at(SOUK_X, 3, 29),
    castleGate: at(CASTLE_X + 2, 6, 39),
  };
  return {
    fills,
    cells,
    bounds: {
      min: [origin.x - 1, origin.y, origin.z - 1],
      max: [origin.x + WIDTH, origin.y, origin.z + DEPTH],
    },
    reference: {
      place: 'Byblos / Jbeil, Lebanon',
      setting: 'Interpretive game-scale harbor, combining features from different periods',
      geography: 'Mediterranean to the west, small sheltered harbor, old souk inland, castle on higher ground',
      morphology: 'coastal_port',
    },
  };
}
