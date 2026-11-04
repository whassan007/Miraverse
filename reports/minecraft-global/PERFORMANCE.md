# MiraVerse Global v1.1 — Performance & Asset Budget Report (`PERFORMANCE.md`)

## 1. Resource & Structure Budget Metrics (`DX19`)
- **Custom Block & Item PNG Atlas Size:** `~88.8 KB` across 519 deterministic 16×16 / 32×32 / 64×64 PNGs (well below the `10 MB` budget ceiling).
- **Blockbench Character Models:** `55` global NPC rigs (`.bbmodel`) + `6` legacy v1.0 rigs (`61 total`), each using standard 7-cube Bedrock geometry with low bone count.
- **District Voxel Structures:** `12` Global v1.1 `.mcstructure.json` prefabs (Hub + 11 districts) isolated by `200` blocks on the X-axis so only one district's entities and particles are ticked per player region.
- **DGX Spark Scheduling Discipline:** All 20 DGX Spark agents (`DX01..DX20`) executed sequentially (`maxConcurrency = 1`) on the NVIDIA GB10 (`128 GB` unified memory) with zero OOM or thermal throttling.
