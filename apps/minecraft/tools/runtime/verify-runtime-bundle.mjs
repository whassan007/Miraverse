#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const bootstrap = path.join(process.cwd(), 'apps/minecraft/scripts/src/bootstrap/index.ts');
if (!fs.existsSync(bootstrap)) throw new Error('Missing bootstrap/index.ts');
console.log('PASS: CX05 verified runtime bootstrap entrypoint.');
