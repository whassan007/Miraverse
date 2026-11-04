# MiraVerse Global v1.1 — Windows Bedrock Client Capture Guide & Host Status (`AG20`)

## 1. Truthful Host Environment Disclosure
- **Current Execution Host:** Linux `aarch64` (`Ubuntu 24.04`, NVIDIA GB10, headless terminal environment).
- **Windows Minecraft Bedrock Editor / Client Availability on Host:** **UNAVAILABLE (`BLOCKED: native runtime missing`)**.
- **Red-Line Compliance:** Per Section A & Section I of the specification, we do **not** rename a ZIP archive to `.mcworld` and we do **not** fabricate synthetic renders claiming to be live Windows Minecraft Bedrock GUI screenshots.

## 2. Prepared Windows Editor Handoff & Required Captures
When `apps/minecraft/editor/export-windows-mcworld.ps1` is executed on the paired Windows 11 Bedrock workstation:
1. Export the LevelDB world to `apps/minecraft/dist/miraverse-global.mcworld`.
2. Capture live in-engine screenshots for *The Atlas Observatory* Hub, each of the 11 destinations (`LB`, `IQ`, `EG`, `FR`, `KR`, `DE`, `CN`, `JP`, `RU`, `UA`, `MA`), the 4 age-track UI modes (`5-7`, `8-10`, `11-13`, `14-17`), RTL Arabic custom UI (`ar-LB`, `ar-MA`), and *The Circle of Stories* finale inside `reports/minecraft-global/client-captures/`.