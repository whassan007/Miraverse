# MiraVerse v0.1.0

MiraVerse is an open-source, multi-platform cultural exploration environment designed for children, families, and educators. It combines dialect-authentic storytelling with immersive, hands-on challenges across the Web, Roblox, and Minecraft Bedrock.

---

## Overview

MiraVerse v0.1.0 features 5 rich country experiences:
- **Lebanon (`LB`)**: Explore Byblos and Beirut through Levantine Arabic (`ar-LB`).
- **Egypt (`EG`)**: Discover historic Cairo, the Nile, and artisan markets through Egyptian Arabic (`ar-EG`).
- **Iraq (`IQ`)**: Journey through Mesopotamia and Baghdad courtyards through Iraqi Arabic (`ar-IQ`).
- **South Korea (`KR`)**: Experience Jeonju hanok villages and seasonal food traditions through Korean (`ko`).
- **France (`FR`)**: Uncover Lyon gastronomy and architectural heritage through French (`fr`).

### Core Features
- **15-Scene Dialect Stories**: Each country includes a full 15-scene narrative featuring cultural archetypes (protagonists, elder mentors, bridge parents, host peers, diaspora peers) and curated vocabulary.
- **5 Playable Challenges Per Country**: 25 challenges in total spanning five distinct archetypal mechanics (`build`, `cook`, `gather`, `trade`, `word`) playable across Web, Roblox, and Minecraft Bedrock.
- **Local Passport Souvenir Stamps**: Learners earn cryptographic or SVG souvenir stamps stored entirely locally in their digital Passport as they complete each cultural quest.

---

## Build, Validation, Compilation & Swarm Commands

MiraVerse uses a deterministic monorepo structure. All verification and compilation workflows run locally without network egress:

### 1. Installation
Install locked repository dependencies:
```bash
npm ci
```

### 2. Validation
Run structural schema validation against content schemas:
```bash
npm run validate
```

Run comprehensive release validation (schema, cross-reference integrity, dialect checks, and asset manifests):
```bash
npm run validate:release
```

### 3. Compilation
Compile raw story and challenge content into platform-specific bundles:
```bash
npm run compile
```

### 4. Full Release Verification
Execute full build pipeline across Web, Minecraft Bedrock, and Roblox, plus test suites:
```bash
npm run check:release
```

### 5. Swarm Orchestration
To execute or verify parallel agent waves locally:
```bash
./swarm/run.sh
```

---

## Privacy & Child Safety Posture

MiraVerse is engineered to adhere strictly to COPPA, GDPR-K, and modern youth-safety best practices:
- **Zero Accounts or Registration**: No username, password, email, or personal identity is ever collected.
- **Zero Analytics or Telemetry**: No tracking pixels, Google Analytics, cookies, or telemetry pings exist anywhere in the codebase.
- **Zero External Network Dependencies**: Web builds run entirely offline without external font or script CDNs (all fonts and assets are locally bundled).
- **Zero Free-Text Chat**: Open free-text communication is disabled across all platforms to prevent unmoderated interaction and protect young users.
- **Local-Only Persistence**: Progress and passport stamps are never sent to a remote server. They reside purely on the local device:
  - **Web**: Local browser `localStorage`.
  - **Roblox**: Session-only in-memory state.
  - **Minecraft Bedrock**: Local dynamic properties within the world save.

---

## Human Cultural Review Status

### Current Status: `AI_REVIEWED_PENDING_HUMAN`

All story texts, dialect glosses, character archetypes, and cultural challenges in v0.1.0 have been generated and vetted via automated structural and linguistic pipelines. 

Before public release, all content must undergo formal review and approval by native speakers, community elders, and heritage educators. Community members interested in contributing to the cultural review process are invited to inspect the content under `packages/content/`.

---

## Platform Testing Disclosures

MiraVerse identifies build maturity across three explicit milestone tiers:

1. **`BUILDABLE_RC`**:
   The release candidate compiles cleanly without errors in headless CI/CD, passes structural schema validation, and satisfies all TypeScript and linter checks.
2. **`PLATFORM_VERIFIED_RC`**:
   The candidate has been manually or automatedly exercised on runtime targets: modern web browsers (Chrome, Safari, Firefox), Roblox Studio/Client, and the Minecraft Bedrock engine, confirming functional mechanics and responsive rendering.
3. **`PUBLIC_RELEASE_APPROVED`**:
   The release has achieved `PLATFORM_VERIFIED_RC` status, completed human cultural and dialect review, passed accessibility audits, and received child-safety compliance certification.
