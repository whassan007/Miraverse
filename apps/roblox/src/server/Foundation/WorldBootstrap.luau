--!strict
-- MiraVerse v0.7 (Option A) — Server Foundation, Hub Orchestration & Safe Remotes (CL03)

local WorldBootstrap = {}

export type WorldZoneConfig = {
    countryId: string,
    title: string,
    spawnPosition: { x: number, y: number, z: number },
    portalPosition: { x: number, y: number, z: number },
    isPrimaryFlagship: boolean,
}

WorldBootstrap.HUB_SPAWN = { x = 0, y = 6, z = 0 }

WorldBootstrap.WORLD_ZONES = {
    LB = {
        countryId = "LB",
        title = "Byblos Harbor & Teta's Stone House",
        spawnPosition = { x = -220, y = 8, z = 0 },
        portalPosition = { x = -18, y = 6, z = -24 },
        isPrimaryFlagship = true,
    },
    EG = {
        countryId = "EG",
        title = "Cairo Fanous Courtyard",
        spawnPosition = { x = 0, y = 8, z = 220 },
        portalPosition = { x = -9, y = 6, z = -28 },
        isPrimaryFlagship = false,
    },
    IQ = {
        countryId = "IQ",
        title = "Baghdad Shanasheel & Tigris Riverfront",
        spawnPosition = { x = 0, y = 8, z = -220 },
        portalPosition = { x = 0, y = 6, z = -30 },
        isPrimaryFlagship = false,
    },
    KR = {
        countryId = "KR",
        title = "Jeonju Hanok Village",
        spawnPosition = { x = 220, y = 8, z = 220 },
        portalPosition = { x = 9, y = 6, z = -28 },
        isPrimaryFlagship = false,
    },
    FR = {
        countryId = "FR",
        title = "Vieux Lyon Traboules & Boulangerie",
        spawnPosition = { x = 220, y = 8, z = 0 },
        portalPosition = { x = 18, y = 6, z = -24 },
        isPrimaryFlagship = false,
    },
}

WorldBootstrap.ALLOWED_REMOTES = {
    RequestWorldArrival = true,
    RequestChallengeAction = true,
    RequestPlotPlacement = true,
    RequestPlotCollaboratorChange = true,
    RequestFriendInvitePrompt = true,
    RequestAvatarLoadoutSave = true,
}

function WorldBootstrap.resolveArrivalZone(savedCountryId: string?, requestedLaunchHint: string?): WorldZoneConfig
    -- Untrusted launch hint can suggest a destination only if it is in the allowlist
    if savedCountryId and WorldBootstrap.WORLD_ZONES[savedCountryId] then
        return WorldBootstrap.WORLD_ZONES[savedCountryId]
    end
    if requestedLaunchHint and WorldBootstrap.WORLD_ZONES[requestedLaunchHint] then
        return WorldBootstrap.WORLD_ZONES[requestedLaunchHint]
    end
    return WorldBootstrap.WORLD_ZONES.LB
end

return WorldBootstrap
