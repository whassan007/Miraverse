# MiraVerse v0.4 Lead Game Design Specification (`docs/design/GAME_DESIGN_V04.md`)

**Author:** `CL01` (Lead Game Designer)  
**Scope:** Five 3D Country Adventures (`FR`, `LB`, `EG`, `IQ`, `KR`), First-120-Seconds Player Flow, Diegetic Challenge Grammar, and Non-Commercial Reward Economy.

---

## 1. First 120 Seconds Experience (Web 3D, Roblox, Minecraft)

1. **0–15s (Arrival in the 3D World Hub):** Player enters `/play` directly from the **Play Free** button on the cinematic homepage with zero login or payment prompts. Camera sweeps smoothly down to the central Compass Fountain surrounded by 5 culturally distinct portal arches (`FR`, `LB`, `EG`, `IQ`, `KR`).
2. **15–45s (Immediate Avatar Control & Portal Walk):** Player walks Mira using WASD/Arrows or virtual twin-stick touch controls toward the **France (Vieux Lyon)** portal arch.
3. **45–90s (Vieux Lyon Arrival & Mentor Hook):** Brief rooftop vista over Vieux Lyon transitions to street level beside **Mamie Claire** outside *Boulangerie du Soleil*. Speaking with Mamie Claire triggers typewriter bilingual dialogue and highlights the 5-step restoration quest.
4. **90–120s (First Diegetic Gather & Visible World Change):** Player collects diegetic ingredients and restoration materials along the cobblestone lane, trades with **Monsieur Henri**, physically restores the bakery roof/shutters/limestone facade with a staged before/after reveal, bakes the *galette des rois*, discovers French cultural words on 3D props, and triggers the street celebration + Souvenir Passport stamp.

---

## 2. Five-Challenge Grammar Across All Three Engines

| Challenge | Web 3D (`apps/web/src/game3d`) | Roblox (`apps/roblox`) | Minecraft Bedrock (`apps/minecraft`) |
|---|---|---|---|
| **1. Gather** | Walk to diegetic 3D market/courtyard props, press `[E]` / Tap to pick up with pickup animation + particle burst. | Walk to 3D MeshPart props and trigger `ProximityPrompt` validated by server distance & active quest. | Collect matching cultural items from world containers/markers into player inventory. |
| **2. Trade** | Interact with vendor NPC (`Monsieur Henri`, `Amo Farid`, `Am Hassan`, `Abu Zaid`, `Merchant Min`) to exchange gathered items atomically. | Server-validated vendor exchange via `RemoteEvent` with anti-duplication guard. | Vendor NPC `ActionFormData` atomic item stack exchange. |
| **3. Build** | Select 3 architectural components (roof, walls, shutters/balcony) and apply to the landmark mesh with staged before/after 3D visual transformation. | Server-replicated staged MeshPart restoration on the town landmark. | Place verified blueprint blocks at the restoration site with particle & sound celebration. |
| **4. Cook** | Interactive 3D kitchen station camera close-up: add ingredients in sequence, knead/bake, and plate the signature cultural dish. | 3D cooking station sequence with `Animator` cooking clip and server step validation. | Custom recipe JSON + workstation script sequence yielding the cultural food item. |
| **5. Word** | Locate marked cultural props in the 3D town, inspect native script + transliteration + English meaning, and match 3 cultural words in context. | Diegetic 3D sign/prop discovery with native script billboard prompts. | In-world sign/prop inspection with native script and English gloss. |

---

## 3. Non-Commercial Reward Economy & Child Safety Boundary

- **Souvenir Passport Stamps (`MV1-<CC>-...`):** Earned upon completing all 5 challenges in a country; stored locally in `mv.save.v4` and `mv.stamps`. Explicitly labeled as fun, non-secure collectibles.
- **Earned Mira Tokens:** 20 Mira Tokens per challenge + 50 bonus Mira Tokens per completed chapter (= 150 Mira Tokens per country, 750 across all 5 countries). Spent exclusively on cosmetic-only keepsake outfits and hub decorations. Never purchasable with real money, never convertible to paid goods, and never linked to checkout inside child gameplay.
