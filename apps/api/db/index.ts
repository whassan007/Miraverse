/**
 * Relational Store & Migration Loader (`apps/api/db/index.ts`)
 * Owner: CX01 (Stage V4-06)
 */
import fs from 'node:fs';
import path from 'node:path';

export function loadCommerceSchemaSql(rootDir = process.cwd()): string {
  return fs.readFileSync(path.join(rootDir, 'apps/api/db/schema.sql'), 'utf-8');
}
