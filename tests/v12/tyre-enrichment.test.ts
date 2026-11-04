/**
 * Tyre: The Rock of Melqart — Comprehensive Automated Verification Suite
 * Verifies all deliverables for Tyre implementation and enrichment:
 *  1. Canonical Knowledge Records (10 records validated with validateKnowledgeRecordV12)
 *  2. Source Registry & Checksum Integrity
 *  3. Quest Acts & 20 Age-Tier Variations (5 acts x 4 tiers)
 *  4. Quest Pack Schema & Archetype Mechanics (gather, trade, build, cook, word)
 *  5. WGS84 Geoarchaeological Coordinates & Bathymetric Points
 *  6. Game Domain Simulation: Murex stoichiometry, fireship kinetics, tombolo sedimentation, shekel assay, and treaty salvage
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { validateKnowledgeRecordV12 } from '../../packages/knowledge-v12/index';
import {
  calculateMurexYield,
  simulateFireshipDefense,
  calculateTomboloAccretion,
  validateTyrianShekelAssay,
  evaluateEsarhaddonTreatySalvage,
} from '../../packages/game-domain/tyre/index';
import {
  TYRE_WGS84_COORDINATES,
  TYRE_HISTORICAL_CHRONOLOGY,
} from '../../packages/contracts/tyre/index';

const ROOT = process.cwd();

function readJson(relPath: string) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

describe('Tyre: The Rock of Melqart — Canonical Knowledge & Game Domain Verification', () => {
  it('1. registers Tyre source text with exact sha256 checksum and 12 passage locators', () => {
    const entry = readJson('content/v12/source-registry/tyre_source_entry.json');
    expect(entry.source.source_id).toBe('SRC-V12-TYRE-MELQART-001');
    expect(entry.source.passage_count).toBe(12);

    const sourcePath = path.join(ROOT, entry.source.preserved_path);
    expect(fs.existsSync(sourcePath)).toBe(true);
    const buf = fs.readFileSync(sourcePath);
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    expect(hash).toBe(entry.source.sha256);
    expect(entry.passages.length).toBe(12);
  });

  it('2. validates all 10 canonical Tyre knowledge records against validateKnowledgeRecordV12', () => {
    const data = readJson('content/v12/staging/countries/LB/tyre/records.json');
    expect(data.records.length).toBe(10);

    for (const rec of data.records) {
      const res = validateKnowledgeRecordV12(rec);
      expect(res.valid, `Record ${rec.id} errors: ${res.errors.join('; ')}`).toBe(true);
      expect(rec.country).toBe('LB');
      expect(rec.rights.text).toBe('paraphrase_only');
      for (const tier of ['5-7', '8-10', '11-13', '14-17'] as const) {
        expect(rec.age_tier_explanations[tier].length).toBeGreaterThanOrEqual(20);
      }
    }
  });

  it('3. enforces epistemic classifications on Tyre myth, history, and geoarchaeology', () => {
    const records = readJson('content/v12/staging/countries/LB/tyre/records.json').records;

    const melqart = records.find((r: any) => r.id === 'LB-KB-MYTH-TEMPLE-OF-MELQART');
    expect(melqart.knowledge_class).toBe('mythology');

    const harbors = records.find((r: any) => r.id === 'LB-KB-PLACE-TYRE-ISLAND-HARBORS');
    expect(harbors.knowledge_class).toBe('historical_claim');
    expect(harbors.claim_status).toBe('externally_corrobated');

    const treaty = records.find((r: any) => r.id === 'LB-KB-TREATY-ESARHADDON-BAAL');
    expect(treaty.sources.some((s: any) => s.source_id === 'SAA-II-05')).toBe(true);

    const tombolo = records.find((r: any) => r.id === 'LB-KB-GEO-TOMBOLO-SEDIMENTATION');
    expect(tombolo.sources.some((s: any) => s.source_id === 'PNAS-MARRINER-2007')).toBe(true);

    const shekel = records.find((r: any) => r.id === 'LB-KB-ARTIFACT-SHEKEL-OF-TYRE');
    expect(shekel.sources.some((s: any) => s.source_id === 'MISHNAH-SHEKALIM')).toBe(true);
  });

  it('4. provides 20 distinct age-tier quest variations across 5 core challenge mechanics', () => {
    const qActs = readJson('content/v12/quest-enrichment/tyre-quest-acts-v12.json');
    expect(qActs.acts.length).toBe(5);
    expect(qActs.total_age_variations).toBe(20);

    const types = qActs.acts.map((a: any) => a.challenge_type);
    expect(types).toEqual(['gather', 'trade', 'build', 'cook', 'word']);

    for (const act of qActs.acts) {
      for (const tier of ['5-7', '8-10', '11-13', '14-17'] as const) {
        const v = act.variations[tier];
        expect(v).toBeDefined();
        expect(v.learning_objective.length).toBeGreaterThan(15);
        expect(v.player_actions.length).toBeGreaterThanOrEqual(3);
        expect(v.npc_lines.mentor_greeting_en.length).toBeGreaterThan(10);
        expect(v.npc_lines.mentor_greeting_native.length).toBeGreaterThan(10);
        expect(v.reward.free_earned).toBe(true);
      }
    }
  });

  it('5. verifies Tyre quest pack (LB_TYRE.json) matches the 5 archetypal challenge structures', () => {
    const quest = readJson('content/quests/LB_TYRE.json');
    expect(quest.country).toBe('LB');
    expect(quest.chapter).toBe(2);
    expect(quest.objectives.length).toBe(5);

    const types = quest.objectives.map((o: any) => o.challengeType);
    expect(types).toEqual(['gather', 'trade', 'build', 'cook', 'word']);

    for (const obj of quest.objectives) {
      expect(obj.requiredItems.length).toBeGreaterThanOrEqual(3);
      expect(obj.rewardItems.length).toBeGreaterThanOrEqual(1);
      expect(obj.vocabWords.length).toBe(3);
      expect(obj.culturalFact.length).toBeGreaterThan(20);
    }
    expect(quest.completionReward.stampChapter).toBe(2);
  });

  it('6. verifies WGS84 geographic coordinates and precision uncertainty', () => {
    const geo = readJson('content/v12/geo/tyre-atlas-geodata.json');
    expect(geo.no_invented_coordinates_assertion).toBe(true);
    expect(geo.real_world_places.length).toBeGreaterThanOrEqual(6);

    for (const place of geo.real_world_places) {
      expect(place.latitude).toBeGreaterThan(33.0);
      expect(place.latitude).toBeLessThan(34.0);
      expect(place.longitude).toBeGreaterThan(35.0);
      expect(place.longitude).toBeLessThan(36.0);
      expect(place.uncertainty_meters).toBeLessThanOrEqual(100);
    }

    expect(TYRE_WGS84_COORDINATES.CITADEL_ISLAND[0]).toBeCloseTo(33.2709, 3);
    expect(TYRE_HISTORICAL_CHRONOLOGY.length).toBeGreaterThanOrEqual(8);
  });

  it('7. verifies game domain algorithms: Murex stoichiometry, fireship defense, and tombolo accretion', () => {
    // 1. Murex stoichiometry
    const murex = calculateMurexYield(20000, 400);
    expect(murex.gramsDibromoindigo).toBe(2);
    expect(murex.eliteGarmentsHemDyed).toBe(2);
    expect(murex.isDownwindSafe).toBe(true);

    const murexUnsafe = calculateMurexYield(10000, 100);
    expect(murexUnsafe.isDownwindSafe).toBe(false);

    // 2. Fireship defense simulation
    const win = simulateFireshipDefense({
      windDirectionDegrees: 260, // Westerly
      sternBallastKg: 1200,
      pitchKg: 300,
      sulfurKg: 150,
      oilCauldronsCount: 2,
    });
    expect(win.successfulStrike).toBe(true);
    expect(win.siegeTowersDestroyed).toBe(2);
    expect(win.burnTemperatureCelsius).toBeGreaterThan(1100);

    const fail = simulateFireshipDefense({
      windDirectionDegrees: 90, // Wrong wind
      sternBallastKg: 200,
      pitchKg: 10,
      sulfurKg: 10,
      oilCauldronsCount: 1,
    });
    expect(fail.successfulStrike).toBe(false);

    // 3. Tombolo sedimentation
    const postAlexander = calculateTomboloAccretion(450);
    expect(postAlexander.islandFusedToMainland).toBe(true);
    expect(postAlexander.egyptianHarborSilted).toBe(true);
    expect(postAlexander.romanBathConstructionPermitted).toBe(true);
    expect(postAlexander.tomboloWidthMeters).toBeGreaterThan(200);

    // 4. Shekel metallurgical assay
    const shekelPass = validateTyrianShekelAssay(14.2, 95.5);
    expect(shekelPass.meetsSecondTempleTaxStandard).toBe(true);

    const shekelFail = validateTyrianShekelAssay(11.0, 75.0);
    expect(shekelFail.meetsSecondTempleTaxStandard).toBe(false);

    // 5. Esarhaddon salvage jurisdiction
    const salvagePilistu = evaluateEsarhaddonTreatySalvage('pilistu', true);
    expect(salvagePilistu.cargoBelongsTo).toBe('ESARHADDON');
    expect(salvagePilistu.crewSpared).toBe(true);

    const salvageHome = evaluateEsarhaddonTreatySalvage('tyrian_home_waters', true);
    expect(salvageHome.cargoBelongsTo).toBe('BAAL_OF_TYRE');
  });
});
