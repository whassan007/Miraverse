--!strict
-- RegionalTerrainBuilder.luau (CODEX-03 / AG-03..AG-13)
-- Builds source-derived DEM topography, hydrology, regional vegetation, architectural landmarks,
-- spawn pads, and travel portals for all regional and global catalog destinations.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Shared = ReplicatedStorage:WaitForChild("Shared")
local WorldRegistry = require(Shared:WaitForChild("WorldRegistry"))
local TerrainData = require(Shared:WaitForChild("TerrainData"))
local TerrainPipeline = require(Shared:WaitForChild("TerrainPipeline"))
local GeoTerrainBuilder = require(script.Parent.GeoTerrainBuilder)

local RegionalTerrainBuilder = {}

type Callbacks = {
	travelToLocation: ((Player, string) -> ())?,
	returnToLobby: ((Player) -> ())?,
}

local BIOME_STYLE: { [string]: { ground: Color3, groundMat: Enum.Material, accent: Color3, water: Color3, treeLeaf: Color3, landmarkTitle: string, landmarkSub: string } } = {
	nile_floodplain_limestone_escarpment = {
		ground = Color3.fromRGB(218, 196, 152),
		groundMat = Enum.Material.Sandstone,
		accent = Color3.fromHex("D99B26"),
		water = Color3.fromRGB(36, 118, 168),
		treeLeaf = Color3.fromRGB(82, 138, 74),
		landmarkTitle = "Nile Corniche & Muqattam Escarpment",
		landmarkSub = "Cairo Floodplain & Eastern Limestone Bluffs",
	},
	mediterranean_coastal_ridge = {
		ground = Color3.fromRGB(228, 216, 188),
		groundMat = Enum.Material.Limestone,
		accent = Color3.fromHex("1E5B88"),
		water = Color3.fromRGB(32, 122, 192),
		treeLeaf = Color3.fromRGB(76, 136, 82),
		landmarkTitle = "Alexandria Eastern Harbor & Corniche",
		landmarkSub = "Mediterranean Coastal Ridge & Qaitbay Spit",
	},
	nubian_sandstone_granite_nile = {
		ground = Color3.fromRGB(204, 156, 108),
		groundMat = Enum.Material.Sandstone,
		accent = Color3.fromHex("D99B26"),
		water = Color3.fromRGB(28, 112, 174),
		treeLeaf = Color3.fromRGB(74, 132, 68),
		landmarkTitle = "Aswan First Cataract & Elephantine Island",
		landmarkSub = "Nubian Sandstone Escarpment & Nile Granite Boulders",
	},
	mesopotamian_alluvial_plain = {
		ground = Color3.fromRGB(210, 182, 138),
		groundMat = Enum.Material.Sandstone,
		accent = Color3.fromHex("1A7B88"),
		water = Color3.fromRGB(44, 126, 156),
		treeLeaf = Color3.fromRGB(84, 136, 72),
		landmarkTitle = "Baghdad Tigris Meander & Rusafa Levee",
		landmarkSub = "Mesopotamian Alluvial Plain & Date-Palm Riverbank",
	},
	zagros_piedmont_steppe_tell = {
		ground = Color3.fromRGB(198, 176, 142),
		groundMat = Enum.Material.Limestone,
		accent = Color3.fromHex("D4882A"),
		water = Color3.fromRGB(68, 142, 168),
		treeLeaf = Color3.fromRGB(98, 138, 78),
		landmarkTitle = "Erbil Citadel Tell & Zagros Foothills",
		landmarkSub = "Elevated Settlement Mound Above Northern Piedmont",
	},
	estuarine_date_palm_wetland = {
		ground = Color3.fromRGB(186, 168, 132),
		groundMat = Enum.Material.Sand,
		accent = Color3.fromHex("1A7B88"),
		water = Color3.fromRGB(42, 132, 152),
		treeLeaf = Color3.fromRGB(68, 134, 68),
		landmarkTitle = "Basra Shatt al-Arab & Ashar Canals",
		landmarkSub = "Estuarine Date-Palm Waterway & Timber Bridges",
	},
	korean_inland_mountain_basin = {
		ground = Color3.fromRGB(184, 178, 162),
		groundMat = Enum.Material.Cobblestone,
		accent = Color3.fromHex("2E7D6F"),
		water = Color3.fromRGB(58, 138, 158),
		treeLeaf = Color3.fromRGB(58, 112, 74),
		landmarkTitle = "Jeonju Hanok Basin & Seungamsan Hills",
		landmarkSub = "Inland Valley Stream (Jeonjucheon) & Pine Ridges",
	},
	granite_peaks_river_valley = {
		ground = Color3.fromRGB(176, 178, 182),
		groundMat = Enum.Material.Slate,
		accent = Color3.fromHex("2E7D6F"),
		water = Color3.fromRGB(48, 124, 168),
		treeLeaf = Color3.fromRGB(62, 118, 76),
		landmarkTitle = "Seoul Hangang Basin, Bugaksan & Namsan",
		landmarkSub = "Granite Mountain Ring & Broad River Valley",
	},
	east_asian_coastal_harbor_hills = {
		ground = Color3.fromRGB(192, 186, 174),
		groundMat = Enum.Material.Limestone,
		accent = Color3.fromHex("C84B31"),
		water = Color3.fromRGB(34, 114, 182),
		treeLeaf = Color3.fromRGB(64, 122, 78),
		landmarkTitle = "Busan Harbor, Yeongdo & Coastal Hills",
		landmarkSub = "Korea Strait Maritime Basin & Terraced Slopes",
	},
	rhone_saone_confluence_hills = {
		ground = Color3.fromRGB(214, 196, 168),
		groundMat = Enum.Material.Limestone,
		accent = Color3.fromHex("1E3A8A"),
		water = Color3.fromRGB(46, 118, 172),
		treeLeaf = Color3.fromRGB(76, 132, 74),
		landmarkTitle = "Lyon Rhône–Saône Confluence & Fourvière",
		landmarkSub = "Presqu'île Peninsula, Vieux Lyon & Croix-Rousse",
	},
	paris_sedimentary_basin = {
		ground = Color3.fromRGB(220, 210, 188),
		groundMat = Enum.Material.Limestone,
		accent = Color3.fromHex("1E3A8A"),
		water = Color3.fromRGB(52, 124, 168),
		treeLeaf = Color3.fromRGB(82, 138, 78),
		landmarkTitle = "Paris Seine Meander & Montmartre Butte",
		landmarkSub = "Île de la Cité Lowland Basin (No Alpine Peaks)",
	},
	provencal_limestone_coast = {
		ground = Color3.fromRGB(228, 218, 196),
		groundMat = Enum.Material.Limestone,
		accent = Color3.fromHex("E5A93B"),
		water = Color3.fromRGB(28, 118, 194),
		treeLeaf = Color3.fromRGB(92, 134, 78),
		landmarkTitle = "Marseille Vieux-Port & Calanques Limestone Relief",
		landmarkSub = "Notre-Dame de la Garde Hill & Mediterranean Coast",
	},
	rhenish_slate_gorge = {
		ground = Color3.fromRGB(136, 144, 152),
		groundMat = Enum.Material.Slate,
		accent = Color3.fromRGB(212, 172, 76),
		water = Color3.fromRGB(44, 116, 158),
		treeLeaf = Color3.fromRGB(64, 116, 68),
		landmarkTitle = "Upper Middle Rhine Gorge & Lorelei Slate Cliff",
		landmarkSub = "Real River Gorge Topography · Lorelei/Parzival Labeled as Literature",
	},
	subtropical_karst_peach_valley = {
		ground = Color3.fromRGB(188, 194, 176),
		groundMat = Enum.Material.Rock,
		accent = Color3.fromRGB(228, 148, 168),
		water = Color3.fromRGB(58, 148, 152),
		treeLeaf = Color3.fromRGB(228, 148, 168),
		landmarkTitle = "Wuling / Taoyuan Valley (Peach Blossom Spring)",
		landmarkSub = "Real Hunan Valley Relief · Tao Yuanming Tale Labeled as Literary Fiction",
	},
	temperate_cedar_mountain_valley = {
		ground = Color3.fromRGB(168, 174, 162),
		groundMat = Enum.Material.Rock,
		accent = Color3.fromRGB(188, 92, 84),
		water = Color3.fromRGB(54, 136, 164),
		treeLeaf = Color3.fromRGB(54, 104, 68),
		landmarkTitle = "Tohoku / Yamadera Waystation Valley",
		landmarkSub = "Real Ou Mountain Relief · Bashō's Oku no Hosomichi Labeled as Historical Literature",
	},
	boreal_birch_pine_lake = {
		ground = Color3.fromRGB(156, 172, 148),
		groundMat = Enum.Material.Grass,
		accent = Color3.fromRGB(214, 162, 74),
		water = Color3.fromRGB(42, 112, 164),
		treeLeaf = Color3.fromRGB(78, 134, 72),
		landmarkTitle = "Lake Svetloyar Forest Basin (Nizhny Novgorod)",
		landmarkSub = "Real Protected Lake Basin · Kitezh Legend Labeled as Oral Folklore",
	},
	eastern_european_river_bluffs = {
		ground = Color3.fromRGB(178, 186, 154),
		groundMat = Enum.Material.Grass,
		accent = Color3.fromRGB(238, 194, 56),
		water = Color3.fromRGB(44, 118, 176),
		treeLeaf = Color3.fromRGB(84, 142, 72),
		landmarkTitle = "Kyiv Right-Bank Hills & Dnipro Floodplain",
		landmarkSub = "Starokyivska Bluffs Overlooking Podil · Founders Labeled as Chronicle Legend",
	},
	haouz_plain_high_atlas_piedmont = {
		ground = Color3.fromRGB(208, 146, 108),
		groundMat = Enum.Material.Sandstone,
		accent = Color3.fromRGB(42, 148, 126),
		water = Color3.fromRGB(56, 142, 164),
		treeLeaf = Color3.fromRGB(76, 132, 72),
		landmarkTitle = "Marrakesh Haouz Plain & High Atlas Foothills",
		landmarkSub = "Red Pisé Oasis Plain & Rising Southern Atlas Relief",
	},
}

