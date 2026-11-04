--!strict
-- Server-owned, session-only player state and remote handlers. No DataStore, no network calls.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Stamp = require(script.Parent.Stamp)

local SessionManager = {}

local COOLDOWN = 0.25
local CHALLENGES_PER_CHAPTER = 5
local PHRASES = { "Hello!", "Great job!", "Follow me!", "Thank you!" }
local VALID = { LB = true, EG = true, IQ = true, KR = true, FR = true }

type Session = {
	country: string?,
	index: number,
	completed: { [number]: boolean },
	stamps: { string },
	stamped: { [string]: boolean },
	busy: boolean,
}

local sessions: { [Player]: Session } = {}
local lastCall: { [Player]: { [string]: number } } = {}
local Challenges: any = nil
local Packs: any = nil
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

local function snapshot(s: Session)
	local done = 0
	for _ in s.completed do
		done += 1
	end
	return { country = s.country, index = s.index, done = done, total = CHALLENGES_PER_CHAPTER, stamps = table.clone(s.stamps) }
end

local function getChallenges(cc: string): { any }
	local pack = Packs and Packs[cc]
	local chapter = pack and pack.chapters and pack.chapters[1]
	return chapter and chapter.challenges or {}
end

local function newRemote(class: string, name: string): Instance
	local r = Instance.new(class)
	r.Name = name
	r.Parent = remotes
	return r
end

function SessionManager.init()
	local shared = ReplicatedStorage:WaitForChild("Shared")
	Challenges = require(shared:WaitForChild("Challenges"))
	Packs = require(shared:WaitForChild("Packs"))

	remotes = Instance.new("Folder")
	remotes.Name = "MiraVerseRemotes"
	remotes.Parent = ReplicatedStorage

	local getState = newRemote("RemoteFunction", "GetState") :: RemoteFunction
	local selectCountry = newRemote("RemoteFunction", "SelectCountry") :: RemoteFunction
	local runChallenge = newRemote("RemoteFunction", "RunChallenge") :: RemoteFunction
	local say = newRemote("RemoteEvent", "Say") :: RemoteEvent
	local phraseOut = newRemote("RemoteEvent", "PhraseShown") :: RemoteEvent
	local challengeEnded = newRemote("RemoteEvent", "ChallengeEnded") :: RemoteEvent

	local function sessionOf(player: Player): Session
		local s = sessions[player]
		if not s then
			s = { country = nil, index = 1, completed = {}, stamps = {}, stamped = {}, busy = false }
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

	selectCountry.OnServerInvoke = function(player, cc)
		if limited(player, "SelectCountry") then
			return { ok = false, reason = "slow" }
		end
		if type(cc) ~= "string" or not VALID[cc] then
			return { ok = false, reason = "invalid" }
		end
		local s = sessionOf(player)
		s.country = cc
		s.index = 1
		s.completed = {}
		local spawn = Workspace:FindFirstChild("Spawn_" .. cc, true)
		local char = player.Character
		if spawn and spawn:IsA("BasePart") and char then
			char:PivotTo(spawn.CFrame + Vector3.new(0, 4, 0))
		end
		return { ok = true, state = snapshot(s), challenge = getChallenges(cc)[1] and getChallenges(cc)[1].id }
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
		local list = getChallenges(cc)
		local challenge = list[s.index]
		if not challenge then
			return { ok = false, reason = "no-challenge" }
		end
		if s.stamped[cc] and s.completed[s.index] then
			return { ok = false, reason = "complete", state = snapshot(s) }
		end
		s.busy = true
		local okRun, result = pcall(function()
			return Challenges.run(player, challenge, Packs[cc])
		end)
		s.busy = false
		challengeEnded:FireClient(player)
		if sessions[player] ~= s or s.country ~= cc then
			return { ok = false, reason = "changed" }
		end
		if not okRun or result ~= true then
			return { ok = false, reason = "failed", state = snapshot(s) }
		end
		s.completed[s.index] = true
		local stampCode: string? = nil
		local all = true
		for i = 1, CHALLENGES_PER_CHAPTER do
			if not s.completed[i] then
				all = false
				break
			end
		end
		if all and not s.stamped[cc] then
			stampCode = Stamp.make(cc, 1)
			table.insert(s.stamps, stampCode)
			s.stamped[cc] = true
		elseif all then
			stampCode = nil
		elseif s.index < CHALLENGES_PER_CHAPTER then
			s.index += 1
		end
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
