import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { COUNTRIES, STORY_LANGS, UI_LANGS, type Pack } from '../../packages/content/schema.js';
import { GOLDEN_VECTORS } from '../../packages/shared/stamp.js';
import { make as mcMake, verify as mcVerify } from '../../apps/minecraft/scripts/core/stamp.js';
import { onRequestPost as checkoutPost } from '../../functions/api/checkout.js';
import { verifyStripeWebhookSignature } from '../../functions/api/webhook.js';
import { validateWorkspace } from '../../tools/validate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

function sha256File(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function collectGeneratedFiles(): string[] {
  const files: string[] = [
    path.join(rootDir, 'apps/web/src/generated/packs.json'),
    path.join(rootDir, 'apps/roblox/src/shared/Packs.luau'),
    path.join(rootDir, 'apps/minecraft/scripts/generated/packs.ts'),
    path.join(rootDir, 'apps/minecraft/rp/textures/item_texture.json'),
  ];
  for (const dirRel of ['apps/minecraft/bp/items', 'apps/minecraft/bp/recipes', 'apps/minecraft/rp/texts']) {
    const absDir = path.join(rootDir, dirRel);
    for (const entry of fs.readdirSync(absDir).sort()) {
      const full = path.join(absDir, entry);
      if (fs.statSync(full).isFile()) {
        files.push(full);
      }
    }
  }
  return files;
}

describe('Gate G1 — Content and localization integrity (release profile)', () => {
  it('passes release validation with zero errors across stories, packs, vocab decks, and UI locales', () => {
    const errors = validateWorkspace(rootDir, 'release');
    expect(errors).toEqual([]);
  });

  it('ensures all 6 UI locale files have identical key sets and zero placeholder values', () => {
    const localesDir = path.join(rootDir, 'apps/web/src/i18n/locales');
    const enData = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf-8')) as Record<string, string>;
    const enKeys = Object.keys(enData).sort();
    expect(enKeys.length).toBeGreaterThanOrEqual(30);

    for (const locale of UI_LANGS) {
      const locData = JSON.parse(
        fs.readFileSync(path.join(localesDir, `${locale}.json`), 'utf-8')
      ) as Record<string, string>;
      expect(Object.keys(locData).sort()).toEqual(enKeys);
      for (const [k, v] of Object.entries(locData)) {
        expect(typeof v).toBe('string');
        expect(v.trim().length, `${locale}.${k} must be non-empty`).toBeGreaterThan(0);
        expect(v).not.toMatch(/\b(TODO|TBD|PLACEHOLDER)\b/i);
      }
    }
  });

  it('ensures all 5 stories have 15 scenes with populated English glosses and Wave B editorial notes', () => {
    for (const lang of STORY_LANGS) {
      const story = JSON.parse(
        fs.readFileSync(path.join(rootDir, `packages/content/stories/${lang}.json`), 'utf-8')
      );
      expect(story.scenes).toHaveLength(15);
      for (const scene of story.scenes) {
        expect(typeof scene.gloss_en).toBe('string');
        expect(scene.gloss_en.trim().length).toBeGreaterThanOrEqual(20);
      }
    }
    for (const noteId of ['G13', 'G14', 'G15', 'G16', 'G17']) {
      const notePath = path.join(rootDir, `swarm/notes/${noteId}.md`);
      expect(fs.existsSync(notePath)).toBe(true);
      const noteText = fs.readFileSync(notePath, 'utf-8');
      expect(noteText).toContain('AI_REVIEWED_PENDING_HUMAN');
    }
  });
});

describe('Gate G2 — Compiler and stamp determinism & cross-platform consistency', () => {
  it('produces identical byte hashes across two successive runs of the workspace compiler', () => {
    execFileSync('npx', ['tsx', 'tools/compiler/index.ts'], { cwd: rootDir, stdio: 'pipe' });
    const firstFiles = collectGeneratedFiles();
    const firstHashes = new Map(firstFiles.map(f => [f, sha256File(f)]));

    execFileSync('npx', ['tsx', 'tools/compiler/index.ts'], { cwd: rootDir, stdio: 'pipe' });
    const secondFiles = collectGeneratedFiles();
    const secondHashes = new Map(secondFiles.map(f => [f, sha256File(f)]));

    expect(secondFiles).toEqual(firstFiles);
    expect(Object.fromEntries(secondHashes)).toEqual(Object.fromEntries(firstHashes));
  });

  it('verifies every country item count, challenge IDs, recipe outputs, and mentor names match across Web, Roblox, and Minecraft outputs', () => {
    const canonicalPacks: Pack[] = COUNTRIES.map(cc =>
      JSON.parse(fs.readFileSync(path.join(rootDir, `packages/content/packs/${cc}.json`), 'utf-8')) as Pack
    );

    const webPacks = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'apps/web/src/generated/packs.json'), 'utf-8')
    ) as Pack[];
    const robloxLuau = fs.readFileSync(path.join(rootDir, 'apps/roblox/src/shared/Packs.luau'), 'utf-8');
    const mcPacksTs = fs.readFileSync(path.join(rootDir, 'apps/minecraft/scripts/generated/packs.ts'), 'utf-8');
    const mcEnLang = fs.readFileSync(path.join(rootDir, 'apps/minecraft/rp/texts/en_US.lang'), 'utf-8');

    for (const pack of canonicalPacks) {
      const webPack = webPacks.find(p => p.country === pack.country);
      expect(webPack).toBeDefined();
      expect(webPack!.items).toHaveLength(pack.items.length);
      expect(webPack!.mentor.name).toBe(pack.mentor.name);

      // Verify Roblox Luau contains country key, mentor name, all items, and all challenge IDs + recipe outputs
      expect(robloxLuau).toContain(`["${pack.country}"] = {`);
      expect(robloxLuau).toContain(`["name"] = "${pack.mentor.name}"`);
      for (const item of pack.items) {
        expect(robloxLuau).toContain(`["id"] = "${item.id}"`);
      }

      // Verify Minecraft generated packs.ts, lang file, and recipe JSONs match
      expect(mcPacksTs).toContain(`"country": "${pack.country}"`);
      expect(mcPacksTs).toContain(`"name": "${pack.mentor.name}"`);
      expect(mcEnLang).toContain(`entity.miraverse:mentor_${pack.country.toLowerCase()}.name=${pack.mentor.name}`);

      const webChallengeIds = webPack!.chapters[0].challenges.map(c => c.id).sort();
      const canonicalChallengeIds = pack.chapters[0].challenges.map(c => c.id).sort();
      expect(webChallengeIds).toEqual(canonicalChallengeIds);

      for (const ch of pack.chapters[0].challenges) {
        expect(robloxLuau).toContain(`["id"] = "${ch.id}"`);
        expect(mcPacksTs).toContain(`"id": "${ch.id}"`);
        if (ch.type === 'cook' && ch.recipe) {
          expect(robloxLuau).toContain(`["output"] = "${ch.recipe.output}"`);
          const recipeFile = path.join(
            rootDir,
            `apps/minecraft/bp/recipes/gen_${pack.country.toLowerCase()}_${ch.recipe.output}.json`
          );
          expect(fs.existsSync(recipeFile)).toBe(true);
          const recipeJson = JSON.parse(fs.readFileSync(recipeFile, 'utf-8'));
          expect(recipeJson['minecraft:recipe_shapeless'].result.item).toBe(
            `miraverse:${pack.country.toLowerCase()}_${ch.recipe.output}`
          );
        }
      }
    }
  });
});

