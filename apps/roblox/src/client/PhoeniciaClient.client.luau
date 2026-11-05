--!nonstrict
-- Phoenicia dialogue, toast and objective UI. Exits at once unless the feature flag is on.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

if Workspace:GetAttribute("MV_PHOENICIA") ~= true then
	return
end

local UI = require(script.Parent.UI)

local TOAST_SECONDS = 6
local BUTTON_HEIGHT = 0.13

local remotes = ReplicatedStorage:WaitForChild("PhoeniciaRemotes")
local player = Players.LocalPlayer

local gui = UI.make("ScreenGui", { Name = "PhoeniciaUI", ResetOnSpawn = false, IgnoreGuiInset = true }, player:WaitForChild("PlayerGui"))

local objective = UI.panel(gui, UDim2.fromScale(0.4, 0.1), UDim2.fromScale(0.3, 0.02))
local objectiveTitle = UI.label(objective, "", UDim2.fromScale(0.96, 0.45), UDim2.fromScale(0.02, 0.05))
local objectiveText = UI.label(objective, "", UDim2.fromScale(0.96, 0.45), UDim2.fromScale(0.02, 0.5))
objective.Visible = false

local toast = UI.panel(gui, UDim2.fromScale(0.6, 0.12), UDim2.fromScale(0.2, 0.14))
local toastText = UI.label(toast, "", UDim2.fromScale(0.96, 0.9), UDim2.fromScale(0.02, 0.05))
toastText.TextWrapped = true
toast.Visible = false
local toastVersion = 0

local dialog = UI.panel(gui, UDim2.fromScale(0.7, 0.72), UDim2.fromScale(0.15, 0.14))
dialog.ZIndex = 10
dialog.Visible = false
local dialogTitle = UI.label(dialog, "", UDim2.fromScale(0.92, 0.1), UDim2.fromScale(0.04, 0.03))
dialogTitle.ZIndex = 11
local bodyScroll = UI.make("ScrollingFrame", {
	Size = UDim2.fromScale(0.92, 0.42),
	Position = UDim2.fromScale(0.04, 0.14),
	BackgroundTransparency = 1,
	ZIndex = 11,
	AutomaticCanvasSize = Enum.AutomaticSize.Y,
	CanvasSize = UDim2.new(),
	ScrollBarThickness = 6,
}, dialog)
local dialogBody = UI.label(bodyScroll, "", UDim2.fromScale(1, 0), UDim2.fromScale(0, 0))
dialogBody.AutomaticSize = Enum.AutomaticSize.Y
dialogBody.TextWrapped = true
dialogBody.TextScaled = false
dialogBody.TextSize = 18
dialogBody.BackgroundTransparency = 1
dialogBody.ZIndex = 12
local optionButtons = {}

local function applyDirection(direction)
	local alignment = direction == "rtl" and Enum.TextXAlignment.Right or Enum.TextXAlignment.Left
	dialogTitle.TextXAlignment = alignment
	dialogBody.TextXAlignment = alignment
end

remotes:WaitForChild("Ask").OnClientEvent:Connect(function(token, request)
	for _, button in optionButtons do
		button:Destroy()
	end
	table.clear(optionButtons)
	dialogTitle.Text = request.title
	dialogBody.Text = request.body
	applyDirection(request.direction)
	local maxButtons = math.max(#request.options, 4)
	for index, option in request.options do
		local button = UI.button(dialog, option.label, UDim2.fromScale(0.92, BUTTON_HEIGHT * 4 / maxButtons - 0.01), function()
			dialog.Visible = false
			remotes.Answer:FireServer(token, option.id)
		end)
		button.Position = UDim2.fromScale(0.04, 0.58 + (index - 1) * (BUTTON_HEIGHT * 4 / maxButtons))
		button.ZIndex = 11
		table.insert(optionButtons, button)
	end
	dialog.Visible = true
end)

remotes:WaitForChild("Toast").OnClientEvent:Connect(function(text)
	toastVersion += 1
	local version = toastVersion
	toastText.Text = text
	toast.Visible = true
	task.delay(TOAST_SECONDS, function()
		if version == toastVersion then
			toast.Visible = false
		end
	end)
end)

remotes:WaitForChild("Objective").OnClientEvent:Connect(function(title, text)
	objectiveTitle.Text = title
	objectiveText.Text = text
	objective.Visible = true
end)
