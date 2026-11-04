import { ItemStack, system } from '@minecraft/server';
import type { Container, EntityInventoryComponent, Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import type { Pack } from '../../../../packages/content/schema.js';

function inv(player: Player): Container | undefined {
  return (player.getComponent('minecraft:inventory') as EntityInventoryComponent | undefined)?.container;
}

export function itemId(pack: Pack, item: string): string {
  return `miraverse:${pack.country.toLowerCase()}_${item}`;
}

export function itemName(pack: Pack, item: string): string {
  return pack.items.find((i) => i.id === item)?.name_en ?? item;
}

function counterKey(pack: Pack, item: string): string {
  return `mv_${pack.country.toLowerCase()}_${item}`;
}

/** Count items in the inventory (plus any fallback counter if item types are unregistered). */
export function countItem(player: Player, pack: Pack, item: string): number {
  const id = itemId(pack, item);
  let total = 0;
  try {
    const container = inv(player);
    if (container) {
      for (let i = 0; i < container.size; i++) {
        const s = container.getItem(i);
        if (s && s.typeId === id) total += s.amount;
      }
    }
  } catch {
    /* ignore */
  }
  const fb = player.getDynamicProperty(counterKey(pack, item));
  return total + (typeof fb === 'number' ? fb : 0);
}

export function giveItem(player: Player, pack: Pack, item: string, count: number): void {
  const id = itemId(pack, item);
  try {
    const container = inv(player);
    if (!container) throw new Error('no inventory');
    container.addItem(new ItemStack(id, count));
  } catch {
    const key = counterKey(pack, item);
    const cur = player.getDynamicProperty(key);
    player.setDynamicProperty(key, (typeof cur === 'number' ? cur : 0) + count);
  }
}

export function takeItem(player: Player, pack: Pack, item: string, count: number): void {
  const id = itemId(pack, item);
  let left = count;
  try {
    const container = inv(player);
    if (container) {
      for (let i = 0; i < container.size && left > 0; i++) {
        const s = container.getItem(i);
        if (!s || s.typeId !== id) continue;
        if (s.amount <= left) {
          left -= s.amount;
          container.setItem(i, undefined);
        } else {
          s.amount -= left;
          container.setItem(i, s);
          left = 0;
        }
      }
    }
  } catch {
    /* ignore */
  }
  if (left > 0) {
    const key = counterKey(pack, item);
    const cur = player.getDynamicProperty(key);
    player.setDynamicProperty(key, Math.max(0, (typeof cur === 'number' ? cur : 0) - left));
  }
}

/** Show a form, retrying while the player is in the chat/HUD. Returns selection or undefined if cancelled. */
export async function show(player: Player, form: ActionFormData): Promise<number | undefined> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await form.show(player as never);
    if (res.canceled) {
      if ((res as { cancelationReason?: string }).cancelationReason === 'UserBusy') {
        await new Promise<void>((r) => system.runTimeout(() => r(), 20));
        continue;
      }
      return undefined;
    }
    return res.selection;
  }
  return undefined;
}

export function say(player: Player, msg: string): void {
  player.sendMessage(msg);
}
