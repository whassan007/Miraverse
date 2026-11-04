--!strict
-- MiraVerse v0.4 Server-Authoritative Roblox Challenges (Gather, Trade, Build, Cook, Word)
-- Owner: CL04
local ChallengeService = {}

export type ChallengeKind = "gather" | "trade" | "build" | "cook" | "word"

local VALID_COUNTRIES = { FR = true, LB = true, EG = true, IQ = true, KR = true }
local VALID_CHALLENGES = { gather = true, trade = true, build = true, cook = true, word = true }

function ChallengeService.validateAndComplete(
	playerState: { [string]: any },
	country: string,
	challenge: string,
	distanceStuds: number
): (boolean, string)
	if not VALID_COUNTRIES[country] then
		return false, "INVALID_COUNTRY"
	end
	if not VALID_CHALLENGES[challenge] then
		return false, "INVALID_CHALLENGE"
	end
	if distanceStuds > 24 then
		return false, "OUT_OF_RANGE"
	end

	playerState.completed = playerState.completed or {}
	playerState.completed[country] = playerState.completed[country] or {}
	playerState.completed[country][challenge] = true

	if challenge == "build" then
		playerState.restoredLandmark = playerState.restoredLandmark or {}
		playerState.restoredLandmark[country] = 3
	end

	return true, "COMPLETED"
end

return ChallengeService
