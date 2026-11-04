--!strict
-- Regional & Campaign Destination World Builder (`RegionalDestinationsWorld.luau`).
-- Constructs DEM-derived voxel terrain (`GeoTerrainBuilder`), walkable arrival plazas, regional architectural
-- landmarks, vegetation, spawn pads, and inter-location travel portals across all additional Miraverse
-- destinations in Egypt, Iraq, South Korea, France, Germany, China, Japan, Russia, Ukraine, and Morocco.
local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local WorldRegistry = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("WorldRegistry"))
local GeoTerrainBuilder = require(script.Parent.GeoTerrainBuilder)

local RegionalDestinationsWorld = {}

export type BuildCallbacks = {
	travelToLocation: ((Player, string) -> ())?,
	returnToLobby: ((Player) -> ())?,
}

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

local function sign(parent: Instance, adornee: BasePart, titleText: string, subtitleText: string?, accentColor: Color3, offset: number)
	local board = Instance.new("BillboardGui")
	board.Name = "LocationSign"
	board.Adornee = adornee
	board.Size = if subtitleText then UDim2.fromOffset(250, 60) else UDim2.fromOffset(220, 44)
	board.StudsOffset = Vector3.new(0, offset, 0)
	board.AlwaysOnTop = true
	board.MaxDistance = 90

	local card = Instance.new("Frame")
	card.Name = "Card"
	card.Size = UDim2.fromScale(1, 1)
	card.BackgroundColor3 = Color3.fromRGB(22, 28, 42)
	card.BackgroundTransparency = 0.12
	card.BorderSizePixel = 0
	card.Parent = board

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 8)
	corner.Parent = card

	local stroke = Instance.new("UIStroke")
	stroke.Color = accentColor
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
		sub.TextColor3 = Color3.fromRGB(215, 228, 245)
		sub.Font = Enum.Font.Gotham
		sub.TextScaled = true
		sub.Text = subtitleText
		sub.Parent = card
	end

	board.Parent = parent
end

type StyleSpec = {
	floorColor: Color3,
	floorMat: Enum.Material,
	accentColor: Color3,
	landmarkTitle: string,
	landmarkSubtitle: string,
	wallColor: Color3,
	wallMat: Enum.Material,
	treeColor: Color3?,
}