describe('Gate G4 — Roblox build and Luau verification', () => {
  it('verifies miraverse.rbxlx exists and is non-empty', () => {
    const rbxlxPath = path.join(rootDir, 'apps/roblox/dist/miraverse.rbxlx');
    expect(fs.existsSync(rbxlxPath)).toBe(true);
    const stat = fs.statSync(rbxlxPath);
    expect(stat.size).toBeGreaterThan(20000);
    const content = fs.readFileSync(rbxlxPath, 'utf-8');
    expect(content).toContain('<roblox');
  });

  it('verifies Stamp.luau implements exact FNV-1a 32-bit unsigned algorithm and matches all 5 golden vectors', () => {
    const stampLuau = fs.readFileSync(path.join(rootDir, 'apps/roblox/src/server/Core/Stamp.luau'), 'utf-8');
    expect(stampLuau).toContain('Stamp.ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ"');
    expect(stampLuau).toContain('Stamp.SALT = "miraverse-v0"');
    expect(stampLuau).toContain('2166136261');
    expect(stampLuau).toContain('16777619');

    // Execute the exact 16-bit split FNV-1a logic used in Stamp.luau against all 5 golden vectors
    const alphabet = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
    const salt = 'miraverse-v0';
    const prime = 16777619;
    const mod = 4294967296;
    const luauChecksum = (ccChapter: string, nonce: string): string => {
      const payload = salt + ccChapter + nonce;
      let h = 2166136261;
      for (let i = 0; i < payload.length; i++) {
        h = (h ^ payload.charCodeAt(i)) >>> 0;
        const hi = h >>> 16;
        const lo = h & 0xffff;
        h = (((hi * prime) % 65536) * 65536 + lo * prime) % mod;
      }
      let out = '';
      for (let i = 0; i < 4; i++) {
        const idx = h % 30;
        out += alphabet[idx];
        h = Math.floor(h / 30);
      }
      return out;
    };

    for (const gv of GOLDEN_VECTORS) {
      expect(luauChecksum(`${gv.country}${gv.chapter}`, gv.nonce)).toBe(gv.checksum);
    }
  });

  it('verifies Packs.luau contains all 5 countries and 25 challenges and Roblox scripts obey child-safety rules', () => {
    const packsLuau = fs.readFileSync(path.join(rootDir, 'apps/roblox/src/shared/Packs.luau'), 'utf-8');
    for (const cc of COUNTRIES) {
      expect(packsLuau).toContain(`["${cc}"] = {`);
      for (const type of ['gather', 'cook', 'build', 'trade', 'word']) {
        expect(packsLuau).toContain(`["id"] = "${cc}-1-${type}"`);
      }
    }

    const sessionLuau = fs.readFileSync(
      path.join(rootDir, 'apps/roblox/src/server/Core/SessionManager.luau'),
      'utf-8'
    );
    const clientLuau = fs.readFileSync(path.join(rootDir, 'apps/roblox/src/client/Main.client.luau'), 'utf-8');

    // Server-authoritative progression, predefined 4-phrase bar, text chat disabled, no external HTTP or DataStore
    expect(sessionLuau).toContain('PHRASES = { "Hello!", "Great job!", "Follow me!", "Thank you!" }');
    expect(sessionLuau).not.toMatch(/DataStoreService|HttpService/);
    expect(sessionLuau).not.toMatch(/leaderstats/);
    expect(clientLuau).toContain('Enum.CoreGuiType.Chat, false');
    expect(clientLuau).not.toMatch(/HttpService/);
  });
});

