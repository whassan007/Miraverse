# Adult-Only Web Commerce & Gift Redemption Report (`reports/v06/COMMERCE_TEST_MODE.md`)

- **Mode:** **Stripe Test Mode Only** (`STRIPE_LIVE_ENABLED = false`, `ENABLE_SUBSCRIPTIONS = false`, `ALLOW_NATIVE_GAME_UNLOCKS = false`).
- **Approved Web-Deliverable SKUs (`CX10`):**
  - `sku_byblos_storybook_pack` ($9.00 USD test mode) — Downloadable Bilingual Family Storybook & Printable Recipe Cards.
  - `sku_five_worlds_activity_kit` ($14.00 USD test mode) — Printable Five-World Craft & Vocabulary Activity Pack.
- **Single-Use Gift Codes (`CX11`):** High-entropy `MVGIFT-*` codes hashed with SHA-256, rate-limited, expiring, and redeeming exclusively to web-deliverable entitlements.
- **Test Verification:** `npx vitest run tests/e2e/commerce/commerce-c01-c20.test.ts` and `tests/web/e2e/v06/option-a-routes.test.ts` **PASS**.
