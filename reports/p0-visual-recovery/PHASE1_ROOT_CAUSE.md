# MiraVerse P0: Phase 1 Root-Cause Report — Visual Replacement & Deployment Repair

**Date:** 2026-11-03  
**Lead:** MiraVerse Visual Recovery Lead  
**Roster:** 35 Agents (`AG01–AG20` Antigravity, `DX01–DX05` DGX Spark Local, `CL01–CL05` Claude, `CX01–CX05` Codex)

---

## Executive Finding

The previous v0.7 and v0.8 iterations failed to visibly transform the live website (`https://miraverse.pages.dev/`) due to **two compounding root causes**:

1. **Cloudflare Pages Production Branch Mismatch (`build/miraverse-v0.1` vs `main` / `integration/*`):**
   - The Cloudflare Pages project `miraverse` is configured with **`build/miraverse-v0.1`** as its `Production` branch.
   - Live inspection (`npx wrangler pages deployment list --project-name miraverse`) proves that `https://miraverse.pages.dev/` is serving deployment `81339fc2-52d6-49af-8aec-fd717794c030` (`Environment: Production`, `Branch: build/miraverse-v0.1`, commit `3aeed35`).
   - Subsequent deployments run with `--branch main` (such as `c6ad2a01` @ `4812a2b`) were routed by Cloudflare Pages to the **`Preview`** environment (`https://c6ad2a01.miraverse.pages.dev` / `https://main.miraverse.pages.dev`) and **never updated `https://miraverse.pages.dev/`**.
   - Furthermore, the `integration/miraverse-v0.8-visual-recovery` branch (`a9924d0`) was only committed locally and never deployed to Cloudflare Pages.

2. **Procedural SVG Geometry Instead of Real Painted/Illustrated Artwork:**
   - On the live `build/miraverse-v0.1` deployment (`./assets/index-CNA5eHId.js`), the homepage hero mounts `apps/web/src/landing/scene/index.ts` (`mountLandingDiorama`), which calls `BABYLON.MeshBuilder.CreateCylinder` to render 5 flat-shaded floating colored cylinders (`vignette_LB`, `vignette_EG`, `vignette_IQ`, `vignette_KR`, `vignette_FR`) alongside the `"Pause 3D Camera Motion"` debug button.
   - On the local `integration/miraverse-v0.8-visual-recovery` branch (`a9924d0`), `tools/quality/v08/build-v08-art-kit.mjs` replaced those cylinders with **programmatic flat SVG primitives** (`<rect>`, `<circle>`, `<polygon>`, `<path>`) in `apps/web/public/art/v08/hero-byblos-scene.svg` and reused flat procedural SVGs in `apps/web/public/art/{LB,EG,IQ,KR,FR}/cover.svg`, instead of invoking Antigravity's `image-generator` capability to create rich, painted illustrated environment artwork.

---

## Detailed 8-Point Root-Cause Audit

### 1. Which React component actually renders the homepage
- **File:** `/home/wael/Code/Miraverse/apps/web/src/App.tsx` (Route `/` renders `<LandingPage />`)
- **Component Implementation:** `/home/wael/Code/Miraverse/apps/web/src/landing/ui/index.tsx` (`export function LandingPage()`)

### 2. Which files generate the floating colored cylinders
- **Homepage 3D Diorama:** `/home/wael/Code/Miraverse/apps/web/src/landing/scene/index.ts` (lines 41–55):
  ```ts
  COUNTRIES.forEach((code, idx) => {
    const island = BABYLON.MeshBuilder.CreateCylinder(
      `vignette_${code}`,
      { diameterTop: 4.4, diameterBottom: 3.2, height: 1.2, tessellation: 20 },
      scene
    );
  });
  ```
- **Legacy 3D Runtime:** `/home/wael/Code/Miraverse/apps/web/src/game3d/runtime/index.ts` (lines 122, 167, 170, 226, 265) also calls `BABYLON.MeshBuilder.CreateCylinder` for `heroBody`, `hubFountain`, `hubSpire`, `landmarkRoof_${world}`, and `body_${n.npcId}`.

### 3. Whether the new artwork was ever generated
- **No real painted raster artwork was generated.**
- Prior scripts (`tools/quality/v08/build-v08-art-kit.mjs`) wrote procedural XML/SVG strings (`<rect>`, `<circle>`, `<polygon>`, `<path>`) directly to disk. Antigravity's `image-generator` subagent was not invoked.

### 4. Where the artwork is stored
- Public web assets live in `/home/wael/Code/Miraverse/apps/web/public/art/`:
  - `/home/wael/Code/Miraverse/apps/web/public/art/v08/` (procedural SVGs from v0.8)
  - `/home/wael/Code/Miraverse/apps/web/public/art/{LB,EG,IQ,KR,FR}/cover.svg` (flat vector shapes from earlier builds)
  - Built static output goes to `/home/wael/Code/Miraverse/apps/web/dist/art/`.

### 5. Whether the artwork is imported and rendered
- On the deployed `https://miraverse.pages.dev/` site (`3aeed35`): **No** — it renders `<canvas>` with `mountLandingDiorama` (the 5 floating cylinders) and text-only destination cards (`4+1` wrap).
- On local branch `integration/miraverse-v0.8-visual-recovery` (`a9924d0`): `apps/web/src/landing/ui/index.tsx` renders `<img>` tags pointing to `/art/v08/hero-byblos-scene.svg` and `/art/{CC}/cover.svg`, which are basic flat SVG geometry rather than genuine illustrated environment paintings.

### 6. Whether the deployed build contains the new components
- **No.** Inspecting `https://miraverse.pages.dev/` via `curl` shows:
  - HTML entry: `<script type="module" crossorigin src="./assets/index-CNA5eHId.js"></script>`
  - `curl -s https://miraverse.pages.dev/assets/index-CNA5eHId.js | grep -oE "CreateCylinder|Pause 3D Camera Motion|v0\.8\.0|v0\.4 Release Candidate|hero-byblos-scene" | sort -u` returns:
    - `CreateCylinder`
    - `Pause 3D Camera Motion`
    - `v0.4 Release Candidate`
  - Neither `v0.8.0` nor `hero-byblos-scene` is present in the live bundle.

### 7. Whether the deployed commit matches the integration branch
- **No.**
  - Local integration branch HEAD: `a9924d0` (`integration/miraverse-v0.8-visual-recovery`)
  - Local `main` branch HEAD: `4812a2b` (`v0.7.0`)
  - Live `https://miraverse.pages.dev/` Production deployment (`81339fc2`): `3aeed35` on branch **`build/miraverse-v0.1`**.

### 8. Whether asset URLs, caching, or build configuration prevent changes from appearing
- **Cloudflare Pages Branch Routing:** Because Cloudflare Pages project `miraverse` has its Production branch set to `build/miraverse-v0.1`, running `wrangler pages deploy apps/web/dist --project-name miraverse --branch main` only updates the preview alias `https://main.miraverse.pages.dev`, while `https://miraverse.pages.dev/` continues serving `build/miraverse-v0.1`. Deploying to production requires `--branch build/miraverse-v0.1` (and also deploying `--branch main` so both aliases serve the exact same build).
- **HTTP Caching:** `https://miraverse.pages.dev/` serves `index.html` with `cache-control: public, max-age=0, must-revalidate`, and Vite hashes JS/CSS assets (`assets/index-<hash>.js`), while `/art/p0/*` image URLs must use explicit versioned paths so neither browser nor CDN serves stale assets.
