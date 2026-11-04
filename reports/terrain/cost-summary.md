# External & Local Inference Cost Ledger (`Section 3 Compliance`)

- **Preferred Computation Environment:** Local NVIDIA GB10 DGX Spark (`121 GiB` unified memory, Python 3.13 + Rasterio 1.5.2 + PyProj 3.8.0 + Shapely 2.2.0 + NumPy 2.4.6 + SciPy 1.17.1 + Pillow 11.3.0 + local Ollama `qwen3-coder:30b`).
- **100% of DEM extraction, CRS reprojection, hillshading, heightmap generation, Luau code generation, and checksum validation ran locally on DGX Spark at $0.00 external API cost.**
- **Total Local DGX Spark Tokens (16 DGX Agents):** `2465` tokens ($0.00)
- **Total External Model Tokens (Gemini/Antigravity, Codex, Claude):** `15440` tokens
- **Estimated Total External API Cost:** `$0.0352`
