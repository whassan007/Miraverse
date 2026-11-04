--!strict
-- PhoenicianWorldRegistry.luau
-- Authoritative spatial layout and site registry for the 5 Phoenician historical environments.
-- Operates in designated historical coordinate cells (Z >= 1600) to ensure zero spatial collision with contemporary countries.

local PhoenicianWorldRegistry = {}

export type HistoricalSiteDef = {
	siteId: string,
	name: string,
	displayName: string,
	nativeName: string,
	region: string,
	coordinates: { number }?,
	origin: Vector3,
	spawn: Vector3,
	primaryEra: string,
	priority: string,
	unescoSiteId: number?,
	monumentIds: { string },
}

PhoenicianWorldRegistry.HUB_ORIGIN = Vector3.new(0, 10, 1600)
PhoenicianWorldRegistry.HUB_SPAWN = Vector3.new(0, 10.5, 1600)

local SITES: { [string]: HistoricalSiteDef } = {
	hist_byblos = {
		siteId = "hist_byblos",
		name = "Ancient Byblos (Gebal)",
		displayName = "Ancient Byblos",
		nativeName = "جُبَيْل الفينيقية القديمة",
		region = "Lebanon",
		coordinates = { 34.1208, 35.6481 },
		origin = Vector3.new(800, 10, 1600),
		spawn = Vector3.new(800, 10.5, 1628),
		primaryEra = "Bronze & Iron Age (c. 2800 – 500 BCE)",
		priority = "P0",
		unescoSiteId = 295,
		monumentIds = {
			"byblos_temple_obelisks",
			"byblos_l_shaped_temple",
			"byblos_ahiram_sarcophagus",
			"byblos_ancient_harbor",
		},
	},
	hist_tyre = {
		siteId = "hist_tyre",
		name = "Ancient Tyre (Ṣūr)",
		displayName = "Ancient Tyre",
		nativeName = "صُور الفينيقية",
		region = "Lebanon",
		coordinates = { 33.2709, 35.1963 },
		origin = Vector3.new(800, 10, 2400),
		spawn = Vector3.new(800, 10.5, 2428),
		primaryEra = "Iron Age Island City (c. 1000 – 332 BCE)",
		priority = "P0",
		unescoSiteId = 299,
		monumentIds = {
			"tyre_island_citadel",
			"tyre_twin_harbors",
			"tyre_alexander_causeway_exhibit",
		},
	},
	hist_sidon = {
		siteId = "hist_sidon",
		name = "Ancient Sidon (Ṣaydūn)",
		displayName = "Ancient Sidon",
		nativeName = "صَيْدا الفينيقية",
		region = "Lebanon",
		coordinates = { 33.5631, 35.3689 },
		origin = Vector3.new(800, 10, 3200),
		spawn = Vector3.new(800, 10.5, 3228),
		primaryEra = "Persian & Hellenistic (c. 600 – 200 BCE)",
		priority = "P1",
		unescoSiteId = nil,
		monumentIds = {
			"sidon_temple_eshmun",
		},
	},
	hist_carthage = {
		siteId = "hist_carthage",
		name = "Punic Carthage (Qart-ḥadašt)",
		displayName = "Punic Carthage",
		nativeName = "قرطاج البونية",
		region = "Tunisia",
		coordinates = { 36.8528, 10.3233 },
		origin = Vector3.new(800, 10, 4000),
		spawn = Vector3.new(800, 10.5, 4028),
		primaryEra = "Punic Golden Age (c. 814 – 146 BCE)",
		priority = "P1",
		unescoSiteId = 37,
		monumentIds = {
			"carthage_magon_quarter",
			"carthage_cothon_harbor",
		},
	},
	hist_motya = {
		siteId = "hist_motya",
		name = "Ancient Motya (Mozia)",
		displayName = "Ancient Motya",
		nativeName = "موتيا الفينيقية",
		region = "Sicily, Italy",
		coordinates = { 37.8683, 12.4686 },
		origin = Vector3.new(800, 10, 4800),
		spawn = Vector3.new(800, 10.5, 4828),
		primaryEra = "Archaic & Classical (c. 800 – 397 BCE)",
		priority = "P2",
		unescoSiteId = nil,
		monumentIds = {
			"motya_submerged_causeway",
		},
	},
}

PhoenicianWorldRegistry.SITE_ORDER = { "hist_byblos", "hist_tyre", "hist_sidon", "hist_carthage", "hist_motya" }
PhoenicianWorldRegistry.SITES = SITES

function PhoenicianWorldRegistry.getSite(siteId: string): HistoricalSiteDef?
	return SITES[siteId]
end

function PhoenicianWorldRegistry.getAllSites(): { HistoricalSiteDef }
	local list: { HistoricalSiteDef } = {}
	for _, id in PhoenicianWorldRegistry.SITE_ORDER do
		local s = SITES[id]
		if s then
			table.insert(list, s)
		end
	end
	return list
end

return PhoenicianWorldRegistry
