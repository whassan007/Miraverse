# Native Platform QA, Security & Human Playtest Procedures (`reports/PLATFORM_QA.md`)

**Owner:** `CL10`

## 1. Automated Build & Security Verification
- **Web 3D (`apps/web`):** `PASS` — Babylon.js 3D world hub, 5 stylized towns, glTF 2.0 binary assets, `mv.save.v4` migration, and edge HUD.
- **Roblox (`apps/roblox`):** `PASS` (Build/Static) / `BLOCKED` (Live Studio GUI) — `rojo build` produces `apps/roblox/dist/miraverse.rbxlx`; remote validation rejects out-of-range and external commerce actions.
- **Minecraft Bedrock (`apps/minecraft`):** `PASS` (Build/Archive) / `BLOCKED` (Live Bedrock GUI) — `dist/miraverse.mcaddon` and authored `.mcstructure` templates verified; world LevelDB export documented as `BLOCKED` on Linux ARM64.
