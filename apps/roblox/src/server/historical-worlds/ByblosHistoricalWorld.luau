--!strict
-- ByblosHistoricalWorld.luau
-- Builds the complete Ancient Byblos (P0 Benchmark) historical environment at safe coordinates (800, 10, 1600).
-- Integrates Temple of the Obelisks, Earlier L-Shaped Temple, Ahiram Sarcophagus, Bronze Age Harbour, and Scribe Ilu-milku.

local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ReplicatedStorageShared = ReplicatedStorage:WaitForChild("Shared")
local HistoricalMonumentBuilder = require(script.Parent.HistoricalMonumentBuilder)

local ByblosHistoricalWorld = {}

local function createPortal(parent: Instance, name: string, position: Vector3, destinationName: string, accentColor: Color3, callback: (Player) -> ()): Model
	local model = Instance.new("Model")
	model.Name = name
	model.Parent = parent

	-- Portal Frame
	local leftPillar = Instance.new("Part")
	leftPillar.Name = "LeftPillar"
	leftPillar.Size = Vector3.new(2, 12, 2)
	leftPillar.Position = position + Vector3.new(-4, 6, 0)
	leftPillar.Color = Color3.fromRGB(45, 50, 65)
	leftPillar.Material = Enum.Material.SmoothPlastic
	leftPillar.Anchored = true
	leftPillar.CanCollide = true
	leftPillar.Parent = model

	local rightPillar = Instance.new("Part")
	rightPillar.Name = "RightPillar"
	rightPillar.Size = Vector3.new(2, 12, 2)
	rightPillar.Position = position + Vector3.new(4, 6, 0)
	rightPillar.Color = Color3.fromRGB(45, 50, 65)
	rightPillar.Material = Enum.Material.SmoothPlastic
	rightPillar.Anchored = true
	rightPillar.CanCollide = true
	rightPillar.Parent = model

	local lintel = Instance.new("Part")
	lintel.Name = "Lintel"
	lintel.Size = Vector3.new(10, 2, 2)
	lintel.Position = position + Vector3.new(0, 12, 0)
	lintel.Color = accentColor
	lintel.Material = Enum.Material.Neon
	lintel.Anchored = true
	lintel.CanCollide = true
	lintel.Parent = model

	-- Portal Energy Gate
	local gate = Instance.new("Part")
	gate.Name = "GateEnergy"
	gate.Size = Vector3.new(6, 10, 0.4)
	gate.Position = position + Vector3.new(0, 6, 0)
	gate.Color = accentColor
	gate.Material = Enum.Material.Neon
	gate.Transparency = 0.4
	gate.Anchored = true
	gate.CanCollide = false
	gate.Parent = model

	-- Proximity Prompt
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = destinationName
	prompt.ActionText = "Travel"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = gate

	prompt.Triggered:Connect(function(player: Player)
		callback(player)
	end)

	-- Overhead Label
	local bb = Instance.new("BillboardGui")
	bb.Name = "PortalLabel"
	bb.Adornee = gate
	bb.Size = UDim2.fromOffset(200, 50)
	bb.StudsOffset = Vector3.new(0, 7.5, 0)
	bb.AlwaysOnTop = true
	bb.MaxDistance = 50

	local frame = Instance.new("Frame")
	frame.Size = UDim2.fromScale(1, 1)
	frame.BackgroundColor3 = Color3.fromRGB(20, 24, 36)
	frame.BackgroundTransparency = 0.2
	frame.BorderSizePixel = 0
	frame.Parent = bb

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 6)
	corner.Parent = frame

	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.Text = destinationName
	label.TextColor3 = Color3.fromRGB(255, 255, 255)
	label.TextScaled = true
	label.Font = Enum.Font.GothamBold
	label.Parent = frame

	bb.Parent = gate
	return model
end

