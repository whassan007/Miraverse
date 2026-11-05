--!nonstrict
-- Builds a compiled Phoenicia region. One layout unit is three studs, and unit y
-- covers studs [3y, 3y + 3), so a player standing on unit y + 1 has feet at 3(y + 1).

local WorldBuilder = {}

-- Terrain voxels are 4 studs, so land rows overlap slightly to avoid gaps.
local ROW_THICKNESS = 4
local SEABED_THICKNESS = 4

function WorldBuilder.unitToWorld(content, regionId: string, x: number, y: number, z: number): Vector3
	local origin = content.regions[regionId].origins.roblox
	local s = content.projection.robloxStudsPerUnit
	return Vector3.new(origin[1] + x * s, y * s, origin[2] + z * s)
end

local function addBox(content, regionId: string, box, parent)
	local s = content.projection.robloxStudsPerUnit
	local part = Instance.new("Part")
	part.Name = box.id
	part.Anchored = true
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth
	part.Size = Vector3.new(
		(box.max[1] - box.min[1] + 1) * s,
		(box.max[2] - box.min[2] + 1) * s,
		(box.max[3] - box.min[3] + 1) * s
	)
	local center = WorldBuilder.unitToWorld(
		content,
		regionId,
		(box.min[1] + box.max[1] + 1) / 2,
		(box.min[2] + box.max[2] + 1) / 2,
		(box.min[3] + box.max[3] + 1) / 2
	)
	part.CFrame = CFrame.new(center)
	local material = content.materials[box.material].roblox
	part.Color = Color3.fromRGB(material.color[1], material.color[2], material.color[3])
	part.Material = Enum.Material[material.material]
	part.Parent = parent
	return part
end

local function buildTerrain(content, regionId: string, terrain)
	local region = content.regions[regionId]
	local p = content.projection
	local s = p.robloxStudsPerUnit
	local origin = region.origins.roblox
	local span = (region.bounds * 2 + 1) * s
	local center = Vector3.new(origin[1], 0, origin[2])
	local seabedTop = p.seabedY * s
	local seaTop = (p.seaLevelY + 1) * s

	terrain:FillBlock(
		CFrame.new(center + Vector3.new(0, seabedTop - SEABED_THICKNESS / 2, 0)),
		Vector3.new(span, SEABED_THICKNESS, span),
		Enum.Material.Sand
	)
	terrain:FillBlock(
		CFrame.new(center + Vector3.new(0, (seabedTop + seaTop) / 2, 0)),
		Vector3.new(span, seaTop - seabedTop, span),
		Enum.Material.Water
	)
	for _, row in region.landRows do
		local landTop = (row.y + 1) * s
		for _, spanRow in row.spans do
			local width = (spanRow[2] - spanRow[1] + 1) * s
			local x = origin[1] + (spanRow[1] + spanRow[2] + 1) / 2 * s
			local z = origin[2] + (row.z + 0.5) * s
			terrain:FillBlock(
				CFrame.new(x, (seabedTop + landTop) / 2, z),
				Vector3.new(width, landTop - seabedTop, ROW_THICKNESS),
				Enum.Material.Limestone
			)
		end
	end
end

-- Returns the region's folder. Boxes in the "ship" group form a movable Model.
function WorldBuilder.build(content, regionId: string, terrain, parent)
	buildTerrain(content, regionId, terrain)

	local folder = Instance.new("Folder")
	folder.Name = "Phoenicia_" .. regionId
	local ship = Instance.new("Model")
	ship.Name = "Ship"
	ship.Parent = folder

	for _, box in content.regions[regionId].boxes do
		addBox(content, regionId, box, box.group == "ship" and ship or folder)
	end
	folder.Parent = parent
	return folder
end

return WorldBuilder
