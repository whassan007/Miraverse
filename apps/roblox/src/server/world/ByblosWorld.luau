--!strict
-- Byblos benchmark scene, built around the existing Lebanon plaza.
-- Landmarks come from art/v06/roblox-worlds/LB/byblos-world-spec.json.
-- Palette and prop names follow art/source/countries/LB/kit-LB.json.
-- Stylized and original: this is not a survey of the real town.
local Workspace = game:GetService("Workspace")

local ByblosWorld = {}

local LIMESTONE = Color3.fromRGB(226, 208, 170)
local LIMESTONE_DARK = Color3.fromRGB(190, 170, 132)
local PAVING = Color3.fromRGB(205, 190, 160)
local TERRACOTTA = Color3.fromRGB(190, 92, 52)
local CEDAR = Color3.fromRGB(104, 66, 38)
local TEAL = Color3.fromHex("1E7A68")
local ORANGE = Color3.fromHex("D97B38")
local LEAF = Color3.fromRGB(62, 112, 62)
local OLIVE_LEAF = Color3.fromRGB(120, 140, 92)
local BOUGAINVILLEA = Color3.fromRGB(196, 44, 120)

type PartOptions = {
	material: Enum.Material?,
	shape: Enum.PartType?,
	collide: boolean?,
	class: string?,
}

local function part(parent: Instance, name: string, size: Vector3, cframe: CFrame, color: Color3, options: PartOptions?): BasePart
	local opts: PartOptions = options or {}
	local p = Instance.new(opts.class or "Part") :: any
	p.Name = name
	p.Anchored = true
	p.Size = size
	p.CFrame = cframe
	p.Color = color
	p.Material = opts.material or Enum.Material.SmoothPlastic
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	p.CanCollide = if opts.collide == nil then true else opts.collide
	if opts.shape then
		p.Shape = opts.shape
	end
	p.Parent = parent
	return p
end

local function model(parent: Instance, name: string): Model
	local m = Instance.new("Model")
	m.Name = name
	m.Parent = parent
	return m
end

local function sign(parent: Instance, adornee: BasePart, text: string, offset: number)
	local board = Instance.new("BillboardGui")
	board.Name = "PlaceSign"
	board.Adornee = adornee
	board.Size = UDim2.fromOffset(240, 44)
	board.StudsOffset = Vector3.new(0, offset, 0)
	board.MaxDistance = 70
	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundColor3 = Color3.fromRGB(30, 60, 56)
	label.BackgroundTransparency = 0.15
	label.TextColor3 = Color3.new(1, 1, 1)
	label.Font = Enum.Font.GothamBold
	label.TextScaled = true
	label.Text = text
	label.Parent = board
	local corner = Instance.new("UICorner")
	corner.Parent = label
	board.Parent = parent
end

-- Flat roof with a shallow terracotta pitch, facing along local Z.
local function roof(parent: Instance, base: CFrame, width: number, depth: number)
	local rise = 3
	local half = depth / 2
	part(parent, "RoofFront", Vector3.new(width + 1, rise, half + 0.5), base * CFrame.new(0, rise / 2, half / 2), TERRACOTTA, { class = "WedgePart", material = Enum.Material.Slate })
	part(parent, "RoofBack", Vector3.new(width + 1, rise, half + 0.5), base * CFrame.new(0, rise / 2, -half / 2) * CFrame.Angles(0, math.pi, 0), TERRACOTTA, { class = "WedgePart", material = Enum.Material.Slate })
end

-- Stone house whose door faces local -Z.
local function house(parent: Instance, name: string, base: CFrame, width: number, depth: number, height: number, shutter: Color3)
	local m = model(parent, name)
	part(m, "Walls", Vector3.new(width, height, depth), base * CFrame.new(0, height / 2, 0), LIMESTONE, { material = Enum.Material.Limestone })
	part(m, "Cornice", Vector3.new(width + 1, 0.6, depth + 1), base * CFrame.new(0, height + 0.3, 0), LIMESTONE_DARK, { material = Enum.Material.Limestone })
	roof(m, base * CFrame.new(0, height + 0.6, 0), width, depth)
	part(m, "Door", Vector3.new(4, 7, 0.4), base * CFrame.new(0, 3.5, -depth / 2 - 0.1), CEDAR, { material = Enum.Material.WoodPlanks })
	part(m, "DoorArch", Vector3.new(5, 1, 0.8), base * CFrame.new(0, 7.5, -depth / 2 - 0.2), LIMESTONE_DARK, { material = Enum.Material.Limestone })
	local windows = math.max(1, math.floor(width / 8))
	for i = 1, windows do
		local x = (i - (windows + 1) / 2) * (width / windows)
		local y = height - 4
		part(m, "Window", Vector3.new(2.4, 3.4, 0.3), base * CFrame.new(x, y, -depth / 2 - 0.1), Color3.fromRGB(44, 56, 66))
		part(m, "ShutterL", Vector3.new(1.1, 3.6, 0.3), base * CFrame.new(x - 1.8, y, -depth / 2 - 0.15), shutter, { material = Enum.Material.Wood })
		part(m, "ShutterR", Vector3.new(1.1, 3.6, 0.3), base * CFrame.new(x + 1.8, y, -depth / 2 - 0.15), shutter, { material = Enum.Material.Wood })
	end
	return m
