--!strict
-- MiraVerse v0.7 (Option A) — Roblox SocialService Friend Invitation & Co-op Session Adapter (CL03 Section 8A)
-- Uses native Roblox SocialService:CanSendGameInviteAsync and PromptGameInvite with safe degradation.
-- Never scrapes the friend graph or builds a custom unmoderated social network.

local SocialInvitationService = {}

export type InviteAttemptResult = {
    allowed: boolean,
    status: "PROMPTED" | "INELIGIBLE_ACCOUNT_OR_POLICY" | "RATE_LIMITED" | "SERVICE_UNAVAILABLE",
    sessionCode: string?,
}

export type CoopPartySession = {
    sessionId: string,
    hostUserId: number,
    guestUserId: number?,
    countryId: string,
    activeCoopQuestId: string,
    createdAt: number,
}

local activePartiesByHost: { [number]: CoopPartySession } = {}
local lastInvitePromptAt: { [number]: number } = {}
local INVITE_COOLDOWN_SEC = 5

function SocialInvitationService.canSendInvite(player: any, socialServiceProvider: any?): boolean
    if not player or type(player.UserId) ~= "number" or player.UserId <= 0 then
        return false
    end
    if socialServiceProvider and type(socialServiceProvider.CanSendGameInviteAsync) == "function" then
        local ok, result = pcall(function()
            return socialServiceProvider:CanSendGameInviteAsync(player)
        end)
        return ok and result == true
    end
    return true
end

function SocialInvitationService.requestFriendInvitePrompt(
    player: any,
    countryId: string,
    nowSec: number,
    socialServiceProvider: any?
): InviteAttemptResult
    local uid = player and player.UserId or 0
    local prev = lastInvitePromptAt[uid]
    if prev and (nowSec - prev) < INVITE_COOLDOWN_SEC then
        return { allowed = false, status = "RATE_LIMITED", sessionCode = nil }
    end
    lastInvitePromptAt[uid] = nowSec

    if not SocialInvitationService.canSendInvite(player, socialServiceProvider) then
        return { allowed = false, status = "INELIGIBLE_ACCOUNT_OR_POLICY", sessionCode = nil }
    end

    local sessionId = string.format("coop_%d_%s", uid, countryId or "LB")
    if not activePartiesByHost[uid] then
        activePartiesByHost[uid] = {
            sessionId = sessionId,
            hostUserId = uid,
            guestUserId = nil,
            countryId = countryId or "LB",
            activeCoopQuestId = "LB_COOP_HARBOR_FEAST",
            createdAt = nowSec,
        }
    end

    if socialServiceProvider and type(socialServiceProvider.PromptGameInvite) == "function" then
        local ok = pcall(function()
            socialServiceProvider:PromptGameInvite(player)
        end)
        if not ok then
            return { allowed = false, status = "SERVICE_UNAVAILABLE", sessionCode = nil }
        end
    end

    return {
        allowed = true,
        status = "PROMPTED",
        sessionCode = sessionId,
    }
end

function SocialInvitationService.joinCoopSession(hostUserId: number, guestUserId: number): (boolean, string)
    if hostUserId == guestUserId or guestUserId <= 0 then
        return false, "INVALID_GUEST"
    end
    local session = activePartiesByHost[hostUserId]
    if not session then
        return false, "SESSION_NOT_FOUND"
    end
    if session.guestUserId ~= nil and session.guestUserId ~= guestUserId then
        return false, "SESSION_FULL"
    end
    session.guestUserId = guestUserId
    return true, session.sessionId
end

function SocialInvitationService.getPartySession(hostUserId: number): CoopPartySession?
    return activePartiesByHost[hostUserId]
end

return SocialInvitationService