local LOCATION_STYLES: { [string]: StyleSpec } = {
	cairo = {
		floorColor = Color3.fromRGB(214, 190, 146),
		floorMat = Enum.Material.Sandstone,
		accentColor = Color3.fromHex("D99B26"),
		landmarkTitle = "Bab Zuweila & Nile Valley Courtyard",
		landmarkSubtitle = "Nile Floodplain & Muqattam Limestone Escarpment (EPSG:32636)",
		wallColor = Color3.fromRGB(224, 202, 162),
		wallMat = Enum.Material.Limestone,
		treeColor = Color3.fromRGB(72, 128, 64),
	},
	alexandria = {
		floorColor = Color3.fromRGB(222, 212, 190),
		floorMat = Enum.Material.Limestone,
		accentColor = Color3.fromHex("1E5B88"),
		landmarkTitle = "Alexandria Eastern Harbor & Qaitbay Headland",
		landmarkSubtitle = "Mediterranean Crescent Harbor & Coastal Ridge (EPSG:32635)",
		wallColor = Color3.fromRGB(235, 226, 206),
		wallMat = Enum.Material.Limestone,
		treeColor = Color3.fromRGB(68, 124, 72),
	},
	aswan = {
		floorColor = Color3.fromRGB(204, 156, 118),
		floorMat = Enum.Material.Sandstone,
		accentColor = Color3.fromHex("D99B26"),
		landmarkTitle = "Aswan First Cataract & Elephantine Terrace",
		landmarkSubtitle = "Upper Egypt Granite Cataract & Qubbet el-Hawa Dunes (EPSG:32636)",
		wallColor = Color3.fromRGB(186, 134, 98),
		wallMat = Enum.Material.Rock,
		treeColor = Color3.fromRGB(78, 132, 68),
	},
	baghdad = {
		floorColor = Color3.fromRGB(198, 166, 118),
		floorMat = Enum.Material.Brick,
		accentColor = Color3.fromHex("1A7B88"),
		landmarkTitle = "Al-Mutanabbi Book Quarter & Tigris Embankment",
		landmarkSubtitle = "Mesopotamian Alluvial Plain & Dijlah Meander (EPSG:32638)",
		wallColor = Color3.fromRGB(194, 155, 97),
		wallMat = Enum.Material.Brick,
		treeColor = Color3.fromRGB(76, 126, 62),
	},
	erbil = {
		floorColor = Color3.fromRGB(208, 184, 144),
		floorMat = Enum.Material.Limestone,
		accentColor = Color3.fromHex("D4882A"),
		landmarkTitle = "Citadel of Erbil (Qalat Hewlêr) & Northern Foothills",
		landmarkSubtitle = "Oval Citadel Tell & Zagros Foothill Horizon (EPSG:32638)",
		wallColor = Color3.fromRGB(202, 172, 128),
		wallMat = Enum.Material.Brick,
		treeColor = Color3.fromRGB(88, 128, 72),
	},
	basra = {
		floorColor = Color3.fromRGB(192, 174, 138),
		floorMat = Enum.Material.Cobblestone,
		accentColor = Color3.fromHex("1A8C9C"),
		landmarkTitle = "Basra Shatt al-Arab Waterway & Ashar Creek",
		landmarkSubtitle = "Southern Estuarine Lowland & Date Palm Canals (EPSG:32638)",
		wallColor = Color3.fromRGB(178, 146, 108),
		wallMat = Enum.Material.WoodPlanks,
		treeColor = Color3.fromRGB(64, 132, 68),
	},
	jeonju = {
		floorColor = Color3.fromRGB(194, 186, 170),
		floorMat = Enum.Material.Cobblestone,
		accentColor = Color3.fromHex("2E7D6F"),
		landmarkTitle = "Jeonju Hanok Village & Kirinbong Ridge",
		landmarkSubtitle = "Jeonjucheon Basin & Forested Eastern Hills (EPSG:32652)",
		wallColor = Color3.fromRGB(238, 230, 214),
		wallMat = Enum.Material.SmoothPlastic,
		treeColor = Color3.fromRGB(58, 108, 76),
	},
	seoul = {
		floorColor = Color3.fromRGB(188, 184, 178),
		floorMat = Enum.Material.Cobblestone,
		accentColor = Color3.fromHex("0047A0"),
		landmarkTitle = "Seoul Jongno Basin, Bugaksan & Han River",
		landmarkSubtitle = "Granite Mountain Ring & Hangang Corridor (EPSG:32652)",
		wallColor = Color3.fromRGB(156, 152, 146),
		wallMat = Enum.Material.Rock,
		treeColor = Color3.fromRGB(54, 104, 72),
	},
	busan = {
		floorColor = Color3.fromRGB(196, 190, 178),
		floorMat = Enum.Material.Cobblestone,
		accentColor = Color3.fromHex("C84B31"),
		landmarkTitle = "Busan Harbor Quay & Gamcheon Coastal Hills",
		landmarkSubtitle = "Korea Strait Waterfront & Steep Terraced Hillsides (EPSG:32652)",
		wallColor = Color3.fromRGB(122, 168, 204),
		wallMat = Enum.Material.Limestone,
		treeColor = Color3.fromRGB(62, 114, 78),
	},
	lyon = {
		floorColor = Color3.fromRGB(208, 188, 158),
		floorMat = Enum.Material.Cobblestone,
		accentColor = Color3.fromHex("1E3A8A"),
		landmarkTitle = "Vieux Lyon, Fourvière & Rhône–Saône Confluence",
		landmarkSubtitle = "Presqu'île Confluence & Silk Hills (EPSG:32631)",
		wallColor = Color3.fromRGB(216, 164, 92),
		wallMat = Enum.Material.Limestone,
		treeColor = Color3.fromRGB(68, 118, 68),
	},
	paris = {
		floorColor = Color3.fromRGB(214, 206, 190),
		floorMat = Enum.Material.Cobblestone,
		accentColor = Color3.fromHex("0055A4"),
		landmarkTitle = "Paris Seine Basin, Île de la Cité & Montmartre",
		landmarkSubtitle = "Gentle Sedimentary Basin & Seine Embankments (EPSG:32631)",
		wallColor = Color3.fromRGB(226, 217, 200),
		wallMat = Enum.Material.Limestone,
		treeColor = Color3.fromRGB(72, 122, 72),
	},
	marseille = {
		floorColor = Color3.fromRGB(222, 208, 182),
		floorMat = Enum.Material.Limestone,
		accentColor = Color3.fromHex("E5A93B"),
		landmarkTitle = "Marseille Vieux-Port & Calanques Limestone Relief",
		landmarkSubtitle = "Mediterranean Harbor Basin & La Garde Limestone Peak (EPSG:32631)",
		wallColor = Color3.fromRGB(232, 218, 192),
		wallMat = Enum.Material.Limestone,
		treeColor = Color3.fromRGB(76, 118, 68),
	},
	rhine_valley = {
		floorColor = Color3.fromRGB(164, 160, 154),
		floorMat = Enum.Material.Slate,
		accentColor = Color3.fromRGB(212, 172, 76),
		landmarkTitle = "Upper Middle Rhine Gorge & Lorelei Slate Cliff",
		landmarkSubtitle = "Real Geographic Gorge (EPSG:32632) | Symbolic Grail Hall Labeled as Literature",
		wallColor = Color3.fromRGB(118, 124, 132),
		wallMat = Enum.Material.Slate,
		treeColor = Color3.fromRGB(52, 98, 64),
	},
	wuling_valley = {
		floorColor = Color3.fromRGB(204, 196, 182),
		floorMat = Enum.Material.Cobblestone,
		accentColor = Color3.fromRGB(228, 148, 168),
		landmarkTitle = "Wuling-Inspired Peach Blossom Spring (Literary Setting)",
		landmarkSubtitle = "Fictional Interpretation of Tao Yuanming (421 CE) on Real Hunan Karst DEM (EPSG:32649)",
		wallColor = Color3.fromRGB(242, 238, 230),
		wallMat = Enum.Material.SmoothPlastic,
		treeColor = Color3.fromRGB(228, 148, 168),
	},
	tohoku_route = {
		floorColor = Color3.fromRGB(186, 180, 168),
		floorMat = Enum.Material.Cobblestone,
		accentColor = Color3.fromRGB(188, 92, 84),
		landmarkTitle = "Bashō Tohoku Route: Yamadera Slope to Matsushima Bay",
		landmarkSubtitle = "Multi-Segment Real Geography (Yamagata & Miyagi DEMs, EPSG:32654)",
		wallColor = Color3.fromRGB(132, 96, 68),
		wallMat = Enum.Material.WoodPlanks,
		treeColor = Color3.fromRGB(58, 104, 72),
	},
	lake_svetloyar = {
		floorColor = Color3.fromRGB(182, 162, 134),
		floorMat = Enum.Material.WoodPlanks,
		accentColor = Color3.fromRGB(86, 134, 168),
		landmarkTitle = "Lake Svetloyar Basin & Kitezh Folklore Archive",
		landmarkSubtitle = "Real Glacial-Karst Lake DEM (EPSG:32638) | Kitezh Clearly Identified as Mythology",
		wallColor = Color3.fromRGB(154, 114, 78),
		wallMat = Enum.Material.Wood,
		treeColor = Color3.fromRGB(56, 108, 68),
	},
	kyiv_hills = {
		floorColor = Color3.fromRGB(198, 190, 174),
		floorMat = Enum.Material.Cobblestone,
		accentColor = Color3.fromRGB(72, 132, 196),
		landmarkTitle = "Kyiv Right-Bank Hills, Podil Terrace & Dnipro River",
		landmarkSubtitle = "Starokyivska Bluff & Wide Dnipro Channel (EPSG:32636)",
		wallColor = Color3.fromRGB(218, 196, 152),
		wallMat = Enum.Material.WoodPlanks,
		treeColor = Color3.fromRGB(68, 122, 64),
	},
	marrakesh = {
		floorColor = Color3.fromRGB(208, 132, 104),
		floorMat = Enum.Material.Sandstone,
		accentColor = Color3.fromRGB(42, 148, 126),
		landmarkTitle = "Marrakesh Jemaa el-Fnaa & Distant High Atlas Horizon",
		landmarkSubtitle = "Flat Haouz Plain Medina (~454m) with Distant Southern Atlas Silhouette (EPSG:32629)",
		wallColor = Color3.fromRGB(208, 96, 68),
		wallMat = Enum.Material.Sandstone,
		treeColor = Color3.fromRGB(64, 128, 76),
	},
}

