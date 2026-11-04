--!strict
-- MiraVerse v0.7 (Option A) — Native Roblox Quest HUD, Dialogue, Passport & RTL Layout (AG06)

local NativeQuestHud = {}

function NativeQuestHud.formatObjectiveBanner(countryId: string, stepName: string, locale: string): { text: string, isRtl: boolean }
    local isRtl = (locale == "ar-LB" or locale == "ar-EG" or locale == "ar-IQ")
    return {
        text = string.format("[%s] Active Quest Step: %s", countryId, stepName),
        isRtl = isRtl,
    }
end

return NativeQuestHud
