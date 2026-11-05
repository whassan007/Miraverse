--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Lighting = game:GetService("Lighting")
local Workspace = game:GetService("Workspace")

local MapBuilder = {}

export type CountryId = string

type CountryMeta = {
	country: CountryId,
	name_en: string,
	primary: string,
	secondary: string,
	mentorName: string,
	mentorGreeting: string,
	characterStyle: string?,
}

local COUNTRIES: { string } = {}

local FALLBACK_META: { [string]: CountryMeta } = {
	LB = {
		country = "LB",
		name_en = "Lebanon",
		primary = "#CE1126",
		secondary = "#00A651",
		mentorName = "Teta Salwa",
		mentorGreeting = "Ahlan wa sahlan! Welcome to Byblos.",
	},
	EG = {
		country = "EG",
		name_en = "Egypt",
		primary = "#C09300",
		secondary = "#CE1126",
		mentorName = "Ammo Karim",
		mentorGreeting = "Marhaba! Welcome to Cairo.",
	},
	IQ = {
		country = "IQ",
		name_en = "Iraq",
		primary = "#1E5AA8",
		secondary = "#D4AF37",
		mentorName = "Bibi Nadia",
		mentorGreeting = "Hala! Welcome to Baghdad.",
	},
	KR = {
		country = "KR",
		name_en = "South Korea",
		primary = "#0047A0",
		secondary = "#CD2E3A",
		mentorName = "Halmeoni Sunja",
		mentorGreeting = "Annyeonghaseyo! Welcome to Jeonju.",
	},
	FR = {
		country = "FR",
		name_en = "France",
		primary = "#0055A4",
		secondary = "#EF4135",
		mentorName = "Mamie Colette",
		mentorGreeting = "Bonjour! Welcome to Lyon.",
	},
}

local function hexToColor3(hex: string?, defaultColor: Color3): Color3
	if type(hex) ~= "string" then
		return defaultColor
	end
	local clean = string.gsub(hex, "^#", "")
	if #clean == 6 then
		local r = tonumber(string.sub(clean, 1, 2), 16)
		local g = tonumber(string.sub(clean, 3, 4), 16)
		local b = tonumber(string.sub(clean, 5, 6), 16)
		if r and g and b then
			return Color3.fromRGB(r, g, b)
		end
	end
	return defaultColor
end

local function loadContentPacks(): { [string]: any }
	local sharedFolder = ReplicatedStorage:WaitForChild("MiraVerseShared")
	local contentMod = sharedFolder:WaitForChild("Packs")
	if contentMod and contentMod:IsA("ModuleScript") then
		local ok, data = pcall(require, contentMod)
		if ok and type(data) == "table" then
			if type(data.PACKS) == "table" then
				return data.PACKS
			elseif type(data.packs) == "table" then
				return data.packs
			end
			return data
		end
	end
	return {}
end

local function resolveCountryMeta(cc: string, packData: any, catalog: any, Locale: any): CountryMeta
	local fallback = FALLBACK_META[cc]
	local entry = nil
	for _, country in catalog.countries do
		if country.code == cc then
			entry = country
		end
	end
	local english = Locale.get("en-US", entry.nameKey)
	local name_en = string.match(english, "^(.-) %(") or english
	local mentorName = Locale.get("en-US", entry.leadNameKey)
	if type(packData) == "table" and type(packData.mentor) == "table" and type(packData.mentor.name) == "string" then
		mentorName = packData.mentor.name
	end
	return {
		country = cc,
		name_en = name_en,
		primary = if type(packData) == "table" and type(packData.colors) == "table" and packData.colors.primary
			then packData.colors.primary
			else entry.primary,
		secondary = if type(packData) == "table" and type(packData.colors) == "table" and packData.colors.secondary
			then packData.colors.secondary
			else entry.secondary,
		mentorName = mentorName,
		mentorGreeting = fallback and fallback.mentorGreeting or "",
		characterStyle = entry.characterStyle,
	}
end

