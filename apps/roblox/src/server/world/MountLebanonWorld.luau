--!strict
-- Mount Lebanon regional destination: elevated limestone agricultural terraces (al-jall),
-- Cedrus libani highland grove, olive planting, wild za'atar & crimson sumac beds,
-- Afqa / Nahr Ibrahim spring basin plaque, and scenic sea overlook.
-- Grounded in packages/content/packs/LB.json, packages/content/stories/ar-LB.json (Scenes 4 & 9),
-- content/v12/staging/countries/LB/records.json, and packages/contracts/v13/index.ts (geo:LB:cedars).
-- Stylized and original: zero third-party assets, no duplicated Byblos harbor or souk buildings.
local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TerrainPipeline = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("TerrainPipeline"))
local GeoTerrainBuilder = require(script.Parent.GeoTerrainBuilder)

local MountLebanonWorld = {}

local LIMESTONE = Color3.fromHex("E6DEC8")
local LIMESTONE_DARK = Color3.fromRGB(186, 168, 134)
local SLATE_ROCK = Color3.fromRGB(142, 132, 116)
local EARTH_SOIL = Color3.fromRGB(134, 102, 74)
local RED_CLAY = Color3.fromRGB(168, 74, 56)
local PAVING = Color3.fromRGB(205, 190, 160)
local CEDAR_WOOD = Color3.fromHex("7B4B2A")
local CEDAR_LEAF = Color3.fromHex("1E5631")
local CEDAR_LEAF_LIGHT = Color3.fromRGB(46, 108, 62)
local OLIVE_LEAF = Color3.fromRGB(120, 140, 92)
local ZAATAR_HERB = Color3.fromHex("556B2F")
local SUMAC_CRIMSON = Color3.fromHex("8B2635")
local SPRING_WATER = Color3.fromRGB(64, 148, 178)
local TERRACOTTA_ACCENT = Color3.fromHex("C97A40")

type PartOptions = {
	material: Enum.Material?,
	shape: Enum.PartType?,
	collide: boolean?,
	class: string?,
	transparency: number?,
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
	if opts.transparency then
		p.Transparency = opts.transparency
	end
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

local function sign(parent: Instance, adornee: BasePart, text: string, subtitle: string?, offset: number)
	local board = Instance.new("BillboardGui")
	board.Name = "RegionSign"
	board.Adornee = adornee
	board.Size = if subtitle then UDim2.fromOffset(260, 62) else UDim2.fromOffset(240, 44)
	board.StudsOffset = Vector3.new(0, offset, 0)
	board.AlwaysOnTop = true
	board.MaxDistance = 95

	local card = Instance.new("Frame")
	card.Name = "Card"
	card.Size = UDim2.fromScale(1, 1)
	card.BackgroundColor3 = Color3.fromRGB(26, 56, 40)
	card.BackgroundTransparency = 0.12
	card.BorderSizePixel = 0
	card.Parent = board

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 8)
	corner.Parent = card

	local stroke = Instance.new("UIStroke")
	stroke.Color = TERRACOTTA_ACCENT
	stroke.Thickness = 2
	stroke.Parent = card

	local label = Instance.new("TextLabel")
	label.Name = "Title"
	label.Size = if subtitle then UDim2.new(1, -12, 0.56, 0) else UDim2.new(1, -12, 1, 0)
	label.Position = UDim2.fromOffset(6, 2)
	label.BackgroundTransparency = 1
	label.TextColor3 = Color3.new(1, 1, 1)
	label.Font = Enum.Font.GothamBold
	label.TextScaled = true
	label.Text = text
	label.Parent = card

	if subtitle then
		local sub = Instance.new("TextLabel")
		sub.Name = "Subtitle"
		sub.Size = UDim2.new(1, -12, 0.4, 0)
		sub.Position = UDim2.new(0, 6, 0.56, 0)
		sub.BackgroundTransparency = 1
		sub.TextColor3 = Color3.fromRGB(228, 238, 224)
		sub.Font = Enum.Font.Gotham
		sub.TextScaled = true
		sub.Text = subtitle
		sub.Parent = card
	end

	board.Parent = parent
end

-- Iconic Lebanon Cedar (Cedrus libani) with stout trunk and broad horizontal stratified canopy tiers.
local function cedarTree(parent: Instance, position: Vector3, height: number, spread: number)
	local m = model(parent, "CedrusLibani")
	part(
		m,
		"Trunk",
		Vector3.new(height, 2.2, 2.2),
		CFrame.new(position + Vector3.new(0, height / 2, 0)) * CFrame.Angles(0, 0, math.pi / 2),
		CEDAR_WOOD,
		{ shape = Enum.PartType.Cylinder, material = Enum.Material.Wood }
	)
	local tiers = 4
	for i = 1, tiers do
		local y = height * 0.45 + (i - 1) * (height * 0.18)
		local tierSpread = spread * (1 - (i - 1) * 0.2)
		local color = if i % 2 == 1 then CEDAR_LEAF else CEDAR_LEAF_LIGHT
		part(
			m,
			"CanopyTier_" .. i,
			Vector3.new(tierSpread, 2.2, tierSpread * 0.85),
			CFrame.new(position + Vector3.new(0, y, 0)) * CFrame.Angles(0, math.rad((i - 1) * 25), 0),
			color,
			{ material = Enum.Material.Grass, collide = false }
		)
	end
	return m
