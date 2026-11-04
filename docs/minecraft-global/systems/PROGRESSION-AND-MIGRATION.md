# MiraVerse Global v1.1 — Progression, Reward Economy, Finale & Save Migration Specification

## 1. Progression State Machine
- **Chapter States:** `LOCKED` → `AVAILABLE` → `STARTED` → `OBJECTIVE_PROGRESS` → `ACTIVITY_COMPLETE` → `REWARD_GRANTED` → `COMPLETED`.
- **Country Independence:** Chapter 1 of all 11 countries (`LB01`, `IQ01`, `EG01`, `FR01`, `KR01`, `DE01`, `CN01`, `JP01`, `RU01`, `UA01`, `MA01`) starts in `AVAILABLE`. Within each country, completing Chapter `N` unlocks Chapter `N+1`.
- **Capstone Country Keepsake:** Completing Chapter 6 of country `X` (`X06`) idempotently awards:
  1. Chapter 6 artifact / Passport Stamp (`stamp_*`)
  2. Country Capstone Keepsake (`*_memory_chest`, `*_lantern`, `*_solar_barque`, etc.)

## 2. Finale Contract: *The Circle of Stories*
- **Unlock Threshold:** Bringing **any 3 or more** completed country keepsakes (not 11 mandatory) into the **Atlas Observatory Rotunda** unlocks *The Circle of Stories* collaborative exhibition.
- **Age-Adapted Finale Presentation:**
  - `5-7` (Explorer): Picture-based cultural mural assembly with glow-path placement.
  - `8-10` (Adventurer): Guided exhibition pairing shared motifs (e.g., bread, lanterns, water, music).
  - `11-13` (Investigator): Comparative gallery connecting regional trade, craft, and environmental clues.
  - `14-17` (Architect / Curator): Multi-perspective curatorial exhibition with explicit source attribution (`folklore`, `literature`, `historical_context`, `contemporary_tradition`).
- **Finale Reward:** Grants the **Global Storykeeper Stamp** (`stamp_global_storykeeper`) while allowing continued free exploration of remaining countries.

## 3. Non-Monetary Reward Boundaries & Idempotency
- **Earned In-World Only:** Story Sparks, chapter artifacts (66), country keepsakes (11), and passport stamps (11 + 1 Global) are strictly world-local and non-monetary.
- **No Commerce or Sync:** Zero cash value, zero exchange rate, zero stranger trading, zero microtransactions, and zero cross-platform wallet/purchase sync with Roblox or web.
- **Idempotent Ledger:** Every reward grant is keyed by `${playerId}:${rewardId}` in `RewardLedger`; replaying a chapter or switching age tracks never duplicates currency or items.

## 4. Backwards-Compatible Save Migration (`v0.4 / v1.0 → v1.1`)
- Existing player saves from the 5-country release (`LB`, `IQ`, `EG`, `FR`, `KR`) migrate losslessly to schema `1.1.0`:
  - Legacy quest completions (`lb_main_01`, `eg_main_01`, `iq_main_01`, `kr_main_01`, `fr_main_01`) map onto `LB01`, `EG01`, `IQ01`, `KR01`, `FR01` while preserving all earned stamps, inventories, and Story Sparks.
  - The 6 new countries (`DE`, `CN`, `JP`, `RU`, `UA`, `MA`) initialize with Chapter 1 `AVAILABLE`.