end

-- lb_byblos_limestone_arch
local function arch(parent: Instance, name: string, base: CFrame, span: number, height: number)
	local m = model(parent, name)
	part(m, "PillarL", Vector3.new(2.5, height, 2.5), base * CFrame.new(-span / 2, height / 2, 0), LIMESTONE, { material = Enum.Material.Limestone })
	part(m, "PillarR", Vector3.new(2.5, height, 2.5), base * CFrame.new(span / 2, height / 2, 0), LIMESTONE, { material = Enum.Material.Limestone })
	part(m, "Lintel", Vector3.new(span + 3, 2, 3), base * CFrame.new(0, height + 1, 0), LIMESTONE_DARK, { material = Enum.Material.Limestone })
	part(m, "KeystoneL", Vector3.new(2, 1.6, 2.5), base * CFrame.new(-span / 2 + 2.1, height - 0.8, 0), LIMESTONE_DARK, { material = Enum.Material.Limestone })
	part(m, "KeystoneR", Vector3.new(2, 1.6, 2.5), base * CFrame.new(span / 2 - 2.1, height - 0.8, 0), LIMESTONE_DARK, { material = Enum.Material.Limestone })
	return m
end

local function tree(parent: Instance, position: Vector3, height: number, spread: number, foliage: Color3, layers: number)
	local m = model(parent, "Tree")
	part(m, "Trunk", Vector3.new(height, 1.4, 1.4), CFrame.new(position + Vector3.new(0, height / 2, 0)) * CFrame.Angles(0, 0, math.pi / 2), CEDAR, { shape = Enum.PartType.Cylinder, material = Enum.Material.Wood })
	for i = 1, layers do
		local y = height - 1 + (i - 1) * 2.2
		local s = spread * (1 - (i - 1) * 0.22)
		part(m, "Foliage", Vector3.new(s, 3.2, s), CFrame.new(position + Vector3.new(0, y, 0)), foliage, { shape = Enum.PartType.Ball, material = Enum.Material.Grass, collide = false })
	end
end

