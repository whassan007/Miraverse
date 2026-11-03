import { describe, expect, it } from 'vitest';
import { validatePack, validateStory } from '../tools/validate.js';
import { createValidPack, createValidStory } from './content/fixtures.js';

describe('validateStory', () => {
  it('accepts a valid complete story fixture in structural and release profiles', () => {
    const story = createValidStory();
    expect(validateStory(story, 'stories/ar-LB.json', { expectedLang: 'ar-LB', profile: 'structural' })).toEqual([]);
    expect(validateStory(story, 'stories/ar-LB.json', { expectedLang: 'ar-LB', profile: 'release' })).toEqual([]);
  });

  it('rejects a 14-scene story with #/scenes JSON-path error', () => {
    const story = createValidStory();
    story.scenes = story.scenes.slice(0, 14);

    const errors = validateStory(story, 'stories/ar-LB.json');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors).toContain('stories/ar-LB.json#/scenes: must have exactly 15 scenes (found 14)');
  });

  it('rejects non-contiguous scene IDs with #/scenes/<idx>/id JSON-path error', () => {
    const story = createValidStory();
    story.scenes[1].id = 3;

    const errors = validateStory(story, 'stories/ar-LB.json');
    expect(errors).toContain('stories/ar-LB.json#/scenes/1/id: expected contiguous scene id 2, got 3');
  });

  it('rejects missing gloss_en in release profile with #/scenes/<idx>/gloss_en JSON-path error', () => {
    const story = createValidStory();
    delete story.scenes[0].gloss_en;

    expect(validateStory(story, 'stories/ar-LB.json', { profile: 'structural' })).toEqual([]);
    const releaseErrors = validateStory(story, 'stories/ar-LB.json', { profile: 'release' });
    expect(releaseErrors).toContain(
      'stories/ar-LB.json#/scenes/0/gloss_en: release profile requires non-empty gloss_en for scene 1'
    );
  });

  it('rejects an invalid Archetype with #/characters/<idx>/role JSON-path error', () => {
    const story = createValidStory();
    (story.characters[0] as unknown as Record<string, unknown>).role = 'space_pirate';

    const errors = validateStory(story, 'stories/ar-LB.json');
    expect(errors).toContain("stories/ar-LB.json#/characters/0/role: invalid archetype 'space_pirate'");
  });

  it('rejects duplicate vocab words with #/vocab/<idx>/word JSON-path error', () => {
    const story = createValidStory();
    story.vocab[1].word = story.vocab[0].word;

    const errors = validateStory(story, 'stories/ar-LB.json');
    expect(errors).toContain(`stories/ar-LB.json#/vocab/1/word: duplicate vocab word '${story.vocab[0].word}'`);
  });

  it('rejects unexpected extra fields on story root and nested objects with specific JSON-path errors', () => {
    const story = createValidStory() as unknown as Record<string, unknown>;
    story.extra_story_field = 'unexpected';
    (story.scenes as Record<string, unknown>[])[0].extra_scene_field = 123;
    (story.characters as Record<string, unknown>[])[0].extra_char_field = true;
    (story.vocab as Record<string, unknown>[])[0].extra_vocab_field = 'extra';

    const errors = validateStory(story, 'stories/ar-LB.json');
    expect(errors).toContain("stories/ar-LB.json#/extra_story_field: unexpected field 'extra_story_field'");
    expect(errors).toContain("stories/ar-LB.json#/scenes/0/extra_scene_field: unexpected field 'extra_scene_field'");
    expect(errors).toContain("stories/ar-LB.json#/characters/0/extra_char_field: unexpected field 'extra_char_field'");
    expect(errors).toContain("stories/ar-LB.json#/vocab/0/extra_vocab_field: unexpected field 'extra_vocab_field'");
  });

  it('rejects mismatched country/lang with #/country JSON-path error', () => {
    const story = createValidStory();
    story.country = 'LB';
    story.lang = 'fr';

    const errors = validateStory(story, 'stories/fr.json', { expectedLang: 'fr' });
    expect(errors).toContain("stories/fr.json#/country: country 'LB' requires lang 'ar-LB', got 'fr'");
  });
});

