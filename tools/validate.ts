import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COUNTRIES,
  COUNTRY_LANG_MAP,
  STORY_LANGS,
  UI_LANGS,
  type Archetype,
  type ChallengeType,
  type CountryId,
  type Lang,
  type Pack,
  type Story,
} from '../packages/content/schema.js';

export type ValidationProfile = 'structural' | 'release';

const ARCHETYPES = new Set<Archetype>([
  'protagonist',
  'elder_mentor',
  'bridge_parent',
  'supportive_parent',
  'younger_sibling',
  'host_peer',
  'diaspora_peer',
]);

const CHALLENGE_TYPES: ChallengeType[] = ['build', 'cook', 'gather', 'trade', 'word'];
const HEX_COLOR_RE = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const SNAKE_CASE_RE = /^[a-z][a-z0-9_]*$/;

function hasWellFormedUnicode(str: string): boolean {
  if (typeof (str as any).isWellFormed === 'function') {
    return (str as any).isWellFormed();
  }
  // Fallback lone-surrogate check
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = str.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
      i++;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return false;
    }
  }
  return true;
}

function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0 && hasWellFormedUnicode(val);
}

function checkAllowedKeys(
  obj: Record<string, unknown>,
  allowed: readonly string[],
  jsonPath: string,
  errors: string[]
): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(obj)) {
    if (!allowedSet.has(key)) {
      errors.push(`${jsonPath}/${key}: unexpected field '${key}'`);
    }
  }
}

