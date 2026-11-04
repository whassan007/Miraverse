# CODEX-10: Tests, CI, checksums and the 7 existing test failures

Backend: codex (default)

**CODEX-10 — Read-only report**

No files edited, commits created, assets added, or deployments run. Roblox runtime behavior: **NOT TESTED**.

**Findings**

- **Seven failures remain unidentified.** No failure log naming seven failing tests was found in the inspected repository reports. Historical green reports cannot establish current status; for example, [V05_BASELINE.md](reports/V05_BASELINE.md) records 109 passing tests.
- **Checksum verification passed:** executing the read-only [verify-non-destructive.mjs](tools/v12/migration/verify-non-destructive.mjs) confirmed all 21 files match [baseline-snapshot.json](tools/v12/migration/baseline-snapshot.json). This proves byte preservation against that snapshot only.
- **Roblox coverage is structural.** The [integration suite](tests/roblox/integration/social-avatar/social-avatar-integration.test.ts) and [security suite](tests/roblox/security/social-avatar/social-avatar-security.test.ts) assert source-string presence. They do not exercise persistence, permissions, replay rejection, invitations, or rewards.
- **CI lacks Roblox artifact validation.** Neither [ci.yml](.github/workflows/ci.yml) nor [ci-v04.yml](.github/workflows/ci-v04.yml) invokes `build:roblox`, although [package.json](package.json) defines it. Browser tests import Chromium, but neither workflow explicitly installs its browser dependencies.
- **The full suite conflicts with this read-only wave:** [gates.test.ts](tests/integration/gates.test.ts) runs the compiler, writes fixtures, and creates temporary commits; [web-e2e.test.ts](tests/integration/web-e2e.test.ts) writes screenshots. Those suites were not executed.
- **Checksum coverage is incomplete:** compiler determinism checks only the outputs enumerated in [gates.test.ts](tests/integration/gates.test.ts), omitting `V04Bundle.luau` and knowledge exports. [v04-meta.ts](tools/compiler/v04-meta.ts) uses a truncated source hash; it is not a complete artifact checksum manifest.

**Implementation-ready specification — proposed**

1. **Establish the seven-failure baseline.** In an authorized writable checkout, use `npm ci`, build required artifacts, install Chromium, and run Vitest with JSON and JUnit output. Record commit, tool versions, commands, exit codes, and every failing test’s full name, expected/actual result, classification, and owner. Reconcile the observed count with seven before claiming resolution.
2. **Repair failures individually.** Add a regression assertion for each confirmed defect. Where expectations are obsolete, reconcile them with the current route contract; the older [web journey](tests/integration/web-e2e.test.ts) and [v13 journey](tests/web/e2e/v13/v13-portal-transformation.test.ts) expect different `/play/LB` interfaces. Do not skip tests or refresh snapshots merely to obtain green results.
3. **Separate checks by evidence type.** Create distinct static, build, browser, and Studio jobs. Add pinned Rojo tooling and a Roblox build artifact. Keep Studio results **NOT TESTED** until a human supplies runtime evidence.
4. **Strengthen integrity gates.** Verify the preserved baseline before generation. Generate sorted, full SHA-256 artifact manifests; compare both file sets and bytes across two isolated builds. Include Roblox and knowledge exports. Prevent normal CI from regenerating the baseline: [inventory.mjs](tools/v12/migration/inventory.mjs) currently overwrites it.
5. **Publish evidence on failure.** Upload machine-readable results and browser diagnostics even when checks fail; gate acceptance on zero unexplained failures.

**Later implementation ownership**

- CI and scripts: `.github/workflows/ci.yml`, `.github/workflows/ci-v04.yml`, `package.json`.
- Tests: `tests/roblox/**`, `tests/integration/gates.test.ts`, `tests/v12/suite/v12-enrichment.test.ts`, plus the seven confirmed failing test files.
- Integrity tooling: `tools/v12/migration/verify-non-destructive.mjs`; proposed artifact-manifest tooling and failure ledger. Preserve `baseline-snapshot.json`.

**Dependencies and open gaps**

- Required tooling is evidenced by [package.json](package.json), the workflows, and the Chromium imports above: Node/npm, locked dependencies, browser binaries, and Rojo. Studio access and human runtime evidence remain outstanding.
- Production fixes depend on the owners identified after failure triage; the seven root causes are currently **unverified**.
- Cultural accuracy, translations, question answers, and originality require human review. Preserve separate place, literary-work, mythology/folklore, and fictional-content classifications supported by [the knowledge schema](packages/knowledge-v12/index.ts). Checksums and non-empty-string assertions cannot establish factual accuracy or original authorship; enforce the requested original-only asset policy separately.

