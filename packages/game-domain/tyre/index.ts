/**
 * Tyre: The Rock of Melqart — Game Domain Simulation & Rule Engine (`packages/game-domain/tyre/index.ts`)
 * Implements historical and geoarchaeological rules based on primary sources:
 *  - Murex purple stoichiometry (10,000 snails/gram) & odor safety dispersion
 *  - Fireship kinetic & thermal collision mechanics vs siege towers
 *  - Longshore drift tombolo sedimentation (30,000–50,000 m³/year)
 *  - High-purity silver Shekel assay validation for Temple tax
 *  - Vassal Treaty of Esarhaddon maritime salvage jurisdiction
 */

export interface MurexStoichiometryResult {
  snailsHarvested: number;
  gramsDibromoindigo: number;
  eliteGarmentsHemDyed: number;
  shellMoundVolumeM3: number;
  odorDownwindSafetyDistanceMeters: number;
  isDownwindSafe: boolean;
}

/**
 * Calculates Tyrian purple dye yield and environmental impact.
 * Primary source: Pliny the Elder, Nat. Hist. IX.60-65; modern experimental archaeology.
 */
export function calculateMurexYield(
  snailsHarvested: number,
  workshopPlacementMetersDownwind: number
): MurexStoichiometryResult {
  const SNAILS_PER_GRAM = 10000;
  const gramsDibromoindigo = Math.round((snailsHarvested / SNAILS_PER_GRAM) * 1000) / 1000;
  // 1 gram dyes roughly the hem of 1 elite garment
  const eliteGarmentsHemDyed = Math.floor(gramsDibromoindigo);
  // Average Murex snail shell volume ~ 0.000025 m3 (25 cm3)
  const shellMoundVolumeM3 = Math.round(snailsHarvested * 0.000025 * 100) / 100;
  // Dispersion safety distance: minimum 350 meters downwind from residential palace quarters
  const odorDownwindSafetyDistanceMeters = 350;
  const isDownwindSafe = workshopPlacementMetersDownwind >= odorDownwindSafetyDistanceMeters;

  return {
    snailsHarvested,
    gramsDibromoindigo,
    eliteGarmentsHemDyed,
    shellMoundVolumeM3,
    odorDownwindSafetyDistanceMeters,
    isDownwindSafe,
  };
}

export interface FireshipParams {
  windDirectionDegrees: number; // 0=N, 90=E, 180=S, 270=W
  sternBallastKg: number;
  pitchKg: number;
  sulfurKg: number;
  oilCauldronsCount: number;
}

export interface FireshipResult {
  successfulStrike: boolean;
  bowElevationMeters: number;
  burnTemperatureCelsius: number;
  siegeTowersDestroyed: number;
  moleDamagePercent: number;
  tacticalSummary: string;
}

/**
 * Simulates the Tyrian fireship counter-strike against Alexander's mole siege towers (332 BCE).
 * Primary source: Arrian, Anabasis of Alexander II.19.
 */
export function simulateFireshipDefense(params: FireshipParams): FireshipResult {
  // Stern ballast must tilt bow up by at least 1.2 meters to clear Macedonian palisades
  const bowElevationMeters = Math.min(2.5, Math.round((params.sternBallastKg / 800) * 10) / 10);
  const clearsPalisade = bowElevationMeters >= 1.2;

  // Favorable wind blowing towards the mole eastward (between 210° and 310° westerly/SW)
  const windFavorable = params.windDirectionDegrees >= 210 && params.windDirectionDegrees <= 310;

  // Combustion chemistry: pitch + sulfur reaches > 1100°C
  const burnTemperatureCelsius = Math.min(
    1450,
    600 + Math.floor(params.pitchKg * 1.5) + Math.floor(params.sulfurKg * 2.2)
  );
  const adequateCombustion = burnTemperatureCelsius >= 1100 && params.oilCauldronsCount >= 2;

  const successfulStrike = clearsPalisade && windFavorable && adequateCombustion;

  if (successfulStrike) {
    return {
      successfulStrike: true,
      bowElevationMeters,
      burnTemperatureCelsius,
      siegeTowersDestroyed: 2,
      moleDamagePercent: 65,
      tacticalSummary:
        'Tactical Victory: The fireship crested the Macedonian defensive booms. Suspended oil cauldrons snapped forward upon collision, utterly incinerating both siege towers to the waterline and stopping construction.',
    };
  }

  let failureReason = '';
  if (!clearsPalisade) failureReason += 'Stern ballast was insufficient to elevate bow over defensive booms. ';
  if (!windFavorable) failureReason += 'Unfavorable wind direction failed to carry the burning hull into the mole. ';
  if (!adequateCombustion) failureReason += 'Combustible pitch and sulfur payload was insufficient to ignite towers.';

  return {
    successfulStrike: false,
    bowElevationMeters,
    burnTemperatureCelsius,
    siegeTowersDestroyed: 0,
    moleDamagePercent: 10,
    tacticalSummary: `Mission Failed: ${failureReason.trim()}`,
  };
}

export interface TomboloSedimentationMetrics {
  yearsPost332BCE: number;
  totalSedimentAccumulatedM3: number;
  tomboloWidthMeters: number;
  islandFusedToMainland: boolean;
  egyptianHarborSilted: boolean;
  romanBathConstructionPermitted: boolean;
}

