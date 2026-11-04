# CODEX-09: Localization runtime and key checks

Backend: codex (default)

**CODEX-09 — Localization runtime and key checks**

Read-only inspection completed; no files edited, builds run, commits, publishing, or deployments performed.

**Findings**

- **Roblox localization remains incomplete.** Country selection, buttons, progress, and quick-chat contain English literals in [Main.client.luau](apps/roblox/src/client/Main.client.luau) and [ChallengeHud.client.luau](apps/roblox/src/client/ChallengeHud.client.luau). [NativeQuestHud.luau](apps/roblox/src/client/Presentation/NativeQuestHud.luau) detects three RTL locales but still formats an English banner.
- **Server messages also need migration.** Challenges send rendered text through `Notify`; quick-chat broadcasts English phrases. See [Challenges/init.luau](apps/roblox/src/shared/Challenges/init.luau:228) and [SessionManager.luau](apps/roblox/src/server/Core/SessionManager.luau:176). World prompts contain English text in [MapBuilder.luau](apps/roblox/src/server/MapBuilder.luau:271).
- **Existing checks cover web dictionaries.** [validate.ts](tools/validate.ts:616) checks nonempty strings and optional key parity; release validation applies parity against English. [gates.test.ts](tests/integration/gates.test.ts:47) additionally rejects certain placeholder markers. These checks do not establish Roblox call-site coverage or interpolation correctness.
- **Read-only dictionary audit:** all six [web locale files](apps/web/src/i18n/locales/en.json) contain 51 keys, identical key sets, and no blank values. This establishes structural parity only.
- **Human review is outstanding:** [locale-matrix.json](content/localization/v06/locale-matrix.json) explicitly records `PENDING_FINAL_REVIEW`.

**Implementation-ready specification — proposed**

1. Add a shared Roblox localization module exposing `resolveLocale(raw)`, `t(locale, key, params)`, and `direction(locale)`. Use the six locales and RTL set defined in [schema.ts](packages/content/schema.ts). Prefer an explicit player choice; otherwise use a reviewed platform-locale mapping. Unsupported or ambiguous locales fall back to English; never infer dialect from the visited country.
2. Define canonical, namespaced keys and named parameter contracts. Generate deterministic Luau dictionaries from reviewed JSON through the existing [compiler](tools/compiler/roblox.ts). Fallback order: selected locale → English → visible diagnostic key; report missing keys once during development.
3. Replace player-visible literals with keys. Send `{key, params}` for challenge notifications and approved phrase IDs for quick-chat; render in each recipient’s locale. Preserve server authorization and phrase allowlisting.
4. Re-render bound UI when locale changes. Apply direction and alignment consistently to HUDs, dialogue, prompts, and buttons. Preserve logical string order; do not manually reverse Arabic text.
5. Add a read-only validation command that fails on missing/extra keys, blanks, duplicate JSON keys, placeholders, parameter mismatches, undefined literal key references, and unregistered dynamic keys. Require generated-output parity. Add focused tests for locale resolution, fallback, interpolation, direction, and recipient-specific messages.

**Files a later implementation would own**

- **New:** `content/localization/roblox/{locale}.json`, `apps/roblox/src/shared/Localization.luau`, generated dictionary module, `tools/localization/check-keys.ts`, and focused `tests/localization/` fixtures.
- **Modify:** compiler and validation wiring; Roblox `Main.client.luau`, `ChallengeHud.client.luau`, `UI.luau`, `Presentation/NativeQuestHud.luau`, `MapBuilder.luau`, `Core/SessionManager.luau`, and `shared/Challenges/init.luau`.
- Coordinate dialogue migration with [MentorDialogueService.luau](apps/roblox/src/server/NPCs/MentorDialogueService.luau); its English/native fields are not a six-locale lookup contract.

**Dependencies and open gaps**

- Native-speaker approval, complete Roblox string inventory, dialect mapping, parameter contracts, and ownership of canonical catalogs remain implementation inputs. Existing web fallback behavior provides a reference in [i18n/index.ts](apps/web/src/i18n/index.ts).
- Preserve separate labels for **real places, literary works, and legend**; do not present narrative material as historical fact. The existing knowledge types distinguish mythology, folklore, historical claims, and fictional game content in [knowledge-v12/index.ts](packages/knowledge-v12/index.ts:28). Classification, translations, cultural claims, and question answers need human review; none are supplied here.
- Use original implementation and reviewed text only; no third-party assets are proposed. Current [UI.luau](apps/roblox/src/client/UI.luau) constructs UI without external assets.
- **NOT TESTED:** Roblox locale detection, switching, Arabic shaping/bidi, Korean glyphs, clipping, prompt localization, and multiplayer recipient rendering. No Studio access or Roblox runtime proof was available.

