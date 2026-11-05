--!nonstrict
-- Headless boot test. Loads a real Rojo-built place and runs its real server and client
-- scripts against a simulated engine, then plays through it by pressing the real UI.
--
--   lune run tests/roblox/boot.luau default  <place.rbxlx>
--   lune run tests/roblox/boot.luau phoenicia <place.rbxlx>
--
-- It catches startup hangs, script errors and broken game logic. It simulates events,
-- remotes, signals and movement, so it does not replace a playtest in Roblox Studio:
-- physics, rendering, streaming, replication and real DataStores are not exercised.
local fs = require("@lune/fs")
local luau = require("@lune/luau")
local process = require("@lune/process")
local roblox = require("@lune/roblox")
local task = require("@lune/task")

local MODE = process.args[1]
local PLACE = process.args[2]
local WAIT_FOR_CHILD_TIMEOUT = 2
local Instance, Vector3, CFrame, Enum = roblox.Instance, roblox.Vector3, roblox.CFrame, roblox.Enum

local failures, passes, scriptErrors = 0, 0, {}
local function check(name, condition, detail)
	if condition then
		passes += 1
		print("  ok   " .. name)
	else
		failures += 1
		print("  FAIL " .. name .. (detail ~= nil and (": " .. tostring(detail)) or ""))
	end
end
local function recordError(where, err)
	table.insert(scriptErrors, where .. ": " .. tostring(err))
end

-- Per-instance simulated state. Userdata identity isn't stable, so key on an attribute.
local nextId, instanceState = 0, {}
local function stateOf(instance)
	local id = instance:GetAttribute("__bootId")
	if not id then
		nextId += 1
		id = nextId
		instance:SetAttribute("__bootId", id)
		instanceState[id] = {}
	end
	return instanceState[id]
end

local function newSignal(name)
	local signal = { handlers = {}, name = name }
	function signal:Connect(fn)
		-- Real Roblox rejects a non-function here, which would abort the calling script.
		if type(fn) ~= "function" then
			error("Attempt to connect failed: Passed value is not a function (" .. self.name .. ")", 2)
		end
		local entry = { fn = fn }
		table.insert(self.handlers, entry)
		-- Real remote events queue anything sent before the first listener connects.
		if self.queued then
			local queued = self.queued
			self.queued = nil
			for _, args in queued do
				self:Fire(table.unpack(args, 1, args.n))
			end
		end
		return {
			Disconnect = function()
				local at = table.find(self.handlers, entry)
				if at then
					table.remove(self.handlers, at)
				end
			end,
		}
	end
	function signal:Wait()
		local thread = coroutine.running()
		local connection
		connection = self:Connect(function(...)
			connection.Disconnect()
			task.spawn(thread, ...)
		end)
		return coroutine.yield()
	end
	function signal:Fire(...)
		if #self.handlers == 0 and string.find(self.name, "OnClientEvent", 1, true) then
			self.queued = self.queued or {}
			table.insert(self.queued, table.pack(...))
			return
		end
		for _, entry in table.clone(self.handlers) do
			task.spawn(function(...)
				local ok, err = xpcall(entry.fn, debug.traceback, ...)
				if not ok then
					recordError("signal " .. self.name, err)
				end
			end, ...)
		end
	end
	return signal
end

local function implementSignals(classNames, signalName)
	for _, className in classNames do
		roblox.implementProperty(className, signalName, function(instance)
			local state = stateOf(instance)
			state[signalName] = state[signalName] or newSignal(className .. "." .. signalName)
			return state[signalName]
		end, function() end)
	end
end

local PART_CLASSES = { "Part", "SpawnLocation", "WedgePart" }
implementSignals({ "ProximityPrompt" }, "Triggered")
implementSignals(PART_CLASSES, "Touched")
implementSignals({ "ClickDetector" }, "MouseClick")
implementSignals({ "RemoteEvent" }, "OnServerEvent")
implementSignals({ "RemoteEvent" }, "OnClientEvent")
implementSignals({ "BindableEvent" }, "Event")
implementSignals({ "TextButton" }, "Activated")
implementSignals({ "Players" }, "PlayerAdded")
implementSignals({ "Players" }, "PlayerRemoving")
implementSignals({ "Player" }, "CharacterAdded")
implementSignals({ "Humanoid" }, "MoveToFinished")

local localPlayer = nil

