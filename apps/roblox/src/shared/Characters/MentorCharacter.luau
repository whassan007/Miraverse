--!nonstrict
-- Stylized characters built from rounded parts, with no external assets, so they need
-- no network and stay cheap on phones. Interaction stays on a separate invisible part,
-- so these parts ignore clicks, touches and collisions.
local MentorCharacter = {}

local SKIN = Color3.fromRGB(214, 170, 134)
local GREY_HAIR = Color3.fromRGB(205, 205, 210)
local DARK_HAIR = Color3.fromRGB(58, 42, 34)
local FEATURE = Color3.fromRGB(60, 42, 38)
local SHOE = Color3.fromRGB(70, 52, 44)
local APRON = Color3.fromRGB(245, 238, 222)

local UPRIGHT = CFrame.Angles(0, 0, math.rad(90))

local STYLES = {
	grandmother = { hair = GREY_HAIR, bun = true, apron = true, skirt = true },
	woman = { hair = DARK_HAIR, bun = false, apron = false, skirt = true },
	elder = { hair = GREY_HAIR, bun = false, apron = false, skirt = false },
}

-- base is the point between the feet; the character faces its -Z direction.
function MentorCharacter.build(name: string, base: CFrame, dressColor: Color3, trimColor: Color3, parent: Instance, styleName: string?)
	local style = STYLES[styleName or "grandmother"] or STYLES.grandmother
	local model = Instance.new("Model")
	model.Name = name

	local function add(partName, shape, size, offset, color, material)
		local part = Instance.new("Part")
		part.Name = partName
		part.Shape = shape
		part.Size = size
		part.CFrame = base * offset
		part.Color = color
		part.Material = material or Enum.Material.SmoothPlastic
		part.Anchored = true
		part.CanCollide = false
		part.CanQuery = false
		part.CanTouch = false
		part.TopSurface = Enum.SurfaceType.Smooth
		part.BottomSurface = Enum.SurfaceType.Smooth
		part.Parent = model
		return part
	end
	local function ball(partName, diameter, x, y, z, color)
		return add(partName, Enum.PartType.Ball, Vector3.new(diameter, diameter, diameter), CFrame.new(x, y, z), color)
	end
	local function column(partName, height, diameter, x, y, z, color)
		return add(
			partName,
			Enum.PartType.Cylinder,
			Vector3.new(height, diameter, diameter),
			CFrame.new(x, y, z) * UPRIGHT,
			color,
			Enum.Material.Fabric
		)
	end
	local function panel(partName, width, height, x, y, z, color)
		return add(partName, Enum.PartType.Block, Vector3.new(width, height, 0.12), CFrame.new(x, y, z), color, Enum.Material.Fabric)
	end

	ball("ShoeLeft", 0.7, -0.5, 0.25, -1.05, SHOE)
	ball("ShoeRight", 0.7, 0.5, 0.25, -1.05, SHOE)
	if style.skirt then
		column("Skirt", 2.6, 2.6, 0, 1.4, 0, dressColor)
		column("Hem", 0.28, 2.75, 0, 0.3, 0, trimColor)
	else
		column("LegLeft", 2.6, 0.95, -0.5, 1.4, 0, trimColor)
		column("LegRight", 2.6, 0.95, 0.5, 1.4, 0, trimColor)
	end
	column("Torso", 1.7, 1.9, 0, 3.5, 0, dressColor)

	if style.apron then
		panel("Apron", 1.5, 2.3, 0, 1.75, -1.32, APRON)
		panel("ApronBib", 1, 1, 0, 3.45, -0.98, APRON)
		column("ApronBand", 0.22, 2.02, 0, 2.85, 0, APRON)
	end

	ball("ShoulderLeft", 0.65, -1.05, 4.1, 0, dressColor)
	ball("ShoulderRight", 0.65, 1.05, 4.1, 0, dressColor)
	column("ArmLeft", 1.6, 0.55, -1.15, 3.3, 0, dressColor)
	column("ArmRight", 1.6, 0.55, 1.15, 3.3, 0, dressColor)
	ball("HandLeft", 0.55, -1.15, 2.4, 0, SKIN)
	ball("HandRight", 0.55, 1.15, 2.4, 0, SKIN)

	column("Neck", 0.4, 0.6, 0, 4.4, 0, SKIN)
	ball("Head", 1.55, 0, 5.05, 0, SKIN)
	ball("Hair", 1.62, 0, 5.2, 0.18, style.hair)
	if style.bun then
		ball("Bun", 0.8, 0, 5.92, 0.32, style.hair)
	end
	ball("EyeLeft", 0.16, -0.28, 5.08, -0.71, FEATURE)
	ball("EyeRight", 0.16, 0.28, 5.08, -0.71, FEATURE)
	add("Smile", Enum.PartType.Block, Vector3.new(0.36, 0.06, 0.06), CFrame.new(0, 4.72, -0.72), FEATURE)

	model.Parent = parent
	return model
end

return MentorCharacter
