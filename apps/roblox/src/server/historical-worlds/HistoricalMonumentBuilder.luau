--!strict
-- HistoricalMonumentBuilder.luau
-- Procedural construction and interactive exhibit instantiation for Phoenician monuments.
-- Built exclusively from source-controlled primitives to ensure complete reproducibility and child safety.

local HistoricalMonumentBuilder = {}

local function createPart(parent: Instance, name: string, size: Vector3, position: Vector3, color: Color3, material: Enum.Material, anchored: boolean?, canCollide: boolean?): Part
	local part = Instance.new("Part")
	part.Name = name
	part.Size = size
	part.Position = position
	part.Color = color
	part.Material = material
	part.Anchored = if anchored ~= nil then anchored else true
	part.CanCollide = if canCollide ~= nil then canCollide else true
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth
	part.Parent = parent
	return part
end

local function createWedge(parent: Instance, name: string, size: Vector3, cframe: CFrame, color: Color3, material: Enum.Material): WedgePart
	local wedge = Instance.new("WedgePart")
	wedge.Name = name
	wedge.Size = size
	wedge.CFrame = cframe
	wedge.Color = color
	wedge.Material = material
	wedge.Anchored = true
	wedge.CanCollide = true
	wedge.TopSurface = Enum.SurfaceType.Smooth
	wedge.BottomSurface = Enum.SurfaceType.Smooth
	wedge.Parent = parent
	return wedge
end

local function addBillboard(parent: Instance, title: string, subtitle: string, accentColor: Color3)
	local bb = Instance.new("BillboardGui")
	bb.Name = "InfoBillboard"
	bb.Adornee = if parent:IsA("BasePart") then parent else nil
	bb.Size = UDim2.fromOffset(240, 68)
	bb.StudsOffset = Vector3.new(0, 5, 0)
	bb.AlwaysOnTop = true
	bb.MaxDistance = 60

	local frame = Instance.new("Frame")
	frame.Size = UDim2.fromScale(1, 1)
	frame.BackgroundColor3 = Color3.fromRGB(24, 28, 42)
	frame.BackgroundTransparency = 0.15
	frame.BorderSizePixel = 0
	frame.Parent = bb

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 8)
	corner.Parent = frame

	local stroke = Instance.new("UIStroke")
	stroke.Color = accentColor
	stroke.Thickness = 2
	stroke.Parent = frame

	local tLabel = Instance.new("TextLabel")
	tLabel.Size = UDim2.new(1, -12, 0.55, 0)
	tLabel.Position = UDim2.fromOffset(6, 2)
	tLabel.BackgroundTransparency = 1
	tLabel.Text = title
	tLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
	tLabel.TextScaled = true
	tLabel.Font = Enum.Font.GothamBold
	tLabel.Parent = frame

	local sLabel = Instance.new("TextLabel")
	sLabel.Size = UDim2.new(1, -12, 0.4, 0)
	sLabel.Position = UDim2.new(0, 6, 0.55, 0)
	sLabel.BackgroundTransparency = 1
	sLabel.Text = subtitle
	sLabel.TextColor3 = Color3.fromRGB(220, 230, 245)
	sLabel.TextScaled = true
	sLabel.Font = Enum.Font.Gotham
	sLabel.Parent = frame

	bb.Parent = parent
	return bb
end

