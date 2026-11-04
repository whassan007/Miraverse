# MiraVerse v0.7 (Option A) — Roblox Build, Studio Validation & Release Procedure (`CL09`)

1. **Deterministic Rojo Build:** `npm run build:roblox` produces `apps/roblox/dist/miraverse.rbxlx` via Rojo 7.7.1.
2. **Studio MCP Inspection:** Connect via `rbx-studio-mcp` or native Studio MCP server on Windows/macOS to run playtest verification.
3. **Publish Boundary:** Unpublished by default (`STAGING_UNPUBLISHED_HUMAN_APPROVAL_REQUIRED`). Never invent Place/Universe IDs.
