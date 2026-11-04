# MiraVerse v0.7 (Option A) — Operations, Licensing & Rollback Runbook (`DX15`)

## 1. Instant Rollback Procedure
- **Git Branch Rollback:** `git checkout main` (`5158471`) or reset `integration/miraverse-v0.6-option-a` to baseline `8115452`.
- **Cloudflare Pages Preview / Production:** Managed exclusively via `tools/deploy/deploy.sh check` and `tools/deploy/deploy.sh preview`. Never deploy to production without explicit creator instruction.