-- lb_cedar_market_awning: a souk stall that opens toward local -Z.
local function stall(parent: Instance, base: CFrame, awning: Color3, goods: { Color3 })
	local m = model(parent, "SoukStall")
	part(m, "Back", Vector3.new(10, 8, 1), base * CFrame.new(0, 4, 3.5), LIMESTONE, { material = Enum.Material.Limestone })
	part(m, "Counter", Vector3.new(9, 2.6, 2.4), base * CFrame.new(0, 1.3, 0), CEDAR, { material = Enum.Material.WoodPlanks })
	part(m, "PostL", Vector3.new(0.5, 8, 0.5), base * CFrame.new(-4.8, 4, -3), CEDAR, { material = Enum.Material.Wood })
	part(m, "PostR", Vector3.new(0.5, 8, 0.5), base * CFrame.new(4.8, 4, -3), CEDAR, { material = Enum.Material.Wood })
	part(m, "Awning", Vector3.new(10.6, 0.3, 7.6), base * CFrame.new(0, 8.3, 0.2) * CFrame.Angles(math.rad(-10), 0, 0), awning, { material = Enum.Material.Fabric })
	for i, color in goods do
		local x = (i - (#goods + 1) / 2) * 2.2
		part(m, "SpiceBowl", Vector3.new(1.9, 1.1, 1.9), base * CFrame.new(x, 3.1, 0), color, { shape = Enum.PartType.Ball, material = Enum.Material.Sand })
	end
end

-- lb_mediterranean_fishing_boat, bow toward local -Z.
local function boat(parent: Instance, base: CFrame, hull: Color3, sailUp: boolean)
	local m = model(parent, "FishingBoat")
	part(m, "Hull", Vector3.new(6, 2.2, 13), base * CFrame.new(0, 0, 1), hull, { material = Enum.Material.WoodPlanks })
	part(m, "Bow", Vector3.new(6, 2.2, 5), base * CFrame.new(0, 0, -7.5) * CFrame.Angles(0, 0, 0), hull, { class = "WedgePart", material = Enum.Material.WoodPlanks })
	part(m, "Trim", Vector3.new(6.2, 0.4, 13.2), base * CFrame.new(0, 1.2, 1), ORANGE, { material = Enum.Material.Wood })
	part(m, "Bench", Vector3.new(5.4, 0.4, 1.4), base * CFrame.new(0, 1.2, 3), CEDAR, { material = Enum.Material.Wood })
	if sailUp then
		part(m, "Mast", Vector3.new(0.5, 12, 0.5), base * CFrame.new(0, 7, 0), CEDAR, { material = Enum.Material.Wood })
		part(m, "Sail", Vector3.new(0.2, 8, 6), base * CFrame.new(0.4, 8.5, 0), Color3.fromRGB(245, 236, 214), { material = Enum.Material.Fabric, collide = false })
	end
end

local function buildTerrain(c: Vector3)
	local terrain = Workspace.Terrain
	local groundTop = c.Y - 3
	local sea = c.Z - 48
	-- Land behind the harbor.
	terrain:FillBlock(CFrame.new(c.X, groundTop - 10, c.Z + 42), Vector3.new(204, 20, 180), Enum.Material.Ground)
	-- Green hills rising behind the town.
	for i, offset in { -80, -30, 30, 80 } do
		local radius = 34 + (i % 2) * 8
		terrain:FillBall(Vector3.new(c.X + offset, groundTop - 10, c.Z + 118), radius, Enum.Material.Grass)
	end
	-- Sea floor and water north of the quay.
	terrain:FillBlock(CFrame.new(c.X, groundTop - 15, sea - 70), Vector3.new(204, 8, 140), Enum.Material.Sand)
	terrain:FillBlock(CFrame.new(c.X, groundTop - 7.5, sea - 70), Vector3.new(204, 7, 140), Enum.Material.Water)
end

function ByblosWorld.build(parent: Instance, center: Vector3)
	local c = center
	local at = function(x: number, z: number, rotation: number?): CFrame
		return CFrame.new(c.X + x, c.Y, c.Z + z) * CFrame.Angles(0, math.rad(rotation or 0), 0)
	end

	buildTerrain(c)

	-- Town ground sits just below the square, so buildings are never left floating.
	part(parent, "TownGround", Vector3.new(204, 4, 164), CFrame.new(c.X, c.Y - 2.1, c.Z + 34), Color3.fromRGB(176, 158, 118), { material = Enum.Material.Ground })

	-- The square itself: warm paving instead of a colored slab.
	local floor = parent:FindFirstChild("PlazaFloor_LB")
	if floor and floor:IsA("BasePart") then
		floor.Color = PAVING
		floor.Material = Enum.Material.Cobblestone
	end
	local border = parent:FindFirstChild("PlazaBorder_LB")
	if border and border:IsA("BasePart") then
		border.Color = LIMESTONE_DARK
		border.Material = Enum.Material.Limestone
	end

	-- lb_harbor_quay
	local harbor = model(parent, "lb_harbor_quay")
	local quay = part(harbor, "Quay", Vector3.new(120, 3, 16), at(0, -56) * CFrame.new(0, -1.5, 0), LIMESTONE_DARK, { material = Enum.Material.Limestone })
	sign(harbor, quay, "Byblos Harbor", 6)
	for i = -5, 5 do
		part(harbor, "Bollard", Vector3.new(1.2, 2, 1.2), at(i * 11, -63) * CFrame.new(0, 1, 0), CEDAR, { material = Enum.Material.Wood })
	end
	part(harbor, "BreakwaterL", Vector3.new(10, 5, 70), at(-65, -90) * CFrame.new(0, -3, 0), LIMESTONE_DARK, { material = Enum.Material.Rock })
	part(harbor, "BreakwaterEnd", Vector3.new(44, 5, 10), at(-45, -125) * CFrame.new(0, -3, 0), LIMESTONE_DARK, { material = Enum.Material.Rock })
	boat(harbor, at(-28, -78) * CFrame.new(0, -3, 0), TEAL, true)
	boat(harbor, at(-8, -80, 8) * CFrame.new(0, -3, 0), ORANGE, false)
	boat(harbor, at(14, -77, -6) * CFrame.new(0, -3, 0), TEAL, false)
	boat(harbor, at(36, -92, 20) * CFrame.new(0, -3, 0), Color3.fromRGB(240, 232, 214), true)

	-- lb_souk_market: covered stalls along the east side of the square.
	local souk = model(parent, "lb_souk_market")
	local spices = { Color3.fromRGB(140, 30, 40), Color3.fromRGB(85, 107, 47), Color3.fromRGB(214, 160, 50) }
	for i = 0, 5 do
		stall(souk, at(44, -30 + i * 12, 90 + 180), if i % 2 == 0 then TEAL else ORANGE, spices)
	end
	local soukGate = arch(souk, "SoukGate", at(40, -38, 90), 12, 10)
	local lintel = soukGate:FindFirstChild("Lintel")
	if lintel and lintel:IsA("BasePart") then
		sign(souk, lintel, "Old Stone Souk", 4)
	end

	-- lb_teta_courtyard: Teta Nahla's house, west of the square.
	local courtyard = model(parent, "lb_teta_courtyard")
	local teta = house(courtyard, "TetaHouse", at(-42, -6, 90 + 180), 26, 14, 15, TEAL)
	local walls = teta:FindFirstChild("Walls")
	if walls and walls:IsA("BasePart") then
		sign(courtyard, walls, "Teta Nahla's House", 12)
	end
	for _, z in { -18, -14, -10, -2, 2, 6 } do
		part(courtyard, "Bougainvillea", Vector3.new(3, 8, 5), at(-34.2, z) * CFrame.new(0, 7, 0), BOUGAINVILLEA, { shape = Enum.PartType.Ball, material = Enum.Material.Grass, collide = false })
	end
	part(courtyard, "Rug", Vector3.new(8, 0.15, 12), at(-27, -6) * CFrame.new(0, 0.08, 0), Color3.fromRGB(150, 50, 40), { material = Enum.Material.Fabric, collide = false })

	-- lb_saj_bakery: domed griddle kitchen beside the courtyard.
	local bakery = model(parent, "lb_saj_bakery")
	local base = part(bakery, "OvenBase", Vector3.new(7, 3, 7), at(-30, -28) * CFrame.new(0, 1.5, 0), LIMESTONE_DARK, { material = Enum.Material.Brick })
	part(bakery, "lb_domed_saj_griddle", Vector3.new(6.4, 3, 6.4), at(-30, -28) * CFrame.new(0, 3.2, 0), Color3.fromRGB(58, 56, 54), { shape = Enum.PartType.Ball, material = Enum.Material.Metal })
	part(bakery, "PrepTable", Vector3.new(8, 2.8, 3), at(-21, -30) * CFrame.new(0, 1.4, 0), CEDAR, { material = Enum.Material.WoodPlanks })
	sign(bakery, base, "Saj Kitchen", 7)

	-- lb_restoration_plot: the unfinished arch beside the build origin.
	local plot = model(parent, "lb_restoration_plot")
	local plotBase = part(plot, "PlotStones", Vector3.new(20, 0.5, 10), at(22, -36) * CFrame.new(0, 0.25, 0), LIMESTONE_DARK, { material = Enum.Material.Cobblestone })
	part(plot, "StandingPillar", Vector3.new(2.5, 9, 2.5), at(14, -36) * CFrame.new(0, 4.5, 0), LIMESTONE, { material = Enum.Material.Limestone })
	part(plot, "BrokenPillar", Vector3.new(2.5, 4, 2.5), at(30, -36) * CFrame.new(0, 2, 0), LIMESTONE, { material = Enum.Material.Limestone })
	sign(plot, plotBase, "Stone House to Restore", 7)

	-- Old town behind the square, leaving the return portal clear.
	local town = model(parent, "ByblosOldTown")
	local row = { { -68, 12, 15 }, { -44, 16, 12 }, { -20, 12, 18 }, { 22, 14, 13 }, { 46, 12, 17 }, { 68, 14, 12 } }
	for i, spec in row do
		house(town, "TownHouse", at(spec[1], 62, 180 + 180), spec[2] * 1.5, 14, spec[3], if i % 2 == 0 then ORANGE else TEAL)
	end
	house(town, "UpperHouse", at(-34, 90), 18, 14, 13, TEAL)
	house(town, "UpperHouse", at(32, 92), 20, 14, 15, ORANGE)

	-- Cedar and olive planting.
	local plants = model(parent, "Planting")
	for _, spot in { { -60, 40 }, { 60, 42 }, { -82, 20 }, { 82, 18 }, { -84, 72 }, { 84, 74 } } do
		tree(plants, Vector3.new(c.X + spot[1], c.Y, c.Z + spot[2]), 13, 15, LEAF, 3)
	end
	for _, spot in { { -38, 30 }, { 34, 40 }, { -62, -30 }, { 66, -28 }, { -70, 4 }, { 72, 2 } } do
		tree(plants, Vector3.new(c.X + spot[1], c.Y, c.Z + spot[2]), 7, 9, OLIVE_LEAF, 2)
	end
	for _, spot in { { -74, -12 }, { -60, -6 }, { 62, -8 }, { 76, -14 } } do
		part(plants, "Terrace", Vector3.new(14, 2, 8), at(spot[1], spot[2]) * CFrame.new(0, 1, 0), LIMESTONE_DARK, { material = Enum.Material.Rock })
	end
end

return ByblosWorld