export function validateStory(
  story: unknown,
  fileLabel = 'story.json',
  options: { expectedLang?: string; profile?: ValidationProfile } = {}
): string[] {
  const errors: string[] = [];
  const profile = options.profile ?? 'structural';

  if (!story || typeof story !== 'object' || Array.isArray(story)) {
    errors.push(`${fileLabel}#: story must be a JSON object`);
    return errors;
  }

  const s = story as Record<string, unknown>;
  checkAllowedKeys(
    s,
    ['lang', 'country', 'title', 'title_en', 'characters', 'scenes', 'vocab'],
    `${fileLabel}#`,
    errors
  );

  if (!STORY_LANGS.includes(s.lang as Lang)) {
    errors.push(`${fileLabel}#/lang: invalid story lang '${String(s.lang)}'`);
  }
  if (options.expectedLang && s.lang !== options.expectedLang) {
    errors.push(
      `${fileLabel}#/lang: lang '${String(s.lang)}' does not match filename '${options.expectedLang}'`
    );
  }

  if (!COUNTRIES.includes(s.country as CountryId)) {
    errors.push(`${fileLabel}#/country: invalid country '${String(s.country)}'`);
  } else if (STORY_LANGS.includes(s.lang as Lang)) {
    const expectedLangForCountry = COUNTRY_LANG_MAP[s.country as CountryId];
    if (s.lang !== expectedLangForCountry) {
      errors.push(
        `${fileLabel}#/country: country '${String(s.country)}' requires lang '${expectedLangForCountry}', got '${String(s.lang)}'`
      );
    }
  }

  if (!isNonEmptyString(s.title)) {
    errors.push(`${fileLabel}#/title: must be a non-empty string`);
  }
  if (!isNonEmptyString(s.title_en)) {
    errors.push(`${fileLabel}#/title_en: must be a non-empty string`);
  }

  if (!Array.isArray(s.characters) || s.characters.length === 0) {
    errors.push(`${fileLabel}#/characters: must be a non-empty array`);
  } else {
    s.characters.forEach((ch, idx) => {
      const p = `${fileLabel}#/characters/${idx}`;
      if (!ch || typeof ch !== 'object' || Array.isArray(ch)) {
        errors.push(`${p}: must be an object`);
        return;
      }
      const c = ch as Record<string, unknown>;
      checkAllowedKeys(c, ['name', 'role', 'note'], p, errors);
      if (!isNonEmptyString(c.name)) errors.push(`${p}/name: must be a non-empty string`);
      if (!ARCHETYPES.has(c.role as Archetype)) {
        errors.push(`${p}/role: invalid archetype '${String(c.role)}'`);
      }
      if (!isNonEmptyString(c.note)) errors.push(`${p}/note: must be a non-empty string`);
    });
  }

  if (!Array.isArray(s.scenes) || s.scenes.length !== 15) {
    errors.push(
      `${fileLabel}#/scenes: must have exactly 15 scenes (found ${Array.isArray(s.scenes) ? s.scenes.length : 0})`
    );
  } else {
    s.scenes.forEach((sc, idx) => {
      const p = `${fileLabel}#/scenes/${idx}`;
      if (!sc || typeof sc !== 'object' || Array.isArray(sc)) {
        errors.push(`${p}: must be an object`);
        return;
      }
      const scene = sc as Record<string, unknown>;
      checkAllowedKeys(scene, ['id', 'title', 'text', 'gloss_en', 'image_prompt'], p, errors);
      if (scene.id !== idx + 1) {
        errors.push(`${p}/id: expected contiguous scene id ${idx + 1}, got ${String(scene.id)}`);
      }
      if (!isNonEmptyString(scene.title)) {
        errors.push(`${p}/title: must be a non-empty string`);
      }
      if (!isNonEmptyString(scene.text)) {
        errors.push(`${p}/text: scene ${idx + 1} has empty or invalid text`);
      } else if (/\b(TODO|TBD|FIXME)\b/.test(scene.text)) {
        errors.push(`${p}/text: contains placeholder marker`);
      }
      if (!isNonEmptyString(scene.image_prompt)) {
        errors.push(`${p}/image_prompt: must be a non-empty string`);
      }
      if (scene.gloss_en !== undefined && !isNonEmptyString(scene.gloss_en)) {
        errors.push(`${p}/gloss_en: if provided, must be a non-empty string`);
      }
      if (profile === 'release' && !isNonEmptyString(scene.gloss_en)) {
        errors.push(`${p}/gloss_en: release profile requires non-empty gloss_en for scene ${idx + 1}`);
      }
    });
  }

  if (!Array.isArray(s.vocab) || s.vocab.length !== 10) {
    errors.push(
      `${fileLabel}#/vocab: must have exactly 10 vocab entries (found ${Array.isArray(s.vocab) ? s.vocab.length : 0})`
    );
  } else {
    const seenWords = new Set<string>();
    s.vocab.forEach((v, idx) => {
      const p = `${fileLabel}#/vocab/${idx}`;
      if (!v || typeof v !== 'object' || Array.isArray(v)) {
        errors.push(`${p}: must be an object`);
        return;
      }
      const entry = v as Record<string, unknown>;
      checkAllowedKeys(entry, ['word', 'translit', 'en'], p, errors);
      if (!isNonEmptyString(entry.word)) {
        errors.push(`${p}/word: must be a non-empty string`);
      } else if (seenWords.has(entry.word)) {
        errors.push(`${p}/word: duplicate vocab word '${entry.word}'`);
      } else {
        seenWords.add(entry.word);
      }
      if (!isNonEmptyString(entry.translit)) errors.push(`${p}/translit: must be a non-empty string`);
      if (!isNonEmptyString(entry.en)) errors.push(`${p}/en: must be a non-empty string`);
    });
  }

  return errors;
}