-- Attach DEM terrain and inter-location travel portals onto an existing primary Country Plaza (EG, IQ, KR, FR).
function RegionalDestinationsWorld.enhancePrimaryPlaza(
	plazaFolder: Folder,
	countryId: string,
	locationId: string,
	center: Vector3,
	callbacks: BuildCallbacks?
)
	GeoTerrainBuilder.buildLocationTerrain(countryId, locationId, center, plazaFolder)
	local style = LOCATION_STYLES[locationId]
	if style then
		local floor = plazaFolder:FindFirstChild("PlazaFloor_" .. countryId)
		if floor and floor:IsA("BasePart") then
			floor.Color = style.floorColor
			floor.Material = style.floorMat
			sign(plazaFolder, floor, style.landmarkTitle, style.landmarkSubtitle, style.accentColor, 6.5)
		end
	end

	-- Add travel portals to sibling locations within the same country (e.g. Cairo -> Alexandria, Aswan)
	local locDef = WorldRegistry.getLocation(locationId)
	if not locDef then
		return
	end
	local siblingTargets: { string } = {}
	for _, conn in ipairs(locDef.travelConnections) do
		if conn ~= "LOBBY" then
			table.insert(siblingTargets, conn)
		end
	end
	for idx, targetId in ipairs(siblingTargets) do
		local targetLoc = WorldRegistry.getLocation(targetId)
		if targetLoc then
			local xOff = if idx == 1 then 34 else -34
			local stationPos = center + Vector3.new(xOff, 0, 14)
			local stModel = model(plazaFolder, "TravelStation_To_" .. targetId)
			part(stModel, "Pedestal", Vector3.new(9, 1, 6), CFrame.new(stationPos + Vector3.new(0, 0.5, 0)), Color3.fromRGB(215, 200, 175), { material = Enum.Material.Limestone })
			local portal = part(
				stModel,
				"Portal_" .. locationId .. "_to_" .. targetId,
				Vector3.new(4.8, 7.6, 1.2),
				CFrame.new(stationPos + Vector3.new(0, 4.8, 0)),
				if style then style.accentColor else Color3.fromRGB(60, 140, 210),
				{ material = Enum.Material.Neon }
			)
			portal:SetAttribute("Country", countryId)
			portal:SetAttribute("SourceLocation", locationId)
			portal:SetAttribute("DestinationLocationId", targetId)
			sign(stModel, portal, "Travel to " .. targetLoc.displayName, targetLoc.countryId .. " · Regional Route", Color3.fromRGB(235, 190, 80), 5.5)

			local prompt = Instance.new("ProximityPrompt")
			prompt.Name = "TravelTo_" .. targetId .. "_Prompt"
			prompt.ActionText = "Travel to " .. targetLoc.displayName
			prompt.ObjectText = targetLoc.displayName .. " (" .. countryId .. ")"
			prompt.HoldDuration = 0
			prompt.MaxActivationDistance = 14
			prompt.RequiresLineOfSight = false
			prompt.Parent = portal
			if callbacks and callbacks.travelToLocation then
				local fn = callbacks.travelToLocation
				prompt.Triggered:Connect(function(player: Player)
					fn(player, targetId)
				end)
			end
		end
	end