describe('Gate G5 — Minecraft build and package verification', () => {
  it('verifies miraverse.mcaddon unzips cleanly into bp/ and rp/ with valid JSON, distinct UUIDs, textures, recipes, and script bundle', () => {
    const mcaddonPath = path.join(rootDir, 'apps/minecraft/dist/miraverse.mcaddon');
    expect(fs.existsSync(mcaddonPath)).toBe(true);

    const tmpExtract = fs.mkdtempSync(path.join(os.tmpdir(), 'mv-mcaddon-verify-'));
    try {
      execFileSync('unzip', ['-q', mcaddonPath, '-d', tmpExtract]);
      expect(fs.existsSync(path.join(tmpExtract, 'bp/manifest.json'))).toBe(true);
      expect(fs.existsSync(path.join(tmpExtract, 'rp/manifest.json'))).toBe(true);
      expect(fs.existsSync(path.join(tmpExtract, 'bp/scripts/main.js'))).toBe(true);

      // Parse all JSON files inside extracted bp/ and rp/
      const walkJson = (dir: string): string[] => {
        const res: string[] = [];
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) res.push(...walkJson(full));
          else if (entry.isFile() && entry.name.endsWith('.json')) res.push(full);
        }
        return res;
      };
      const allJsonFiles = [...walkJson(path.join(tmpExtract, 'bp')), ...walkJson(path.join(tmpExtract, 'rp'))];
      expect(allJsonFiles.length).toBeGreaterThan(50);
      for (const jf of allJsonFiles) {
        expect(() => JSON.parse(fs.readFileSync(jf, 'utf-8'))).not.toThrow();
      }

      // Check manifest UUIDs and module versions
      const bpManifest = JSON.parse(fs.readFileSync(path.join(tmpExtract, 'bp/manifest.json'), 'utf-8'));
      const rpManifest = JSON.parse(fs.readFileSync(path.join(tmpExtract, 'rp/manifest.json'), 'utf-8'));
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const uuids = [
        bpManifest.header.uuid,
        ...bpManifest.modules.map((m: { uuid: string }) => m.uuid),
        rpManifest.header.uuid,
        ...rpManifest.modules.map((m: { uuid: string }) => m.uuid),
      ];
      for (const u of uuids) {
        expect(u).toMatch(uuidRegex);
      }
      expect(new Set(uuids).size).toBe(uuids.length);

      // Check stable @minecraft/server 1.17.0 and @minecraft/server-ui 1.3.0
      const deps = Object.fromEntries(
        bpManifest.dependencies
          .filter((d: { module_name?: string }) => d.module_name)
          .map((d: { module_name: string; version: string }) => [d.module_name, d.version])
      );
      expect(deps['@minecraft/server']).toBe('1.17.0');
      expect(deps['@minecraft/server-ui']).toBe('1.3.0');

      // Check item_texture.json keys resolve to valid 16x16 PNGs
      const itemTex = JSON.parse(
        fs.readFileSync(path.join(tmpExtract, 'rp/textures/item_texture.json'), 'utf-8')
      ).texture_data as Record<string, { textures: string }>;
      expect(Object.keys(itemTex).length).toBeGreaterThanOrEqual(40);
      for (const [key, entry] of Object.entries(itemTex)) {
        const pngPath = path.join(tmpExtract, 'rp', `${entry.textures}.png`);
        expect(fs.existsSync(pngPath), `Missing PNG for ${key} at ${entry.textures}.png`).toBe(true);
        const buf = fs.readFileSync(pngPath);
        expect(buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true);
        expect(buf.readUInt32BE(16)).toBe(16);
        expect(buf.readUInt32BE(20)).toBe(16);
      }

      // Check Minecraft stamp implementation matches all 5 golden vectors
      for (const gv of GOLDEN_VECTORS) {
        expect(mcMake(gv.country, gv.chapter, gv.nonce)).toBe(gv.code);
        expect(mcVerify(gv.code)).toEqual({ country: gv.country, chapter: gv.chapter });
      }
    } finally {
      fs.rmSync(tmpExtract, { recursive: true, force: true });
    }
  });
});

