--!strict
-- TerrainPipeline.luau (CODEX-01)
-- Shared GIS-to-Roblox Topographic Pipeline Contract & Deterministic Terrain Generator.
-- Supports:
--   1. Source-derived DEM heightmaps & 16x16 resampled terrain grids (Copernicus GLO-30 / Mapzen Terrain Tiles)
--   2. Metric coordinate transformations (EPSG:4326 -> local UTM metric tangent -> Roblox studs)
--   3. Material masks (Water, Sand, Sandstone, Limestone, Slate, Rock, Grass, LeafyGrass)
--   4. Three geographic detail levels:
--      - Level 1: Country overview (national/regional context)
--      - Level 2: Regional terrain (mountains, valleys, coasts, lakes, rivers)
--      - Level 3: Playable town (high-detail terrain supporting roads, quests, NPCs)
--   5. Separation of source-derived elevation from the Gameplay Adaptation Layer (plaza/spawn flattening)

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TerrainData = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("TerrainData"))

local TerrainPipeline = {}

export type DetailLevel = 1 | 2 | 3

export type GameCoordinateMapping = {
	locationId: string,
	countryId: string,
	crs: string,
	origin: Vector3,
	footprintStuds: Vector2,
	horizontalScaleMetersPerStud: number,
	verticalExaggeration: number,
	baseGameY: number,
	maxReliefStuds: number,
}

local MATERIAL_MAP: { [string]: Enum.Material } = {
	Water = Enum.Material.Water,
	Sand = Enum.Material.Sand,
	Sandstone = Enum.Material.Sandstone,
	Limestone = Enum.Material.Limestone,
	Slate = Enum.Material.Slate,
	Rock = Enum.Material.Rock,
	Grass = Enum.Material.Grass,
	LeafyGrass = Enum.Material.LeafyGrass,
}

local COLOR_MAP: { [string]: Color3 } = {
	Water = Color3.fromRGB(38, 114, 184),
	Sand = Color3.fromRGB(224, 204, 152),
	Sandstone = Color3.fromRGB(204, 166, 118),
	Limestone = Color3.fromRGB(222, 212, 186),
	Slate = Color3.fromRGB(126, 134, 144),
	Rock = Color3.fromRGB(142, 136, 128),
	Grass = Color3.fromRGB(78, 146, 76),
	LeafyGrass = Color3.fromRGB(62, 122, 64),
}

function TerrainPipeline.getRecord(locationId: string): TerrainData.TerrainRecord?
	return TerrainData.getRecord(locationId)
end

-- Converts normalized (u, v) in [0, 1] x [0, 1] (where u = West->East, v = North->South)
-- to local Roblox stud offset relative to location origin.
function TerrainPipeline.uvToLocalStuds(
	locationId: string,
	u: number,
	v: number,
	footprintX: number,
	footprintZ: number,
	applyGameplayAdaptation: boolean?
): Vector3
	local rec = TerrainData.getRecord(locationId)
	if not rec then
		return Vector3.new((u - 0.5) * footprintX, 0, (v - 0.5) * footprintZ)
	end
	local grid = rec.grid16GameStudsY
	local n = rec.gridSize
	local r = math.clamp(math.floor(v * (n - 1)) + 1, 1, n)
	local c = math.clamp(math.floor(u * (n - 1)) + 1, 1, n)
	local rawY = grid[r][c] - rec.baseGameY
	local x = (u - 0.5) * footprintX
	local z = (v - 0.5) * footprintZ

	-- Gameplay Adaptation Layer: keep central arrival/spawn/station plaza walkable while preserving surrounding relief
	if applyGameplayAdaptation then
		local distFromSpawnZone = math.sqrt((x * x) + ((z - 12) * (z - 12)))
		if distFromSpawnZone < 52 then
			local blend = math.clamp((distFromSpawnZone - 28) / 24, 0, 1)
			rawY = rawY * blend
		end
	end

	return Vector3.new(x, rawY, z)
end

