# MiraVerse v0.8 Adult/Child Separation, Gift & Commerce Security Report (`CL07`, `CL08`, `CX07..CX10`, `CX15`)

- **No Default Demo Parent Session (`CX07`):** `ParentPortalPage` (`apps/web/src/parent/index.tsx`) initializes `signedInEmail` to `null`. Unauthenticated visitors see the guardian sign-in form rather than a pre-authenticated `parent.demo@miraverse.studio` state.
- **Adult Confirmation & Session Isolation (`C05..C07`):** Unauthenticated API checkout calls return `401`, expired sessions return `401`, and client price tampering is ignored in favor of authoritative server SKU pricing.
- **Stripe Test Mode Only (`C08..C10`, `C20`):** `COMMERCE_FLAGS.STRIPE_LIVE_ENABLED === false` and `COMMERCE_FLAGS.ENABLE_SUBSCRIPTIONS === false`. Webhook signatures are verified with HMAC-SHA256 and replayed webhook events are idempotently deduplicated.
- **Single-Use Gift Code Protection (`C11..C14`):** Gift codes (`MVGIFT-XXXX-XXXX-XXXX-XXXX`) are hashed at rest, redacted in logs (`MVGIFT-REDACTED-XXXX`), rejected on replay (`REDEEMED`), and rate-limited against brute-force attempts.
- **Two-Step Destructive Action Confirmation:** Profile deletion in `/parents` prompts for confirmation before erasing pseudonymous records, and `/passport` reset includes an immediate session undo buffer.
