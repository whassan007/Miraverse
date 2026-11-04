--!strict
-- HistoricalPeriodRegistry.luau
-- Authoritative chronological framework and stratigraphic layer definitions for Phoenician historical worlds.

local HistoricalPeriodRegistry = {}

export type HistoricalEra = {
	eraId: string,
	displayName: string,
	dateRange: string,
	startYearBCE: number,
	endYearBCE: number,
	description: string,
}

local ERAS: { [string]: HistoricalEra } = {
	bronze_age = {
		eraId = "bronze_age",
		displayName = "Early & Middle Bronze Age",
		dateRange = "c. 3000 – 1200 BCE",
		startYearBCE = 3000,
		endYearBCE = 1200,
		description = "Earliest urban temples, cedar trade to Old Kingdom Egypt, and proto-Canaanite script development.",
	},
	iron_age = {
		eraId = "iron_age",
		displayName = "Iron Age Golden Age & Colonization",
		dateRange = "c. 1200 – 539 BCE",
		startYearBCE = 1200,
		endYearBCE = 539,
		description = "Hiram I building Tyre, Ahiram 22-letter linear alphabet, founding of Carthage, and purple dye monopoly.",
	},
	persian_classical = {
		eraId = "persian_classical",
		displayName = "Persian Era & Western Punic Dominance",
		dateRange = "c. 539 – 332 BCE",
		startYearBCE = 539,
		endYearBCE = 332,
		description = "Sidon flagship naval supremacy, Temple of Eshmun podium, and Motya lagoon engineering.",
	},
	hellenistic_punic = {
		eraId = "hellenistic_punic",
		displayName = "Alexander's Siege & Punic Wars",
		dateRange = "c. 332 – 146 BCE",
		startYearBCE = 332,
		endYearBCE = 146,
		description = "Alexander's mole creating the Tyre tombolo, circular military Cothon at Carthage, and Aegates naval battles.",
	},
}

HistoricalPeriodRegistry.ERAS = ERAS

function HistoricalPeriodRegistry.getEra(eraId: string): HistoricalEra?
	return ERAS[eraId]
end

return HistoricalPeriodRegistry
