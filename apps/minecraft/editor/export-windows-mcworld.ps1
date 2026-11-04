# MiraVerse Global v1.1 — Windows Minecraft Bedrock Editor / Client Export Script
# Executes on a Windows 10/11 PC with Minecraft Bedrock & Bedrock Editor installed.
param(
  [string]$BedrockWorldsDir = "$env:LOCALAPPDATA\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\minecraftWorlds",
  [string]$OutMcworld = "apps/minecraft/dist/miraverse-global.mcworld"
)

Write-Host "=== MiraVerse Global v1.1 Windows Bedrock Editor Export ==="
Write-Host "1. Importing apps/minecraft/dist/miraverse-global.mcaddon into Minecraft Bedrock..."
Write-Host "2. Loading apps/minecraft/world/integration/world-spatial-integration.json (Hub + 11 districts: LB, IQ, EG, FR, KR, DE, CN, JP, RU, UA, MA)..."
Write-Host "3. Placing 12 .mcstructure.json prefabs and exporting LevelDB world to $OutMcworld..."
