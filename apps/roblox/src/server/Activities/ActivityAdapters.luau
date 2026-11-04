--!strict
-- MiraVerse v0.7 (Option A) — Native Gather, Trade, Cook & Word Luau Gameplay Adapters (CL07)
-- Server-authoritative spatial & inventory validation for all 5 challenge types.

local ActivityAdapters = {}

function ActivityAdapters.validateGatherPickup(itemId: string, distanceStuds: number): (boolean, string)
    if distanceStuds > 16 then
        return false, "PICKUP_OUT_OF_RANGE"
    end
    local allowed = {
        zaatar_thyme = true,
        sumac_berries = true,
        roasted_sesame = true,
        olive_oil_flask = true,
        fresh_saj_dough = true,
    }
    if not allowed[itemId] then
        return false, "UNKNOWN_GATHER_ITEM"
    end
    return true, "ITEM_COLLECTED"
end

function ActivityAdapters.validateMarketTrade(offeredItemId: string, requestedItemId: string, inventory: { [string]: number }): (boolean, string)
    if (inventory[offeredItemId] or 0) < 1 then
        return false, "MISSING_OFFERED_ITEM"
    end
    inventory[offeredItemId] -= 1
    inventory[requestedItemId] = (inventory[requestedItemId] or 0) + 1
    return true, "TRADE_COMPLETED"
end

function ActivityAdapters.validateSajCookingSequence(stepsSubmitted: { string }): (boolean, string)
    local expected = { "roll_dough", "brush_olive_oil", "sprinkle_zaatar_sumac", "teta_saj_bake" }
    if #stepsSubmitted ~= #expected then
        return false, "GENTLE_RETRY_HINT: Let's roll the dough, brush olive oil, sprinkle za'atar, and let Teta bake it on the saj!"
    end
    for i, step in ipairs(expected) do
        if stepsSubmitted[i] ~= step then
            return false, "GENTLE_RETRY_HINT: Almost there! Check step " .. tostring(i)
        end
    end
    return true, "MANOUSHE_ZAATAR_READY"
end

function ActivityAdapters.validateWordSignageDiscovery(discoveredSignIds: { string }): (boolean, string)
    if #discoveredSignIds < 3 then
        return false, "DISCOVER_MORE_SIGNS"
    end
    return true, "VOCABULARY_DISCOVERED"
end

return ActivityAdapters
