import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const minecraft = path.join(root, 'apps/minecraft');
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const epoch = new Date('2000-01-01T00:00:00.000Z');

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
    // Fixed timestamps, permissions, ordering, and no extra fields make bytes reproducible.
    execFileSync('zip', ['-X', '-0', '-q', archive, '-@'], {
      cwd: staging,
      input: `${files.join('\n')}\n`,
      env: { ...process.env, TZ: 'UTC' },
    });
    const listing = execFileSync('unzip', ['-l', archive], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    for (const pack of ['bp', 'rp']) {
      if (!new RegExp(`^\\s*\\d+\\s+\\S+\\s+\\S+\\s+${pack}/manifest\\.json\\s*$`, 'm').test(listing)) {
        throw new Error(`Archive is missing ${pack}/manifest.json`);
      }
    }
    execFileSync('unzip', ['-tq', archive], { stdio: 'pipe' });
    for (const directory of [path.join(minecraft, 'dist'), path.join(root, 'dist')]) {
      await fs.mkdir(directory, { recursive: true });
      await fs.copyFile(archive, path.join(directory, 'miraverse.mcaddon'));
    }
    console.log(listing.trim());
    console.log('Packaged apps/minecraft/dist/miraverse.mcaddon and dist/miraverse.mcaddon');
  } finally {
    await fs.rm(staging, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(`Minecraft packaging failed: ${error.message}`);
  process.exitCode = 1;
});
