--!strict
-- Server-owned, session-only player state and remote handlers. No DataStore, no network calls.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Stamp = require(script.Parent.Stamp)

local SessionManager = {}

local COOLDOWN = 0.25
local PHRASES = { "Hello!", "Great job!", "Follow me!", "Thank you!" }

type Session = {
	country: string?,
	chapterId: string?, -- nil while playing a country's classic adventure
	locale: string?,
	index: number,
	completed: { [number]: boolean },
	completedChapters: { [string]: boolean },
	artifacts: { string },
	storySparks: number,
	stamps: { string },
	busy: boolean,
}

local sessions: { [Player]: Session } = {}
local lastCall: { [Player]: { [string]: number } } = {}
local Challenges: any = nil
local Packs: any = nil
local Catalog: any = nil
local countriesByCode: { [string]: any } = {}
local chaptersById: { [string]: any } = {}
local atlasPacks: { [string]: any } = {}
local remotes: Folder

local function limited(player: Player, name: string): boolean
	local t = os.clock()
	local per = lastCall[player]
	if not per then
		per = {}
		lastCall[player] = per
	end
	local prev = per[name]
	if prev and t - prev < COOLDOWN then
		return true
	end
	per[name] = t
	return false
end

local function challengesOf(s: Session): { any }
	if s.chapterId then
		return chaptersById[s.chapterId].challenges
	end
	local pack = Packs and s.country and Packs[s.country]
	local chapter = pack and pack.chapters and pack.chapters[1]
	return chapter and chapter.challenges or {}
end

local function packOf(s: Session): any
	if s.chapterId then
		return atlasPacks[s.country :: string]
	end
	return Packs[s.country :: string]
end

local function snapshot(s: Session)
	local done = 0
	for _ in s.completed do
		done += 1
	end
	return {
		country = s.country,
		chapterId = s.chapterId,
		index = s.index,
		done = done,
		total = #challengesOf(s),
		stamps = table.clone(s.stamps),
		completedChapters = table.clone(s.completedChapters),
		storySparks = s.storySparks,
	}
end

local function isUnlocked(s: Session, chapter: any): boolean
	return chapter.prerequisite == nil or s.completedChapters[chapter.prerequisite] == true
end

local function newRemote(class: string, name: string): Instance
	local r = Instance.new(class)
	r.Name = name
	r.Parent = remotes
	return r
end

