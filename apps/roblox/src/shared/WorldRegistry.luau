--!strict
-- The single source of truth for world layout. Builders, travel, and stations read only this.
local WorldRegistry = {}

-- Each country owns a square cell, so scenes cannot overlap while they stay inside it.
WorldRegistry.CELL_SIZE = 800
WorldRegistry.GROUND_Y = 10
WorldRegistry.LOBBY = Vector3.new(0, 10, 0)
WorldRegistry.COUNTRY_ORDER = { "LB", "EG", "IQ", "KR", "FR", "DE", "CN", "JP", "RU", "UA", "MA" }

local INDEX = {
	LB = 1,
	EG = 2,
	IQ = 3,
	KR = 4,
	FR = 5,
	DE = 6,
	CN = 7,
	JP = 8,
	RU = 9,
	UA = 10,
	MA = 11,
}

function WorldRegistry.origin(country: string): Vector3?
	local index = (INDEX :: any)[country]
	if not index then
		return nil
	end
	return Vector3.new(index * WorldRegistry.CELL_SIZE, WorldRegistry.GROUND_Y, 0)
end

export type LocationInfo = {
	id: string,
	name: string,
	country: string,
	locationType: "city" | "region",
	offset: Vector3,
	spawnOffset: Vector3,
	terrainDestId: string,
}

-- Data-driven destinations per country
WorldRegistry.LOCATIONS = {
	LB = {
		byblos = { id = "byblos", name = "Byblos (Jbeil)", country = "LB", locationType = "city", offset = Vector3.new(0, 0, 0), spawnOffset = Vector3.new(0, 0.5, 28), terrainDestId = "LB_byblos" },
		mount_lebanon = { id = "mount_lebanon", name = "Mount Lebanon", country = "LB", locationType = "region", offset = Vector3.new(0, 15, 240), spawnOffset = Vector3.new(0, 15.5, 240), terrainDestId = "LB_mount_lebanon" },
		beirut = { id = "beirut", name = "Beirut", country = "LB", locationType = "city", offset = Vector3.new(0, 2, -240), spawnOffset = Vector3.new(0, 2.5, -240), terrainDestId = "LB_beirut" },
	},
	EG = {
		cairo = { id = "cairo", name = "Cairo", country = "EG", locationType = "city", offset = Vector3.new(0, 0, 0), spawnOffset = Vector3.new(0, 0.5, 28), terrainDestId = "EG_cairo" },
		alexandria = { id = "alexandria", name = "Alexandria", country = "EG", locationType = "city", offset = Vector3.new(0, 0, -240), spawnOffset = Vector3.new(0, 0.5, -240), terrainDestId = "EG_alexandria" },
		aswan = { id = "aswan", name = "Aswan", country = "EG", locationType = "region", offset = Vector3.new(0, 5, 240), spawnOffset = Vector3.new(0, 5.5, 240), terrainDestId = "EG_aswan" },
	},
	IQ = {
		baghdad = { id = "baghdad", name = "Baghdad", country = "IQ", locationType = "city", offset = Vector3.new(0, 0, 0), spawnOffset = Vector3.new(0, 0.5, 28), terrainDestId = "IQ_baghdad" },
		erbil = { id = "erbil", name = "Erbil Citadel", country = "IQ", locationType = "city", offset = Vector3.new(0, 8, -240), spawnOffset = Vector3.new(0, 8.5, -240), terrainDestId = "IQ_erbil" },
		basra = { id = "basra", name = "Basra", country = "IQ", locationType = "city", offset = Vector3.new(0, 0, 240), spawnOffset = Vector3.new(0, 0.5, 240), terrainDestId = "IQ_basra" },
	},
	KR = {
		jeonju = { id = "jeonju", name = "Jeonju", country = "KR", locationType = "city", offset = Vector3.new(0, 0, 0), spawnOffset = Vector3.new(0, 0.5, 28), terrainDestId = "KR_jeonju" },
		seoul = { id = "seoul", name = "Seoul", country = "KR", locationType = "city", offset = Vector3.new(0, 4, -240), spawnOffset = Vector3.new(0, 4.5, -240), terrainDestId = "KR_seoul" },
		busan = { id = "busan", name = "Busan", country = "KR", locationType = "city", offset = Vector3.new(0, 2, 240), spawnOffset = Vector3.new(0, 2.5, 240), terrainDestId = "KR_busan" },
	},
	FR = {
		lyon = { id = "lyon", name = "Vieux Lyon", country = "FR", locationType = "city", offset = Vector3.new(0, 0, 0), spawnOffset = Vector3.new(0, 0.5, 28), terrainDestId = "FR_lyon" },
		paris = { id = "paris", name = "Paris", country = "FR", locationType = "city", offset = Vector3.new(0, 0, -240), spawnOffset = Vector3.new(0, 0.5, -240), terrainDestId = "FR_paris" },
		marseille = { id = "marseille", name = "Marseille", country = "FR", locationType = "city", offset = Vector3.new(0, 2, 240), spawnOffset = Vector3.new(0, 2.5, 240), terrainDestId = "FR_marseille" },
	},
	DE = {
		rhine = { id = "rhine", name = "Middle Rhine", country = "DE", locationType = "region", offset = Vector3.new(0, 0, 0), spawnOffset = Vector3.new(0, 0.5, 28), terrainDestId = "DE_rhine" },
	},
	CN = {
		wuling = { id = "wuling", name = "Wuling Peach Blossom Spring", country = "CN", locationType = "region", offset = Vector3.new(0, 0, 0), spawnOffset = Vector3.new(0, 0.5, 28), terrainDestId = "CN_wuling" },
	},
	JP = {
		tohoku = { id = "tohoku", name = "Tohoku Bashō Journey", country = "JP", locationType = "region", offset = Vector3.new(0, 0, 0), spawnOffset = Vector3.new(0, 0.5, 28), terrainDestId = "JP_tohoru" },
	},
	RU = {
		svetloyar = { id = "svetloyar", name = "Lake Svetloyar", country = "RU", locationType = "region", offset = Vector3.new(0, 0, 0), spawnOffset = Vector3.new(0, 0.5, 28), terrainDestId = "RU_svetloyar" },
	},
	UA = {
		kyiv = { id = "kyiv", name = "Kyiv Hills", country = "UA", locationType = "region", offset = Vector3.new(0, 0, 0), spawnOffset = Vector3.new(0, 0.5, 28), terrainDestId = "UA_kyiv" },
	},
	MA = {
		marrakesh = { id = "marrakesh", name = "Marrakesh", country = "MA", locationType = "region", offset = Vector3.new(0, 0, 0), spawnOffset = Vector3.new(0, 0.5, 28), terrainDestId = "MA_marrakesh" },
	},
} :: { [string]: { [string]: LocationInfo } }

