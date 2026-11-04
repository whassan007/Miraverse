--!strict
-- MotyaHistoricalWorld.luau
-- Builds the complete Ancient Motya (P2) historical environment at safe coordinates (800, 10, 4800).
-- Integrates Submerged Causeway to Birgi, Kothon Basin, Punic War Galley (Marsala Joinery), and Captain Adherbal.

local Workspace = game:GetService("Workspace")
local HistoricalMonumentBuilder = require(script.Parent.HistoricalMonumentBuilder)

local MotyaHistoricalWorld = {}

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

	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = destinationName
	prompt.ActionText = "Travel"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = gate

	prompt.Triggered:Connect(function(player: Player)
		callback(player)
	end)

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

function MotyaHistoricalWorld.build(parent: Folder, travelCallback: (Player, string, Vector3) -> ()): Model
	local worldModel = Instance.new("Model")
	worldModel.Name = "World_AncientMotya"
	worldModel.Parent = parent

	local origin = Vector3.new(800, 10, 4800)

	-- Ground Lagoon Island Platform
	local island = Instance.new("Part")
	island.Name = "MotyaIslandGround"
	island.Size = Vector3.new(180, 2, 180)
	island.Position = origin - Vector3.new(0, 1, 0)
	island.Color = Color3.fromRGB(205, 200, 180)
	island.Material = Enum.Material.Limestone
	island.Anchored = true
	island.CanCollide = true
	island.Parent = worldModel

	-- 1. Build Monuments
	-- A. Motya Submerged Causeway to Birgi (Mainland Sicily)
	HistoricalMonumentBuilder.buildMotyaCauseway(worldModel, origin + Vector3.new(0, 0, 75))

	-- B. Motya Kothon Basin
	HistoricalMonumentBuilder.buildMotyaCothon(worldModel, origin + Vector3.new(-55, 0, -25))

	-- C. Punic War Galley (Marsala Shipwreck Joinery Exhibit)
	HistoricalMonumentBuilder.buildPunicWarship(worldModel, origin + Vector3.new(45, 1, -25))

	-- 2. Guide NPC: Adherbal the Island Captain
	local npcModel = Instance.new("Model")
	npcModel.Name = "NPC_AdherbalCaptain"
	npcModel.Parent = worldModel

	local npcTorso = Instance.new("Part")
	npcTorso.Name = "HumanoidRootPart"
	npcTorso.Size = Vector3.new(2, 4.5, 1.5)
	npcTorso.Position = origin + Vector3.new(0, 2.25, 20)
	npcTorso.Color = Color3.fromRGB(50, 190, 140)
	npcTorso.Material = Enum.Material.Fabric
	npcTorso.Anchored = true
	npcTorso.CanCollide = true
	npcTorso.Parent = npcModel

	local npcHead = Instance.new("Part")
	npcHead.Name = "Head"
	npcHead.Size = Vector3.new(1.8, 1.8, 1.8)
	npcHead.Position = origin + Vector3.new(0, 5, 20)
	npcHead.Color = Color3.fromRGB(215, 160, 115)
	npcHead.Material = Enum.Material.SmoothPlastic
	npcHead.Anchored = true
	npcHead.CanCollide = false
	npcHead.Parent = npcModel

	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Captain Adherbal"
	prompt.ActionText = "Speak with Captain"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = npcTorso

	local bbNpc = Instance.new("BillboardGui")
	bbNpc.Name = "NpcBillboard"
	bbNpc.Adornee = npcHead
	bbNpc.Size = UDim2.fromOffset(220, 60)
	bbNpc.StudsOffset = Vector3.new(0, 3.5, 0)
	bbNpc.AlwaysOnTop = true
	bbNpc.MaxDistance = 50

	local nFrame = Instance.new("Frame")
	nFrame.Size = UDim2.fromScale(1, 1)
	nFrame.BackgroundColor3 = Color3.fromRGB(20, 35, 35)
	nFrame.BackgroundTransparency = 0.15
	nFrame.Parent = bbNpc

	local nCorner = Instance.new("UICorner")
	nCorner.CornerRadius = UDim.new(0, 8)
	nCorner.Parent = nFrame

	local nStroke = Instance.new("UIStroke")
	nStroke.Color = Color3.fromRGB(60, 210, 150)
	nStroke.Thickness = 2
	nStroke.Parent = nFrame

	local nName = Instance.new("TextLabel")
	nName.Size = UDim2.new(1, -12, 0.55, 0)
	nName.Position = UDim2.fromOffset(6, 2)
	nName.BackgroundTransparency = 1
	nName.Text = "Captain Adherbal"
	nName.TextColor3 = Color3.fromRGB(255, 255, 255)
	nName.TextScaled = true
	nName.Font = Enum.Font.GothamBold
	nName.Parent = nFrame

	local nRole = Instance.new("TextLabel")
	nRole.Size = UDim2.new(1, -12, 0.4, 0)
	nRole.Position = UDim2.new(0, 6, 0.55, 0)
	nRole.BackgroundTransparency = 1
	nRole.Text = "Defender of the Stagnone Lagoon"
	nRole.TextColor3 = Color3.fromRGB(200, 255, 230)
	nRole.TextScaled = true
	nRole.Font = Enum.Font.Gotham
	nRole.Parent = nFrame

	bbNpc.Parent = npcHead

	-- 3. Return Portal to Phoenician Heritage Gateway Hub (0, 10.5, 1600)
	createPortal(worldModel, "PortalToHub", origin + Vector3.new(0, 0, 42), "Phoenician Gateway Hub", Color3.fromRGB(235, 180, 50), function(player: Player)
		travelCallback(player, "phoenician_hub", Vector3.new(0, 10.5, 1600))
	end)

	return worldModel
end

return MotyaHistoricalWorld
