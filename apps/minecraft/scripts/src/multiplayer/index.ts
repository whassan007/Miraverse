/**
 * MiraVerse v1.0 Minecraft Bedrock — Two-Player Co-Op & Plot Ownership Permissions
 * (`apps/minecraft/scripts/src/multiplayer/index.ts`)
 * Owner: CL04 (Wave W1–W3)
 * Enforces protected heritage districts vs. player-owned private building plots,
 * collaborator grant/revoke, block quota limits, accidental damage revert, and disconnect safety.
 */
import type { CountryId } from '../../../../../packages/content/schema.js';
import type { PlotOwnershipRecordV10, Vec3, WorldSaveStateV10 } from '../contracts/index.js';
import { REGIONS_V10 } from '../regions/index.js';

export function claimOrGetPrivatePlot(
  worldState: WorldSaveStateV10,
  country: CountryId,
  ownerPlayerId: string
): PlotOwnershipRecordV10 {
  const plotId = `plot:${country}:${ownerPlayerId}`;
  if (worldState.plots[plotId]) {
    return worldState.plots[plotId];
  }
  const region = REGIONS_V10[country];
  const plot: PlotOwnershipRecordV10 = {
    plotId,
    country,
    origin: { ...region.privatePlotOrigin },
    radius: region.privatePlotRadius,
    ownerPlayerId,
    collaboratorPlayerIds: [],
    placedBlocks: [],
    quotaLimit: 64,
  };
  worldState.plots[plotId] = plot;
  return plot;
}

export function grantPlotCollaborator(
  worldState: WorldSaveStateV10,
  plotId: string,
  actingPlayerId: string,
  collaboratorId: string
): { ok: boolean; reason: string } {
  const plot = worldState.plots[plotId];
  if (!plot) return { ok: false, reason: 'PLOT_NOT_FOUND' };
  if (plot.ownerPlayerId !== actingPlayerId) return { ok: false, reason: 'NOT_PLOT_OWNER' };
  if (!plot.collaboratorPlayerIds.includes(collaboratorId)) {
    plot.collaboratorPlayerIds.push(collaboratorId);
  }
  return { ok: true, reason: 'COLLABORATOR_GRANTED' };
}

export function revokePlotCollaborator(
  worldState: WorldSaveStateV10,
  plotId: string,
  actingPlayerId: string,
  collaboratorId: string
): { ok: boolean; reason: string } {
  const plot = worldState.plots[plotId];
  if (!plot) return { ok: false, reason: 'PLOT_NOT_FOUND' };
  if (plot.ownerPlayerId !== actingPlayerId) return { ok: false, reason: 'NOT_PLOT_OWNER' };
  plot.collaboratorPlayerIds = plot.collaboratorPlayerIds.filter((id) => id !== collaboratorId);
  return { ok: true, reason: 'COLLABORATOR_REVOKED' };
}

export function placeBlockInPrivatePlot(
  worldState: WorldSaveStateV10,
  plotId: string,
  actingPlayerId: string,
  pos: Vec3,
  blockId: string
): { ok: boolean; reason: string; remainingQuota: number } {
  const plot = worldState.plots[plotId];
  if (!plot) return { ok: false, reason: 'PLOT_NOT_FOUND', remainingQuota: 0 };

  const isAuthorized =
    plot.ownerPlayerId === actingPlayerId || plot.collaboratorPlayerIds.includes(actingPlayerId);
  if (!isAuthorized) {
    return { ok: false, reason: 'UNAUTHORIZED_PLOT_EDIT', remainingQuota: plot.quotaLimit - plot.placedBlocks.length };
  }

  const dx = Math.abs(pos.x - plot.origin.x);
  const dy = Math.abs(pos.y - plot.origin.y);
  const dz = Math.abs(pos.z - plot.origin.z);
  if (dx > plot.radius || dy > plot.radius || dz > plot.radius) {
    return { ok: false, reason: 'PROTECTED_HERITAGE_AREA_OUTSIDE_PLOT', remainingQuota: plot.quotaLimit - plot.placedBlocks.length };
  }

  if (plot.placedBlocks.length >= plot.quotaLimit) {
    return { ok: false, reason: 'PLOT_QUOTA_EXCEEDED', remainingQuota: 0 };
  }

  plot.placedBlocks.push({ pos: { ...pos }, blockId, placedBy: actingPlayerId });
  return {
    ok: true,
    reason: 'PLOT_BLOCK_PLACED',
    remainingQuota: plot.quotaLimit - plot.placedBlocks.length,
  };
}

export function revertPlotToCleanState(
  worldState: WorldSaveStateV10,
  plotId: string,
  actingPlayerId: string
): { ok: boolean; revertedCount: number; reason: string } {
  const plot = worldState.plots[plotId];
  if (!plot) return { ok: false, revertedCount: 0, reason: 'PLOT_NOT_FOUND' };
  if (plot.ownerPlayerId !== actingPlayerId) return { ok: false, revertedCount: 0, reason: 'NOT_PLOT_OWNER' };
  const count = plot.placedBlocks.length;
  plot.placedBlocks = [];
  return { ok: true, revertedCount: count, reason: 'PLOT_REVERTED' };
}
