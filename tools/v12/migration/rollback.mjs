#!/usr/bin/env node
/**
 * Rollback utility for MiraVerse v1.2 additive knowledge migrations.
 */
import fs from 'node:fs';
import path from 'node:path';

console.log('MiraVerse v1.2 Rollback: All v1.2 knowledge records live in additive namespaces (content/v12/, packages/knowledge-v12/, apps/web/src/features/encyclopedia-v12/, apps/roblox/src/shared/KnowledgeV12.luau, apps/minecraft/scripts/generated/knowledgeV12.ts).');
console.log('To roll back to pre-v1.2 baseline without losing v0.8/v1.1 progress: git revert or checkout base_sha recorded in swarm/v12/manifest.json.');
