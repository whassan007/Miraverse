# CLAUDE-09: Child safety, privacy and security, including the UnGroup incident

Backend: claude (sonnet)

# CLAUDE-09: Child safety, privacy and security (including UnGroup)

Read-only wave. Nothing was edited, committed, published or deployed. I had no Studio access, so everything that needs runtime proof is marked **NOT TESTED**. I did not run the failing vitest suites and have not seen their output.

## 1. Findings

### A. The UnGroup incident is not documented in the repo
- `grep -i ungroup` over the whole snapshot (excluding `node_modules` and `.git`) returns nothing. There is no incident note, runbook entry or guard.
- Rojo mounts only code. `apps/roblox/default.project.json` maps `ReplicatedStorage.Shared`, `ServerScriptService.MiraVerse`, `StarterPlayerScripts.MiraVerseClient` and a bare `Workspace` with `StreamingEnabled`. The Workspace models are not source-controlled, so any model that lives only in the published place is invisible to the repo.
- `MapBuilder.luau` (around lines 404–452) removes and rebuilds only a Workspace child named `MiraVerseMap`. It does not detect or remove anything else, so a foreign `UnGroup` model would survive every Rojo sync and rebuild.
- The release checklist `apps/roblox/tools/release/ROBLOX_RELEASE_CHECKLIST.md` has three steps. None audits the place for foreign instances, scripts or assets.
- Nothing in `apps/roblox/src` calls `MarketplaceService`, and `SecurityAndPersistence.luau` sets `ENABLE_ROBLOX_MONETIZATION = false`. A model that references it, with Plots, Steal, Economy and SellStand scripts, therefore did not come from MiraVerse source. That is consistent with the incident description.
- The most likely vectors are toolbox or free-model inserts, a plugin, or an old place version. This is unproven and the origin is unknown.
- The risks are an unintended Robux or purchase path in a children's experience, and unreviewed server scripts running with server authority.
- `.gitignore` excludes `*.rbxlx` and `apps/roblox/src/shared/Packs.luau`. That is acceptable, but it means the published place has no checked-in baseline to diff against.

### B. Roblox in-game safety: what is implemented
- **Chat is disabled client-side.**
  - `Main.client.luau:10-16` sets `TextChatService.ChatWindowConfiguration.Enabled` and `ChatInputBarConfiguration.Enabled` to false, and calls `SetCoreGuiEnabled(Chat, false)`, all inside `pcall`.
  - `AdventureClient.client.luau:7-12` disables the chat window the same way.
- **Chat-disabling is client-only and unverified.**
  - The client could be modified. Roblox platform chat filtering would still apply, but nothing server-side enforces "no chat".
  - Whether the chat UI stays hidden is **NOT TESTED**.
- **Quick-chat is a fixed list.** `SessionManager.luau:17` defines `PHRASES = {"Hello!","Great job!","Follow me!","Thank you!"}`. The `Say` handler (lines 150-158) accepts only an integer index from 1 to 4, rate-limited. This is well designed: no free text is possible.
- **Phrases are duplicated.** `PHRASES` is hard-coded in both `SessionManager.luau` and `Main.client.luau:19`. A mismatch is possible, and the phrases have no localisation or human review (gap).
- **Phrase display has two weaknesses.**
  - `phraseOut:FireAllClients` broadcasts to every player regardless of distance.
  - The client resolves the speaker by `Players:GetPlayerByUserId`.
  - There is no block-list or mute check.
- **Server-authoritative session.**
  - `GetState`, `SelectCountry` and `RunChallenge` validate input and use a 0.25 s cooldown (`limited`).
  - The country code is checked against a whitelist.
  - Challenge completion is server-owned.
  - Session state is in-memory only, with no DataStore or network (stated in the file header).
  - This is a strong privacy position: no child data is persisted.
- **Cooldown cleanup is incomplete.** Cooldown tables are cleaned in `PlayerRemoving`, but there is no per-player cap on `pcall`-wrapped `Challenges.run`.
- **Dormant services exist but are not wired in.** `Main.server.luau` requires only `MapBuilder` and `SessionManager`. These are never required and remain in the place as dead code:
  - `Foundation/Social/SocialInvitationService.luau`
  - `Building/Collaboration/CollaborativePlotService.luau`
  - `QuestEngine/Coop/*`
  - `Progression/PlayerDataStoreService.luau`
  - `Progression/Avatar/AvatarLoadoutService.luau`
  
  `PlayerDataStoreService` is memory-only despite the "DataStore" name. The `ROBLOX_SOCIAL_AND_COMMUNITY_SAFETY.md` claims (per-action rate limits, owner permission) apply to unwired code, so they are **not active protections**.
- **Commerce guard is nearly empty.** `SecurityAndPersistence.luau` is only a pure payload validator that rejects the actions `EXTERNAL_CHECKOUT` and `WEB_GIFT_REDEEM`.
  - It is not referenced by `SessionManager`.
  - It does not block MarketplaceService, `PromptPurchase` or `ProcessReceipt`.

