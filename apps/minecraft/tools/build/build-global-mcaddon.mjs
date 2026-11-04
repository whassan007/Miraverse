#!/usr/bin/env node
/**
 * MiraVerse Global v1.1 — Bedrock BP + RP Builder (`apps/minecraft/tools/build/build-global-mcaddon.mjs`)
 * Stages `bp/` and `rp/`, injects all 88 custom block definitions, 89 global artifacts/keepsakes/stamps
 * with 16x16 PNG icons, 55 NPC entities, and the 9 native Bedrock `.lang` files + `rp/texts/languages.json`
 * inside the staging directory (without mutating `apps/minecraft/rp/texts/` on disk so Gate G2 remains 100% deterministic),
 * bundles `bp/scripts/main.js`, and packages `apps/minecraft/dist/miraverse-global.mcaddon`.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { COUNTRIES_GLOBAL, GLOBAL_LOCALES, createPatternedPng } from '../../../../swarm/minecraft-global/catalog-data.mjs';

const ROOT = process.cwd();
const MC_DIR = path.join(ROOT, 'apps/minecraft');

const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  CRC32_TABLE[i] = c >>> 0;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function buildDeterministicZipSync(stagingDir, relativeFiles, outputArchivePath) {
  const dosTime = 0x0000;
  const dosDate = ((2000 - 1980) << 9) | (1 << 5) | 1;
  const externalAttr = (0o100644 << 16) >>> 0;
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const relPath of [...relativeFiles].sort()) {
    const nameBuf = Buffer.from(relPath, 'utf8');
    const dataBuf = fs.readFileSync(path.join(stagingDir, relPath));
    const checksum = crc32(dataBuf);
    const size = dataBuf.length;

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(10, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(size, 18);
    localHeader.writeUInt32LE(size, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localChunks.push(localHeader, nameBuf, dataBuf);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(0x0314, 4);
    centralHeader.writeUInt16LE(10, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(size, 20);
    centralHeader.writeUInt32LE(size, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(externalAttr, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralChunks.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + dataBuf.length;
  }

  const centralDirSize = centralChunks.reduce((sum, b) => sum + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(relativeFiles.length, 8);
  eocd.writeUInt16LE(relativeFiles.length, 10);
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  fs.mkdirSync(path.dirname(outputArchivePath), { recursive: true });
  fs.writeFileSync(outputArchivePath, Buffer.concat([...localChunks, ...centralChunks, eocd]));
}

export function buildGlobalMcaddon() {
  // Ensure generated packs and scripts/main.ts compile and bundle cleanly
  execSync('npm run compile && npm -w apps/minecraft run build', { cwd: ROOT, stdio: 'pipe' });

  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'mv-global-mcaddon-'));
  try {
    fs.cpSync(path.join(MC_DIR, 'bp'), path.join(staging, 'bp'), { recursive: true });
    fs.cpSync(path.join(MC_DIR, 'rp'), path.join(staging, 'rp'), { recursive: true });

    // Copy v1.7.0 21-destination GIS terrain mcfunction into staged BP functions/miraverse_terrain.mcfunction
    const mcfuncSrc = path.join(MC_DIR, 'world/terrain/server-commands.mcfunction');
    if (fs.existsSync(mcfuncSrc)) {
      const fnDir = path.join(staging, 'bp/functions');
      fs.mkdirSync(fnDir, { recursive: true });
      fs.copyFileSync(mcfuncSrc, path.join(fnDir, 'miraverse_terrain.mcfunction'));
    }

    // Add 89 Global v1.1 artifact/keepsake/stamp items and 16x16 textures into staged BP & RP
    const itemTexPath = path.join(staging, 'rp/textures/item_texture.json');
    const itemTexJson = JSON.parse(fs.readFileSync(itemTexPath, 'utf-8'));

    const registerStagedItem = (id, pngBuf) => {
      const itemJson = {
        format_version: '1.20.50',
        'minecraft:item': {
          description: { identifier: `miraverse:${id}`, menu_category: { category: 'items' } },
          components: {
            'minecraft:icon': { texture: id },
            'minecraft:display_name': { value: `item.miraverse:${id}.name` },
          },
        },
      };
      fs.writeFileSync(path.join(staging, 'bp/items', `v11_${id}.json`), JSON.stringify(itemJson, null, 2) + '\n');
      const relTex = `textures/items/${id}`;
      const absPng = path.join(staging, 'rp', `${relTex}.png`);
      fs.mkdirSync(path.dirname(absPng), { recursive: true });
      fs.writeFileSync(absPng, pngBuf);
      itemTexJson.texture_data[id] = { textures: relTex };
    };

    for (const c of COUNTRIES_GLOBAL) {
      for (let i = 0; i < c.chapters.length; i++) {
        const ch = c.chapters[i];
        registerStagedItem(ch.artifactId, createPatternedPng(16, 16, c.accentRgb, c.paletteRgb, c.order * 20 + i));
      }
      registerStagedItem(c.capstoneArtifactId, createPatternedPng(16, 16, [242, 198, 65], c.accentRgb, c.order * 50));
      registerStagedItem(c.passportStampId, createPatternedPng(16, 16, c.paletteRgb, [225, 180, 55], c.order * 70));
    }
    registerStagedItem('stamp_global_storykeeper', createPatternedPng(16, 16, [245, 205, 70], [40, 80, 180], 999));

    fs.writeFileSync(itemTexPath, JSON.stringify(itemTexJson, null, 2) + '\n');

    // Generate 9 native Bedrock .lang files + rp/texts/languages.json in staging
    const nativeLocales = GLOBAL_LOCALES.filter((l) => l.isNativeBedrock);
    const languagesJson = nativeLocales.map((l) => l.nativePackLang);
    fs.writeFileSync(path.join(staging, 'rp/texts/languages.json'), JSON.stringify(languagesJson, null, 2) + '\n');

    const baseEnLang = fs.readFileSync(path.join(staging, 'rp/texts/en_US.lang'), 'utf-8').trim();
    for (const loc of nativeLocales) {
      const catPath = path.join(ROOT, 'packages/content/locales', loc.id, 'messages.json');
      const cat = JSON.parse(fs.readFileSync(catPath, 'utf-8'));
      const extraLines = Object.entries(cat.strings).map(
        ([k, v]) => `miraverse.${k}=${String(v).replace(/[\r\n\t]+/g, ' ')}`
      );
      const mergedLang = [baseEnLang, ...extraLines].join('\n') + '\n';
      fs.writeFileSync(path.join(staging, 'rp/texts', `${loc.nativePackLang}.lang`), mergedLang);
    }

    // Collect all files in staging
    const walkRel = (dir, prefix = '') => {
      const res = [];
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) res.push(...walkRel(full, rel));
        else if (entry.isFile()) res.push(rel);
      }
      return res;
    };

    const allFiles = [...walkRel(path.join(staging, 'bp'), 'bp'), ...walkRel(path.join(staging, 'rp'), 'rp')].sort();
    const outPath = path.join(MC_DIR, 'dist/miraverse-global.mcaddon');
    buildDeterministicZipSync(staging, allFiles, outPath);
    return { ok: true, outPath, fileCount: allFiles.length, nativeLanguages: languagesJson };
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = buildGlobalMcaddon();
  console.log('GLOBAL_MCADDON_BUILT', JSON.stringify(res));
}
