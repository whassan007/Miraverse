# MiraVerse v1.3 — Wave 0 Production Route & Root-Cause Audit

**Owners:** `AG01`, `AG02`, `AG10`, `CX01`, `CL01`  
**Target Domain:** `https://miraverse.pages.dev/`

## 1. Root-Cause Findings from Wave 0 Audit

1. **Public `/play` and `/play/:country` Routes (`apps/web/src/pages/Play.tsx`):**
   - Prior to v1.3, `/play` and `/play/:country` mounted the v0.4 Babylon.js 3D browser prototype (`buildSculptedWorldScene`), rendering primitive geometric boxes, cylinder-shaped NPCs, an on-screen virtual joystick (`MobileTouchControls`), an `ACT` button, overlapping SVG world labels, duplicate country navigation bars, and internal build diagnostic text (`Build: apps/roblox/dist/miraverse.rbxlx (Verified) · Public Place ID: Pending Creator Publish Approval`).
   - **Resolution (`CX01`, `P0`, `P7`):** Preserved the legacy 3D browser prototype in `apps/web/src/pages/LegacyBrowser3DGame.tsx` mounted only at `/dev/legacy-3d-game` (`/#/dev/legacy-3d-game`). Replaced `apps/web/src/pages/Play.tsx` with the **Platform Launch & Interactive Cultural Quest Companion** featuring verified Roblox and Minecraft Bedrock launch cards, 5 illustrated bird's-eye quest maps (`/art/v13/quest-map-{CC}.jpg`), 4 age-adapted learning tracks (`5-7`, `8-10`, `11-13`, `14-17`), and web quest completion with Passport stamp issuance.

2. **Internal Publishing Diagnostics on Child-Facing Pages (`apps/web/src/launch/RobloxLaunchPage.tsx`):**
   - Prior to v1.3, `RobloxLaunchBanner` rendered internal build paths (`Build: apps/roblox/dist/miraverse.rbxlx...`) on public child-facing pages.
   - **Resolution (`P0`, `P7`):** Replaced internal build strings on `RobloxLaunchBanner` with child-friendly platform requirements and isolated internal build/place-ID diagnostics on `/admin/diagnostics` (`AdminDiagnosticsPage`).

3. **Cloudflare Pages Production Branch Mapping:**
   - The Cloudflare Pages project `miraverse` uses `build/miraverse-v0.1` as its `Production` branch serving `https://miraverse.pages.dev/`.
   - **Resolution (`CX05`):** Deployed the v1.3 bundle to both `--branch build/miraverse-v0.1` (`https://miraverse.pages.dev/`) and `--branch main` (`https://main.miraverse.pages.dev/`).

## 2. Production Route Matrix (v1.3)

| Route | Component | v1.3 Purpose |
| :--- | :--- | :--- |
| `/#/` | `CinematicLandingPage` (`apps/web/src/landing/ui/index.tsx`) | Cinematic homepage with painted Byblos Harbor hero, 5 worlds in exact v1.3 order (`LB, IQ, EG, FR, KR`), Atlas & Quest Encyclopedia previews, Cultural Artifacts Treasury, and Roblox/Minecraft launch CTAs |
| `/#/explore` | `ExploreAtlasPage` (`apps/web/src/marketing/worlds-v06/ExploreAtlasPages.tsx`) | World library in exact sequence: 1. Lebanon: Byblos, 2. Iraq: Baghdad, 3. Egypt: Cairo, 4. France: Lyon, 5. South Korea: Jeonju |
| `/#/explore/:country` | `ExploreCountryDetailPage` (`apps/web/src/marketing/worlds-v06/ExploreAtlasPages.tsx`) | 13-section Cultural Country Experience (`LB`, `IQ`, `EG`, `FR`, `KR`) |
| `/#/atlas` | `InteractiveWorldAtlasPage` (`apps/web/src/portal/v13/CulturalPortalPages.tsx`) | Dual cartographic system: (1) Real-World WGS84 Geographic Survey Atlas + (2) 25 Illustrated Adventure Quest Maps |
| `/#/quests` & `/#/quests/:questId` | `QuestEncyclopediaPage` (`apps/web/src/portal/v13/CulturalPortalPages.tsx`) | 25 cultural quests × 4 age tracks (`5-7`, `8-10`, `11-13`, `14-17`) = 100 age-adapted quest stages |
| `/#/passport` | `Passport` (`apps/web/src/pages/Passport.tsx`) | Collectible Explorer Passport with 5 country stamps, 10 cultural artifacts, historical discoveries, and age milestones |
| `/#/play` & `/#/play/:country` | `Play` (`apps/web/src/pages/Play.tsx`) | Verified Roblox & Minecraft Bedrock launcher + interactive Web Cultural Quest Companion (zero 3D primitive geometry) |
| `/#/dev/legacy-3d-game` | `LegacyBrowser3DGame` (`apps/web/src/pages/LegacyBrowser3DGame.tsx`) | Isolated archival route preserving the v0.4 browser 3D prototype |
| `/#/admin/diagnostics` | `AdminDiagnosticsPage` (`apps/web/src/launch/RobloxLaunchPage.tsx`) | Admin-only build and publishing diagnostics |
