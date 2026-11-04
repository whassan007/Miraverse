--!strict
-- PhoenicianHeritageHub.luau
-- Builds the historical transit courtyard (Phoenician Heritage Gateway) at (0, 10, 1600).
-- Connects to all 5 historical cities while maintaining the existing country registry and modern lobby return path.

local PhoenicianHeritageHub = {}

local function createPart(parent: Instance, name: string, size: Vector3, position: Vector3, color: Color3, material: Enum.Material, anchored: boolean?, canCollide: boolean?): Part
	local part = Instance.new("Part")
	part.Name = name
	part.Size = size
	part.Position = position
	part.Color = color
	part.Material = material
	part.Anchored = if anchored ~= nil then anchored else true
	part.CanCollide = if canCollide ~= nil then canCollide else true
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth
	part.Parent = parent
	return part
end

local function createPortal(parent: Instance, name: string, position: Vector3, destinationName: string, accentColor: Color3, callback: (Player) -> ()): Model
	local model = Instance.new("Model")
	model.Name = name
	model.Parent = parent

	-- Portal Frame
	createPart(model, "LeftPillar", Vector3.new(2, 12, 2), position + Vector3.new(-4, 6, 0), Color3.fromRGB(45, 50, 65), Enum.Material.SmoothPlastic)
	createPart(model, "RightPillar", Vector3.new(2, 12, 2), position + Vector3.new(4, 6, 0), Color3.fromRGB(45, 50, 65), Enum.Material.SmoothPlastic)
	createPart(model, "Lintel", Vector3.new(10, 2, 2), position + Vector3.new(0, 12, 0), accentColor, Enum.Material.Neon)

	-- Energy Gate
	local gate = createPart(model, "GateEnergy", Vector3.new(6, 10, 0.4), position + Vector3.new(0, 6, 0), accentColor, Enum.Material.Neon, true, false)
	gate.Transparency = 0.35

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
	bb.Size = UDim2.fromOffset(210, 52)
	bb.StudsOffset = Vector3.new(0, 7.5, 0)
	bb.AlwaysOnTop = true
	bb.MaxDistance = 60

	local frame = Instance.new("Frame")
	frame.Size = UDim2.fromScale(1, 1)
	frame.BackgroundColor3 = Color3.fromRGB(18, 22, 34)
	frame.BackgroundTransparency = 0.15
	frame.BorderSizePixel = 0
	frame.Parent = bb

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 6)
	corner.Parent = frame

	local stroke = Instance.new("UIStroke")
	stroke.Color = accentColor
	stroke.Thickness = 2
	stroke.Parent = frame

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

