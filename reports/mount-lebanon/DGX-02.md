# DGX-02: Location registry design and validation specification

- **Backend**: DGX Spark (LM Studio local inference)
- **Model**: `qwen/qwen3.8-27b`
- **Worktree**: `/home/wael/Code/mv-wt-ml/DGX-02`
- **Start**: 2026-11-04T18:39:09.377Z
- **End**: 2026-11-04T18:44:07.532Z
- **Tokens**: {"prompt_tokens":848,"completion_tokens":6793,"total_tokens":7641,"completion_tokens_details":{"reasoning_tokens":5368}}

---



## WorldRegistry Location Model

Add `Location` as the canonical data source. Existing country APIs remain as backward-compatible projections.

```luau
--!strict
local WorldRegistry = {}

WorldRegistry.CELL_SIZE = 800
WorldRegistry.GROUND_Y = 10
WorldRegistry.LOBBY = Vector3.new(0, 10, 0)
WorldRegistry.COUNTRY_ORDER = { "LB", "EG", "IQ", "KR", "FR" }

export type LocationType = "city" | "region"
export type SpatialBounds = { min: Vector3, max: Vector3 }
export type Station = { kind: string, label: string, x: number, z: number, faceX: number, faceZ: number }
export type Location = {
	locationId: string,
	countryId: string,
	locationType: LocationType,
	displayName: string,
	origin: Vector3,
	spawn: Vector3,
	stations: { [string]: Station },
	spatialBounds: SpatialBounds,
	travelConnections: { string },
}

local INDEX = { LB = 1, EG = 2, IQ = 3, KR = 4, FR = 5 }

local function countryOrigin(countryId: string): Vector3?
	local index = (INDEX :: any)[countryId]
	if not index then
		return nil
	end
	return Vector3.new(index * WorldRegistry.CELL_SIZE, WorldRegistry.GROUND_Y, 0)
end

WorldRegistry.origin = function(country: string): Vector3?
	return countryOrigin(country)
end

local LOCATIONS: { [string]: Location } = {
	byblos = {
		locationId = "byblos",
		countryId = "LB",
		locationType = "city",
		displayName = "Byblos",
		origin = Vector3.new(800, 10, 0),
		spawn = Vector3.new(800, 10, 0),
		stations = {
			build = { kind = "build", label = "Stone House to Restore", x = 22, z = -14, faceX = 22, faceZ = -40 },
		},
		spatialBounds = {
			min = Vector3.new(400, 0, -400),
			max = Vector3.new(1200, 100, 400),
		},
		travelConnections = { "LOBBY" },
	},
	-- mount_lebanon, cairo, baghdad, jeonju, lyon follow the same shape.
}

WorldRegistry.LOCATIONS = LOCATIONS
WorldRegistry.LOCATION_ORDER = { "byblos", "mount_lebanon", "cairo", "baghdad", "jeonju", "lyon" }
WorldRegistry.locationIds = WorldRegistry.LOCATION_ORDER

WorldRegistry.location = function(locationId: string): Location?
	return LOCATIONS[locationId]
end

WorldRegistry.countryOf = function(locationId: string): string?
	local loc = LOCATIONS[locationId]
	return loc and loc.countryId
end

WorldRegistry.displayName = function(locationId: string): string?
	local loc = LOCATIONS[locationId]
	return loc and loc.displayName
end

WorldRegistry.locationType = function(locationId: string): LocationType?
	local loc = LOCATIONS[locationId]
	return loc and loc.locationType
end

WorldRegistry.spawn = function(locationId: string): Vector3?
	local loc = LOCATIONS[locationId]
	return loc and loc.spawn
end

WorldRegistry.bounds = function(locationId: string): SpatialBounds?
	local loc = LOCATIONS[locationId]
	return loc and loc.spatialBounds
end

WorldRegistry.locationStation = function(locationId: string, kind: string): Station?
	local loc = LOCATIONS[locationId]
	return loc and loc.stations[kind]
end

WorldRegistry.locationsForCountry = function(countryId: string): { Location }
	local out = {}
	for _, id in WorldRegistry.LOCATION_ORDER do
		local loc = LOCATIONS[id]
		if loc and loc.countryId == countryId then
			table.insert(out, loc)
		end
	end
	return out
end

local TRAVEL_TO: { [string]: { string } } = {}
for _, id in WorldRegistry.LOCATION_ORDER do
	local loc = LOCATIONS[id]
	if loc then
		for _, target in loc.travelConnections do
			TRAVEL_TO[target] = TRAVEL_TO[target] or {}
			table.insert(TRAVEL_TO[target], id)
		end
	end
end

WorldRegistry.travelFrom = function(locationId: string): { string }
	local loc = LOCATIONS[locationId]
	return loc and loc.travelConnections or {}
end

WorldRegistry.travelTo = function(locationId: string): { string }
	return TRAVEL_TO[locationId] or {}
end

WorldRegistry.canTravel = function(from: string, to: string): boolean
	for _, target in WorldRegistry.travelFrom(from) do
		if target == to then
			return true
		end
	end
	return false
end

WorldRegistry.STATIONS = {} :: { [string]: { [string]: Station } }
local primaryByCountry: { [string]: Location } = {}
for _, id in WorldRegistry.LOCATION_ORDER do
	local loc = LOCATIONS[id]
	if loc and not primaryByCountry[loc.countryId] then
		primaryByCountry[loc.countryId] = loc
		WorldRegistry.STATIONS[loc.countryId] = loc.stations
	end
end

WorldRegistry.station = function(country: string, kind: string): Station?
	local stations = WorldRegistry.STATIONS[country]
	return stations and stations[kind]
end

WorldRegistry.stationWorldPosition = function(country: string, kind: string): Vector3?
	local station = WorldRegistry.station(country, kind)
	local origin = WorldRegistry.origin(country)
	if not station or not origin then
		return nil
	end
	return origin + Vector3.new(station.x, 0, station.z)
end

return WorldRegistry
```

`WorldRegistry.origin(cc)`, `WorldRegistry.STATIONS`, and `WorldRegistry.station(cc, kind)` keep working. If a country has multiple locations, `STATIONS` uses the first location in `LOCATION_ORDER`; use `locationStation(locationId, kind)` for exact location lookup.
