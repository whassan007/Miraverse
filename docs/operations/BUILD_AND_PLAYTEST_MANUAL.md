# MiraVerse v0.4 — Build, Verification & Playtest Manual

**Owner:** `DX08` (Local DGX Spark `qwen/qwen3-coder-next`, Latency: `7657 ms`)

## 1. One-Command Build & Verification Matrix

| Target | Build Command | Verification Command | Artifact Output |
|---|---|---|---|
| **Content & v0.4 Meta Compiler** | `npm run compile` | `npx tsx tools/compiler/v04-meta.ts` | `apps/web/src/generated/v04-meta.json` |
| **Web 3D Adventure & Storefront** | `npm -w apps/web run build` | `npx vitest run tests/e2e/web/web-3d-adventure.test.ts` | `apps/web/dist/` |
| **Parent Commerce & C01–C20 Suite** | `npm -w apps/api run build` | `npx vitest run tests/e2e/commerce/commerce-c01-c20.test.ts` | `apps/api/src/index.ts` |
| **Roblox 3D Experience** | `npm run build:roblox` | `npx vitest run tests/roblox/roblox-v04.test.ts` | `apps/roblox/dist/miraverse.rbxlx` |
| **Minecraft Bedrock Add-On & Structures** | `npm -w apps/minecraft run build` | `npx vitest run tests/integration/gates.test.ts` | `apps/minecraft/dist/miraverse.mcaddon` |

## 2. How to Play Web 3D Locally
1. Run `npm -w apps/web run dev -- --host 0.0.0.0 --port 5173`.
2. Open `http://localhost:5173/` for the **Cinematic 3D Homepage**.
3. Click **Play Free Now** (`/play/FR`) or **Explore 3D World Hub** (`/play`).
4. Use **WASD / Arrow Keys** (or the on-screen touch joystick) to move **Mira**, press **E / ACT** to converse with the Cultural Mentor, and complete all 5 quests (**Gather → Trade → Build → Cook → Word**) to restore the 3D landmark and earn your Chapter Souvenir Stamp + Mira Tokens.

## 3. DGX Spark Operational Notes
# MiraVerse v0.4 Cross-Platform Build & Test Checklist (Linux aarch64)

## Prerequisites
- [ ] OS: Ubuntu 22.04/24.04 or Debian Bullseye+ on ARM64 (aarch64)
- [ ] `build-essential`, `cmake ≥3.22`, `ninja-build`, `git`, `curl`, `wget`
- [ ] Python 3.10–3.12 + `pip` packages: `pyyaml`, `requests`, `tomli`, `rich`
- [ ] Node.js 20+ (for Web tooling)
- [ ] Java 17+ (for Minecraft Bedrock toolchain)

## 1. MiraVerse Core (Web 3D)
### Build
- [ ] Clone repo: `git clone --recurse-submodules https://github.com/MiraVerse/miraverse.git`
- [ ] Install dependencies:
  ```bash
  cd miraverse/web && npm ci
  ```
- [ ] Build Web assets:
  ```bash
  npm run build:prod
  ```
### Test
- [ ] Run unit tests: `npm test`
- [ ] Lint & type-check: `npm run lint && npm run check`
- [ ] Serve & verify in browser (e.g., `npx serve dist/`)

## 2. Roblox (.rbxlx)
### Build
- [ ] Install Roblox Studio (Linux via Wine or cross-platform builder if available); *note: native Linux support is limited*
- [ ] Ensure `roblox-packer` CLI installed:
  ```bash
  npm install -g @miraverse/roblox-packer
  ```
- [ ] Generate `.rbxlx`:
  ```bash
  cd miraverse/roblox && roblox-pack --input assets --output build/miraverse_v0.4.rbxlx
  ```

### Test
- [ ] Load in Roblox Studio (Windows/macOS host recommended)
- [ ] Verify asset integrity: `roblox-validate --file build/miraverse_v0.