local function createBillboardLabel(parent: Instance, titleText: string, subtitleText: string?, accentColor: Color3): BillboardGui
	local billboard = Instance.new("BillboardGui")
	billboard.Name = "MentorBillboard"
	billboard.Adornee = if parent:IsA("BasePart") then parent else nil
	billboard.Size = UDim2.fromOffset(220, 64)
	billboard.StudsOffset = Vector3.new(0, 4.5, 0)
	billboard.AlwaysOnTop = true
	billboard.MaxDistance = 90

	local frame = Instance.new("Frame")
	frame.Name = "Card"
	frame.Size = UDim2.fromScale(1, 1)
	frame.BackgroundColor3 = Color3.fromRGB(20, 24, 36)
	frame.BackgroundTransparency = 0.15
	frame.BorderSizePixel = 0
	frame.Parent = billboard

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 8)
	corner.Parent = frame

	local stroke = Instance.new("UIStroke")
	stroke.Color = accentColor
	stroke.Thickness = 2
	stroke.Parent = frame

	local nameLabel = Instance.new("TextLabel")
	nameLabel.Name = "MentorName"
	nameLabel.Size = if subtitleText then UDim2.new(1, -12, 0.55, 0) else UDim2.new(1, -12, 1, 0)
	nameLabel.Position = UDim2.fromOffset(6, 2)
	nameLabel.BackgroundTransparency = 1
	nameLabel.Text = titleText
	nameLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
	nameLabel.TextScaled = true
	nameLabel.Font = Enum.Font.GothamBold
	nameLabel.Parent = frame

	if subtitleText then
		local subLabel = Instance.new("TextLabel")
		subLabel.Name = "Subtitle"
		subLabel.Size = UDim2.new(1, -12, 0.4, 0)
		subLabel.Position = UDim2.new(0, 6, 0.55, 0)
		subLabel.BackgroundTransparency = 1
		subLabel.Text = subtitleText
		subLabel.TextColor3 = Color3.fromRGB(215, 225, 245)
		subLabel.TextScaled = true
		subLabel.Font = Enum.Font.Gotham
		subLabel.Parent = frame
	end

	billboard.Parent = parent
	return billboard
end

