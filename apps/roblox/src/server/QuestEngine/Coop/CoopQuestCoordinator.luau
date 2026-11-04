--!strict
-- MiraVerse v0.7 (Option A) — Two-Player Byblos Cooperative Quest Coordinator (CL04 Section 8A)
-- Validates proximity, per-participant contribution, and idempotent individual rewards.

local CoopQuestCoordinator = {}

export type CoopObjectiveState = {
    sessionId: string,
    questId: string,
    hostUserId: number,
    guestUserId: number,
    hostContributed: boolean,
    guestContributed: boolean,
    completed: boolean,
    rewardedPlayers: { [number]: boolean },
}

local coopSessions: { [string]: CoopObjectiveState } = {}

function CoopQuestCoordinator.startByblosCoopQuest(sessionId: string, hostUserId: number, guestUserId: number): CoopObjectiveState
    local state: CoopObjectiveState = {
        sessionId = sessionId,
        questId = "LB_COOP_HARBOR_FEAST",
        hostUserId = hostUserId,
        guestUserId = guestUserId,
        hostContributed = false,
        guestContributed = false,
        completed = false,
        rewardedPlayers = {},
    }
    coopSessions[sessionId] = state
    return state
end

function CoopQuestCoordinator.recordContribution(
    sessionId: string,
    userId: number,
    distanceBetweenPlayersStuds: number
): (boolean, string)
    local state = coopSessions[sessionId]
    if not state then
        return false, "COOP_SESSION_NOT_FOUND"
    end
    if distanceBetweenPlayersStuds > 45 then
        return false, "COOP_PARTNERS_TOO_FAR"
    end
    if userId == state.hostUserId then
        state.hostContributed = true
    elseif userId == state.guestUserId then
        state.guestContributed = true
    else
        return false, "UNAUTHORIZED_PARTICIPANT"
    end

    if state.hostContributed and state.guestContributed then
        state.completed = true
        return true, "COOP_OBJECTIVE_COMPLETE"
    end
    return true, "CONTRIBUTION_RECORDED"
end

function CoopQuestCoordinator.claimIndividualCoopReward(sessionId: string, userId: number): (boolean, number, string)
    local state = coopSessions[sessionId]
    if not state or not state.completed then
        return false, 0, "COOP_NOT_COMPLETED"
    end
    if userId ~= state.hostUserId and userId ~= state.guestUserId then
        return false, 0, "NOT_IN_SESSION"
    end
    if state.rewardedPlayers[userId] then
        return false, 0, "DUPLICATE_COOP_REWARD_BLOCKED"
    end
    state.rewardedPlayers[userId] = true
    return true, 40, "GRANTED_INDIVIDUAL_COOP_REWARD"
end

return CoopQuestCoordinator