local function makeSign(parent: Instance, adornee: BasePart, title: string, subtitle: string?, accent: Color3, offset: number)
	local board = Instance.new("BillboardGui")
	board.Name = "TopoSign"
	board.Adornee = adornee
	board.Size = if subtitle then UDim2.fromOffset(280, 64) else UDim2.fromOffset(220, 44)
	board.StudsOffset = Vector3.new(0, offset, 0)
	board.AlwaysOnTop = true
	board.MaxDistance = 95

	local card = Instance.new("Frame")
	card.Name = "Card"
	card.Size = UDim2.fromScale(1, 1)
	card.BackgroundColor3 = Color3.fromRGB(20, 28, 40)
	card.BackgroundTransparency = 0.12
	card.BorderSizePixel = 0
	card.Parent = board

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 8)
	corner.Parent = card

	local stroke = Instance.new("UIStroke")
	stroke.Color = accent
	stroke.Thickness = 2
	stroke.Parent = card

	local lbl = Instance.new("TextLabel")
	lbl.Name = "Title"
	lbl.Size = if subtitle then UDim2.new(1, -12, 0.54, 0) else UDim2.new(1, -12, 1, 0)
	lbl.Position = UDim2.fromOffset(6, 2)
	lbl.BackgroundTransparency = 1
	lbl.TextColor3 = Color3.new(1, 1, 1)
	lbl.Font = Enum.Font.GothamBold
	lbl.TextScaled = true
	lbl.Text = title
	lbl.Parent = card

	if subtitle then
		local sub = Instance.new("TextLabel")
		sub.Name = "Subtitle"
		sub.Size = UDim2.new(1, -12, 0.42, 0)
		sub.Position = UDim2.new(0, 6, 0.54, 0)
		sub.BackgroundTransparency = 1
		sub.TextColor3 = Color3.fromRGB(220, 232, 245)
		sub.Font = Enum.Font.Gotham
		sub.TextScaled = true
		sub.Text = subtitle
		sub.Parent = card
	end

	board.Parent = parent
