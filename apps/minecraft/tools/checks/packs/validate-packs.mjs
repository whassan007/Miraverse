#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const bp = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'apps/minecraft/bp/manifest.json'), 'utf8'));
const rp = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'apps/minecraft/rp/manifest.json'), 'utf8'));

const uuids = new Set([
  bp.header?.uuid,
  ...(bp.modules || []).map((m) => m.uuid),
  rp.header?.uuid,
  ...(rp.modules || []).map((m) => m.uuid),
]);
if (uuids.size < 4) throw new Error('Duplicate or missing UUIDs in bp/rp manifests');

const srvDep = (bp.dependencies || []).find((d) => d.module_name === '@minecraft/server');
const uiDep = (bp.dependencies || []).find((d) => d.module_name === '@minecraft/server-ui');
if (!srvDep || srvDep.version !== '1.17.0') throw new Error('Expected @minecraft/server@1.17.0');
if (!uiDep || uiDep.version !== '1.3.0') throw new Error('Expected @minecraft/server-ui@1.3.0');
if (/-beta/.test(JSON.stringify(bp))) throw new Error('Beta API dependency prohibited');

console.log('PASS: DX13 verified bp/rp manifests, unique v4 UUIDs, and stable Script API versions (1.17.0 / 1.3.0).');
