# Cross-Platform Content Parity & Native Ownership Matrix (`reports/v06/PLATFORM_PARITY.md`)

| Dimension | Roblox Flagship (`apps/roblox`) | Minecraft Bedrock Companion (`apps/minecraft`) | Public Website (`apps/web` + `apps/api`) |
|---|---|---|---|
| **Shared Content Source** | `packages/content/packs/{LB,EG,IQ,KR,FR}.json` | `packages/content/packs/{LB,EG,IQ,KR,FR}.json` | `packages/content/packs/{LB,EG,IQ,KR,FR}.json` |
| **Five Challenge Taxonomy** | `gather`, `trade`, `cook`, `build`, `word` | `gather`, `trade`, `cook`, `build`, `word` | Preview & Story Companion |
| **State Ownership** | Native `DataStoreService` (`mv.roblox.save.v6`) | Native World Dynamic Properties (`mv:v06:*`) | Server SQLite/Postgres for Adult Orders only |
| **Mira Token Economy** | Earned-only Roblox Mira Tokens (Cosmetics/Plot) | Earned-only Bedrock Mira Tokens (World keepsakes) | Deferred / None (No cross-platform balance sync) |