local function buildTravelLobby(mapFolder: Folder, metas: { [string]: CountryMeta })
	local lobbyFolder = Instance.new("Folder")
	lobbyFolder.Name = "TravelLobby"
	lobbyFolder.Parent = mapFolder

	local lobbyCenter = Vector3.new(0, 10, 0)

	local platform = Instance.new("Part")
	platform.Name = "LobbyPlatform"
	platform.Anchored = true
	platform.CanCollide = true
	platform.Size = Vector3.new(68, 2, 68)
	platform.Position = lobbyCenter - Vector3.new(0, 1, 0)
	platform.Color = Color3.fromRGB(38, 46, 66)
	platform.Material = Enum.Material.SmoothPlastic
	platform.TopSurface = Enum.SurfaceType.Smooth
	platform.BottomSurface = Enum.SurfaceType.Smooth
	platform.Parent = lobbyFolder

	local trim = Instance.new("Part")
	trim.Name = "LobbyTrim"
	trim.Anchored = true
	trim.CanCollide = false
	trim.Size = Vector3.new(70, 1.2, 70)
	trim.Position = lobbyCenter - Vector3.new(0, 1.2, 0)
	trim.Color = Color3.fromRGB(235, 190, 80)
	trim.Material = Enum.Material.Neon
	trim.Parent = lobbyFolder

	local spawnLocation = Instance.new("SpawnLocation")
	spawnLocation.Name = "SpawnLocation"
	spawnLocation.Anchored = true
	spawnLocation.CanCollide = true
	spawnLocation.Neutral = true
	spawnLocation.Duration = 0
	spawnLocation.Size = Vector3.new(10, 1, 10)
	spawnLocation.Position = lobbyCenter + Vector3.new(0, 0.5, 0)
	spawnLocation.Color = Color3.fromRGB(245, 248, 255)
	spawnLocation.Material = Enum.Material.Neon
	spawnLocation.TopSurface = Enum.SurfaceType.Smooth
	spawnLocation.BottomSurface = Enum.SurfaceType.Smooth
	spawnLocation.Parent = lobbyFolder

	local radius = 24
	for i, cc in ipairs(COUNTRIES) do
		local meta = metas[cc]
		local primaryColor = hexToColor3(meta.primary, Color3.fromRGB(60, 130, 220))
		local secondaryColor = hexToColor3(meta.secondary, Color3.fromRGB(230, 180, 70))

		local angle = ((i - 1) / #COUNTRIES) * math.pi * 2 - (math.pi / 2)
		local offset = Vector3.new(math.cos(angle) * radius, 4.5, math.sin(angle) * radius)
		local portalPos = lobbyCenter + offset

		local portalPedestal = Instance.new("Part")
		portalPedestal.Name = "PortalPedestal_" .. cc
		portalPedestal.Anchored = true
		portalPedestal.CanCollide = true
		portalPedestal.Size = Vector3.new(8, 1, 5)
		portalPedestal.CFrame = CFrame.lookAt(lobbyCenter + Vector3.new(offset.X, 0.5, offset.Z), lobbyCenter + Vector3.new(0, 0.5, 0))
		portalPedestal.Color = secondaryColor
		portalPedestal.Material = Enum.Material.SmoothPlastic
		portalPedestal.Parent = lobbyFolder

		local portalPart = Instance.new("Part")
		portalPart.Name = "Portal_" .. cc
		portalPart.Anchored = true
		portalPart.CanCollide = true
		portalPart.Size = Vector3.new(6, 9, 1.5)
		portalPart.CFrame = CFrame.lookAt(portalPos, Vector3.new(lobbyCenter.X, portalPos.Y, lobbyCenter.Z))
		portalPart.Color = primaryColor
		portalPart.Material = Enum.Material.Neon
		portalPart:SetAttribute("Country", cc)
		portalPart.Parent = lobbyFolder

		local prompt = Instance.new("ProximityPrompt")
		prompt.Name = "TravelPrompt"
		prompt.ActionText = "Travel to " .. meta.name_en
		prompt.ObjectText = meta.name_en .. " (" .. cc .. ")"
		prompt.HoldDuration = 0
		prompt.MaxActivationDistance = 12
		prompt.RequiresLineOfSight = false
		prompt.Parent = portalPart

		prompt.Triggered:Connect(function(player: Player)
			local targetSpawn = MapBuilder.getSpawn(cc)
			local character = player.Character
			if targetSpawn and character then
				character:PivotTo(targetSpawn.CFrame + Vector3.new(0, 3.5, 0))
			end
		end)

		createBillboardLabel(portalPart, meta.name_en, "Portal · " .. cc, secondaryColor)
	end
end

local function buildCountryPlaza(mapFolder: Folder, index: number, cc: string, meta: CountryMeta)
	local plazaCenter = Vector3.new(index * 160, 10, 0)
	local primaryColor = hexToColor3(meta.primary, Color3.fromRGB(80, 140, 210))
	local secondaryColor = hexToColor3(meta.secondary, Color3.fromRGB(220, 180, 80))

	local plazaFolder = Instance.new("Folder")
	plazaFolder.Name = "Plaza_" .. cc
	plazaFolder:SetAttribute("Country", cc)
	plazaFolder.Parent = mapFolder

	local basePart = Instance.new("Part")
	basePart.Name = "PlazaFloor_" .. cc
	basePart.Anchored = true
	basePart.CanCollide = true
	basePart.Size = Vector3.new(96, 2, 96)
	basePart.Position = plazaCenter - Vector3.new(0, 1, 0)
	basePart.Color = primaryColor
	basePart.Material = Enum.Material.SmoothPlastic
	basePart.TopSurface = Enum.SurfaceType.Smooth
	basePart.BottomSurface = Enum.SurfaceType.Smooth
	basePart:SetAttribute("Country", cc)
	basePart.Parent = plazaFolder

	local borderPart = Instance.new("Part")
	borderPart.Name = "PlazaBorder_" .. cc
	borderPart.Anchored = true
	borderPart.CanCollide = false
	borderPart.Size = Vector3.new(100, 1.2, 100)
	borderPart.Position = plazaCenter - Vector3.new(0, 1.2, 0)
	borderPart.Color = secondaryColor
	borderPart.Material = Enum.Material.SmoothPlastic
	borderPart:SetAttribute("Country", cc)
	borderPart.Parent = plazaFolder

	local spawnPart = Instance.new("Part")
	spawnPart.Name = "Spawn_" .. cc
	spawnPart.Anchored = true
	spawnPart.CanCollide = true
	spawnPart.Size = Vector3.new(8, 1, 8)
	spawnPart.Position = plazaCenter + Vector3.new(0, 0.5, 28)
	spawnPart.Color = secondaryColor
	spawnPart.Material = Enum.Material.SmoothPlastic
	spawnPart.TopSurface = Enum.SurfaceType.Smooth
	spawnPart.BottomSurface = Enum.SurfaceType.Smooth
	spawnPart:SetAttribute("Country", cc)
	spawnPart.Parent = plazaFolder

	local mentorPart = Instance.new("Part")
	mentorPart.Name = "Mentor_" .. cc
	mentorPart.Anchored = true
	mentorPart.CanCollide = true
	mentorPart.Size = Vector3.new(4, 6, 4)
	mentorPart.Position = plazaCenter + Vector3.new(-18, 3, -12)
	-- Invisible: this part carries the prompt and name label; the character is what shows.
	mentorPart.Transparency = 1
	mentorPart.TopSurface = Enum.SurfaceType.Smooth
	mentorPart.BottomSurface = Enum.SurfaceType.Smooth
	mentorPart:SetAttribute("Country", cc)
	mentorPart:SetAttribute("MentorName", meta.mentorName)
	mentorPart.Parent = plazaFolder

	local mentorPrompt = Instance.new("ProximityPrompt")
	mentorPrompt.Name = "MentorPrompt"
	mentorPrompt.ActionText = "Talk to " .. meta.mentorName
	mentorPrompt.ObjectText = meta.mentorName .. " (" .. meta.name_en .. ")"
	mentorPrompt.HoldDuration = 0
	mentorPrompt.MaxActivationDistance = 14
	mentorPrompt.RequiresLineOfSight = false
	mentorPrompt.Parent = mentorPart

	createBillboardLabel(mentorPart, meta.mentorName, meta.name_en, primaryColor)

	local MentorCharacter = require(ReplicatedStorage:WaitForChild("MiraVerseShared"):WaitForChild("Characters"):WaitForChild("MentorCharacter"))
	local mentorFeet = plazaCenter + Vector3.new(-18, 0, -12)
	local plazaSpawn = plazaCenter + Vector3.new(0, 0, 28)
	MentorCharacter.build("MentorCharacter_" .. cc, CFrame.lookAt(mentorFeet, plazaSpawn), primaryColor, secondaryColor, plazaFolder, meta.characterStyle)

	-- Simple town buildings in the country's colors, so the plaza isn't empty.
	for _, house in { { -40, -40, 14, 10 }, { 40, -40, 12, 8 }, { 40, 12, 10, 9 }, { -40, 28, 12, 7 } } do
		local building = Instance.new("Part")
		building.Name = "TownBuilding"
		building.Anchored = true
		building.Size = Vector3.new(house[3], house[4], house[3])
		building.Position = plazaCenter + Vector3.new(house[1], house[4] / 2, house[2])
		building.Color = primaryColor:Lerp(Color3.new(1, 1, 1), 0.35)
		building.Material = Enum.Material.Brick
		building.TopSurface = Enum.SurfaceType.Smooth
		building.Parent = plazaFolder
		local roof = Instance.new("Part")
		roof.Name = "TownRoof"
		roof.Anchored = true
		roof.Size = Vector3.new(house[3] + 1, 1, house[3] + 1)
		roof.Position = plazaCenter + Vector3.new(house[1], house[4] + 0.5, house[2])
		roof.Color = secondaryColor
		roof.Material = Enum.Material.SmoothPlastic
		roof.TopSurface = Enum.SurfaceType.Smooth
		roof.Parent = plazaFolder
	end

	local buildOriginPart = Instance.new("Part")
	buildOriginPart.Name = "BuildOrigin_" .. cc
	buildOriginPart.Anchored = true
	buildOriginPart.CanCollide = true
	buildOriginPart.Size = Vector3.new(4, 1, 4)
	buildOriginPart.Position = plazaCenter + Vector3.new(12, 0.5, -12)
	buildOriginPart.Color = secondaryColor
	buildOriginPart.Material = Enum.Material.SmoothPlastic
	buildOriginPart.TopSurface = Enum.SurfaceType.Smooth
	buildOriginPart.BottomSurface = Enum.SurfaceType.Smooth
	buildOriginPart:SetAttribute("Country", cc)
	buildOriginPart.Parent = plazaFolder

	local returnPortal = Instance.new("Part")
	returnPortal.Name = "ReturnLobby_" .. cc
	returnPortal.Anchored = true
	returnPortal.CanCollide = true
	returnPortal.Size = Vector3.new(5, 8, 1.5)
	returnPortal.Position = plazaCenter + Vector3.new(0, 4, 42)
	returnPortal.Color = Color3.fromRGB(235, 190, 80)
	returnPortal.Material = Enum.Material.Neon
	returnPortal:SetAttribute("Country", cc)
	returnPortal.Parent = plazaFolder

	local returnPrompt = Instance.new("ProximityPrompt")
	returnPrompt.Name = "ReturnPrompt"
	returnPrompt.ActionText = "Return to Travel Lobby"
	returnPrompt.ObjectText = "MiraVerse Lobby"
	returnPrompt.HoldDuration = 0
	returnPrompt.MaxActivationDistance = 12
	returnPrompt.RequiresLineOfSight = false
	returnPrompt.Parent = returnPortal

	returnPrompt.Triggered:Connect(function(player: Player)
		local character = player.Character
		if character then
			character:PivotTo(CFrame.new(0, 14, 0))
		end
	end)
end

local function findMapPart(partName: string): BasePart?
	local mapFolder = Workspace:FindFirstChild("MiraVerseMap")
	if not mapFolder then
		return nil
	end
	local found = mapFolder:FindFirstChild(partName, true)
	if found and found:IsA("BasePart") then
		return found
	end
	return nil
end

function MapBuilder.build(): Folder
	local shared = ReplicatedStorage:WaitForChild("MiraVerseShared")
	local atlas = shared:WaitForChild("Atlas")
	local catalog = require(atlas:WaitForChild("Catalog"))
	local Locale = require(atlas:WaitForChild("Locale"))
	if #COUNTRIES == 0 then
		for _, country in catalog.countries do
			table.insert(COUNTRIES, country.code)
		end
	end
	local existing = Workspace:FindFirstChild("MiraVerseMap")
	if existing and existing:IsA("Folder") then
		local allPresent = true
		for _, cc in ipairs(COUNTRIES) do
			if
				not existing:FindFirstChild("Spawn_" .. cc, true)
				or not existing:FindFirstChild("Mentor_" .. cc, true)
				or not existing:FindFirstChild("BuildOrigin_" .. cc, true)
			then
				allPresent = false
				break
			end
		end
		if allPresent and existing:FindFirstChild("SpawnLocation", true) then
			return existing
		end
		existing:Destroy()
	elseif existing then
		existing:Destroy()
	end

	local mapFolder = Instance.new("Folder")
	mapFolder.Name = "MiraVerseMap"

	local packs = loadContentPacks()
	local metas: { [string]: CountryMeta } = {}
	for _, cc in ipairs(COUNTRIES) do
		metas[cc] = resolveCountryMeta(cc, packs[cc], catalog, Locale)
	end

	buildTravelLobby(mapFolder, metas)

	for i, cc in ipairs(COUNTRIES) do
		buildCountryPlaza(mapFolder, i, cc, metas[cc])
	end

	mapFolder.Parent = Workspace
	Lighting.ClockTime = 16.5
	Lighting.Brightness = 2.2
	return mapFolder
end

function MapBuilder.getSpawn(country: string): BasePart?
	if type(country) ~= "string" then
		return nil
	end
	local cc = string.upper(country)
	local part = findMapPart("Spawn_" .. cc)
	if not part and table.find(COUNTRIES, cc) then
		MapBuilder.build()
		part = findMapPart("Spawn_" .. cc)
	end
	return part
end

function MapBuilder.getMentorSpot(country: string): BasePart?
	if type(country) ~= "string" then
		return nil
	end
	local cc = string.upper(country)
	local part = findMapPart("Mentor_" .. cc)
	if not part and table.find(COUNTRIES, cc) then
		MapBuilder.build()
		part = findMapPart("Mentor_" .. cc)
	end
	return part
end

function MapBuilder.getBuildOrigin(country: string): BasePart?
	if type(country) ~= "string" then
		return nil
	end
	local cc = string.upper(country)
	local part = findMapPart("BuildOrigin_" .. cc)
	if not part and table.find(COUNTRIES, cc) then
		MapBuilder.build()
		part = findMapPart("BuildOrigin_" .. cc)
	end
	return part
end

return MapBuilder