export function validatePack(
  pack: unknown,
  fileLabel = 'pack.json',
  options: { expectedCountry?: string; profile?: ValidationProfile } = {}
): string[] {
  const errors: string[] = [];
  const profile = options.profile ?? 'structural';

  if (!pack || typeof pack !== 'object' || Array.isArray(pack)) {
    errors.push(`${fileLabel}#: pack must be a JSON object`);
    return errors;
  }

  const p = pack as Record<string, unknown>;
  checkAllowedKeys(
    p,
    ['country', 'name_en', 'lang', 'colors', 'regions', 'mentor', 'items', 'chapters'],
    `${fileLabel}#`,
    errors
  );

  if (!COUNTRIES.includes(p.country as CountryId)) {
    errors.push(`${fileLabel}#/country: invalid country '${String(p.country)}'`);
  }
  if (options.expectedCountry && p.country !== options.expectedCountry) {
    errors.push(
      `${fileLabel}#/country: country '${String(p.country)}' does not match filename '${options.expectedCountry}'`
    );
  }
  if (!isNonEmptyString(p.name_en)) {
    errors.push(`${fileLabel}#/name_en: must be a non-empty string`);
  }
  if (!STORY_LANGS.includes(p.lang as Lang)) {
    errors.push(`${fileLabel}#/lang: invalid pack lang '${String(p.lang)}'`);
  } else if (COUNTRIES.includes(p.country as CountryId)) {
    const expectedLang = COUNTRY_LANG_MAP[p.country as CountryId];
    if (p.lang !== expectedLang) {
      errors.push(
        `${fileLabel}#/lang: country '${String(p.country)}' requires lang '${expectedLang}', got '${String(p.lang)}'`
      );
    }
  }

  if (!p.colors || typeof p.colors !== 'object' || Array.isArray(p.colors)) {
    errors.push(`${fileLabel}#/colors: must be an object`);
  } else {
    const colors = p.colors as Record<string, unknown>;
    checkAllowedKeys(colors, ['primary', 'secondary'], `${fileLabel}#/colors`, errors);
    if (typeof colors.primary !== 'string' || !HEX_COLOR_RE.test(colors.primary)) {
      errors.push(`${fileLabel}#/colors/primary: invalid hex color '${String(colors.primary)}'`);
    }
    if (typeof colors.secondary !== 'string' || !HEX_COLOR_RE.test(colors.secondary)) {
      errors.push(`${fileLabel}#/colors/secondary: invalid hex color '${String(colors.secondary)}'`);
    }
  }

  if (!Array.isArray(p.regions) || p.regions.length < 2 || p.regions.length > 3) {
    errors.push(
      `${fileLabel}#/regions: must have 2 to 3 regions (found ${Array.isArray(p.regions) ? p.regions.length : 0})`
    );
  } else {
    const regionIds = new Set<string>();
    p.regions.forEach((r, idx) => {
      const rp = `${fileLabel}#/regions/${idx}`;
      if (!r || typeof r !== 'object' || Array.isArray(r)) {
        errors.push(`${rp}: must be an object`);
        return;
      }
      const reg = r as Record<string, unknown>;
      checkAllowedKeys(reg, ['id', 'name_en'], rp, errors);
      if (typeof reg.id !== 'string' || !SNAKE_CASE_RE.test(reg.id)) {
        errors.push(`${rp}/id: region id '${String(reg.id)}' must be snake_case`);
      } else if (regionIds.has(reg.id)) {
        errors.push(`${rp}/id: duplicate region id '${reg.id}'`);
      } else {
        regionIds.add(reg.id);
      }
      if (!isNonEmptyString(reg.name_en)) {
        errors.push(`${rp}/name_en: must be a non-empty string`);
      }
    });
  }

  if (!p.mentor || typeof p.mentor !== 'object' || Array.isArray(p.mentor)) {
    errors.push(`${fileLabel}#/mentor: must be an object`);
  } else {
    const m = p.mentor as Record<string, unknown>;
    checkAllowedKeys(m, ['name', 'greeting_en', 'greeting'], `${fileLabel}#/mentor`, errors);
    if (!isNonEmptyString(m.name)) errors.push(`${fileLabel}#/mentor/name: must be a non-empty string`);
    if (!isNonEmptyString(m.greeting_en)) {
      errors.push(`${fileLabel}#/mentor/greeting_en: must be a non-empty string`);
    }
    if (!isNonEmptyString(m.greeting)) {
      errors.push(`${fileLabel}#/mentor/greeting: must be a non-empty string`);
    }
  }

  const itemIds = new Set<string>();
  if (!Array.isArray(p.items) || p.items.length < 1) {
    errors.push(`${fileLabel}#/items: must be a non-empty array`);
  } else {
    if (profile === 'release' && (p.items.length < 6 || p.items.length > 10)) {
      errors.push(`${fileLabel}#/items: release pack must have 6 to 10 items (found ${p.items.length})`);
    }
    p.items.forEach((it, idx) => {
      const ip = `${fileLabel}#/items/${idx}`;
      if (!it || typeof it !== 'object' || Array.isArray(it)) {
        errors.push(`${ip}: must be an object`);
        return;
      }
      const item = it as Record<string, unknown>;
      checkAllowedKeys(item, ['id', 'name_en', 'color'], ip, errors);
      if (typeof item.id !== 'string' || !SNAKE_CASE_RE.test(item.id)) {
        errors.push(`${ip}/id: item id '${String(item.id)}' must be snake_case`);
      } else if (itemIds.has(item.id)) {
        errors.push(`${ip}/id: duplicate item id '${item.id}'`);
      } else {
        itemIds.add(item.id);
      }
      if (!isNonEmptyString(item.name_en)) {
        errors.push(`${ip}/name_en: must be a non-empty string`);
      }
      if (typeof item.color !== 'string' || !HEX_COLOR_RE.test(item.color)) {
        errors.push(`${ip}/color: item '${String(item.id)}' has invalid hex color '${String(item.color)}'`);
      }
    });
  }

  if (!Array.isArray(p.chapters) || p.chapters.length !== 1) {
    errors.push(
      `${fileLabel}#/chapters: must have exactly 1 chapter (found ${Array.isArray(p.chapters) ? p.chapters.length : 0})`
    );
  } else {
    const chObj = p.chapters[0];
    const cp = `${fileLabel}#/chapters/0`;
    if (!chObj || typeof chObj !== 'object' || Array.isArray(chObj)) {
      errors.push(`${cp}: must be an object`);
    } else {
      const chapter = chObj as Record<string, unknown>;
      checkAllowedKeys(chapter, ['id', 'title_en', 'challenges'], cp, errors);
      if (chapter.id !== 1) {
        errors.push(`${cp}/id: chapter id must be 1, got ${String(chapter.id)}`);
      }
      if (!isNonEmptyString(chapter.title_en)) {
        errors.push(`${cp}/title_en: must be a non-empty string`);
      }
      if (!Array.isArray(chapter.challenges) || chapter.challenges.length !== 5) {
        errors.push(
          `${cp}/challenges: chapter must have exactly 5 challenges (found ${Array.isArray(chapter.challenges) ? chapter.challenges.length : 0})`
        );
      } else {
        const typesFound = new Set<ChallengeType>();
        const challengeIds = new Set<string>();

        chapter.challenges.forEach((rawCh, cIdx) => {
          const chPath = `${cp}/challenges/${cIdx}`;
          if (!rawCh || typeof rawCh !== 'object' || Array.isArray(rawCh)) {
            errors.push(`${chPath}: must be an object`);
            return;
          }
          const ch = rawCh as Record<string, unknown>;
          checkAllowedKeys(
            ch,
            [
              'id',
              'type',
              'title_en',
              'goal_en',
              'needs',
              'recipe',
              'words',
              'blueprint',
              'blueprintLegend',
              'reward',
            ],
            chPath,
            errors
          );

          if (!isNonEmptyString(ch.id)) {
            errors.push(`${chPath}/id: must be a non-empty string`);
          } else if (challengeIds.has(ch.id)) {
            errors.push(`${chPath}/id: duplicate challenge id '${ch.id}'`);
          } else {
            challengeIds.add(ch.id);
          }

          if (!CHALLENGE_TYPES.includes(ch.type as ChallengeType)) {
            errors.push(`${chPath}/type: invalid challenge type '${String(ch.type)}'`);
          } else {
            if (typesFound.has(ch.type as ChallengeType)) {
              errors.push(`${chPath}/type: duplicate challenge type '${String(ch.type)}'`);
            }
            typesFound.add(ch.type as ChallengeType);
          }

          if (!isNonEmptyString(ch.title_en)) {
            errors.push(`${chPath}/title_en: must be a non-empty string`);
          }
          if (!isNonEmptyString(ch.goal_en)) {
            errors.push(`${chPath}/goal_en: must be a non-empty string`);
          }

          if (ch.needs !== undefined) {
            if (!Array.isArray(ch.needs) || ch.needs.length === 0) {
              errors.push(`${chPath}/needs: must be a non-empty array when present`);
            } else {
              ch.needs.forEach((n, nIdx) => {
                const np = `${chPath}/needs/${nIdx}`;
                if (!n || typeof n !== 'object' || Array.isArray(n)) {
                  errors.push(`${np}: must be an object`);
                  return;
                }
                const need = n as Record<string, unknown>;
                checkAllowedKeys(need, ['item', 'count'], np, errors);
                if (typeof need.item !== 'string' || !itemIds.has(need.item)) {
                  errors.push(
                    `${np}/item: challenge '${String(ch.id)}' needs unknown item '${String(need.item)}'`
                  );
                }
                if (typeof need.count !== 'number' || !Number.isInteger(need.count) || need.count < 1) {
                  errors.push(`${np}/count: must be a positive integer`);
                }
              });
            }
          }

          if (ch.reward !== undefined) {
            const rp = `${chPath}/reward`;
            if (!ch.reward || typeof ch.reward !== 'object' || Array.isArray(ch.reward)) {
              errors.push(`${rp}: must be an object`);
            } else {
              const rew = ch.reward as Record<string, unknown>;
              checkAllowedKeys(rew, ['item', 'count'], rp, errors);
              if (typeof rew.item !== 'string' || !itemIds.has(rew.item)) {
                errors.push(
                  `${rp}/item: challenge '${String(ch.id)}' reward references unknown item '${String(rew.item)}'`
                );
              }
              if (typeof rew.count !== 'number' || !Number.isInteger(rew.count) || rew.count < 1) {
                errors.push(`${rp}/count: must be a positive integer`);
              }
            }
          }

          if (ch.type === 'gather') {
            if (!Array.isArray(ch.needs) || ch.needs.length === 0) {
              errors.push(`${chPath}/needs: gather challenge requires non-empty needs`);
            }
          }

          if (ch.type === 'trade') {
            if (!Array.isArray(ch.needs) || ch.needs.length === 0) {
              errors.push(`${chPath}/needs: trade challenge requires non-empty needs`);
            }
            if (profile === 'release' && !ch.reward) {
              errors.push(`${chPath}/reward: trade challenge requires a reward in release profile`);
            }
          }

          if (ch.type === 'cook' || ch.recipe !== undefined) {
            const rp = `${chPath}/recipe`;
            if (!ch.recipe || typeof ch.recipe !== 'object' || Array.isArray(ch.recipe)) {
              errors.push(`${rp}: cook challenge requires a recipe object`);
            } else {
              const rec = ch.recipe as Record<string, unknown>;
              checkAllowedKeys(rec, ['inputs', 'output'], rp, errors);
              if (!Array.isArray(rec.inputs) || rec.inputs.length < 2) {
                errors.push(`${rp}/inputs: must have at least 2 ordered input items`);
              } else {
                rec.inputs.forEach((inp, iIdx) => {
                  if (typeof inp !== 'string' || !itemIds.has(inp)) {
                    errors.push(
                      `${rp}/inputs/${iIdx}: challenge '${String(ch.id)}' recipe input '${String(inp)}' is not in items list`
                    );
                  }
                });
              }
              if (typeof rec.output !== 'string' || !itemIds.has(rec.output)) {
                errors.push(
                  `${rp}/output: challenge '${String(ch.id)}' recipe output '${String(rec.output)}' is not in items list`
                );
              }
            }
          }

          if (ch.type === 'word' || ch.words !== undefined) {
            const wp = `${chPath}/words`;
            if (!Array.isArray(ch.words) || ch.words.length !== 3) {
              errors.push(
                `${wp}: word challenge must have exactly 3 words (found ${Array.isArray(ch.words) ? ch.words.length : 0})`
              );
            } else {
              ch.words.forEach((w, wIdx) => {
                const wItemPath = `${wp}/${wIdx}`;
                if (!w || typeof w !== 'object' || Array.isArray(w)) {
                  errors.push(`${wItemPath}: must be an object`);
                  return;
                }
                const wordObj = w as Record<string, unknown>;
                checkAllowedKeys(wordObj, ['word', 'translit', 'en'], wItemPath, errors);
                if (!isNonEmptyString(wordObj.word)) {
                  errors.push(`${wItemPath}/word: must be a non-empty string`);
                }
                if (!isNonEmptyString(wordObj.translit)) {
                  errors.push(`${wItemPath}/translit: must be a non-empty string`);
                }
                if (!isNonEmptyString(wordObj.en)) {
                  errors.push(`${wItemPath}/en: must be a non-empty string`);
                }
              });
            }
          }

          if (ch.type === 'build' || ch.blueprint !== undefined) {
            const bpPath = `${chPath}/blueprint`;
            if (!Array.isArray(ch.blueprint) || ch.blueprint.length < 2) {
              errors.push(`${bpPath}: build challenge requires rectangular blueprint with >= 2 rows`);
            } else {
              const rowLen = typeof ch.blueprint[0] === 'string' ? ch.blueprint[0].length : 0;
              if (rowLen < 2) {
                errors.push(`${bpPath}/0: blueprint rows must have length >= 2`);
              }
              const usedSymbols = new Set<string>();
              ch.blueprint.forEach((row, rIdx) => {
                if (typeof row !== 'string' || row.length !== rowLen) {
                  errors.push(`${bpPath}/${rIdx}: blueprint must be rectangular (expected length ${rowLen})`);
                } else {
                  for (const chSym of row) {
                    if (chSym !== '.') usedSymbols.add(chSym);
                  }
                }
              });
              if (usedSymbols.size === 0) {
                errors.push(`${bpPath}: blueprint must contain at least one non-empty tile symbol`);
              }

              const legend = ch.blueprintLegend;
              if (legend !== undefined) {
                if (!legend || typeof legend !== 'object' || Array.isArray(legend)) {
                  errors.push(`${chPath}/blueprintLegend: must be a Record<string, string>`);
                } else {
                  const leg = legend as Record<string, unknown>;
                  for (const [sym, mappedItem] of Object.entries(leg)) {
                    if (sym.length !== 1 || sym === '.') {
                      errors.push(
                        `${chPath}/blueprintLegend/${sym}: legend key must be a single non-'.' character`
                      );
                    }
                    if (typeof mappedItem !== 'string' || !itemIds.has(mappedItem)) {
                      errors.push(
                        `${chPath}/blueprintLegend/${sym}: maps to unknown item '${String(mappedItem)}'`
                      );
                    }
                  }
                  for (const sym of usedSymbols) {
                    if (!(sym in leg)) {
                      errors.push(
                        `${chPath}/blueprintLegend: missing legend entry for blueprint symbol '${sym}'`
                      );
                    }
                  }
                }
              } else if (profile === 'release') {
                errors.push(`${chPath}/blueprintLegend: release profile requires explicit blueprintLegend`);
              }
            }
          }
        });

        for (const requiredType of CHALLENGE_TYPES) {
          if (!typesFound.has(requiredType)) {
            errors.push(`${cp}/challenges: missing challenge of type '${requiredType}'`);
          }
        }
      }
    }
  }

  return errors;
}

