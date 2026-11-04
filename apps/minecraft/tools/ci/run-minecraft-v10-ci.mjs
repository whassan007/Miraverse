#!/usr/bin/env node
import { execSync } from 'node:child_process';
execSync('npx vitest run apps/minecraft/tests/domain/ apps/minecraft/tests/multiplayer/', { stdio: 'inherit' });
execSync('node apps/minecraft/tools/performance/measure-bedrock-perf.mjs', { stdio: 'inherit' });
