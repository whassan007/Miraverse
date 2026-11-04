-- MiraVerse v0.4 Relational Commerce & Parent Identity Schema (PostgreSQL / SQLite compatible)
-- Owner: CX01 (Stage V4-06)

CREATE TABLE IF NOT EXISTS adult_accounts (
  account_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 1,
  stripe_customer_id TEXT UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS adult_sessions (
  session_id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES adult_accounts(account_id) ON DELETE CASCADE,
  csrf_token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS consent_records (
  consent_id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES adult_accounts(account_id) ON DELETE CASCADE,
  policy_version TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  granted_at TEXT NOT NULL,
  revoked_at TEXT
);

CREATE TABLE IF NOT EXISTS child_profiles (
  profile_id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES adult_accounts(account_id) ON DELETE CASCADE,
  consent_id TEXT NOT NULL REFERENCES consent_records(consent_id),
  nickname TEXT NOT NULL,
  avatar_variant TEXT NOT NULL DEFAULT 'mira_classic',
  paid_cosmetics_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  sku TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  description_en TEXT NOT NULL,
  economy TEXT NOT NULL CHECK (economy IN ('EARNED_MIRA_TOKENS', 'PARENT_PURCHASE')),
  product_type TEXT NOT NULL,
  is_giftable INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS prices (
  price_id TEXT PRIMARY KEY,
  sku TEXT NOT NULL REFERENCES products(sku),
  unit_amount_cents INTEGER,
  currency TEXT,
  mira_token_cost INTEGER,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES adult_accounts(account_id),
  sku TEXT NOT NULL REFERENCES products(sku),
  unit_amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  is_gift INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  stripe_checkout_session_id TEXT UNIQUE,
  fulfillment_key TEXT UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_events (
  event_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(order_id),
  event_type TEXT NOT NULL,
  processed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entitlements (
  entitlement_id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES adult_accounts(account_id),
  sku TEXT NOT NULL REFERENCES products(sku),
  source_order_id TEXT REFERENCES orders(order_id),
  source_gift_id TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  granted_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gift_codes (
  gift_id TEXT PRIMARY KEY,
  code_digest TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL REFERENCES products(sku),
  purchaser_account_id TEXT NOT NULL REFERENCES adult_accounts(account_id),
  order_id TEXT NOT NULL UNIQUE REFERENCES orders(order_id),
  status TEXT NOT NULL CHECK (status IN ('ISSUED', 'REDEEMED', 'EXPIRED', 'REVOKED', 'REFUND_REVIEW')),
  redeemed_by_account_id TEXT REFERENCES adult_accounts(account_id),
  redeemed_at TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS token_ledger (
  entry_id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES child_profiles(profile_id) ON DELETE CASCADE,
  operation TEXT NOT NULL CHECK (operation IN ('QUEST_EARN', 'COSMETIC_SPEND', 'ADMIN_CORRECTION')),
  delta INTEGER NOT NULL,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  reason_key TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
  audit_id TEXT PRIMARY KEY,
  actor_account_id TEXT,
  action TEXT NOT NULL,
  target_id TEXT,
  redacted_meta_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