function ByblosHistoricalWorld.build(parent: Folder, travelCallback: (Player, string, Vector3) -> ()): Model
	local worldModel = Instance.new("Model")
	worldModel.Name = "World_AncientByblos"
	worldModel.Parent = parent

	local origin = Vector3.new(800, 10, 1600)

	-- 1. Sacred Ground Foundation (Flat protected historical precinct)
	local ground = Instance.new("Part")
	ground.Name = "PrecinctGround"
	ground.Size = Vector3.new(220, 2, 240)
	ground.Position = origin - Vector3.new(0, 1, 0)
	ground.Color = Color3.fromRGB(215, 205, 185)
	ground.Material = Enum.Material.Sand
	ground.Anchored = true
	ground.CanCollide = true
	ground.Parent = worldModel

	-- Welcome archway and boundary sign
	local welcomeSign = Instance.new("Part")
	welcomeSign.Name = "ByblosWelcomeArch"
	welcomeSign.Size = Vector3.new(16, 8, 2)
	welcomeSign.Position = origin + Vector3.new(0, 4, 36)
	welcomeSign.Color = Color3.fromRGB(40, 50, 70)
	welcomeSign.Material = Enum.Material.SmoothPlastic
	welcomeSign.Anchored = true
	welcomeSign.CanCollide = false
	welcomeSign.Parent = worldModel

	local bbSign = Instance.new("BillboardGui")
	bbSign.Name = "WelcomeBillboard"
	bbSign.Adornee = welcomeSign
	bbSign.Size = UDim2.fromOffset(260, 75)
	bbSign.StudsOffset = Vector3.new(0, 6, 0)
	bbSign.AlwaysOnTop = true
	bbSign.MaxDistance = 90

	local sFrame = Instance.new("Frame")
	sFrame.Size = UDim2.fromScale(1, 1)
	sFrame.BackgroundColor3 = Color3.fromRGB(15, 20, 32)
	sFrame.BackgroundTransparency = 0.15
	sFrame.Parent = bbSign

	local sCorner = Instance.new("UICorner")
	sCorner.CornerRadius = UDim.new(0, 8)
	sCorner.Parent = sFrame

	local sStroke = Instance.new("UIStroke")
	sStroke.Color = Color3.fromRGB(240, 190, 50)
	sStroke.Thickness = 2
	sStroke.Parent = sFrame

	local sTitle = Instance.new("TextLabel")
	sTitle.Size = UDim2.new(1, -12, 0.55, 0)
	sTitle.Position = UDim2.fromOffset(6, 2)
	sTitle.BackgroundTransparency = 1
	sTitle.Text = "ANCIENT BYBLOS (GEBAL / 𐤂𐤁𐤋)"
	sTitle.TextColor3 = Color3.fromRGB(255, 255, 255)
	sTitle.TextScaled = true
	sTitle.Font = Enum.Font.GothamBold
	sTitle.Parent = sFrame

	local sSub = Instance.new("TextLabel")
	sSub.Size = UDim2.new(1, -12, 0.4, 0)
	sSub.Position = UDim2.new(0, 6, 0.55, 0)
	sSub.BackgroundTransparency = 1
	sSub.Text = "UNESCO Site #295 · Bronze & Iron Age Sacred Port"
	sSub.TextColor3 = Color3.fromRGB(220, 230, 250)
	sSub.TextScaled = true
	sSub.Font = Enum.Font.Gotham
	sSub.Parent = sFrame

	bbSign.Parent = welcomeSign

	-- 2. Construct the 4 Principal Monuments
	-- A. Temple of the Obelisks (Central sacred enclosure with 26 standing baetyls)
	HistoricalMonumentBuilder.buildTempleOfObelisks(worldModel, origin + Vector3.new(0, 0, -45))

	-- B. Earlier L-Shaped Temple (Stratigraphic predecessor layer)
	HistoricalMonumentBuilder.buildLShapedTemple(worldModel, origin + Vector3.new(70, -2, -45))

	-- C. Ahiram Sarcophagus & Epigraphy Pavilion (Royal tomb monument & 22-letter alphabet)
	HistoricalMonumentBuilder.buildAhiramSarcophagus(worldModel, origin + Vector3.new(-65, 0, -10))

	-- D. Ancient Bronze Age Harbour & Quays (Sandstone pier with moored Phoenician *gaulos* ship)
	HistoricalMonumentBuilder.buildAncientHarbor(worldModel, origin + Vector3.new(0, -3, 85))

	-- 3. Historical Guide NPC: Ilu-milku the Byblian Scribe
	local npcModel = Instance.new("Model")
	npcModel.Name = "NPC_IluMilkuScribe"
	npcModel.Parent = worldModel

	local npcTorso = Instance.new("Part")
	npcTorso.Name = "HumanoidRootPart"
	npcTorso.Size = Vector3.new(2, 4.5, 1.5)
	npcTorso.Position = origin + Vector3.new(0, 2.25, 20)
	npcTorso.Color = Color3.fromRGB(240, 230, 210)
	npcTorso.Material = Enum.Material.Fabric
	npcTorso.Anchored = true
	npcTorso.CanCollide = true
	npcTorso.Parent = npcModel

	local npcHead = Instance.new("Part")
	npcHead.Name = "Head"
	npcHead.Size = Vector3.new(1.8, 1.8, 1.8)
	npcHead.Position = origin + Vector3.new(0, 5, 20)
	npcHead.Color = Color3.fromRGB(215, 160, 110)
	npcHead.Material = Enum.Material.SmoothPlastic
	npcHead.Anchored = true
	npcHead.CanCollide = false
	npcHead.Parent = npcModel

	local npcPrompt = Instance.new("ProximityPrompt")
	npcPrompt.ObjectText = "Ilu-milku the Byblian Scribe"
	npcPrompt.ActionText = "Speak with Scribe"
	npcPrompt.HoldDuration = 0.5
	npcPrompt.MaxActivationDistance = 14
	npcPrompt.Parent = npcTorso

	local bbNpc = Instance.new("BillboardGui")
	bbNpc.Name = "NpcBillboard"
	bbNpc.Adornee = npcHead
	bbNpc.Size = UDim2.fromOffset(220, 60)
	bbNpc.StudsOffset = Vector3.new(0, 3.5, 0)
	bbNpc.AlwaysOnTop = true
	bbNpc.MaxDistance = 50

	local nFrame = Instance.new("Frame")
	nFrame.Size = UDim2.fromScale(1, 1)
	nFrame.BackgroundColor3 = Color3.fromRGB(25, 30, 48)
	nFrame.BackgroundTransparency = 0.15
	nFrame.Parent = bbNpc

	local nCorner = Instance.new("UICorner")
	nCorner.CornerRadius = UDim.new(0, 8)
	nCorner.Parent = nFrame

	local nStroke = Instance.new("UIStroke")
	nStroke.Color = Color3.fromRGB(235, 180, 50)
	nStroke.Thickness = 2
	nStroke.Parent = nFrame

	local nName = Instance.new("TextLabel")
	nName.Size = UDim2.new(1, -12, 0.55, 0)
	nName.Position = UDim2.fromOffset(6, 2)
	nName.BackgroundTransparency = 1
	nName.Text = "Ilu-milku the Scribe"
	nName.TextColor3 = Color3.fromRGB(255, 255, 255)
	nName.TextScaled = true
	nName.Font = Enum.Font.GothamBold
	nName.Parent = nFrame

	local nRole = Instance.new("TextLabel")
	nRole.Size = UDim2.new(1, -12, 0.4, 0)
	nRole.Position = UDim2.new(0, 6, 0.55, 0)
	nRole.BackgroundTransparency = 1
	nRole.Text = "Master Epigrapher of Gebal"
	nRole.TextColor3 = Color3.fromRGB(220, 230, 250)
	nRole.TextScaled = true
	nRole.Font = Enum.Font.Gotham
	nRole.Parent = nFrame

	bbNpc.Parent = npcHead

	-- 4. Travel Portals
	-- Portal A: Return to Phoenician Heritage Hub (0, 10.5, 1600)
	createPortal(worldModel, "PortalToPhoenicianHub", origin + Vector3.new(-18, 0, 36), "Phoenician Gateway Hub", Color3.fromRGB(235, 180, 50), function(player: Player)
		travelCallback(player, "phoenician_hub", Vector3.new(0, 10.5, 1600))
	end)

	-- Portal B: Return to Modern Byblos Plaza (800, 10.5, 28)
	createPortal(worldModel, "PortalToModernByblos", origin + Vector3.new(18, 0, 36), "Modern Byblos Plaza", Color3.fromRGB(70, 180, 240), function(player: Player)
		travelCallback(player, "byblos", Vector3.new(800, 10.5, 28))
	end)

	return worldModel
end

return ByblosHistoricalWorld
