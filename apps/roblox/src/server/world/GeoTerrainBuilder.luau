--!strict
-- Shared GIS-to-Roblox Voxel Terrain Synthesizer (`GeoTerrainBuilder.luau`).
-- Reconstructs smooth, chunked Roblox Terrain from Copernicus GLO-30 DEM / Mapzen elevation grids
-- produced by `tools/geo/pipeline.py` (`ReplicatedStorage.Shared.GeoTerrainData.<CC>`).
-- Separates:
--   1. Real topographic elevation & water masks (`rawDemGrid`, `elevationGrid`, `waterGrid`)
--   2. Regional biome materials (`materialGrid`)
--   3. Safe 4-stud voxel alignment for mobile performance and streaming.
local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local GeoTerrainBuilder = {}

-- Material code lookup matching tools/geo/pipeline.py
local MATERIAL_BY_CODE: { [number]: Enum.Material } = {
	[1] = Enum.Material.Grass,
	[2] = Enum.Material.Ground,
	[3] = Enum.Material.Rock,
	[4] = Enum.Material.Limestone,
	[5] = Enum.Material.Sand,
	[6] = Enum.Material.Sandstone,
	[7] = Enum.Material.Slate,
	[8] = Enum.Material.LeafyGrass,
	[9] = Enum.Material.Mud,
	[10] = Enum.Material.Snow,
}

export type LocationGeoRecord = {
	locationId: string,
	countryId: string,
	displayName: string,
	locationType: string,
	geographicClass: string,
	sourceDataset: string,
	sourceTile: string,
	sourceCRS: string,
	targetCRS: string,
	sourceBbox: { number },
	sourceElevationRangeM: { number },
	robloxYRangeStuds: { number },
	waterSurfaceY: number,
	horizontalExtentStuds: { number },
	verticalExaggeration: number,
	gridRows: number,
	gridCols: number,
	elevationGrid: { { number } },
	rawDemGrid: { { number } },
	materialGrid: { { number } },
	waterGrid: { { number } },
}

local loadedCountries: { [string]: any } = {}

local function getCountryModule(countryId: string): any
	local upper = string.upper(countryId)
	if loadedCountries[upper] ~= nil then
		return loadedCountries[upper]
	end
	local shared = ReplicatedStorage:FindFirstChild("Shared")
	local geoFolder = shared and shared:FindFirstChild("GeoTerrainData")
	local mod = geoFolder and geoFolder:FindFirstChild(upper)
	if mod and mod:IsA("ModuleScript") then
		local ok, data = pcall(require, mod)
		if ok and type(data) == "table" then
			loadedCountries[upper] = data
			return data
		end
	end
	return nil
end

function GeoTerrainBuilder.getLocationRecord(countryId: string, locationId: string): LocationGeoRecord?
	local countryData = getCountryModule(countryId)
	if not countryData or type(countryData.locations) ~= "table" then
		return nil
	end
	local lower = string.lower(locationId)
	local aliases: { [string]: string } = {
		tohoku_waystation = "tohoku_route",
		marrakesh_atlas = "marrakesh",
	}
	local key = aliases[lower] or lower
	return countryData.locations[key] or countryData.locations[locationId]
end

-- Snap coordinate or size to Roblox's 4-stud terrain voxel grid.
local function snap4(v: number): number
	return math.max(4, math.floor((v + 2) / 4) * 4)
end

-- Build real DEM-backed voxel terrain around `origin` for `(countryId, locationId)`.
-- Attach metadata attributes onto `targetContainer` so Studio and automated tests can inspect provenance.
function GeoTerrainBuilder.buildLocationTerrain(
	countryId: string,
	locationId: string,
	origin: Vector3,
	targetContainer: Instance?
): boolean
	local rec = GeoTerrainBuilder.getLocationRecord(countryId, locationId)
	if not rec then
		return false
	end

	if targetContainer then
		targetContainer:SetAttribute("GeoDataset", rec.sourceDataset)
		targetContainer:SetAttribute("GeoTile", rec.sourceTile)
		targetContainer:SetAttribute("GeoSourceCRS", rec.sourceCRS)
		targetContainer:SetAttribute("GeoTargetCRS", rec.targetCRS)
		targetContainer:SetAttribute("GeoClass", rec.geographicClass)
		targetContainer:SetAttribute("GeoMinElevM", rec.sourceElevationRangeM[1])
		targetContainer:SetAttribute("GeoMaxElevM", rec.sourceElevationRangeM[2])
		targetContainer:SetAttribute("GeoVerticalExaggeration", rec.verticalExaggeration)
	end

	local terrain = Workspace.Terrain
	local rows = rec.gridRows
	local cols = rec.gridCols
	local widthStuds = rec.horizontalExtentStuds[1]
	local depthStuds = rec.horizontalExtentStuds[2]
	local cellW = widthStuds / cols
	local cellD = depthStuds / rows
	local fillW = snap4(cellW + 2)
	local fillD = snap4(cellD + 2)
	local baseBottomY = math.min(origin.Y - 18, rec.robloxYRangeStuds[1] - 12)
	local waterSurfaceY = rec.waterSurfaceY

	for r = 1, rows do
		local elevRow = rec.elevationGrid[r]
		local matRow = rec.materialGrid[r]
		local waterRow = rec.waterGrid[r]
		if elevRow and matRow and waterRow then
			-- Row 1 is North (-Z), Row `rows` is South (+Z)
			local localZ = ((r - 0.5) / rows - 0.5) * depthStuds
			local worldZ = origin.Z + localZ
			for c = 1, cols do
				local localX = ((c - 0.5) / cols - 0.5) * widthStuds
				local worldX = origin.X + localX
				local surfaceY = elevRow[c] or origin.Y
				local matCode = matRow[c] or 1
				local isWater = (waterRow[c] or 0) == 1
				local mat = MATERIAL_BY_CODE[matCode] or Enum.Material.Grass

				local colHeight = math.max(6, surfaceY - baseBottomY)
				local colCenterY = baseBottomY + colHeight * 0.5
				terrain:FillBlock(
					CFrame.new(worldX, colCenterY, worldZ),
					Vector3.new(fillW, colHeight, fillD),
					mat
				)

				if isWater and waterSurfaceY > surfaceY then
					local waterHeight = math.max(4, waterSurfaceY - surfaceY)
					local waterCenterY = surfaceY + waterHeight * 0.5
					terrain:FillBlock(
						CFrame.new(worldX, waterCenterY, worldZ),
						Vector3.new(fillW, waterHeight, fillD),
						Enum.Material.Water
					)
				end
			end
		end
	end

	return true
end

return GeoTerrainBuilder
