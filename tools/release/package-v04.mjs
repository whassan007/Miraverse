#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const summary = {
  version: '0.4.0',
  packagedAt: new Date().toISOString(),
  artifacts: {
    webDist: fs.existsSync(path.resolve('apps/web/dist')),
    robloxPlace: fs.existsSync(path.resolve('apps/roblox/dist/miraverse.rbxlx')),
    minecraftAddon: fs.existsSync(path.resolve('apps/minecraft/dist/miraverse.mcaddon')),
  },
};
console.log(JSON.stringify(summary, null, 2));
