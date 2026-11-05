--!nonstrict
-- Binds the Phoenicia flow to Roblox: world, NPCs, prompts, remotes, voyages and DataStore saves.
-- Only started when Workspace has the MV_PHOENICIA attribute.

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Content = require(ReplicatedStorage:WaitForChild("MiraVerseShared"):WaitForChild("Phoenicia"):WaitForChild("Content"))
local Machine = require(script.Parent.Parent.QuestEngine.ByblosQuestStateMachine)
local Gate = require(script.Parent.Gate)
local Flow = require(script.Parent.Flow)
local WorldBuilder = require(script.Parent.WorldBuilder)

local Service = {}

local STORE_NAME = "MiraVersePhoenicia_v1"
local ASK_TIMEOUT_SECONDS = 120
local STORE_ATTEMPTS = 3
local SAIL_STEP_SECONDS = 0.1
local STAND_Y = Content.projection.landTopY + 1
local DECK_CLEARANCE_STUDS = 3

local gate = Gate.new(Machine, Content)
local flow
local remotes
local store
local ships = {}
local pendingAsks = {}
local nextAskToken = 0

local function withRetries(callback)
	local ok, result
	for attempt = 1, STORE_ATTEMPTS do
		ok, result = pcall(callback)
		if ok then
			return true, result
		end
		if attempt < STORE_ATTEMPTS then
			task.wait(attempt)
		end
	end
	return false, result
end

local function rootOf(player)
	local character = player.Character
	return character and character:FindFirstChild("HumanoidRootPart")
end

local function worldPoint(regionId, point)
	return WorldBuilder.unitToWorld(Content, regionId, point.x + 0.5, point.y or STAND_Y, point.z + 0.5)
end

local function positionOf(player)
	local root = rootOf(player)
	if not root then
		return nil
	end
	local s = Content.projection.robloxStudsPerUnit
	for id, region in Content.regions do
		local origin = region.origins.roblox
		local x = (root.Position.X - origin[1]) / s
		local z = (root.Position.Z - origin[2]) / s
		if math.abs(x) <= region.bounds and math.abs(z) <= region.bounds then
			return { region = id, x = x, z = z }
		end
	end
	return nil
end

-- Moves the region's ship between two points, carrying the player, then restores it.
local function animateShip(player, regionId, fromPoint, toPoint, seconds)
	local ship = ships[regionId]
	local root = rootOf(player)
	if not ship or not root then
		task.wait(seconds)
		return
	end
	local home = ship:GetPivot()
	local deck = worldPoint(regionId, Content.regions[regionId].points.shipDeck)
	local fromOffset = worldPoint(regionId, fromPoint) - deck
	local toOffset = worldPoint(regionId, toPoint) - deck
	local steps = math.max(1, math.floor(seconds / SAIL_STEP_SECONDS))
	root.Anchored = true
	for step = 0, steps do
		if not player.Parent or rootOf(player) ~= root then
			break
		end
		local offset = fromOffset:Lerp(toOffset, step / steps)
		ship:PivotTo(home + offset)
		root.CFrame = CFrame.new(deck + offset + Vector3.new(0, DECK_CLEARANCE_STUDS, 0))
		task.wait(SAIL_STEP_SECONDS)
	end
	ship:PivotTo(home)
	if root.Parent then
		root.Anchored = false
	end
end

local host = {}

function host.load(userId)
	if not store then
		return false, nil
	end
	return withRetries(function()
		return store:GetAsync(tostring(userId))
	end)
end

function host.save(userId, state)
	if not store then
		return false
	end
	local ok = withRetries(function()
		store:UpdateAsync(tostring(userId), function()
			return state
		end)
	end)
	return ok
end

function host.position(userId)
	local player = Players:GetPlayerByUserId(userId)
	return player and positionOf(player)
end

function host.teleport(userId, regionId, point)
	local player = Players:GetPlayerByUserId(userId)
	local character = player and player.Character
	if character then
		character:PivotTo(CFrame.new(worldPoint(regionId, point) + Vector3.new(0, DECK_CLEARANCE_STUDS, 0)))
	end
end

function host.ask(userId, request)
	local player = Players:GetPlayerByUserId(userId)
	if not player then
		return nil
	end
	nextAskToken += 1
	local token = nextAskToken
	pendingAsks[token] = { userId = userId, thread = coroutine.running(), options = request.options }
	remotes.Ask:FireClient(player, token, request)
	task.delay(ASK_TIMEOUT_SECONDS, function()
		local pending = pendingAsks[token]
		if pending then
			pendingAsks[token] = nil
			task.spawn(pending.thread, nil)
		end
	end)
	return coroutine.yield()
end

function host.say(userId, text)
	local player = Players:GetPlayerByUserId(userId)
	if player then
		remotes.Toast:FireClient(player, text)
	end
end

function host.sail(userId, fromRegion, toRegion, seconds)
	local player = Players:GetPlayerByUserId(userId)
	if not player then
		return
	end
	local state = flow:getState(userId)
	remotes.Toast:FireClient(player, flow:translate(state and state.locale, "ui.sailing"))
	if fromRegion then
		local from = Content.regions[fromRegion].points
		animateShip(player, fromRegion, from.shipDeck, from.seaApproach, seconds / 2)
	end
	local to = Content.regions[toRegion].points
	animateShip(player, toRegion, to.seaApproach, to.shipDeck, fromRegion and seconds / 2 or seconds)
