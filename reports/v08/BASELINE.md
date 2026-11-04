# MiraVerse v0.8 Baseline Audit & Visual Defect Matrix (`CL01`, `CX01`)

- **Base Branch / Commit Audited:** `main` (`4812a2b`) vs. live `https://miraverse.pages.dev/`
- **Target Integration Branch:** `integration/miraverse-v0.8-visual-recovery` (`4812a2b`)
- **Before Screenshots Preserved:** [`reports/v08/screens/before/`](file:///home/wael/Code/Miraverse/reports/v08/screens/before) (18 captures)
- **After Screenshots Captured:** [`reports/v08/screens/after/`](file:///home/wael/Code/Miraverse/reports/v08/screens/after) (20 captures)

## 1. Supplied-Screenshot Defect Matrix & Resolution

| Defect ID | Route / Surface | Severity | Observed Defect (Before) | Source File & Lines | Owner | Resolution Shipped (After) |
|---|---|---|---|---|---|---|
| **D01** | `/`, `/parents`, `/shop` | **P0** | Two conflicting header/navigation bars rendered simultaneously; pale mint `aria-current="page"` background made active tab text illegible | `apps/web/src/App.tsx`, `apps/web/src/landing/ui/index.tsx`, `apps/web/src/styles.css` | `AG18`, `CX02` | Consolidated into a single sticky header (`data-testid="unified-site-header"`) in `App.tsx`; removed duplicate headers from `CinematicLandingPage`, `ParentPortalPage`, and `AdultStorefront`; fixed active tab contrast (>9:1). |
| **D02** | `/` (Hero) | **P0** | Hero consisted of 5 flat-shaded floating Babylon.js cylinders (`MeshBuilder.CreateCylinder`), not a cultural adventure scene | `apps/web/src/landing/scene/index.ts`, `apps/web/src/landing/ui/index.tsx` | `AG03`, `AG11`, `DX03` | Replaced homepage cylinder canvas with original multi-layered **Byblos Harbor Golden Hour Scene** (`/art/v08/hero-byblos-scene.svg`) featuring Mira, Teta Nahla, Phoenician limestone arches, faluka boat, and glowing saj oven. |
| **D03** | `/` (Hero & Footer) | **P1** | Prominent `"Pause 3D Camera Motion"` debug-like control in hero CTA row and raw `({rendererMode})` debug label in footer | `apps/web/src/landing/ui/index.tsx` | `AG11`, `AG19` | Removed debug strings from hero/footer; moved reduced-motion preference button (`data-testid="toggle-reduced-motion"`) into the quiet footer comfort bar. |
| **D04** | `/` & `/explore` | **P0** | Five destination cards were unillustrated text boxes that wrapped into an awkward **4+1 orphan layout** at desktop widths | `apps/web/src/landing/ui/index.tsx`, `apps/web/src/marketing/worlds-v06/ExploreAtlasPages.tsx` | `AG04..AG08`, `AG12`, `CX05` | Designed a **Featured Byblos Flagship Spotlight Card** + **Symmetrical 4-Column World Shelf (`.mv-world-grid-4`)** for `EG`, `IQ`, `KR`, `FR` with 16:10 watercolor illustrations (`/art/${code}/cover.svg`) and mentor portraits. |
| **D05** | `/` & `/adventures` | **P1** | Quest descriptions looked like bare documentation cards rather than gameplay | `apps/web/src/landing/ui/index.tsx` | `AG10`, `AG14` | Replaced with illustrated 5-step quest cards (`Explore & Gather` → `Meet & Trade` → `Build & Restore` → `Cook Together` → `Discover Words`) pairing `/art/LB/1.svg..5.svg` scenes with custom medallions (`/art/v08/icons/quest-*.svg`). |
| **D06** | `/passport` | **P0** | Bare text on white background, plain colored borders, and an unprotected destructive reset button | `apps/web/src/pages/Passport.tsx` | `AG10`, `AG15`, `CX06` | Transformed into an **Illustrated Collectible Explorer Passport Album** with perforated cultural stamps (`/art/v08/stamps/stamp-*.svg`), clear local vs. Roblox DataStore disclosure, and a separated reset card with session undo recovery. |
| **D07** | `/parents` | **P0** | Pre-populated fake signed-in session (`useState('parent.demo@miraverse.studio')`), enterprise/debug jargon, and immediate destructive delete | `apps/web/src/parent/index.tsx` | `AG16`, `CL07`, `CX07` | Initialized `signedInEmail` to `null` (unauthenticated by default), added adult confirmation gate, added single-use gift replay protection, and added two-step deletion confirmation. |
| **D08** | `/about` & Footer | **P0** | Contradictory claims (`"Zero Network Calls"` on a page calling `/api/checkout`, unsubstantiated `"in compliance with COPPA, GDPR-K"`, stale `v0.1.0` and `v0.4 Release Candidate` labels) | `apps/web/src/pages/About.tsx`, `apps/web/src/landing/ui/index.tsx` | `CL03`, `CL13`, `CX10` | Unified version to `v0.8.0 (Option A Release Candidate)`, separated guest child web privacy from adult Stripe test checkout and Roblox client requirements, and kept `AI_REVIEWED_PENDING_HUMAN` transparent. |

## 2. Subsystem Reuse Matrix (`CL01`)

| Subsystem | Path | Decision | Justification |
|---|---|---|---|
| React 18 + HashRouter + i18n | `apps/web/src/App.tsx`, `apps/web/src/i18n/` | **REUSE & IMPROVE** | Proven 6-locale LTR/RTL switching; refactored shell for single header and dark-storybook theme. |
| Cultural Stories & Packs | `packages/content/` | **REUSE** | Canonical 5-country 15-scene stories and 25 challenges pass all G1/G2 compiler checks. |
| Existing Watercolor Scene SVGs | `apps/web/public/art/{LB,EG,IQ,KR,FR}/` | **REUSE & SURFACE** | High-craft illustrations already existed in `public/art/` but were not wired into homepage/explore cards; now surfaced alongside new v0.8 art kit. |
| Homepage Babylon Cylinder Scene | `apps/web/src/landing/scene/index.ts` | **DEFER / REPLACE ON HOME** | Replaced on homepage with `/art/v08/hero-byblos-scene.svg`; legacy module retained only for backwards test compatibility. |
| Adult Commerce & Gift API | `apps/api/src/`, `functions/api/` | **REUSE** | HMAC-verified Stripe test webhook and hashed single-use gift codes pass all C01–C20 security tests. |
