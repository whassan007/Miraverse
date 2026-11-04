--!strict
-- Small UI helpers (no external assets, no network).
local UI = {}

function UI.make(class: string, props: { [string]: any }, parent: Instance?): any
	local inst = Instance.new(class)
	for k, v in props do
		(inst :: any)[k] = v
	end
	inst.Parent = parent
	return inst
end

function UI.button(parent: Instance, text: string, size: UDim2, onClick: () -> ()): TextButton
	local b = UI.make("TextButton", {
		Text = text,
		Size = size,
		BackgroundColor3 = Color3.fromRGB(255, 196, 61),
		TextColor3 = Color3.fromRGB(40, 30, 10),
		Font = Enum.Font.FredokaOne,
		TextScaled = true,
	}, parent)
	UI.make("UICorner", { CornerRadius = UDim.new(0, 12) }, b)
	b.Activated:Connect(onClick)
	return b
end

function UI.panel(parent: Instance, size: UDim2, pos: UDim2): Frame
	local f = UI.make("Frame", {
		Size = size,
		Position = pos,
		BackgroundColor3 = Color3.fromRGB(32, 41, 77),
		BackgroundTransparency = 0.1,
	}, parent)
	UI.make("UICorner", { CornerRadius = UDim.new(0, 16) }, f)
	return f
end

function UI.label(parent: Instance, text: string, size: UDim2, pos: UDim2): TextLabel
	return UI.make("TextLabel", {
		Text = text,
		Size = size,
		Position = pos,
		BackgroundTransparency = 1,
		TextColor3 = Color3.new(1, 1, 1),
		Font = Enum.Font.GothamMedium,
		TextScaled = true,
		TextWrapped = true,
	}, parent)
end

return UI
