# MiraVerse v1.0 Minecraft Bedrock — Packaging & Import Report (`PACKAGING_AND_IMPORT.md`)

| Artifact | Path | Status | Size (Bytes) | SHA-256 | Notes |
|---|---|---|---|---|---|
| **Bedrock Add-On (`BP + RP`)** | `apps/minecraft/dist/miraverse.mcaddon` | **READY_AND_VERIFIED** | 198565 | `2baefc70e9c9ea0c565296abd222e6d880d5389b25c11becbbc1eb9974886fa7` | Verified by Gate G5 & `DX13` |
| **Source Prefabs & Assets Archive** | `apps/minecraft/dist/miraverse-sources.zip` | **READY_AND_VERIFIED** | 97202 | `5cfeafa9fa835831f0741211ae1993cf11dd39d18dec3d825e1137626299d754` | Contains all `.mcstructure.json`, `.bbmodel`, PNGs, and TS sources |
| **Playable Exported World (`.mcworld`)** | `apps/minecraft/dist/miraverse-adventure.mcworld` | **BLOCKED_REQUIRES_WINDOWS_BEDROCK_EDITOR_HOST** | N/A | N/A | Requires Windows 10/11 Bedrock Editor/Client LevelDB export via `apps/minecraft/tools/release/export-windows-mcworld.ps1` |
