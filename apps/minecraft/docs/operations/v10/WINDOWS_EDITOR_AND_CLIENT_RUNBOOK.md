# MiraVerse v1.0 Minecraft Bedrock — Windows Editor & Client Operations Runbook
**Owner:** `DX15` (Wave W4)

## 1. Host Environment Reality & Truthful Blocker
- **Current Build Host:** Linux `aarch64` (`Ubuntu 24.04`, NVIDIA GB10 128 GB unified memory).
- **Windows Bedrock Requirement:** Minecraft: Bedrock Edition and Minecraft Bedrock Editor require a Windows 10/11 desktop host to generate a real LevelDB world directory (`db/`, `level.dat`, `levelname.txt`) and capture live in-game screenshots.
- **Strict Anti-Fabrication Rule:** We never rename a plain source zip to `.mcworld` and never fabricate synthetic screenshots.

## 2. Step-by-Step Windows Handoff Execution
1. Copy `apps/minecraft/dist/miraverse.mcaddon`, `apps/minecraft/dist/miraverse-sources.zip`, and `apps/minecraft/tools/release/export-windows-mcworld.ps1` to an authorized Windows 11 workstation with Minecraft: Bedrock Edition installed.
2. Double-click `miraverse.mcaddon` to import `MiraVerse BP` and `MiraVerse RP` into `com.mojang`.
3. Create or open the MiraVerse world in Minecraft Bedrock Editor, run `/scriptevent miraverse:build_all_districts`, verify all 6 regions (`HUB`, `LB`, `EG`, `IQ`, `KR`, `FR`), and run `export-windows-mcworld.ps1` to export `apps/minecraft/dist/miraverse-adventure.mcworld`.
4. Capture live HUD screenshots into `reports/minecraft-v10/screens/{hub,LB,EG,IQ,KR,FR}/` and gameplay video into `reports/minecraft-v10/video/`.
