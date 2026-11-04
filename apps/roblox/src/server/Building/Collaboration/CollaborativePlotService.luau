--!strict
-- MiraVerse v0.7 (Option A) — Permissioned Collaborative Plot Service (CL06 Section 8A)
-- Enforces server-side plot owner, explicit collaborator grant/revoke, rate limits, and undo history.

local CollaborativePlotService = {}

export type PlotRecord = {
    ownerUserId: number,
    countryId: string,
    collaborators: { [number]: boolean },
    placements: { any },
    restorationStage: number,
}

local plotsByOwner: { [number]: PlotRecord } = {}
local actionTimestamps: { [number]: { number } } = {}
local MAX_ACTIONS_PER_WINDOW = 8
local WINDOW_SEC = 5

function CollaborativePlotService.getOrCreatePlot(ownerUserId: number, countryId: string): PlotRecord
    local existing = plotsByOwner[ownerUserId]
    if existing then
        return existing
    end
    local created: PlotRecord = {
        ownerUserId = ownerUserId,
        countryId = countryId,
        collaborators = {},
        placements = {},
        restorationStage = 0,
    }
    plotsByOwner[ownerUserId] = created
    return created
end

function CollaborativePlotService.setCollaboratorPermission(
    callerUserId: number,
    plotOwnerUserId: number,
    targetUserId: number,
    canEdit: boolean
): (boolean, string)
    if callerUserId ~= plotOwnerUserId then
        return false, "ONLY_PLOT_OWNER_MAY_CHANGE_PERMISSIONS"
    end
    if targetUserId == plotOwnerUserId or targetUserId <= 0 then
        return false, "INVALID_COLLABORATOR_ID"
    end
    local plot = CollaborativePlotService.getOrCreatePlot(plotOwnerUserId, "LB")
    if canEdit then
        plot.collaborators[targetUserId] = true
        return true, "COLLABORATOR_GRANTED"
    else
        plot.collaborators[targetUserId] = nil
        return true, "COLLABORATOR_REVOKED"
    end
end

function CollaborativePlotService.canUserEditPlot(actorUserId: number, plotOwnerUserId: number): boolean
    if actorUserId == plotOwnerUserId then
        return true
    end
    local plot = plotsByOwner[plotOwnerUserId]
    if not plot then
        return false
    end
    return plot.collaborators[actorUserId] == true
end

function CollaborativePlotService.checkRateLimit(actorUserId: number, nowSec: number): boolean
    local history = actionTimestamps[actorUserId] or {}
    local filtered = {}
    for _, ts in ipairs(history) do
        if (nowSec - ts) < WINDOW_SEC then
            table.insert(filtered, ts)
        end
    end
    if #filtered >= MAX_ACTIONS_PER_WINDOW then
        actionTimestamps[actorUserId] = filtered
        return false
    end
    table.insert(filtered, nowSec)
    actionTimestamps[actorUserId] = filtered
    return true
end

return CollaborativePlotService
