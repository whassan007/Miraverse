# MiraVerse v0.8 Content & Platform Truth Contract (`CL03`, `CL04`, `CL13`, `CX03`, `CX10`)

## 1. Platform Availability Truth Matrix
| Country | Chapter Title | Roblox Status | Minecraft Bedrock Status | Web Story & Souvenir Passport |
|---|---|---|---|---|
| **Lebanon (`LB`)** | *Summer at Teta's* (Byblos) | **RC1 Flagship** (`apps/roblox/dist/miraverse.rbxlx` verified; public Place ID pending human creator publish) | **RC2 Companion** (`/downloads/miraverse.mcaddon` downloadable; requires Bedrock v1.21.50+) | **Live** (15-scene `ar-LB` story + local Passport stamp) |
| **Egypt (`EG`)** | *Lanterns of the Nile* (Cairo) | **RC3 Expansion** (Luau pack compiled; queued for native validation) | **RC3 Expansion** (Included in `.mcaddon` structure/item pack) | **Live** (15-scene `ar-EG` story + local Passport stamp) |
| **Iraq (`IQ`)** | *Palms of the Tigris* (Baghdad) | **RC3 Expansion** (Luau pack compiled; queued for native validation) | **RC3 Expansion** (Included in `.mcaddon` structure/item pack) | **Live** (15-scene `ar-IQ` story + local Passport stamp) |
| **South Korea (`KR`)** | *Moonlight Over the Hanok* (Jeonju) | **RC3 Expansion** (Luau pack compiled; queued for native validation) | **RC3 Expansion** (Included in `.mcaddon` structure/item pack) | **Live** (15-scene `ko` story + local Passport stamp) |
| **France (`FR`)** | *The Golden Boulangerie of Lyon* | **RC3 Expansion** (Luau pack compiled; queued for native validation) | **RC3 Expansion** (Included in `.mcaddon` structure/item pack) | **Live** (15-scene `fr` story + Web 3D preview + local stamp) |

## 2. Reconciled Truth-in-Advertising Guardrails (`packages/contracts/v08/index.ts`)
- **No Fake Browser Roblox Claim:** Primary CTA states `▶ Play free on Roblox` and discloses that the free Roblox app and a Roblox account are required.
- **No Fake Cross-Platform Sync Claim:** `/passport` and `/play/LB` state clearly that browser souvenir stamps live in `localStorage`, whereas Roblox quest progress and earned Mira Tokens live in Roblox `DataStoreService`.
- **No Contradictory "Zero Network Calls" Claim:** `/about` accurately distinguishes local-only guest story/passport browsing from adult-gated `/api/checkout` Stripe Test Mode calls.
- **No Unsubstantiated Legal Certification Claim:** `/about` and the footer state that MiraVerse is designed with child-privacy and data-minimization safeguards while formal third-party legal certification remains pending.
