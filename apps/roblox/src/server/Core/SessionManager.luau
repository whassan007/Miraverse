--!strict
-- Server-owned player state, travel and remote handlers. Persistence lives in ProgressService.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Stamp = require(script.Parent.Stamp)
local ProgressService = require(script.Parent.Parent.Progression.ProgressService)
local MapBuilder = require(script.Parent.Parent.MapBuilder)

local SessionManager = {}

local COOLDOWN = 0.25
local CHAPTER = 1
local CHALLENGES_PER_CHAPTER = 5
local STATION_REACH = 16
local PHRASES = { "Hello!", "Great job!", "Follow me!", "Thank you!" }
local VALID = { LB = true, EG = true, IQ = true, KR = true, FR = true }

type Session = {
	country: string?,
	index: number,
	busy: boolean,
	met: { [string]: boolean },
	save: any,
}

local sessions: { [Player]: Session } = {}
local lastCall: { [Player]: { [string]: number } } = {}
local Challenges: any = nil
local Packs: any = nil
local Registry: any = nil
local remotes: Folder
local stateChanged: RemoteEvent
local dialogueShown: RemoteEvent
local stationHint: RemoteEvent

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

local function getChallenges(cc: string): { any }
	local pack = Packs and Packs[cc]
	local chapter = pack and pack.chapters and pack.chapters[CHAPTER]
	return chapter and chapter.challenges or {}
end

local function chapterSave(s: Session, cc: string): any
	return ProgressService.chapterOf(s.save, cc, CHAPTER)
end

local function firstIncomplete(s: Session, cc: string): number
	local completed = chapterSave(s, cc).completed
	for i, challenge in getChallenges(cc) do
		if not completed[challenge.id] then
			return i
		end
	end
	return CHALLENGES_PER_CHAPTER + 1
end

local function snapshot(player: Player, s: Session)
	local cc = s.country
	local done, stampCode, nextKind, nextLabel, hasStations = 0, nil, nil, nil, false
	if cc then
		local chapter = chapterSave(s, cc)
		for _ in chapter.completed do
			done += 1
		end
		stampCode = chapter.stamp
		hasStations = Registry.STATIONS[cc] ~= nil
		local nextChallenge = getChallenges(cc)[s.index]
		if nextChallenge then
			nextKind = nextChallenge.type
			local station = Registry.station(cc, nextChallenge.type)
			nextLabel = station and station.label
		end
	end
	local stamps = {}
	for code, country in s.save.countries do
		for _, ch in country.chapters do
			if ch.stamp then
				table.insert(stamps, code .. ":" .. ch.stamp)
			end
		end
	end
	return {
		country = cc,
		index = math.min(s.index, CHALLENGES_PER_CHAPTER),
		done = done,
		total = CHALLENGES_PER_CHAPTER,
		stamp = stampCode,
		stamps = stamps,
		met = if cc then s.met[cc] == true or false else false,
		nextKind = nextKind,
		nextLabel = nextLabel,
		hasStations = hasStations,
		saveStatus = ProgressService.status(player),
	}
end

local function sessionOf(player: Player): Session
	local s = sessions[player]
	if not s then
		local save = ProgressService.load(player)
		s = { country = nil, index = 1, busy = false, met = {}, save = save }
		for cc, country in save.countries do
			if country.metMentor then
				s.met[cc] = true
			end
		end
		sessions[player] = s
	end
	return s
end

local function pushState(player: Player, s: Session)
	stateChanged:FireClient(player, snapshot(player, s))
end

local function moveTo(player: Player, target: CFrame)
	local character = player.Character
	if not character then
		return
	end
	-- Load the destination first, so the player does not arrive in an unstreamed area.
	pcall(function()
		player:RequestStreamAroundAsync(target.Position, 5)
	end)
	character:PivotTo(target)
end

-- The only way players change location.
local function enterCountry(player: Player, cc: string): boolean
	if not VALID[cc] then
		return false
	end
	local s = sessionOf(player)
	s.country = cc
	s.index = firstIncomplete(s, cc)
	s.save.lastCountry = cc
	ProgressService.markDirty(player)
	local spawn = MapBuilder.getSpawn(cc)
	if spawn then
		moveTo(player, spawn.CFrame + Vector3.new(0, 4, 0))
	end
	pushState(player, s)
	return true
end

local function returnToLobby(player: Player)
	local s = sessionOf(player)
	s.country = nil
	moveTo(player, CFrame.new(Registry.LOBBY + Vector3.new(0, 4, 0)))
	pushState(player, s)
end

local function nearStation(player: Player, cc: string, kind: string): (boolean, CFrame?)
	local station = Registry.station(cc, kind)
	if not station then
		return true, nil -- This country has no placed stations yet.
	end
	local origin = Registry.origin(cc)
	local at = origin + Vector3.new(station.x, 0, station.z)
	local face = origin + Vector3.new(station.faceX, 0, station.faceZ)
	local character = player.Character
	if not character then
		return false, nil
	end
	local position = character:GetPivot().Position
	local flat = Vector3.new(position.X - at.X, 0, position.Z - at.Z)
	if flat.Magnitude > STATION_REACH then
		return false, nil
	end
	return true, CFrame.lookAt(at + Vector3.new(0, 3, 0), face + Vector3.new(0, 3, 0))
end

