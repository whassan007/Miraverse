--!strict
-- Beirut Coastal Urban & Promontory Destination (`BeirutWorld.luau`).
-- Grounded in Copernicus GLO-30 DEM (`Copernicus_DSM_COG_10_N33_00_E035_00_DEM`, EPSG:32636):
-- reflects Beirut's real triangular Mediterranean promontory (Ras Beirut), the northern St. George Bay
-- Corniche waterfront, the western Raouché (Pigeon Rocks) limestone sea stacks, and the inland
-- Achrafieh / Serail hillside rising behind the historic center.
local Workspace = game:GetService("Workspace")
local GeoTerrainBuilder = require(script.Parent.GeoTerrainBuilder)

local BeirutWorld = {}

local LIMESTONE = Color3.fromHex("E6DEC8")
local LIMESTONE_DARK = Color3.fromRGB(188, 170, 136)
local SANDSTONE_OCHRE = Color3.fromHex("D9B88C")
local TERRACOTTA = Color3.fromRGB(190, 92, 52)
local PAVING = Color3.fromRGB(205, 192, 166)
local PROMENADE_TILE = Color3.fromRGB(224, 214, 194)
local CEDAR_WOOD = Color3.fromHex("7B4B2A")
local MED_BLUE = Color3.fromRGB(36, 122, 168)
local PINE_GREEN = Color3.fromRGB(52, 108, 64)
local PALM_GREEN = Color3.fromRGB(68, 128, 72)

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

local function sign(parent: Instance, adornee: BasePart, titleText: string, subtitleText: string?, offset: number)
	local board = Instance.new("BillboardGui")
	board.Name = "BeirutSign"
	board.Adornee = adornee
	board.Size = if subtitleText then UDim2.fromOffset(250, 60) else UDim2.fromOffset(220, 44)
	board.StudsOffset = Vector3.new(0, offset, 0)
	board.AlwaysOnTop = true
	board.MaxDistance = 90

	local card = Instance.new("Frame")
	card.Name = "Card"
	card.Size = UDim2.fromScale(1, 1)
	card.BackgroundColor3 = Color3.fromRGB(24, 48, 68)
	card.BackgroundTransparency = 0.12
	card.BorderSizePixel = 0
	card.Parent = board

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 8)
	corner.Parent = card

	local stroke = Instance.new("UIStroke")
	stroke.Color = TERRACOTTA
	stroke.Thickness = 2
	stroke.Parent = card

	local title = Instance.new("TextLabel")
	title.Name = "Title"
	title.Size = if subtitleText then UDim2.new(1, -12, 0.56, 0) else UDim2.new(1, -12, 1, 0)
	title.Position = UDim2.fromOffset(6, 2)
	title.BackgroundTransparency = 1
	title.TextColor3 = Color3.new(1, 1, 1)
	title.Font = Enum.Font.GothamBold
	title.TextScaled = true
	title.Text = titleText
	title.Parent = card

	if subtitleText then
		local sub = Instance.new("TextLabel")
		sub.Name = "Subtitle"
		sub.Size = UDim2.new(1, -12, 0.4, 0)
		sub.Position = UDim2.new(0, 6, 0.56, 0)
		sub.BackgroundTransparency = 1
		sub.TextColor3 = Color3.fromRGB(220, 235, 245)
		sub.Font = Enum.Font.Gotham
		sub.TextScaled = true
		sub.Text = subtitleText
		sub.Parent = card
	end

	board.Parent = parent
end

-- Traditional triple-arcade Levantine town house (Beirut central hall / Mandelbaum arch motif).
local function levantineArcadeHouse(parent: Instance, name: string, base: CFrame, width: number, depth: number, height: number)
	local m = model(parent, name)
	part(m, "Walls", Vector3.new(width, height, depth), base * CFrame.new(0, height / 2, 0), SANDSTONE_OCHRE, { material = Enum.Material.Limestone })
	part(m, "Cornice", Vector3.new(width + 1.2, 0.8, depth + 1.2), base * CFrame.new(0, height + 0.4, 0), LIMESTONE, { material = Enum.Material.Limestone })
	part(m, "HipRoof", Vector3.new(width + 0.8, 3.2, depth + 0.8), base * CFrame.new(0, height + 2.4, 0), TERRACOTTA, { material = Enum.Material.Slate })
	for _, xOff in { -3.2, 0, 3.2 } do
		part(m, "TripleArchWindow", Vector3.new(2.2, 4.6, 0.4), base * CFrame.new(xOff, height - 4.2, -depth / 2 - 0.15), Color3.fromRGB(36, 58, 76))
	end
	part(m, "EntryDoor", Vector3.new(4.2, 7.2, 0.4), base * CFrame.new(0, 3.6, -depth / 2 - 0.15), CEDAR_WOOD, { material = Enum.Material.WoodPlanks })
	return m
end

