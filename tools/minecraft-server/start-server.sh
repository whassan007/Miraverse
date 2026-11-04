#!/usr/bin/env bash
# ============================================================================
# MiraVerse v1.7.0 — One-Command Local Minecraft Server Bootstrap
# (`tools/minecraft-server/start-server.sh`)
#
# Supports:
#   1. PaperMC / Vanilla Java 1.21.11 Server on port 25565 (compatible with the
#      configured `minecraft-mcp-server` bot `MiraBot` and `deploy-mcp-world.mjs`)
#   2. Docker (`itzg/minecraft-server` or `itzg/minecraft-bedrock-server`)
# ============================================================================
set -euo pipefail

MODE="${1:-paper}"
SERVER_DIR="${MC_SERVER_DIR:-/home/wael/Code/Miraverse/.minecraft-server}"
JAVA_BIN="${JAVA_BIN:-/home/wael/.local/bin/java}"
PORT="${MC_PORT:-25565}"

mkdir -p "$SERVER_DIR"

cat > "$SERVER_DIR/eula.txt" <<EOF
eula=true
EOF

cat > "$SERVER_DIR/server.properties" <<EOF
server-port=${PORT}
online-mode=false
gamemode=creative
difficulty=peaceful
level-type=minecraft\:flat
spawn-protection=0
enable-command-block=true
enable-rcon=true
rcon.port=25575
rcon.password=miraverse
view-distance=16
simulation-distance=12
motd=MiraVerse v1.7.0 — 11 Countries & 21 Real-World DEM Destinations
EOF

cat > "$SERVER_DIR/ops.json" <<EOF
[
  {
    "uuid": "00000000-0000-3000-8000-000000000001",
    "name": "MiraBot",
    "level": 4,
    "bypassesPlayerLimit": true
  },
  {
    "uuid": "00000000-0000-3000-8000-000000000002",
    "name": "MiraArchitect",
    "level": 4,
    "bypassesPlayerLimit": true
  }
]
EOF

echo "Prepared Minecraft server config in: $SERVER_DIR"
echo "  - Port: $PORT"
echo "  - online-mode=false (allows MiraBot & MiraArchitect MCP bots to connect locally)"
echo "  - gamemode=creative, difficulty=peaceful, spawn-protection=0"
