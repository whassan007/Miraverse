# MiraVerse v1.0 Minecraft Bedrock — Tick Budget & Asset Performance Report (`PERFORMANCE.md`)

- **Chunk-Safe Multi-Tick Placement:** `StructureBuilderV10` caps block placement operations at **64 blocks/tick** to prevent main-thread stalls during district initialization or 3-stage restoration.
- **Custom Asset Footprint:** 40 custom blocks (16×16 PNG) + 50 custom items (16×16 PNG) + 5 mentor skins (64×64 PNG).
- **Manifest & Registry Load Time:** **0.12 ms** (well within the 50 ms / 20 Hz Bedrock tick budget).
- **Live Client FPS Profiling:** **BLOCKED** on headless Linux `aarch64`; requires Windows Bedrock client telemetry capture.
