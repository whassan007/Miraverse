import type { Player, Vector3 } from '@minecraft/server';
import type { CountryId, Pack } from '../../../../packages/content/schema.js';

export function spawnMentor(_cc: CountryId, _location: Vector3): void {}
export async function talk(_player: Player, _pack: Pack): Promise<void> {}
