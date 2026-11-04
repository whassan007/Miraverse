--!strict
-- MiraVerse v0.4 Native Roblox 3D World Hub & 5 Stylized Towns Builder
-- Owner: CL03
local Workspace = game:GetService("Workspace")
local Lighting = game:GetService("Lighting")

local WORLD_CONFIGS = {
	HUB = { name = "Compass Plaza Hub", center = Vector3.new(0, 0, 0), primary = Color3.fromRGB(29, 53, 87), accent = Color3.fromRGB(244, 162, 97) },
	FR = { name = "Vieux Lyon Boulangerie", center = Vector3.new(260, 0, 0), primary = Color3.fromRGB(59, 110, 165), accent = Color3.fromRGB(232, 168, 56), mentor = "Mamie Claire" },
	LB = { name = "Byblos Harbor & Saj", center = Vector3.new(-260, 0, 0), primary = Color3.fromRGB(30, 122, 104), accent = Color3.fromRGB(217, 123, 56), mentor = "Teta Nahla" },
	EG = { name = "Cairo Fanous Courtyard", center = Vector3.new(0, 0, 260), primary = Color3.fromRGB(43, 76, 126), accent = Color3.fromRGB(240, 180, 41), mentor = "Teta Samira" },
	IQ = { name = "Baghdad Shanasheel & Tigris", center = Vector3.new(0, 0, -260), primary = Color3.fromRGB(140, 74, 39), accent = Color3.fromRGB(58, 166, 185), mentor = "Bibi Amal" },
	KR = { name = "Jeonju Hanok Village", center = Vector3.new(260, 0, 260), primary = Color3.fromRGB(46, 90, 68), accent = Color3.fromRGB(217, 107, 112), mentor = "Halmeoni" },
}

local function ensureWorldFolder(): Folder
	local existing = Workspace:FindFirstChild("MiraVerseWorld")
	if existing and existing:IsA("Folder") then
		return existing
	end
	local folder = Instance.new("Folder")
	folder.Name = "MiraVerseWorld"
	folder.Parent = Workspace
	return folder
end

local function buildStylizedDistrict(parent: Folder, code: string, cfg: any)
	local model = Instance.new("Model")
	model.Name = "District_" .. code
	model.Parent = parent

	local plaza = Instance.new("Part")
	plaza.Name = "CobblestonePlaza"
	plaza.Anchored = true
	plaza.Size = Vector3.new(140, 2, 140)
	plaza.Position = cfg.center - Vector3.new(0, 1, 0)
	plaza.Material = Enum.Material.Cobblestone
	plaza.Color = cfg.primary
	plaza.Parent = model

	local spawnLoc = Instance.new("SpawnLocation")
	spawnLoc.Name = "Spawn_" .. code
	spawnLoc.Anchored = true
	spawnLoc.Neutral = true
	spawnLoc.Size = Vector3.new(8, 1, 8)
	spawnLoc.Position = cfg.center + Vector3.new(0, 0.5, -24)
	spawnLoc.Color = cfg.accent
	spawnLoc.Parent = model

	if code ~= "HUB" then
		-- Repairable Cultural Landmark (Facade, Roof, Shutters)
		local landmark = Instance.new("Model")
		landmark.Name = "Landmark_" .. code
		landmark.Parent = model

		local facade = Instance.new("Part")
		facade.Name = "Restoration_Facade"
		facade.Anchored = true
		facade.Size = Vector3.new(28, 16, 18)
		facade.Position = cfg.center + Vector3.new(0, 8, 22)
		facade.Material = Enum.Material.Limestone
		facade.Color = Color3.fromRGB(110, 105, 98)
		facade.Parent = landmark

		local roof = Instance.new("WedgePart")
		roof.Name = "Restoration_Roof"
		roof.Anchored = true
		roof.Size = Vector3.new(18, 9, 30)
		roof.Position = cfg.center + Vector3.new(0, 20.5, 22)
		roof.Material = Enum.Material.Slate
		roof.Color = cfg.primary
		roof.Parent = landmark

		-- Mentor NPC with ProximityPrompt
		local npc = Instance.new("Part")
		npc.Name = "Mentor_" .. code
		npc.Anchored = true
		npc.Size = Vector3.new(3, 5.5, 2)
		npc.Position = cfg.center + Vector3.new(-8, 2.75, 10)
		npc.Color = cfg.accent
		npc.Parent = model

		local prompt = Instance.new("ProximityPrompt")
		prompt.ObjectText = cfg.mentor or code
		prompt.ActionText = "Talk & Begin Chapter Quest"
		prompt.MaxActivationDistance = 14
		prompt.Parent = npc
	end
end

local rootFolder = ensureWorldFolder()
for code, cfg in pairs(WORLD_CONFIGS) do
	if not rootFolder:FindFirstChild("District_" .. code) then
		buildStylizedDistrict(rootFolder, code, cfg)
	end
end
Lighting.ClockTime = 16.5
Lighting.Brightness = 2.2