end

-- Gnarled Mediterranean mountain olive tree.
local function oliveTree(parent: Instance, position: Vector3, height: number, spread: number)
	local m = model(parent, "MountainOliveTree")
	part(
		m,
		"Trunk",
		Vector3.new(height, 1.5, 1.5),
		CFrame.new(position + Vector3.new(0, height / 2, 0)) * CFrame.Angles(0, 0, math.pi / 2),
		CEDAR_WOOD,
		{ shape = Enum.PartType.Cylinder, material = Enum.Material.Wood }
	)
	for i = 1, 2 do
		local y = height - 0.8 + (i - 1) * 2.0
		local s = spread * (1 - (i - 1) * 0.25)
		part(
			m,
			"OliveCrown_" .. i,
			Vector3.new(s, 3.0, s),
			CFrame.new(position + Vector3.new(0, y, 0)),
			OLIVE_LEAF,
			{ shape = Enum.PartType.Ball, material = Enum.Material.Grass, collide = false }
		)
	end
	return m
end

-- Cultivated bed of wild mountain thyme (Origanum syriacum / za'atar) bordered by fieldstones.
local function zaatarBed(parent: Instance, base: CFrame, length: number)
	local m = model(parent, "WildZaatarBed")
	part(m, "StoneEdging", Vector3.new(length + 1.2, 1.2, 5.2), base * CFrame.new(0, 0.6, 0), LIMESTONE_DARK, { material = Enum.Material.Cobblestone })
	part(m, "SoilBed", Vector3.new(length, 1.4, 4.2), base * CFrame.new(0, 0.7, 0), EARTH_SOIL, { material = Enum.Material.Ground })
	local count = math.max(3, math.floor(length / 3))
	for i = 1, count do
		local x = (i - (count + 1) / 2) * (length / count)
		part(
			m,
			"ZaatarShrub_" .. i,
			Vector3.new(2.2, 1.6, 2.2),
			base * CFrame.new(x, 1.8, 0),
			ZAATAR_HERB,
			{ shape = Enum.PartType.Ball, material = Enum.Material.Grass, collide = false }
		)
	end
	return m
end

-- Crimson mountain sumac shrub (Rhus coriaria).
local function sumacBush(parent: Instance, position: Vector3)
	local m = model(parent, "CrimsonSumacBush")
	part(m, "Stem", Vector3.new(2.5, 0.8, 0.8), CFrame.new(position + Vector3.new(0, 1.25, 0)) * CFrame.Angles(0, 0, math.pi / 2), CEDAR_WOOD, { shape = Enum.PartType.Cylinder, material = Enum.Material.Wood })
	part(m, "Foliage", Vector3.new(4.2, 2.8, 4.2), CFrame.new(position + Vector3.new(0, 2.6, 0)), OLIVE_LEAF, { shape = Enum.PartType.Ball, material = Enum.Material.Grass, collide = false })
	for i, offset in { Vector3.new(-1.1, 3.6, 0.6), Vector3.new(1.0, 3.8, -0.5), Vector3.new(0, 4.1, 0.8) } do
		part(m, "SumacCluster_" .. i, Vector3.new(1.2, 1.5, 1.2), CFrame.new(position + offset), SUMAC_CRIMSON, { shape = Enum.PartType.Ball, material = Enum.Material.Sand, collide = false })
	end
	return m
end

-- Walkable stone staircase with low side parapets connecting terrace levels.
local function stoneStairs(parent: Instance, name: string, startBottom: Vector3, steps: number, width: number, totalRise: number, totalRun: number)
	local m = model(parent, name)
	local stepRise = totalRise / steps
	local stepRun = totalRun / steps
	local dir = if totalRun >= 0 then 1 else -1
	local absRun = math.abs(stepRun)
	for i = 1, steps do
		local y = startBottom.Y + (i - 0.5) * stepRise
		local z = startBottom.Z + (i - 0.5) * stepRun
		part(
			m,
			"Step_" .. i,
			Vector3.new(width, stepRise + 0.4, absRun + 0.6),
			CFrame.new(startBottom.X, y, z),
			PAVING,
			{ material = Enum.Material.Cobblestone }
		)
	end
	-- Gentle invisible collision ramp so walking up/down is completely smooth and snag-free.
	local length = math.sqrt(totalRise * totalRise + totalRun * totalRun)
	local mid = Vector3.new(startBottom.X, startBottom.Y + totalRise / 2, startBottom.Z + totalRun / 2)
	local topTarget = Vector3.new(startBottom.X, startBottom.Y + totalRise, startBottom.Z + totalRun)
	part(
		m,
		"WalkRamp",
		Vector3.new(width - 0.4, 0.6, length),
		CFrame.lookAt(mid, topTarget),
		PAVING,
		{ material = Enum.Material.Cobblestone, transparency = 1 }
	)
	-- Low stone curbstones on left and right of stairs.
	for _, side in { -1, 1 } do
		part(
			m,
			if side < 0 then "CurbLeft" else "CurbRight",
			Vector3.new(1.2, 2.2, length),
			CFrame.lookAt(mid + Vector3.new(side * (width / 2 + 0.6), 1.0, 0), topTarget + Vector3.new(side * (width / 2 + 0.6), 1.0, 0)),
			LIMESTONE_DARK,
			{ material = Enum.Material.Limestone }
		)
	end
	return m
end

-- Rustic open-air cedar & limestone herb-drying arbor (ar-LB Scene 5: drying wild za'atar in the shade).
local function cedarArbor(parent: Instance, base: CFrame)
	local m = model(parent, "MountLebanonCedarArbor")
	local width, depth, height = 22, 14, 9.5
	part(m, "StoneFloor", Vector3.new(width + 2, 0.8, depth + 2), base * CFrame.new(0, 0.4, 0), PAVING, { material = Enum.Material.Cobblestone })
	for _, sx in { -width / 2 + 1, width / 2 - 1 } do
		for _, sz in { -depth / 2 + 1, depth / 2 - 1 } do
			part(m, "LimestonePier", Vector3.new(2.2, 3.6, 2.2), base * CFrame.new(sx, 2.2, sz), LIMESTONE, { material = Enum.Material.Limestone })
			part(m, "CedarColumn", Vector3.new(1.2, height - 3.2, 1.2), base * CFrame.new(sx, 3.6 + (height - 3.2) / 2, sz), CEDAR_WOOD, { material = Enum.Material.Wood })
		end
	end
	part(m, "BeamFront", Vector3.new(width + 2, 1.0, 1.2), base * CFrame.new(0, height + 0.5, -depth / 2 + 1), CEDAR_WOOD, { material = Enum.Material.WoodPlanks })
	part(m, "BeamBack", Vector3.new(width + 2, 1.0, 1.2), base * CFrame.new(0, height + 0.5, depth / 2 - 1), CEDAR_WOOD, { material = Enum.Material.WoodPlanks })
	for i = -4, 4 do
		part(m, "Rafter_" .. (i + 5), Vector3.new(0.8, 0.7, depth + 3), base * CFrame.new(i * 2.4, height + 1.2, 0), CEDAR_WOOD, { material = Enum.Material.WoodPlanks })
	end
	-- Drying table with cloth trays of wild thyme and crimson sumac.
	part(m, "DryingTable", Vector3.new(10, 2.6, 4), base * CFrame.new(0, 2.1, 0), CEDAR_WOOD, { material = Enum.Material.WoodPlanks })
	part(m, "LinenDryingCloth", Vector3.new(8.8, 0.2, 3.2), base * CFrame.new(0, 3.5, 0), Color3.fromHex("F5ECD7"), { material = Enum.Material.Fabric })
	part(m, "DryingZaatarSpread", Vector3.new(3.6, 0.35, 2.4), base * CFrame.new(-2.0, 3.65, 0), ZAATAR_HERB, { material = Enum.Material.Grass, collide = false })
	part(m, "CrimsonSumacBowl", Vector3.new(2.2, 1.2, 2.2), base * CFrame.new(2.2, 3.8, 0), SUMAC_CRIMSON, { shape = Enum.PartType.Ball, material = Enum.Material.Sand, collide = false })
	-- Stone bench beside the arbor.
	part(m, "StoneBench", Vector3.new(7, 1.8, 2.4), base * CFrame.new(-6, 1.7, 3.5), LIMESTONE, { material = Enum.Material.Limestone })
	return m
end

local function buildTerrain(c: Vector3, region: Instance?)
	-- Reconstruct real Copernicus GLO-30 DEM topography for Mount Lebanon (Afqa/Jbeil highlands)
	if region then
		TerrainPipeline.buildLocationRelief(region, "mount_lebanon", c, 240, 210, 95)
	end
	local terrain = Workspace.Terrain
	-- Gameplay adaptation layer: step support under Al-Jall Tiers 1, 2, 3
	terrain:FillBlock(CFrame.new(c.X, c.Y - 12, c.Z - 5), Vector3.new(220, 24, 110), Enum.Material.Rock)
	terrain:FillBlock(CFrame.new(c.X, c.Y - 4, c.Z + 35), Vector3.new(210, 24, 80), Enum.Material.Ground)
	terrain:FillBlock(CFrame.new(c.X, c.Y + 4, c.Z + 80), Vector3.new(200, 24, 74), Enum.Material.Grass)
end

export type BuildCallbacks = {
	travelToLocation: ((Player, string) -> ())?,
	returnToLobby: ((Player) -> ())?,
}

function MountLebanonWorld.build(parent: Instance, center: Vector3, callbacks: BuildCallbacks?): Folder
	local existing = parent:FindFirstChild("Region_mount_lebanon")
	if existing then
		existing:Destroy()
	end

	local region = Instance.new("Folder")
	region.Name = "Region_mount_lebanon"
	region:SetAttribute("Country", "LB")
	region:SetAttribute("LocationId", "mount_lebanon")
	region:SetAttribute("LocationType", "region")
	region.Parent = parent

	local c = center -- (800, 38, 260)
	buildTerrain(c, region)

	-- =========================================================================
	-- TIER 1: ARRIVAL TERRACE & COASTAL OVERLOOK (Y = c.Y = 38, Z = c.Z - 50 to c.Z + 42)
	-- =========================================================================
	local tier1 = model(region, "Tier1_ArrivalTerrace")
	part(tier1, "TerraceFloor_T1", Vector3.new(176, 4, 92), CFrame.new(c.X, c.Y - 2, c.Z - 4), EARTH_SOIL, { material = Enum.Material.Ground })
	part(tier1, "RetainingWall_North", Vector3.new(180, 14, 4), CFrame.new(c.X, c.Y - 5, c.Z - 50), LIMESTONE_DARK, { material = Enum.Material.Limestone })

	-- Safe low stone parapet along the northern coastal overlook edge so players cannot accidentally fall off.
	part(tier1, "OverlookParapetLeft", Vector3.new(66, 3.4, 2.4), CFrame.new(c.X - 56, c.Y + 1.7, c.Z - 48), LIMESTONE, { material = Enum.Material.Limestone })
	part(tier1, "OverlookParapetRight", Vector3.new(66, 3.4, 2.4), CFrame.new(c.X + 56, c.Y + 1.7, c.Z - 48), LIMESTONE, { material = Enum.Material.Limestone })
	part(tier1, "WallBoundaryWest_T1", Vector3.new(3, 4.5, 92), CFrame.new(c.X - 88, c.Y + 2.25, c.Z - 4), LIMESTONE_DARK, { material = Enum.Material.Rock })
	part(tier1, "WallBoundaryEast_T1", Vector3.new(3, 4.5, 92), CFrame.new(c.X + 88, c.Y + 2.25, c.Z - 4), LIMESTONE_DARK, { material = Enum.Material.Rock })
	part(tier1, "WallBoundarySouth_T1", Vector3.new(176, 4.5, 3), CFrame.new(c.X, c.Y + 2.25, c.Z + 41), LIMESTONE_DARK, { material = Enum.Material.Limestone })

	-- Scenic Belvedere Overlook at the northern rim (c.Z - 44) looking out over Byblos and the Mediterranean Sea.
	local belvedere = model(tier1, "ByblosSeaOverlook")
	part(belvedere, "BelvedereDeck", Vector3.new(44, 0.6, 16), CFrame.new(c.X, c.Y + 0.3, c.Z - 41), PAVING, { material = Enum.Material.Cobblestone })
	local belvedereRail = part(belvedere, "BelvedereBalustrade", Vector3.new(44, 3.4, 2.2), CFrame.new(c.X, c.Y + 1.7, c.Z - 48.5), LIMESTONE, { material = Enum.Material.Limestone })
	sign(belvedere, belvedereRail, "Coastal Overlook · Byblos & Mediterranean Sea", "Highland Viewpoint (geo:LB:cedars · 34.142°N, 35.715°E)", 5.5)

	-- Central Stone Path from Spawn (Z = +28) north to the Belvedere Overlook (Z = -34) and branching to the terrace stairs.
	part(tier1, "ArrivalStonePath", Vector3.new(14, 0.3, 66), CFrame.new(c.X, c.Y + 0.15, c.Z - 2), PAVING, { material = Enum.Material.Cobblestone })
	part(tier1, "CrossStonePath_T1", Vector3.new(104, 0.3, 10), CFrame.new(c.X, c.Y + 0.15, c.Z - 14), PAVING, { material = Enum.Material.Cobblestone })

	-- Spawn pad at (c.X, c.Y + 0.5, c.Z + 28) -> (800, 38.5, 288), facing -Z (north toward the portals, terraces, and overlook).
	local spawnPart = part(
		region,
		"Spawn_mount_lebanon",
		Vector3.new(8, 1, 8),
		CFrame.new(c.X, c.Y + 0.5, c.Z + 28),
		TERRACOTTA_ACCENT,
		{ material = Enum.Material.Cobblestone }
	)
	spawnPart:SetAttribute("Country", "LB")
	spawnPart:SetAttribute("LocationId", "mount_lebanon")

	-- Directional Milestone Sign directly ahead of arrival camera at (c.X, c.Y, c.Z + 12).
	local wayfinder = model(tier1, "MountainWayfinder")
	local post = part(wayfinder, "DirectionPost", Vector3.new(1.6, 6.5, 1.6), CFrame.new(c.X, c.Y + 3.25, c.Z + 10), LIMESTONE, { material = Enum.Material.Limestone })
	part(wayfinder, "ArrowUpper", Vector3.new(6.5, 1.1, 0.5), CFrame.new(c.X, c.Y + 5.6, c.Z + 10), CEDAR_WOOD, { material = Enum.Material.WoodPlanks })
	sign(wayfinder, post, "Mount Lebanon Terraces (Al-Jall)", "← Byblos Trail  |  ↑ Overlook & Terraces  |  Lobby Portal →", 5.2)

	-- Travel Station Portals positioned in the forward view cone (Z = c.Z + 12 = 272, 16 studs ahead of spawn Z = 288):
	-- 1) West portal: Return to Byblos
	local byblosStation = model(region, "TravelStation_ToByblos")
	part(byblosStation, "Pedestal", Vector3.new(9, 1, 6), CFrame.new(c.X - 20, c.Y + 0.5, c.Z + 12), LIMESTONE, { material = Enum.Material.Limestone })
	part(byblosStation, "ArchPillarL", Vector3.new(1.6, 8.5, 1.6), CFrame.new(c.X - 23.2, c.Y + 4.75, c.Z + 12), LIMESTONE, { material = Enum.Material.Limestone })
	part(byblosStation, "ArchPillarR", Vector3.new(1.6, 8.5, 1.6), CFrame.new(c.X - 16.8, c.Y + 4.75, c.Z + 12), LIMESTONE, { material = Enum.Material.Limestone })
	part(byblosStation, "CedarLintel", Vector3.new(8.8, 1.2, 2.0), CFrame.new(c.X - 20, c.Y + 9.4, c.Z + 12), CEDAR_WOOD, { material = Enum.Material.WoodPlanks })
	local toByblosPortal = part(
		byblosStation,
		"Portal_mount_lebanon_to_byblos",
		Vector3.new(4.8, 7.6, 1.2),
		CFrame.new(c.X - 20, c.Y + 4.8, c.Z + 12),
		CEDAR_LEAF,
		{ material = Enum.Material.Neon }
	)
	toByblosPortal:SetAttribute("Country", "LB")
	toByblosPortal:SetAttribute("DestinationLocationId", "byblos")
	sign(byblosStation, toByblosPortal, "Downhill Trail to Byblos", "Travel to Byblos Harbor & Souk", 5.8)

	local toByblosPrompt = Instance.new("ProximityPrompt")
	toByblosPrompt.Name = "TravelToByblosPrompt"
	toByblosPrompt.ActionText = "Travel to Byblos"
	toByblosPrompt.ObjectText = "Byblos Coastal Town (LB)"
	toByblosPrompt.HoldDuration = 0
	toByblosPrompt.MaxActivationDistance = 14
	toByblosPrompt.RequiresLineOfSight = false
	toByblosPrompt.Parent = toByblosPortal
	if callbacks and callbacks.travelToLocation then
		local fn = callbacks.travelToLocation
		toByblosPrompt.Triggered:Connect(function(player: Player)
			fn(player, "byblos")
		end)
	end

	-- 2) Center portal: Trail to Beirut
	local beirutStation = model(region, "TravelStation_ToBeirut")
	part(beirutStation, "Pedestal", Vector3.new(9, 1, 6), CFrame.new(c.X, c.Y + 0.5, c.Z + 12), LIMESTONE, { material = Enum.Material.Limestone })
	local toBeirutPortal = part(
		beirutStation,
		"Portal_mount_lebanon_to_beirut",
		Vector3.new(4.8, 7.6, 1.2),
		CFrame.new(c.X, c.Y + 4.8, c.Z + 12),
		SPRING_WATER,
		{ material = Enum.Material.Neon }
	)
	toBeirutPortal:SetAttribute("Country", "LB")
	toBeirutPortal:SetAttribute("DestinationLocationId", "beirut")
	sign(beirutStation, toBeirutPortal, "Descent to Beirut", "Travel to Ras Beirut & Corniche", 5.5)

	local toBeirutPrompt = Instance.new("ProximityPrompt")
	toBeirutPrompt.Name = "TravelToBeirutFromMountLebanonPrompt"
	toBeirutPrompt.ActionText = "Travel to Beirut"
	toBeirutPrompt.ObjectText = "Beirut Coastal City (LB)"
	toBeirutPrompt.HoldDuration = 0
	toBeirutPrompt.MaxActivationDistance = 14
	toBeirutPrompt.RequiresLineOfSight = false
	toBeirutPrompt.Parent = toBeirutPortal
	if callbacks and callbacks.travelToLocation then
		local fn = callbacks.travelToLocation
		toBeirutPrompt.Triggered:Connect(function(player: Player)
			fn(player, "beirut")
		end)
	end

	-- 3) East portal: Return to Travel Lobby
	local lobbyStation = model(region, "TravelStation_ToLobby")
	part(lobbyStation, "Pedestal", Vector3.new(9, 1, 6), CFrame.new(c.X + 20, c.Y + 0.5, c.Z + 12), LIMESTONE, { material = Enum.Material.Limestone })
	local toLobbyPortal = part(
		lobbyStation,
		"ReturnLobby_mount_lebanon",
		Vector3.new(5, 8, 1.5),
		CFrame.new(c.X + 20, c.Y + 4.8, c.Z + 12),
		Color3.fromRGB(235, 190, 80),
		{ material = Enum.Material.Neon }
	)
	toLobbyPortal:SetAttribute("Country", "LB")
	toLobbyPortal:SetAttribute("LocationId", "mount_lebanon")
	sign(lobbyStation, toLobbyPortal, "Return to Travel Lobby", "MiraVerse Global Hub", 5.5)

	local toLobbyPrompt = Instance.new("ProximityPrompt")
	toLobbyPrompt.Name = "ReturnPrompt"
	toLobbyPrompt.ActionText = "Return to Travel Lobby"
	toLobbyPrompt.ObjectText = "MiraVerse Lobby"
	toLobbyPrompt.HoldDuration = 0
	toLobbyPrompt.MaxActivationDistance = 14
	toLobbyPrompt.RequiresLineOfSight = false
	toLobbyPrompt.Parent = toLobbyPortal
	if callbacks and callbacks.returnToLobby then
		local fn = callbacks.returnToLobby
		toLobbyPrompt.Triggered:Connect(function(player: Player)
			fn(player)
		end)
	end

	-- Afqa / Nahr Ibrahim Highland Spring Basin on Tier 1 West (c.X - 54, c.Y, c.Z - 14)
	-- Grounded in content/v12/staging/countries/LB/records.json (LB-KB-MYTH-ADONIS-AFQA-RIVER):
	-- explicitly distinguishes iron-rich red limestone clay sediment runoff from ancient seasonal myth.
	local spring = model(tier1, "HighlandSpringAlcove")
	part(spring, "LimestoneCliffBack", Vector3.new(18, 11, 5), CFrame.new(c.X - 58, c.Y + 5.5, c.Z - 22), LIMESTONE_DARK, { material = Enum.Material.Rock })
	part(spring, "RedIronClayStrata", Vector3.new(16, 3.2, 5.4), CFrame.new(c.X - 58, c.Y + 3.0, c.Z - 22), RED_CLAY, { material = Enum.Material.Sandstone })
	local basin = part(spring, "SpringBasinRim", Vector3.new(16, 2.2, 12), CFrame.new(c.X - 58, c.Y + 1.1, c.Z - 14), LIMESTONE, { material = Enum.Material.Limestone })
	part(spring, "SpringWater", Vector3.new(13.6, 1.8, 9.6), CFrame.new(c.X - 58, c.Y + 1.4, c.Z - 14), SPRING_WATER, { material = Enum.Material.Glass, collide = false, transparency = 0.2 })
	sign(
		spring,
		basin,
		"Highland Spring & Red Iron-Clay Strata",
		"Science: Iron-oxide soil runoff  |  Ancient Folklore: Seasonal Nahr Ibrahim myth",
		5.5
	)

	-- =========================================================================
	-- TIER 2: AGRICULTURAL OLIVE & ZA'ATAR TERRACES (AL-JALL) (Y = c.Y + 8 = 46, Z = c.Z - 2 to c.Z + 74)
	-- =========================================================================
	local tier2 = model(region, "Tier2_AlJallTerraces")
	-- Dry-stone retaining wall separating Tier 1 and Tier 2 at Z = c.Z - 2, leaving openings for West/East stairs.
	part(tier2, "RetainingWall_T2_Center", Vector3.new(72, 8.4, 3), CFrame.new(c.X, c.Y + 4.2, c.Z - 2), LIMESTONE_DARK, { material = Enum.Material.Limestone })
	part(tier2, "RetainingWall_T2_West", Vector3.new(26, 8.4, 3), CFrame.new(c.X - 67, c.Y + 4.2, c.Z - 2), LIMESTONE_DARK, { material = Enum.Material.Limestone })
	part(tier2, "RetainingWall_T2_East", Vector3.new(26, 8.4, 3), CFrame.new(c.X + 67, c.Y + 4.2, c.Z - 2), LIMESTONE_DARK, { material = Enum.Material.Limestone })

	-- Tier 2 walkable ground platform (Z: c.Z - 2 to c.Z + 74 -> depth 76, centered at c.Z + 36).
	-- Note: To keep Tier 1 Spawn (Z = +28) open and unobstructed, Tier 2 is split into West and East terrace wings around the central arrival courtyard, connected across Z = c.Z + 42..74!
	part(tier2, "TerraceFloor_T2_WestWing", Vector3.new(52, 8, 44), CFrame.new(c.X - 56, c.Y + 4, c.Z + 20), EARTH_SOIL, { material = Enum.Material.Ground })
	part(tier2, "TerraceFloor_T2_EastWing", Vector3.new(52, 8, 44), CFrame.new(c.X + 56, c.Y + 4, c.Z + 20), EARTH_SOIL, { material = Enum.Material.Ground })
	part(tier2, "TerraceFloor_T2_MainSpan", Vector3.new(164, 8, 34), CFrame.new(c.X, c.Y + 4, c.Z + 58), EARTH_SOIL, { material = Enum.Material.Ground })

	-- Low safety walls bordering the inner courtyard cutout so players on Tier 2 cannot drop unexpectedly into the Tier 1 arrival courtyard.
	part(tier2, "CourtyardGuardWest", Vector3.new(2.2, 3.2, 42), CFrame.new(c.X - 30.5, c.Y + 9.6, c.Z + 20), LIMESTONE, { material = Enum.Material.Limestone })
	part(tier2, "CourtyardGuardEast", Vector3.new(2.2, 3.2, 42), CFrame.new(c.X + 30.5, c.Y + 9.6, c.Z + 20), LIMESTONE, { material = Enum.Material.Limestone })
	part(tier2, "CourtyardGuardSouth", Vector3.new(62, 3.2, 2.2), CFrame.new(c.X, c.Y + 9.6, c.Z + 41.5), LIMESTONE, { material = Enum.Material.Limestone })
	part(tier2, "WallBoundaryWest_T2", Vector3.new(3, 4.5, 76), CFrame.new(c.X - 82, c.Y + 10.25, c.Z + 36), LIMESTONE_DARK, { material = Enum.Material.Rock })
	part(tier2, "WallBoundaryEast_T2", Vector3.new(3, 4.5, 76), CFrame.new(c.X + 82, c.Y + 10.25, c.Z + 36), LIMESTONE_DARK, { material = Enum.Material.Rock })

	-- Twin 10-stud wide stone staircases rising from Tier 1 (Z = -12, Y = 38) to Tier 2 (Z = +4, Y = 46) at X = -44 and X = +44.
	stoneStairs(tier2, "Stairs_T1_to_T2_West", Vector3.new(c.X - 44, c.Y, c.Z - 14), 8, 10, 8, 16)
	stoneStairs(tier2, "Stairs_T1_to_T2_East", Vector3.new(c.X + 44, c.Y, c.Z - 14), 8, 10, 8, 16)

	-- Walkable stone path across Tier 2 linking both stairs and leading to the Tier 3 staircases.
	part(tier2, "Path_T2_West", Vector3.new(10, 0.3, 52), CFrame.new(c.X - 44, c.Y + 8.15, c.Z + 28), PAVING, { material = Enum.Material.Cobblestone })
	part(tier2, "Path_T2_East", Vector3.new(10, 0.3, 52), CFrame.new(c.X + 44, c.Y + 8.15, c.Z + 28), PAVING, { material = Enum.Material.Cobblestone })
	part(tier2, "Path_T2_Cross", Vector3.new(108, 0.3, 10), CFrame.new(c.X, c.Y + 8.15, c.Z + 52), PAVING, { material = Enum.Material.Cobblestone })

	-- Cultivated Wild Za'atar Beds & Olive Trees on Tier 2 (ar-LB Scene 4: "الزعتر بالجلّ").
	local jall = model(tier2, "AlJallCultivation")
	local zBed1 = zaatarBed(jall, CFrame.new(c.X - 64, c.Y + 8, c.Z + 14), 16)
	local zBed2 = zaatarBed(jall, CFrame.new(c.X - 64, c.Y + 8, c.Z + 26), 16)
	local zBed3 = zaatarBed(jall, CFrame.new(c.X + 64, c.Y + 8, c.Z + 14), 16)
	local zBed4 = zaatarBed(jall, CFrame.new(c.X + 64, c.Y + 8, c.Z + 26), 16)
	local edg1 = zBed1:FindFirstChild("StoneEdging")
	if edg1 and edg1:IsA("BasePart") then
		sign(jall, edg1, "Al-Jall Wild Za'atar Terrace (الجلّ)", "Sheltered mountain thyme (Origanum syriacum) & sumac", 4.5)
	end
	local edg3 = zBed3:FindFirstChild("StoneEdging")
	if edg3 and edg3:IsA("BasePart") then
		sign(jall, edg3, "Olive & Sumac Terrace", "Mountain olive oil & crimson sumac harvest", 4.5)
	end

	for _, spot in { { -66, 44 }, { -22, 64 }, { 22, 64 }, { 66, 44 }, { -68, -26, 0 }, { 68, -26, 0 } } do
		local yOff = if spot[3] == 0 then 0 else 8
		oliveTree(jall, Vector3.new(c.X + spot[1], c.Y + yOff, c.Z + spot[2]), 8, 10)
	end
	for _, spot in { { -56, 36 }, { 56, 36 }, { -14, 64 }, { 14, 64 } } do
		sumacBush(jall, Vector3.new(c.X + spot[1], c.Y + 8, c.Z + spot[2]))
	end

	-- =========================================================================
	-- TIER 3: UPPER CEDAR RIDGE & HERB-DRYING ARBOR (Y = c.Y + 16 = 54, Z = c.Z + 68 to c.Z + 114)
	-- =========================================================================
	local tier3 = model(region, "Tier3_UpperCedarRidge")
	part(tier3, "RetainingWall_T3_Center", Vector3.new(52, 8.4, 3), CFrame.new(c.X, c.Y + 12.2, c.Z + 68), LIMESTONE_DARK, { material = Enum.Material.Limestone })
	part(tier3, "RetainingWall_T3_West", Vector3.new(34, 8.4, 3), CFrame.new(c.X - 61, c.Y + 12.2, c.Z + 68), LIMESTONE_DARK, { material = Enum.Material.Limestone })
	part(tier3, "RetainingWall_T3_East", Vector3.new(34, 8.4, 3), CFrame.new(c.X + 61, c.Y + 12.2, c.Z + 68), LIMESTONE_DARK, { material = Enum.Material.Limestone })

	part(tier3, "TerraceFloor_T3", Vector3.new(156, 8, 46), CFrame.new(c.X, c.Y + 12, c.Z + 91), EARTH_SOIL, { material = Enum.Material.Grass })
	part(tier3, "RidgeBackWall_T3", Vector3.new(158, 6, 4), CFrame.new(c.X, c.Y + 19, c.Z + 114), SLATE_ROCK, { material = Enum.Material.Rock })
	part(tier3, "RidgeWestWall_T3", Vector3.new(3, 5, 46), CFrame.new(c.X - 78, c.Y + 18.5, c.Z + 91), SLATE_ROCK, { material = Enum.Material.Rock })
	part(tier3, "RidgeEastWall_T3", Vector3.new(3, 5, 46), CFrame.new(c.X + 78, c.Y + 18.5, c.Z + 91), SLATE_ROCK, { material = Enum.Material.Rock })

	-- Twin 10-stud wide stone staircases rising from Tier 2 (Z = +56, Y = 46) to Tier 3 (Z = +72, Y = 54) at X = -35 and X = +35.
	stoneStairs(tier3, "Stairs_T2_to_T3_West", Vector3.new(c.X - 35, c.Y + 8, c.Z + 56), 8, 10, 8, 16)
	stoneStairs(tier3, "Stairs_T2_to_T3_East", Vector3.new(c.X + 35, c.Y + 8, c.Z + 56), 8, 10, 8, 16)

	part(tier3, "Path_T3_UpperWalk", Vector3.new(96, 0.3, 10), CFrame.new(c.X, c.Y + 16.15, c.Z + 82), PAVING, { material = Enum.Material.Cobblestone })

	-- Rustic Cedar Herb-Drying Arbor at the crest of Tier 3 (c.X, c.Y + 16, c.Z + 96).
	local arbor = cedarArbor(tier3, CFrame.new(c.X, c.Y + 16, c.Z + 96))
	local beamFront = arbor:FindFirstChild("BeamFront")
	if beamFront and beamFront:IsA("BasePart") then
		sign(arbor, beamFront, "Highland Cedar Arbor & Herb Shade", "Mount Lebanon Cedar Reserve & Terrace Vantage Point", 3.8)
	end

	-- Protected Cedrus libani grove flanking the upper ridge and lower terraces.
	local grove = model(tier3, "CedrusLibaniGrove")
	for _, spot in { { -62, 86, 16 }, { -46, 102, 16 }, { -24, 104, 16 }, { 24, 104, 16 }, { 46, 102, 16 }, { 62, 86, 16 }, { -72, 10, 0 }, { 72, 10, 0 } } do
		cedarTree(grove, Vector3.new(c.X + spot[1], c.Y + spot[3], c.Z + spot[2]), 18, 20)
	end

	return region
end

return MountLebanonWorld