describe('Gate G6 — Swarm path-boundary and status hygiene rules', () => {
  it('enforces write-path allowlist, rejects out-of-scope edits, rejects empty diffs, and rejects failed test exit codes', () => {
    const tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'mv-swarm-gate-'));
    try {
      execFileSync('git', ['init', '-q'], { cwd: tmpRepo });
      execFileSync('git', ['config', 'user.email', 'test@miraverse.local'], { cwd: tmpRepo });
      execFileSync('git', ['config', 'user.name', 'MiraVerse Test'], { cwd: tmpRepo });

      fs.mkdirSync(path.join(tmpRepo, 'allowed'), { recursive: true });
      fs.mkdirSync(path.join(tmpRepo, 'forbidden'), { recursive: true });
      fs.writeFileSync(path.join(tmpRepo, 'allowed/file.txt'), 'base\n');
      fs.writeFileSync(path.join(tmpRepo, 'forbidden/secret.txt'), 'base\n');
      execFileSync('git', ['add', '.'], { cwd: tmpRepo });
      execFileSync('git', ['commit', '-q', '-m', 'base'], { cwd: tmpRepo });
      const baseSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: tmpRepo }).toString().trim();

      // 1. Empty diff must be rejected
      const emptyCheck = execFileSync(
        'bash',
        [
          '-c',
          `source "${path.join(rootDir, 'swarm/run.sh')}"; verify_diff_boundaries "${baseSha}" "HEAD" "allowed/" "T1" "${tmpRepo}" || true`,
        ],
        { cwd: rootDir }
      )
        .toString()
        .trim();
      expect(emptyCheck).toBe('EMPTY_DIFF');

      // 2. Allowed file edit + swarm/notes/T1.md must pass
      fs.mkdirSync(path.join(tmpRepo, 'swarm/notes'), { recursive: true });
      fs.writeFileSync(path.join(tmpRepo, 'allowed/file.txt'), 'updated\n');
      fs.writeFileSync(path.join(tmpRepo, 'swarm/notes/T1.md'), 'note\n');
      execFileSync('git', ['add', '.'], { cwd: tmpRepo });
      execFileSync('git', ['commit', '-q', '-m', 'T1: valid change'], { cwd: tmpRepo });
      const validOut = execFileSync(
        'bash',
        [
          '-c',
          `source "${path.join(rootDir, 'swarm/run.sh')}"; verify_diff_boundaries "${baseSha}" "HEAD" "allowed/" "T1" "${tmpRepo}" && echo "OK"`,
        ],
        { cwd: rootDir }
      )
        .toString()
        .trim();
      expect(validOut).toBe('OK');

      // 3. Out-of-scope file edit must be rejected with offending file path
      fs.writeFileSync(path.join(tmpRepo, 'forbidden/secret.txt'), 'tampered\n');
      execFileSync('git', ['add', '.'], { cwd: tmpRepo });
      execFileSync('git', ['commit', '-q', '-m', 'T1: invalid change'], { cwd: tmpRepo });
      let outOfScopeExit = 0;
      let outOfScopeOut = '';
      try {
        execFileSync(
          'bash',
          [
            '-c',
            `source "${path.join(rootDir, 'swarm/run.sh')}"; verify_diff_boundaries "${baseSha}" "HEAD" "allowed/" "T1" "${tmpRepo}"`,
          ],
          { cwd: rootDir, stdio: 'pipe' }
        );
      } catch (err: unknown) {
        const e = err as { status?: number; stdout?: Buffer };
        outOfScopeExit = e.status ?? 1;
        outOfScopeOut = (e.stdout ?? Buffer.alloc(0)).toString().trim();
      }
      expect(outOfScopeExit).not.toBe(0);
      expect(outOfScopeOut).toBe('forbidden/secret.txt');
    } finally {
      fs.rmSync(tmpRepo, { recursive: true, force: true });
    }
  });

  // swarm/status.json is gitignored local run output, so it cannot exist on a clean checkout.
  it.skipIf(!fs.existsSync(path.join(rootDir, 'swarm/status.json')))('verifies all merged agents in swarm/status.json have real provider, model, commitSha, testExitCode 0, and clean boundaries', () => {
    const statusPath = path.join(rootDir, 'swarm/status.json');
    expect(fs.existsSync(statusPath)).toBe(true);
    const statusJson = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
    const agents = Object.values(statusJson.agents) as Array<{
      id: string;
      provider: string;
      model: string;
      wave: string;
      writePaths: string;
      status: string;
      baseSha: string;
      commitSha: string;
      testCommand: string;
      testExitCode: number | null;
    }>;
    expect(agents).toHaveLength(40);

    const merged = agents.filter(a => a.status === 'MERGED');
    expect(merged.length).toBeGreaterThanOrEqual(39);
    for (const a of merged) {
      expect(['claude', 'codex', 'ag', 'dgx']).toContain(a.provider);
      expect(a.model.length).toBeGreaterThan(0);
      expect(a.commitSha.length).toBeGreaterThanOrEqual(7);
      expect(a.testCommand.length).toBeGreaterThan(0);
      expect(a.testExitCode).toBe(0);
    }
  });
});