end

-- Adds DEM topography + hydrological channel to an existing primary city Plaza folder (Cairo, Baghdad, Jeonju, Lyon, Byblos)
-- and adds travel portals to sibling locations in the same country.
function RegionalTerrainBuilder.augmentCityPlaza(
	plazaFolder: Folder,
	locationId: string,
	origin: Vector3,
	callbacks: Callbacks?
)
	local rec = TerrainData.getRecord(locationId)
	local locDef = WorldRegistry.getLocation(locationId)
	if not rec or not locDef then
		return
	end

	plazaFolder:SetAttribute("DEMSourceId", rec.sourceId)
	plazaFolder:SetAttribute("CRS", rec.coordinateReferenceSystem)
	plazaFolder:SetAttribute("GeographicSetting", rec.geographicSetting)
	plazaFolder:SetAttribute("WaterFeature", rec.waterFeature)

	local style = BIOME_STYLE[rec.biome]
	-- Build outer DEM relief ring (clear radius 64 studs so all plaza buildings/stations stay untouched)
	if locationId ~= "byblos" then
		GeoTerrainBuilder.buildLocationTerrain(locDef.countryId, locDef.locationId, origin, plazaFolder)
		TerrainPipeline.buildLocationRelief(plazaFolder, locationId, origin, 220, 220, 64)
	else
		TerrainPipeline.buildLocationRelief(plazaFolder, locationId, origin, 230, 260, 115)
	end

	-- Hydrological feature alignment for Cairo (Nile), Baghdad (Tigris), Jeonju (Jeonjucheon), Lyon (Rhône & Saône)
	if locationId ~= "byblos" and style then
		local waterBar = Instance.new("Part")
		waterBar.Name = "Hydrology_" .. locationId
		waterBar.Anchored = true
		waterBar.CanCollide = false
		waterBar.Transparency = 0.2
		waterBar.Size = Vector3.new(210, 3, 28)
		waterBar.Position = origin + Vector3.new(0, -1.8, -68)
		waterBar.Color = style.water
		waterBar.Material = Enum.Material.Water
		waterBar.Parent = plazaFolder
		makeSign(plazaFolder, waterBar, rec.waterFeature, style.landmarkSub, style.accent, 6)
	end

	-- Add travel portals in front of arrival camera (Z <= 18) for every connected non-lobby destination
	local idx = 0
	for _, targetId in ipairs(locDef.travelConnections) do
		if targetId ~= "LOBBY" then
			-- Byblos already has Portal_byblos_to_mount_lebanon and Portal_byblos_to_beirut in MapBuilder.luau; skip duplicating them
			if locationId ~= "byblos" then
				idx += 1
				local targetLoc = WorldRegistry.getLocation(targetId)
				local targetTitle = if targetLoc then targetLoc.displayName else targetId
				local xPos = if locationId == "byblos" then -34 else (idx == 1 and -32 or 32)
				local portalPart = Instance.new("Part")
				portalPart.Name = string.format("Portal_%s_to_%s", locationId, targetId)
				portalPart.Anchored = true
				portalPart.CanCollide = true
				portalPart.Size = Vector3.new(4.8, 7.6, 1.2)
				portalPart.Position = origin + Vector3.new(xPos, 4.4, 14)
				portalPart.Color = if style then style.accent else Color3.fromRGB(46, 134, 168)
				portalPart.Material = Enum.Material.Neon
				portalPart:SetAttribute("Country", locDef.countryId)
				portalPart:SetAttribute("SourceLocation", locationId)
				portalPart:SetAttribute("TargetLocation", targetId)
				portalPart.Parent = plazaFolder

				makeSign(
					plazaFolder,
					portalPart,
					"Travel to " .. targetTitle,
					locDef.countryId .. " Regional Route",
					Color3.fromRGB(235, 190, 80),
					5.5
				)

				local prompt = Instance.new("ProximityPrompt")
				prompt.Name = "TravelTo_" .. targetId .. "_Prompt"
				prompt.ActionText = "Travel to " .. targetTitle
				prompt.ObjectText = targetTitle .. " (" .. locDef.countryId .. ")"
				prompt.HoldDuration = 0
				prompt.MaxActivationDistance = 14
				prompt.RequiresLineOfSight = false
				prompt.Parent = portalPart
				prompt.Triggered:Connect(function(player: Player)
					if callbacks and callbacks.travelToLocation then
						callbacks.travelToLocation(player, targetId)
					end
				end)
			end
		end
	end
