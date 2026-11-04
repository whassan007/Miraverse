# Parent Commerce, Refund, Gift & Child-Privacy Policy Specification (`docs/policy/commerce/COMMERCE_POLICY_V04.md`)

**Owner:** `CL10` (Stage `V4-10`)

1. **Merchant & Live-Charge Gate:** Stripe integration is restricted to **Test Mode** (`STRIPE_LIVE_ENABLED = false`, `ENABLE_SUBSCRIPTIONS = false`). Live charges require operator legal entity signoff, tax nexus configuration, and final privacy certification.
2. **Refund & Dispute Handling:** Refunded orders transition `FULFILLED -> REFUNDED`; unredeemed gifts transition `ISSUED -> REVOKED`; already-redeemed gifts transition to `REFUND_REVIEW` rather than silent confiscation.
3. **COPPA & Data Minimization:** Guest child play collects zero PII. Optional pseudonymous child profiles require adult authentication, explicit consent record (`consent_records`), and one-click JSON export and deletion.
