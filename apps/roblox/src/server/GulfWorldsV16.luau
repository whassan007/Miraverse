--!strict
-- MiraVerse v1.6 (CX03) — 6 Gulf Destination Portals, 30 Quest Act Engines & Co-Op Checkpoint Server (apps/roblox/src/server/GulfWorldsV16.luau)
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GulfV16 = require(ReplicatedStorage:WaitForChild("MiraVerse"):WaitForChild("GulfV16"))

local GulfWorldsV16 = {}
GulfWorldsV16.ActivePlayerProgress = {}

function GulfWorldsV16.CompleteQuestActIdempotent(userId: number, actId: string, ageTier: string): { ok: boolean, newlyAwarded: boolean, tokens: number, artifactId: string? }
  local spec = GulfV16.QUEST_ACTS[actId]
  if not spec then
    return { ok = false, newlyAwarded = false, tokens = 0, artifactId = nil }
  end
  GulfWorldsV16.ActivePlayerProgress[userId] = GulfWorldsV16.ActivePlayerProgress[userId] or { completed = {}, tokens = 0, scriptPref = "Arab", ageTier = ageTier or "8-10" }
  local state = GulfWorldsV16.ActivePlayerProgress[userId]
  if state.completed[spec.idempotencyKey] then
    return { ok = true, newlyAwarded = false, tokens = state.tokens, artifactId = spec.rewardArtifact }
  end
  state.completed[spec.idempotencyKey] = true
  state.tokens = state.tokens + spec.rewardTokens
  return { ok = true, newlyAwarded = true, tokens = state.tokens, artifactId = spec.rewardArtifact }
end

return GulfWorldsV16