roblox.implementMethod("Instance", "WaitForChild", function() end)
local function waitForChild(instance, name)
	local deadline = os.clock() + WAIT_FOR_CHILD_TIMEOUT
	while true do
		local child = instance:FindFirstChild(name)
		if child then
			return child
		end
		if os.clock() > deadline then
			error(string.format("INFINITE YIELD: %s never gets child %q", instance:GetFullName(), name), 2)
		end
		task.wait(0.01)
	end
end
local function implementForClasses(classNames, method, fn)
	for _, className in classNames do
		roblox.implementMethod(className, method, fn)
	end
end
implementForClasses({
	"Folder", "Model", "Player", "PlayerGui", "ReplicatedStorage", "ModuleScript", "Script", "LocalScript",
	"Workspace", "ServerScriptService", "StarterPlayerScripts", "ScreenGui", "Frame",
}, "WaitForChild", waitForChild)

implementForClasses({ "Model" }, "PivotTo", function(model, cframe)
	stateOf(model).pivot = cframe
	local root = model:FindFirstChild("HumanoidRootPart")
	if root then
		root.CFrame = cframe
		root.Position = cframe.Position
	end
end)
implementForClasses({ "Model" }, "GetPivot", function(model)
	return stateOf(model).pivot or CFrame.new(0, 0, 0)
end)
implementForClasses({ "Terrain" }, "FillBlock", function(terrain)
	local state = stateOf(terrain)
	state.fills = (state.fills or 0) + 1
end)
implementForClasses({ "Humanoid" }, "MoveTo", function(humanoid)
	local state = stateOf(humanoid)
	state.moves = (state.moves or 0) + 1
	task.delay(0.05, function()
		if state.MoveToFinished then
			state.MoveToFinished:Fire(true)
		end
	end)
end)

-- Remotes: everything runs in one process, so a fire is delivered directly.
implementForClasses({ "RemoteEvent" }, "FireClient", function(remote, _, ...)
	remote.OnClientEvent:Fire(...)
end)
implementForClasses({ "RemoteEvent" }, "FireAllClients", function(remote, ...)
	remote.OnClientEvent:Fire(...)
end)
implementForClasses({ "RemoteEvent" }, "FireServer", function(remote, ...)
	remote.OnServerEvent:Fire(localPlayer, ...)
end)
implementForClasses({ "BindableEvent" }, "Fire", function(event, ...)
	event.Event:Fire(...)
end)
roblox.implementProperty("RemoteFunction", "OnServerInvoke", function(remote)
	return stateOf(remote).invoke
end, function(remote, fn)
	stateOf(remote).invoke = fn
end)
implementForClasses({ "RemoteFunction" }, "InvokeServer", function(remote, ...)
	local fn = stateOf(remote).invoke
	if not fn then
		error("RemoteFunction has no OnServerInvoke: " .. remote.Name)
	end
	return fn(localPlayer, ...)
end)

implementForClasses({ "Players" }, "GetPlayers", function()
	return if localPlayer then { localPlayer } else {}
end)
implementForClasses({ "Players" }, "GetPlayerByUserId", function(_, userId)
	return if localPlayer and localPlayer.UserId == userId then localPlayer else nil
end)
implementForClasses({ "Players" }, "GetPlayerFromCharacter", function(_, character)
	return if localPlayer and localPlayer.Character == character then localPlayer else nil
end)
implementForClasses({ "Players" }, "CreateHumanoidModelFromDescription", function()
	local rig = Instance.new("Model")
	Instance.new("Humanoid").Parent = rig
	local root = Instance.new("Part")
	root.Name = "HumanoidRootPart"
	root.Parent = rig
	return rig
end)

-- An in-memory DataStore that survives a simulated rejoin.
local dataStoreRows, dataStoreWrites = {}, 0
implementForClasses({ "DataStoreService" }, "GetDataStore", function()
	return {
		GetAsync = function(_, key)
			return dataStoreRows[key]
		end,
		UpdateAsync = function(_, key, transform)
			dataStoreRows[key] = transform(dataStoreRows[key])
			dataStoreWrites += 1
		end,
	}
end)

local game = roblox.deserializePlace(fs.readFile(PLACE))
local workspace = game:GetService("Workspace")
if not workspace:FindFirstChild("Terrain") then
	Instance.new("Terrain").Parent = workspace
end
for _, service in { "Players", "Lighting", "DataStoreService", "TextChatService", "StarterGui", "RunService" } do
	game:GetService(service)
end
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

implementForClasses({ "RunService" }, "IsServer", function()
	return true
end)
implementForClasses({ "StarterGui" }, "SetCoreGuiEnabled", function() end)

