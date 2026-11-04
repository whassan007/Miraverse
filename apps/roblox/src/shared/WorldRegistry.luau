--!strict
-- The single source of truth for world layout. Builders, travel and stations read only this.
local WorldRegistry = {}

-- Each country owns a square cell, so scenes cannot overlap while they stay inside it.
WorldRegistry.CELL_SIZE = 800
WorldRegistry.GROUND_Y = 10
WorldRegistry.LOBBY = Vector3.new(0, 10, 0)
WorldRegistry.COUNTRY_ORDER = { "LB", "EG", "IQ", "KR", "FR" }

local INDEX = { LB = 1, EG = 2, IQ = 3, KR = 4, FR = 5 }

function WorldRegistry.origin(country: string): Vector3?
	local index = (INDEX :: any)[country]
	if not index then
		return nil
	end
	return Vector3.new(index * WorldRegistry.CELL_SIZE, WorldRegistry.GROUND_Y, 0)
end

export type Station = { kind: string, label: string, x: number, z: number, faceX: number, faceZ: number }

-- Offsets are relative to the country origin. faceX/faceZ is the point the challenge opens toward.
WorldRegistry.STATIONS = {
	LB = {
		build = { kind = "build", label = "Stone House to Restore", x = 22, z = -22, faceX = 22, faceZ = -40 },
		cook = { kind = "cook", label = "Saj Kitchen", x = -14, z = -14, faceX = -14, faceZ = -30 },
		gather = { kind = "gather", label = "Terrace Harvest", x = -66, z = 14, faceX = -66, faceZ = 0 },
		trade = { kind = "trade", label = "Old Stone Souk", x = 26, z = 0, faceX = 40, faceZ = 0 },
		word = { kind = "word", label = "Teta's Courtyard", x = -12, z = 2, faceX = -30, faceZ = 2 },
	},
} :: { [string]: { [string]: Station } }

function WorldRegistry.station(country: string, kind: string): Station?
	local stations = WorldRegistry.STATIONS[country]
	return stations and stations[kind]
end

return WorldRegistry
