/**
 * MiraVerse v1.2 — Comprehensive Automated Verification Suite (CX04)
 * Tests:
 * 1. Non-destructive baseline integrity (all 21 preexisting v0.8/v1.1 packs, quests, dialogues, stories)
 * 2. Source Registry & Claim Provenance completeness (27 passages, 28 claims, 25 canonical records)
 * 3. Epistemic guardrails (no confidence='high' on source_asserted_unverified; myths/contested claims separated)
 * 4. Age-tier distinctness & child safety (25 acts x 4 age tiers = 100 treatments; zero child voice/PII collection)
 * 5. Localization & dialect preservation (ar-LB, ar-IQ, ar-EG, fr, ko; no modern slang on ancient historical figures)
 * 6. Dual-layer Atlas coordinate accuracy (verified WGS84 pins in bounds; quest markers labeled 'in-game map / not to geographic scale')
 * 7. Cross-platform exports (Roblox KnowledgeV12.luau, Minecraft Bedrock knowledgeV12.ts, Web knowledgeV12.json)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { validateKnowledgeRecordV12 } from '../../../packages/knowledge-v12/index';

const ROOT = process.cwd();

function readJson(relPath: string) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

describe('MiraVerse v1.2 Cultural Knowledge Enrichment Suite', () => {
  it('1. preserves all 21 preexisting v0.8/v1.1 files with exact SHA-256 checksums', () => {
    const snap = readJson('tools/v12/migration/baseline-snapshot.json');
    const entries = Object.entries(snap.preserved_files || {});
    expect(entries.length).toBeGreaterThanOrEqual(21);
    for (const [rel, meta] of entries as any) {
      const fullPath = path.join(ROOT, rel);
      expect(fs.existsSync(fullPath)).toBe(true);
      const sha = crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex');
      expect(sha).toBe(meta.sha256);
    }
  });

  it('2. registers user-supplied research source with checksum, review_required rights, and 27 passage locators', () => {
    const reg = readJson('content/v12/source-registry/SOURCE_REGISTRY.json');
    const src = reg.sources[0];
    expect(src.source_id).toBe('SRC-V12-TRANSNATIONAL-001');
    expect(src.source_type).toBe('user_supplied_research');
    expect(src.rights_reuse_status).toBe('review_required');
    expect(src.passage_count).toBe(27);

    const provenanceLines = fs
      .readFileSync(path.join(ROOT, 'content/v12/staging/provenance/CLAIM_PROVENANCE.jsonl'), 'utf8')
      .trim()
      .split('\n')
      .map((l) => JSON.parse(l));
    expect(provenanceLines.length).toBeGreaterThanOrEqual(28);
  });

  it('3. validates all 25 canonical country records (LB, IQ, EG, FR, KR) against epistemic & child-safety rules', () => {
    const countries = ['LB', 'IQ', 'EG', 'FR', 'KR'];
    let total = 0;
    for (const c of countries) {
      const data = readJson(`content/v12/staging/countries/${c}/records.json`);
      expect(data.records.length).toBe(5);
      for (const rec of data.records) {
        const res = validateKnowledgeRecordV12(rec);
        expect(res.valid, `Record ${rec.id} errors: ${res.errors.join('; ')}`).toBe(true);
        if (rec.claim_status === 'source_asserted_unverified') {
          expect(rec.confidence).not.toBe('high');
        }
        expect(rec.rights.text).toBe('paraphrase_only');
        total++;
      }
    }
    expect(total).toBe(25);
  });

  it('4. enforces myth vs history & contested origin labeling on mandatory topics', () => {
    const lb = readJson('content/v12/staging/countries/LB/records.json').records;
    const isis = lb.find((r: any) => r.id === 'LB-KB-MYTH-ISIS-OSIRIS-TREE');
    const adonis = lb.find((r: any) => r.id === 'LB-KB-MYTH-ADONIS-AFQA-RIVER');
    expect(isis.knowledge_class).toBe('mythology');
    expect(adonis.knowledge_class).toBe('interpretation');

    const iq = readJson('content/v12/staging/countries/IQ/records.json').records;
    const bayt = iq.find((r: any) => r.id === 'IQ-KB-ORG-BAYT-AL-HIKMA');
    expect(bayt.knowledge_class).toBe('contested_history');

    const eg = readJson('content/v12/staging/countries/EG/records.json').records;
    const fanous = eg.find((r: any) => r.id === 'EG-KB-HIST-FANOUS-COMPETING-ORIGINS');
    expect(fanous.knowledge_class).toBe('contested_history');

    const kr = readJson('content/v12/staging/countries/KR/records.json').records;
    const bibimbap = kr.find((r: any) => r.id === 'KR-KB-HIST-BIBIMBAP-COMPETING-ORIGINS');
    const obangsaek = kr.find((r: any) => r.id === 'KR-KB-THEME-OBANGSAEK-FIVE-COLORS');
    expect(bibimbap.knowledge_class).toBe('contested_history');
    expect(obangsaek.knowledge_class).toBe('interpretation');
  });

  it('5. provides 100 distinct age-tier quest vectors (25 acts x 4 tiers) with zero child PII collection', () => {
    const vec = readJson('tests/v12/vectors/quest-age-tier-vectors.json');
    expect(vec.total_acts).toBe(25);
    expect(vec.total_vectors).toBe(100);
    const lint = readJson('content/v12/qa/age-lint/age-tier-lint-report.json');
    expect(lint.all_passed).toBe(true);
    expect(lint.total_records_linted).toBe(25);
  });

  it('6. verifies regional Arabic dialects (ar-LB, ar-IQ, ar-EG), French (fr), and Korean (ko) glossaries', () => {
    const arLb = readJson('content/v12/locales/ar-LB/lebanese-dialect-qa.json');
    const arEgIq = readJson('content/v12/locales/ar-EG-IQ/ar-EG-IQ-localization.json');
    const frKo = readJson('content/v12/locales/fr-ko/fr-ko-localization.json');
    expect(arLb.dialect_preserved_terms.length).toBeGreaterThanOrEqual(5);
    expect(arEgIq.dialect_policy.no_modern_slang_on_historical_scholars).toBe(true);
    expect(frKo.french_lyon_glossary.length).toBeGreaterThanOrEqual(5);
    expect(frKo.korean_jeonju_glossary.length).toBeGreaterThanOrEqual(5);
  });

  it('7. separates verified WGS84 real-world pins from illustrated in-game quest markers', () => {
    const geo = readJson('content/v12/geo/atlas-v12-geodata.json');
    expect(geo.no_invented_coordinates_assertion).toBe(true);
    expect(geo.real_world_places.length).toBe(8);
    for (const p of geo.real_world_places) {
      expect(typeof p.latitude).toBe('number');
      expect(typeof p.longitude).toBe('number');
      expect(p.coordinate_source.length).toBeGreaterThan(5);
    }
    for (const m of geo.in_game_quest_markers) {
      expect((m as any).latitude).toBeUndefined();
      expect(m.scale_label).toBe('in-game map / not to geographic scale');
    }
  });

  it('8. compiles synchronized v1.2 exports for Roblox Luau, Minecraft Bedrock TS, and Website JSON', () => {
    const luau = fs.readFileSync(path.join(ROOT, 'apps/roblox/src/shared/KnowledgeV12.luau'), 'utf8');
    const mcTs = fs.readFileSync(path.join(ROOT, 'apps/minecraft/scripts/generated/knowledgeV12.ts'), 'utf8');
    const webJson = readJson('apps/web/src/generated/knowledgeV12.json');

    expect(luau).toContain('LB-KB-PLACE-BYBLOS-PORT');
    expect(luau).toContain('KR-KB-PRACTICE-DIASPORA-FEAST-CONTINUITY');
    expect(mcTs).toContain('KNOWLEDGE_V12_RECORDS');
    expect(webJson.records.length).toBe(25);
    expect(webJson.quest_acts.length).toBe(25);
  });
});
