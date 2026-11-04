--!strict
-- MiraVerse v0.7 (Option A) — Shared Roblox Item, Inventory & Object Marker Contracts (CX05)

local SharedInventoryAndMarkers = {}

export type QuestEventEnvelope = {
    event_id: string,
    player_id: number,
    quest_id: string,
    objective_id: string,
    challenge_type: string,
    country_id: string,
    object_or_item_ids: { string },
    server_timestamp: number,
    reward_status: string,
    mira_tokens_awarded: number,
}

SharedInventoryAndMarkers.BYBLOS_ITEMS = {
    zaatar_thyme = { id = "zaatar_thyme", label = "Wild Mountain Za'atar", category = "ingredient", countryId = "LB" },
    sumac_berries = { id = "sumac_berries", label = "Ground Crimson Sumac", category = "ingredient", countryId = "LB" },
    roasted_sesame = { id = "roasted_sesame", label = "Toasted Sesame Seeds", category = "ingredient", countryId = "LB" },
    olive_oil_flask = { id = "olive_oil_flask", label = "Byblos Pressed Olive Oil", category = "ingredient", countryId = "LB" },
    fresh_saj_dough = { id = "fresh_saj_dough", label = "Rolled Saj Flatbread Dough", category = "ingredient", countryId = "LB" },
    manoushe_zaatar = { id = "manoushe_zaatar", label = "Warm Man'oushe Za'atar", category = "dish", countryId = "LB" },
    limestone_arch_block = { id = "limestone_arch_block", label = "Triple-Arched Mandaloun Stone", category = "build_part", countryId = "LB" },
    cedar_shutter_pair = { id = "cedar_shutter_pair", label = "Painted Cedar Shutters", category = "build_part", countryId = "LB" },
    terracotta_roof_tile = { id = "terracotta_roof_tile", label = "Mediterranean Roof Tiles", category = "build_part", countryId = "LB" },
    bougainvillea_planter = { id = "bougainvillea_planter", label = "Courtyard Bougainvillea Planter", category = "build_part", countryId = "LB" },
}

return SharedInventoryAndMarkers
