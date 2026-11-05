-- Server-validated challenge runner. All state lives on the server; client
-- input arrives via ReplicatedStorage.ChallengeRemotes.Action and is validated
-- by the per-type handler. Nothing is persisted or sent off-platform.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Locale = require(script.Parent.Atlas.Locale)

local Challenges = {}

local HANDLERS = {
	gather = "Gather",
	cook = "Cook",
	build = "Build",
	trade = "Trade",
	word = "Word",
	source = "Source",
}

local active = {} -- [Player] = session
local remotes = nil
local inventory = nil -- optional provider: { has, remove, add }

local function getRemotes()
	if remotes then
		return remotes
	end
	local folder = ReplicatedStorage:FindFirstChild("ChallengeRemotes")
	if not folder then
		folder = Instance.new("Folder")
		folder.Name = "ChallengeRemotes"
		folder.Parent = ReplicatedStorage
	end
	local function ensure(name)
		local r = folder:FindFirstChild(name)
		if not r then
			r = Instance.new("RemoteEvent")
			r.Name = name
			r.Parent = folder
		end
		return r
	end
	remotes = { Action = ensure("Action"), Notify = ensure("Notify"), State = ensure("State") }
	if RunService:IsServer() then
		remotes.Action.OnServerEvent:Connect(function(player, challengeId, action)
			local session = active[player]
			if not session or session.done or session.challenge.id ~= challengeId then
				return
			end
			if type(action) ~= "table" then
				return
			end
			if session.busy then
				return
			end
			session.busy = true
			local ok, err = pcall(session.handler.onAction, session.handler, action)
			session.busy = false
			if not ok then
				warn("[Challenges] handler error: " .. tostring(err))
			end
		end)
	end
	return remotes
end

-- Creates the remotes up front so clients can subscribe before the first challenge.
function Challenges.init()
	getRemotes()
end

-- Optional hook so the host game can back items with a real inventory.
function Challenges.setInventoryProvider(provider)
	inventory = provider
end

-- Local ledger fallback when no provider is installed (session-only).
local ledgers = {}
local function ledgerOf(player)
	local l = ledgers[player]
	if not l then
		l = {}
		ledgers[player] = l
	end
	return l
end

local function invHas(player, item, count)
	if inventory and inventory.has then
		return inventory.has(player, item, count)
	end
	return (ledgerOf(player)[item] or 0) >= count
end

local function invAdd(player, item, count)
	if inventory and inventory.add then
		inventory.add(player, item, count)
		return
	end
	local l = ledgerOf(player)
	l[item] = (l[item] or 0) + count
end

local function invRemove(player, item, count)
	if inventory and inventory.remove then
		inventory.remove(player, item, count)
		return
	end
	local l = ledgerOf(player)
	l[item] = math.max(0, (l[item] or 0) - count)
end

local function cleanup(session)
	if session.cleaned then
		return
	end
	session.cleaned = true
	for _, c in ipairs(session.connections) do
		c:Disconnect()
	end
	table.clear(session.connections)
	if session.folder then
		session.folder:Destroy()
	end
	if active[session.player] == session then
		active[session.player] = nil
	end
end

