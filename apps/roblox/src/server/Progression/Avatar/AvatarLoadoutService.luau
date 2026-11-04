--!strict
-- MiraVerse v0.7 (Option A) — Authoritative In-Experience Avatar Studio & Loadout Service (CL08 Section 8A)

local SocialAvatarContracts = require(script.Parent.Parent.Parent.Parent.shared.Systems.SocialAvatar.SocialAvatarContracts)

local AvatarLoadoutService = {}

function AvatarLoadoutService.equipItem(playerSave: any, itemId: string): (boolean, string)
    local item = SocialAvatarContracts.CATALOG[itemId]
    if not item then
        return false, "UNKNOWN_AVATAR_ITEM"
    end
    if not playerSave.ownedCosmetics[itemId] then
        return false, "ITEM_NOT_OWNED"
    end
    playerSave.equippedLoadout[item.slot] = itemId
    return true, "EQUIPPED"
end

function AvatarLoadoutService.unlockWithEarnedTokens(playerSave: any, itemId: string): (boolean, string)
    local item = SocialAvatarContracts.CATALOG[itemId]
    if not item then
        return false, "UNKNOWN_AVATAR_ITEM"
    end
    if playerSave.ownedCosmetics[itemId] then
        return false, "ALREADY_OWNED"
    end
    if playerSave.miraTokens < item.miraTokenCost then
        return false, "INSUFFICIENT_EARNED_MIRA_TOKENS"
    end
    playerSave.miraTokens -= item.miraTokenCost
    playerSave.ownedCosmetics[itemId] = true
    return true, "UNLOCKED_WITH_EARNED_TOKENS"
end

return AvatarLoadoutService