-- Runs the player's current challenge. Server-owned: the client can't choose or report it.
local function runCurrent(player: Player, requestedKind: string?): any
	local s = sessionOf(player)
	local cc = s.country
	if not cc or s.busy then
		return { ok = false, reason = "not-ready" }
	end
	local list = getChallenges(cc)
	local challenge = list[s.index]
	if not challenge then
		return { ok = false, reason = "complete", state = snapshot(player, s) }
	end
	if Registry.STATIONS[cc] and not s.met[cc] then
		return { ok = false, reason = "meet-mentor", state = snapshot(player, s) }
	end
	if requestedKind and requestedKind ~= challenge.type then
		return { ok = false, reason = "wrong-station", state = snapshot(player, s) }
	end
	local near, origin = nearStation(player, cc, challenge.type)
	if not near then
		return { ok = false, reason = "too-far", state = snapshot(player, s) }
	end
	s.busy = true
	pushState(player, s)
	local okRun, result = pcall(function()
		return Challenges.run(player, challenge, Packs[cc], origin)
	end)
	s.busy = false
	if not okRun then
		warn("[Session] challenge error: " .. tostring(result))
	end
	if sessions[player] ~= s or s.country ~= cc then
		return { ok = false, reason = "changed" }
	end
	if not okRun or result ~= true then
		pushState(player, s)
		return { ok = false, reason = "failed", state = snapshot(player, s) }
	end
	local chapter = chapterSave(s, cc)
	chapter.completed[challenge.id] = true
	s.index = firstIncomplete(s, cc)
	local stampCode: string? = nil
	if s.index > #list and not chapter.stamp then
		stampCode = Stamp.make(cc, CHAPTER)
		chapter.stamp = stampCode
	end
	ProgressService.markDirty(player)
	if stampCode then
		ProgressService.saveNow(player.UserId)
	end
	pushState(player, s)
	return { ok = true, state = snapshot(player, s), stamp = stampCode }
end

local function hintFor(player: Player, res: any)
	if res.ok then
		if res.stamp then
			stationHint:FireClient(player, "stamp", res.stamp)
		end
		return
	end
	stationHint:FireClient(player, res.reason, res.state and res.state.nextLabel)
end

local function talkToMentor(player: Player, cc: string)
	local s = sessionOf(player)
	if s.country ~= cc then
		enterCountry(player, cc)
	end
	s.met[cc] = true
	ProgressService.countryOf(s.save, cc).metMentor = true
	ProgressService.markDirty(player)
	local mentor = Packs[cc] and Packs[cc].mentor or {}
	local state = snapshot(player, s)
	dialogueShown:FireClient(player, {
		name = mentor.name,
		native = mentor.greeting,
		english = mentor.greeting_en,
		nextLabel = state.nextLabel,
		finished = state.stamp ~= nil,
	})
	pushState(player, s)
end

local function newRemote(class: string, name: string): any
	local r = Instance.new(class)
	r.Name = name
	r.Parent = remotes
	return r
end

function SessionManager.init()
	local shared = ReplicatedStorage:WaitForChild("Shared")
	Challenges = require(shared:WaitForChild("Challenges"))
	Packs = require(shared:WaitForChild("Packs"))
	Registry = require(shared:WaitForChild("WorldRegistry"))

	remotes = Instance.new("Folder")
	remotes.Name = "MiraVerseRemotes"

	local getState = newRemote("RemoteFunction", "GetState") :: RemoteFunction
	local selectCountry = newRemote("RemoteFunction", "SelectCountry") :: RemoteFunction
	local runChallenge = newRemote("RemoteFunction", "RunChallenge") :: RemoteFunction
	local say = newRemote("RemoteEvent", "Say") :: RemoteEvent
	local phraseOut = newRemote("RemoteEvent", "PhraseShown") :: RemoteEvent
	local challengeEnded = newRemote("RemoteEvent", "ChallengeEnded") :: RemoteEvent
	stateChanged = newRemote("RemoteEvent", "StateChanged")
	dialogueShown = newRemote("RemoteEvent", "DialogueShown")
	stationHint = newRemote("RemoteEvent", "StationHint")
	remotes.Parent = ReplicatedStorage

	ProgressService.init()

	MapBuilder.setHandlers({
		travel = function(player: Player, cc: string)
			enterCountry(player, cc)
		end,
		lobby = returnToLobby,
		mentor = talkToMentor,
		station = function(player: Player, cc: string, kind: string)
			local s = sessionOf(player)
			if s.country ~= cc then
				enterCountry(player, cc)
			end
			hintFor(player, runCurrent(player, kind))
			challengeEnded:FireClient(player)
		end,
	})

	getState.OnServerInvoke = function(player)
		if limited(player, "GetState") then
			return nil
		end
		return snapshot(player, sessionOf(player))
	end

	selectCountry.OnServerInvoke = function(player, cc)
		if limited(player, "SelectCountry") then
			return { ok = false, reason = "slow" }
		end
		if type(cc) ~= "string" or not VALID[cc] then
			return { ok = false, reason = "invalid" }
		end
		enterCountry(player, cc)
		return { ok = true, state = snapshot(player, sessionOf(player)) }
	end

	-- For countries without placed stations. Station countries still pass the distance check.
	runChallenge.OnServerInvoke = function(player)
		if limited(player, "RunChallenge") then
			return { ok = false, reason = "slow" }
		end
		local res = runCurrent(player, nil)
		challengeEnded:FireClient(player)
		return res
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