### C. Doc vs. code mismatches
- `docs/v06/safety/CHILD_PRIVACY_AND_PLATFORM_BOUNDARIES.md` says Roblox "uses Roblox's built-in `TextChatService`". The code disables it. The doc should say chat is disabled and quick-chat only.
- The doc claims zero personal information on the web child routes. I could not verify that against the built app, and `tests/web/e2e` is partly failing (see D).
- `apps/api/db/schema.sql` `child_profiles.paid_cosmetics_enabled INTEGER NOT NULL DEFAULT 1` defaults to purchases enabled, which conflicts with the "zero child monetization pressure" statement. Policy needs human sign-off.
- `adult_accounts.email_verified` also defaults to `1` (verified), which is unsafe. A verification flag should default to 0.
- `apps/api/src/consent/index.ts` keeps consent records in an in-memory `Map`, so records are lost on restart and not auditable.

### D. Web and payments
- **Stripe and parent gate**
  - `functions/api/checkout.ts` requires `parentGateConfirmed === true`. That is a client-supplied boolean, so any caller can send it. It is a UX gate, not a security control, and it should not be described as a child-protection control.
  - The Stripe price IDs in `wrangler.toml` are public price IDs, not secrets. Secrets are in Cloudflare per `CLAUDE.md`. I did not read the credentials file.
- **Webhook**
  - `functions/api/webhook.ts` has correct HMAC verification, a 300 s tolerance and a constant-time comparison.
  - It does not persist events or check idempotency. It returns `status: fulfilled` or `revoked` but stores nothing, so entitlement is not actually granted or revoked. That is a functional gap, not a vulnerability.
- **`verify-session`** validates the `session_id` format and queries Stripe. I did not assess its downloads gating beyond this.
- **No rate limiting or Origin/CSRF check** on checkout.
- **Admin diagnostics**
  - `apps/web/src/App.tsx:161` routes `/admin/diagnostics` publicly with no auth. The comment says "Admin Only · Removed from Child-Facing Routes", but nothing enforces it.
  - It shows build paths, place-ID and deployment diagnostics. Anyone can reach it.
- **Deploy**
  - `tools/deploy/deploy.sh` reads `~/.config/miraverse/deploy.env`.
  - The `production` command must only be run when the user asks (`CLAUDE.md`).
  - I did not run any deploy command.

### E. Test failures (context only, not analysed)
The 7 failing vitest tests are: G3, G5, G6 (`tests/integration/gates.test.ts`; G5 is at line 223 and G6 at line 300), v12-enrichment test 8, and the v08, v13 and v14 web e2e suites.
- I did not run them, so I cannot say if any are safety-relevant.
- G6 covers swarm path boundaries and status hygiene. A safety owner should read it, because "hygiene" gates are where a security gate could be hiding.
- v12 enrichment test 8 touches `tests/v12/suite/v12-enrichment.test.ts`, which matched my safety-term grep. That grep match also covers `age-tier` content in `content/v12/**`. Check whether that test covers age-appropriateness.

## 2. Specification (implementation-ready)

### S1. UnGroup incident response and audit (priority 0, human-led)
1. **Place audit script (Studio, human run).** The `mcp__roblox-studio__*` tools could do this later. Walk `game` descendants of Workspace, ServerScriptService, ServerStorage, ReplicatedStorage, StarterGui, StarterPack and StarterPlayer. Flag any instance not in the Rojo tree or the `MiraVerseMap` build.
2. **Flag these patterns:**
   - Any `Script`, `LocalScript` or `ModuleScript` not mapped from `src`.
   - Source containing `MarketplaceService`, `HttpService`, `require(<number>)`, `loadstring`, `InsertService`, `getfenv` or `setfenv`.
   - Names matching Plots, Steal, Economy or SellStand.
3. **Compare against a known-good baseline.** Build `npm run build:roblox` (Rojo 7.7.1, per the checklist) into a throwaway file, then diff the instance names and scripts against the published place. Never use the baseline to publish.
4. **Publish gate.** Add a release-checklist step: "Place Audit: zero foreign instances; zero references to MarketplaceService unless approved". Keep `STAGING_UNPUBLISHED_HUMAN_APPROVAL_REQUIRED`.
5. **Place-level hardening, human, in Creator Hub (NOT TESTED):**
   - Review collaborators and team-create permissions.
   - Review installed plugins.
   - Review group-owned asset and script access.
   - Check version history for when the models first appeared.
   - Check whether monetization (game passes, developer products) is enabled on the experience.
6. **Document the incident** in a new `docs/security/INCIDENT_UNGROUP.md`, listing only facts and unknowns. Do not state a cause.
7. **Runtime tripwire (optional).** A server script that on start logs and removes any Workspace descendant outside an allow-list (`MiraVerseMap`, `Terrain`, `Camera`, character models) and refuses to start if `MarketplaceService.PromptPurchase` is connected. Proven only in Studio, so **NOT TESTED**. Consider this a fallback and prefer prevention. Never auto-delete without an owner-approved allow-list.