end

local function buildNpc(regionId, npc, parent)
	local description = Instance.new("HumanoidDescription")
	local ok, rig = pcall(function()
		return Players:CreateHumanoidModelFromDescription(description, Enum.HumanoidRigType.R15)
	end)
	if not ok then
		warn("Phoenicia: could not create NPC rig for " .. npc.id)
		return
	end
	rig.Name = npc.id
	local humanoid = rig:FindFirstChildOfClass("Humanoid")
	humanoid.DisplayName = flow:translate("en-US", npc.nameKey)
	humanoid.WalkSpeed = 6
	rig:PivotTo(CFrame.new(worldPoint(regionId, npc) + Vector3.new(0, DECK_CLEARANCE_STUDS, 0)))
	rig.Parent = parent

	-- A small state machine: walk to the next waypoint, pause, repeat.
	task.spawn(function()
		local index = 1
		while rig.Parent do
			local waypoint = npc.patrol[index]
			humanoid:MoveTo(worldPoint(regionId, { x = waypoint[1], z = waypoint[2] }))
			humanoid.MoveToFinished:Wait()
			task.wait(3)
			index = index % #npc.patrol + 1
		end
	end)
end

local function addPrompt(regionId, anchor, parent)
	local part = Instance.new("Part")
	part.Name = "PhoeniciaAnchor"
	part.Anchored = true
	part.CanCollide = false
	part.Transparency = 1
	part.Size = Vector3.new(2, 2, 2)
	part.Position = worldPoint(regionId, anchor) + Vector3.new(0, DECK_CLEARANCE_STUDS, 0)
	part.Parent = parent
	local prompt = Instance.new("ProximityPrompt")
	prompt.ActionText = "Interact"
	prompt.RequiresLineOfSight = false
	prompt.MaxActivationDistance = anchor.radius * Content.projection.robloxStudsPerUnit
	prompt.Parent = part
	prompt.Triggered:Connect(function(player)
		flow:interact(player.UserId)
	end)
end

local function createRemotes()
	local folder = Instance.new("Folder")
	folder.Name = "PhoeniciaRemotes"
	local function remote(name)
		local event = Instance.new("RemoteEvent")
		event.Name = name
		event.Parent = folder
		return event
	end
	local result = { Ask = remote("Ask"), Answer = remote("Answer"), Toast = remote("Toast"), Objective = remote("Objective") }
	folder.Parent = ReplicatedStorage
	return result
end

local function onPlayer(player)
	player.CharacterAdded:Connect(function()
		task.wait()
		local state = flow:getState(player.UserId)
		if state and state.arrived then
			host.teleport(player.UserId, state.region, Content.regions[state.region].points.resume)
		end
	end)
	if not player.Character then
		player.CharacterAdded:Wait()
	end
	flow:enter(player.UserId)
end

function Service.start()
	local ok, result = pcall(function()
		return DataStoreService:GetDataStore(STORE_NAME)
	end)
	if ok then
		store = result
	else
		warn("Phoenicia: DataStore unavailable, progress will not be saved: " .. tostring(result))
	end

	flow = Flow.new(host, gate, Content)
	remotes = createRemotes()

	remotes.Answer.OnServerEvent:Connect(function(player, token, optionId)
		local pending = type(token) == "number" and pendingAsks[token]
		if not pending or pending.userId ~= player.UserId then
			return
		end
		for _, option in pending.options do
			if option.id == optionId then
				pendingAsks[token] = nil
				task.spawn(pending.thread, optionId)
				return
			end
		end
	end)

	for regionId in Content.regions do
		local folder = WorldBuilder.build(Content, regionId, Workspace.Terrain, Workspace)
		ships[regionId] = folder:FindFirstChild("Ship")
		for _, npc in Content.regions[regionId].npcs do
			buildNpc(regionId, npc, folder)
		end
	end
	local anchorsFolder = Workspace:FindFirstChild("Phoenicia_tyre")
	local seen = {}
	for _, node in Content.quests[Gate.QUEST_ID].nodes do
		local key = string.format("%s:%d:%d", node.anchor.region, node.anchor.x, node.anchor.z)
		if not seen[key] then
			seen[key] = true
			addPrompt(node.anchor.region, node.anchor, anchorsFolder)
		end
	end

	Players.PlayerAdded:Connect(onPlayer)
	for _, player in Players:GetPlayers() do
		task.spawn(onPlayer, player)
	end
	Players.PlayerRemoving:Connect(function(player)
		for token, pending in pendingAsks do
			if pending.userId == player.UserId then
				pendingAsks[token] = nil
				task.spawn(pending.thread, nil)
			end
		end
		flow:leave(player.UserId)
	end)

	-- Objective text for the HUD.
	task.spawn(function()
		while true do
			for _, player in Players:GetPlayers() do
				local state = flow:getState(player.UserId)
				if state then
					local node = gate:currentNode(state)
					local text = node and flow:translate(state.locale, node.promptKey)
						or flow:translate(state.locale, "prompt.codex")
					remotes.Objective:FireClient(player, flow:translate(state.locale, "quest.tyr05.title"), text)
				end
			end
			task.wait(1)
		end
	end)
end

return Service
