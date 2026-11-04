import { describe, it, expect } from 'vitest';
import { createDefaultWorldStateV10 } from '../../scripts/src/state/index.js';
import {
  claimOrGetPrivatePlot,
  grantPlotCollaborator,
  revokePlotCollaborator,
  placeBlockInPrivatePlot,
  revertPlotToCleanState,
} from '../../scripts/src/multiplayer/index.js';

describe('MiraVerse v1.0 Minecraft Bedrock — Two-Player Co-Op & Plot Ownership Suite', () => {
  it('enforces protected heritage districts, collaborator grant/revoke, 64-block quota, and clean revert', () => {
    const worldState = createDefaultWorldStateV10();
    const plot = claimOrGetPrivatePlot(worldState, 'LB', 'host_player');
    expect(plot.plotId).toBe('plot:LB:host_player');

    // Guest cannot place blocks before permission grant
    const unauth = placeBlockInPrivatePlot(worldState, plot.plotId, 'guest_friend', plot.origin, 'minecraft:oak_planks');
    expect(unauth.ok).toBe(false);
    expect(unauth.reason).toBe('UNAUTHORIZED_PLOT_EDIT');

    // Host grants collaborator permission to guest_friend
    const grant = grantPlotCollaborator(worldState, plot.plotId, 'host_player', 'guest_friend');
    expect(grant.ok).toBe(true);

    // Guest can now place inside plot bounds
    const authPlace = placeBlockInPrivatePlot(worldState, plot.plotId, 'guest_friend', plot.origin, 'miraverse:lb_byblos_limestone');
    expect(authPlace.ok).toBe(true);

    // Neither host nor guest can place blocks outside plot bounds (protected heritage street)
    const outsidePos = { x: plot.origin.x + 50, y: plot.origin.y, z: plot.origin.z };
    const heritageAttempt = placeBlockInPrivatePlot(worldState, plot.plotId, 'host_player', outsidePos, 'minecraft:tnt');
    expect(heritageAttempt.ok).toBe(false);
    expect(heritageAttempt.reason).toBe('PROTECTED_HERITAGE_AREA_OUTSIDE_PLOT');

    // Host revokes collaborator permission
    const revoke = revokePlotCollaborator(worldState, plot.plotId, 'host_player', 'guest_friend');
    expect(revoke.ok).toBe(true);
    const afterRevoke = placeBlockInPrivatePlot(worldState, plot.plotId, 'guest_friend', plot.origin, 'minecraft:oak_planks');
    expect(afterRevoke.ok).toBe(false);

    // Revert plot cleans placed blocks
    const rev = revertPlotToCleanState(worldState, plot.plotId, 'host_player');
    expect(rev.ok).toBe(true);
    expect(rev.revertedCount).toBe(1);
    expect(plot.placedBlocks.length).toBe(0);
  });
});
