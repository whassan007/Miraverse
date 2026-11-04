--!strict
-- The single source of truth for world layout, country cells, and multi-location metadata.
-- Supports all 11 Miraverse countries and all 21 geographically verified playable destinations.
-- Builders, travel, persistence and stations read only this module.
local WorldRegistry = {}

-- Each country owns a square cell, so scenes cannot overlap while they stay inside it.
WorldRegistry.CELL_SIZE = 800
WorldRegistry.GROUND_Y = 10
WorldRegistry.LOBBY = Vector3.new(0, 10, 0)

-- Original 5 Chapter-1 quest countries
WorldRegistry.COUNTRY_ORDER = { "LB", "EG", "IQ", "KR", "FR" }

-- Full 11 supported countries (5 original + 6 Echoes of Home global catalog countries)
WorldRegistry.ALL_COUNTRIES = { "LB", "EG", "IQ", "KR", "FR", "DE", "CN", "JP", "RU", "UA", "MA" }

local INDEX: { [string]: number } = {
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

export type Station = {
	kind: string,
	label: string,
	x: number,
	z: number,
	faceX: number,
	faceZ: number,
}

export type SpatialBounds = {
	min: Vector3,
	max: Vector3,
}

export type LocationType = "city" | "region"

export type GeographicSetting = "real_geography" | "literary_inspired_real_geography"

export type LocationDef = {
	locationId: string,
	countryId: string,
	locationType: LocationType,
	geographicSetting: GeographicSetting,
	detailLevel: number,
	displayName: string,
	origin: Vector3,
	spawn: Vector3,
	stations: { [string]: Station },
	spatialBounds: SpatialBounds,
	travelConnections: { string },
}

-- Offsets are relative to the location origin. faceX/faceZ is the point the challenge opens toward.
local BYBLOS_STATIONS: { [string]: Station } = {
	build = { kind = "build", label = "Stone House to Restore", x = 22, z = -14, faceX = 22, faceZ = -40 },
	cook = { kind = "cook", label = "Saj Kitchen", x = -14, z = -14, faceX = -14, faceZ = -30 },
	gather = { kind = "gather", label = "Terrace Harvest", x = -66, z = 14, faceX = -66, faceZ = 0 },
	trade = { kind = "trade", label = "Old Stone Souk", x = 26, z = 0, faceX = 40, faceZ = 0 },
	word = { kind = "word", label = "Teta's Courtyard", x = -12, z = 2, faceX = -30, faceZ = 2 },
}

-- Backward-compatible country station lookup (Lebanon's five challenges remain in Byblos).
WorldRegistry.STATIONS = {
	LB = BYBLOS_STATIONS,
} :: { [string]: { [string]: Station } }

-- Default entry location when entering a country from the Travel Lobby or migrating a legacy save.
WorldRegistry.DEFAULT_LOCATION = {
	LB = "byblos",
	EG = "cairo",
	IQ = "baghdad",
	KR = "jeonju",
	FR = "lyon",
	DE = "rhine_valley",
	CN = "wuling_valley",
	JP = "tohoku_route",
	RU = "lake_svetloyar",
	UA = "kyiv_hills",
	MA = "marrakesh",
} :: { [string]: string }

-- Per-country ordered location IDs across all 11 countries (21 total locations).
WorldRegistry.COUNTRY_LOCATIONS = {
	LB = { "byblos", "mount_lebanon", "beirut" },
	EG = { "cairo", "alexandria", "aswan" },
	IQ = { "baghdad", "erbil", "basra" },
	KR = { "jeonju", "seoul", "busan" },
	FR = { "lyon", "paris", "marseille" },
	DE = { "rhine_valley" },
	CN = { "wuling_valley" },
	JP = { "tohoku_route" },
	RU = { "lake_svetloyar" },
	UA = { "kyiv_hills" },
	MA = { "marrakesh" },
} :: { [string]: { string } }

local function cellCenterX(cc: string): number
	local idx = INDEX[cc] or 1
	return idx * WorldRegistry.CELL_SIZE
end

-- Authoritative location definitions beneath each country (21 total destinations).
WorldRegistry.LOCATIONS = {
	-- === 1. LEBANON (LB) ===
	byblos = {
		locationId = "byblos",
		countryId = "LB",
		locationType = "city",
		geographicSetting = "real_geography",
		detailLevel = 3,
		displayName = "Byblos",
		origin = Vector3.new(cellCenterX("LB"), WorldRegistry.GROUND_Y, 0),
		spawn = Vector3.new(cellCenterX("LB"), WorldRegistry.GROUND_Y + 0.5, 28),
		stations = BYBLOS_STATIONS,
		spatialBounds = {
			min = Vector3.new(cellCenterX("LB") - 120, -20, -195),
			max = Vector3.new(cellCenterX("LB") + 120, 90, 162),
		},
		travelConnections = { "LOBBY", "mount_lebanon", "beirut" },
	},
	mount_lebanon = {
		locationId = "mount_lebanon",
		countryId = "LB",
		locationType = "region",
		geographicSetting = "real_geography",
		detailLevel = 2,
		displayName = "Mount Lebanon",
		origin = Vector3.new(cellCenterX("LB"), 38, 260),
		spawn = Vector3.new(cellCenterX("LB"), 38.5, 288),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("LB") - 140, 10, 170),
			max = Vector3.new(cellCenterX("LB") + 140, 140, 390),
		},
		travelConnections = { "byblos", "beirut", "LOBBY" },
	},
	beirut = {
		locationId = "beirut",
		countryId = "LB",
		locationType = "city",
		geographicSetting = "real_geography",
		detailLevel = 3,
		displayName = "Beirut",
		origin = Vector3.new(cellCenterX("LB"), 14, -310),
		spawn = Vector3.new(cellCenterX("LB"), 14.5, -282),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("LB") - 120, -15, -420),
			max = Vector3.new(cellCenterX("LB") + 120, 95, -205),
		},
		travelConnections = { "byblos", "mount_lebanon", "LOBBY" },
	},

	-- === 2. EGYPT (EG) ===
	cairo = {
		locationId = "cairo",
		countryId = "EG",
		locationType = "city",
		geographicSetting = "real_geography",
		detailLevel = 3,
		displayName = "Cairo",
		origin = Vector3.new(cellCenterX("EG"), WorldRegistry.GROUND_Y, 0),
		spawn = Vector3.new(cellCenterX("EG"), WorldRegistry.GROUND_Y + 0.5, 28),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("EG") - 120, -20, -120),
			max = Vector3.new(cellCenterX("EG") + 120, 90, 120),
		},
		travelConnections = { "LOBBY", "alexandria", "aswan" },
	},
	alexandria = {
		locationId = "alexandria",
		countryId = "EG",
		locationType = "region",
		geographicSetting = "real_geography",
		detailLevel = 2,
		displayName = "Alexandria",
		origin = Vector3.new(cellCenterX("EG"), 10, -260),
		spawn = Vector3.new(cellCenterX("EG"), 10.5, -232),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("EG") - 120, -15, -370),
			max = Vector3.new(cellCenterX("EG") + 120, 80, -150),
		},
		travelConnections = { "cairo", "aswan", "LOBBY" },
	},
	aswan = {
		locationId = "aswan",
		countryId = "EG",
		locationType = "region",
		geographicSetting = "real_geography",
		detailLevel = 2,
		displayName = "Aswan",
		origin = Vector3.new(cellCenterX("EG"), 18, 260),
		spawn = Vector3.new(cellCenterX("EG"), 18.5, 288),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("EG") - 120, -5, 150),
			max = Vector3.new(cellCenterX("EG") + 120, 110, 370),
		},
		travelConnections = { "cairo", "alexandria", "LOBBY" },
	},

	-- === 3. IRAQ (IQ) ===
	baghdad = {
		locationId = "baghdad",
		countryId = "IQ",
		locationType = "city",
		geographicSetting = "real_geography",
		detailLevel = 3,
		displayName = "Baghdad",
		origin = Vector3.new(cellCenterX("IQ"), WorldRegistry.GROUND_Y, 0),
		spawn = Vector3.new(cellCenterX("IQ"), WorldRegistry.GROUND_Y + 0.5, 28),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("IQ") - 120, -20, -120),
			max = Vector3.new(cellCenterX("IQ") + 120, 90, 120),
		},
		travelConnections = { "LOBBY", "erbil", "basra" },
	},
	erbil = {
		locationId = "erbil",
		countryId = "IQ",
		locationType = "region",
		geographicSetting = "real_geography",
		detailLevel = 2,
		displayName = "Erbil",
		origin = Vector3.new(cellCenterX("IQ"), 30, 260),
		spawn = Vector3.new(cellCenterX("IQ"), 30.5, 288),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("IQ") - 120, 5, 150),
			max = Vector3.new(cellCenterX("IQ") + 120, 125, 370),
		},
		travelConnections = { "baghdad", "basra", "LOBBY" },
	},
	basra = {
		locationId = "basra",
		countryId = "IQ",
		locationType = "region",
		geographicSetting = "real_geography",
		detailLevel = 2,
		displayName = "Basra",
		origin = Vector3.new(cellCenterX("IQ"), 8, -260),
		spawn = Vector3.new(cellCenterX("IQ"), 8.5, -232),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("IQ") - 120, -15, -370),
			max = Vector3.new(cellCenterX("IQ") + 120, 75, -150),
		},
		travelConnections = { "baghdad", "erbil", "LOBBY" },
	},

	-- === 4. SOUTH KOREA (KR) ===
	jeonju = {
		locationId = "jeonju",
		countryId = "KR",
		locationType = "city",
		geographicSetting = "real_geography",
		detailLevel = 3,
		displayName = "Jeonju",
		origin = Vector3.new(cellCenterX("KR"), WorldRegistry.GROUND_Y, 0),
		spawn = Vector3.new(cellCenterX("KR"), WorldRegistry.GROUND_Y + 0.5, 28),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("KR") - 120, -20, -120),
			max = Vector3.new(cellCenterX("KR") + 120, 90, 120),
		},
		travelConnections = { "LOBBY", "seoul", "busan" },
	},
	seoul = {
		locationId = "seoul",
		countryId = "KR",
		locationType = "region",
		geographicSetting = "real_geography",
		detailLevel = 2,
		displayName = "Seoul",
		origin = Vector3.new(cellCenterX("KR"), 22, 260),
		spawn = Vector3.new(cellCenterX("KR"), 22.5, 288),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("KR") - 120, 0, 150),
			max = Vector3.new(cellCenterX("KR") + 120, 115, 370),
		},
		travelConnections = { "jeonju", "busan", "LOBBY" },
	},
	busan = {
		locationId = "busan",
		countryId = "KR",
		locationType = "region",
		geographicSetting = "real_geography",
		detailLevel = 2,
		displayName = "Busan",
		origin = Vector3.new(cellCenterX("KR"), 12, -260),
		spawn = Vector3.new(cellCenterX("KR"), 12.5, -232),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("KR") - 120, -15, -370),
			max = Vector3.new(cellCenterX("KR") + 120, 95, -150),
		},
		travelConnections = { "jeonju", "seoul", "LOBBY" },
	},

	-- === 5. FRANCE (FR) ===
	lyon = {
		locationId = "lyon",
		countryId = "FR",
		locationType = "city",
		geographicSetting = "real_geography",
		detailLevel = 3,
		displayName = "Lyon",
		origin = Vector3.new(cellCenterX("FR"), WorldRegistry.GROUND_Y, 0),
		spawn = Vector3.new(cellCenterX("FR"), WorldRegistry.GROUND_Y + 0.5, 28),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("FR") - 120, -20, -120),
			max = Vector3.new(cellCenterX("FR") + 120, 90, 120),
		},
		travelConnections = { "LOBBY", "paris", "marseille" },
	},
	paris = {
		locationId = "paris",
		countryId = "FR",
		locationType = "region",
		geographicSetting = "real_geography",
		detailLevel = 2,
		displayName = "Paris",
		origin = Vector3.new(cellCenterX("FR"), 14, 260),
		spawn = Vector3.new(cellCenterX("FR"), 14.5, 288),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("FR") - 120, -5, 150),
			max = Vector3.new(cellCenterX("FR") + 120, 95, 370),
		},
		travelConnections = { "lyon", "marseille", "LOBBY" },
	},
	marseille = {
		locationId = "marseille",
		countryId = "FR",
		locationType = "region",
		geographicSetting = "real_geography",
		detailLevel = 2,
		displayName = "Marseille",
		origin = Vector3.new(cellCenterX("FR"), 12, -260),
		spawn = Vector3.new(cellCenterX("FR"), 12.5, -232),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("FR") - 120, -15, -370),
			max = Vector3.new(cellCenterX("FR") + 120, 95, -150),
		},
		travelConnections = { "lyon", "paris", "LOBBY" },
	},

	-- === 6. GERMANY (DE) — Rhine Region ===
	rhine_valley = {
		locationId = "rhine_valley",
		countryId = "DE",
		locationType = "region",
		geographicSetting = "literary_inspired_real_geography",
		detailLevel = 2,
		displayName = "Upper Middle Rhine Gorge",
		origin = Vector3.new(cellCenterX("DE"), 18, 0),
		spawn = Vector3.new(cellCenterX("DE"), 18.5, 28),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("DE") - 130, -10, -130),
			max = Vector3.new(cellCenterX("DE") + 130, 110, 130),
		},
		travelConnections = { "LOBBY" },
	},

	-- === 7. CHINA (CN) — Wuling-Inspired Peach Blossom Spring ===
	wuling_valley = {
		locationId = "wuling_valley",
		countryId = "CN",
		locationType = "region",
		geographicSetting = "literary_inspired_real_geography",
		detailLevel = 2,
		displayName = "Wuling Peach Blossom Valley",
		origin = Vector3.new(cellCenterX("CN"), 20, 0),
		spawn = Vector3.new(cellCenterX("CN"), 20.5, 28),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("CN") - 130, -10, -130),
			max = Vector3.new(cellCenterX("CN") + 130, 115, 130),
		},
		travelConnections = { "LOBBY" },
	},

	-- === 8. JAPAN (JP) — Bashō-Inspired Tohoku Journey ===
	tohoku_route = {
		locationId = "tohoku_route",
		countryId = "JP",
		locationType = "region",
		geographicSetting = "literary_inspired_real_geography",
		detailLevel = 2,
		displayName = "Bashō Tohoku Route (Yamadera to Matsushima)",
		origin = Vector3.new(cellCenterX("JP"), 16, 0),
		spawn = Vector3.new(cellCenterX("JP"), 16.5, 28),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("JP") - 130, -20, -165),
			max = Vector3.new(cellCenterX("JP") + 130, 120, 165),
		},
		travelConnections = { "LOBBY" },
	},

	-- === 9. RUSSIA (RU) — Lake Svetloyar ===
	lake_svetloyar = {
		locationId = "lake_svetloyar",
		countryId = "RU",
		locationType = "region",
		geographicSetting = "literary_inspired_real_geography",
		detailLevel = 2,
		displayName = "Lake Svetloyar Basin",
		origin = Vector3.new(cellCenterX("RU"), 12, 0),
		spawn = Vector3.new(cellCenterX("RU"), 12.5, 28),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("RU") - 130, -20, -165),
			max = Vector3.new(cellCenterX("RU") + 130, 95, 165),
		},
		travelConnections = { "LOBBY" },
	},

	-- === 10. UKRAINE (UA) — Kyiv Hills and Dnipro River ===
	kyiv_hills = {
		locationId = "kyiv_hills",
		countryId = "UA",
		locationType = "region",
		geographicSetting = "real_geography",
		detailLevel = 2,
		displayName = "Kyiv Hills & Dnipro River",
		origin = Vector3.new(cellCenterX("UA"), 18, 0),
		spawn = Vector3.new(cellCenterX("UA"), 18.5, 28),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("UA") - 130, -20, -165),
			max = Vector3.new(cellCenterX("UA") + 130, 110, 165),
		},
		travelConnections = { "LOBBY" },
	},

	-- === 11. MOROCCO (MA) — Marrakesh and Regional Atlas Horizon ===
	marrakesh = {
		locationId = "marrakesh",
		countryId = "MA",
		locationType = "region",
		geographicSetting = "real_geography",
		detailLevel = 2,
		displayName = "Marrakesh Medina & Haouz Horizon",
		origin = Vector3.new(cellCenterX("MA"), 12, 0),
		spawn = Vector3.new(cellCenterX("MA"), 12.5, 28),
		stations = {},
		spatialBounds = {
			min = Vector3.new(cellCenterX("MA") - 130, -20, -165),
			max = Vector3.new(cellCenterX("MA") + 130, 115, 165),
		},
		travelConnections = { "LOBBY" },
	},
} :: { [string]: LocationDef }

