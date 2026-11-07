/**
 * Repository-wide checks for machine identifiers and custom block textures. Static checks
 * like these can't show that a block renders in the game; that needs a real client.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const MC = 'apps/minecraft';
const VALID_ID = /^[a-z0-9_]+$/;
const blockFiles = fs.readdirSync(path.join(MC, 'bp/blocks')).filter((f) => f.endsWith('.json'));
const readJson = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));

// Generated, historical or binary output, not game sources.
const IGNORED = /^(apps\/minecraft\/dist|apps\/roblox\/dist|swarm\/|reports\/|docs\/|tests\/)/;
const NAMESPACED = /\b(minecraft|miraverse):([^\s"'`,:;)\]}]+)/g;

describe('identifiers', () => {
  it('uses only lowercase ASCII for every namespaced ID in game sources', () => {
    const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', 'apps/minecraft', 'packages/content/minecraft-global', 'tools/minecraft'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    })
      .split('\n')
      .filter((f) => /\.(json|ts|mjs)$/.test(f) && !IGNORED.test(f) && fs.existsSync(f));
    const problems: string[] = [];
    for (const file of files) {
      const text = fs.readFileSync(file, 'utf8');
      for (const match of text.matchAll(NAMESPACED)) {
        // Template strings build IDs at runtime; their fixed parts are checked elsewhere.
        if (match[2].includes('$') || match[2].includes('<')) continue;
        if (!/^[a-z0-9_./-]+$/.test(match[2])) problems.push(`${file}: ${match[0]}`);
      }
    }
    expect([...new Set(problems)]).toEqual([]);
  });

  it('keeps block file names and identifiers valid and matching', () => {
    for (const file of blockFiles) {
      const id = file.replace(/\.json$/, '');
      expect(id).toMatch(VALID_ID);
      const identifier = readJson(path.join(MC, 'bp/blocks', file))['minecraft:block'].description.identifier;
      expect(identifier).toBe(`miraverse:${id}`);
    }
  });

  it('keeps entity IDs valid in both packs', () => {
    for (const file of fs.readdirSync(path.join(MC, 'bp/entities'))) {
      const identifier = readJson(path.join(MC, 'bp/entities', file))['minecraft:entity'].description.identifier;
      expect(identifier).toMatch(/^miraverse:[a-z0-9_]+$/);
    }
    for (const file of fs.readdirSync(path.join(MC, 'rp/entity'))) {
      const identifier = readJson(path.join(MC, 'rp/entity', file))['minecraft:client_entity'].description.identifier;
      expect(identifier).toMatch(/^miraverse:[a-z0-9_]+$/);
    }
  });

  it('keeps the readable Morocco name while the ID is plain ASCII', () => {
    const { strings } = readJson('packages/content/locales/en-US/messages.json');
    expect(strings['item.ma_marrakesh_terracotta_pise']).toBeTruthy();
    expect(Object.keys(strings).filter((k) => !/^[\x20-\x7e]+$/.test(k))).toEqual([]);
  });
});

describe('custom block textures', () => {
  const terrain = readJson(path.join(MC, 'rp/textures/terrain_texture.json'));
  const blocksJson = readJson(path.join(MC, 'rp/blocks.json'));

  it('registers the terrain atlas', () => {
    expect(terrain.texture_name).toBe('atlas.terrain');
    expect(terrain.resource_pack_name).toBe('miraverse');
  });

  for (const file of blockFiles) {
    const id = file.replace(/\.json$/, '');
    it(`${id} resolves from block to image`, () => {
      const block = readJson(path.join(MC, 'bp/blocks', file))['minecraft:block'];
      const material = block.components['minecraft:material_instances']['*'];
      expect(material.texture).toBe(id);
      expect(['opaque', 'alpha_test']).toContain(material.render_method);
      const entry = terrain.texture_data[id];
      expect(entry, 'terrain_texture entry').toBeTruthy();
      const image = fs.readFileSync(path.join(MC, 'rp', `${entry.textures}.png`));
      expect(image.subarray(1, 4).toString()).toBe('PNG');
      expect(blocksJson[`miraverse:${id}`]).toBeTruthy();
    });
  }

  it('gives blocks different textures, not one copied image', () => {
    const hashes = new Set(blockFiles.map((f) => fs.readFileSync(path.join(MC, 'rp/textures/blocks', f.replace('.json', '.png'))).toString('base64')));
    expect(hashes.size).toBe(blockFiles.length);
  });
});