function PhoenicianHeritageHub.build(parent: Folder, travelCallback: (Player, string, Vector3) -> ()): Model
	local hubModel = Instance.new("Model")
	hubModel.Name = "World_PhoenicianHeritageHub"
	hubModel.Parent = parent

	local hubCenter = Vector3.new(0, 10, 1600)

	-- Central Courtyard Platform
	local platform = createPart(hubModel, "HubPlatform", Vector3.new(72, 2, 72), hubCenter - Vector3.new(0, 1, 0), Color3.fromRGB(36, 42, 58), Enum.Material.SmoothPlastic)
	local trim = createPart(hubModel, "HubTrim", Vector3.new(74, 1.2, 74), hubCenter - Vector3.new(0, 1.2, 0), Color3.fromRGB(220, 175, 60), Enum.Material.SmoothPlastic)
	trim.CanCollide = false

	-- Overhead Title Monument
	local centerRotunda = createPart(hubModel, "CenterRotunda", Vector3.new(12, 18, 12), hubCenter + Vector3.new(0, 9, 0), Color3.fromRGB(48, 56, 76), Enum.Material.Limestone)
	local bb = Instance.new("BillboardGui")
	bb.Name = "HubTitle"
	bb.Adornee = centerRotunda
	bb.Size = UDim2.fromOffset(280, 80)
	bb.StudsOffset = Vector3.new(0, 11, 0)
	bb.AlwaysOnTop = true
	bb.MaxDistance = 90

	local frame = Instance.new("Frame")
	frame.Size = UDim2.fromScale(1, 1)
	frame.BackgroundColor3 = Color3.fromRGB(15, 20, 32)
	frame.BackgroundTransparency = 0.15
	frame.Parent = bb

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 8)
	corner.Parent = frame

	local stroke = Instance.new("UIStroke")
	stroke.Color = Color3.fromRGB(235, 185, 55)
	stroke.Thickness = 2
	stroke.Parent = frame

	local tLabel = Instance.new("TextLabel")
	tLabel.Size = UDim2.new(1, -12, 0.55, 0)
	tLabel.Position = UDim2.fromOffset(6, 2)
	tLabel.BackgroundTransparency = 1
	tLabel.Text = "PHOENICIAN HERITAGE GATEWAY"
	tLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
	tLabel.TextScaled = true
	tLabel.Font = Enum.Font.GothamBold
	tLabel.Parent = frame

	local sLabel = Instance.new("TextLabel")
	sLabel.Size = UDim2.new(1, -12, 0.4, 0)
	sLabel.Position = UDim2.new(0, 6, 0.55, 0)
	sLabel.BackgroundTransparency = 1
	sLabel.Text = "Ancient Cities, Harbors & Engineering (c. 2800 – 146 BCE)"
	sLabel.TextColor3 = Color3.fromRGB(220, 230, 250)
	sLabel.TextScaled = true
	sLabel.Font = Enum.Font.Gotham
	sLabel.Parent = frame

	bb.Parent = centerRotunda

	-- Portals to the 5 Historical Cities
	-- 1. Ancient Byblos (P0 Benchmark)
	createPortal(hubModel, "PortalByblos", hubCenter + Vector3.new(-24, 0, -22), "Ancient Byblos (P0)", Color3.fromRGB(240, 190, 50), function(player: Player)
		travelCallback(player, "hist_byblos", Vector3.new(800, 10.5, 1628))
	end)

	-- 2. Ancient Tyre (P0)
	createPortal(hubModel, "PortalTyre", hubCenter + Vector3.new(0, 0, -28), "Ancient Tyre (P0)", Color3.fromRGB(160, 60, 180), function(player: Player)
		travelCallback(player, "hist_tyre", Vector3.new(800, 10.5, 2428))
	end)

	-- 3. Ancient Sidon (P1)
	createPortal(hubModel, "PortalSidon", hubCenter + Vector3.new(24, 0, -22), "Ancient Sidon (P1)", Color3.fromRGB(60, 160, 220), function(player: Player)
		travelCallback(player, "hist_sidon", Vector3.new(800, 10.5, 3228))
	end)

	-- 4. Punic Carthage (P1)
	createPortal(hubModel, "PortalCarthage", hubCenter + Vector3.new(-24, 0, 22), "Punic Carthage (P1)", Color3.fromRGB(220, 70, 70), function(player: Player)
		travelCallback(player, "hist_carthage", Vector3.new(800, 10.5, 4028))
	end)

	-- 5. Ancient Motya (P2)
	createPortal(hubModel, "PortalMotya", hubCenter + Vector3.new(24, 0, 22), "Ancient Motya (P2)", Color3.fromRGB(50, 190, 140), function(player: Player)
		travelCallback(player, "hist_motya", Vector3.new(800, 10.5, 4828))
	end)

	-- 6. Return Portal to Modern Miraverse Central Lobby (0, 10.5, 0)
	createPortal(hubModel, "PortalModernLobby", hubCenter + Vector3.new(0, 0, 28), "Modern Miraverse Lobby", Color3.fromRGB(120, 210, 255), function(player: Player)
		travelCallback(player, "lobby", Vector3.new(0, 10.5, 0))
	end)

	return hubModel
end

return PhoenicianHeritageHub
