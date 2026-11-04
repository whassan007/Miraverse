# CODEX-06: NPC and mentor services

Backend: codex (default)

**CODEX-06 — NPC and mentor services · Read-only report**

No files changed. Findings are static inspection only. Roblox runtime behavior is **NOT TESTED**.

**Findings**

- The startup script initializes `MapBuilder` and `SessionManager`, with no mentor-service initialization. `MapBuilder` creates block-shaped mentors and 14-stud proximity prompts, but does not attach a dialogue handler to those prompts. Sources: `apps/roblox/src/server/Main.server.luau`, `apps/roblox/src/server/MapBuilder.luau`.
- `MentorDialogueService` contains five mentors and a distance helper using supplied coordinates and fixed mentor positions. It has no dialogue-session lifecycle, choice validation, cooldown, or player-character lookup. Sources: `apps/roblox/src/server/NPCs/MentorDialogueService.luau`.
- Identity conflicts need resolution: Lebanon appears as Nahla in the service/dialogue, Salwa in map fallback data, and Yasmine in enrichment content. Other countries also have divergent rosters. Sources: `apps/roblox/src/server/MapBuilder.luau`, `apps/roblox/src/server/NPCs/MentorDialogueService.luau`, `content/dialogue/LB.json`, `content/v12/npc-enrichment/npc-mentor-dialogues-v12.json`.
- Structured dialogue already supplies node IDs, speaker IDs, gestures, localized text, choices, and objective references. The inspected client only loads animation IDs; `NativeQuestHud` only formats an objective banner. Sources: `content/dialogue/LB.json`, `apps/roblox/src/client/AdventureClient.client.luau`, `apps/roblox/src/client/Presentation/NativeQuestHud.luau`.
- Animation provenance is unresolved: the registry contains `rbxassetid` references, while the license manifest lists procedural GLBs rather than those animations. The mentor service’s `mv_interact_gather` key also differs from the registry keys. Sources: `apps/roblox/src/shared/npc/NpcAnimator.luau`, `assets/LICENSES.json`, `apps/roblox/src/server/NPCs/MentorDialogueService.luau`.

**Implementation-ready specification — proposed**

1. **Canonical content:** retain existing dialogue IDs; introduce an explicit alias map for conflicting mentor identities after human approval. Compile reviewed dialogue into a generated Luau catalog. Validate unique IDs, node links, objective references, gesture keys, locale coverage, and review status. Extend the existing compiler pattern in `tools/compiler/roblox.ts`.
2. **Server interaction:** initialize the mentor service after map creation. Register each NPC by canonical ID and actual model/prompt instance. On interaction, derive position from the player’s server-visible character; require a live character, matching country, registered NPC, and distance ≤14 studs. Reject missing or nonfinite coordinates. Replace fixed-position validation in `apps/roblox/src/server/NPCs/MentorDialogueService.luau`.
3. **Dialogue protocol:** expose `OpenMentor(npcId)`, `ChooseMentor(sessionId, choiceId)`, and `CloseMentor(sessionId)`. Store current node and session ownership server-side; apply a proposed 0.25-second request cooldown, matching `SessionManager`’s existing convention. Revalidate proximity and quest eligibility on every choice; reject stale, replayed, or unoffered choices. Clear sessions on death, departure, country change, and disconnect.
4. **Quest boundary:** choices may request an eligible objective transition; dialogue must not award completion or stamps directly. Integrate through one agreed quest authority: startup currently uses `Core/SessionManager.luau`, while `QuestEngine/ByblosQuestStateMachine.luau` separately defines progression.
5. **Presentation and safety:** render reviewed scripted choices, explicit close/repeat controls, native/English text and approved transliteration, with Arabic RTL support. No microphone or personal free-text collection, consistent with the enrichment guardrail. Use original mentor models, portraits, and animations only; retain a static-pose fallback until original animations have provenance.

**Later implementation ownership**

- Own: `apps/roblox/src/server/NPCs/MentorDialogueService.luau`.
- Add: `apps/roblox/src/server/NPCs/NpcRegistry.luau`, `apps/roblox/src/client/Presentation/MentorDialogueController.luau`, generated `apps/roblox/src/shared/MentorDialogues.luau`, and mentor-specific validation/security tests.
- Coordinate edits: `Main.server.luau`, `MapBuilder.luau`, `Core/SessionManager.luau`, `shared/npc/NpcAnimator.luau`, `tools/compiler/roblox.ts`.
- Content-review boundary: `content/dialogue/*.json`, `content/v12/npc-enrichment/npc-mentor-dialogues-v12.json`, and `art/source/characters/npcs/`.

**Dependencies and open gaps**

- Human decisions: canonical roster, alias migration, quest authority, approved age-tier/locale fallback, original asset provenance.
- Cultural review: validate every factual line, translation, transliteration, and question/answer pair before release. Existing enrichment and generated knowledge text are candidate content, not verification. Sources: `content/v12/npc-enrichment/npc-mentor-dialogues-v12.json`, `apps/roblox/src/shared/KnowledgeV12.luau`.
- Preserve separate labels for **real-place references**, **literature**, **legend/myth**, and **fictional mentor scenes**. The repository explicitly discusses mythology, literary motifs, and historical claims; classification and wording require human review. Sources: the enrichment JSON, `apps/roblox/src/shared/KnowledgeV12.luau`, `reports/v12/LOCALIZATION_REVIEW.md`.
- **NOT TESTED:** prompt-to-dialogue flow, distance enforcement, forged/replayed choices, simultaneous players, respawn/streaming cleanup, touch/gamepad access, RTL rendering, model placement, and animation playback. These require Roblox Studio/runtime proof.