local function makeContext(label)
	local cache = {}
	local run
	local function requireModule(module)
		local key = module:GetFullName()
		if cache[key] == nil then
			cache[key] = run(module)
		end
		return cache[key]
	end
	function run(instance)
		local chunk = luau.load(instance.Source, {
			debugName = label .. ":" .. instance:GetFullName(),
			environment = {
				script = instance,
				game = game,
				workspace = workspace,
				require = requireModule,
				Instance = Instance,
				Vector3 = Vector3,
				CFrame = CFrame,
				Enum = Enum,
				Color3 = roblox.Color3,
				UDim = roblox.UDim,
				UDim2 = roblox.UDim2,
				task = task,
				Random = {
					new = function()
						return {
							NextInteger = function(_, low, high)
								return math.random(low, high)
							end,
						}
					end,
				},
				warn = function(...)
					print("  warn", ...)
				end,
			},
		})
		return chunk()
	end
	return run
end

local function runScripts(root, class, label)
	local run = makeContext(label)
	for _, item in root:GetDescendants() do
		if item.ClassName == class then
			task.spawn(function()
				local ok, err = xpcall(run, debug.traceback, item)
				if not ok then
					recordError(item:GetFullName(), err)
				end
			end)
		end
	end
end

local function addPlayer(userId)
	local player = Instance.new("Player")
	player.Name = "Tester"
	player.UserId = userId
	player.Parent = Players
	localPlayer = player
	Players.LocalPlayer = player
	Instance.new("PlayerGui").Parent = player
	local character = Instance.new("Model")
	character.Name = "Tester"
	local root = Instance.new("Part")
	root.Name = "HumanoidRootPart"
	root.CFrame = CFrame.new(0, 14, 0)
	root.Position = root.CFrame.Position
	root.Anchored = false
	root.Parent = character
	character.Parent = workspace
	-- Real parts keep Position and CFrame in sync; the file-format library doesn't.
	task.spawn(function()
		while true do
			root.Position = root.CFrame.Position
			task.wait(0.005)
		end
	end)
	player.Character = character
	Players.PlayerAdded:Fire(player)
	player.CharacterAdded:Fire(character)
	return player, character, root
end

local function settle(seconds)
	task.wait(seconds or 0.1)
end

local function findButton(gui, text)
	for _, item in gui:GetDescendants() do
		if item.ClassName == "TextButton" and item.Text == text then
			return item
		end
	end
	return nil
end

local function isVisibleChain(item)
	while item and item:IsA("GuiObject") do
		if not item.Visible then
			return false
		end
		item = item.Parent
	end
	return true
end

local function press(gui, text)
	local button = findButton(gui, text)
	if not button then
		error("No button: " .. text)
	end
	button.Activated:Fire()
	return button
end

