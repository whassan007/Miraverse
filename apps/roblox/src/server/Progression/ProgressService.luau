--!strict
-- Versioned, server-owned player progress.
-- Merging in UpdateAsync only ever adds progress, so a stale server cannot erase it.
local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")

local ProgressService = {}

ProgressService.SCHEMA_VERSION = 2
local STORE_NAME = "MiraVerseProgress"
local RETRIES = 3
local AUTOSAVE_SECONDS = 60

-- countries[cc].chapters[n].completed[challengeId], and .stamp
-- countries[cc].acts[actId], .questions[questionId], .locations[locationId]
export type Save = {
	schemaVersion: number,
	lastCountry: string?,
	lastLocation: string?,
	countries: { [string]: any },
}

local saves: { [number]: Save } = {}
local dirty: { [number]: boolean } = {}
local status: { [number]: string } = {}

local function newSave(): Save
	return { schemaVersion = ProgressService.SCHEMA_VERSION, countries = {} }
end

-- Upgrades any older shape. Never drops data it recognizes.
function ProgressService.migrate(raw: any): Save
	if type(raw) ~= "table" then
		return newSave()
	end
	if raw.schemaVersion == ProgressService.SCHEMA_VERSION then
		return raw
	end
	local save = newSave()
	-- mv.roblox.save.v6: the earlier save shape.
	save.lastCountry = if type(raw.lastCountryId) == "string" then raw.lastCountryId else nil
	if type(raw.passportStamps) == "table" then
		for key, code in raw.passportStamps do
			local cc = string.sub(tostring(key), 1, 2)
			if string.match(cc, "^%u%u$") then
				local c = ProgressService.countryOf(save, cc)
				c.chapters["1"] = c.chapters["1"] or { completed = {} }
				c.chapters["1"].stamp = code
			end
		end
	end
	return save
end

function ProgressService.countryOf(save: Save, cc: string): any
	local c = save.countries[cc]
	if not c then
		c = { chapters = {}, acts = {}, questions = {}, locations = {} }
		save.countries[cc] = c
	end
	return c
end

function ProgressService.chapterOf(save: Save, cc: string, chapter: number): any
	local c = ProgressService.countryOf(save, cc)
	local key = tostring(chapter)
	local ch = c.chapters[key]
	if not ch then
		ch = { completed = {} }
		c.chapters[key] = ch
	end
	return ch
end

-- Union of two values: tables merge, true and existing values win over absence.
local function merge(into: any, from: any): any
	if type(into) ~= "table" or type(from) ~= "table" then
		return if from ~= nil then from else into
	end
	for k, v in from do
		into[k] = merge(into[k], v)
	end
	return into
end
ProgressService.merge = merge

local function store(): any
	return DataStoreService:GetDataStore(STORE_NAME)
end

local function withRetry(fn: () -> any): (boolean, any)
	local ok, result
	for attempt = 1, RETRIES do
		ok, result = pcall(fn)
		if ok then
			return true, result
		end
		if attempt < RETRIES then
			task.wait(attempt)
		end
	end
	return false, result
end

function ProgressService.load(player: Player): Save
	local ok, raw = withRetry(function()
		return store():GetAsync("u_" .. player.UserId)
	end)
	status[player.UserId] = if ok then "loaded" else "unavailable"
	if not ok then
		warn("[Progress] saved progress could not be loaded; this session stays in memory")
	end
	local save = ProgressService.migrate(if ok then raw else nil)
	saves[player.UserId] = save
	return save
end

function ProgressService.markDirty(player: Player)
	dirty[player.UserId] = true
end

function ProgressService.status(player: Player): string
	return status[player.UserId] or "not-loaded"
end

function ProgressService.saveNow(userId: number): boolean
	local save = saves[userId]
	if not save or not dirty[userId] then
		return true
	end
	local ok = withRetry(function()
		return store():UpdateAsync("u_" .. userId, function(current: any)
			local merged = merge(ProgressService.migrate(current), save)
			merged.schemaVersion = ProgressService.SCHEMA_VERSION
			return merged
		end)
	end)
	if ok then
		dirty[userId] = nil
		status[userId] = "saved"
	else
		status[userId] = "save-failed"
		warn("[Progress] save failed; will retry")
	end
	return ok
end

function ProgressService.init()
	Players.PlayerRemoving:Connect(function(player)
		local userId = player.UserId
		ProgressService.saveNow(userId)
		saves[userId] = nil
		dirty[userId] = nil
		status[userId] = nil
	end)
	game:BindToClose(function()
		local pending = 0
		for userId in saves do
			pending += 1
			task.spawn(function()
				ProgressService.saveNow(userId)
				pending -= 1
			end)
		end
		local waited = 0
		while pending > 0 and waited < 25 do
			waited += task.wait(0.25)
		end
	end)
	task.spawn(function()
		while true do
			task.wait(AUTOSAVE_SECONDS)
			for userId in saves do
				ProgressService.saveNow(userId)
			end
		end
	end)
end

return ProgressService
