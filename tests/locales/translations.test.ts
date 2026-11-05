import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const LOCALE_DIR = 'packages/content/locales';
const PLACEHOLDER = /^‏?\[[^\]]+\]\s|^【[^】]+】|— ‏?\[[^\]]+\]\s|— 【[^】]+】/;
const AUTHORING_ONLY = /^country\.[A-Z]{2}\.cultural_warning$/;

const load = (locale: string) =>
  JSON.parse(fs.readFileSync(path.join(LOCALE_DIR, locale, 'messages.json'), 'utf8'));
const english = load('en-US').strings as Record<string, string>;
const locales = fs.readdirSync(LOCALE_DIR).filter((id) => id !== 'en-US');

describe('translations', () => {
  it('covers all 13 other languages', () => {
    expect(locales).toHaveLength(13);
  });

  for (const locale of locales) {
    it(`${locale} has every player string, with no placeholder text`, () => {
      const { strings, humanReviewRequired } = load(locale);
      const problems = Object.keys(english).filter((key) => {
        if (AUTHORING_ONLY.test(key)) return false;
        return !strings[key] || PLACEHOLDER.test(strings[key]);
      });
      expect(problems).toEqual([]);
      expect(humanReviewRequired).toBe(true);
    });
  }

  it('keeps the same %s slots as English in every language', () => {
    const slots = (text: string) => (text.match(/%s/g) ?? []).length;
    const problems: string[] = [];
    for (const locale of locales) {
      const { strings } = load(locale);
      for (const [key, value] of Object.entries(english)) {
        if (slots(value) !== slots(strings[key] ?? '')) problems.push(`${locale} ${key}: ${strings[key]}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('shows children no instructions meant for writers', () => {
    const notes = Object.entries(english).filter(([key]) => key.endsWith('.source_note'));
    expect(notes).toHaveLength(66);
    for (const [key, note] of notes) {
      expect(note, key).not.toMatch(/should not|must not|\bRemove\b|\bAvoid\b|^\[/);
    }
  });
});
