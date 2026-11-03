import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Story, Pack, ChallengeType } from '../packages/content/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const storiesDir = path.join(root, 'packages/content/stories');
const packsDir = path.join(root, 'packages/content/packs');

const errors: string[] = [];

const challengeTypes: ChallengeType[] = ['build', 'cook', 'gather', 'trade', 'word'];
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// 1. Check stories
if (fs.existsSync(storiesDir)) {
  const storyFiles = fs.readdirSync(storiesDir).filter(f => f.endsWith('.json'));
  for (const file of storyFiles) {
    const filePath = path.join(storiesDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const story: Story = JSON.parse(content);
      const expectedLang = path.basename(file, '.json');

      if (story.lang !== expectedLang) {
        errors.push(`${file}: lang '${story.lang}' does not match filename '${expectedLang}'`);
      }

      if (!Array.isArray(story.scenes) || story.scenes.length !== 15) {
        errors.push(`${file}: must have exactly 15 scenes (found ${story.scenes?.length ?? 0})`);
      } else {
        story.scenes.forEach((scene, idx) => {
          if (!scene.text || scene.text.trim() === '') {
            errors.push(`${file}: scene ${idx + 1} (id: ${scene.id}) has empty text`);
          }
        });
      }

      if (!Array.isArray(story.vocab) || story.vocab.length !== 10) {
        errors.push(`${file}: must have exactly 10 vocab entries (found ${story.vocab?.length ?? 0})`);
      }
    } catch (e: any) {
      errors.push(`${file}: failed to parse JSON or validate: ${e.message}`);
    }
  }
}

// 2. Check packs
if (fs.existsSync(packsDir)) {
  const packFiles = fs.readdirSync(packsDir).filter(f => f.endsWith('.json'));
  for (const file of packFiles) {
    const filePath = path.join(packsDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const pack: Pack = JSON.parse(content);

      if (!pack.colors || !hexColorRegex.test(pack.colors.primary) || !hexColorRegex.test(pack.colors.secondary)) {
        errors.push(`${file}: invalid primary or secondary hex colors (${pack.colors?.primary}, ${pack.colors?.secondary})`);
      }

      const itemIds = new Set((pack.items || []).map(i => i.id));
      for (const item of pack.items || []) {
        if (!item.color || !hexColorRegex.test(item.color)) {
          errors.push(`${file}: item '${item.id}' has invalid hex color '${item.color}'`);
        }
      }

      if (!Array.isArray(pack.chapters) || pack.chapters.length !== 1) {
        errors.push(`${file}: must have exactly 1 chapter (found ${pack.chapters?.length ?? 0})`);
      } else {
        const chapter = pack.chapters[0];
        if (!Array.isArray(chapter.challenges) || chapter.challenges.length !== 5) {
          errors.push(`${file}: chapter must have exactly 5 challenges (found ${chapter.challenges?.length ?? 0})`);
        } else {
          const typesFound = new Set<ChallengeType>();
          for (const ch of chapter.challenges) {
            typesFound.add(ch.type);

            if (ch.needs) {
              for (const n of ch.needs) {
                if (!itemIds.has(n.item)) {
                  errors.push(`${file}: challenge '${ch.id}' needs item '${n.item}' which is not in items list`);
                }
              }
            }

            if (ch.recipe) {
              for (const input of ch.recipe.inputs) {
                if (!itemIds.has(input)) {
                  errors.push(`${file}: challenge '${ch.id}' recipe input '${input}' is not in items list`);
                }
              }
              if (!itemIds.has(ch.recipe.output)) {
                errors.push(`${file}: challenge '${ch.id}' recipe output '${ch.recipe.output}' is not in items list`);
              }
            }
          }

          for (const requiredType of challengeTypes) {
            if (!typesFound.has(requiredType)) {
              errors.push(`${file}: missing challenge of type '${requiredType}'`);
            }
          }
        }
      }
    } catch (e: any) {
      errors.push(`${file}: failed to parse JSON or validate: ${e.message}`);
    }
  }
}

if (errors.length > 0) {
  for (const err of errors) {
    console.error(err);
  }
  process.exit(1);
} else {
  console.log('Validation passed.');
  process.exit(0);
}
