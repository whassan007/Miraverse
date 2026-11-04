--!strict
-- MiraVerse v0.7 (Option A) — Typed Replicated Social & Avatar Marketplace Contracts (CX05 Section 8A)
-- Enforces strict separation between experience_only cosmetics and marketplace_candidate assets.

local SocialAvatarContracts = {}

export type AvatarInventoryStatus =
    "experience_only"
    | "marketplace_candidate"
    | "submitted_for_moderation"
    | "approved"
    | "published"
    | "rejected"

export type AvatarCatalogItem = {
    itemId: string,
    countryId: string,
    displayName: string,
    slot: "outfit" | "hat" | "hair" | "backpack" | "accessory" | "emote",
    status: AvatarInventoryStatus,
    earnedViaQuestId: string?,
    miraTokenCost: number,
    verifiedMarketplaceAssetId: string?, -- nil until human-approved & published on Roblox Marketplace
    r15AttachmentPoint: string,
    cagedLayeredClothing: boolean,
}

SocialAvatarContracts.CATALOG = {
    lb_byblos_apron_vest = {
        itemId = "lb_byblos_apron_vest",
        countryId = "LB",
        displayName = "Byblos Artisan Heritage Vest & Apron",
        slot = "outfit",
        status = "experience_only",
        earnedViaQuestId = "QUEST_LB_MAIN_V06",
        miraTokenCost = 0,
        verifiedMarketplaceAssetId = nil,
        r15AttachmentPoint = "UpperTorso",
        cagedLayeredClothing = true,
    },
    lb_cedar_explorer_satchel = {
        itemId = "lb_cedar_explorer_satchel",
        countryId = "LB",
        displayName = "Byblos Cedar & Brass Compass Satchel",
        slot = "backpack",
        status = "marketplace_candidate",
        earnedViaQuestId = "QUEST_LB_MAIN_V06",
        miraTokenCost = 50,
        verifiedMarketplaceAssetId = nil,
        r15AttachmentPoint = "UpperTorso",
        cagedLayeredClothing = false,
    },
    eg_fanous_star_backpack = {
        itemId = "eg_fanous_star_backpack",
        countryId = "EG",
        displayName = "Cairo Fanous Lantern Daypack",
        slot = "backpack",
        status = "marketplace_candidate",
        earnedViaQuestId = "QUEST_EG_MAIN_V06",
        miraTokenCost = 75,
        verifiedMarketplaceAssetId = nil,
        r15AttachmentPoint = "UpperTorso",
        cagedLayeredClothing = false,
    },
    iq_tigris_woven_hat = {
        itemId = "iq_tigris_woven_hat",
        countryId = "IQ",
        displayName = "Baghdad Sun-Weave Explorer Hat",
        slot = "hat",
        status = "experience_only",
        earnedViaQuestId = "QUEST_IQ_MAIN_V06",
        miraTokenCost = 50,
        verifiedMarketplaceAssetId = nil,
        r15AttachmentPoint = "HatAttachment",
        cagedLayeredClothing = false,
    },
    kr_jeonju_hanbok_jacket = {
        itemId = "kr_jeonju_hanbok_jacket",
        countryId = "KR",
        displayName = "Jeonju Autumn Durumagi Jacket",
        slot = "outfit",
        status = "marketplace_candidate",
        earnedViaQuestId = "QUEST_KR_MAIN_V06",
        miraTokenCost = 75,
        verifiedMarketplaceAssetId = nil,
        r15AttachmentPoint = "UpperTorso",
        cagedLayeredClothing = true,
    },
    fr_lyon_patissier_beret = {
        itemId = "fr_lyon_patissier_beret",
        countryId = "FR",
        displayName = "Vieux Lyon Boulangerie Beret",
        slot = "hat",
        status = "marketplace_candidate",
        earnedViaQuestId = "QUEST_FR_MAIN_V06",
        miraTokenCost = 50,
        verifiedMarketplaceAssetId = nil,
        r15AttachmentPoint = "HatAttachment",
        cagedLayeredClothing = false,
    },
}

return SocialAvatarContracts
