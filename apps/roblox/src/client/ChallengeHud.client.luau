--!strict
-- Shows challenge goals, feedback and progress sent by the server.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local UI = require(script.Parent.UI)

local gui = UI.make("ScreenGui", { Name = "MiraVerseChallengeHud", ResetOnSpawn = false }, Players.LocalPlayer:WaitForChild("PlayerGui"))
local panel = UI.panel(gui, UDim2.fromScale(0.5, 0.13), UDim2.fromScale(0.25, 0.75))
panel.Visible = false
local goalLabel = UI.label(panel, "", UDim2.fromScale(0.94, 0.42), UDim2.fromScale(0.03, 0.04))
local detailLabel = UI.label(panel, "", UDim2.fromScale(0.94, 0.42), UDim2.fromScale(0.03, 0.52))

local COLORS = {
	ok = Color3.fromRGB(150, 240, 170),
	error = Color3.fromRGB(255, 170, 150),
	info = Color3.fromRGB(255, 255, 255),
}

local function describeProgress(p: any): string?
	if type(p) ~= "table" then
		return nil
	end
	if type(p.remaining) == "number" then
		return string.format("Blocks left: %d", p.remaining)
	end
	if type(p.step) == "number" and type(p.total) == "number" then
		return string.format("Step %d of %d", p.step, p.total)
	end
	local have, need = 0, 0
	for _, v in p do
		if type(v) == "table" and type(v.have) == "number" and type(v.need) == "number" then
			have += v.have
			need += v.need
		end
	end
	if need > 0 then
		return string.format("Collected %d of %d", have, need)
	end
	return nil
end

local remotes = ReplicatedStorage:WaitForChild("MiraVerseRemotes")
remotes:WaitForChild("ChallengeEnded").OnClientEvent:Connect(function()
	panel.Visible = false
end)
-- Mentor dialogue and station hints.
local dialogue = UI.panel(gui, UDim2.fromScale(0.6, 0.3), UDim2.fromScale(0.2, 0.42))
dialogue.Visible = false
dialogue.ZIndex = 5
local speaker = UI.label(dialogue, "", UDim2.fromScale(0.9, 0.2), UDim2.fromScale(0.05, 0.04))
local nativeLine = UI.label(dialogue, "", UDim2.fromScale(0.9, 0.24), UDim2.fromScale(0.05, 0.25))
local englishLine = UI.label(dialogue, "", UDim2.fromScale(0.9, 0.24), UDim2.fromScale(0.05, 0.5))
local okButton = UI.button(dialogue, "OK", UDim2.fromScale(0.2, 0.17), function()
	dialogue.Visible = false
end)
okButton.Position = UDim2.fromScale(0.4, 0.79)
okButton.ZIndex = 6

remotes:WaitForChild("DialogueShown").OnClientEvent:Connect(function(d: any)
	if type(d) ~= "table" then
		return
	end
	speaker.Text = tostring(d.name or "")
	nativeLine.Text = tostring(d.native or "")
	englishLine.Text = if d.finished then "You did it! Thank you for your help." elseif d.nextLabel then tostring(d.english or "") .. " Next: " .. tostring(d.nextLabel) else tostring(d.english or "")
	dialogue.Visible = true
end)

speaker.ZIndex, nativeLine.ZIndex, englishLine.ZIndex = 6, 6, 6

local HINTS = {
	["meet-mentor"] = "Talk to your mentor first!",
	["wrong-station"] = "Not this one yet. Look at the top of your screen for where to go next.",
	["too-far"] = "Come a little closer.",
	["failed"] = "Let's try that again.",
	["complete"] = "You already finished this chapter!",
}
remotes:WaitForChild("StationHint").OnClientEvent:Connect(function(kind: any)
	local text = HINTS[kind]
	if text then
		panel.Visible = true
		goalLabel.Text = text
		detailLabel.Text = ""
		task.delay(4, function()
			if goalLabel.Text == text then
				panel.Visible = false
			end
		end)
	end
end)

local challengeRemotes = ReplicatedStorage:WaitForChild("ChallengeRemotes", math.huge)
local notify = challengeRemotes:WaitForChild("Notify", math.huge) :: RemoteEvent
local state = challengeRemotes:WaitForChild("State", math.huge) :: RemoteEvent

notify.OnClientEvent:Connect(function(_id: any, text: any, kind: any)
	if type(text) ~= "string" then
		return
	end
	panel.Visible = true
	if kind == "goal" then
		goalLabel.Text = text
		detailLabel.Text = ""
	else
		detailLabel.Text = text
		detailLabel.TextColor3 = COLORS[kind] or COLORS.info
	end
end)

state.OnClientEvent:Connect(function(_id: any, payload: any)
	local text = describeProgress(payload)
	if text then
		panel.Visible = true
		detailLabel.Text = text
		detailLabel.TextColor3 = COLORS.info
	end
end)

