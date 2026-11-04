--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local StarterGui = game:GetService("StarterGui")
local TextChatService = game:GetService("TextChatService")

local UI = require(script.Parent.UI)

-- Child safety: no free-text chat.
pcall(function()
	TextChatService.ChatWindowConfiguration.Enabled = false
	TextChatService.ChatInputBarConfiguration.Enabled = false
end)
pcall(function()
	StarterGui:SetCoreGuiEnabled(Enum.CoreGuiType.Chat, false)
end)

local player = Players.LocalPlayer
local remotes = ReplicatedStorage:WaitForChild("MiraVerseRemotes")
local getState = remotes:WaitForChild("GetState") :: RemoteFunction
local selectCountry = remotes:WaitForChild("SelectCountry") :: RemoteFunction
local runChallenge = remotes:WaitForChild("RunChallenge") :: RemoteFunction
local say = remotes:WaitForChild("Say") :: RemoteEvent
local phraseShown = remotes:WaitForChild("PhraseShown") :: RemoteEvent

local PHRASES = { "Hello!", "Great job!", "Follow me!", "Thank you!" }
local COUNTRIES = {
	{ "LB", "Lebanon" },
	{ "EG", "Egypt" },
	{ "IQ", "Iraq" },
	{ "KR", "South Korea" },
	{ "FR", "France" },
}

local gui = UI.make("ScreenGui", { Name = "MiraVerseUI", ResetOnSpawn = false }, player:WaitForChild("PlayerGui"))

-- Country selection
local picker = UI.panel(gui, UDim2.fromScale(0.5, 0.6), UDim2.fromScale(0.25, 0.2))
UI.label(picker, "Choose a country!", UDim2.fromScale(0.9, 0.14), UDim2.fromScale(0.05, 0.03))

-- HUD
local hud = UI.panel(gui, UDim2.fromScale(0.28, 0.14), UDim2.fromScale(0.01, 0.02))
hud.Visible = false
local hudText = UI.label(hud, "", UDim2.fromScale(0.94, 0.5), UDim2.fromScale(0.03, 0.05))
local playBtn: TextButton
local lobbyButton: TextButton

-- Stamp modal
local modal = UI.panel(gui, UDim2.fromScale(0.4, 0.4), UDim2.fromScale(0.3, 0.3))
modal.Visible = false
modal.ZIndex = 10
local modalTitle = UI.label(modal, "Souvenir stamp!", UDim2.fromScale(0.9, 0.25), UDim2.fromScale(0.05, 0.05))
local modalCode = UI.label(modal, "", UDim2.fromScale(0.9, 0.3), UDim2.fromScale(0.05, 0.35))
modalTitle.ZIndex = 11
modalCode.ZIndex = 11
local closeBtn = UI.button(modal, "Close", UDim2.fromScale(0.4, 0.2), function()
	modal.Visible = false
end)
closeBtn.Position = UDim2.fromScale(0.3, 0.72)
closeBtn.ZIndex = 11

local function render(state: any)
	if not state then
		return
	end
	if not state.country then
		picker.Visible = true
		hud.Visible = false
		return
	end
	picker.Visible = false
	hud.Visible = true
	playBtn.Visible = not state.hasStations and not state.stamp
	lobbyButton.Visible = state.hasStations
	if state.stamp then
		hudText.Text = "Chapter complete! Stamp: " .. state.stamp
	elseif state.hasStations and not state.met then
		hudText.Text = "Go and talk to your mentor"
	elseif state.hasStations and state.nextLabel then
		hudText.Text = string.format("Next: %s (%d of %d done)", state.nextLabel, state.done, state.total)
	else
		hudText.Text = string.format("%s - challenge %d of %d (%d done)", state.country, state.index, state.total, state.done)
	end
end

for i, c in COUNTRIES do
	local btn = UI.button(picker, c[2], UDim2.fromScale(0.9, 0.12), function()
		local res = selectCountry:InvokeServer(c[1])
		if res and res.ok then
			render(res.state)
		end
	end)
	btn.Position = UDim2.fromScale(0.05, 0.2 + (i - 1) * 0.15)
end

playBtn = UI.button(hud, "Play challenge", UDim2.fromScale(0.5, 0.4), function()
	playBtn.Active = false
	local res = runChallenge:InvokeServer()
	playBtn.Active = true
	if res and res.state then
		render(res.state)
	end
	if res and res.ok and res.stamp then
		modalCode.Text = res.stamp
		modal.Visible = true
	end
end)
playBtn.Position = UDim2.fromScale(0.25, 0.55)

-- Predefined phrase bar (the only communication allowed)
local bar = UI.panel(gui, UDim2.fromScale(0.5, 0.08), UDim2.fromScale(0.25, 0.9))
for i, text in PHRASES do
	local b = UI.button(bar, text, UDim2.fromScale(0.23, 0.76), function()
		say:FireServer(i)
	end)
	b.Position = UDim2.fromScale(0.01 + (i - 1) * 0.248, 0.12)
end

phraseShown.OnClientEvent:Connect(function(userId: any, text: any)
	if type(userId) ~= "number" or type(text) ~= "string" then
		return
	end
	local other = Players:GetPlayerByUserId(userId)
	local char = other and other.Character
	local head = char and char:FindFirstChild("Head")
	if not head then
		return
	end
	local bb = UI.make("BillboardGui", {
		Size = UDim2.fromOffset(160, 40),
		StudsOffset = Vector3.new(0, 3, 0),
		AlwaysOnTop = true,
		Adornee = head,
	}, gui)
	UI.label(bb, text, UDim2.fromScale(1, 1), UDim2.fromScale(0, 0)).BackgroundTransparency = 0.2
	task.delay(3, function()
		bb:Destroy()
	end)
end)

lobbyButton = UI.button(hud, "Back to Lobby", UDim2.fromScale(0.5, 0.34), function()
	(remotes:WaitForChild("GoToLobby") :: RemoteEvent):FireServer()
end)
lobbyButton.Position = UDim2.fromScale(0.25, 0.6)

local stateChanged = remotes:WaitForChild("StateChanged") :: RemoteEvent
local stationHint = remotes:WaitForChild("StationHint") :: RemoteEvent
stateChanged.OnClientEvent:Connect(render)
stationHint.OnClientEvent:Connect(function(kind: any, detail: any)
	if kind == "stamp" and type(detail) == "string" then
		modalCode.Text = detail
		modal.Visible = true
	end
end)

task.spawn(function()
	render(getState:InvokeServer())
end)
