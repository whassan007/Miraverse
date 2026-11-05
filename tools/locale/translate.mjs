#!/usr/bin/env node
/**
 * Machine-translates pending strings in packages/content/locales through `agy` (Gemini).
 * A string is pending when it still holds a placeholder such as "[DE] text". Results are
 * validated and saved after every batch, so a stopped run resumes where it left off.
 * All output stays flagged humanReviewRequired in its catalog.
 *
 *   node tools/locale/translate.mjs [--check] [--locale de-DE] [--work-dir DIR]
 */
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const LOCALE_DIR = path.join(ROOT, 'packages/content/locales');
const MODEL = 'gemini-3.8-flash-medium';
const BATCH_SIZE = 35;
const CONCURRENCY = 4;
const MAX_ATTEMPTS = 4;
const TIMEOUT_MS = 240_000;

// Authoring notes for writers, not player text, so they stay in English.
const UNTRANSLATED = /^country\.[A-Z]{2}\.cultural_warning$/;
export const PLACEHOLDER = /^‏?\[[^\]]+\]\s|^【[^】]+】|— ‏?\[[^\]]+\]\s|— 【[^】]+】/;

const LANGUAGES = {
  ar: { name: 'Modern Standard Arabic', script: /[؀-ۿ]/ },
  'ar-EG': { name: 'Egyptian (Cairene) Arabic, written in Arabic script', script: /[؀-ۿ]/ },
  'ar-IQ': { name: 'Iraqi (Baghdadi) Arabic, written in Arabic script', script: /[؀-ۿ]/ },
  'ar-LB': { name: 'Lebanese Arabic, written in Arabic script', script: /[؀-ۿ]/ },
  'ar-MA': { name: 'Moroccan Darija, written in Arabic script', script: /[؀-ۿ]/ },
  'de-DE': { name: 'German', script: /[A-Za-zÄÖÜäöüß]/ },
  'fr-CA': { name: 'Canadian French', script: /[A-Za-zÀ-ÿ]/ },
  'fr-FR': { name: 'French (France)', script: /[A-Za-zÀ-ÿ]/ },
  'ja-JP': { name: 'Japanese', script: /[぀-ヿ一-鿿]/ },
  'ko-KR': { name: 'Korean', script: /[가-힯]/ },
  'ru-RU': { name: 'Russian', script: /[Ѐ-ӿ]/ },
  'uk-UA': { name: 'Ukrainian', script: /[Ѐ-ӿ]/ },
  'zh-Hans-CN': { name: 'Simplified Chinese', script: /[一-鿿]/ },
};

const args = process.argv.slice(2);
const argValue = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
const only = argValue('--locale');
const workDir = argValue('--work-dir') ?? fs.mkdtempSync(path.join(os.tmpdir(), 'mv-translate-'));

const catalogPath = (locale) => path.join(LOCALE_DIR, locale, 'messages.json');
const load = (locale) => JSON.parse(fs.readFileSync(catalogPath(locale), 'utf8'));
const english = load('en-US').strings;

function pendingKeys(strings) {
  return Object.keys(english).filter((key) => {
    if (UNTRANSLATED.test(key)) return false;
    return !strings[key] || PLACEHOLDER.test(strings[key]);
  });
}

function promptFor(language, batch) {
  return [
    `Translate each JSON value from English into ${language.name} for a children's educational game (ages 5 to 17).`,
    'Use warm, simple, natural wording that a child would understand. Address the player informally.',
    'Rules:',
    '- Return ONLY a JSON object with exactly the same keys. No commentary and no code fences.',
    '- Keep chapter codes such as DE01 unchanged.',
    '- Write names of people and places in the target script, in their usual form for that language.',
    '- For values shaped "native (pronunciation) — meaning", keep the part before "—" exactly and translate only the meaning.',
    '- Keep the words folklore, legend and fiction accurate: never present a legend as fact.',
    'Do not use any tools.',
    '',
    JSON.stringify(batch),
  ].join('\n');
}