export function validateVocabDeck(
  deck: unknown,
  fileLabel = 'vocab.json'
): string[] {
  const errors: string[] = [];
  if (!Array.isArray(deck) || deck.length !== 30) {
    errors.push(
      `${fileLabel}#: vocab deck must be an array of 30 entries (found ${Array.isArray(deck) ? deck.length : 0})`
    );
    return errors;
  }
  const seen = new Set<string>();
  deck.forEach((entry, idx) => {
    const p = `${fileLabel}#/${idx}`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`${p}: must be an object`);
      return;
    }
    const e = entry as Record<string, unknown>;
    checkAllowedKeys(e, ['word', 'translit', 'en'], p, errors);
    if (!isNonEmptyString(e.word)) {
      errors.push(`${p}/word: must be a non-empty string`);
    } else if (seen.has(e.word)) {
      errors.push(`${p}/word: duplicate word '${e.word}'`);
    } else {
      seen.add(e.word);
    }
    if (!isNonEmptyString(e.translit)) errors.push(`${p}/translit: must be a non-empty string`);
    if (!isNonEmptyString(e.en)) errors.push(`${p}/en: must be a non-empty string`);
  });
  return errors;
}

export function validateLocaleData(
  locale: unknown,
  fileLabel = 'locale.json',
  referenceKeys?: string[]
): string[] {
  const errors: string[] = [];
  if (!locale || typeof locale !== 'object' || Array.isArray(locale)) {
    errors.push(`${fileLabel}#: locale file must be a flat JSON object`);
    return errors;
  }
  const obj = locale as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length < 25) {
    errors.push(`${fileLabel}#: locale must contain at least 25 keys (found ${keys.length})`);
  }
  for (const [k, v] of Object.entries(obj)) {
    if (!isNonEmptyString(v)) {
      errors.push(`${fileLabel}#/${k}: must be a non-empty string`);
    }
  }
  if (referenceKeys) {
    const refSet = new Set(referenceKeys);
    const curSet = new Set(keys);
    for (const rk of referenceKeys) {
      if (!curSet.has(rk)) {
        errors.push(`${fileLabel}#: missing key '${rk}' present in en.json`);
      }
    }
    for (const ck of keys) {
      if (!refSet.has(ck)) {
        errors.push(`${fileLabel}#/${ck}: extra key '${ck}' not present in en.json`);
      }
    }
  }
  return errors;
}