export type Station = { kind: string, label: string, x: number, z: number, faceX: number, faceZ: number }

-- Offsets are relative to the country origin. faceX/faceZ is the point the challenge opens toward.
WorldRegistry.STATIONS = {
	LB = {
		build = { kind = "build", label = "Stone House to Restore", x = 22, z = -14, faceX = 22, faceZ = -40 },
		cook = { kind = "cook", label = "Saj Kitchen", x = -14, z = -14, faceX = -14, faceZ = -30 },
		gather = { kind = "gather", label = "Terrace Harvest", x = -66, z = 14, faceX = -66, faceZ = 0 },
		trade = { kind = "trade", label = "Old Stone Souk", x = 26, z = 0, faceX = 40, faceZ = 0 },
		word = { kind = "word", label = "Teta's Courtyard", x = -12, z = 2, faceX = -30, faceZ = 2 },
	},
	EG = {
		build = { kind = "build", label = "Lantern Workshop", x = 20, z = -15, faceX = 20, faceZ = -35 },
		cook = { kind = "cook", label = "Kushari Hearth", x = -15, z = -15, faceX = -15, faceZ = -30 },
		gather = { kind = "gather", label = "Papyrus Reed Harvest", x = -40, z = 15, faceX = -40, faceZ = 0 },
		trade = { kind = "trade", label = "Khan el-Khalili Bazaar", x = 25, z = 0, faceX = 35, faceZ = 0 },
		word = { kind = "word", label = "Courtyard of Samira", x = -10, z = 0, faceX = -25, faceZ = 0 },
	},
	IQ = {
		build = { kind = "build", label = "House of Wisdom Hall", x = 20, z = -15, faceX = 20, faceZ = -35 },
		cook = { kind = "cook", label = "Samawa Bakery", x = -15, z = -15, faceX = -15, faceZ = -30 },
		gather = { kind = "gather", label = "Date Palm Grove", x = -40, z = 15, faceX = -40, faceZ = 0 },
		trade = { kind = "trade", label = "Al-Mutanabbi Book Market", x = 25, z = 0, faceX = 35, faceZ = 0 },
		word = { kind = "word", label = "Amal's Shanasheel Terrace", x = -10, z = 0, faceX = -25, faceZ = 0 },
	},
	KR = {
		build = { kind = "build", label = "Hanok Wood Framer", x = 20, z = -15, faceX = 20, faceZ = -35 },
		cook = { kind = "cook", label = "Bibimbap Kitchen", x = -15, z = -15, faceX = -15, faceZ = -30 },
		gather = { kind = "gather", label = "Wild Mountain Herbs", x = -40, z = 15, faceX = -40, faceZ = 0 },
		trade = { kind = "trade", label = "Nambu Traditional Market", x = 25, z = 0, faceX = 35, faceZ = 0 },
		word = { kind = "word", label = "Halmeoni's Hanok Courtyard", x = -10, z = 0, faceX = -25, faceZ = 0 },
	},
	FR = {
		build = { kind = "build", label = "Silk Loom Atelier", x = 20, z = -15, faceX = 20, faceZ = -35 },
		cook = { kind = "cook", label = "Bouchon Lyonnais", x = -15, z = -15, faceX = -15, faceZ = -30 },
		gather = { kind = "gather", label = "Saône River Orchard", x = -40, z = 15, faceX = -40, faceZ = 0 },
		trade = { kind = "trade", label = "Marché Saint-Antoine", x = 25, z = 0, faceX = 35, faceZ = 0 },
		word = { kind = "word", label = "Mamie Claire's Traboule", x = -10, z = 0, faceX = -25, faceZ = 0 },
	},
} :: { [string]: { [string]: Station } }

function WorldRegistry.station(country: string, kind: string): Station?
	local stations = WorldRegistry.STATIONS[country]
	return stations and stations[kind]
end

function WorldRegistry.location(country: string, locationId: string): LocationInfo?
	local locs = WorldRegistry.LOCATIONS[country]
	return locs and locs[locationId]
end

function WorldRegistry.destinationOrigin(country: string, locationId: string): Vector3?
	local countryOrigin = WorldRegistry.origin(country)
	if not countryOrigin then
		return nil
	end
	local loc = WorldRegistry.location(country, locationId)
	if not loc then
		return countryOrigin
	end
	return countryOrigin + loc.offset
end

return WorldRegistry
