# Deterministic glTF 2.0 / GLB Asset Audit (`reports/assets/GLB_VALIDATION_REPORT.md`)

**Owner:** `DX05` (Local DGX Spark — `qwen/qwen3-coder-next`)

All 9 binary glTF 2.0 (.glb) assets successfully passed the magic header check (validating the `glTF` signature). Each asset also validated against version 2 of the specification, ensuring correct header structure and compatibility. Additionally, all assets met buffer alignment requirements and stayed within the specified size budget constraints.

| Asset ID | GLB Path | Magic `0x46546C67` | Version | Bytes | Animation Clips | Budget Status |
|---|---|---|---|---|---|---|
| `glb:hero_mira` | `/assets/models/hero_mira.glb` | `true` | `2` | `1616` | `12` | **PASS** |
| `glb:npc_mentor` | `/assets/models/npc_mentor.glb` | `true` | `2` | `1624` | `12` | **PASS** |
| `glb:world_hub` | `/assets/models/world_hub.glb` | `true` | `2` | `1452` | `0` | **PASS** |
| `glb:world_FR` | `/assets/models/world_FR.glb` | `true` | `2` | `1448` | `0` | **PASS** |
| `glb:world_LB` | `/assets/models/world_LB.glb` | `true` | `2` | `1444` | `0` | **PASS** |
| `glb:world_EG` | `/assets/models/world_EG.glb` | `true` | `2` | `1444` | `0` | **PASS** |
| `glb:world_IQ` | `/assets/models/world_IQ.glb` | `true` | `2` | `1448` | `0` | **PASS** |
| `glb:world_KR` | `/assets/models/world_KR.glb` | `true` | `2` | `1448` | `0` | **PASS** |
| `glb:landing_diorama` | `/assets/models/landing_diorama.glb` | `true` | `2` | `1480` | `0` | **PASS** |
