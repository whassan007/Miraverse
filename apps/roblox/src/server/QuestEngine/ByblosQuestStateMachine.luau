--!strict
-- MiraVerse v0.7 (Option A) — Authoritative Native Quest State Machine & Byblos Vertical Slice (CL04)
-- Implements deterministic 5-step quest progression (gather -> trade -> cook -> build -> word)
-- with typed QuestEventEnvelope validation and replay-safe idempotent rewards.

local ByblosQuestStateMachine = {}

export type ChallengeStep = "gather" | "trade" | "cook" | "build" | "word"

export type PlayerQuestRecord = {
    userId: number,
    countryId: string,
    questId: string,
    completedSteps: { [string]: boolean },
    currentStepIndex: number,
    chapterCompleted: boolean,
    grantedEventIds: { [string]: boolean },
    miraTokensEarned: number,
    unlockedCosmetics: { [string]: boolean },
    passportStampIssued: string?,
}

ByblosQuestStateMachine.STEP_ORDER = { "gather", "trade", "cook", "build", "word" }

local playerStates: { [string]: PlayerQuestRecord } = {}

local function stateKey(userId: number, countryId: string): string
    return string.format("%d:%s", userId, countryId)
end

function ByblosQuestStateMachine.getOrCreateRecord(userId: number, countryId: string): PlayerQuestRecord
    local key = stateKey(userId, countryId)
    local existing = playerStates[key]
    if existing then
        return existing
    end
    local created: PlayerQuestRecord = {
        userId = userId,
        countryId = countryId,
        questId = string.format("QUEST_%s_MAIN_V06", countryId),
        completedSteps = {},
        currentStepIndex = 1,
        chapterCompleted = false,
        grantedEventIds = {},
        miraTokensEarned = 0,
        unlockedCosmetics = {},
        passportStampIssued = nil,
    }
    playerStates[key] = created
    return created
end

function ByblosQuestStateMachine.submitObjectiveEvent(
    userId: number,
    countryId: string,
    eventId: string,
    challengeType: ChallengeStep,
    serverTimestamp: number
): (boolean, string, number)
    if userId <= 0 or type(eventId) ~= "string" or #eventId < 4 then
        return false, "INVALID_EVENT_ENVELOPE", 0
    end
    local rec = ByblosQuestStateMachine.getOrCreateRecord(userId, countryId)
    if rec.grantedEventIds[eventId] then
        return false, "DUPLICATE_EVENT_IGNORED", 0
    end

    local expectedStep = ByblosQuestStateMachine.STEP_ORDER[rec.currentStepIndex]
    if rec.completedSteps[challengeType] then
        rec.grantedEventIds[eventId] = true
        return false, "STEP_ALREADY_COMPLETED", 0
    end
    if expectedStep ~= challengeType then
        return false, "OUT_OF_ORDER_STEP", 0
    end

    rec.grantedEventIds[eventId] = true
    rec.completedSteps[challengeType] = true
    rec.currentStepIndex += 1
    local stepAward = 20
    rec.miraTokensEarned += stepAward

    if rec.currentStepIndex > #ByblosQuestStateMachine.STEP_ORDER and not rec.chapterCompleted then
        rec.chapterCompleted = true
        rec.miraTokensEarned += 50 -- Completion bonus (total 150 earned-only Mira Tokens)
        rec.unlockedCosmetics[string.format("cosmetic_%s_heritage_outfit", string.lower(countryId))] = true
        rec.passportStampIssued = string.format("MV-%s1-V06-%d", countryId, serverTimestamp)
        return true, "CHAPTER_COMPLETED", stepAward + 50
    end

    return true, "STEP_COMPLETED", stepAward
end

-- Same dedupe and ordering rules as submitObjectiveEvent, for quests that define
-- their own node order and rewards. The caller owns the record, so it can be saved.
function ByblosQuestStateMachine.newDefinedRecord(userId: number, countryId: string, questId: string): PlayerQuestRecord
    return {
        userId = userId,
        countryId = countryId,
        questId = questId,
        completedSteps = {},
        currentStepIndex = 1,
        chapterCompleted = false,
        grantedEventIds = {},
        miraTokensEarned = 0,
        unlockedCosmetics = {},
        passportStampIssued = nil,
    }
end

function ByblosQuestStateMachine.submitDefinedNode(
    rec: PlayerQuestRecord,
    nodeOrder: { string },
    eventId: string,
    nodeId: string
): (boolean, string)
    if rec.grantedEventIds[eventId] then
        return false, "DUPLICATE_EVENT_IGNORED"
    end
    if rec.completedSteps[nodeId] then
        return false, "STEP_ALREADY_COMPLETED"
    end
    if nodeOrder[rec.currentStepIndex] ~= nodeId then
        return false, "OUT_OF_ORDER_STEP"
    end
    rec.grantedEventIds[eventId] = true
    rec.completedSteps[nodeId] = true
    rec.currentStepIndex += 1
    if rec.currentStepIndex > #nodeOrder then
        rec.chapterCompleted = true
        return true, "CHAPTER_COMPLETED"
    end
    return true, "STEP_COMPLETED"
end

return ByblosQuestStateMachine
