/**
 * MiraVerse v1.0 Minecraft Bedrock — Authoritative Inventory Ledger & Anti-Duplication
 * (`apps/minecraft/scripts/src/inventory/index.ts`)
 * Owner: CL03 (Wave W1–W2)
 */
import type { PlayerSaveStateV10 } from '../contracts/index.js';

export function getItemCount(state: PlayerSaveStateV10, itemId: string): number {
  return state.inventoryLedger[itemId] || 0;
}

export function grantItem(state: PlayerSaveStateV10, itemId: string, qty = 1): number {
  if (qty <= 0) return getItemCount(state, itemId);
  state.inventoryLedger[itemId] = (state.inventoryLedger[itemId] || 0) + qty;
  return state.inventoryLedger[itemId];
}

export function consumeItem(state: PlayerSaveStateV10, itemId: string, qty = 1): boolean {
  const cur = getItemCount(state, itemId);
  if (cur < qty) return false;
  const next = cur - qty;
  if (next === 0) {
    delete state.inventoryLedger[itemId];
  } else {
    state.inventoryLedger[itemId] = next;
  }
  return true;
}

export function executeAtomicTrade(
  state: PlayerSaveStateV10,
  giveItems: Array<{ itemId: string; count: number }>,
  receiveItems: Array<{ itemId: string; count: number }>
): { ok: boolean; reason: string } {
  // 1. Pre-validate all required inputs before mutating state
  for (const req of giveItems) {
    if (getItemCount(state, req.itemId) < req.count) {
      return { ok: false, reason: `INSUFFICIENT_ITEM:${req.itemId}` };
    }
  }
  // 2. Snapshot for rollback safety
  const snapshot = { ...state.inventoryLedger };
  try {
    for (const req of giveItems) {
      if (!consumeItem(state, req.itemId, req.count)) {
        throw new Error('Trade consumption failed');
      }
    }
    for (const out of receiveItems) {
      grantItem(state, out.itemId, out.count);
    }
    return { ok: true, reason: 'TRADE_COMPLETED' };
  } catch (err) {
    state.inventoryLedger = snapshot;
    return { ok: false, reason: 'TRADE_ROLLED_BACK' };
  }
}