local function buildContext(session)
	local player, pack = session.player, session.pack
	local items = {}
	for _, it in ipairs(pack.items or {}) do
		items[it.id] = it
	end
	local ctx = {
		player = player,
		challenge = session.challenge,
		pack = pack,
		folder = session.folder,
		results = session.results,
	}

	function ctx.origin()
		local char = player.Character
		local root = char and char:FindFirstChild("HumanoidRootPart")
		if root then
			local look = root.CFrame.LookVector
			local flat = Vector3.new(look.X, 0, look.Z)
			if flat.Magnitude < 0.01 then
				flat = Vector3.new(0, 0, -1)
			end
			return CFrame.lookAt(root.Position, root.Position + flat.Unit)
		end
		return CFrame.new(0, 5, 0)
	end

	function ctx.t(key, ...)
		return Locale.get(session.locale, key, ...)
	end

	function ctx.meaning(word)
		if word.meaningKey then
			return Locale.meaning(session.locale, word.meaningKey)
		end
		return word.en
	end

	function ctx.itemName(id)
		local item = items[id]
		if item and item.nameKey then
			return ctx.t(item.nameKey)
		end
		return item and item.name_en or tostring(id)
	end

	function ctx.itemColor(id)
		local it = items[id]
		if it and type(it.color) == "string" then
			local ok, c = pcall(Color3.fromHex, it.color)
			if ok then
				return c
			end
		end
		return Color3.fromRGB(200, 200, 200)
	end

	function ctx.isOwner(who)
		return who == player
	end

	-- Resolve a Touched/Click source to a Player.
	function ctx.playerFromPart(part)
		local model = part and part:FindFirstAncestorOfClass("Model")
		return model and Players:GetPlayerFromCharacter(model) or nil
	end

	function ctx.newPart(name, size, cframe, color, parent)
		local p = Instance.new("Part")
		p.Name = name
		p.Size = size
		p.CFrame = cframe
		p.Color = color
		p.Anchored = true
		p.TopSurface = Enum.SurfaceType.Smooth
		p.BottomSurface = Enum.SurfaceType.Smooth
		p.Parent = parent or session.folder
		return p
	end

	function ctx.label(part, text)
		local gui = Instance.new("BillboardGui")
		gui.Size = UDim2.fromOffset(160, 40)
		gui.StudsOffset = Vector3.new(0, 2.5, 0)
		gui.AlwaysOnTop = true
		gui.Parent = part
		local t = Instance.new("TextLabel")
		t.Size = UDim2.fromScale(1, 1)
		t.BackgroundTransparency = 0.3
		t.BackgroundColor3 = Color3.new(1, 1, 1)
		t.TextColor3 = Color3.new(0, 0, 0)
		t.TextScaled = true
		t.Text = text
		t.Parent = gui
		return gui
	end

	function ctx.click(part, fn)
		local cd = Instance.new("ClickDetector")
		cd.MaxActivationDistance = 40
		cd.Parent = part
		table.insert(session.connections, cd.MouseClick:Connect(function(who)
			if who == player and not session.done and not session.busy then
				session.busy = true
				local ok, err = pcall(fn, who)
				session.busy = false
				if not ok then
					warn("[Challenges] click error: " .. tostring(err))
				end
			end
		end))
		return cd
	end

	function ctx.connect(conn)
		table.insert(session.connections, conn)
	end

	function ctx.notify(text, kind)
		getRemotes().Notify:FireClient(player, session.challenge.id, text, kind or "info")
	end

	function ctx.say(key, ...)
		ctx.notify(ctx.t(key, ...), "info")
	end

	function ctx.progress(payload)
		getRemotes().State:FireClient(player, session.challenge.id, payload)
	end

	ctx.has = function(item, count)
		return invHas(player, item, count)
	end
	ctx.remove = function(item, count)
		invRemove(player, item, count)
	end
	ctx.grant = function(item, count)
		invAdd(player, item, count)
		table.insert(session.results, { item = item, count = count })
	end

	function ctx.finish(ok)
		if session.done then
			return
		end
		session.done = true
		session.success = ok and true or false
		session.finished:Fire()
	end

	return ctx
end

-- Blocks the calling thread until the challenge completes (true) or is
-- abandoned (false). Returns success, results.
function Challenges.run(player, challenge, pack, locale)
	if typeof(player) ~= "Instance" or not player:IsA("Player") or player.Parent ~= Players then
		return false, {}
	end
	if type(challenge) ~= "table" or type(pack) ~= "table" then
		return false, {}
	end
	if active[player] then
		return false, {} -- already running one; reject double submission
	end
	local moduleName = HANDLERS[challenge.type]
	if not moduleName then
		warn("[Challenges] unknown challenge type: " .. tostring(challenge.type))
		return false, {}
	end
	getRemotes()

	local session = {
		player = player,
		challenge = challenge,
		pack = pack,
		locale = locale,
		connections = {},
		results = {},
		done = false,
		busy = false,
		finished = Instance.new("BindableEvent"),
	}
	active[player] = session
	session.folder = Instance.new("Folder")
	session.folder.Name = "Challenge_" .. tostring(challenge.id) .. "_" .. tostring(player.UserId)
	session.folder.Parent = workspace

	table.insert(session.connections, Players.PlayerRemoving:Connect(function(who)
		if who == player then
			session.done = true
			session.success = false
			session.finished:Fire()
		end
	end))

	local ctx = buildContext(session)
	local okReq, handlerModule = pcall(function()
		return require(script:WaitForChild(moduleName))
	end)
	local started = okReq and pcall(function()
		session.handler = handlerModule.start(ctx)
	end)
	if not started or not session.handler then
		warn("[Challenges] failed to start " .. tostring(challenge.id))
		cleanup(session)
		session.finished:Destroy()
		return false, {}
	end

	if challenge.goalKey then
		ctx.say(challenge.goalKey)
	elseif challenge.goal_en or challenge.title_en then
		ctx.notify(challenge.goal_en or challenge.title_en, "goal")
	end
	if not session.done then
		session.finished.Event:Wait()
	end
	local success, results = session.success, session.results
	cleanup(session)
	session.finished:Destroy()
	ledgers[player] = player.Parent == Players and ledgers[player] or nil
	return success, results
end

-- Abort a running challenge (e.g. player walked away).
function Challenges.cancel(player)
	local s = active[player]
	if s and not s.done then
		s.done = true
		s.success = false
		s.finished:Fire()
	end
end

function Challenges.isActive(player)
	return active[player] ~= nil
end

return Challenges
