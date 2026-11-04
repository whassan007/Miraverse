# MiraVerse v1.6 — Minecraft Bedrock Arabic, Arabizi & English Capability Test Report (`CL04` / `CX04`)

## 1. Executive Summary & Epistemic Honesty
- **Rule Enforced:** Per Section 2, we **never** claim broadly that "Minecraft doesn't support Arabic," nor do we add fake unsupported locale codes (such as `ar_SA` or `ar_QA`) to `apps/minecraft/rp/texts/languages.json`.
- **Pack Inspection (`apps/minecraft/rp/texts/`):** The resource pack contains `en_US.lang` and `fr_FR.lang`. Microsoft's official Bedrock pack language list does not include an Arabic `.lang` pack code, whereas Roblox natively supports `ar-001`.
- **Capability Test Fixture Built:** Implemented in `apps/minecraft/scripts/gulf-v16/bedrock-language-capability-test.ts` and placed in the hub capability test zone (`apps/minecraft/world/gulf-v16/capability-test-zone.json`).
- **Host Verification Status:** Static pack validation, UTF-8/BiDi string inspection, and Script API unit tests (`tests/gulf-v16/wave0-capability-and-qatar.test.ts`) **PASS** on this Linux `aarch64` host (`NVIDIA GB10`). Interactive Windows/mobile Bedrock GUI client rendering capture is honestly marked **`UNVERIFIED/BLOCKED`** on Linux `aarch64` and packaged with a Windows test handoff protocol.

## 2. Per-Surface Bedrock Rendering & Fallback Ladder Matrix

| Bedrock UI Surface | Native Arabic UTF-8 Behavior | Arabizi (`Latn`) Behavior | Plain English + Glossary | Chosen Tested Strategy |
|---|---|---|---|---|
| `texts/languages.json` & `.lang` | Not a standard Bedrock pack locale code; fake codes prohibited | Carried via `en_US.lang` + Script API catalog | Native `en_US.lang` | Keep `en_US.lang` / `fr_FR.lang` clean; never inject fake `ar_*` codes into `languages.json` |
| `@minecraft/server-ui` (`ActionFormData`, `MessageFormData`) | Displays UTF-8 Arabic script; never reverse characters manually | Native LTR alignment, zero bidi clipping on mobile/gamepad | Native LTR with side-by-side term | 3-way player toggle (**العربية / Arabizi / English**) stored in player dynamic property `mv:script_pref` |
| `onScreenDisplay` (`setTitle`, `setActionBar`) | Clean for short 2–5 word phrases (`عالم يرا · قطر`) | Clean LTR ticker for step hints (`Yalla niktishif il-lulu`) | Clean LTR | Concise title lines without mixed-bidi punctuation |
| NPC `nameTag` & Signs | Short unvocalized Arabic works; long vocalized lines clip | Clean short Latin (`Noora · Al-Qallaf`) | Clean English | Bilingual short tag (`Noora · نورة`) + full dialogue in `ActionFormData` |
| Custom Items (`item.miraverse:qa_*.name`) | Driven via Script `ItemStack.nameTag` when Arabic selected | Driven via `en_US.lang` + `nameTag` | `en_US.lang` baseline | Canonical `en_US.lang` names + dynamic localized lore/nameTag |

## 3. Child-Friendly Arabizi Orthography Rules
- **Ages 5–7:** Uses transparent phonetic Latin letters without numeral substitutions (e.g., `Yalla niktishif il-lulu` as an illustrative activity invitation, never claimed as standardized official Qatari spelling).
- **Ages 8–10:** Pairs phonetic Latin with the Arabic word and English meaning side by side.
- **Ages 11–17:** Supports optional familiar Arabizi digits (`3` for `ع`, `7` for `ح`, `5` for `خ`) with explicit educational notes explaining the sound correspondence.
