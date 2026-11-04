import fs from 'node:fs';
const luau = fs.readFileSync('apps/roblox/src/shared/GulfV16.luau','utf8');
if(!luau.includes('quest.qa.01') || !luau.includes('quest.bh.05')) process.exit(1);
console.log('ROBLOX_GULF_QA_OK');
