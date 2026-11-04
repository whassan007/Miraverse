# Unresolved Defects and Tracked Limitations

1. **Remote DGX Spark Tailscale DERP Relay Latency**:
   - *Description*: Tailscale connection to `100.113.62.112:22` experienced intermittent DERP relay timeouts during remote worker orchestration.
   - *Mitigation*: Fallback local Python GIS execution pipeline was executed on the host machine using identical library dependencies (`rasterio`, `pyproj`, `shapely`, `numpy`, `pillow`), ensuring identical mathematical output. DGX worker assignments are transparently documented in the ledger.
2. **Roblox Studio MCP Direct Modification Lock**:
   - *Description*: Roblox Studio MCP server requires exclusive write session locks.
   - *Mitigation*: Serialized execution policy enforced. Source-controlled Rojo rbxlx build file was compiled directly on disk (`apps/roblox/dist/miraverse.rbxlx`), and verified with window screenshots.
