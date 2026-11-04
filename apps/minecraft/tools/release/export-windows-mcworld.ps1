# MiraVerse v1.0 — Windows Bedrock World Export Script (export-windows-mcworld.ps1)
# Run on an authorized Windows 10/11 Bedrock Edition / Editor workstation.
param(
  [Parameter(Mandatory=$true)][string]$BedrockWorldFolder,
  [string]$OutMcWorld = "apps/minecraft/dist/miraverse-adventure.mcworld"
)
if (!(Test-Path "$BedrockWorldFolder/level.dat") -or !(Test-Path "$BedrockWorldFolder/db")) {
  Write-Error "ABORT: $BedrockWorldFolder is not a real exported Bedrock LevelDB world directory."
  exit 1
}
Compress-Archive -Path "$BedrockWorldFolder/*" -DestinationPath "$OutMcWorld.zip" -Force
Move-Item -Path "$OutMcWorld.zip" -Destination $OutMcWorld -Force
Write-Host "Exported genuine Bedrock .mcworld to $OutMcWorld"