### S2. Roblox server hardening
- Move child-safety enforcement server-side. Prefer disabling chat via experience settings (Creator Hub, human) in addition to the client calls (**NOT TESTED**).
- Single source for `PHRASES`: put it in `shared`, require it from both server and client, and mark localisation and wording as a gap for human review.
- Make `PhraseShown` proximity-based and skip players who have muted or blocked the speaker. Check Roblox's current API for block and mute status (**NOT TESTED**).
- Wire `SecurityAndPersistence.validateRemotePayload` into every RemoteFunction. Add an explicit no-monetization assertion test that scans `apps/roblox/src` for `MarketplaceService`, `PromptPurchase`, `ProcessReceipt` and `HttpService`, and fails CI on any hit.
- Decide per dormant module (Social, Collaborative, Coop, Avatar): wire it with the documented safeguards, or move it out of `src/server`. Do not leave unreviewed, unwired code in the published place.
- Persistence: if saving is wanted, add real `DataStoreService` access with a minimal schema (no names, no free text, no chat), a retention rule and a deletion path. Keep session-only as the default.

### S3. Privacy and policy docs
- Correct `docs/v06/safety/CHILD_PRIVACY_AND_PLATFORM_BOUNDARIES.md` so Roblox is described as chat-disabled with fixed phrases. Add the incident cross-reference.
- Add a data-inventory table (what is collected on web, Roblox and API), a retention rule and a deletion process.
- Legal review is needed for COPPA, GDPR-K, UK AADC and other jurisdictions. I did not give legal conclusions. This is a gap for a human and counsel.

### S4. Web and API
- Change the admin diagnostics route to require server-side auth, or remove it from the production build. Add an e2e test that child routes expose no build paths or place IDs.
- Treat the `parentGateConfirmed` flag as advisory. Add rate limiting and Origin checks on checkout.
- Make the webhook idempotent (store event IDs) and persist entitlement changes (D1 or KV per `wrangler.toml`).
- Schema: default `paid_cosmetics_enabled` to 0 and `email_verified` to 0 unless the owner decides otherwise. Persist consent records in the DB, not in memory.
- Add a basic security-headers and CSP file for the Pages site, and confirm no analytics or pixel scripts exist in the child app. My grep for analytics terms only matched general UI and i18n code, and it is not conclusive.

### S5. Tests to add (new files, later)
- Static Luau scan (above) for monetization APIs and foreign `require(<number>)`.
- Unit test for the `Say` handler's input validation.
- Policy test: `ENABLE_ROBLOX_MONETIZATION == false` and `ALLOW_EXTERNAL_PAYMENT_LINKS == false`.
- A mutation-style test proving the Place Audit script detects an injected `UnGroup` fixture.

## 3. Files a later implementation would own
- **New:** `docs/security/INCIDENT_UNGROUP.md`, an audit script (for example `tools/security/place-audit.*`), and `tests/security/*`.
- **Roblox:** `apps/roblox/src/server/Core/SecurityAndPersistence.luau`, `Core/SessionManager.luau`, `apps/roblox/src/client/Main.client.luau`, `AdventureClient.client.luau`, `apps/roblox/tools/release/ROBLOX_RELEASE_CHECKLIST.md`, and the dormant Social, Collaboration, Coop and Avatar services (decide or retire).
- **Docs:** `docs/v06/safety/CHILD_PRIVACY_AND_PLATFORM_BOUNDARIES.md`, `docs/v06/safety/roblox-social/ROBLOX_SOCIAL_AND_COMMUNITY_SAFETY.md`.
- **Web and API:** `apps/web/src/App.tsx`, `apps/web/src/launch/RobloxLaunchPage.tsx`, `functions/api/{checkout,webhook,verify-session}.ts`, `apps/api/db/schema.sql`, `apps/api/src/consent/index.ts`.

## 4. Dependencies
- **Studio or Creator Hub access** (human, or the MCP tools in a later non-read-only wave) for the Place Audit and for chat settings.
- **Roblox publishing** needs human approval, as the checklist states.
- Coordination with the monetization/commerce, release/QA and Roblox gameplay workers on the dormant services.
- The failing G3/G5/G6 tests and the v08/v13/v14 e2e suites should be triaged so the new security gates can run.
- Cloudflare resources if the webhook is to store state. Stripe configuration stays out of this wave.

## 5. Open gaps
- **Origin of UnGroup:** unknown. I have not seen the publish history, collaborator list, plugin list or installed assets.
- **Whether the live place is clean now:** NOT TESTED. Removal from the Studio copy does not prove the published place is clean.
- **Chat suppression, the phrase display and the `StreamingEnabled` behaviour:** NOT TESTED.
- **Legal and compliance:** age ratings, COPPA/GDPR-K, and Roblox policy for the 8–12 age range need human and counsel review.
- **Quick-chat wording and translations** (Arabic, French, Korean): need human review. I have invented none.
- **Whether `paid_cosmetics_enabled` defaults** match the owner's policy.
- **Whether the 7 failing tests** hide safety issues. I did not run them.
- **Web privacy claims** (no analytics, no personal information): not verified against the built app.