end

-- Builds a complete standalone destination folder for regional scenes (Alexandria, Aswan, Erbil, Basra, Seoul, Busan, Paris, Marseille)
-- and the 6 global catalog destinations (Rhine, Wuling, Tohoku, Svetloyar, Kyiv, Marrakesh).
function RegionalTerrainBuilder.buildRegionalScene(
	mapFolder: Instance,
	locationId: string,
	callbacks: Callbacks?
): Folder?
	local locDef = WorldRegistry.getLocation(locationId)
	local rec = TerrainData.getRecord(locationId)
	if not locDef or not rec then
		return nil
	end

	local existing = mapFolder:FindFirstChild("Region_" .. locationId)
	if existing then
		existing:Destroy()
	end

	local origin = locDef.origin
	local style = BIOME_STYLE[rec.biome] or BIOME_STYLE.mediterranean_coastal_ridge

	local folder = Instance.new("Folder")
	folder.Name = "Region_" .. locationId
	folder:SetAttribute("Country", locDef.countryId)
	folder:SetAttribute("LocationId", locationId)
	folder:SetAttribute("LocationType", locDef.locationType)
	folder:SetAttribute("GeographicSetting", rec.geographicSetting)
	folder:SetAttribute("DEMSourceId", rec.sourceId)
	folder:SetAttribute("CRS", rec.coordinateReferenceSystem)
	folder:SetAttribute("ElevationMinMeters", rec.elevationStatsMeters.min)
	folder:SetAttribute("ElevationMaxMeters", rec.elevationStatsMeters.max)
	if rec.literaryNote then
		folder:SetAttribute("LiteraryNote", rec.literaryNote)
	end
	folder.Parent = mapFolder

	-- 1. Central Walkable Arrival Terrace
	local terrace = Instance.new("Part")
	terrace.Name = "ArrivalTerrace_" .. locationId
	terrace.Anchored = true
	terrace.CanCollide = true
	terrace.Size = Vector3.new(96, 3, 96)
	terrace.Position = origin - Vector3.new(0, 1.5, 0)
	terrace.Color = style.ground
	terrace.Material = style.groundMat
	terrace.TopSurface = Enum.SurfaceType.Smooth
	terrace.BottomSurface = Enum.SurfaceType.Smooth
	terrace.Parent = folder

	-- 2. DEM-Derived Surrounding Topographic Relief Grid & Voxel Terrain
	GeoTerrainBuilder.buildLocationTerrain(locDef.countryId, locDef.locationId, origin, folder)
	TerrainPipeline.buildLocationRelief(folder, locationId, origin, 220, 190, 48)

	-- 3. Hydrological Alignment (River / Sea / Lake / Oasis Channel)
	local waterFeaturePart = Instance.new("Part")
	waterFeaturePart.Name = "WaterFeature_" .. locationId
	waterFeaturePart.Anchored = true
	waterFeaturePart.CanCollide = false
	waterFeaturePart.Transparency = 0.2
	waterFeaturePart.Size = if rec.waterType == "enclosed_kettle_lake"
		then Vector3.new(84, 3.5, 64)
		else Vector3.new(210, 3.5, 36)
	waterFeaturePart.Position = origin + Vector3.new(0, -1.2, -58)
	waterFeaturePart.Color = style.water
	waterFeaturePart.Material = Enum.Material.Water
	waterFeaturePart.Parent = folder

	-- 4. Cultural & Geographic Landmark Pavilion / Overlook with Provenance Plaque
	local landmark = Instance.new("Part")
	landmark.Name = "GeographicLandmark_" .. locationId
	landmark.Anchored = true
	landmark.CanCollide = true
	landmark.Size = Vector3.new(22, 12, 14)
	landmark.Position = origin + Vector3.new(0, 6, -18)
	landmark.Color = style.ground
	landmark.Material = style.groundMat
	landmark.Parent = folder

	makeSign(folder, landmark, style.landmarkTitle, style.landmarkSub, style.accent, 8.5)

	if rec.literaryNote then
		local plaque = Instance.new("Part")
		plaque.Name = "ProvenancePlaque_" .. locationId
		plaque.Anchored = true
		plaque.CanCollide = true
		plaque.Size = Vector3.new(8, 5, 1.2)
		plaque.Position = origin + Vector3.new(-16, 2.5, -4)
		plaque.Color = style.accent
		plaque.Material = Enum.Material.SmoothPlastic
		plaque.Parent = folder
		makeSign(
			folder,
			plaque,
			"Geographic & Literary Provenance",
			rec.literaryNote,
			Color3.fromRGB(245, 210, 90),
			4.5
		)
	end

	-- 5. Regional Vegetation Cluster (4 biome-matched trees)
	for _, treeOffset in ipairs({
		Vector3.new(-36, 0, -24),
		Vector3.new(36, 0, -24),
		Vector3.new(-38, 0, 22),
		Vector3.new(38, 0, 22),
	}) do
		local trunk = Instance.new("Part")
		trunk.Name = "BiomeTreeTrunk"
		trunk.Anchored = true
		trunk.CanCollide = true
		trunk.Size = Vector3.new(2, 10, 2)
		trunk.Position = origin + treeOffset + Vector3.new(0, 5, 0)
		trunk.Color = Color3.fromRGB(108, 72, 42)
		trunk.Material = Enum.Material.Wood
		trunk.Parent = folder

		local canopy = Instance.new("Part")
		canopy.Name = "BiomeTreeCanopy"
		canopy.Anchored = true
		canopy.CanCollide = false
		canopy.Size = Vector3.new(12, 5, 12)
		canopy.Position = origin + treeOffset + Vector3.new(0, 11, 0)
		canopy.Color = style.treeLeaf
		canopy.Material = Enum.Material.Grass
		canopy.Parent = folder
	end

	-- 6. Spawn Part (`Spawn_<locationId>` and backward-compatible `Spawn_<CC>` if default location for DE..MA)
	local spawnPart = Instance.new("Part")
	spawnPart.Name = "Spawn_" .. locationId
	spawnPart.Anchored = true
	spawnPart.CanCollide = true
	spawnPart.Size = Vector3.new(8, 1, 8)
	spawnPart.Position = locDef.spawn
	spawnPart.Color = style.accent
	spawnPart.Material = Enum.Material.SmoothPlastic
	spawnPart.TopSurface = Enum.SurfaceType.Smooth
	spawnPart.BottomSurface = Enum.SurfaceType.Smooth
	spawnPart:SetAttribute("Country", locDef.countryId)
	spawnPart:SetAttribute("LocationId", locationId)
	spawnPart.Parent = folder

	if WorldRegistry.defaultLocationId(locDef.countryId) == locationId then
		local ccSpawn = spawnPart:Clone()
		ccSpawn.Name = "Spawn_" .. locDef.countryId
		ccSpawn.Parent = folder

		local mentorAnchor = Instance.new("Part")
		mentorAnchor.Name = "Mentor_" .. locDef.countryId
		mentorAnchor.Anchored = true
		mentorAnchor.CanCollide = true
		mentorAnchor.Size = Vector3.new(4, 6, 4)
		mentorAnchor.Position = origin + Vector3.new(-18, 3, -12)
		mentorAnchor.Color = style.accent
		mentorAnchor.Material = Enum.Material.SmoothPlastic
		mentorAnchor:SetAttribute("Country", locDef.countryId)
		mentorAnchor.Parent = folder

		local buildOrigin = Instance.new("Part")
		buildOrigin.Name = "BuildOrigin_" .. locDef.countryId
		buildOrigin.Anchored = true
		buildOrigin.CanCollide = true
		buildOrigin.Size = Vector3.new(4, 1, 4)
		buildOrigin.Position = origin + Vector3.new(12, 0.5, -12)
		buildOrigin.Color = style.accent
		buildOrigin.Material = Enum.Material.SmoothPlastic
		buildOrigin:SetAttribute("Country", locDef.countryId)
		buildOrigin.Parent = folder
	end

	-- 7. Travel Portals in front of arrival camera (Z = 10 < 28)
	local connIdx = 0
	for _, targetId in ipairs(locDef.travelConnections) do
		if targetId == "LOBBY" then
			local returnPortal = Instance.new("Part")
			returnPortal.Name = "ReturnLobby_" .. locationId
			returnPortal.Anchored = true
			returnPortal.CanCollide = true
			returnPortal.Size = Vector3.new(4.8, 7.6, 1.2)
			returnPortal.Position = origin + Vector3.new(0, 4.4, 8)
			returnPortal.Color = Color3.fromRGB(235, 190, 80)
			returnPortal.Material = Enum.Material.Neon
			returnPortal:SetAttribute("Country", locDef.countryId)
			returnPortal:SetAttribute("SourceLocation", locationId)
			returnPortal:SetAttribute("TargetLocation", "LOBBY")
			returnPortal.Parent = folder

			makeSign(folder, returnPortal, "Return to Travel Lobby", "MiraVerse Hub", Color3.fromRGB(235, 190, 80), 5.5)

			local returnPrompt = Instance.new("ProximityPrompt")
			returnPrompt.Name = "ReturnToLobbyPrompt"
			returnPrompt.ActionText = "Return to Travel Lobby"
			returnPrompt.ObjectText = "MiraVerse Lobby"
			returnPrompt.HoldDuration = 0
			returnPrompt.MaxActivationDistance = 14
			returnPrompt.RequiresLineOfSight = false
			returnPrompt.Parent = returnPortal
			returnPrompt.Triggered:Connect(function(player: Player)
				if callbacks and callbacks.returnToLobby then
					callbacks.returnToLobby(player)
				end
			end)
		else
			connIdx += 1
			local targetLoc = WorldRegistry.getLocation(targetId)
			local targetTitle = if targetLoc then targetLoc.displayName else targetId
			local xOffset = if connIdx == 1 then -24 else 24
			local portalPart = Instance.new("Part")
			portalPart.Name = string.format("Portal_%s_to_%s", locationId, targetId)
			portalPart.Anchored = true
			portalPart.CanCollide = true
			portalPart.Size = Vector3.new(4.8, 7.6, 1.2)
			portalPart.Position = origin + Vector3.new(xOffset, 4.4, 10)
			portalPart.Color = style.accent
			portalPart.Material = Enum.Material.Neon
			portalPart:SetAttribute("Country", locDef.countryId)
			portalPart:SetAttribute("SourceLocation", locationId)
			portalPart:SetAttribute("TargetLocation", targetId)
			portalPart.Parent = folder

			makeSign(folder, portalPart, "Travel to " .. targetTitle, locDef.countryId .. " Route", style.accent, 5.5)

			local prompt = Instance.new("ProximityPrompt")
			prompt.Name = "TravelTo_" .. targetId .. "_Prompt"
			prompt.ActionText = "Travel to " .. targetTitle
			prompt.ObjectText = targetTitle .. " (" .. locDef.countryId .. ")"
			prompt.HoldDuration = 0
			prompt.MaxActivationDistance = 14
			prompt.RequiresLineOfSight = false
			prompt.Parent = portalPart
			prompt.Triggered:Connect(function(player: Player)
				if callbacks and callbacks.travelToLocation then
					callbacks.travelToLocation(player, targetId)
				end
			end)
		end
	end

	return folder
end

return RegionalTerrainBuilder