-- Converts geographic (lat, lon) within a location's bounding box into world Vector3 in Roblox studs.
function TerrainPipeline.latLonToWorldStuds(
	locationId: string,
	origin: Vector3,
	lat: number,
	lon: number,
	footprintX: number,
	footprintZ: number
): Vector3?
	local rec = TerrainData.getRecord(locationId)
	if not rec then
		return nil
	end
	local bb = rec.boundingBox
	local u = math.clamp((lon - bb.minLon) / math.max(1e-6, bb.maxLon - bb.minLon), 0, 1)
	local v = math.clamp((bb.maxLat - lat) / math.max(1e-6, bb.maxLat - bb.minLat), 0, 1)
	local offset = TerrainPipeline.uvToLocalStuds(locationId, u, v, footprintX, footprintZ, false)
	return origin + offset
end

-- Builds deterministic DEM-derived terrain cells around a location's origin without overlapping the central walkable gameplay pad.
function TerrainPipeline.buildLocationRelief(
	parent: Instance,
	locationId: string,
	origin: Vector3,
	footprintX: number,
	footprintZ: number,
	clearRadiusStuds: number
): Model?
	local rec = TerrainData.getRecord(locationId)
	if not rec then
		return nil
	end

	local existing = parent:FindFirstChild("DEMTerrain_" .. locationId)
	if existing then
		existing:Destroy()
	end

	local container = Instance.new("Model")
	container.Name = "DEMTerrain_" .. locationId
	container:SetAttribute("SourceId", rec.sourceId)
	container:SetAttribute("Dataset", rec.dataset)
	container:SetAttribute("CRS", rec.coordinateReferenceSystem)
	container:SetAttribute("VerticalDatum", rec.verticalDatum)
	container:SetAttribute("Checksum", rec.checksum)
	container:SetAttribute("GeographicSetting", rec.geographicSetting)
	container:SetAttribute("DetailLevel", rec.detailLevel)
	container:SetAttribute("WaterFeature", rec.waterFeature)
	if rec.literaryNote then
		container:SetAttribute("LiteraryNote", rec.literaryNote)
	end
	container.Parent = parent

	-- Sample 8x8 macro-cells from the 16x16 DEM grid to stay strictly within mobile part & streaming budgets
	local step = 2
	local cells = 8
	local cellW = footprintX / cells
	local cellD = footprintZ / cells

	for r = 1, cells do
		for c = 1, cells do
			local gr = (r - 1) * step + 1
			local gc = (c - 1) * step + 1
			local u = (c - 0.5) / cells
			local v = (r - 0.5) / cells
			local localX = (u - 0.5) * footprintX
			local localZ = (v - 0.5) * footprintZ

			-- Keep the central spawn/plaza clear so gameplay stations, portals and mentors remain unobstructed
			local dist = math.sqrt(localX * localX + localZ * localZ)
			if dist >= clearRadiusStuds then
				local studY = rec.grid16GameStudsY[gr][gc] - rec.baseGameY
				local matName = rec.grid16Materials[gr][gc]
				local mat = MATERIAL_MAP[matName] or Enum.Material.Limestone
				local col = COLOR_MAP[matName] or Color3.fromRGB(190, 180, 160)

				local thickness = math.max(3, math.abs(studY) + 4)
				local partY = origin.Y + studY - (thickness * 0.5) - 1.5
				if matName == "Water" then
					thickness = 3
					partY = origin.Y - 3.2
				end

				local cellPart = Instance.new("Part")
				cellPart.Name = string.format("DEMCell_%d_%d_%s", r, c, matName)
				cellPart.Anchored = true
				cellPart.CanCollide = matName ~= "Water"
				cellPart.Transparency = if matName == "Water" then 0.22 else 0
				cellPart.Size = Vector3.new(cellW + 0.5, thickness, cellD + 0.5)
				cellPart.Position = Vector3.new(origin.X + localX, partY, origin.Z + localZ)
				cellPart.Color = col
				cellPart.Material = mat
				cellPart.TopSurface = Enum.SurfaceType.Smooth
				cellPart.BottomSurface = Enum.SurfaceType.Smooth
				cellPart.Parent = container
			end
		end
	end

	return container
end

return TerrainPipeline