local LOCATION_ALIASES: { [string]: string } = {
	tohoku_waystation = "tohoku_route",
	marrakesh_atlas = "marrakesh",
}

function WorldRegistry.origin(country: string): Vector3?
	local index = INDEX[country]
	if not index then
		return nil
	end
	return Vector3.new(index * WorldRegistry.CELL_SIZE, WorldRegistry.GROUND_Y, 0)
end

function WorldRegistry.isValidCountry(country: any): boolean
	return type(country) == "string" and INDEX[string.upper(country)] ~= nil
end

function WorldRegistry.getLocation(locationId: any): LocationDef?
	if type(locationId) ~= "string" then
		return nil
	end
	local lower = string.lower(locationId)
	local canonical = LOCATION_ALIASES[lower] or lower
	return WorldRegistry.LOCATIONS[canonical]
end

function WorldRegistry.defaultLocationId(country: any): string?
	if type(country) ~= "string" then
		return nil
	end
	return WorldRegistry.DEFAULT_LOCATION[string.upper(country)]
end

function WorldRegistry.defaultLocation(country: any): LocationDef?
	local locId = WorldRegistry.defaultLocationId(country)
	if not locId then
		return nil
	end
	return WorldRegistry.LOCATIONS[locId]
end

function WorldRegistry.locationsForCountry(country: any): { LocationDef }
	local result: { LocationDef } = {}
	if type(country) ~= "string" then
		return result
	end
	local ids = WorldRegistry.COUNTRY_LOCATIONS[string.upper(country)]
	if not ids then
		return result
	end
	for _, id in ipairs(ids) do
		local loc = WorldRegistry.LOCATIONS[id]
		if loc then
			table.insert(result, loc)
		end
	end
	return result