-- Plays whichever challenge folder exists using the world objects a player would use.
local function solveChallenge(folder, character)
	local root = character.HumanoidRootPart
	local hasType = function(prefix)
		for _, part in folder:GetChildren() do
			if string.sub(part.Name, 1, #prefix) == prefix then
				return true
			end
		end
		return false
	end
	local click = function(part)
		part:FindFirstChildOfClass("ClickDetector").MouseClick:Fire(localPlayer)
		settle(0.01)
	end
	if hasType("Collect_") then
		for _, part in folder:GetChildren() do
			if string.sub(part.Name, 1, 8) == "Collect_" then
				part.Touched:Fire(root)
				settle(0.01)
			end
		end
	elseif hasType("Word_") then
		local parts = {}
		for _, part in folder:GetChildren() do
			parts[tonumber(string.sub(part.Name, 6))] = part
		end
		-- The last correct word finishes the challenge and destroys the folder.
		for i = 1, #parts do
			parts[i]:FindFirstChildOfClass("ClickDetector").MouseClick:Fire(localPlayer)
			settle(0.01)
		end
	elseif hasType("Station_") then
		return "cook"
	elseif hasType("Ghost") then
		for _, palette in folder:GetChildren() do
			if string.sub(palette.Name, 1, 8) == "Palette_" then
				click(palette)
				for _, ghost in folder:GetChildren() do
					if ghost.Parent and ghost.Name == "Ghost" then
						click(ghost)
					end
				end
			end
		end
	elseif folder:FindFirstChild("Mentor") then
		click(folder.Mentor)
	end
	return nil
end

local function bootChecks()
	settle(0.3)
	runScripts(game:GetService("ServerScriptService"), "Script", "server")
	settle(0.3)
	local map = workspace:FindFirstChild("MiraVerseMap")
	check("server builds the map", map ~= nil)
	if map then
		for _, item in map:GetDescendants() do
			-- Parts placed with CFrame have no stored Position to copy.
			local hasPosition, position = pcall(function()
				return item.Position
			end)
			if item:IsA("BasePart") and hasPosition then
				item.CFrame = CFrame.new(position)
			end
		end
	end

	local spawnCount = 0
	for _, item in workspace:GetDescendants() do
		if item.ClassName == "SpawnLocation" then
			spawnCount += 1
		end
	end
	check("players have exactly one spawn point", spawnCount == 1, spawnCount)
	return map
end

local function defaultMode()
	local map = bootChecks()
	settle(WAIT_FOR_CHILD_TIMEOUT + 0.5)
	check("server creates its remotes", ReplicatedStorage:FindFirstChild("MiraVerseRemotes") ~= nil)
	local mentor = map and map:FindFirstChild("Mentor_LB", true)
	check("mentor name comes from the content pack", mentor and mentor:GetAttribute("MentorName") == "Teta Nahla", mentor and mentor:GetAttribute("MentorName"))

	local player, character, root = addPlayer(101)
	runScripts(game:GetService("StarterPlayer"), "LocalScript", "client")
	settle(WAIT_FOR_CHILD_TIMEOUT + 0.5)

	local gui = player.PlayerGui:FindFirstChild("MiraVerseUI")
	check("client builds its UI", gui ~= nil)
	if not gui then
		return
	end
	local picker = findButton(gui, "Lebanon")
	check("country picker is visible", picker ~= nil and isVisibleChain(picker))
	if not picker then
		return
	end

	local packs = require("../../apps/roblox/src/shared/Packs")
	local countries = {
		{ "LB", "Lebanon" }, { "EG", "Egypt" }, { "IQ", "Iraq" }, { "KR", "South Korea" }, { "FR", "France" },
	}
	for _, country in countries do
		local code, label = country[1], country[2]
		print("  -- " .. label)
		press(gui, label)
		settle(0.3)
		local spawn = map:FindFirstChild("Spawn_" .. code, true)
		check(code .. ": moves the player to its plaza", (root.Position - spawn.Position).Magnitude < 8, root.Position)
		local playButton = findButton(gui, "Play challenge")
		check(code .. ": play button is visible", playButton ~= nil and isVisibleChain(playButton))

		for index, challenge in packs[code].chapters[1].challenges do
			settle(0.3)
			playButton.Activated:Fire()
			settle(0.2)
			local folder
			for _, item in workspace:GetChildren() do
				if string.sub(item.Name, 1, 10) == "Challenge_" then
					folder = item
				end
			end
			local label2 = string.format("%s: challenge %d (%s)", code, index, challenge.type)
			check(label2 .. " opens in the world", folder ~= nil)
			if not folder then
				break
			end
			if solveChallenge(folder, character) == "cook" then
				for _, id in challenge.recipe.inputs do
					folder:FindFirstChild("Station_" .. id):FindFirstChildOfClass("ClickDetector").MouseClick:Fire(player)
					settle(0.01)
				end
			end
			settle(0.2)
			local stillOpen = false
			for _, item in workspace:GetChildren() do
				if string.sub(item.Name, 1, 10) == "Challenge_" then
					stillOpen = true
				end
			end
			check(label2 .. " can be completed", not stillOpen)
			if stillOpen then
				break
			end
		end
		settle(0.3)
		local stamp = nil
		for _, item in gui:GetDescendants() do
			if item.ClassName == "TextLabel" and string.find(item.Text, "^MV") and isVisibleChain(item) then
				stamp = item.Text
			end
		end
		check(code .. ": finishing the chapter shows the souvenir stamp", stamp ~= nil and string.find(stamp, code, 1, true) ~= nil, stamp)
		press(gui, "Close")
		settle(0.05)
	end
	local toast = gui:FindFirstChild("ChallengeToast")
	check("challenge goals are shown to the player", toast ~= nil and #toast.Message.Text > 0)
end

local function phoeniciaMode()
	local Content = require("../../apps/roblox/src/shared/Phoenicia/Content")
	bootChecks()
	settle(0.5)
	check("server creates Phoenicia remotes", ReplicatedStorage:FindFirstChild("PhoeniciaRemotes") ~= nil)
	local tyre = workspace:FindFirstChild("Phoenicia_tyre")
	check("Tyre is built", tyre ~= nil and tyre:FindFirstChild("north_dock") ~= nil)
	check("Byblos is built", workspace:FindFirstChild("Phoenicia_byblos") ~= nil)
	check("terrain is filled", (stateOf(workspace.Terrain).fills or 0) > 100, stateOf(workspace.Terrain).fills)
	check("NPCs are created", tyre ~= nil and tyre:FindFirstChild("hanno") ~= nil)
	check("NPCs walk", tyre ~= nil and tyre:FindFirstChild("hanno") ~= nil and (stateOf(tyre.hanno.Humanoid).moves or 0) >= 1)

	local player, _, root = addPlayer(202)
	runScripts(game:GetService("StarterPlayer"), "LocalScript", "client")
	settle(0.5)
	local gui = player.PlayerGui:FindFirstChild("PhoeniciaUI")
	check("Phoenicia UI is built", gui ~= nil)
	if not gui then
		return
	end
	local countryUi = player.PlayerGui:FindFirstChild("MiraVerseUI")
	local picker = countryUi and findButton(countryUi, "Lebanon")
	check("country picker doesn't cover Tyre", picker == nil or not isVisibleChain(picker))

	local answer = function(text)
		local deadline = os.clock() + 15
		while os.clock() < deadline do
			local button = findButton(gui, text)
			if button and isVisibleChain(button) then
				button.Activated:Fire()
				settle(0.1)
				return true
			end
			settle(0.05)
		end
		return false
	end
	local stand = function(region, x, z)
		local origin = Content.regions[region].origins.roblox
		local s = Content.projection.robloxStudsPerUnit
		root.CFrame = CFrame.new(origin[1] + x * s, 12, origin[2] + z * s)
		root.Position = root.CFrame.Position
		settle(0.05)
	end
	local trigger = function()
		local fired = false
		for _, item in tyre:GetDescendants() do
			if item.ClassName == "ProximityPrompt" then
				item.Triggered:Fire(player)
				fired = true
				break
			end
		end
		settle(0.1)
		return fired
	end
	local strings = Content.strings
	local en = function(key)
		return strings[key]["en-US"]
	end

	check("language dialog appears", answer("English"))
	settle(7)
	local origin = Content.regions.tyre.origins.roblox
	local distance = (root.Position - Vector3.new(origin[1] + -20 * 3, root.Position.Y, origin[2] + -40 * 3)).Magnitude
	check("arrives at Tyre's north dock by ship", distance < 6, distance)
	check("objective HUD is showing", #gui:GetDescendants() > 0)

	stand("tyre", -20, 4)
	check("a prompt exists", trigger())
	check("Hanno offers the quest", answer(en("tyr05.accept.yes")))

	stand("tyre", -20, -42)
	trigger()
	check("wrong course is offered", answer(en("course.open_west")))
	check("course dialog returns after a wrong answer", answer(en("course.coast_right")))
	settle(9)
	local byblos = Content.regions.byblos.origins.roblox
	check("voyage reaches Byblos", math.abs(root.Position.Z - byblos[2]) < 150, root.Position)

	stand("byblos", 8, 6)
	trigger()
	check("wrong cedar is offered", answer(en("tyr05.cedar.green")))
	check("Arishat re-asks after a wrong answer", answer(en("tyr05.cedar.seasoned")))
	check("progress was written to the DataStore", dataStoreWrites >= 3, dataStoreWrites)

	stand("byblos", -14, 0)
	trigger()
	check("return course dialog appears", answer(en("course.coast_left")))
	settle(9)
	check("return voyage reaches Tyre", math.abs(root.Position.Z - origin[2]) < 250, root.Position)

	stand("tyre", -20, 4)
	trigger()
	check("Hanno offers the commission", answer(en("tyr05.commission.yes")))
	settle(0.3)
	local saved = dataStoreRows["202"]
	check("quest completes in the save", saved and saved.lifecycle == "COMPLETED", saved and saved.lifecycle)
	check("reward is saved once", saved and saved.storySparks == 50 and #saved.artifacts == 1)
	check("root part is unanchored after voyages", root.Anchored == false)

	stand("tyre", -20, 4)
	trigger()
	check("codex opens after completion", answer(en("ui.continue")))
end

task.spawn(function()
	local ok, err = pcall(if MODE == "phoenicia" then phoeniciaMode else defaultMode)
	if not ok then
		recordError("test", err)
	end
	print("")
	for _, message in scriptErrors do
		print("SCRIPT ERROR " .. message)
	end
	failures += #scriptErrors
	print(string.format("Boot test (%s): %d passed, %d failed", tostring(MODE), passes, failures))
	process.exit(if failures > 0 then 1 else 0)
end)
