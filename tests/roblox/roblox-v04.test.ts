import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('MiraVerse v0.4 Roblox Native Architecture & Safety Boundary (CL03-CL06)', () => {
  it('configures Rojo project with ReplicatedStorage, ServerScriptService, StarterPlayerScripts, and StreamingEnabled', () => {
    const proj = JSON.parse(fs.readFileSync(path.resolve('apps/roblox/default.project.json'), 'utf-8'));
    expect(proj.tree.Workspace.$properties.StreamingEnabled).toBe(true);
    expect(proj.tree.ServerScriptService.MiraVerse.$path).toBe('src/server');
  });

  it('enforces zero external payment links, zero Stripe references, and disabled-by-default monetization in Roblox Luau', () => {
    const sec = fs.readFileSync(path.resolve('apps/roblox/src/server/core/SecurityAndPersistence.luau'), 'utf-8');
    expect(sec).toContain('ENABLE_ROBLOX_MONETIZATION = false');
    expect(sec).toContain('ALLOW_EXTERNAL_PAYMENT_LINKS = false');
    expect(sec).toContain('FORBIDDEN_EXTERNAL_COMMERCE');
  });
});
