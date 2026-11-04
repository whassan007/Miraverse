# MiraVerse v0.4 — Parent Commerce, Webhook, Gift & Privacy Operations Runbook

**Owner:** `DX08` (Stage `V4-12`, Local DGX Spark `qwen/qwen3-coder-next`, Latency: `7513 ms`)

## 1. Default Safe-Launch Posture
- `STRIPE_LIVE_ENABLED = false` (Test mode only until operator legal, privacy, tax, and merchant signoff).
- `ENABLE_SUBSCRIPTIONS = false` (One-time bundles and printable gift codes only).
- `ENABLE_ROBLOX_MONETIZATION = false` and `ENABLE_MINECRAFT_MARKETPLACE = false`.

## 2. Stripe Webhook Verification & Replay Handling
1. Endpoint: `POST /api/billing/stripe-webhook` requires raw request body HMAC-SHA256 verification against `STRIPE_WEBHOOK_SECRET`.
2. Every webhook event is deduplicated by both `event.id` (`webhook_events` table) and `order.fulfillmentKey` so retries never issue duplicate entitlements or gift codes.
3. On `charge.refunded` or `charge.dispute.created`, unredeemed gift codes transition immediately to `REVOKED`; already-redeemed gift codes transition to `REFUND_REVIEW` for human support review rather than silent child-disrupting confiscation.

## 3. Parent Privacy Requests (Export & Deletion)
- Authenticated adults can trigger immediate JSON export (`POST /api/parents/data-export`) or permanent pseudonymous profile + token ledger deletion (`DELETE /api/parents/profiles/:id`) directly from `/parents/settings`.

## 4. DGX Spark Incident Response Checklist
**MiraVerse v0.4 Incident Response & Data Management Runbook**  
*For Stripe Webhooks, Gift Code Support, and Parent Data Deletion*

- **Stripe Webhook Failure Handling**:  
  Monitor `/webhooks/stripe` logs for `4xx/5xx` responses or missed events (e.g., `invoice.paid`, `customer.subscription.deleted`). On failure: (1) Retry up to 3× with exponential backoff; (2) Log event ID + payload to `stripe_webhook_failures` table; (3) Alert on-call via PagerDuty if >5 failures in 10 min. Use Stripe CLI replay (`stripe trigger`) for manual reprocessing.

- **Gift Code Redemption Validation**:  
  On gift code redemption, verify: (a) code exists and is unexpired; (b) not previously redeemed; (c) user account is active & not banned. If invalid, return `400 Bad Request` with error `gift_code_invalid`. Log redemption attempts (success/failure) to `gift_code_logs`. For bulk issues (e.g., mass invalid codes), pause redemption via `/admin/gift-codes/disable` and notify support team.

- **Parent Data Deletion (GDPR/CCPA)**:  
  Upon verified deletion request: (1) Trigger `POST /api/v0/admin/delete-parent-data` with parent ID; (2) System anonymizes personal fields in `parents`, `children`, and `subscriptions`; (3) Flags Stripe customer as `deleted=true` (via metadata); (4) Schedules async purge of raw logs after 30 days. Confirm completion via email + log entry in `data_deletion_audit`.

- **Cross-Service Data Consistency Checks**:  
  Run daily cron job (`/scripts/consistency-check`) to reconcile: Stripe subscription status ↔ MiraVerse active status, gift code redemption counts ↔ DB records, and parent deletion flags ↔ anonymization timestamps. Flag mismatches >24h old for manual review.

- **Escalation Path for Critical Failures**:  
  - Tier 1 (Self-service): Use `/status` endpoint to check service health.
