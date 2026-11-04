import fs from 'node:fs';
const d = JSON.parse(fs.readFileSync('apps/web/src/generated/gulfV16.json','utf8'));
if(d.brand.arabic !== 'عالم يرا' || d.localizationRecords.length !== 120) process.exit(1);
console.log('LOCALIZATION_GULF_QA_OK');