end

function WorldRegistry.station(countryOrLocation: string, kind: string): Station?
	local loc = WorldRegistry.getLocation(countryOrLocation)
	if loc then
		return loc.stations and loc.stations[kind]
	end
	local stations = WorldRegistry.STATIONS[string.upper(countryOrLocation)]
	return stations and stations[kind]
end

function WorldRegistry.locationStation(locationId: string, kind: string): Station?
	local loc = WorldRegistry.getLocation(locationId)
	if not loc or not loc.stations then
		return nil
	end
	return loc.stations[kind]
end

function WorldRegistry.hasStations(countryOrLocation: string, locationId: string?): boolean
	local loc = if locationId then WorldRegistry.getLocation(locationId) else WorldRegistry.getLocation(countryOrLocation)
	if loc then
		return loc.stations ~= nil and next(loc.stations) ~= nil
	end
	local defaultLoc = WorldRegistry.defaultLocation(countryOrLocation)
	if defaultLoc then
		return defaultLoc.stations ~= nil and next(defaultLoc.stations) ~= nil
	end
	return false
end

function WorldRegistry.getRoutes(countryOrLocation: string, locationId: string?): { string }
	local loc = if locationId then WorldRegistry.getLocation(locationId) else WorldRegistry.getLocation(countryOrLocation)
	if not loc then
		loc = WorldRegistry.defaultLocation(countryOrLocation)
	end
	if not loc or not loc.travelConnections then
		return {}
	end
	local routes: { string } = {}
	for _, dest in ipairs(loc.travelConnections) do
		table.insert(routes, dest)
	end
	return routes
