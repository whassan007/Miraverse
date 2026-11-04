--!strict
-- MiraVerse v0.4 Roblox Client HUD, ProximityPrompt Listener & Safe Quick-Chat
-- Owner: CL05
local TextChatService = game:GetService("TextChatService")
local NpcAnimator = require(game:GetService("ReplicatedStorage"):WaitForChild("MiraVerse"):WaitForChild("npc"):WaitForChild("NpcAnimator"))

-- Child-safety policy: no free-text chat or external purchase prompts
pcall(function()
	local chatWindow = TextChatService:FindFirstChildOfClass("ChatWindowConfiguration")
	if chatWindow then
		chatWindow.Enabled = false
	end
end)

local _loadedClips = NpcAnimator.CLIPS
