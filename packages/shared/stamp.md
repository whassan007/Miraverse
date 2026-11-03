# MiraVerse Cross-Platform Souvenir Stamp Specification (`stamp.md`)

## 1. Format

```text
MV-<CC><chapter>-<NNNN>-<CCCC>
```

- Example: `MV-EG1-7K2Q-9X4B`
- `<CC>`: Two-letter uppercase `CountryId` (`LB`, `EG`, `IQ`, `KR`, `FR`).
- `<chapter>`: Positive integer chapter number (`1` in MiraVerse v0.1).
- `<NNNN>`: 4-character random nonce drawn from `ALPHABET`.
- `<CCCC>`: 4-character deterministic base-30 checksum drawn from `ALPHABET`.
- `ALPHABET`: `"23456789ABCDEFGHJKMNPQRSTVWXYZ"` (30 characters; omits `0`, `1`, `I`, `L`, `O`, `U` for readability).
- `SALT`: `"miraverse-v0"`

## 2. Deterministic FNV-1a 32-Bit Checksum Algorithm

Given `countryAndChapter = "<CC><chapter>"` (e.g. `"EG1"`) and 4-char uppercase `nonce = "<NNNN>"`:

1. Construct the payload string: `payload = "miraverse-v0" + countryAndChapter + nonce` (ASCII / UTF-8 bytes).
2. Compute unsigned 32-bit FNV-1a hash `h`:
   - Initialize `h = 0x811c9dc5` (`2166136261` unsigned 32-bit integer).
   - For each byte `b` (`0..255`) of `UTF-8(payload)`:
     - `h = h ^ b` (32-bit bitwise XOR)
     - `h = (h * 0x01000193) mod 2^32` (`16777619`, unsigned 32-bit modulo `4294967296` wrapping, e.g. `Math.imul(h ^ b, 16777619) >>> 0` in JS/TS or `bit32.bxor` + 64-bit/split-16-bit modulo `2^32` arithmetic in Luau).
3. Encode `h` into 4 characters (`CCCC`) in least-significant base-30 digit order:
   - Initialize `out = ""`
   - Repeat 4 times (`i = 1..4`):
     - `idx = h % 30` (0-based index in `0..29`, `ALPHABET[idx]` in JS/TS or ` string.sub(ALPHABET, idx + 1, idx + 1)` in 1-indexed Luau)
     - `out = out + ALPHABET[idx]`
     - `h = floor(h / 30)` (integer division)

## 3. Validation Rules

A stamp code is valid if and only if:
1. After trimming whitespace and uppercasing, it matches `^MV-(LB|EG|IQ|KR|FR)([1-9][0-9]*)-([23456789ABCDEFGHJKMNPQRSTVWXYZ]{4})-([23456789ABCDEFGHJKMNPQRSTVWXYZ]{4})$`.
2. In MiraVerse v0.1, `chapter` must be `1` (the canonical chapter in each country pack).
3. Every character of `NNNN` and `CCCC` belongs to `ALPHABET`.
4. Recomputing `CCCC` from `countryAndChapter` and `NNNN` yields an exact match with the code's `<CCCC>`.

## 4. Security & Privacy Constraint

- **Decorative Souvenir Only:** FNV-1a is a public, non-cryptographic checksum and is trivially forgeable. Stamp codes are strictly for collecting decorative Passport souvenir stamps across Web, Roblox, and Minecraft.
- Stamp codes must **never** grant entitlements, privileges, leaderboards, purchasable items, or anti-cheat guarantees. No shared secret may be embedded in client code.
- **Web Storage (`mv.stamps`):** Stored locally in `localStorage` under key `mv.stamps` as a JSON array of validated stamp records, deduplicated by `(country, chapter)`. Corrupt storage must be recovered gracefully without crashing, and users must have a local Clear/Reset button and clear disclosure that browser storage is local-only.

## 5. Golden Test Vectors

*(Worker X7 appends the 5 verified cross-platform golden test vectors below without altering sections 1–4.)*