end

-- Build a standalone secondary city or campaign destination scene.
function RegionalDestinationsWorld.buildDestination(
	mapFolder: Folder,
	locationId: string,
	callbacks: BuildCallbacks?
): Folder?
	local locDef = WorldRegistry.getLocation(locationId)
	if not locDef then
		return nil
	end

	local folderName = "Destination_" .. locationId
	local existing = mapFolder:FindFirstChild(folderName)
	if existing then
		existing:Destroy()
	end

	local destFolder = Instance.new("Folder")
	destFolder.Name = folderName
	destFolder:SetAttribute("Country", locDef.countryId)
	destFolder:SetAttribute("LocationId", locationId)
	destFolder:SetAttribute("LocationType", locDef.locationType)
	destFolder.Parent = mapFolder

	local c = locDef.origin
	local style = LOCATION_STYLES[locationId] or LOCATION_STYLES.cairo

	-- 1. Build Copernicus GLO-30 DEM voxel terrain
	GeoTerrainBuilder.buildLocationTerrain(locDef.countryId, locationId, c, destFolder)

	-- 2. Walkable Arrival Plaza & Architectural Landmark Pavilion
	local plaza = model(destFolder, "Plaza_" .. locationId)
	local deck = part(plaza, "PlazaFloor_" .. locationId, Vector3.new(96, 2, 96), CFrame.new(c.X, c.Y - 1, c.Z), style.floorColor, { material = style.floorMat })
	part(plaza, "PlazaBorder_" .. locationId, Vector3.new(100, 1.2, 100), CFrame.new(c.X, c.Y - 1.2, c.Z), style.accentColor, { material = Enum.Material.Limestone, collide = false })
	sign(plaza, deck, style.landmarkTitle, style.landmarkSubtitle, style.accentColor, 6.8)

	-- Regional architectural pavilion at (c.X, c.Y, c.Z - 26)
	local pavilion = model(destFolder, "Landmark_" .. locationId)
	part(pavilion, "Foundation", Vector3.new(28, 2, 16), CFrame.new(c.X, c.Y + 1, c.Z - 26), style.wallColor, { material = style.wallMat })
	part(pavilion, "MainWallLeft", Vector3.new(4, 12, 14), CFrame.new(c.X - 10, c.Y + 8, c.Z - 26), style.wallColor, { material = style.wallMat })
	part(pavilion, "MainWallRight", Vector3.new(4, 12, 14), CFrame.new(c.X + 10, c.Y + 8, c.Z - 26), style.wallColor, { material = style.wallMat })
	local roofPart = part(pavilion, "RoofCanopy", Vector3.new(30, 2.4, 18), CFrame.new(c.X, c.Y + 15.2, c.Z - 26), style.accentColor, { material = style.wallMat })
	sign(pavilion, roofPart, locDef.displayName .. " Heritage Landmark", style.landmarkSubtitle, style.accentColor, 4.5)

	-- Special geographical / cultural distinction features per destination
	if locationId == "erbil" then
		-- Elevated Citadel Tell mound behind the main square
		part(pavilion, "ErbilCitadelTellMound", Vector3.new(56, 12, 42), CFrame.new(c.X, c.Y + 6, c.Z - 54), style.wallColor, { material = Enum.Material.Brick })
	elseif locationId == "marrakesh" then
		-- Distant southern High Atlas silhouette ridge at the far +Z horizon (+135 studs, NOT inside the Medina!)
		local atlasHorizon = model(destFolder, "DistantHighAtlasHorizon")
		local horizonPeak = part(atlasHorizon, "HighAtlasDistantRidge", Vector3.new(180, 26, 18), CFrame.new(c.X, c.Y + 18, c.Z + 136), Color3.fromRGB(148, 112, 98), { material = Enum.Material.Rock })
		sign(atlasHorizon, horizonPeak, "High Atlas Horizon (Distant Regional Silhouette)", "Located ~45 km south across the flat Haouz Plain", style.accentColor, 16)
	elseif locationId == "tohoku_route" then
		-- Waystation wooden bridge connecting Segment A (Yamadera mountain temple) and Segment B (Matsushima pine bay)
		local bridge = model(destFolder, "OkuNoHosomichiBridge")
		local span = part(bridge, "WaystationBridgeSpan", Vector3.new(26, 1.2, 8), CFrame.new(c.X + 24, c.Y + 1.5, c.Z - 8), Color3.fromRGB(138, 92, 58), { material = Enum.Material.WoodPlanks })
		sign(bridge, span, "Oku no Hosomichi Route Bridge", "Links Yamadera Mountain Segment (West) & Matsushima Bay Segment (East)", style.accentColor, 4.5)
	elseif locationId == "lake_svetloyar" then
		-- Optical water-reflection prism marker explicitly identifying Kitezh as folklore
		local folklore = model(destFolder, "KitezhFolkloreMarker")
		local prism = part(folklore, "ReflectionMarker", Vector3.new(6, 5, 6), CFrame.new(c.X - 24, c.Y + 2.5, c.Z - 16), Color3.fromRGB(110, 175, 220), { material = Enum.Material.Glass, transparency = 0.25 })
		sign(folklore, prism, "Legend of Kitezh (Folklore Archive)", "Oral tradition preserved at real Lake Svetloyar", style.accentColor, 4.5)
	end

	-- Regional trees
	if style.treeColor then
		local flora = model(destFolder, "RegionalFlora_" .. locationId)
		for _, spot in { { -38, -20 }, { 38, -20 }, { -38, 22 }, { 38, 22 } } do
			part(
				flora,
				"Trunk",
				Vector3.new(10, 1.4, 1.4),
				CFrame.new(c.X + spot[1], c.Y + 5, c.Z + spot[2]) * CFrame.Angles(0, 0, math.pi / 2),
				Color3.fromRGB(108, 72, 44),
				{ shape = Enum.PartType.Cylinder, material = Enum.Material.Wood }
			)
			part(
				flora,
				"Canopy",
				Vector3.new(11, 4.2, 11),
				CFrame.new(c.X + spot[1], c.Y + 10.5, c.Z + spot[2]),
				style.treeColor,
				{ shape = Enum.PartType.Ball, material = Enum.Material.Grass, collide = false }
			)
		end
	end

	-- 3. Spawn Pad at locDef.spawn (c.X, c.Y + 0.5, c.Z + 28)
	local spawnPart = part(
		destFolder,
		"Spawn_" .. locationId,
		Vector3.new(8, 1, 8),
		CFrame.new(locDef.spawn),
		style.accentColor,
		{ material = Enum.Material.SmoothPlastic }
	)
	spawnPart:SetAttribute("Country", locDef.countryId)
	spawnPart:SetAttribute("LocationId", locationId)

	-- Also create Spawn_<CC> alias if this is the primary location of a new campaign country (DE, CN, JP, RU, UA, MA)
	if WorldRegistry.defaultLocationId(locDef.countryId) == locationId then
		local countrySpawnAlias = part(
			destFolder,
			"Spawn_" .. locDef.countryId,
			Vector3.new(8, 1, 8),
			CFrame.new(locDef.spawn),
			style.accentColor,
			{ material = Enum.Material.SmoothPlastic, transparency = 1, collide = false }
		)
		countrySpawnAlias:SetAttribute("Country", locDef.countryId)
		countrySpawnAlias:SetAttribute("LocationId", locationId)

		local mentorSpot = part(
			destFolder,
			"Mentor_" .. locDef.countryId,
			Vector3.new(4, 6, 4),
			CFrame.new(c.X - 18, c.Y + 3, c.Z - 12),
			style.accentColor,
			{ material = Enum.Material.SmoothPlastic }
		)
		mentorSpot:SetAttribute("Country", locDef.countryId)

		local buildOrigin = part(
			destFolder,
			"BuildOrigin_" .. locDef.countryId,
			Vector3.new(4, 1, 4),
			CFrame.new(c.X + 12, c.Y + 0.5, c.Z - 12),
			style.accentColor,
			{ material = Enum.Material.SmoothPlastic }
		)
		buildOrigin:SetAttribute("Country", locDef.countryId)
	end

	-- 4. Travel Portals in front of arrival spawn (Z = c.Z + 12)
	local nonLobbyTargets: { string } = {}
	for _, conn in ipairs(locDef.travelConnections) do
		if conn ~= "LOBBY" then
			table.insert(nonLobbyTargets, conn)
		end
	end

	for idx, targetId in ipairs(nonLobbyTargets) do
		local targetLoc = WorldRegistry.getLocation(targetId)
		if targetLoc then
			local xOff = -22 + (idx - 1) * 20
			local portalPart = part(
				destFolder,
				"Portal_" .. locationId .. "_to_" .. targetId,
				Vector3.new(4.8, 7.6, 1.2),
				CFrame.new(c.X + xOff, c.Y + 4.8, c.Z + 12),
				style.accentColor,
				{ material = Enum.Material.Neon }
			)
			portalPart:SetAttribute("Country", locDef.countryId)
			portalPart:SetAttribute("DestinationLocationId", targetId)
			sign(destFolder, portalPart, "Travel to " .. targetLoc.displayName, targetLoc.countryId .. " · Regional Route", style.accentColor, 5.5)

			local prompt = Instance.new("ProximityPrompt")
			prompt.Name = "TravelTo_" .. targetId .. "_Prompt"
			prompt.ActionText = "Travel to " .. targetLoc.displayName
			prompt.ObjectText = targetLoc.displayName
			prompt.HoldDuration = 0
			prompt.MaxActivationDistance = 14
			prompt.RequiresLineOfSight = false
			prompt.Parent = portalPart
			if callbacks and callbacks.travelToLocation then
				local fn = callbacks.travelToLocation
				prompt.Triggered:Connect(function(player: Player)
					fn(player, targetId)
				end)
			end
		end
	end

	-- Return to Travel Lobby portal at (c.X + 22, c.Y + 4.8, c.Z + 12)
	local returnPortal = part(
		destFolder,
		"ReturnLobby_" .. locationId,
		Vector3.new(5, 8, 1.5),
		CFrame.new(c.X + 22, c.Y + 4.8, c.Z + 12),
		Color3.fromRGB(235, 190, 80),
		{ material = Enum.Material.Neon }
	)
	returnPortal:SetAttribute("Country", locDef.countryId)
	returnPortal:SetAttribute("LocationId", locationId)
	sign(destFolder, returnPortal, "Return to Travel Lobby", "MiraVerse Global Hub", Color3.fromRGB(235, 190, 80), 5.5)

	local returnPrompt = Instance.new("ProximityPrompt")
	returnPrompt.Name = "ReturnPrompt"
	returnPrompt.ActionText = "Return to Travel Lobby"
	returnPrompt.ObjectText = "MiraVerse Lobby"
	returnPrompt.HoldDuration = 0
	returnPrompt.MaxActivationDistance = 14
	returnPrompt.RequiresLineOfSight = false
	returnPrompt.Parent = returnPortal
	if callbacks and callbacks.returnToLobby then
		local fn = callbacks.returnToLobby
		returnPrompt.Triggered:Connect(function(player: Player)
			fn(player)
		end)
	end

	return destFolder
end

return RegionalDestinationsWorld
