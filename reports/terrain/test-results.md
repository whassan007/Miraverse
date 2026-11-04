# Automated GIS, Luau & Integration Test Results

| Suite / Check | Command | Result | Details |
|---|---|---|---|
| **Rojo Place Build** | `npm run build:roblox` | **PASS** | Built `apps/roblox/dist/miraverse.rbxlx` |
| **Luau Static & Strict Check** | `node tools/v06/luau-checks/check-luau.mjs` | **PASS** | `57` Luau files verified |
| **Python GIS Validation** | `python3 tools/geo/validation/validate_geography.py` | **PASS** | `21` locations, `11` countries validated |
| **GIS & DEM Pipeline Vitest** | `npx vitest run tests/roblox/terrain-gis-pipeline.test.ts` | **PASS** | `9/9` tests (`63/63` control points, SHA-256 checksums, 0 spatial overlaps) |
| **Multi-Location World Vitest** | `npx vitest run tests/roblox/mount-lebanon-world.test.ts` | **PASS** | `16/16` tests (Byblos, Mount Lebanon, Beirut, travel graph, save migration) |
| **Release Gates (`G1`–`G12`)** | `npx vitest run tests/integration/gates.test.ts` | **PASS** | `12/12` gate tests |
