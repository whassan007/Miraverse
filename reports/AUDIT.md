# MiraVerse v0.4 — Existing Repository Audit (`reports/AUDIT.md`)

**Generated:** 2026-11-04T01:44:00Z  
**Baseline Commit (`main`):** `2e32eb03b19241aed2c8585c3869fad88825efda`  
**Target Integration Branch:** `integration/miraverse-v0.4`

---

## 1. Baseline Snapshot & Visual Evidence

Before any v0.4 modifications, the v0.1 baseline was built, tested (`97/97` tests passing), and captured via Playwright Headless Chromium at `1440×900`:
- **Old Homepage (`/#/`):** [v01-home.png](file:///home/wael/Code/Miraverse/reports/screens/baseline-v0.1/v01-home.png) — Static 2D card grid with 5 country cards and header links.
- **Old France Play Page (`/#/play/FR`):** [v01-play-FR.png](file:///home/wael/Code/Miraverse/reports/screens/baseline-v0.1/v01-play-FR.png) — HTML page with 5 country buttons surrounding a rectangular 2D Phaser grid mini-game (`The Vieux Lyon Bakery Facade`, `0 / 28` grid squares) and an HTML fallback button below.
- **Old France Story Reader (`/#/story/fr`):** [v01-story-fr.png](file:///home/wael/Code/Miraverse/reports/screens/baseline-v0.1/v01-story-fr.png) — 15-scene bilingual story reader with vocabulary callouts and cultural notes.
- **Old Passport Page (`/#/passport`):** [v01-passport.png](file:///home/wael/Code/Miraverse/reports/screens/baseline-v0.1/v01-passport.png) — Local `mv.stamps` stamp viewer and redemption form.

---

## 2. File-by-File Classification (`REUSE` / `ADAPT` / `RETIRE`)

### 2.1 Shared Content & Contracts (`packages/`)

| Path | Classification | Rationale & v0.4 Migration Action |
|---|---|---|
| [packages/content/schema.ts](file:///home/wael/Code/Miraverse/packages/content/schema.ts) | `REUSE` + `ADAPT` | Authoritative v0.1 content schema (`COUNTRIES`, `STORY_LANGS`, `UI_LANGS`, `CHALLENGE_KINDS`). Preserved intact for backward compatibility while `packages/contracts/` (`CX01`) extends schemas to v3/v4 (`country:chapter:quest:objective` semantic IDs, 3D level manifests, asset metadata, and `packages/contracts/commerce/`). |
| [packages/content/stories/fr.json](file:///home/wael/Code/Miraverse/packages/content/stories/fr.json), [ar-LB.json](file:///home/wael/Code/Miraverse/packages/content/stories/ar-LB.json), [ar-EG.json](file:///home/wael/Code/Miraverse/packages/content/stories/ar-EG.json), [ar-IQ.json](file:///home/wael/Code/Miraverse/packages/content/stories/ar-IQ.json), [ko.json](file:///home/wael/Code/Miraverse/packages/content/stories/ko.json) | `REUSE` | Authoritative 15-scene bilingual stories (`La fève de Mira`, `ميرا والمركب والمنقوشة`, `ليلى والفانوس والكشري`, `قالب بيبي أمل`, `지우의 찌그러진 반달`). Retained 100% intact and linked from the 3D Storybook/Passport and `/story/:lang`. |
| [packages/content/packs/FR.json](file:///home/wael/Code/Miraverse/packages/content/packs/FR.json), [LB.json](file:///home/wael/Code/Miraverse/packages/content/packs/LB.json), [EG.json](file:///home/wael/Code/Miraverse/packages/content/packs/EG.json), [IQ.json](file:///home/wael/Code/Miraverse/packages/content/packs/IQ.json), [KR.json](file:///home/wael/Code/Miraverse/packages/content/packs/KR.json) | `REUSE` + `ADAPT` | Authoritative 5 country packs with 5 challenges each (`build`, `cook`, `gather`, `trade`, `word`), mentors (`Mamie Claire`, `Teta Nahla`, `Teta Samira`, `Bibi Amal`, `Halmeoni`), items, and recipes. Adapted via `packages/content/migrations/` (`CX01`) and `content/quests/` (`CL01`) into full 3D quest graphs. |
| [packages/content/vocab/fr.json](file:///home/wael/Code/Miraverse/packages/content/vocab/fr.json), [ar-LB.json](file:///home/wael/Code/Miraverse/packages/content/vocab/ar-LB.json), [ar-EG.json](file:///home/wael/Code/Miraverse/packages/content/vocab/ar-EG.json), [ar-IQ.json](file:///home/wael/Code/Miraverse/packages/content/vocab/ar-IQ.json), [ko.json](file:///home/wael/Code/Miraverse/packages/content/vocab/ko.json) | `REUSE` + `ADAPT` | Authoritative 30-entry vocabulary files per locale. Enriched in `content/vocab/enriched/` (`DX02`) with synonyms and diegetic 3D object bindings. |
| [packages/shared/stamp.ts](file:///home/wael/Code/Miraverse/packages/shared/stamp.ts), [stamp.md](file:///home/wael/Code/Miraverse/packages/shared/stamp.md) | `REUSE` + `ADAPT` | `MV1-<COUNTRY>-<CHALLENGES>-<CHECKSUM>` deterministic stamp codec. Retained as a fun, non-secure offline collectible across Web, Roblox, and Minecraft (never treated as a cryptographic payment or paid entitlement credential) and migrated into `mv.save.v4` by `packages/game-domain/` (`CX04`). |

### 2.2 Web Application (`apps/web/`)

| Path | Classification | Rationale & v0.4 Migration Action |
|---|---|---|
| [apps/web/src/App.tsx](file:///home/wael/Code/Miraverse/apps/web/src/App.tsx) | `ADAPT` | Upgraded to support clean path routing (`/`, `/play`, `/play/:country`, `/story/:lang`, `/passport`, `/about`, plus adult-only `/parents`, `/parents/sign-in`, `/parents/dashboard`, `/parents/shop`, `/parents/gifts`, `/parents/gifts/redeem`, `/parents/orders`, `/parents/settings`, `/privacy`, `/terms`, `/refunds`, `/support`) as well as legacy `/#/...` hash redirects so existing bookmarks and tests continue working. |
| [apps/web/src/pages/Home.tsx](file:///home/wael/Code/Miraverse/apps/web/src/pages/Home.tsx) | `RETIRE` (Replaced by `apps/web/src/landing/`) | Replaced as primary `/` view by the v0.4 Cinematic Homepage (`apps/web/src/landing/scene/` + `apps/web/src/landing/ui/`, `V4-01`–`V4-03`) featuring a real-time 3D Babylon.js diorama/panorama + static poster fallback, 5 destination vignettes, **Play Free** primary CTA, **Explore Worlds**, and distinct **For Parents** pathway. |
| [apps/web/src/pages/Play.tsx](file:///home/wael/Code/Miraverse/apps/web/src/pages/Play.tsx) & [apps/web/src/game/](file:///home/wael/Code/Miraverse/apps/web/src/game/) | `RETIRE` as primary renderer / `ADAPT` | Phaser 2D rectangular grid mini-game is **retired as the primary world renderer** (satisfying the Hard Failure Test). `/play` and `/play/:country` now mount the full-viewport Babylon.js 3D Adventure (`apps/web/src/game3d/`) with third-person controller, 3D World Hub portals, 5 traversable stylized towns, animated NPCs, edge HUD (`apps/web/src/ui/hud/`), and 3D challenges (`apps/web/src/game3d/challenges/`). |
| [apps/web/src/pages/Story.tsx](file:///home/wael/Code/Miraverse/apps/web/src/pages/Story.tsx) | `REUSE` + `ADAPT` | Retained at `/story/:lang` and integrated with `apps/web/src/ui/dialogue/` (`AG19`) and Passport storybook access. |
| [apps/web/src/pages/Passport.tsx](file:///home/wael/Code/Miraverse/apps/web/src/pages/Passport.tsx) & [apps/web/src/lib/storage.ts](file:///home/wael/Code/Miraverse/apps/web/src/lib/storage.ts) | `ADAPT` | Upgraded to integrate with `packages/game-domain/` (`mv.save.v4`) while automatically migrating existing `mv.stamps` / v1 / v2 / v3 localStorage data without data loss. Displays earned stamps, chapter keepsakes, and local guest Mira Tokens clearly labeled `"Saved on this device"`. |
| [apps/web/src/pages/About.tsx](file:///home/wael/Code/Miraverse/apps/web/src/pages/About.tsx) | `ADAPT` | Retained at `/about` for educators/overview while `/parents` (`apps/web/src/parent/` and `apps/web/src/storefront/`) provides the dedicated adult-only portal, storefront, gift redemption, and dashboard. |
| [apps/web/src/i18n/](file:///home/wael/Code/Miraverse/apps/web/src/i18n/) | `REUSE` + `ADAPT` | Retained 6-locale i18n provider (`en`, `fr`, `ar-LB`, `ar-EG`, `ar-IQ`, `ko`) with RTL direction switching; extended with new UI keys from `content/locales/drafts/` (`DX01`). |
| [functions/api/checkout.ts](file:///home/wael/Code/Miraverse/functions/api/checkout.ts), [webhook.ts](file:///home/wael/Code/Miraverse/functions/api/webhook.ts), [verify-session.ts](file:///home/wael/Code/Miraverse/functions/api/verify-session.ts) | `ADAPT` | Initial Cloudflare Pages Stripe wiring adapted and superseded by the full modular v0.4 commerce backend in `apps/api/` (`V4-06`–`V4-09`) with Cloudflare Pages proxy compatibility. |

### 2.3 Native Platforms (`apps/roblox/` and `apps/minecraft/`)

| Path | Classification | Rationale & v0.4 Migration Action |
|---|---|---|
| [apps/roblox/default.project.json](file:///home/wael/Code/Miraverse/apps/roblox/default.project.json) & [apps/roblox/src/](file:///home/wael/Code/Miraverse/apps/roblox/src/) | `ADAPT` | Existing Rojo project and Luau scripts upgraded by `CL03`–`CL06` to match the v0.4 architecture (`ReplicatedStorage/MiraVerseShared`, `ServerScriptService/MiraVerse`, `StarterPlayerScripts/MiraVerseClient`, `Workspace/MiraVerseWorld`), adding structured 3D town models, `ProximityPrompt` NPCs, `Animator` clips, server-authoritative challenge validation, replay protection, and disabled-by-default `MarketplaceService` module (zero external payment links). |
| [apps/minecraft/bp/](file:///home/wael/Code/Miraverse/apps/minecraft/bp/), [apps/minecraft/rp/](file:///home/wael/Code/Miraverse/apps/minecraft/rp/), [apps/minecraft/scripts/](file:///home/wael/Code/Miraverse/apps/minecraft/scripts/) | `ADAPT` | Existing Bedrock add-on upgraded by `CL07`–`CL09` with authored `.mcstructure` voxel templates (`apps/minecraft/structures/`), world layout metadata (`apps/minecraft/world/`), custom blocks/items/entities/recipes/animation controllers, and server-side Script API quest/portal/persistence logic, outputting both `dist/miraverse.mcaddon` and `dist/miraverse-adventure.mcworld`. |

### 2.4 Compilers, Validators & Tests (`tools/`, `tests/`)

| Path | Classification | Rationale & v0.4 Migration Action |
|---|---|---|
| [tools/compiler/](file:///home/wael/Code/Miraverse/tools/compiler/) | `ADAPT` | Extended by `CX10` to emit deterministic v0.4 datasets with `sourceContentHash`, `compilerVersion`, and `schemaVersion` for Web (`apps/web/src/generated/`), Roblox (`apps/roblox/src/shared/generated/`), and Minecraft (`apps/minecraft/scripts/generated/`). |
| [tools/validate.ts](file:///home/wael/Code/Miraverse/tools/validate.ts) | `REUSE` + `ADAPT` | Existing structural and release validators preserved; extended with v0.4 asset, contract, and commerce checks. |
| [tests/](file:///home/wael/Code/Miraverse/tests/) | `REUSE` + `ADAPT` | All existing 97 tests retained and updated where routes/DOM selectors evolved, plus new suites in `tests/contracts/`, `tests/roblox/`, `tests/cross-platform/`, `tests/e2e/web/`, and `tests/e2e/commerce/` (`C01`–`C20`). |
