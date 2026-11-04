--!strict
-- MiraVerse v0.7 (Option A) — Versioned DataStore Progression, Passport & Earned Mira Tokens (CL08)

local PlayerDataStoreService = {}

PlayerDataStoreService.SCHEMA_VERSION = "mv.roblox.save.v6"

export type RobloxPlayerSave = {
    schemaVersion: string,
    userId: number,
    lastCountryId: string,
    miraTokens: number,
    completedQuests: { [string]: boolean },
    passportStamps: { [string]: string },
    ownedCosmetics: { [string]: boolean },
    equippedLoadout: { [string]: string },
    restoredStages: { [string]: number },
    processedEventIds: { [string]: boolean },
}

local memoryStore: { [number]: RobloxPlayerSave } = {}

function PlayerDataStoreService.createDefaultSave(userId: number): RobloxPlayerSave
    return {
        schemaVersion = PlayerDataStoreService.SCHEMA_VERSION,
        userId = userId,
        lastCountryId = "LB",
        miraTokens = 0,
        completedQuests = {},
        passportStamps = {},
        ownedCosmetics = {
            lb_byblos_apron_vest = true,
        },
        equippedLoadout = {
            outfit = "lb_byblos_apron_vest",
        },
        restoredStages = {
            LB = 0,
            EG = 0,
            IQ = 0,
            KR = 0,
            FR = 0,
        },
        processedEventIds = {},
    }
end

function PlayerDataStoreService.loadPlayerSave(userId: number): RobloxPlayerSave
    local existing = memoryStore[userId]
    if existing then
        return existing
    end
    local fresh = PlayerDataStoreService.createDefaultSave(userId)
    memoryStore[userId] = fresh
    return fresh
end

function PlayerDataStoreService.savePlayerState(userId: number, state: RobloxPlayerSave): boolean
    if state.miraTokens < 0 then
        return false
    end
    state.schemaVersion = PlayerDataStoreService.SCHEMA_VERSION
    memoryStore[userId] = state
    return true
end

return PlayerDataStoreService
