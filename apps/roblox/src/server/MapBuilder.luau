--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")
local ReplicatedStorageShared = game:GetService("ReplicatedStorage"):WaitForChild("Shared")
local WorldRegistry = require(ReplicatedStorageShared:WaitForChild("WorldRegistry"))
local ByblosWorld = require(script.Parent.world.ByblosWorld)
local MountLebanonWorld = require(script.Parent.world.MountLebanonWorld)
local BeirutWorld = require(script.Parent.world.BeirutWorld)
local RegionalTerrainBuilder = require(script.Parent.world.RegionalTerrainBuilder)
local MentorCharacter = require(script.Parent.world.MentorCharacter)
local PhoenicianHeritageHub = require(script.Parent["historical-worlds"].PhoenicianHeritageHub)
local ByblosHistoricalWorld = require(script.Parent["historical-worlds"].ByblosHistoricalWorld)
local TyreHistoricalWorld = require(script.Parent["historical-worlds"].TyreHistoricalWorld)
local SidonHistoricalWorld = require(script.Parent["historical-worlds"].SidonHistoricalWorld)
local CarthageHistoricalWorld = require(script.Parent["historical-worlds"].CarthageHistoricalWorld)
local MotyaHistoricalWorld = require(script.Parent["historical-worlds"].MotyaHistoricalWorld)

local MapBuilder = {}

type Handlers = {
	travel: (Player, string) -> (),
	travelLocation: ((Player, string) -> ())?,
	lobby: (Player) -> (),
	mentor: (Player, string) -> (),
	station: (Player, string, string) -> (),
}
local handlers: Handlers? = nil

function MapBuilder.setHandlers(h: Handlers)
	handlers = h
end

local function onPrompt(prompt: ProximityPrompt, fn: (Handlers, Player) -> ())
	prompt.Triggered:Connect(function(player: Player)
		if handlers then
			fn(handlers, player)
		end
	end)
end

export type CountryId = "LB" | "EG" | "IQ" | "KR" | "FR"

type CountryMeta = {
	country: CountryId,
	name_en: string,
	primary: string,
	secondary: string,
	mentorName: string,
	mentorGreeting: string,
}

local COUNTRIES: { CountryId } = { "LB", "EG", "IQ", "KR", "FR" }

