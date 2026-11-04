--!strict
-- Versioned, server-owned player progress.
-- Merging in UpdateAsync only ever adds progress, so a stale server cannot erase it.
local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local WorldRegistry = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("WorldRegistry"))

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
	visitedLocations: { [string]: boolean }?,
	countries: { [string]: any },
	inventory: { [string]: number }?,
}

local saves: { [number]: Save } = {}
local dirty: { [number]: boolean } = {}
local status: { [number]: string } = {}

local function newSave(): Save
	return { schemaVersion = ProgressService.SCHEMA_VERSION, visitedLocations = {}, countries = {} }
end

local function cloneTable(src: any): any
	if type(src) ~= "table" then
		return src
	end
	local copy: { [any]: any } = {}
	for k, v in src do
		copy[k] = cloneTable(v)
	end
	return copy
end

-- Upgrades any older shape. Never drops data it recognizes.
function ProgressService.migrate(raw: any): Save
	if type(raw) ~= "table" then
		return newSave()
	end
	local save = newSave()
	if type(raw.countries) == "table" then
		save.countries = cloneTable(raw.countries)
		for cc in save.countries do
			local c = ProgressService.countryOf(save, cc)
			c.chapters = if type(c.chapters) == "table" then c.chapters else {}
			c.acts = if type(c.acts) == "table" then c.acts else {}
			c.questions = if type(c.questions) == "table" then c.questions else {}
			c.locations = if type(c.locations) == "table" then c.locations else {}
		end
	end
	if type(raw.inventory) == "table" then
		save.inventory = cloneTable(raw.inventory)
	end
	if type(raw.visitedLocations) == "table" then
		for locId, visited in raw.visitedLocations do
			if visited and WorldRegistry.getLocation(tostring(locId)) then
				local normLoc = WorldRegistry.getLocation(tostring(locId))
				if normLoc then
					(save.visitedLocations :: { [string]: boolean })[normLoc.locationId] = true
					ProgressService.countryOf(save, normLoc.countryId).locations[normLoc.locationId] = true
				end
			end
		end
	end
	-- mv.roblox.save.v6: the earlier save shape.
	local rawCountry = if type(raw.lastCountry) == "string"
		then raw.lastCountry
		elseif type(raw.lastCountryId) == "string" then raw.lastCountryId
		else nil
	if type(raw.passportStamps) == "table" then
		for key, code in raw.passportStamps do
			local cc = string.sub(tostring(key), 1, 2)
			if string.match(cc, "^%u%u$") then
				local c = ProgressService.countryOf(save, cc)
				c.chapters["1"] = c.chapters["1"] or { completed = {} }
				c.chapters["1"].stamp = c.chapters["1"].stamp or code
			end
		end
	end
	-- Sync per-country locations into visitedLocations and vice versa
	for cc, country in save.countries do
		if type(country.locations) == "table" then
			for locId, visited in country.locations do
				if visited and WorldRegistry.getLocation(tostring(locId)) then
					local normLoc = WorldRegistry.getLocation(tostring(locId))
					if normLoc then
						(save.visitedLocations :: { [string]: boolean })[normLoc.locationId] = true
						country.locations[normLoc.locationId] = true
					end
				end
			end
		end
	end
	-- Resolve lastLocation and lastCountry backward-compatibly
	local resolvedLoc = if type(raw.lastLocation) == "string" then WorldRegistry.getLocation(raw.lastLocation) else nil
	if resolvedLoc then
		save.lastLocation = resolvedLoc.locationId
		save.lastCountry = resolvedLoc.countryId
	elseif type(rawCountry) == "string" and WorldRegistry.isValidCountry(rawCountry) then
		local upperCc = string.upper(rawCountry)
		save.lastCountry = upperCc
		save.lastLocation = WorldRegistry.defaultLocationId(upperCc)
	else
		save.lastCountry = nil
		save.lastLocation = nil
	end
	if save.lastCountry and save.lastLocation then
		(save.visitedLocations :: { [string]: boolean })[save.lastLocation] = true
		ProgressService.countryOf(save, save.lastCountry).locations[save.lastLocation] = true
	end
	return save
end

function ProgressService.recordLocationVisit(save: Save, countryId: string, locationId: string)
	local loc = WorldRegistry.getLocation(locationId)
	local canonicalLocId = if loc then loc.locationId else string.lower(locationId)
	local canonicalCountryId = if loc then loc.countryId else string.upper(countryId)
	save.lastCountry = canonicalCountryId
	save.lastLocation = canonicalLocId
	save.visitedLocations = save.visitedLocations or {}
	save.visitedLocations[canonicalLocId] = true
	local c = ProgressService.countryOf(save, canonicalCountryId)
	c.locations = c.locations or {}
	c.locations[canonicalLocId] = true
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
	dirty[userId] = nil
	local ok = withRetry(function()
		return store():UpdateAsync("u_" .. userId, function(current: any)
			local merged = merge(ProgressService.migrate(current), save)
			merged.schemaVersion = ProgressService.SCHEMA_VERSION
			return merged
		end)
	end)
	if ok then
		status[userId] = "saved"
	else
		dirty[userId] = true
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