/**
 * Calculates longshore drift sediment accumulation along Alexander's 60-meter mole.
 * Primary source: Marriner, Morhange, Boudagher-Fadel (PNAS 2007).
 */
export function calculateTomboloAccretion(yearsPost332BCE: number): TomboloSedimentationMetrics {
  const years = Math.max(0, yearsPost332BCE);
  const ANNUAL_ACCRETION_M3 = 40000; // 30,000 to 50,000 m3 per year
  const MAX_SEDIMENT_CAP_M3 = 30000000; // 30 million cubic meters accumulated

  const totalSedimentAccumulatedM3 = Math.min(MAX_SEDIMENT_CAP_M3, years * ANNUAL_ACCRETION_M3);

  // Initial mole width = 60m (two plethra); expands up to ~500m wide sandy isthmus
  const tomboloWidthMeters = Math.min(500, 60 + Math.floor((totalSedimentAccumulatedM3 / MAX_SEDIMENT_CAP_M3) * 440));

  // Island permanently fused once sand reaches ~4 million m3 (~100 years post-siege)
  const islandFusedToMainland = totalSedimentAccumulatedM3 >= 4000000;

  // Southern Egyptian harbor basin silted over once sand reaches ~12 million m3 (~300 years)
  const egyptianHarborSilted = totalSedimentAccumulatedM3 >= 12000000;

  // Roman bath complex built in Roman Imperial era (~1st-2nd century CE, ~400+ years post-siege)
  const romanBathConstructionPermitted = years >= 400 && egyptianHarborSilted;

  return {
    yearsPost332BCE: years,
    totalSedimentAccumulatedM3,
    tomboloWidthMeters,
    islandFusedToMainland,
    egyptianHarborSilted,
    romanBathConstructionPermitted,
  };
}

export interface ShekelAssayResult {
  silverPurityPct: number;
  weightGrams: number;
  meetsSecondTempleTaxStandard: boolean;
  historicalThirtyPiecesEligible: boolean;
  notes: string;
}

/**
 * Validates metallurgical purity and weight of the Silver Shekel of Tyre.
 * Primary source: Mishnah Bekhorot 8:7; British Museum numismatic assays.
 */
export function validateTyrianShekelAssay(
  weightGrams: number,
  silverPurityPct: number
): ShekelAssayResult {
  // Standard Tyrian tetradrachm weight ~14.0 to 14.3 grams
  const validWeight = weightGrams >= 13.8 && weightGrams <= 14.5;
  // Mandatory silver purity: 94% to 98%
  const validPurity = silverPurityPct >= 94.0 && silverPurityPct <= 99.5;

  const meetsSecondTempleTaxStandard = validWeight && validPurity;
  const historicalThirtyPiecesEligible = meetsSecondTempleTaxStandard;

  let notes = '';
  if (meetsSecondTempleTaxStandard) {
    notes =
      'Passed Assay: Exceptional silver purity (>=94%) and standard tetradrachm weight meets strict halakhic requirements for Jerusalem Second Temple half-shekel dues.';
  } else {
    notes =
      'Failed Assay: Specimen falls outside the canonical Tyrian silver purity or weight standard and is rejected by the Temple money-changers.';
  }

  return {
    silverPurityPct,
    weightGrams,
    meetsSecondTempleTaxStandard,
    historicalThirtyPiecesEligible,
    notes,
  };
}

export interface TreatySalvageOutcome {
  jurisdiction: 'ASSYRIAN_IMPERIAL' | 'TYRIAN_SOVEREIGN' | 'INTERNATIONAL_WATERS';
  cargoBelongsTo: 'ESARHADDON' | 'BAAL_OF_TYRE';
  crewSpared: boolean;
  divineCurseTriggered: boolean;
  legalSummary: string;
}

/**
 * Evaluates shipwreck salvage jurisdiction under the 672 BCE Vassal Treaty of Esarhaddon.
 * Primary source: State Archives of Assyria II, Text 5.
 */
export function evaluateEsarhaddonTreatySalvage(
  coastlineLocation: 'pilistu' | 'tyrian_home_waters' | 'open_mediterranean',
  isShipwrecked: boolean
): TreatySalvageOutcome {
  if (coastlineLocation === 'pilistu' && isShipwrecked) {
    return {
      jurisdiction: 'ASSYRIAN_IMPERIAL',
      cargoBelongsTo: 'ESARHADDON',
      crewSpared: true,
      divineCurseTriggered: false,
      legalSummary:
        'Clause IV.1-5 Enforced: Shipwreck occurred along Pilistu / Assyrian coastal borders. By treaty, all cargo is forfeited to Emperor Esarhaddon, though the Tyrian crew is permitted to live.',
    };
  }

  if (coastlineLocation === 'tyrian_home_waters') {
    return {
      jurisdiction: 'TYRIAN_SOVEREIGN',
      cargoBelongsTo: 'BAAL_OF_TYRE',
      crewSpared: true,
      divineCurseTriggered: false,
      legalSummary:
        'Tyrian Island Waters: Within the home breakwaters of Tyre, King Ba\'al retains full ownership over maritime cargo and salvage.',
    };
  }

  return {
    jurisdiction: 'INTERNATIONAL_WATERS',
    cargoBelongsTo: 'BAAL_OF_TYRE',
    crewSpared: true,
    divineCurseTriggered: false,
    legalSummary:
      'Open Maritime Sea Lanes: Vessel operates under Phoenician maritime convention outside Assyrian coastal jurisdiction.',
  };
}