function SessionManager.init()
	local shared = ReplicatedStorage:WaitForChild("MiraVerseShared")
	Challenges = require(shared:WaitForChild("Challenges"))
	Packs = require(shared:WaitForChild("Packs"))
	Catalog = require(shared:WaitForChild("Atlas"):WaitForChild("Catalog"))
	for _, country in Catalog.countries do
		countriesByCode[country.code] = country
		atlasPacks[country.code] = {
			items = country.items,
			mentor = { nameKey = country.leadNameKey },
			characterStyle = country.characterStyle,
			colors = { primary = country.primary, secondary = country.secondary },
		}
	end
	for _, chapter in Catalog.chapters do
		chaptersById[chapter.id] = chapter
	end
	Challenges.init()

	remotes = Instance.new("Folder")
	remotes.Name = "MiraVerseRemotes"
	remotes.Parent = ReplicatedStorage

	local getState = newRemote("RemoteFunction", "GetState") :: RemoteFunction
	local selectCountry = newRemote("RemoteFunction", "SelectCountry") :: RemoteFunction
	local runChallenge = newRemote("RemoteFunction", "RunChallenge") :: RemoteFunction
	local selectChapter = newRemote("RemoteFunction", "SelectChapter") :: RemoteFunction
	local setLocale = newRemote("RemoteFunction", "SetLocale") :: RemoteFunction
	local say = newRemote("RemoteEvent", "Say") :: RemoteEvent
	local phraseOut = newRemote("RemoteEvent", "PhraseShown") :: RemoteEvent

	local function sessionOf(player: Player): Session
		local s = sessions[player]
		if not s then
			s = {
				country = nil,
				chapterId = nil,
				locale = nil,
				index = 1,
				completed = {},
				completedChapters = {},
				artifacts = {},
				storySparks = 0,
				stamps = {},
				busy = false,
			}
			sessions[player] = s
		end
		return s
	end

	getState.OnServerInvoke = function(player)
		if limited(player, "GetState") then
			return nil
		end
		return snapshot(sessionOf(player))
	end

	setLocale.OnServerInvoke = function(player, id)
		if type(id) ~= "string" then
			return false
		end
		for _, locale in Catalog.locales do
			if locale.id == id then
				sessionOf(player).locale = id
				return true
			end
		end
		return false
	end

	selectCountry.OnServerInvoke = function(player, cc)
		if limited(player, "SelectCountry") then
			return { ok = false, reason = "slow" }
		end
		if type(cc) ~= "string" or not countriesByCode[cc] then
			return { ok = false, reason = "invalid" }
		end
		local s = sessionOf(player)
		s.country = cc
		s.chapterId = nil
		s.index = 1
		s.completed = {}
		local spawn = Workspace:FindFirstChild("Spawn_" .. cc, true)
		local char = player.Character
		if spawn and spawn:IsA("BasePart") and char then
			char:PivotTo(spawn.CFrame + Vector3.new(0, 4, 0))
		end
		return { ok = true, state = snapshot(s) }
	end

	-- Starts one of the 66 chapters, or the classic adventure when chapterId is false.
	selectChapter.OnServerInvoke = function(player, chapterId)
		if limited(player, "SelectChapter") then
			return { ok = false, reason = "slow" }
		end
		local s = sessionOf(player)
		if not s.country or s.busy then
			return { ok = false, reason = "not-ready" }
		end
		if chapterId == false then
			if not Packs[s.country] then
				return { ok = false, reason = "invalid" }
			end
			s.chapterId = nil
		else
			local chapter = type(chapterId) == "string" and chaptersById[chapterId]
			if not chapter or chapter.country ~= s.country then
				return { ok = false, reason = "invalid" }
			end
			if not isUnlocked(s, chapter) then
				return { ok = false, reason = "locked" }
			end
			s.chapterId = chapterId
		end
		s.index = 1
		s.completed = {}
		return { ok = true, state = snapshot(s) }
	end

	runChallenge.OnServerInvoke = function(player)
		if limited(player, "RunChallenge") then
			return { ok = false, reason = "slow" }
		end
		local s = sessionOf(player)
		local cc = s.country
		if not cc or s.busy then
			return { ok = false, reason = "not-ready" }
		end
		-- The index is server-owned; the client cannot choose or report completion.
		local chapterId = s.chapterId
		local list = challengesOf(s)
		local challenge = list[s.index]
		if not challenge then
			return { ok = false, reason = "no-challenge" }
		end
		s.busy = true
		local okRun, result = pcall(function()
			return Challenges.run(player, challenge, packOf(s), s.locale)
		end)
		s.busy = false
		if sessions[player] ~= s or s.country ~= cc or s.chapterId ~= chapterId then
			return { ok = false, reason = "changed" }
		end
		if not okRun or result ~= true then
			return { ok = false, reason = "failed", state = snapshot(s) }
		end
		s.completed[s.index] = true
		local allDone = true
		for i = 1, #list do
			if not s.completed[i] then
				allDone = false
				break
			end
		end
		if not allDone then
			s.index = math.min(s.index + 1, #list)
			return { ok = true, state = snapshot(s) }
		end
		if chapterId then
			local chapter = chaptersById[chapterId]
			-- Rewards are granted once, even if the chapter is replayed.
			if not s.completedChapters[chapterId] then
				s.completedChapters[chapterId] = true
				s.storySparks += chapter.storySparks
				table.insert(s.artifacts, chapter.artifactKey)
			end
			s.index = 1
			s.completed = {}
			return { ok = true, state = snapshot(s), chapterComplete = chapterId }
		end
		local stampCode = Stamp.make(cc, 1)
		table.insert(s.stamps, stampCode)
		return { ok = true, state = snapshot(s), stamp = stampCode }
	end

	say.OnServerEvent:Connect(function(player, idx)
		if limited(player, "Say") then
			return
		end
		if type(idx) ~= "number" or idx % 1 ~= 0 or idx < 1 or idx > #PHRASES then
			return
		end
		phraseOut:FireAllClients(player.UserId, PHRASES[idx])
	end)

	Players.PlayerRemoving:Connect(function(player)
		sessions[player] = nil
		lastCall[player] = nil
	end)
end

return SessionManager