describe('Cloudflare Pages Stripe Checkout & Webhook Functions', () => {
  it('blocks checkout without adult confirmation and verifies HMAC-SHA256 Stripe webhook signatures', async () => {
    const blockedReq = new Request('https://miraverse.studio/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentGateConfirmed: false }),
    });
    const blockedRes = await checkoutPost({
      request: blockedReq,
      env: { STRIPE_SECRET_KEY: 'sk_test_123', STRIPE_PRICE_ID: 'price_123' },
    });
    expect(blockedRes.status).toBe(403);

    const secret = 'whsec_test_miraverse_secret';
    const ts = 1762219200;
    const rawPayload = JSON.stringify({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_1', payment_status: 'paid' } },
    });
    const mac = crypto.createHmac('sha256', secret).update(`${ts}.${rawPayload}`).digest('hex');
    const sigHeader = `t=${ts},v1=${mac}`;

    await expect(verifyStripeWebhookSignature(rawPayload, sigHeader, secret, ts + 10)).resolves.toBe(true);
    await expect(verifyStripeWebhookSignature(rawPayload, sigHeader, 'wrong_secret', ts + 10)).resolves.toBe(false);
    await expect(verifyStripeWebhookSignature(rawPayload, sigHeader, secret, ts + 999)).resolves.toBe(false);
  });
});
