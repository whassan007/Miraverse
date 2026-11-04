import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const minecraft = path.join(root, 'apps/minecraft');
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const epoch = new Date('2000-01-01T00:00:00.000Z');

// Precomputed IEEE 802.3 CRC-32 lookup table for deterministic pure-Node ZIP packaging.
const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC32_TABLE[i] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Builds a reproducible, uncompressed (STORE, method 0) ZIP archive in pure Node.js
 * so packaging succeeds in minimal CI/CD containers (e.g. Cloudflare Pages) where
 * external `zip`/`unzip` binaries are not installed.
 */
async function buildDeterministicZip(stagingDir, relativeFiles, outputArchivePath) {
  const dosTime = 0x0000; // 00:00:00
  const dosDate = ((2000 - 1980) << 9) | (1 << 5) | 1; // 2000-01-01
  const externalAttr = (0o100644 << 16) >>> 0;

  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const relPath of relativeFiles) {
    const nameBuf = Buffer.from(relPath, 'utf8');
    const dataBuf = await fs.readFile(path.join(stagingDir, relPath));
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

  await fs.writeFile(outputArchivePath, Buffer.concat([...localChunks, ...centralChunks, eocd]));
}

async function readManifest(pack) {
  const filename = path.join(minecraft, pack, 'manifest.json');
  let manifest;
  try {
    manifest = JSON.parse(await fs.readFile(filename, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read valid JSON from ${pack}/manifest.json: ${error.message}`);
  }
  if (!uuidPattern.test(manifest?.header?.uuid ?? '')) {
    throw new Error(`${pack}/manifest.json must have a valid header UUID`);
  }
  const version = manifest.header.version;
  if (!Array.isArray(version) || version.length !== 3 ||
      !version.every(value => Number.isSafeInteger(value) && value >= 0)) {
    throw new Error(`${pack}/manifest.json must have a three-integer header version`);
  }
  if (manifest.dependencies !== undefined && !Array.isArray(manifest.dependencies)) {
    throw new Error(`${pack}/manifest.json dependencies must be an array`);
  }
  return manifest;
}

function checkDependencies(pack, manifest, other) {
  let matches = 0;
  for (const dependency of manifest.dependencies ?? []) {
    if (!dependency || typeof dependency !== 'object') {
      throw new Error(`${pack} contains an invalid dependency`);
    }
    // Minecraft built-in script modules use module_name instead of a pack UUID.
    if (dependency.uuid === undefined && typeof dependency.module_name === 'string' && dependency.module_name) continue;
    if (typeof dependency.uuid !== 'string' || dependency.uuid.toLowerCase() !== other.header.uuid.toLowerCase()) {
      throw new Error(`${pack} dependency UUID does not match the other pack header`);
    }
    if (JSON.stringify(dependency.version) !== JSON.stringify(other.header.version)) {
      throw new Error(`${pack} dependency version does not match the other pack header`);
    }
    matches += 1;
  }
  if (matches > 1 || (pack === 'bp' && matches !== 1)) {
    throw new Error(`${pack} must reference the resource pack exactly once, without duplicate pack dependencies`);
  }
}

async function stageDirectory(relative, staging, files) {
  const source = path.join(minecraft, relative);
  const stat = await fs.lstat(source);
  if (!stat.isDirectory()) throw new Error(`Expected a pack directory: ${relative}`);
  await fs.mkdir(path.join(staging, relative), { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });
  entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  for (const entry of entries) {
    const child = `${relative}/${entry.name}`;
    if (/[\r\n\\]/.test(entry.name)) throw new Error(`Unsupported archive path: ${JSON.stringify(child)}`);
    if (entry.isDirectory()) {
      await stageDirectory(child, staging, files);
    } else if (entry.isFile()) {
      const destination = path.join(staging, child);
      await fs.copyFile(path.join(minecraft, child), destination);
      await fs.chmod(destination, 0o644);
      await fs.utimes(destination, epoch, epoch);
      files.push(child);
    } else {
      throw new Error(`Pack contains a symlink or unsupported file: ${child}`);
    }
  }
}

async function main() {
  const [bp, rp] = await Promise.all([readManifest('bp'), readManifest('rp')]);
  if (bp.header.uuid.toLowerCase() === rp.header.uuid.toLowerCase()) {
    throw new Error('Behavior and resource packs must have distinct UUIDs');
  }
  checkDependencies('bp', bp, rp);
  checkDependencies('rp', rp, bp);
  const staging = await fs.mkdtemp(path.join(os.tmpdir(), 'miraverse-pack-'));
  try {
    const files = [];
    await stageDirectory('bp', staging, files);
    await stageDirectory('rp', staging, files);
    files.sort();
    const archive = path.join(staging, 'miraverse.mcaddon');

    for (const pack of ['bp', 'rp']) {
      if (!files.includes(`${pack}/manifest.json`)) {
        throw new Error(`Archive is missing ${pack}/manifest.json`);
      }
    }

    await buildDeterministicZip(staging, files, archive);

    try {
      execFileSync('unzip', ['-tq', archive], { stdio: 'pipe' });
    } catch (err) {
      if (err?.code !== 'ENOENT') {
        throw err;
      }
    }

    for (const directory of [path.join(minecraft, 'dist'), path.join(root, 'dist')]) {
      await fs.mkdir(directory, { recursive: true });
      await fs.copyFile(archive, path.join(directory, 'miraverse.mcaddon'));
    }
    console.log(`Archived ${files.length} files into miraverse.mcaddon`);
    console.log('Packaged apps/minecraft/dist/miraverse.mcaddon and dist/miraverse.mcaddon');
  } finally {
    await fs.rm(staging, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(`Minecraft packaging failed: ${error.message}`);
  process.exitCode = 1;
});
