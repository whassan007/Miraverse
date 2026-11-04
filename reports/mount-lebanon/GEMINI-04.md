# GEMINI-04: Evidence & Runtime Verification Audit

- **Backend**: Gemini / Antigravity (`research` subagent `d433d6d7-ca22-40aa-a795-6c892c92c8a0`)
- **Worktree**: `/home/wael/Code/mv-wt-ml/GEMINI-04`
- **Status**: COMPLETED

---

## 1. Existing Byblos Screenshot & Video Evidence (`reports/evidence/`)

Under `reports/evidence/screenshots/byblos/` (13 JPEG images) and `reports/evidence/videos/byblos-frame-sequence.mp4` (1 MP4 video), visual evidence was captured during earlier macOS Roblox Studio sessions connected over the MCP bridge.

## 2. Analysis of the Automated Test Suite & Baseline Failures

On `fix/roblox-honest-play-button` (`e1b859b`), running `npx vitest run` executes 24 test files (137 tests):
- **23 test files (136 tests) PASS**.
- **1 test (`tests/integration/web-e2e.test.ts` — Gate G3) FAILS** with:
  `AssertionError: expected [ 'en', 'fr', 'ar-LB', 'ar-EG', …(10) ] to deeply equal [ 'en', 'fr', 'ar-LB', 'ar-EG', …(2) ]`
  because `apps/web/dist` in the working directory was built from `main` (`v1.6.0` with 14 languages), whereas `fix/roblox-honest-play-button` has the v1.4 web source (6 languages in `UI_LANGS`). Rebuilding `apps/web/dist` from the current branch or classifying this pre-existing environment/build artifact discrepancy is documented in our baseline verification.
- **Critical Gate G4 Constraint (`tests/integration/gates.test.ts:216`):**
  Gate G4 asserts `expect(sessionLuau).not.toMatch(/DataStoreService|HttpService/)`. Therefore, `SessionManager.luau` must never contain the literal strings `DataStoreService` or `HttpService` (even in comments); all DataStore persistence must remain encapsulated inside `ProgressService.luau`.

## 3. Studio MCP Runtime Status (`localhost:44755`)

- Process `rbx-studio-mcp` (PID `68615`) is listening on `127.0.0.1:44755`, and the Mac Studio host (`100.76.30.71`) is reachable on Tailscale (`ping` 5ms), but **no Roblox Studio client plugin is connected** to `localhost:44755` (`ss -tan | grep 44755` shows `LISTEN` with 0 active client connections).
- Per strict project rules ("Do not fabricate Studio test results, screenshots or agent activity", "If the required DataStore test environment is unavailable, report BLOCKED rather than PASS"), all live Studio gameplay tests and Studio screenshot captures must be truthfully reported as **BLOCKED** (with deterministic Luau VM behavioral tests and static geometry/build verification passing 100% locally).
