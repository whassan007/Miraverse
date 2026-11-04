# MiraVerse v1.0 Minecraft Bedrock — Child Safety, Privacy & Commerce Boundary Audit
**Owner:** `CL05` (Wave W5 · Independent Safety Auditor)

## 1. Zero Prohibited Mechanics or External Commerce
- **No External Network or Telemetry:** The Behavior Pack requests ONLY `@minecraft/server@1.17.0` and `@minecraft/server-ui@1.3.0`. It does **not** import `@minecraft/server-net` or `@minecraft/server-admin`.
- **World-Local Earned Rewards Only:** Passport stamps (`MV-<CC>-1-<HASH>`) and Mira Tokens are 100% world-local via `DynamicProperties`. Zero Minecoins, Robux, Stripe links, loot boxes, or external URLs exist in any dialogue or UI form.
- **Safe Culinary Representation:** All 5 regional cooking stations enforce an explicit Elder Mentor supervision notice (*"Elder NPC handles stove/oven heat safely"*).
- **Protected Heritage Districts & Co-Op Safety:** Players can only place/break blocks within their claimed private plot (`radius = 8`, `quota = 64 blocks`) or when explicitly granted collaborator access by the host player.
