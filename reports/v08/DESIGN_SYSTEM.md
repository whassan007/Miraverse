# MiraVerse v0.8 Design System, Visual Language & Brand Bible (`AG01`, `AG02`, `CL02`)

## 1. North-Star Creative Direction
- **Audience:** Ages 8–12 (child explorers) + Parents, Guardians & Educators (adult portal).
- **Aesthetic Pillar:** Warm Mediterranean & global storybook illustration meets modern adventure-game clarity — rich environment depth, warm golden-hour lighting, tactile regional architecture, and expressive character portraits.
- **Palette Tokens ([`apps/web/src/design-system/v08/tokens.ts`](file:///home/wael/Code/Miraverse/apps/web/src/design-system/v08/tokens.ts)):**
  - `canvasDeep`: `#0B1325` (Midnight Harbor)
  - `surfaceElevated`: `#131F38` (Storybook Slate)
  - `parchmentWarm`: `#FFF8EE` (Primary headline & body text — 14.8:1 contrast on `#0B1325`)
  - `accentCompassGold`: `#F4A261` & `#FEF08A` (Active tab borders, focus rings, and badges)
  - `ctaRobloxEmerald`: `#00B06F` with `#032215` label text (Primary `▶ Play free on Roblox` CTA)

## 2. Five Culturally Differentiated World Palettes & Motifs
1. **Lebanon (`LB` — Byblos Harbor):** Teal-emerald sea (`#0D9488`), warm honey limestone (`#EBD9C0`), triple-arched mandaloun house, Crusader harbor tower, domed cast-iron saj oven, and cedar silhouettes.
2. **Egypt (`EG` — Historic Cairo):** Nile twilight amber (`#D97706`), pierced brass fanous lanterns (`#FBBF24`), white-sailed Nile felucca, and carved mashrabiya lattice balconies.
3. **Iraq (`IQ` — Baghdad Riverfront):** Tigris sky azure (`#0284C7`), pointed buff-brick courtyard arches, stained-glass shanashil bay windows, turquoise fountain tiles, and date palm groves.
4. **South Korea (`KR` — Jeonju Hanok Village):** Moonlight indigo (`#4F46E5`), upward-curving dark giwa roof eaves, warm backlit changhoji mulberry-paper doors, and autumn harvest moon.
5. **France (`FR` — Vieux Lyon):** Royal cobalt (`#2563EB`) & warm brioche gold (`#F59E0B`), Renaissance ochre stone traboules, boulangerie bread racks, and scored Galette des Rois.

## 3. Layout & Grid Rules
- **Single Shared Header (`.site-header`):** Sticky top bar with Brand Crest, 6 compact destinations (`Home`, `Explore Worlds`, `Adventures`, `Passport`, `Gifts (18+)`, `For Parents`), `▶ Play on Roblox` pill CTA, and language picker (`#ui-language`).
- **World Discovery Shelf:** Featured full-width Byblos Flagship spotlight card followed by a 4-column expansion grid (`.mv-world-grid-4`: `4×1` on desktop, `2×2` on tablet, `1×1` on mobile) — eliminating the 4+1 orphan card layout.