function callModel(prompt) {
  return new Promise((resolve, reject) => {
    execFile(
      'agy',
      ['-p', prompt, '--model', MODEL, '--output-format', 'json', '--print-timeout', '220s'],
      { cwd: workDir, timeout: TIMEOUT_MS, maxBuffer: 16 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (!error) return resolve(stdout);
        // error.message repeats the whole prompt, so report only the useful part.
        const reason = error.killed ? 'timed out' : `exit ${error.code}`;
        reject(new Error(`agy ${reason}: ${String(stderr || stdout).trim().slice(-200)}`));
      }
    );
  });
}

function parseResponse(stdout) {
  const envelope = JSON.parse(stdout.slice(stdout.indexOf('{')));
  if (envelope.status !== 'SUCCESS') throw new Error(`status ${envelope.status}`);
  const text = envelope.response.trim().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  return JSON.parse(text);
}

/** Returns the problems with a translated batch; an empty list means it can be saved. */
export function validateBatch(language, batch, result) {
  const problems = [];
  for (const [key, source] of Object.entries(batch)) {
    const value = result[key];
    if (typeof value !== 'string' || value.trim() === '') {
      problems.push(`${key}: missing`);
      continue;
    }
    if (PLACEHOLDER.test(value)) problems.push(`${key}: placeholder`);
    // Character greetings are written in the character's own language and may stay in it.
    if (/^npc\..+\.greeting$/.test(key)) continue;
    // Names and codes can legitimately stay the same, so only flag longer sentences.
    const isName = /\.name$/.test(key);
    if (value === source && !isName && source.split(' ').length > 3) problems.push(`${key}: untranslated`);
    const meaning = value.includes(' — ') ? value.split(' — ').slice(1).join(' — ') : value;
    if (!language.script.test(meaning)) problems.push(`${key}: wrong script`);
  }
  return problems;
}

async function translateBatch(locale, keys) {
  const language = LANGUAGES[locale];
  const batch = Object.fromEntries(keys.map((key) => [key, english[key]]));
  let lastProblem = '';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = parseResponse(await callModel(promptFor(language, batch)));
      const problems = validateBatch(language, batch, result);
      if (problems.length === 0) {
        const catalog = load(locale);
        for (const key of keys) catalog.strings[key] = result[key];
        catalog.keyCount = Object.keys(catalog.strings).length;
        fs.writeFileSync(catalogPath(locale), `${JSON.stringify(catalog, null, 2)}\n`);
        return true;
      }
      lastProblem = problems.slice(0, 3).join('; ');
    } catch (error) {
      lastProblem = String(error.message ?? error).slice(0, 200);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 5000));
  }
  console.log(`FAILED ${locale} [${keys[0]}…]: ${lastProblem}`);
  return false;
}

function report() {
  let total = 0;
  for (const locale of Object.keys(LANGUAGES)) {
    const pending = pendingKeys(load(locale).strings).length;
    total += pending;
    console.log(`${locale}: ${pending} pending`);
  }
  return total;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (args.includes('--check')) {
    process.exit(report() > 0 ? 1 : 0);
  }
  const jobs = [];
  for (const locale of Object.keys(LANGUAGES)) {
    if (only && locale !== only) continue;
    const pending = pendingKeys(load(locale).strings);
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      jobs.push([locale, pending.slice(i, i + BATCH_SIZE)]);
    }
  }
  console.log(`${jobs.length} batches queued`);
  let done = 0;
  let failed = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (jobs.length > 0) {
        const [locale, keys] = jobs.shift();
        const ok = await translateBatch(locale, keys);
        done += 1;
        if (!ok) failed += 1;
        if (done % 10 === 0) console.log(`${done} batches done, ${failed} failed, ${jobs.length} left`);
      }
    })
  );
  console.log(`Finished: ${done} batches, ${failed} failed`);
  process.exit(report() > 0 ? 1 : 0);
}
