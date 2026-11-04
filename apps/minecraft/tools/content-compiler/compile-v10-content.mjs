#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const COUNTRIES = ['LB', 'EG', 'IQ', 'KR', 'FR'];

export function compileContentPacks() {
  const summary = [];
  for (const cc of COUNTRIES) {
    const p = path.join(ROOT, 'packages/content/countries', cc, 'pack.json');
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      summary.push({
        country: cc,
        mentorId: data.mentor?.id ?? `mentor_${cc.toLowerCase()}`,
        chapterCount: data.chapters?.length ?? 1,
        vocabCount: data.vocabulary?.length ?? 0,
      });
    }
  }
  return summary;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(compileContentPacks(), null, 2));
}
