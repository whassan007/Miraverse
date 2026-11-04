# MiraVerse v1.6 — Repository Inventory & Truthful Baseline Report (`DX01`)

- **Generated At:** 2026-11-04T13:48:27.830Z
- **Host Hardware:** `NVIDIA GB10, 580.178.04, 42, 0 % | Total=121GiB Used=102GiB Free=1GiB Available=19GiB`
- **Local DGX Spark LLM:** `qwen/qwen3-coder-next` (`ok=true`, `26.32 tok/s`, `418ms`, `maxConcurrency=1`)

## 1. Truthful Country Inventory (No Invented Deployed Counts)
- **Is v1.5 (27-country expansion) merged on `main`?** **No (`false`)**.
- **Currently Active Legacy Countries (Website + Packs + Quests):** **5** (`LB`, `IQ`, `EG`, `FR`, `KR`).
- **Staged-Only Minecraft Global Catalog Files (Not Active in Web/Roblox Compiler):** **6** (`DE`, `CN`, `JP`, `RU`, `UA`, `MA`).
- **New MiraVerse v1.6 Gulf Expansion Countries:** **6** (5 mandatory: `QA`, `AE`, `KW`, `SA`, `OM` + 6th added from research: `BH`).
- **Total Active Web Portal Countries in v1.6:** **11** (5 legacy + 6 Gulf). *(If v1.5 is merged in a future release, the combined target would become 33; we report 11 active and never fabricate 33 deployed countries).*
- **Yemen (`YE`):** Explicitly recorded as a **future candidate requiring dedicated research and human cultural review**, **not** a 7th release country.

## 2. Existing Platform & Localization Baseline
- **Website (`apps/web`):** HashRouter + React 18 + `I18nProvider`, currently supporting `en`, `fr`, `ar-LB`, `ar-EG`, `ar-IQ`, `ko`. Being extended non-destructively in v1.6 with `ar-QA`, `ar-AE`, `ar-KW`, `ar-SA`, `ar-OM`, `ar-BH`, `ar` (MSA), and the child-friendly **العربية / Arabizi / English** script toggle with **عالم يرا** / **Mira's World** brand separation.
- **Roblox (`apps/roblox`):** Compiles via `rojo build` to `apps/roblox/dist/miraverse.rbxlx`. Being extended with `GulfV16.luau`, `GulfWorldsV16.luau`, and `ar-001` LocalizationTable entries.
- **Minecraft Bedrock (`apps/minecraft`):** Compiles TypeScript via `esbuild` to `bp/scripts/main.js` and packages deterministic `.mcaddon`. `rp/texts/` currently has `en_US.lang` and `fr_FR.lang`. Per Section 2, we do **not** add fake unsupported language codes to `languages.json`; instead we build the real Bedrock Arabic/Arabizi capability test world and fallback ladder.
