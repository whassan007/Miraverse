--!strict
-- TyreHistoricalWorld.luau
-- Builds the complete Ancient Tyre (P0) historical environment at safe coordinates (800, 10, 2400).
-- Integrates Pre-332 BCE Island Citadel, Twin Harbors, Alexander's Causeway Exhibit, Tyrian Purple Workshop, and Shipwright Hiram.

local Workspace = game:GetService("Workspace")
local HistoricalMonumentBuilder = require(script.Parent.HistoricalMonumentBuilder)

local TyreHistoricalWorld = {}

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

function TyreHistoricalWorld.build(parent: Folder, travelCallback: (Player, string, Vector3) -> ()): Model
	local worldModel = Instance.new("Model")
	worldModel.Name = "World_AncientTyre"
	worldModel.Parent = parent

	local origin = Vector3.new(800, 10, 2400)

	-- 1. Build Monuments
	-- A. Pre-332 BCE Island Citadel & Sea Walls
	HistoricalMonumentBuilder.buildTyreIslandCitadel(worldModel, origin + Vector3.new(0, 0, 0))

	-- B. Tyre Twin Harbors (Sidonian & Egyptian)
	HistoricalMonumentBuilder.buildTyreTwinHarbors(worldModel, origin + Vector3.new(-60, 0, 0))

	-- C. Alexander's Causeway & Tombolo Geology Exhibit
	HistoricalMonumentBuilder.buildAlexanderCausewayExhibit(worldModel, origin + Vector3.new(70, 0, 0))

	-- D. Tyrian Royal Purple Dye Installation
	HistoricalMonumentBuilder.buildTyrianPurpleWorkshop(worldModel, origin + Vector3.new(0, 0, -45))

	-- 2. Guide NPC: Hiram the Master Shipwright
	local npcModel = Instance.new("Model")
	npcModel.Name = "NPC_HiramShipwright"
	npcModel.Parent = worldModel

	local npcTorso = Instance.new("Part")
	npcTorso.Name = "HumanoidRootPart"
	npcTorso.Size = Vector3.new(2, 4.5, 1.5)
	npcTorso.Position = origin + Vector3.new(0, 6, 20)
	npcTorso.Color = Color3.fromRGB(160, 60, 180)
	npcTorso.Material = Enum.Material.Fabric
	npcTorso.Anchored = true
	npcTorso.CanCollide = true
	npcTorso.Parent = npcModel

	local npcHead = Instance.new("Part")
	npcHead.Name = "Head"
	npcHead.Size = Vector3.new(1.8, 1.8, 1.8)
	npcHead.Position = origin + Vector3.new(0, 8.75, 20)
	npcHead.Color = Color3.fromRGB(220, 170, 120)
	npcHead.Material = Enum.Material.SmoothPlastic
	npcHead.Anchored = true
	npcHead.CanCollide = false
	npcHead.Parent = npcModel

	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Hiram the Master Shipwright"
	prompt.ActionText = "Speak with Shipwright"
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
	nFrame.BackgroundColor3 = Color3.fromRGB(25, 30, 48)
	nFrame.BackgroundTransparency = 0.15
	nFrame.Parent = bbNpc

	local nCorner = Instance.new("UICorner")
	nCorner.CornerRadius = UDim.new(0, 8)
	nCorner.Parent = nFrame

	local nStroke = Instance.new("UIStroke")
	nStroke.Color = Color3.fromRGB(180, 80, 200)
	nStroke.Thickness = 2
	nStroke.Parent = nFrame

	local nName = Instance.new("TextLabel")
	nName.Size = UDim2.new(1, -12, 0.55, 0)
	nName.Position = UDim2.fromOffset(6, 2)
	nName.BackgroundTransparency = 1
	nName.Text = "Hiram the Shipwright"
	nName.TextColor3 = Color3.fromRGB(255, 255, 255)
	nName.TextScaled = true
	nName.Font = Enum.Font.GothamBold
	nName.Parent = nFrame

	local nRole = Instance.new("TextLabel")
	nRole.Size = UDim2.new(1, -12, 0.4, 0)
	nRole.Position = UDim2.new(0, 6, 0.55, 0)
	nRole.BackgroundTransparency = 1
	nRole.Text = "Chief Naval Architect of Tyre"
	nRole.TextColor3 = Color3.fromRGB(230, 210, 250)
	nRole.TextScaled = true
	nRole.Font = Enum.Font.Gotham
	nRole.Parent = nFrame

	bbNpc.Parent = npcHead

	-- 3. Portals
	-- Portal to Phoenician Heritage Gateway Hub (0, 10.5, 1600)
	createPortal(worldModel, "PortalToHub", origin + Vector3.new(-20, 4.5, 45), "Phoenician Gateway Hub", Color3.fromRGB(235, 180, 50), function(player: Player)
		travelCallback(player, "phoenician_hub", Vector3.new(0, 10.5, 1600))
	end)

	-- Portal to Ancient Byblos (800, 10.5, 1628)
	createPortal(worldModel, "PortalToByblos", origin + Vector3.new(20, 4.5, 45), "Ancient Byblos", Color3.fromRGB(240, 190, 50), function(player: Player)
		travelCallback(player, "hist_byblos", Vector3.new(800, 10.5, 1628))
	end)

	return worldModel
end

return TyreHistoricalWorld
