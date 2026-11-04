# MiraVerse v0.4 Commerce Threat Model, COPPA Assessment & Platform Matrix (`reports/commerce/THREAT_MODEL_AND_COMPLIANCE.md`)

**Owner:** `CL10` (Stage `V4-10`)  
**Commerce Readiness State:** `TEST MODE COMPLETE / LIVE BLOCKED`

---

## 1. Threat Model & Mitigations Verified in Code

| Threat Vector | Mitigation Implemented | Verification Test |
|---|---|---|
| **Child Routed to Checkout** | Zero pricing, cart, or checkout links on `/`, `/play`, `/story`, or `/passport`. Storefront exists only under `/parents/shop`. | `C02`, `C04` |
| **Tampered Client Price** | `BillingService.createTestCheckoutSession` ignores `clientTamperedPriceCents` and resolves SKU prices strictly from `SERVER_CATALOG`. | `C06` |
| **Forged or Replayed Webhook** | `verifyStripeWebhookSignature` validates raw-body HMAC-SHA256; deduplicates both `event.id` and `order.fulfillmentKey`. | `C07`, `C08` |
| **Parallel Gift Code Race** | `GiftService.redeemGiftCodeAtomically` acquires per-digest exclusivity lock and transitions `ISSUED -> REDEEMED` atomically. | `C09` |
| **Raw Gift Code Leakage in Logs** | Only HMAC-SHA256 digest stored in DB; audit logs record masked hint `MVGIFT-****-****-****-XXXX` and apply `redactGiftCodeInText`. | `C19` |
| **Double Token Mint / Negative Spend** | `MiraTokenWalletService` uses append-only ledger with `idempotencyKey` (`earn:<profileId>:<questEventKey>`) and enforces `balanceAfter >= 0`. | `C11`, `C12` |
| **Cross-Account IDOR** | `OrderService`, `ChildProfileService`, and `MiraTokenWalletService` verify `adultAccountId` ownership on every read/write. | `C13` |

---

## 2. Cross-Platform Entitlement Boundary Matrix

| Offering / Currency | Web (`apps/web`) | Roblox (`apps/roblox`) | Minecraft Bedrock (`apps/minecraft`) |
|---|---|---|---|
| **5 Country Story Chapters** | **100% Free** | **100% Free** | **100% Free** |
| **Web Parent Purchases (Stripe Test)** | **Web Only** | **Forbidden / Not Synced** | **Forbidden / Not Synced** |
| **Web Single-Use Gift Codes** | **Web Only** | **Forbidden / Not Synced** | **Forbidden / Not Synced** |
| **Earned Mira Tokens** | **Web Only** | **Roblox-Local Only** | **Bedrock-Local Only (Never Minecoins)** |
