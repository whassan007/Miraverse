import fs from 'node:fs';
const ts = fs.readFileSync('apps/minecraft/scripts/gulf-v16/index.ts','utf8');
if(!ts.includes('quest.qa.01') || !ts.includes('quest.bh.05')) process.exit(1);
console.log('BEDROCK_GULF_QA_OK');
