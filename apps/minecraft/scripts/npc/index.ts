import { world } from '@minecraft/server';
import type { Player, Vector3 } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import type { CountryId, Pack } from '../../../../packages/content/schema.js';
import { PACKS } from '../generated/packs.js';

function mentorType(cc: CountryId): string {
  return `miraverse:mentor_${cc.toLowerCase()}`;
}

function mentorTag(cc: CountryId): string {
  return `miraverse_mentor_${cc.toLowerCase()}`;
}

/** Idempotently spawn the country's mentor NPC in the overworld. */
export function spawnMentor(cc: CountryId, location: Vector3): void {
  const dim = world.getDimension('overworld');
  const tag = mentorTag(cc);
  try {
    if (dim.getEntities({ tags: [tag] }).length > 0) return;
    const entity = dim.spawnEntity(mentorType(cc), location);
    entity.addTag(tag);
    entity.addTag(`country_${cc}`);
    const pack = PACKS.find((p) => p.country === cc);
    entity.nameTag = pack ? pack.mentor.name : cc;
  } catch {
    // Chunk not loaded or entity unavailable; spawn is retried by caller later.
  }
}

/** Show the mentor dialogue with greeting and chapter guidance. */
export async function talk(player: Player, pack: Pack): Promise<void> {
  const lines: string[] = [pack.mentor.greeting, '', pack.mentor.greeting_en, ''];
  for (const ch of pack.chapters) {
    const goals = ch.challenges.map((c) => `• ${c.title_en}`).join('\n');
    lines.push(`§l${ch.id}. ${ch.title_en}§r\n${goals}`);
  }
  const form = new ActionFormData()
    .title(pack.mentor.name)
    .body(lines.join('\n'))
    .button('OK');
  try {
    await form.show(player);
  } catch {
    // Player left or form was cancelled.
  }
}