local FALLBACK_META: { [string]: CountryMeta } = {
	LB = {
		country = "LB",
		name_en = "Lebanon",
		primary = "#CE1126",
		secondary = "#00A651",
		mentorName = "Teta Nahla",
		mentorGreeting = "Ahlan wa sahlan! Welcome to Byblos.",
	},
	EG = {
		country = "EG",
		name_en = "Egypt",
		primary = "#C09300",
		secondary = "#CE1126",
		mentorName = "Teta Samira",
		mentorGreeting = "Marhaba! Welcome to Cairo.",
	},
	IQ = {
		country = "IQ",
		name_en = "Iraq",
		primary = "#1E5AA8",
		secondary = "#D4AF37",
		mentorName = "Bibi Amal",
		mentorGreeting = "Hala! Welcome to Baghdad.",
	},
	KR = {
		country = "KR",
		name_en = "South Korea",
		primary = "#0047A0",
		secondary = "#CD2E3A",
		mentorName = "Halmeoni",
		mentorGreeting = "Annyeonghaseyo! Welcome to Jeonju.",
	},
	FR = {
		country = "FR",
		name_en = "France",
		primary = "#0055A4",
		secondary = "#EF4135",
		mentorName = "Mamie Claire",
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
	local sharedFolder = ReplicatedStorage:FindFirstChild("Shared")
	if not sharedFolder then
		return {}
	end
	local contentMod = sharedFolder:FindFirstChild("Packs")
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

local function resolveCountryMeta(cc: CountryId, packData: any): CountryMeta
	local fallback = FALLBACK_META[cc]
	if type(packData) ~= "table" then
		return fallback
	end

	local name_en = if type(packData.name_en) == "string" and #packData.name_en > 0
		then packData.name_en
		else fallback.name_en

	local primary = fallback.primary
	local secondary = fallback.secondary
	if type(packData.colors) == "table" then
		if type(packData.colors.primary) == "string" then
			primary = packData.colors.primary
		end
		if type(packData.colors.secondary) == "string" then
			secondary = packData.colors.secondary
		end
	end

	local mentorName = fallback.mentorName
	local mentorGreeting = fallback.mentorGreeting
	if type(packData.mentor) == "table" then
		if type(packData.mentor.name) == "string" and #packData.mentor.name > 0 then
			mentorName = packData.mentor.name
		end
		if type(packData.mentor.greeting_en) == "string" and #packData.mentor.greeting_en > 0 then
			mentorGreeting = packData.mentor.greeting_en
		end
	end

	return {
		country = cc,
		name_en = name_en,
		primary = primary,
		secondary = secondary,
		mentorName = mentorName,
		mentorGreeting = mentorGreeting,
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

local buildLebanonPeople: (Folder, Vector3, CountryMeta) -> ()

local function buildTravelLobby(mapFolder: Folder, metas: { [string]: CountryMeta })
	local lobbyFolder = Instance.new("Folder")
	lobbyFolder.Name = "TravelLobby"
	lobbyFolder.Parent = mapFolder

	local lobbyCenter = WorldRegistry.LOBBY

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

		onPrompt(prompt, function(h, player)
			h.travel(player, cc)
		end)

		createBillboardLabel(portalPart, meta.name_en, "Portal · " .. cc, secondaryColor)
	end

	-- Dedicated Historical Gateway Portal to Phoenician Worlds
	local histPortalPos = lobbyCenter + Vector3.new(0, 4.5, 24)
	local histPortalPart = Instance.new("Part")
	histPortalPart.Name = "Portal_PhoenicianHeritage"
	histPortalPart.Anchored = true
	histPortalPart.CanCollide = true
	histPortalPart.Size = Vector3.new(7, 9.5, 1.5)
	histPortalPart.Position = histPortalPos
	histPortalPart.Color = Color3.fromRGB(240, 190, 50)
	histPortalPart.Material = Enum.Material.Neon
	histPortalPart.Parent = lobbyFolder

	local histPrompt = Instance.new("ProximityPrompt")
	histPrompt.Name = "TravelPrompt"
	histPrompt.ActionText = "Travel to Phoenician Worlds"
	histPrompt.ObjectText = "Phoenician Heritage Gateway"
	histPrompt.HoldDuration = 0
	histPrompt.MaxActivationDistance = 12
	histPrompt.RequiresLineOfSight = false
	histPrompt.Parent = histPortalPart

	onPrompt(histPrompt, function(h, player)
		if h.travelLocation then
			h.travelLocation(player, "phoenician_hub")
		else
			h.travel(player, "LB")
		end
	end)

	createBillboardLabel(histPortalPart, "Phoenician Heritage", "Historical Gateway · Ancient Worlds", Color3.fromRGB(255, 215, 0))
end

local function buildCountryPlaza(mapFolder: Folder, cc: CountryId, meta: CountryMeta)
	local plazaCenter = WorldRegistry.origin(cc) :: Vector3
	local primaryColor = hexToColor3(meta.primary, Color3.fromRGB(80, 140, 210))
	local secondaryColor = hexToColor3(meta.secondary, Color3.fromRGB(220, 180, 80))

	local defaultLoc = WorldRegistry.defaultLocation(cc)
	local defaultLocationId = if defaultLoc then defaultLoc.locationId else string.lower(cc)

	local plazaFolder = Instance.new("Folder")
	plazaFolder.Name = "Plaza_" .. cc
	plazaFolder:SetAttribute("Country", cc)
	plazaFolder:SetAttribute("LocationId", defaultLocationId)
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
	basePart:SetAttribute("LocationId", defaultLocationId)
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
	borderPart:SetAttribute("LocationId", defaultLocationId)
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
	spawnPart:SetAttribute("LocationId", defaultLocationId)
	spawnPart.Parent = plazaFolder

	local mentorPart = Instance.new("Part")
	mentorPart.Name = "Mentor_" .. cc
	mentorPart.Anchored = true
	mentorPart.CanCollide = true
	mentorPart.Size = Vector3.new(4, 6, 4)
	mentorPart.Position = plazaCenter + Vector3.new(-18, 3, -12)
	mentorPart.Color = secondaryColor
	mentorPart.Material = Enum.Material.SmoothPlastic
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
	onPrompt(mentorPrompt, function(h, player)
		h.mentor(player, cc)
	end)

	createBillboardLabel(mentorPart, meta.mentorName, meta.name_en, primaryColor)

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

	onPrompt(returnPrompt, function(h, player)
		h.lobby(player)
	end)
end

-- Teta Nahla and the five physical challenge stations.
buildLebanonPeople = function(plaza: Folder, center: Vector3, meta: CountryMeta)
	local anchor = plaza:FindFirstChild("Mentor_LB")
	if anchor and anchor:IsA("BasePart") then
		anchor.Transparency = 1
		anchor.CanCollide = false
		MentorCharacter.build(plaza, meta.mentorName, CFrame.lookAt(anchor.Position - Vector3.new(0, 3, 0), center + Vector3.new(0, 0, 28)), {
			skin = Color3.fromRGB(214, 170, 135),
			dress = Color3.fromRGB(30, 110, 96),
			apron = Color3.fromRGB(217, 123, 56),
			scarf = Color3.fromRGB(245, 238, 222),
		})
	end
	for kind, station in WorldRegistry.STATIONS.LB do
		local pad = Instance.new("Part")
		pad.Name = "Station_" .. kind
		pad.Anchored = true
		pad.Size = Vector3.new(6, 0.4, 6)
		pad.Position = center + Vector3.new(station.x, 0.2, station.z)
		pad.Color = Color3.fromRGB(217, 123, 56)
		pad.Material = Enum.Material.Neon
		pad.Parent = plaza
		local prompt = Instance.new("ProximityPrompt")
		prompt.ActionText = "Start"
		prompt.ObjectText = station.label
		prompt.HoldDuration = 0
		prompt.MaxActivationDistance = 12
		prompt.RequiresLineOfSight = false
		prompt.Parent = pad
		onPrompt(prompt, function(h, player)
			h.station(player, "LB", kind)
		end)
	end

	-- Travel station from Byblos to Mount Lebanon (in front of arrival spawn at +34, 0, +14)
	local trailStation = Instance.new("Model")
	trailStation.Name = "TravelStation_ToMountLebanon"
	trailStation.Parent = plaza

	local trailPos = center + Vector3.new(34, 0, 14)

	local trailBase = Instance.new("Part")
	trailBase.Name = "TrailBase"
	trailBase.Anchored = true
	trailBase.CanCollide = true
	trailBase.Size = Vector3.new(9, 1, 6)
	trailBase.Position = trailPos + Vector3.new(0, 0.5, 0)
	trailBase.Color = Color3.fromHex("D8C5A3")
	trailBase.Material = Enum.Material.Limestone
	trailBase.Parent = trailStation

	local leftPost = Instance.new("Part")
	leftPost.Name = "TrailPostL"
	leftPost.Anchored = true
	leftPost.CanCollide = true
	leftPost.Size = Vector3.new(1.4, 9, 1.4)
	leftPost.Position = trailPos + Vector3.new(-3.2, 5, 0)
	leftPost.Color = Color3.fromHex("6B4423")
	leftPost.Material = Enum.Material.WoodPlanks
	leftPost.Parent = trailStation

	local rightPost = Instance.new("Part")
	rightPost.Name = "TrailPostR"
	rightPost.Anchored = true
	rightPost.CanCollide = true
	rightPost.Size = Vector3.new(1.4, 9, 1.4)
	rightPost.Position = trailPos + Vector3.new(3.2, 5, 0)
	rightPost.Color = Color3.fromHex("6B4423")
	rightPost.Material = Enum.Material.WoodPlanks
	rightPost.Parent = trailStation

	local lintel = Instance.new("Part")
	lintel.Name = "TrailLintel"
	lintel.Anchored = true
	lintel.CanCollide = true
	lintel.Size = Vector3.new(8.8, 1.4, 2)
	lintel.Position = trailPos + Vector3.new(0, 9.8, 0)
	lintel.Color = Color3.fromHex("1E5631")
	lintel.Material = Enum.Material.SmoothPlastic
	lintel.Parent = trailStation

	local portalToMountLebanon = Instance.new("Part")
	portalToMountLebanon.Name = "Portal_byblos_to_mount_lebanon"
	portalToMountLebanon.Anchored = true
	portalToMountLebanon.CanCollide = true
	portalToMountLebanon.Size = Vector3.new(4.8, 7.6, 1.2)
	portalToMountLebanon.Position = trailPos + Vector3.new(0, 4.8, 0)
	portalToMountLebanon.Color = Color3.fromHex("1E5631")
	portalToMountLebanon.Material = Enum.Material.Neon
	portalToMountLebanon:SetAttribute("Country", "LB")
	portalToMountLebanon:SetAttribute("SourceLocation", "byblos")
	portalToMountLebanon:SetAttribute("TargetLocation", "mount_lebanon")
	portalToMountLebanon.Parent = trailStation

	createBillboardLabel(
		portalToMountLebanon,
		"Trail to Mount Lebanon",
		"Cedar & Olive Terraces (Al-Jall)",
		Color3.fromHex("00A651")
	)

	local trailPrompt = Instance.new("ProximityPrompt")
	trailPrompt.Name = "TravelToMountLebanonPrompt"
	trailPrompt.ActionText = "Travel to Mount Lebanon"
	trailPrompt.ObjectText = "Mount Lebanon Region"
	trailPrompt.HoldDuration = 0
	trailPrompt.MaxActivationDistance = 14
	trailPrompt.RequiresLineOfSight = false
	trailPrompt.Parent = portalToMountLebanon

	onPrompt(trailPrompt, function(h, player)
		if h.travelLocation then
			h.travelLocation(player, "mount_lebanon")
		else
			h.travel(player, "mount_lebanon")
		end
	end)

	-- Travel station from Byblos to Beirut (coastal road portal at -34, 0, +14)
	local beirutStation = Instance.new("Model")
	beirutStation.Name = "TravelStation_ToBeirut"
	beirutStation.Parent = plaza

	local beirutPos = center + Vector3.new(-34, 0, 14)

	local beirutBase = Instance.new("Part")
	beirutBase.Name = "BeirutTrailBase"
	beirutBase.Anchored = true
	beirutBase.CanCollide = true
	beirutBase.Size = Vector3.new(9, 1, 6)
	beirutBase.Position = beirutPos + Vector3.new(0, 0.5, 0)
	beirutBase.Color = Color3.fromHex("D8C5A3")
	beirutBase.Material = Enum.Material.Limestone
	beirutBase.Parent = beirutStation

	local portalToBeirut = Instance.new("Part")
	portalToBeirut.Name = "Portal_byblos_to_beirut"
	portalToBeirut.Anchored = true
	portalToBeirut.CanCollide = true
	portalToBeirut.Size = Vector3.new(4.8, 7.6, 1.2)
	portalToBeirut.Position = beirutPos + Vector3.new(0, 4.8, 0)
	portalToBeirut.Color = Color3.fromRGB(36, 122, 168)
	portalToBeirut.Material = Enum.Material.Neon
	portalToBeirut:SetAttribute("Country", "LB")
	portalToBeirut:SetAttribute("SourceLocation", "byblos")
	portalToBeirut:SetAttribute("TargetLocation", "beirut")
	portalToBeirut.Parent = beirutStation

	createBillboardLabel(
		portalToBeirut,
		"Coastal Road to Beirut",
		"Ras Beirut Promontory & Corniche",
		Color3.fromRGB(36, 122, 168)
	)

	local beirutPrompt = Instance.new("ProximityPrompt")
	beirutPrompt.Name = "TravelToBeirutPrompt"
	beirutPrompt.ActionText = "Travel to Beirut"
	beirutPrompt.ObjectText = "Beirut Coastal City"
	beirutPrompt.HoldDuration = 0
	beirutPrompt.MaxActivationDistance = 14
	beirutPrompt.RequiresLineOfSight = false
	beirutPrompt.Parent = portalToBeirut

	onPrompt(beirutPrompt, function(h, player)
		if h.travelLocation then
			h.travelLocation(player, "beirut")
		else
			h.travel(player, "beirut")
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
		if
			not existing:FindFirstChild("Spawn_mount_lebanon", true)
			or not existing:FindFirstChild("Portal_byblos_to_mount_lebanon", true)
			or not existing:FindFirstChild("Portal_mount_lebanon_to_byblos", true)
		then
			allPresent = false
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
		metas[cc] = resolveCountryMeta(cc, packs[cc])
	end

	buildTravelLobby(mapFolder, metas)

	for _, cc in ipairs(COUNTRIES) do
		buildCountryPlaza(mapFolder, cc, metas[cc])
		local plaza = mapFolder:FindFirstChild("Plaza_" .. cc)
		local center = WorldRegistry.origin(cc)
		local defaultLocId = WorldRegistry.defaultLocationId(cc)
		local travelCallbacks = {
			travelToLocation = function(player: Player, targetLocationId: string)
				if handlers then
					if handlers.travelLocation then
						handlers.travelLocation(player, targetLocationId)
					else
						handlers.travel(player, targetLocationId)
					end
				end
			end,
			returnToLobby = function(player: Player)
				if handlers then
					handlers.lobby(player)
				end
			end,
		}
		if cc == "LB" then
			if plaza and center then
				ByblosWorld.build(plaza, center)
				buildLebanonPeople(plaza :: Folder, center, metas[cc])
				RegionalTerrainBuilder.augmentCityPlaza(plaza :: Folder, "byblos", center, travelCallbacks)
			end
			local mountLebanonLoc = WorldRegistry.getLocation("mount_lebanon")
			if mountLebanonLoc then
				MountLebanonWorld.build(mapFolder, mountLebanonLoc.origin, travelCallbacks)
			end
			local beirutLoc = WorldRegistry.getLocation("beirut")
			if beirutLoc then
				BeirutWorld.build(mapFolder, beirutLoc.origin, travelCallbacks)
			end
		elseif plaza and center and defaultLocId then
			RegionalTerrainBuilder.augmentCityPlaza(plaza :: Folder, defaultLocId, center, travelCallbacks)
			for _, locDef in ipairs(WorldRegistry.locationsForCountry(cc)) do
				if locDef.locationId ~= defaultLocId then
					RegionalTerrainBuilder.buildRegionalScene(mapFolder, locDef.locationId, travelCallbacks)
				end
			end
		end
	end

	-- Build the 6 Global Catalog country scenes (DE, CN, JP, RU, UA, MA) from the shared DEM pipeline
	local globalTravelCallbacks = {
		travelToLocation = function(player: Player, targetLocationId: string)
			if handlers then
				if handlers.travelLocation then
					handlers.travelLocation(player, targetLocationId)
				else
					handlers.travel(player, targetLocationId)
				end
			end
		end,
		returnToLobby = function(player: Player)
			if handlers then
				handlers.lobby(player)
			end
		end,
	}
	for _, globalCc in ipairs({ "DE", "CN", "JP", "RU", "UA", "MA" }) do
		for _, locDef in ipairs(WorldRegistry.locationsForCountry(globalCc)) do
			RegionalTerrainBuilder.buildRegionalScene(mapFolder, locDef.locationId, globalTravelCallbacks)
		end
	end

	-- Build the 5 Phoenician Historical Worlds & Heritage Hub (Z >= 1600)
	local histTravelCallback = function(player: Player, destination: string, targetPos: Vector3)
		if handlers then
			if handlers.travelLocation then
				handlers.travelLocation(player, destination)
			else
				handlers.travel(player, destination)
			end
		end
	end

	PhoenicianHeritageHub.build(mapFolder, histTravelCallback)
	ByblosHistoricalWorld.build(mapFolder, histTravelCallback)
	TyreHistoricalWorld.build(mapFolder, histTravelCallback)
	SidonHistoricalWorld.build(mapFolder, histTravelCallback)
	CarthageHistoricalWorld.build(mapFolder, histTravelCallback)
	MotyaHistoricalWorld.build(mapFolder, histTravelCallback)

	mapFolder.Parent = Workspace
	return mapFolder
end

function MapBuilder.getLocationSpawn(locationId: string): BasePart?
	if type(locationId) ~= "string" then
		return nil
	end
	local loc = WorldRegistry.getLocation(locationId)
	local canonicalId = if loc then loc.locationId else string.lower(locationId)
	if canonicalId == "mount_lebanon" then
		return findMapPart("Spawn_mount_lebanon")
	elseif canonicalId == "byblos" then
		return findMapPart("Spawn_LB")
	end
	local direct = findMapPart("Spawn_" .. canonicalId)
	if direct then
		return direct
	end
	local rawDirect = findMapPart("Spawn_" .. string.lower(locationId))
	if rawDirect then
		return rawDirect
	end
	if loc then
		return findMapPart("Spawn_" .. loc.countryId)
	end
	return nil
end

function MapBuilder.getSpawn(country: string): BasePart?
	if type(country) ~= "string" then
		return nil
	end
	local byLoc = MapBuilder.getLocationSpawn(country)
	if byLoc then
		return byLoc
	end
	local cc = string.upper(country)
	return findMapPart("Spawn_" .. cc)
end

function MapBuilder.getMentorSpot(country: string): BasePart?
	if type(country) ~= "string" then
		return nil
	end
	local cc = string.upper(country)
	return findMapPart("Mentor_" .. cc)
end

function MapBuilder.getBuildOrigin(country: string): BasePart?
	if type(country) ~= "string" then
		return nil
	end
	local cc = string.upper(country)
	return findMapPart("BuildOrigin_" .. cc)
end

return MapBuilder