-- ============================================================================
-- 1. TEMPLE OF THE OBELISKS (BYBLOS)
-- ============================================================================
function HistoricalMonumentBuilder.buildTempleOfObelisks(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Monument_TempleOfObelisks"
	model.Parent = parent

	-- Sacred courtyard floor
	local courtyard = createPart(model, "CourtyardFloor", Vector3.new(64, 1.5, 80), center, Color3.fromRGB(225, 215, 195), Enum.Material.Limestone)
	addBillboard(courtyard, "Temple of the Obelisks", "c. 1900–1600 BCE · Resheph Sanctuary", Color3.fromRGB(235, 180, 50))

	-- Enclosure perimeter walls
	local wallColor = Color3.fromRGB(205, 195, 175)
	local wallMat = Enum.Material.Cobblestone
	-- North wall
	createPart(model, "NorthWall", Vector3.new(64, 6, 2), center + Vector3.new(0, 3, -40), wallColor, wallMat)
	-- South wall with entry gap
	createPart(model, "SouthWallWest", Vector3.new(24, 6, 2), center + Vector3.new(-20, 3, 40), wallColor, wallMat)
	createPart(model, "SouthWallEast", Vector3.new(24, 6, 2), center + Vector3.new(20, 3, 40), wallColor, wallMat)
	-- West wall
	createPart(model, "WestWall", Vector3.new(2, 6, 80), center + Vector3.new(-32, 3, 0), wallColor, wallMat)
	-- East wall
	createPart(model, "EastWall", Vector3.new(2, 6, 80), center + Vector3.new(32, 3, 0), wallColor, wallMat)

	-- Central elevated sanctuary podium (Holy of Holies / Cella)
	local podiumCenter = center + Vector3.new(0, 3, -15)
	createPart(model, "SanctuaryPodium", Vector3.new(20, 4, 24), podiumCenter, Color3.fromRGB(230, 220, 200), Enum.Material.SmoothPlastic)
	-- Podium steps
	for i = 1, 3 do
		createPart(model, "PodiumStep" .. i, Vector3.new(12, 1, 3), podiumCenter + Vector3.new(0, -2 + i, 12 + (3 - i) * 2), Color3.fromRGB(215, 205, 185), Enum.Material.Cobblestone)
	end
	-- Central shrine altar
	local altar = createPart(model, "CentralAltar", Vector3.new(6, 3, 6), podiumCenter + Vector3.new(0, 3.5, -4), Color3.fromRGB(240, 235, 220), Enum.Material.Limestone)
	addBillboard(altar, "Sanctuary Cella", "Dedication to deity Resheph", Color3.fromRGB(255, 215, 0))

	-- The 26 Standing Limestone Obelisks (Baetyls)
	-- Documented by Maurice Dunand: upright limestone monoliths erected by devotees across the courtyard
	local obeliskOffsets = {
		Vector3.new(-22, 0, -26), Vector3.new(-16, 0, -28), Vector3.new(-10, 0, -26),
		Vector3.new(10, 0, -26), Vector3.new(16, 0, -28), Vector3.new(22, 0, -26),
		Vector3.new(-24, 0, -14), Vector3.new(-18, 0, -12), Vector3.new(18, 0, -12), Vector3.new(24, 0, -14),
		Vector3.new(-22, 0, 0), Vector3.new(-16, 0, 2), Vector3.new(-10, 0, 0),
		Vector3.new(10, 0, 0), Vector3.new(16, 0, 2), Vector3.new(22, 0, 0),
		Vector3.new(-24, 0, 14), Vector3.new(-18, 0, 16), Vector3.new(-12, 0, 14),
		Vector3.new(12, 0, 14), Vector3.new(18, 0, 16), Vector3.new(24, 0, 14),
		Vector3.new(-20, 0, 28), Vector3.new(-10, 0, 26), Vector3.new(10, 0, 26), Vector3.new(20, 0, 28),
	}

	for idx, offset in ipairs(obeliskOffsets) do
		local height = 7 + (idx % 5) * 1.5 -- Natural varied heights (7 to 13 studs)
		local width = 1.6 + (idx % 3) * 0.3
		local obBase = center + offset + Vector3.new(0, 0.75 + height / 2, 0)
		local obColor = if idx == 1 then Color3.fromRGB(245, 235, 210) else Color3.fromRGB(215, 205, 185)
		local pillar = createPart(model, "Obelisk_" .. idx, Vector3.new(width, height, width), obBase, obColor, Enum.Material.Limestone)

		-- Tapered pyramidion cap
		local cap = createPart(model, "ObeliskCap_" .. idx, Vector3.new(width * 0.7, 1.2, width * 0.7), obBase + Vector3.new(0, height / 2 + 0.6, 0), obColor, Enum.Material.Limestone)
		cap.CanCollide = false

		if idx == 1 then
			-- The Great Obelisk of Abishemu with interactive Prompt
			local prompt = Instance.new("ProximityPrompt")
			prompt.ObjectText = "Great Obelisk of Byblos"
			prompt.ActionText = "Read Dedication"
			prompt.HoldDuration = 0.5
			prompt.MaxActivationDistance = 14
			prompt.Parent = pillar
			addBillboard(pillar, "Monolith of Abishemu", "Obelisk #1 · Hieroglyphic Cartouche", Color3.fromRGB(240, 190, 40))
		end
	end

	-- Bronze Votive Deposit Case
	local votiveStand = createPart(model, "VotiveCase", Vector3.new(6, 3, 4), center + Vector3.new(0, 2.25, 20), Color3.fromRGB(180, 120, 60), Enum.Material.WoodPlanks)
	local glassCase = createPart(model, "GlassCase", Vector3.new(5.6, 2.5, 3.6), center + Vector3.new(0, 5, 20), Color3.fromRGB(200, 230, 255), Enum.Material.Glass)
	glassCase.Transparency = 0.6
	addBillboard(votiveStand, "Votive Offerings Deposit", "Cast bronze figurines of Resheph in conical caps", Color3.fromRGB(200, 140, 40))

	return model
end

-- ============================================================================
-- 2. EARLIER L-SHAPED TEMPLE (BYBLOS STRATIGRAPHIC LAYER)
-- ============================================================================
function HistoricalMonumentBuilder.buildLShapedTemple(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Monument_LShapedTemple"
	model.Parent = parent

	-- Excavation trench floor (-2 studs below modern datum)
	local trench = createPart(model, "ExcavationTrenchFloor", Vector3.new(48, 1, 56), center, Color3.fromRGB(160, 145, 125), Enum.Material.Mud)
	addBillboard(trench, "Earlier L-Shaped Temple Stratum", "c. 2600–2200 BCE · Third-Millennium Foundation", Color3.fromRGB(200, 100, 80))

	-- Archaic L-Shaped stone foundations
	local wallColor = Color3.fromRGB(175, 160, 140)
	local wallMat = Enum.Material.Cobblestone

	-- Wing 1 (North-South bar of L)
	createPart(model, "L_Wall_West", Vector3.new(3, 3, 36), center + Vector3.new(-16, 2, -6), wallColor, wallMat)
	createPart(model, "L_Wall_North", Vector3.new(24, 3, 3), center + Vector3.new(-4, 2, -24), wallColor, wallMat)

	-- Wing 2 (East-West bar of L)
	createPart(model, "L_Wall_InnerCorner", Vector3.new(3, 3, 20), center + Vector3.new(8, 2, -14), wallColor, wallMat)
	createPart(model, "L_Wall_EastExtension", Vector3.new(16, 3, 3), center + Vector3.new(16, 2, -4), wallColor, wallMat)
	createPart(model, "L_Wall_SouthReturn", Vector3.new(3, 3, 18), center + Vector3.new(24, 2, 5), wallColor, wallMat)
	createPart(model, "L_Wall_Base", Vector3.new(40, 3, 3), center + Vector3.new(4, 2, 14), wallColor, wallMat)

	-- Archaeological grid markers
	for _, cornerOffset in ipairs({ Vector3.new(-22, 1, -26), Vector3.new(22, 1, -26), Vector3.new(22, 1, 26), Vector3.new(-22, 1, 26) }) do
		local peg = createPart(model, "StratumPeg", Vector3.new(1, 4, 1), center + cornerOffset, Color3.fromRGB(240, 240, 240), Enum.Material.SmoothPlastic)
		peg.CanCollide = false
	end

	-- Stratigraphy exhibit plaque
	local plaque = createPart(model, "StratigraphyExhibit", Vector3.new(5, 2.5, 3), center + Vector3.new(0, 1.5, 24), Color3.fromRGB(40, 50, 70), Enum.Material.SmoothPlastic)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Stratigraphic Layer Exhibit"
	prompt.ActionText = "Compare Temple Eras"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = plaque
	addBillboard(plaque, "Stratigraphy Comparison", "How Dunand moved the Obelisk Temple to reveal this stratum", Color3.fromRGB(100, 180, 255))

	return model
end

-- ============================================================================
-- 3. AHIRAM SARCOPHAGUS & EPIGRAPHY PAVILION
-- ============================================================================
function HistoricalMonumentBuilder.buildAhiramSarcophagus(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Monument_AhiramSarcophagus"
	model.Parent = parent

	-- Protective open pavilion platform
	local pavilionFloor = createPart(model, "PavilionFloor", Vector3.new(28, 1.5, 36), center, Color3.fromRGB(240, 235, 225), Enum.Material.SmoothPlastic)
	addBillboard(pavilionFloor, "Ahiram Sarcophagus & Epigraphy", "c. 1000 BCE · King Ahiram of Byblos", Color3.fromRGB(220, 70, 70))

	-- Pavilion corner columns
	local colOffsets = { Vector3.new(-12, 6, -16), Vector3.new(12, 6, -16), Vector3.new(12, 6, 16), Vector3.new(-12, 6, 16) }
	for idx, colOff in ipairs(colOffsets) do
		createPart(model, "Column_" .. idx, Vector3.new(2.4, 12, 2.4), center + colOff, Color3.fromRGB(225, 220, 210), Enum.Material.Limestone)
	end
	-- Pavilion roof
	createPart(model, "PavilionRoof", Vector3.new(30, 1.5, 38), center + Vector3.new(0, 12.5, 0), Color3.fromRGB(180, 140, 100), Enum.Material.WoodPlanks)

	-- Sarcophagus Pedestal
	local pedCenter = center + Vector3.new(0, 1.5, 0)
	createPart(model, "SarcophagusPedestal", Vector3.new(14, 1.5, 22), pedCenter, Color3.fromRGB(210, 205, 195), Enum.Material.Cobblestone)

	-- Four recumbent sculpted lion base supports (at 4 corners)
	local lionOffsets = { Vector3.new(-5, 1.2, -8), Vector3.new(5, 1.2, -8), Vector3.new(5, 1.2, 8), Vector3.new(-5, 1.2, 8) }
	for idx, lOff in ipairs(lionOffsets) do
		createPart(model, "LionBase_" .. idx, Vector3.new(2.5, 1.8, 4), pedCenter + lOff, Color3.fromRGB(230, 225, 215), Enum.Material.Limestone)
	end

	-- Sarcophagus Chest (Limestone Tub)
	local chestCenter = pedCenter + Vector3.new(0, 3.2, 0)
	local sarcophagus = createPart(model, "SarcophagusChest", Vector3.new(9, 3.5, 16), chestCenter, Color3.fromRGB(245, 240, 230), Enum.Material.Limestone)

	-- Gabled Lid with Ridge
	local lidCenter = chestCenter + Vector3.new(0, 2.5, 0)
	createPart(model, "SarcophagusLid", Vector3.new(9.4, 1.4, 16.4), lidCenter, Color3.fromRGB(238, 233, 222), Enum.Material.Limestone)
	createPart(model, "LidRidge", Vector3.new(3, 1, 15), lidCenter + Vector3.new(0, 1.2, 0), Color3.fromRGB(230, 225, 215), Enum.Material.Limestone)

	-- Epigraphy Display Panel (The 22-letter linear Phoenician alphabet)
	local panel = createPart(model, "AlphabetDeciphermentStation", Vector3.new(7, 4, 1), center + Vector3.new(0, 3.5, 14), Color3.fromRGB(35, 45, 65), Enum.Material.SmoothPlastic)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Phoenician Alphabet Decipherment"
	prompt.ActionText = "Decipher Inscription"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = panel

	addBillboard(panel, "Phoenician Alphabet: 𐤀 𐤁 𐤂 𐤃", "Match 22 Phoenician letters to modern speech sounds", Color3.fromRGB(245, 200, 60))

	return model
end

-- ============================================================================
-- 4. ANCIENT MARITIME HARBOUR & QUAYS (BYBLOS)
-- ============================================================================
function HistoricalMonumentBuilder.buildAncientHarbor(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Monument_AncientHarbor"
	model.Parent = parent

	-- Stone Quay Pier
	local pier = createPart(model, "StoneQuay", Vector3.new(90, 3, 22), center, Color3.fromRGB(195, 185, 165), Enum.Material.Cobblestone)
	addBillboard(pier, "Ancient Byblos Harbour", "Port of the Byblos Boats & Cedar Export Quays", Color3.fromRGB(60, 160, 240))

	-- Mooring Bollards along edge
	for i = -36, 36, 18 do
		local bollard = createPart(model, "CedarBollard_" .. i, Vector3.new(1.8, 3, 1.8), center + Vector3.new(i, 2.5, 9), Color3.fromRGB(110, 75, 45), Enum.Material.WoodPlanks)
		bollard.CanCollide = false
	end

	-- Water basin (translucent blue)
	local water = createPart(model, "HarbourWater", Vector3.new(120, 2, 70), center + Vector3.new(0, -1, 45), Color3.fromRGB(30, 110, 160), Enum.Material.Glass)
	water.Transparency = 0.35
	water.CanCollide = false

	-- Moored Phoenician Merchant Ship (Gaulos / Round Ship)
	local shipCenter = center + Vector3.new(15, 1, 42)
	local hull = createPart(model, "ShipHull", Vector3.new(14, 5, 34), shipCenter, Color3.fromRGB(140, 95, 60), Enum.Material.WoodPlanks)
	-- Curved prow and stern
	createPart(model, "ProwStem", Vector3.new(12, 6, 6), shipCenter + Vector3.new(0, 3, -18), Color3.fromRGB(120, 80, 50), Enum.Material.WoodPlanks)
	createPart(model, "SternPost", Vector3.new(12, 6, 6), shipCenter + Vector3.new(0, 3, 18), Color3.fromRGB(120, 80, 50), Enum.Material.WoodPlanks)

	-- Horse head figurehead (*hippos*)
	local hippos = createPart(model, "HipposFigurehead", Vector3.new(3, 4, 4), shipCenter + Vector3.new(0, 7, -20), Color3.fromRGB(220, 180, 70), Enum.Material.SmoothPlastic)
	hippos.CanCollide = false

	-- Central Cedar Mast & Square Linen Sail
	createPart(model, "CedarMast", Vector3.new(2, 22, 2), shipCenter + Vector3.new(0, 12, 0), Color3.fromRGB(100, 65, 40), Enum.Material.Wood)
	createPart(model, "Yardarm", Vector3.new(24, 1.2, 1.2), shipCenter + Vector3.new(0, 18, 0), Color3.fromRGB(100, 65, 40), Enum.Material.Wood)
	local sail = createPart(model, "SquareSail", Vector3.new(22, 12, 0.4), shipCenter + Vector3.new(0, 13, 0.5), Color3.fromRGB(245, 240, 230), Enum.Material.Fabric)
	sail.CanCollide = false

	-- Cargo Amphorae in hold
	for x = -3, 3, 3 do
		for z = -6, 6, 4 do
			local amphora = createPart(model, "Amphora_" .. x .. "_" .. z, Vector3.new(1.6, 3, 1.6), shipCenter + Vector3.new(x, 2, z), Color3.fromRGB(200, 120, 80), Enum.Material.Limestone)
			amphora.CanCollide = false
		end
	end

	-- Wooden Gangplank connecting quay to ship
	local gangplank = createPart(model, "Gangplank", Vector3.new(5, 0.8, 16), center + Vector3.new(15, 1.2, 20), Color3.fromRGB(150, 105, 70), Enum.Material.WoodPlanks)

	-- Interactive Cargo Manifest Stand
	local stand = createPart(model, "CargoManifestStand", Vector3.new(4, 3, 3), center + Vector3.new(-15, 2.5, 0), Color3.fromRGB(45, 55, 75), Enum.Material.SmoothPlastic)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Cedar Trade Manifest"
	prompt.ActionText = "Inspect Cargo"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = stand
	addBillboard(stand, "Cedar Export Manifest", "Inspect timber shipments for Pharaoh Sneferu (c. 2600 BCE)", Color3.fromRGB(120, 220, 120))

	return model
end

-- ============================================================================
-- 5. PRE-332 BCE TYRE ISLAND CITADEL & SEA WALLS
-- ============================================================================
function HistoricalMonumentBuilder.buildTyreIslandCitadel(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Monument_TyreIslandCitadel"
	model.Parent = parent

	-- Elevated Rocky Island Foundation
	local island = createPart(model, "IslandRock", Vector3.new(120, 8, 120), center, Color3.fromRGB(180, 170, 150), Enum.Material.Slate)
	addBillboard(island, "Tyre Island Citadel", "Pre-332 BCE Offshore Rock of Melqart", Color3.fromRGB(160, 60, 180))

	-- Surrounding Ocean Water (Separating island from mainland)
	local sea = createPart(model, "IslandSea", Vector3.new(220, 2, 220), center + Vector3.new(0, -3, 0), Color3.fromRGB(25, 90, 140), Enum.Material.Glass)
	sea.Transparency = 0.4
	sea.CanCollide = false

	-- Submerged Ashlar Sea Walls with Interlocking Headers (Wave energy dissipation)
	local wallColor = Color3.fromRGB(195, 185, 165)
	local wallMat = Enum.Material.Cobblestone
	createPart(model, "NorthSeaWall", Vector3.new(124, 14, 6), center + Vector3.new(0, 5, -60), wallColor, wallMat)
	createPart(model, "SouthSeaWall", Vector3.new(124, 14, 6), center + Vector3.new(0, 5, 60), wallColor, wallMat)
	createPart(model, "WestSeaWall", Vector3.new(6, 14, 124), center + Vector3.new(-60, 5, 0), wallColor, wallMat)
	createPart(model, "EastSeaWall", Vector3.new(6, 14, 124), center + Vector3.new(60, 5, 0), wallColor, wallMat)

	-- Fortified Citadel Bastion
	createPart(model, "CitadelTowerNW", Vector3.new(14, 22, 14), center + Vector3.new(-55, 11, -55), wallColor, wallMat)
	createPart(model, "CitadelTowerNE", Vector3.new(14, 22, 14), center + Vector3.new(55, 11, -55), wallColor, wallMat)
	createPart(model, "CitadelTowerSW", Vector3.new(14, 22, 14), center + Vector3.new(-55, 11, 55), wallColor, wallMat)
	createPart(model, "CitadelTowerSE", Vector3.new(14, 22, 14), center + Vector3.new(55, 11, 55), wallColor, wallMat)

	-- Temple of Melqart Sacred Precinct (Herodotus: Gold & Emerald/Smaragdus Pillars)
	local templeCenter = center + Vector3.new(0, 5, -15)
	createPart(model, "MelqartPlatform", Vector3.new(34, 3, 30), templeCenter, Color3.fromRGB(225, 215, 195), Enum.Material.Limestone)
	local goldPillar = createPart(model, "GoldPillar", Vector3.new(2.5, 14, 2.5), templeCenter + Vector3.new(-10, 7, -6), Color3.fromRGB(255, 215, 0), Enum.Material.Metal)
	local smaragdusPillar = createPart(model, "SmaragdusPillar", Vector3.new(2.5, 14, 2.5), templeCenter + Vector3.new(10, 7, -6), Color3.fromRGB(40, 210, 120), Enum.Material.Neon)
	addBillboard(templeCenter, "Temple of Melqart", "Documented by Herodotus (Histories II.44)", Color3.fromRGB(255, 215, 0))

	return model
end

-- ============================================================================
-- 6. TYRE TWIN HARBORS (SIDONIAN & EGYPTIAN)
-- ============================================================================
function HistoricalMonumentBuilder.buildTyreTwinHarbors(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Monument_TyreTwinHarbors"
	model.Parent = parent

	-- Northern Sidonian Harbor (Calm water, sheltered by offshore reefs)
	local northQuay = createPart(model, "SidonianQuay", Vector3.new(70, 3, 14), center + Vector3.new(0, 1.5, -45), Color3.fromRGB(190, 180, 160), Enum.Material.Cobblestone)
	addBillboard(northQuay, "Sidonian Northern Harbour", "Sheltered from southern Mediterranean storms", Color3.fromRGB(70, 160, 240))

	-- Southern Egyptian Harbor (Facing south toward Egypt & Nile trade)
	local southQuay = createPart(model, "EgyptianQuay", Vector3.new(70, 3, 14), center + Vector3.new(0, 1.5, 45), Color3.fromRGB(190, 180, 160), Enum.Material.Cobblestone)
	addBillboard(southQuay, "Egyptian Southern Harbour", "Trade gateway with Nile Delta & Alexandria", Color3.fromRGB(230, 170, 60))

	-- Harbor Navigation Interactive Stand
	local stand = createPart(model, "HarborNavigationStand", Vector3.new(5, 3, 3), center + Vector3.new(0, 2, 0), Color3.fromRGB(40, 50, 70), Enum.Material.SmoothPlastic)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Tyre Twin Harbour Navigation"
	prompt.ActionText = "Examine Wind & Currents"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = stand
	addBillboard(stand, "Twin Harbor Navigation", "Understand how dual ports ensured 365-day maritime access", Color3.fromRGB(100, 200, 255))

	return model
end

-- ============================================================================
-- 7. ALEXANDER'S CAUSEWAY & TOMBOLO GEOLOGY EXHIBIT
-- ============================================================================
function HistoricalMonumentBuilder.buildAlexanderCausewayExhibit(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Monument_AlexanderCausewayExhibit"
	model.Parent = parent

	-- The 60-meter-wide stone mole
	local mole = createPart(model, "MacedonianMole", Vector3.new(24, 3, 120), center, Color3.fromRGB(170, 160, 140), Enum.Material.Cobblestone)
	addBillboard(mole, "Alexander's Mole (332 BCE)", "60-meter stone causeway constructed from Palaetyrus rubble", Color3.fromRGB(240, 90, 60))

	-- Accumulating Sand Tombolo Layers (trapped sediment)
	local westSand = createPart(model, "AccumulatedTomboloWest", Vector3.new(30, 2, 100), center + Vector3.new(-25, -0.5, 0), Color3.fromRGB(230, 215, 175), Enum.Material.Sand)
	local eastSand = createPart(model, "AccumulatedTomboloEast", Vector3.new(30, 2, 100), center + Vector3.new(25, -0.5, 0), Color3.fromRGB(230, 215, 175), Enum.Material.Sand)

	-- Geoarchaeological simulation stand
	local stand = createPart(model, "SedimentationSimulationStand", Vector3.new(6, 3, 4), center + Vector3.new(0, 2.5, 45), Color3.fromRGB(35, 45, 65), Enum.Material.SmoothPlastic)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Tombolo Sedimentation Simulation"
	prompt.ActionText = "Simulate 30 Million m³ Sand Drift"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = stand
	addBillboard(stand, "Geoarchaeological Simulation", "Marriner et al. (2007) Coastal Dynamics", Color3.fromRGB(255, 180, 50))

	return model
end

-- ============================================================================
-- 8. TYRIAN ROYAL PURPLE DYE INSTALLATION
-- ============================================================================
function HistoricalMonumentBuilder.buildTyrianPurpleWorkshop(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Workshop_TyrianPurple"
	model.Parent = parent

	local floor = createPart(model, "WorkshopFloor", Vector3.new(32, 1, 32), center, Color3.fromRGB(210, 200, 185), Enum.Material.Limestone)
	addBillboard(floor, "Tyrian Royal Purple Dye Atelier", "Biochemical Extraction of 6,6'-dibromoindigo", Color3.fromRGB(150, 40, 170))

	-- Lead Boiling Vats
	local vat1 = createPart(model, "LeadVat_1", Vector3.new(6, 4, 6), center + Vector3.new(-8, 2.5, -8), Color3.fromRGB(80, 85, 95), Enum.Material.Metal)
	local vat2 = createPart(model, "LeadVat_2", Vector3.new(6, 4, 6), center + Vector3.new(8, 2.5, -8), Color3.fromRGB(80, 85, 95), Enum.Material.Metal)

	-- Sunlight Photo-Oxidation Racks (Color Transition Display)
	local rack = createPart(model, "SunlightDryingRack", Vector3.new(18, 3, 4), center + Vector3.new(0, 2, 6), Color3.fromRGB(130, 90, 55), Enum.Material.WoodPlanks)
	-- Swatch: Pale yellow precursor -> Green intermediate -> Deep Royal Dibromoindigo Purple
	createPart(model, "ColorSwatchYellow", Vector3.new(4, 0.4, 3), center + Vector3.new(-6, 3.8, 6), Color3.fromRGB(245, 235, 120), Enum.Material.Fabric)
	createPart(model, "ColorSwatchGreen", Vector3.new(4, 0.4, 3), center + Vector3.new(0, 3.8, 6), Color3.fromRGB(80, 180, 100), Enum.Material.Fabric)
	createPart(model, "ColorSwatchPurple", Vector3.new(4, 0.4, 3), center + Vector3.new(6, 3.8, 6), Color3.fromRGB(105, 15, 95), Enum.Material.Fabric)

	local stand = createPart(model, "PigmentSortingStand", Vector3.new(5, 3, 3), center + Vector3.new(0, 2, -12), Color3.fromRGB(40, 30, 55), Enum.Material.SmoothPlastic)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Tyrian Purple Photochemistry"
	prompt.ActionText = "Observe Sunlight Oxidation"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = stand
	addBillboard(stand, "Safe Color Chemistry Puzzle", "Match sunlight exposure to produce non-fading imperial crimson", Color3.fromRGB(210, 80, 230))

	return model
end

-- ============================================================================
-- 9. SIDON TEMPLE OF ESHMUN & MONUMENTAL PODIUM
-- ============================================================================
function HistoricalMonumentBuilder.buildSidonTempleEshmun(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Monument_SidonTempleEshmun"
	model.Parent = parent

	-- Monumental Drafted Ashlar Podium (Podium of Bodashtart)
	local podium = createPart(model, "PodiumBodashtart", Vector3.new(80, 12, 60), center + Vector3.new(0, 6, 0), Color3.fromRGB(235, 225, 205), Enum.Material.Limestone)
	addBillboard(podium, "Sanctuary of Eshmun", "Bostan esh-Sheikh · King Bodashtart Podium", Color3.fromRGB(70, 180, 240))

	-- Sacred Mountain Water Conduits (Feeding healing ritual pools)
	local aqueduct = createPart(model, "WaterConduit", Vector3.new(8, 2, 70), center + Vector3.new(0, 13, 0), Color3.fromRGB(190, 180, 160), Enum.Material.Cobblestone)
	local waterFlow = createPart(model, "FlowingWater", Vector3.new(5, 1.2, 68), center + Vector3.new(0, 13.8, 0), Color3.fromRGB(40, 140, 220), Enum.Material.Glass)
	waterFlow.Transparency = 0.35
	waterFlow.CanCollide = false

	-- Ritual Ablution Purification Basin
	local basin = createPart(model, "AblutionBasin", Vector3.new(24, 3, 24), center + Vector3.new(0, 1.5, 40), Color3.fromRGB(210, 200, 180), Enum.Material.Limestone)
	local basinWater = createPart(model, "BasinWater", Vector3.new(20, 2, 20), center + Vector3.new(0, 2.2, 40), Color3.fromRGB(30, 120, 190), Enum.Material.Glass)
	basinWater.Transparency = 0.3
	basinWater.CanCollide = false

	-- Hydraulic Engineering Interactive Stand
	local stand = createPart(model, "HydraulicStand", Vector3.new(5, 3, 3), center + Vector3.new(-22, 2, 40), Color3.fromRGB(40, 50, 70), Enum.Material.SmoothPlastic)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Eshmun Hydraulic Conduits"
	prompt.ActionText = "Inspect Healing Aqueduct"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = stand
	addBillboard(stand, "Hydraulic Healing Engineering", "How ancient engineers routed the Asclepius river to sacred pools", Color3.fromRGB(100, 210, 255))

	return model
end

-- ============================================================================
-- 10. SIDON EMPTY THRONE OF ASTARTE
-- ============================================================================
function HistoricalMonumentBuilder.buildSidonThroneAstarte(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Monument_ThroneOfAstarte"
	model.Parent = parent

	-- Stone base
	local base = createPart(model, "ThroneBase", Vector3.new(12, 2, 10), center + Vector3.new(0, 1, 0), Color3.fromRGB(220, 210, 190), Enum.Material.Limestone)
	-- Empty Throne Seat (Aniconic divine presence)
	createPart(model, "ThroneSeat", Vector3.new(7, 3, 6), center + Vector3.new(0, 3.5, -1), Color3.fromRGB(230, 220, 200), Enum.Material.Limestone)
	createPart(model, "ThroneBack", Vector3.new(7, 8, 2), center + Vector3.new(0, 7, -4), Color3.fromRGB(230, 220, 200), Enum.Material.Limestone)

	-- Flanking Winged Sphinx Armrests
	createPart(model, "SphinxArmrestLeft", Vector3.new(2, 5, 6), center + Vector3.new(-4.5, 4.5, -1), Color3.fromRGB(215, 205, 185), Enum.Material.Limestone)
	createPart(model, "SphinxArmrestRight", Vector3.new(2, 5, 6), center + Vector3.new(4.5, 4.5, -1), Color3.fromRGB(215, 205, 185), Enum.Material.Limestone)

	local exhibitPlaque = createPart(model, "AniconicExhibitPlaque", Vector3.new(4, 2.5, 2), center + Vector3.new(0, 1.5, 7), Color3.fromRGB(35, 45, 65), Enum.Material.SmoothPlastic)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Throne of Astarte Exhibit"
	prompt.ActionText = "Read Cultural History"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = exhibitPlaque
	addBillboard(exhibitPlaque, "Aniconic Symbolism", "Why the Phoenicians left sacred thrones empty to honor the unseen", Color3.fromRGB(240, 190, 70))

	return model
end

-- ============================================================================
-- 11. SIDON CORE-FORMED GLASS ATELIER
-- ============================================================================
function HistoricalMonumentBuilder.buildSidonGlassWorkshop(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Workshop_SidonGlass"
	model.Parent = parent

	local floor = createPart(model, "GlassFloor", Vector3.new(28, 1, 28), center, Color3.fromRGB(205, 195, 180), Enum.Material.Limestone)
	addBillboard(floor, "Sidon Core-Formed Glass Atelier", "5th century BCE · Hot-Glass Manipulation", Color3.fromRGB(60, 170, 230))

	-- Artisan Furnace Bench
	createPart(model, "GlassFurnace", Vector3.new(8, 5, 8), center + Vector3.new(-7, 3, -6), Color3.fromRGB(160, 100, 60), Enum.Material.Cobblestone)
	-- Glowing crucible
	local crucible = createPart(model, "MoltenCrucible", Vector3.new(4, 2, 4), center + Vector3.new(-7, 6, -6), Color3.fromRGB(255, 140, 30), Enum.Material.Neon)
	crucible.CanCollide = false

	-- Workstation with Clay Mandrels and Combed Chevron Glass Vessels
	local bench = createPart(model, "ArtisanBench", Vector3.new(14, 3, 5), center + Vector3.new(4, 2, 4), Color3.fromRGB(130, 85, 50), Enum.Material.WoodPlanks)
	-- Amphoriskos on display
	createPart(model, "GlassVesselCobalt", Vector3.new(1.8, 3.2, 1.8), center + Vector3.new(2, 4.5, 4), Color3.fromRGB(20, 60, 160), Enum.Material.Glass)
	createPart(model, "GlassVesselTurquoise", Vector3.new(1.8, 3.2, 1.8), center + Vector3.new(6, 4.5, 4), Color3.fromRGB(40, 180, 180), Enum.Material.Glass)

	local stand = createPart(model, "GlassPuzzleStand", Vector3.new(4, 3, 3), center + Vector3.new(4, 2, -6), Color3.fromRGB(40, 50, 70), Enum.Material.SmoothPlastic)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Core-Formed Glass Crafting"
	prompt.ActionText = "Trail Vitreous Threads"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = stand
	addBillboard(stand, "Glass Chevron Puzzle", "Trail hot glass threads over revolving clay cores to craft amphoriskoi", Color3.fromRGB(120, 220, 255))

	return model
end

-- ============================================================================
-- 12. CARTHAGE BYRSA ACROPOLIS & DEFENSIVE BASTIONS
-- ============================================================================
function HistoricalMonumentBuilder.buildCarthageByrsa(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Monument_CarthageByrsa"
	model.Parent = parent

	-- Elevated Hilltop Acropolis Plateau
	local hill = createPart(model, "ByrsaHilltop", Vector3.new(120, 18, 120), center + Vector3.new(0, 9, 0), Color3.fromRGB(210, 195, 170), Enum.Material.Sandstone)
	addBillboard(hill, "Byrsa Acropolis of Carthage", "Qart-ḥadašt Citadel commanding the Gulf of Tunis", Color3.fromRGB(220, 70, 70))

	-- Punic Citadel Walls and Watchtowers
	local wallColor = Color3.fromRGB(200, 185, 160)
	local wallMat = Enum.Material.Cobblestone
	createPart(model, "ByrsaWallNorth", Vector3.new(100, 10, 5), center + Vector3.new(0, 23, -50), wallColor, wallMat)
	createPart(model, "ByrsaWallSouth", Vector3.new(100, 10, 5), center + Vector3.new(0, 23, 50), wallColor, wallMat)
	createPart(model, "ByrsaTowerEast", Vector3.new(16, 20, 16), center + Vector3.new(50, 28, 0), wallColor, wallMat)
	createPart(model, "ByrsaTowerWest", Vector3.new(16, 20, 16), center + Vector3.new(-50, 28, 0), wallColor, wallMat)

	-- Panoramic Survey Terrace Stand
	local stand = createPart(model, "ByrsaSurveyStand", Vector3.new(5, 3, 3), center + Vector3.new(0, 19.5, 0), Color3.fromRGB(35, 45, 65), Enum.Material.SmoothPlastic)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Byrsa Citadel Survey"
	prompt.ActionText = "Survey Punic Defenses"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = stand
	addBillboard(stand, "Byrsa Acropolis Survey", "Discover how Punic Carthage defended its maritime capital", Color3.fromRGB(255, 190, 80))

	return model
end

-- ============================================================================
-- 13. CARTHAGE MAGON QUARTER & OPUS AFRICANUM
-- ============================================================================
function HistoricalMonumentBuilder.buildCarthageMagonQuarter(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Monument_CarthageMagonQuarter"
	model.Parent = parent

	-- Residential Grid Base
	local base = createPart(model, "MagonStreetPaving", Vector3.new(80, 1.5, 80), center, Color3.fromRGB(220, 210, 195), Enum.Material.Cobblestone)
	addBillboard(base, "Magon Residential Quarter", "4th–2nd century BCE · Punic Urban Architecture", Color3.fromRGB(240, 140, 60))

	-- Opus Africanum House: Alternating vertical stone piers with rubble/mortar infill
	local houseCenter = center + Vector3.new(0, 1, 0)
	local pierColor = Color3.fromRGB(235, 225, 205)
	local infillColor = Color3.fromRGB(180, 165, 145)

	-- Vertical Stone Piers
	for x = -18, 18, 9 do
		createPart(model, "OpusPier_N_" .. x, Vector3.new(2.5, 10, 2.5), houseCenter + Vector3.new(x, 5.5, -16), pierColor, Enum.Material.Limestone)
		createPart(model, "OpusPier_S_" .. x, Vector3.new(2.5, 10, 2.5), houseCenter + Vector3.new(x, 5.5, 16), pierColor, Enum.Material.Limestone)
	end

	-- Rubble Wall Infill between piers
	for x = -13.5, 13.5, 9 do
		createPart(model, "OpusInfill_N_" .. x, Vector3.new(6.5, 9.5, 1.8), houseCenter + Vector3.new(x, 5.25, -16), infillColor, Enum.Material.Cobblestone)
		createPart(model, "OpusInfill_S_" .. x, Vector3.new(6.5, 9.5, 1.8), houseCenter + Vector3.new(x, 5.25, 16), infillColor, Enum.Material.Cobblestone)
	end

	-- Central Peristyle Courtyard & Rainwater Cistern
	local cistern = createPart(model, "DomesticCistern", Vector3.new(8, 2, 8), houseCenter + Vector3.new(0, 1, 0), Color3.fromRGB(50, 120, 170), Enum.Material.Glass)
	cistern.Transparency = 0.35

	-- Interactive Opus Africanum Assembly Puzzle Stand
	local stand = createPart(model, "OpusAfricanumPuzzleStand", Vector3.new(5, 3, 3), center + Vector3.new(0, 2.5, 28), Color3.fromRGB(40, 50, 70), Enum.Material.SmoothPlastic)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Opus Africanum Masonry"
	prompt.ActionText = "Assemble Pier & Infill Frame"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = stand
	addBillboard(stand, "Opus Africanum Assembly", "Learn how Punic builders framed walls with heavy stone piers", Color3.fromRGB(240, 200, 70))

	return model
end

-- ============================================================================
-- 14. CARTHAGE COTHON (CIRCULAR NAVAL BASIN)
-- ============================================================================
function HistoricalMonumentBuilder.buildCarthageCothon(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Monument_CarthageCothon"
	model.Parent = parent

	-- Outer circular quay ring
	local water = createPart(model, "CircularNavalBasin", Vector3.new(120, 2, 120), center + Vector3.new(0, -1, 0), Color3.fromRGB(30, 105, 155), Enum.Material.Glass)
	water.Transparency = 0.35
	water.CanCollide = false
	addBillboard(water, "Punic Cothon (Naval Harbour)", "Circular military port with dry docks for 220 warships", Color3.fromRGB(60, 160, 240))

	-- Central Island: Ilot de l'Amirauté (Admiral's Headquarters)
	local island = createPart(model, "IlotAmiraute", Vector3.new(38, 4, 38), center + Vector3.new(0, 1, 0), Color3.fromRGB(215, 205, 185), Enum.Material.Limestone)
	local headquarters = createPart(model, "AdmiralPavilion", Vector3.new(18, 12, 18), center + Vector3.new(0, 8, 0), Color3.fromRGB(240, 230, 210), Enum.Material.SmoothPlastic)
	addBillboard(headquarters, "Ilot de l'Amirauté", "360° sightlines across all 220 radial warship slipways", Color3.fromRGB(255, 215, 0))

	-- Radial Ship Slipway Ramps
	local angles = { 0, 45, 90, 135, 180, 225, 270, 315 }
	for _, deg in ipairs(angles) do
		local rad = math.rad(deg)
		local slipCenter = center + Vector3.new(math.cos(rad) * 44, 1.2, math.sin(rad) * 44)
		local ramp = createPart(model, "Slipway_" .. deg, Vector3.new(8, 2, 16), slipCenter, Color3.fromRGB(150, 105, 70), Enum.Material.WoodPlanks)
		ramp.CFrame = CFrame.lookAt(slipCenter, center + Vector3.new(0, 1.2, 0))
	end

	-- Cothon Naval Architecture Puzzle Stand
	local stand = createPart(model, "CothonPuzzleStand", Vector3.new(5, 3, 3), center + Vector3.new(0, 2.5, 48), Color3.fromRGB(35, 45, 65), Enum.Material.SmoothPlastic)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Cothon Naval Engineering"
	prompt.ActionText = "Examine Dockyard Geometry"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = stand
	addBillboard(stand, "Cothon Naval Engineering", "Hurst & Stager UNESCO Excavations (1994)", Color3.fromRGB(100, 210, 255))

	return model
end

-- ============================================================================
-- 15. CARTHAGE TOPHET ARCHEOLOGICAL STELAE GALLERY
-- ============================================================================
function HistoricalMonumentBuilder.buildCarthageTophetExhibit(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Monument_CarthageTophetExhibit"
	model.Parent = parent

	local floor = createPart(model, "GalleryFloor", Vector3.new(44, 1, 36), center, Color3.fromRGB(195, 185, 170), Enum.Material.Sandstone)
	addBillboard(floor, "Tophet Epigraphic Stelae Gallery", "Respectful, age-appropriate archaeological debate analysis", Color3.fromRGB(200, 100, 80))

	-- Carved Limestone Votive Stelae with Symbol of Tanit
	local stelaePositions = {
		Vector3.new(-14, 0, -10), Vector3.new(-7, 0, -10), Vector3.new(0, 0, -10), Vector3.new(7, 0, -10), Vector3.new(14, 0, -10),
		Vector3.new(-14, 0, 4), Vector3.new(-7, 0, 4), Vector3.new(0, 0, 4), Vector3.new(7, 0, 4), Vector3.new(14, 0, 4),
	}

	for idx, sPos in ipairs(stelaePositions) do
		local stela = createPart(model, "StelaTanit_" .. idx, Vector3.new(2, 5, 1), center + sPos + Vector3.new(0, 3, 0), Color3.fromRGB(225, 220, 205), Enum.Material.Limestone)
		-- Carved Tanit Triangular Symbol Representation
		local emblem = createPart(model, "TanitEmblem_" .. idx, Vector3.new(1.2, 1.2, 0.2), center + sPos + Vector3.new(0, 4.5, 0.6), Color3.fromRGB(240, 190, 60), Enum.Material.Neon)
		emblem.CanCollide = false
	end

	-- Epistemic Analysis Interactive Stand
	local stand = createPart(model, "TophetEpistemicStand", Vector3.new(5, 3, 3), center + Vector3.new(0, 2, 14), Color3.fromRGB(40, 45, 60), Enum.Material.SmoothPlastic)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Tophet Epistemic Debate"
	prompt.ActionText = "Examine Competing Theories"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = stand
	addBillboard(stand, "Archaeological Evidence vs. Text", "Understand modern debate: infant cemetery vs sacrificial cult", Color3.fromRGB(255, 190, 100))

	return model
end

-- ============================================================================
-- 16. MOTYA SUBMERGED CAUSEWAY TO BIRGI
-- ============================================================================
function HistoricalMonumentBuilder.buildMotyaCauseway(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Monument_MotyaSubmergedCauseway"
	model.Parent = parent

	-- Shallow Stagnone Lagoon Water
	local lagoon = createPart(model, "LagoonWater", Vector3.new(80, 1.5, 140), center + Vector3.new(0, -0.2, 0), Color3.fromRGB(40, 130, 170), Enum.Material.Glass)
	lagoon.Transparency = 0.4
	lagoon.CanCollide = false
	addBillboard(lagoon, "Motya Submerged Causeway", "1.7 km stone road across shallow Stagnone lagoon to Birgi", Color3.fromRGB(60, 200, 160))

	-- Submerged Basalt Stone Road (water covers it by ~0.5 studs)
	local road = createPart(model, "SubmergedBasaltRoad", Vector3.new(12, 1.2, 130), center + Vector3.new(0, -0.4, 0), Color3.fromRGB(80, 85, 95), Enum.Material.Cobblestone)

	-- Wagon Navigation Guide Stand
	local stand = createPart(model, "CausewayNavigationStand", Vector3.new(4, 3, 3), center + Vector3.new(0, 2, 50), Color3.fromRGB(35, 45, 65), Enum.Material.SmoothPlastic)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Motya Lagoon Navigation"
	prompt.ActionText = "Follow Underwater Road"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = stand
	addBillboard(stand, "Lagoon Causeway Crossing", "How carts crossed to mainland Sicily while concealed from warships", Color3.fromRGB(120, 240, 180))

	return model
end

-- ============================================================================
-- 17. MOTYA KOTHON & SACRED POOL
-- ============================================================================
function HistoricalMonumentBuilder.buildMotyaCothon(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Monument_MotyaCothon"
	model.Parent = parent

	-- Rectangular stone basin quay border
	local quayColor = Color3.fromRGB(195, 185, 165)
	local quayMat = Enum.Material.Limestone
	createPart(model, "MotyaQuayN", Vector3.new(44, 3, 4), center + Vector3.new(0, 1.5, -28), quayColor, quayMat)
	createPart(model, "MotyaQuayS", Vector3.new(44, 3, 4), center + Vector3.new(0, 1.5, 28), quayColor, quayMat)
	createPart(model, "MotyaQuayW", Vector3.new(4, 3, 52), center + Vector3.new(-20, 1.5, 0), quayColor, quayMat)
	createPart(model, "MotyaQuayE", Vector3.new(4, 3, 52), center + Vector3.new(20, 1.5, 0), quayColor, quayMat)

	-- Freshwater Sacred Pool / Basin Water
	local water = createPart(model, "MotyaPoolWater", Vector3.new(36, 1.5, 52), center + Vector3.new(0, 0.5, 0), Color3.fromRGB(35, 140, 180), Enum.Material.Glass)
	water.Transparency = 0.35
	water.CanCollide = false
	addBillboard(water, "Motya Kothon Basin", "Rectangular stone-lined freshwater sacred basin / naval repair dock", Color3.fromRGB(70, 210, 170))

	return model
end

-- ============================================================================
-- 18. PUNIC WAR GALLEY (TRIREME / MARSALA SHIPWRECK)
-- ============================================================================
function HistoricalMonumentBuilder.buildPunicWarship(parent: Instance, center: Vector3): Model
	local model = Instance.new("Model")
	model.Name = "Ship_PunicWarship"
	model.Parent = parent

	-- Long slender ramming hull
	local hull = createPart(model, "WarshipHull", Vector3.new(10, 4.5, 58), center, Color3.fromRGB(115, 75, 45), Enum.Material.WoodPlanks)
	addBillboard(hull, "Punic War Galley (Trireme)", "Marsala Shipwreck Mortise-and-Tenon Architecture", Color3.fromRGB(220, 80, 60))

	-- Bronze-sheathed underwater rostrum ram (fitted directly to the keel)
	local ram = createPart(model, "BronzeRam", Vector3.new(4, 3, 6), center + Vector3.new(0, -0.5, -31), Color3.fromRGB(195, 140, 50), Enum.Material.Metal)
	ram.CanCollide = true

	-- Upper Outriggers (parexeiresia) supporting rowers
	createPart(model, "OutriggerPort", Vector3.new(2, 1.2, 48), center + Vector3.new(-5.8, 2.5, 0), Color3.fromRGB(140, 95, 60), Enum.Material.Wood)
	createPart(model, "OutriggerStarboard", Vector3.new(2, 1.2, 48), center + Vector3.new(5.8, 2.5, 0), Color3.fromRGB(140, 95, 60), Enum.Material.Wood)

	-- Joinery interactive stand (Honor Frost Marsala Shipwreck puzzle)
	local stand = createPart(model, "MarsalaJoineryStand", Vector3.new(4, 3, 3), center + Vector3.new(10, 2, 0), Color3.fromRGB(40, 45, 65), Enum.Material.SmoothPlastic)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Marsala Ship Joinery"
	prompt.ActionText = "Inspect Mortise & Tenon"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 14
	prompt.Parent = stand
	addBillboard(stand, "Mortise-and-Tenon Assembly", "Honor Frost Marsala Excavation (1981)", Color3.fromRGB(255, 190, 80))

	return model
end

return HistoricalMonumentBuilder
