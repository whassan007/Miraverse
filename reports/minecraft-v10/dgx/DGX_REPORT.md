# DGX Spark Hardware Benchmark & 20-Job Schedule (`reports/minecraft-v10/dgx/DGX_REPORT.md`)

- **Agent:** `DX01` (`qwen/qwen3-coder-next`)
- **Hardware:** `NVIDIA GB10, 580.178.04, 47, 32.97 W` (128 GB Unified Memory)
- **Measured Throughput:** `44.99 tokens/sec` (`978 ms`)
- **Concurrency Ceiling:** `1` (strictly sequential to prevent memory contention)
- **Probe Output:** Ready for sequential (concurrency=1) execution across DX01–DX20 on the local NVIDIA GB10 DGX Spark server for MiraVerse v1.0 Minecraft Bedrock benchmarking.
