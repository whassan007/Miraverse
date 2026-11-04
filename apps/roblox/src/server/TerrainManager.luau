--!strict
-- Shared GIS-to-Roblox Terrain Manager
-- Converts real-world Copernicus DEM GLO-30 & Mapzen elevation profiles into Roblox Terrain.
-- Respects level-of-detail, memory budgets, and plaza gameplay bounds.

local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ReplicatedStorageShared = ReplicatedStorage:WaitForChild("Shared")
local WorldRegistry = require(ReplicatedStorageShared:WaitForChild("WorldRegistry"))
local TerrainData = require(ReplicatedStorageShared:WaitForChild("TerrainData"))

local TerrainManager = {}

local MATERIAL_MAP: { [string]: Enum.Material } = {
	Sand = Enum.Material.Sand,
	Sandstone = Enum.Material.Sandstone,
	Limestone = Enum.Material.Limestone,
	Cobblestone = Enum.Material.Cobblestone,
	Rock = Enum.Material.Rock,
	Basalt = Enum.Material.Basalt,
	Granite = Enum.Material.Granite,
	Slate = Enum.Material.Slate,
	Mud = Enum.Material.Mud,
	Grass = Enum.Material.Grass,
	Water = Enum.Material.Water,
	Brick = Enum.Material.Brick,
}

local function resolveMaterial(name: string, fallback: Enum.Material): Enum.Material
	return MATERIAL_MAP[name] or fallback
end

-- Builds GIS terrain for a specific destination
function TerrainManager.buildDestinationTerrain(parentFolder: Folder, destId: string, origin: Vector3): Folder?
	local terrainDef = TerrainData.get(destId)
	if not terrainDef then
		return nil
	end

	local terrain = Workspace.Terrain
	local destFolder = Instance.new("Folder")
	destFolder.Name = "GisTerrain_" .. destId
	destFolder:SetAttribute("DestinationId", destId)
	destFolder:SetAttribute("MinElevation", terrainDef.minElevation)
	destFolder:SetAttribute("MaxElevation", terrainDef.maxElevation)
	destFolder:SetAttribute("Relief", terrainDef.relief)
	destFolder.Parent = parentFolder

	local groundMat = resolveMaterial(terrainDef.groundMaterial, Enum.Material.Sand)
	local rockMat = resolveMaterial(terrainDef.rockMaterial, Enum.Material.Rock)
	local vegMat = resolveMaterial(terrainDef.vegetationMaterial, Enum.Material.Grass)

	local gridSize = terrainDef.gridSize
	local step = 16 -- 16 studs per cell -> 32 * 16 = 512 studs across destination
	local halfExtent = (gridSize * step) / 2

	-- Plazas occupy a 48-stud radius around origin. Keep that area flat and walkable.
	local PLAZA_PROTECT_RADIUS_SQ = 52 * 52

	for zIdx = 1, gridSize do
		local zOffset = -halfExtent + (zIdx - 1) * step + (step / 2)
		local zWorld = origin.Z + zOffset

		for xIdx = 1, gridSize do
			local xOffset = -halfExtent + (xIdx - 1) * step + (step / 2)
			local xWorld = origin.X + xOffset

			local distSq = xOffset * xOffset + zOffset * zOffset
			local heightVal = terrainDef.heights[zIdx][xIdx]
			local isWater = terrainDef.waterMask[zIdx][xIdx]

			-- Smooth attenuation near central plaza
			local blendFactor = 1.0
			if distSq < PLAZA_PROTECT_RADIUS_SQ then
				blendFactor = 0.0
			elseif distSq < (PLAZA_PROTECT_RADIUS_SQ * 2.25) then
				local dist = math.sqrt(distSq)
				blendFactor = (dist - 52) / (78 - 52)
			end

			local targetHeight = origin.Y + (heightVal * blendFactor)
			local baseHeight = origin.Y - 6

			if isWater and blendFactor > 0.5 then
				-- Render water body
				local waterTop = origin.Y - 1
				if waterTop > baseHeight then
					local waterSize = Vector3.new(step, waterTop - baseHeight, step)
					local waterCenter = Vector3.new(xWorld, (waterTop + baseHeight) / 2, zWorld)
					pcall(function()
						terrain:FillBlock(CFrame.new(waterCenter), waterSize, Enum.Material.Water)
					end)
				end
			else
				-- Render solid terrain column
				local columnHeight = math.max(4, targetHeight - baseHeight)
				local columnCenter = Vector3.new(xWorld, baseHeight + columnHeight / 2, zWorld)
				local columnSize = Vector3.new(step, columnHeight, step)

				-- Select surface material: steep / high slopes get rock, moderate get ground/veg
				local chosenMat = groundMat
				if heightVal > 25 then
					chosenMat = rockMat
				elseif heightVal > 8 then
					chosenMat = vegMat
				end

				pcall(function()
					terrain:FillBlock(CFrame.new(columnCenter), columnSize, chosenMat)
				end)
			end
		end
	end

	return destFolder
end

-- Builds all destinations for a country
function TerrainManager.buildCountryTerrain(parentFolder: Folder, countryCode: string): Folder
	local countryFolder = Instance.new("Folder")
	countryFolder.Name = "Terrain_" .. countryCode
	countryFolder.Parent = parentFolder

	local locs = WorldRegistry.LOCATIONS[countryCode]
	if locs then
		for _, loc in locs do
			local origin = WorldRegistry.destinationOrigin(countryCode, loc.id)
			if origin then
				TerrainManager.buildDestinationTerrain(countryFolder, loc.terrainDestId, origin)
			end
		end
	end

	return countryFolder
end

return TerrainManager
