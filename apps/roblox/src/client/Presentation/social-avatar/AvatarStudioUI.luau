--!strict
-- MiraVerse v0.7 (Option A) — In-Experience Avatar Studio & Friends/Co-op HUD (AG06 Section 8A)
-- Allows previewing, rotating/zooming, equipping owned items, and inviting friends via SocialService.

local SocialAvatarContracts = require(script.Parent.Parent.Parent.Parent.shared.Systems.SocialAvatar.SocialAvatarContracts)

local AvatarStudioUI = {}

export type StudioPreviewState = {
    selectedItemId: string,
    cameraYawDeg: number,
    cameraZoomStuds: number,
    badgeLabel: string,
}

function AvatarStudioUI.inspectCatalogItem(itemId: string): StudioPreviewState?
    local item = SocialAvatarContracts.CATALOG[itemId]
    if not item then
        return nil
    end
    local badge = if item.status == "experience_only"
        then "In-Experience Cosmetic (Earned via Quests)"
        else "Marketplace Candidate (Pending Creator Approval)"

    return {
        selectedItemId = item.itemId,
        cameraYawDeg = 25,
        cameraZoomStuds = 6.5,
        badgeLabel = badge,
    }
end

return AvatarStudioUI
