# MiraVerse v0.7 — Option A Economy, Web Commerce & Native Token Boundaries (`CL14`)

## 1. Strict Separation of Platform Economies
| Surface | Currency / SKU Type | Fulfillment Target | Cross-Platform Sync |
|---|---|---|---|
| **Roblox Flagship** | Earned-only **Roblox Mira Tokens** | In-experience cosmetics & plot decorations stored in `DataStoreService` | **NONE** (No Robux conversion; no web Stripe unlock) |
| **Minecraft Bedrock Companion** | Earned-only **Bedrock Mira Tokens** | World-local cultural keepsakes stored in Bedrock Dynamic Properties | **NONE** (No Minecoins conversion; no web Stripe unlock) |
| **MiraVerse Website (`/shop`, `/gifts`)** | Adult-only **Stripe Test Mode** web SKUs | Downloadable Printable Cultural Storybook & Family Activity Packs + Web Gift Codes | **NONE** (Does not grant Roblox GamePasses or Minecraft add-on unlocks) |

## 2. Web Stripe Order Lifecycle (Test Mode Only)
- `STRIPE_LIVE_ENABLED = false`, `ENABLE_SUBSCRIPTIONS = false`.
- Orders transition deterministically: `CREATED -> PENDING -> PAID -> FULFILLED` (and `REFUNDED / DISPUTED / CANCELED` on webhook reversal).
- Every webhook event verifies raw-body HMAC signature (`Stripe-Signature`) and deduplicates by `event.id` and `idempotency_key`.
