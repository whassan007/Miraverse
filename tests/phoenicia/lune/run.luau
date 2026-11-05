--!nonstrict
-- Headless Roblox-side tests. Run from the repo root: lune run tests/phoenicia/lune/run.luau
-- Covers the real Gate, Flow and WorldBuilder modules. It cannot cover the live Roblox
-- engine: physics, streaming, DataStore, prompts and the client UI need Studio.
local fs = require("@lune/fs")
local luau = require("@lune/luau")
local process = require("@lune/process")
local roblox = require("@lune/roblox")
local serde = require("@lune/serde")

local Content = require("../../../apps/roblox/src/shared/Phoenicia/Content")
local Machine = require("../../../apps/roblox/src/server/QuestEngine/ByblosQuestStateMachine")
local GateModule = require("../../../apps/roblox/src/server/Phoenicia/Gate")
local FlowModule = require("../../../apps/roblox/src/server/Phoenicia/Flow")

local failures, passes = 0, 0
local function check(name, condition, detail)
	if condition then
		passes += 1
	else
		failures += 1
		print("FAIL " .. name .. (detail and (": " .. tostring(detail)) or ""))
	end
end

local function sameJson(a, b)
	return serde.encode("json", a) == serde.encode("json", b)
end

-- JSON encoding sorts nothing, so compare field by field for a stable result.
local function sameSnapshot(actual, expected)
	return actual.lifecycle == expected.lifecycle
		and actual.region == expected.region
		and actual.storySparks == expected.storySparks
		and actual.attempts == expected.attempts
		and sameJson(actual.completed, expected.completed)
		and sameJson(actual.artifacts, expected.artifacts)
end

local gate = GateModule.new(Machine, Content)

-- 1. Shared vectors, identical to the ones the Minecraft engine must pass.
local vectors = serde.decode("json", fs.readFile("tests/phoenicia/vectors.json"))
for _, scenario in vectors.scenarios do
	local state = gate:createState(1)
	for index, step in scenario.steps do
		local code = gate:applyEvent(state, step[1])
		local label = scenario.name .. " #" .. index
		check(label .. " code", code == step[2].code, code .. " vs " .. step[2].code)
		check(label .. " snapshot", sameSnapshot(gate:snapshot(state), step[2]), serde.encode("json", gate:snapshot(state)))
	end
end

-- 2. The acceptance journey, through the real Flow with a scripted host.
local function newWorld()
	local world = { saved = nil, saveCount = 0, pos = nil, said = {}, answers = {}, voyages = 0, loadOk = true, saveOk = true }
	world.host = {
		load = function()
			if not world.loadOk then
				return false, nil
			end
			return true, world.saved and serde.decode("json", world.saved)
		end,
		save = function(_, state)
			world.saveCount += 1
			if world.saveOk then
				world.saved = serde.encode("json", state)
			end
			return world.saveOk
		end,
		position = function()
			return world.pos
		end,
		teleport = function(_, region, point)
			world.pos = { region = region, x = point.x, z = point.z }
		end,
		ask = function(_, request)
			local answer = table.remove(world.answers, 1)
			if answer == nil then
				return request.options[1].id
			end
			return answer
		end,
		say = function(_, text)
			table.insert(world.said, text)
		end,
		sail = function(_, from)
			if from then
				world.voyages += 1
			end
		end,
	}
	return world
end

local function walk(world, region, x, z)
	world.pos = { region = region, x = x, z = z }
end

