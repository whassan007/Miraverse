import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Read-only inventory of inputs/builds. Presence never establishes runtime readiness.
const root = fileURLToPath(new URL('../../', import.meta.url));
const countries = 'LB IQ EG FR KR DE CN JP RU UA MA MX GT SV DO CU JM SY IR PL RO GB VN PK IN PH IT'.split(' ');
const fullLocales = 'en-US en-GB en-JM en-IN en-PH fr-FR fr-CA es-MX es-GT es-SV es-DO es-CU es-419 ar-001 ar-LB ar-IQ ar-EG ar-MA ar-SY de-DE zh-Hans-CN ja-JP ru-RU uk-UA ko-KR fa-IR pl-PL ro-RO vi-VN ur-PK hi-IN fil-PH it-IT'.split(' ');
const learningLocales = 'quc-GT nah-MX jam-JM tzm-Tfng-MA sd-Arab-PK pa-Arab-PK'.split(' ');
const stages = ['ART_READY', 'ROUTE_READY', 'QUESTS_READY', 'LOCALIZATION_READY', 'NATIVE_TESTED', 'RELEASED'];
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
function files(dir) {
  const absolute = path.join(root, dir);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap(entry => {
    const name = path.posix.join(dir, entry.name);
    return entry.isDirectory() ? files(name) : entry.isFile() ? [name] : [];
  });
}
function fingerprint(file) {
  const data = fs.readFileSync(path.join(root, file));
  return { path: file, bytes: data.length, sha256: crypto.createHash('sha256').update(data).digest('hex'), nativeVerified: false };
}
const commit = git('rev-parse', 'HEAD');
const packFiles = files('packages/content/packs').filter(p => p.endsWith('.json'));
const report = {
  schemaVersion: '1.2.0', kind: 'BASELINE_OBSERVATIONS_NOT_RELEASE_APPROVAL', commit,
  workingTree: git('status', '--short'), hardware: `${process.platform}/${process.arch}`,
  expected: { countries: 27, chapters: 162, ageVariants: 648, platforms: 2 },
  activeLegacyPacks: packFiles.map(p => { const data = JSON.parse(fs.readFileSync(path.join(root, p))); return { country: data.country, chapters: data.chapters.length, ...fingerprint(p) }; }),
  artifacts: ['apps/roblox/dist', 'apps/minecraft/dist', 'apps/web/dist'].flatMap(files).map(fingerprint),
  sourceEvidence: ['swarm/minecraft-global/manifest.json', 'swarm/minecraft-global/catalog-data.mjs', 'apps/roblox/default.project.json', 'apps/roblox/src/server/Main.server.luau', 'apps/roblox/src/server/MapBuilder.luau', 'apps/roblox/src/server/world/WorldBuilder.server.luau', 'apps/minecraft/scripts/main.ts', 'apps/minecraft/package.json', 'tools/compiler/index.ts'].map(fingerprint),
  countryPlatformBaseline: countries.flatMap(country => ['roblox', 'minecraft-bedrock'].map(platform => ({
    country, platform, commit, platformVersion: null, hardware: null,
    status: 'NOT_RUN', stages: Object.fromEntries(stages.map(stage => [stage, 'NOT_RUN'])),
    culturalReview: 'CULTURAL_REVIEW_PENDING', screenshot: null, video: null,
    questIds: Array.from({ length: 6 }, (_, i) => `${country}0${i + 1}`),
    artifactIds: null, nativeTestMethod: null, owner: null,
  }))),
  localeBaseline: [...fullLocales, ...learningLocales].flatMap(locale => ['roblox', 'minecraft-bedrock'].map(platform => ({
    locale, platform, tier: fullLocales.includes(locale) ? 'full' : 'learning',
    status: 'NOT_RUN', coverageStatus: 'BLOCKED', reason: 'No current native rendering evidence or human sign-off audited',
    nativeLocaleId: null, reviewer: null, screenshot: null,
  }))),
};
// stdout only: callers choose a snapshot path, so existing approvals cannot be overwritten.
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
