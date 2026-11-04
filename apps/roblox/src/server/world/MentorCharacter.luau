--!strict
-- An original, asset-free mentor figure built on a real Humanoid.
local MentorCharacter = {}

export type Look = { skin: Color3, dress: Color3, apron: Color3, scarf: Color3 }

local function limb(parent: Instance, name: string, size: Vector3, cframe: CFrame, color: Color3, material: Enum.Material?): Part
	local p = Instance.new("Part")
	p.Name = name
	p.Size = size
	p.CFrame = cframe
	p.Color = color
	p.Material = material or Enum.Material.SmoothPlastic
	p.Anchored = true
	p.CanCollide = false
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	p.Parent = parent
	return p
end

-- `feet` is the ground point; the figure faces local -Z.
function MentorCharacter.build(parent: Instance, name: string, feet: CFrame, look: Look): Model
	local m = Instance.new("Model")
	m.Name = name

	limb(m, "Left Leg", Vector3.new(1, 2, 1), feet * CFrame.new(-0.5, 1, 0), look.dress, Enum.Material.Fabric)
	limb(m, "Right Leg", Vector3.new(1, 2, 1), feet * CFrame.new(0.5, 1, 0), look.dress, Enum.Material.Fabric)
	limb(m, "Skirt", Vector3.new(2.5, 1.6, 1.5), feet * CFrame.new(0, 1.3, 0), look.dress, Enum.Material.Fabric)
	local torso = limb(m, "Torso", Vector3.new(2, 2, 1), feet * CFrame.new(0, 3, 0), look.dress, Enum.Material.Fabric)
	limb(m, "Apron", Vector3.new(1.6, 2.8, 0.15), feet * CFrame.new(0, 2.5, -0.6), look.apron, Enum.Material.Fabric)
	limb(m, "Left Arm", Vector3.new(1, 2, 1), feet * CFrame.new(-1.5, 3, 0), look.dress, Enum.Material.Fabric)
	limb(m, "Right Arm", Vector3.new(1, 2, 1), feet * CFrame.new(1.5, 3, 0), look.dress, Enum.Material.Fabric)
	limb(m, "Left Hand", Vector3.new(0.9, 0.5, 0.9), feet * CFrame.new(-1.5, 1.8, 0), look.skin)
	limb(m, "Right Hand", Vector3.new(0.9, 0.5, 0.9), feet * CFrame.new(1.5, 1.8, 0), look.skin)
	limb(m, "Head", Vector3.new(1.3, 1.3, 1.3), feet * CFrame.new(0, 4.65, 0), look.skin)
	limb(m, "Scarf", Vector3.new(1.5, 1, 1.5), feet * CFrame.new(0, 5.1, 0.08), look.scarf, Enum.Material.Fabric)
	limb(m, "ScarfBack", Vector3.new(1.5, 1.2, 0.5), feet * CFrame.new(0, 4.4, 0.55), look.scarf, Enum.Material.Fabric)
	limb(m, "EyeL", Vector3.new(0.14, 0.14, 0.05), feet * CFrame.new(-0.28, 4.72, -0.66), Color3.fromRGB(40, 30, 25))
	limb(m, "EyeR", Vector3.new(0.14, 0.14, 0.05), feet * CFrame.new(0.28, 4.72, -0.66), Color3.fromRGB(40, 30, 25))
	limb(m, "Smile", Vector3.new(0.45, 0.07, 0.05), feet * CFrame.new(0, 4.36, -0.66), Color3.fromRGB(130, 60, 50))

	local root = limb(m, "HumanoidRootPart", Vector3.new(2, 2, 1), torso.CFrame, look.dress)
	root.Transparency = 1
	root.CanCollide = true
	m.PrimaryPart = root

	local humanoid = Instance.new("Humanoid")
	humanoid.DisplayName = name
	humanoid.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.None
	humanoid.WalkSpeed = 0
	humanoid.JumpPower = 0
	humanoid.Parent = m

	-- A gentle wave and breath, driven on the server so everyone sees the same thing.
	local arm = m:FindFirstChild("Right Arm") :: BasePart
	local hand = m:FindFirstChild("Right Hand") :: BasePart
	local armBase, handBase = arm.CFrame, hand.CFrame
	local pivot = feet * CFrame.new(1.5, 4, 0)
	task.spawn(function()
		while m.Parent do
			task.wait(4)
			for t = 0, 1, 0.05 do
				if not m.Parent then
					return
				end
				local turn = CFrame.Angles(0, 0, math.sin(t * math.pi) * math.rad(150))
				local swing = pivot * turn * pivot:Inverse()
				arm.CFrame = swing * armBase
				hand.CFrame = swing * handBase
				task.wait(0.05)
			end
			arm.CFrame, hand.CFrame = armBase, handBase
		end
	end)

	m.Parent = parent
	return m
end

return MentorCharacter