do
	local world = newWorld()
	local flow = FlowModule.new(world.host, gate, Content)
	world.answers = { "en-US" }
	flow:enter(7)
	check("arrives at tyre dock", world.pos.region == "tyre" and world.pos.x == -20 and world.pos.z == -40)

	check("no prompt away from an objective", flow:promptFor(7) == nil)
	flow:interact(7)
	check("interacting away from an objective does nothing", flow:getState(7).lifecycle == "AVAILABLE")

	walk(world, "tyre", -20, 4)
	world.answers = { "accept" }
	flow:interact(7)

	walk(world, "tyre", -20, -42)
	world.answers = { "open_west", "coast_port", "coast_starboard" }
	flow:interact(7)
	check("wrong courses are counted then retried", flow:getState(7).attempts == 2)
	check("voyage reaches byblos", world.pos.region == "byblos" and world.voyages == 1)

	-- Reconnect at Byblos: the destination's progress must survive.
	flow:leave(7)
	local flowAfterReconnect = FlowModule.new(world.host, gate, Content)
	flowAfterReconnect:enter(7)
	check("reconnect resumes at byblos", world.pos.region == "byblos")
	check("reconnect keeps progress", #gate:snapshot(flowAfterReconnect:getState(7)).completed == 2)

	walk(world, "byblos", 8, 6)
	world.answers = { "green", "seasoned" }
	flowAfterReconnect:interact(7)

	walk(world, "byblos", -14, 0)
	world.answers = { "coast_port" }
	flowAfterReconnect:interact(7)
	check("return voyage reaches tyre", world.pos.region == "tyre" and world.voyages == 2)

	walk(world, "tyre", -20, 4)
	world.answers = { "commission" }
	flowAfterReconnect:interact(7)
	local final = flowAfterReconnect:getState(7)
	check("quest completes", final.lifecycle == "COMPLETED")
	check("reward granted once", final.storySparks == 50 and #final.artifacts == 1)

	local third = FlowModule.new(world.host, gate, Content)
	third:enter(7)
	check("completion survives reload", third:getState(7).lifecycle == "COMPLETED" and third:getState(7).storySparks == 50)
	walk(world, "tyre", -20, 4)
	check("codex is offered after completion", third:promptFor(7) == Content.strings["prompt.codex"]["en-US"])
	third:interact(7)
	check("codex does not grant more rewards", third:getState(7).storySparks == 50)
end

-- 3. A failed load must never overwrite the real save.
do
	local world = newWorld()
	world.saved = "real-save-sentinel"
	world.loadOk = false
	local flow = FlowModule.new(world.host, gate, Content)
	world.answers = { "en-US" }
	flow:enter(9)
	walk(world, "tyre", -20, 4)
	world.answers = { "accept" }
	flow:interact(9)
	check("failed load disables saving", world.saveCount == 0 and world.saved == "real-save-sentinel")
end

-- 4. A failed save warns the player and play continues.
do
	local world = newWorld()
	world.saveOk = false
	local flow = FlowModule.new(world.host, gate, Content)
	world.answers = { "en-US" }
	flow:enter(10)
	check("failed save warns", table.find(world.said, Content.strings["ui.save_failed"]["en-US"]) ~= nil)
	walk(world, "tyre", -20, 4)
	world.answers = { "accept" }
	flow:interact(10)
	check("play continues after a failed save", #gate:snapshot(flow:getState(10)).completed == 1)
end

-- 5. Corrupt saves are rejected rather than loaded.
for name, raw in { number = 5, wrongVersion = { schemaVersion = 99 }, noRecord = { schemaVersion = 1, region = "tyre" } } do
	check("rejects corrupt save: " .. name, gate:parseState(raw) == nil)
end

-- 6. The real WorldBuilder, against real Lune Instances and a recording Terrain stub.
do
	local source = fs.readFile("apps/roblox/src/server/Phoenicia/WorldBuilder.luau")
	local environment = { Instance = roblox.Instance, Vector3 = roblox.Vector3, CFrame = roblox.CFrame, Color3 = roblox.Color3, Enum = roblox.Enum }
	local builder = luau.load(source, { debugName = "WorldBuilder", environment = environment })()
	for regionId, region in Content.regions do
		local fills = {}
		local terrain = {
			FillBlock = function(_, cframe, size, material)
				table.insert(fills, { position = cframe.Position, size = size, material = material })
			end,
		}
		local parent = roblox.Instance.new("Folder")
		local folder = builder.build(Content, regionId, terrain, parent)
		local descendants = folder:GetDescendants()
		local parts = 0
		for _, item in descendants do
			if item:IsA("BasePart") then
				parts += 1
			end
		end
		check(regionId .. " builds every box", parts == #region.boxes, parts .. " vs " .. #region.boxes)
		check(regionId .. " has a ship model", folder:FindFirstChild("Ship") ~= nil and #folder.Ship:GetChildren() == 3)
		check(regionId .. " fills terrain", #fills >= 2 + #region.landRows)
	end
end

-- 7. Every Roblox Phoenicia source file must compile.
for _, path in {
	"apps/roblox/src/server/Phoenicia/Service.luau",
	"apps/roblox/src/client/PhoeniciaClient.client.luau",
	"apps/roblox/src/server/Main.server.luau",
} do
	local ok, err = pcall(luau.compile, fs.readFile(path))
	check("compiles " .. path, ok, err)
end

print(string.format("Lune: %d passed, %d failed", passes, failures))
process.exit(if failures > 0 then 1 else 0)