export function validateWorkspace(
  rootDir: string,
  profile: ValidationProfile = 'structural'
): string[] {
  const errors: string[] = [];
  const storiesDir = path.join(rootDir, 'packages/content/stories');
  const packsDir = path.join(rootDir, 'packages/content/packs');
  const vocabDir = path.join(rootDir, 'packages/content/vocab');
  const localesDir = path.join(rootDir, 'apps/web/src/i18n/locales');

  const storiesByCountry = new Map<CountryId, Story>();
  const packsByCountry = new Map<CountryId, Pack>();

  // 1. Validate stories
  if (fs.existsSync(storiesDir)) {
    const storyFiles = fs
      .readdirSync(storiesDir)
      .filter((f) => f.endsWith('.json'))
      .sort();
    if (profile === 'release' && storyFiles.length !== 5) {
      errors.push(`packages/content/stories: release requires exactly 5 story files (found ${storyFiles.length})`);
    }
    for (const file of storyFiles) {
      const filePath = path.join(storiesDir, file);
      const expectedLang = path.basename(file, '.json');
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        const storyErrors = validateStory(parsed, `stories/${file}`, { expectedLang, profile });
        errors.push(...storyErrors);
        if (storyErrors.length === 0) {
          const st = parsed as Story;
          if (storiesByCountry.has(st.country)) {
            errors.push(`stories/${file}#/country: duplicate country '${st.country}' across stories`);
          }
          storiesByCountry.set(st.country, st);
        }
      } catch (e: any) {
        errors.push(`stories/${file}#: failed to parse JSON: ${e.message}`);
      }
    }
  } else if (profile === 'release') {
    errors.push('packages/content/stories: directory missing');
  }

  // 2. Validate packs
  const globalItemIds = new Set<string>();
  if (fs.existsSync(packsDir)) {
    const packFiles = fs
      .readdirSync(packsDir)
      .filter((f) => f.endsWith('.json'))
      .sort();
    if (profile === 'release' && packFiles.length !== 5) {
      errors.push(`packages/content/packs: release requires exactly 5 pack files (found ${packFiles.length})`);
    }
    for (const file of packFiles) {
      const filePath = path.join(packsDir, file);
      const expectedCountry = path.basename(file, '.json');
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        const packErrors = validatePack(parsed, `packs/${file}`, { expectedCountry, profile });
        errors.push(...packErrors);
        if (packErrors.length === 0) {
          const pk = parsed as Pack;
          if (packsByCountry.has(pk.country)) {
            errors.push(`packs/${file}#/country: duplicate country '${pk.country}' across packs`);
          }
          packsByCountry.set(pk.country, pk);
          for (const item of pk.items) {
            const globalId = `${pk.country.toLowerCase()}_${item.id}`;
            if (globalItemIds.has(globalId)) {
              errors.push(`packs/${file}#/items: global item ID collision '${globalId}'`);
            }
            globalItemIds.add(globalId);
          }
        }
      } catch (e: any) {
        errors.push(`packs/${file}#: failed to parse JSON: ${e.message}`);
      }
    }
  } else if (profile === 'release') {
    errors.push('packages/content/packs: directory missing');
  }

  // 3. Validate vocab decks if present (mandatory in release)
  if (fs.existsSync(vocabDir)) {
    const vocabFiles = fs
      .readdirSync(vocabDir)
      .filter((f) => f.endsWith('.json'))
      .sort();
    if (profile === 'release' && vocabFiles.length !== 5) {
      errors.push(`packages/content/vocab: release requires 5 vocab files (found ${vocabFiles.length})`);
    }
    for (const file of vocabFiles) {
      const lang = path.basename(file, '.json');
      if (!STORY_LANGS.includes(lang as Lang)) {
        errors.push(`vocab/${file}#: unexpected vocab language '${lang}'`);
      }
      try {
        const parsed = JSON.parse(fs.readFileSync(path.join(vocabDir, file), 'utf-8'));
        errors.push(...validateVocabDeck(parsed, `vocab/${file}`));
      } catch (e: any) {
        errors.push(`vocab/${file}#: failed to parse JSON: ${e.message}`);
      }
    }
  } else if (profile === 'release') {
    errors.push('packages/content/vocab: directory missing');
  }

  // 4. Validate UI locales if present (mandatory in release)
  if (fs.existsSync(localesDir)) {
    const localeFiles = fs
      .readdirSync(localesDir)
      .filter((f) => f.endsWith('.json'))
      .sort();
    if (profile === 'release' && localeFiles.length !== 6) {
      errors.push(`apps/web/src/i18n/locales: release requires 6 locale files (found ${localeFiles.length})`);
    }
    let enKeys: string[] | undefined;
    const enPath = path.join(localesDir, 'en.json');
    if (fs.existsSync(enPath)) {
      try {
        const enObj = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
        if (enObj && typeof enObj === 'object' && !Array.isArray(enObj)) {
          enKeys = Object.keys(enObj);
        }
      } catch {
        // Handled in loop below
      }
    }
    for (const file of localeFiles) {
      const lang = path.basename(file, '.json');
      if (!UI_LANGS.includes(lang as Lang)) {
        errors.push(`locales/${file}#: unexpected UI locale '${lang}'`);
      }
      try {
        const parsed = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf-8'));
        errors.push(
          ...validateLocaleData(
            parsed,
            `locales/${file}`,
            profile === 'release' && lang !== 'en' ? enKeys : undefined
          )
        );
      } catch (e: any) {
        errors.push(`locales/${file}#: failed to parse JSON: ${e.message}`);
      }
    }
  } else if (profile === 'release') {
    errors.push('apps/web/src/i18n/locales: directory missing');
  }

  // 5. Release-only cross-checks (all 5 countries present, art assets present)
  if (profile === 'release') {
    for (const cc of COUNTRIES) {
      if (!storiesByCountry.has(cc)) {
        errors.push(`release: missing valid story for country '${cc}' (${COUNTRY_LANG_MAP[cc]}.json)`);
      }
      if (!packsByCountry.has(cc)) {
        errors.push(`release: missing valid pack for country '${cc}' (${cc}.json)`);
      }
      const artDir = path.join(rootDir, 'apps/web/public/art', cc);
      for (const svgName of ['cover.svg', '1.svg', '2.svg', '3.svg', '4.svg', '5.svg']) {
        const svgPath = path.join(artDir, svgName);
        if (!fs.existsSync(svgPath)) {
          errors.push(`release: missing required SVG art asset 'apps/web/public/art/${cc}/${svgName}'`);
        }
      }
    }
  }

  return errors;
}

// CLI entrypoint when invoked directly
const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(__dirname, '..');
  const profileArg = process.argv.find((a) => a.startsWith('--profile='));
  const profile: ValidationProfile =
    profileArg?.split('=')[1] === 'release' ? 'release' : 'structural';

  const errors = validateWorkspace(root, profile);
  if (errors.length > 0) {
    for (const err of errors) {
      console.error(err);
    }
    process.exit(1);
  } else {
    console.log(`Validation passed (${profile} profile).`);
    process.exit(0);
  }
}