local function stonePine(parent: Instance, pos: Vector3, height: number, crown: number)
	local m = model(parent, "UmbrellaPine")
	part(
		m,
		"Trunk",
		Vector3.new(height, 1.6, 1.6),
		CFrame.new(pos + Vector3.new(0, height / 2, 0)) * CFrame.Angles(0, 0, math.pi / 2),
		CEDAR_WOOD,
		{ shape = Enum.PartType.Cylinder, material = Enum.Material.Wood }
	)
	part(
		m,
		"UmbrellaCanopy",
		Vector3.new(crown, 3.4, crown),
		CFrame.new(pos + Vector3.new(0, height + 0.8, 0)),
		PINE_GREEN,
		{ shape = Enum.PartType.Ball, material = Enum.Material.Grass, collide = false }
	)
	return m
end

export type BuildCallbacks = {
	travelToLocation: ((Player, string) -> ())?,
	returnToLobby: ((Player) -> ())?,
}

function BeirutWorld.build(parent: Instance, center: Vector3, callbacks: BuildCallbacks?): Folder
	local existing = parent:FindFirstChild("City_beirut")
	if existing then
		existing:Destroy()
	end

	local city = Instance.new("Folder")
	city.Name = "City_beirut"
	city:SetAttribute("Country", "LB")
	city:SetAttribute("LocationId", "beirut")
	city:SetAttribute("LocationType", "city")
	city.Parent = parent

	local c = center -- (800, 14, -290)

	-- 1. Build Copernicus GLO-30 DEM voxel terrain for Beirut promontory
	GeoTerrainBuilder.buildLocationTerrain("LB", "beirut", c, city)

	-- 2. Walkable Ras Beirut / Corniche Promenade & Central Plaza (Y = c.Y = 14)
	local promenade = model(city, "BeirutCornichePromenade")
	part(promenade, "PlazaDeck", Vector3.new(136, 3, 96), CFrame.new(c.X, c.Y - 1.5, c.Z + 4), PROMENADE_TILE, { material = Enum.Material.Cobblestone })
	local seaWall = part(promenade, "CornicheSeaWallNorth", Vector3.new(136, 3.4, 2.4), CFrame.new(c.X, c.Y + 1.7, c.Z - 43), LIMESTONE, { material = Enum.Material.Limestone })
	part(promenade, "CornicheSeaWallWest", Vector3.new(2.4, 3.4, 96), CFrame.new(c.X - 67, c.Y + 1.7, c.Z + 4), LIMESTONE, { material = Enum.Material.Limestone })
	sign(promenade, seaWall, "Beirut Corniche & St. George Bay", "Mediterranean Coastal Promontory (33.894°N, 35.502°E)", 5.2)

	-- 3. Raouché (Pigeon Rocks) Limestone Sea Stacks off the western promontory cliff (c.X - 82, c.Z - 18)
	local raouche = model(city, "RaouchePigeonRocks")
	local archStack = part(raouche, "RaoucheMainArchStack", Vector3.new(16, 26, 24), CFrame.new(c.X - 84, c.Y + 5, c.Z - 20), LIMESTONE_DARK, { material = Enum.Material.Limestone })
	part(raouche, "RaoucheSouthStack", Vector3.new(12, 22, 14), CFrame.new(c.X - 82, c.Y + 3, c.Z + 8), LIMESTONE_DARK, { material = Enum.Material.Limestone })
	sign(raouche, archStack, "Raouché (Pigeon Rocks) Sea Cliffs", "Natural Western Limestone Sea Stacks of Ras Beirut", 16)

	-- 4. Achrafieh / Serail Inland Hillside Quarter rising to the southeast (c.X + 46, c.Y + 10, c.Z + 28)
	local hillQuarter = model(city, "AchrafiehHillsideQuarter")
	part(hillQuarter, "HillTerrace", Vector3.new(54, 10, 48), CFrame.new(c.X + 46, c.Y + 5, c.Z + 28), LIMESTONE_DARK, { material = Enum.Material.Limestone })
	levantineArcadeHouse(hillQuarter, "HeritageHouse_East1", CFrame.new(c.X + 46, c.Y + 10, c.Z + 32) * CFrame.Angles(0, math.pi, 0), 22, 14, 15)
	levantineArcadeHouse(hillQuarter, "HeritageHouse_West1", CFrame.new(c.X - 38, c.Y, c.Z + 36) * CFrame.Angles(0, math.pi, 0), 20, 14, 14)

	-- Stone Pines (Pinus pinea - Horsh Beirut / coastal promenade trees)
	local trees = model(city, "BeirutStonePines")
	for _, spot in { { -50, -32, 0 }, { -18, -32, 0 }, { 18, -32, 0 }, { 50, -32, 0 }, { 32, 42, 10 } } do
		stonePine(trees, Vector3.new(c.X + spot[1], c.Y + spot[3], c.Z + spot[2]), 13, 15)
	end

	-- 5. Spawn pad at (c.X, c.Y + 0.5, c.Z + 28) -> (800, 14.5, -262)
	local spawnPart = part(
		city,
		"Spawn_beirut",
		Vector3.new(8, 1, 8),
		CFrame.new(c.X, c.Y + 0.5, c.Z + 28),
		TERRACOTTA,
		{ material = Enum.Material.Cobblestone }
	)
	spawnPart:SetAttribute("Country", "LB")
	spawnPart:SetAttribute("LocationId", "beirut")

	-- 6. Travel portals in front of spawn (Z = c.Z + 10 = -280):
	-- West portal: Coastal Road to Byblos
	local toByblosStation = model(city, "TravelStation_BeirutToByblos")
	part(toByblosStation, "Pedestal", Vector3.new(9, 1, 6), CFrame.new(c.X - 20, c.Y + 0.5, c.Z + 10), LIMESTONE, { material = Enum.Material.Limestone })
	local toByblosPortal = part(
		toByblosStation,
		"Portal_beirut_to_byblos",
		Vector3.new(4.8, 7.6, 1.2),
		CFrame.new(c.X - 20, c.Y + 4.8, c.Z + 10),
		MED_BLUE,
		{ material = Enum.Material.Neon }
	)
	toByblosPortal:SetAttribute("Country", "LB")
	toByblosPortal:SetAttribute("DestinationLocationId", "byblos")
	sign(toByblosStation, toByblosPortal, "Coastal Road to Byblos", "Travel North along the Mediterranean Coast", 5.5)

	local byblosPrompt = Instance.new("ProximityPrompt")
	byblosPrompt.Name = "TravelToByblosFromBeirutPrompt"
	byblosPrompt.ActionText = "Travel to Byblos"
	byblosPrompt.ObjectText = "Byblos Harbor & Souk (LB)"
	byblosPrompt.HoldDuration = 0
	byblosPrompt.MaxActivationDistance = 14
	byblosPrompt.RequiresLineOfSight = false
	byblosPrompt.Parent = toByblosPortal
	if callbacks and callbacks.travelToLocation then
		local fn = callbacks.travelToLocation
		byblosPrompt.Triggered:Connect(function(player: Player)
			fn(player, "byblos")
		end)
	end

	-- Center-East portal: Mountain Pass to Mount Lebanon
	local toMtStation = model(city, "TravelStation_BeirutToMountLebanon")
	part(toMtStation, "Pedestal", Vector3.new(9, 1, 6), CFrame.new(c.X, c.Y + 0.5, c.Z + 10), LIMESTONE, { material = Enum.Material.Limestone })
	local toMtPortal = part(
		toMtStation,
		"Portal_beirut_to_mount_lebanon",
		Vector3.new(4.8, 7.6, 1.2),
		CFrame.new(c.X, c.Y + 4.8, c.Z + 10),
		PINE_GREEN,
		{ material = Enum.Material.Neon }
	)
	toMtPortal:SetAttribute("Country", "LB")
	toMtPortal:SetAttribute("DestinationLocationId", "mount_lebanon")
	sign(toMtStation, toMtPortal, "Ascend to Mount Lebanon", "Travel to Al-Jall Cedar & Olive Terraces", 5.5)

	local mtPrompt = Instance.new("ProximityPrompt")
	mtPrompt.Name = "TravelToMountLebanonFromBeirutPrompt"
	mtPrompt.ActionText = "Travel to Mount Lebanon"
	mtPrompt.ObjectText = "Mount Lebanon Region (LB)"
	mtPrompt.HoldDuration = 0
	mtPrompt.MaxActivationDistance = 14
	mtPrompt.RequiresLineOfSight = false
	mtPrompt.Parent = toMtPortal
	if callbacks and callbacks.travelToLocation then
		local fn = callbacks.travelToLocation
		mtPrompt.Triggered:Connect(function(player: Player)
			fn(player, "mount_lebanon")
		end)
	end

	-- East portal: Return to Travel Lobby
	local toLobbyStation = model(city, "TravelStation_BeirutToLobby")
	part(toLobbyStation, "Pedestal", Vector3.new(9, 1, 6), CFrame.new(c.X + 20, c.Y + 0.5, c.Z + 10), LIMESTONE, { material = Enum.Material.Limestone })
	local toLobbyPortal = part(
		toLobbyStation,
		"ReturnLobby_beirut",
		Vector3.new(5, 8, 1.5),
		CFrame.new(c.X + 20, c.Y + 4.8, c.Z + 10),
		Color3.fromRGB(235, 190, 80),
		{ material = Enum.Material.Neon }
	)
	toLobbyPortal:SetAttribute("Country", "LB")
	toLobbyPortal:SetAttribute("LocationId", "beirut")
	sign(toLobbyStation, toLobbyPortal, "Return to Travel Lobby", "MiraVerse Global Hub", 5.5)

	local lobbyPrompt = Instance.new("ProximityPrompt")
	lobbyPrompt.Name = "ReturnPrompt"
	lobbyPrompt.ActionText = "Return to Travel Lobby"
	lobbyPrompt.ObjectText = "MiraVerse Lobby"
	lobbyPrompt.HoldDuration = 0
	lobbyPrompt.MaxActivationDistance = 14
	lobbyPrompt.RequiresLineOfSight = false
	lobbyPrompt.Parent = toLobbyPortal
	if callbacks and callbacks.returnToLobby then
		local fn = callbacks.returnToLobby
		lobbyPrompt.Triggered:Connect(function(player: Player)
			fn(player)
		end)
	end

	return city
end

return BeirutWorld
