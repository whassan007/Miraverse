# MiraVerse v1.0 — Minecraft Bedrock Voxel Art Bible (`apps/minecraft/art-direction/v10/VOXEL_ART_BIBLE.md`)

- **Owner:** `AG01` (Wave W0)
- **Target Runtime:** Minecraft: Bedrock Edition (Stable `@minecraft/server@1.17.0`, `@minecraft/server-ui@1.3.0`)

## 1. Visual Direction & Voxel Craft Principles

1. **Authentic Voxel Architecture (Never Flat Placeholders):**
   - Every country district occupies a curated **96×96 block footprint** with layered roofs, recessed windows, covered arcades/traboules, street lanterns, market awnings, and landscaped courtyards.
   - Each country is built from **5 distinct exterior buildings**, **3 enterable furnished interiors**, **4 functional animated NPCs**, **8+ interactive quest anchors**, **>=10 region items**, and **>=8 custom architectural/decorative blocks**.
2. **Distinct Cultural Silhouettes (Zero Cross-Country Kit Reuse):**
   - **Lebanon (Byblos Harbor):** Warm coastal limestone (`miraverse:lb_byblos_limestone`), terracotta Mediterranean pitched roofs, cedar shutters, harbor seawall with fishing boats, and Teta Nahla's domed *saj* hearth.
   - **Egypt (Cairo Courtyard):** Carved wooden *mashrabiya* screens (`miraverse:eg_cairo_mashrabiya`), hanging *fanous* lanterns, recessed Islamic stone arches, central courtyard fountain, and steaming *koshari* cauldron kitchen.
   - **Iraq (Baghdad Riverside):** Projecting second-story *shanasheel* timber oriel windows (`miraverse:iq_shanasheel_oriel_screen`), turquoise glazed brickwork, Tigris riverfront promenade with date palms, and brick *kleicha* oven.
   - **South Korea (Jeonju Hanok Village):** Sweeping dark *giwa* tiled roofs (`miraverse:kr_giwa_eave_tile`), exposed pine post-and-beam joinery, translucent *hanji* paper doors, terracotta *onggi* jar terrace, and pine-needle *songpyeon* steamer.
   - **France (Vieux Lyon):** Warm Renaissance ochre limestone facades (`miraverse:fr_lyon_ochre_stucco`), vaulted covered *traboules* passageways, steep mansard slate roofs, carved oak shutters, and *Boulangerie du Soleil* brick oven.
3. **Blockbench Entity Rig & Animation Standard:**
   - All mentors and regional NPCs share the humanoid bone hierarchy (`root -> waist -> body -> head / leftArm / rightArm / leftLeg / rightLeg`) with 6 verified animation states: `idle`, `walk`, `greeting`, `pointing`, `celebrate`, and `working`.
4. **Pixel Art & Texture Resolution Rules:**
   - Items & food icons: crisp 16×16 pixel art with intentional warm outlines and readable silhouettes on small mobile screens.
   - Custom blocks: 16×16 tiling voxel textures registered in `rp/textures/terrain_texture.json` and `rp/blocks.json`.
   - Entity skins: 64×64 UV-mapped PNG textures per mentor/NPC variant.