end

function WorldRegistry.canTravel(fromLocationId: string?, toDestinationId: string): boolean
	if toDestinationId == "LOBBY" then
		return fromLocationId ~= nil
	end
	local targetLoc = WorldRegistry.getLocation(toDestinationId)
	if not targetLoc then
		return false
	end
	if fromLocationId == nil or fromLocationId == "LOBBY" then
		for _, conn in ipairs(targetLoc.travelConnections) do
			if conn == "LOBBY" then
				return true
			end
		end
		return false
	end
	local fromLoc = WorldRegistry.getLocation(fromLocationId)
	if not fromLoc then
		return false
	end
	for _, conn in ipairs(fromLoc.travelConnections) do
		if conn == targetLoc.locationId then
			return true
		end
	end
	return false
end

function WorldRegistry.containsPoint(bounds: SpatialBounds, point: Vector3): boolean
	return point.X >= bounds.min.X
		and point.X <= bounds.max.X
		and point.Y >= bounds.min.Y
		and point.Y <= bounds.max.Y
		and point.Z >= bounds.min.Z
		and point.Z <= bounds.max.Z
end

function WorldRegistry.boundsOverlap(a: SpatialBounds, b: SpatialBounds): boolean
	return a.min.X <= b.max.X
		and a.max.X >= b.min.X
		and a.min.Y <= b.max.Y
		and a.max.Y >= b.min.Y
		and a.min.Z <= b.max.Z
		and a.max.Z >= b.min.Z
end

return WorldRegistry