describe('validatePack', () => {
  it('accepts a valid complete pack fixture (with explicit blueprintLegend and reward) in structural and release profiles', () => {
    const pack = createValidPack();
    expect(validatePack(pack, 'packs/LB.json', { expectedCountry: 'LB', profile: 'structural' })).toEqual([]);
    expect(validatePack(pack, 'packs/LB.json', { expectedCountry: 'LB', profile: 'release' })).toEqual([]);
  });

  it('rejects invalid hex colors in pack colors and items with specific JSON-path errors', () => {
    const pack = createValidPack();
    pack.colors.primary = 'red';
    pack.colors.secondary = '#12345';
    pack.items[0].color = '#GGGGGG';

    const errors = validatePack(pack, 'packs/LB.json');
    expect(errors).toContain("packs/LB.json#/colors/primary: invalid hex color 'red'");
    expect(errors).toContain("packs/LB.json#/colors/secondary: invalid hex color '#12345'");
    expect(errors).toContain("packs/LB.json#/items/0/color: item 'cedar_plank' has invalid hex color '#GGGGGG'");
  });

  it('rejects camelCase item ID with #/items/<idx>/id JSON-path error', () => {
    const pack = createValidPack();
    pack.items[0].id = 'cedarPlank';

    const errors = validatePack(pack, 'packs/LB.json');
    expect(errors).toContain("packs/LB.json#/items/0/id: item id 'cedarPlank' must be snake_case");
  });

  it('rejects unknown item in needs or recipe with specific JSON-path errors', () => {
    const pack = createValidPack();
    const challenges = pack.chapters[0].challenges;
    // challenge 0 is gather
    challenges[0].needs = [{ item: 'mystery_spice', count: 1 }];
    // challenge 1 is cook
    challenges[1].recipe = {
      inputs: ['unknown_dough', 'olive_oil'],
      output: 'unknown_pastry',
    };

    const errors = validatePack(pack, 'packs/LB.json');
    expect(errors).toContain(
      "packs/LB.json#/chapters/0/challenges/0/needs/0/item: challenge 'lb_gather_ingredients' needs unknown item 'mystery_spice'"
    );
    expect(errors).toContain(
      "packs/LB.json#/chapters/0/challenges/1/recipe/inputs/0: challenge 'lb_cook_manoushe' recipe input 'unknown_dough' is not in items list"
    );
    expect(errors).toContain(
      "packs/LB.json#/chapters/0/challenges/1/recipe/output: challenge 'lb_cook_manoushe' recipe output 'unknown_pastry' is not in items list"
    );
  });

  it('rejects non-rectangular blueprint with #/chapters/0/challenges/<idx>/blueprint/<row> JSON-path error', () => {
    const pack = createValidPack();
    const buildChallenge = pack.chapters[0].challenges[4];
    buildChallenge.blueprint = ['CCC', 'LL', 'L.L'];

    const errors = validatePack(pack, 'packs/LB.json');
    expect(errors).toContain(
      'packs/LB.json#/chapters/0/challenges/4/blueprint/1: blueprint must be rectangular (expected length 3)'
    );
  });

  it('rejects missing blueprintLegend symbol mapping and unknown legend item with specific JSON-path errors', () => {
    const pack = createValidPack();
    const buildChallenge = pack.chapters[0].challenges[4];
    buildChallenge.blueprint = ['CCC', 'LXL'];
    buildChallenge.blueprintLegend = {
      C: 'cedar_plank',
      // 'L' and 'X' are missing, and 'Z' maps to an unknown item
      Z: 'ghost_brick',
    };

    const errors = validatePack(pack, 'packs/LB.json');
    expect(errors).toContain(
      "packs/LB.json#/chapters/0/challenges/4/blueprintLegend: missing legend entry for blueprint symbol 'L'"
    );
    expect(errors).toContain(
      "packs/LB.json#/chapters/0/challenges/4/blueprintLegend: missing legend entry for blueprint symbol 'X'"
    );
    expect(errors).toContain(
      "packs/LB.json#/chapters/0/challenges/4/blueprintLegend/Z: maps to unknown item 'ghost_brick'"
    );

    // Also verify missing blueprintLegend entirely fails in release profile
    const packWithoutLegend = createValidPack();
    delete packWithoutLegend.chapters[0].challenges[4].blueprintLegend;
    const releaseErrors = validatePack(packWithoutLegend, 'packs/LB.json', { profile: 'release' });
    expect(releaseErrors).toContain(
      'packs/LB.json#/chapters/0/challenges/4/blueprintLegend: release profile requires explicit blueprintLegend'
    );
  });

  it('rejects unknown item in reward with #/chapters/0/challenges/<idx>/reward/item JSON-path error', () => {
    const pack = createValidPack();
    const tradeChallenge = pack.chapters[0].challenges[2];
    tradeChallenge.reward = { item: 'nonexistent_treasure', count: 1 };

    const errors = validatePack(pack, 'packs/LB.json');
    expect(errors).toContain(
      "packs/LB.json#/chapters/0/challenges/2/reward/item: challenge 'lb_trade_harbor' reward references unknown item 'nonexistent_treasure'"
    );
  });

  it('rejects unexpected extra fields on pack root and nested objects with specific JSON-path errors', () => {
    const pack = createValidPack() as unknown as Record<string, unknown>;
    pack.extra_pack_field = 'unexpected';
    const challenges = ((pack.chapters as Record<string, unknown>[])[0].challenges as Record<string, unknown>[]);
    challenges[0].extra_challenge_field = 'unexpected';

    const errors = validatePack(pack, 'packs/LB.json');
    expect(errors).toContain("packs/LB.json#/extra_pack_field: unexpected field 'extra_pack_field'");
    expect(errors).toContain(
      "packs/LB.json#/chapters/0/challenges/0/extra_challenge_field: unexpected field 'extra_challenge_field'"
    );
  });

  it('rejects mismatched country/lang on pack with #/lang JSON-path error', () => {
    const pack = createValidPack();
    pack.country = 'LB';
    pack.lang = 'ko';

    const errors = validatePack(pack, 'packs/LB.json', { expectedCountry: 'LB' });
    expect(errors).toContain("packs/LB.json#/lang: country 'LB' requires lang 'ar-LB', got 'ko'");
  });
});
