--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local StarterGui = game:GetService("StarterGui")
local TextChatService = game:GetService("TextChatService")
local Workspace = game:GetService("Workspace")

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
local selectChapter = remotes:WaitForChild("SelectChapter") :: RemoteFunction
local setLocale = remotes:WaitForChild("SetLocale") :: RemoteFunction
local runChallenge = remotes:WaitForChild("RunChallenge") :: RemoteFunction
local say = remotes:WaitForChild("Say") :: RemoteEvent
local phraseShown = remotes:WaitForChild("PhraseShown") :: RemoteEvent

local shared = ReplicatedStorage:WaitForChild("MiraVerseShared")
local atlas = shared:WaitForChild("Atlas")
local Catalog = require(atlas:WaitForChild("Catalog")) :: any
local Locale = require(atlas:WaitForChild("Locale")) :: any
local Packs = require(shared:WaitForChild("Packs")) :: any

local PHRASES = { "Hello!", "Great job!", "Follow me!", "Thank you!" }
local ROW_HEIGHT = 44
local ROW_GAP = 6

local locale = Catalog.defaultLocale
local currentState: any = nil

local function t(key: string, ...: any): string
	return Locale.get(locale, key, ...)
end

local gui = UI.make("ScreenGui", { Name = "MiraVerseUI", ResetOnSpawn = false }, player:WaitForChild("PlayerGui"))

-- A titled panel with a scrolling list, sized to fit phones.
local function makeListPanel(name: string)
	local panel = UI.panel(gui, UDim2.fromScale(0.6, 0.72), UDim2.fromScale(0.2, 0.12))
	panel.Name = name
	panel.Visible = false
	local title = UI.label(panel, "", UDim2.fromScale(0.9, 0.11), UDim2.fromScale(0.05, 0.02))
	local list = UI.make("ScrollingFrame", {
		Size = UDim2.fromScale(0.9, 0.84),
		Position = UDim2.fromScale(0.05, 0.14),
		BackgroundTransparency = 1,
		BorderSizePixel = 0,
		ScrollBarThickness = 6,
		AutomaticCanvasSize = Enum.AutomaticSize.Y,
		CanvasSize = UDim2.new(),
	}, panel)
	UI.make("UIListLayout", { Padding = UDim.new(0, ROW_GAP), SortOrder = Enum.SortOrder.LayoutOrder }, list)
	return panel, title, list
end

local function fillList(list: any, rows: { { text: string, action: () -> () } })
	for _, child in list:GetChildren() do
		if child:IsA("TextButton") then
			child:Destroy()
		end
	end
	for index, row in rows do
		local button = UI.button(list, row.text, UDim2.new(1, -10, 0, ROW_HEIGHT), row.action)
		button.LayoutOrder = index
	end
end

local languagePanel, languageTitle, languageList = makeListPanel("LanguagePanel")
local countryPanel, countryTitle, countryList = makeListPanel("CountryPanel")
local chapterPanel, chapterTitle, chapterList = makeListPanel("ChapterPanel")

-- HUD
local hud = UI.panel(gui, UDim2.fromScale(0.34, 0.16), UDim2.fromScale(0.33, 0.02))
hud.Visible = false
local hudText = UI.label(hud, "", UDim2.fromScale(0.94, 0.45), UDim2.fromScale(0.03, 0.04))
local playBtn: TextButton
local hudBackBtn: TextButton

-- Reward modal
local modal = UI.panel(gui, UDim2.fromScale(0.5, 0.42), UDim2.fromScale(0.25, 0.29))
modal.Visible = false
modal.ZIndex = 10
local modalTitle = UI.label(modal, "", UDim2.fromScale(0.9, 0.3), UDim2.fromScale(0.05, 0.05))
local modalCode = UI.label(modal, "", UDim2.fromScale(0.9, 0.3), UDim2.fromScale(0.05, 0.36))
modalTitle.ZIndex = 11
modalCode.ZIndex = 11
local closeBtn: TextButton

local toast = UI.panel(gui, UDim2.fromScale(0.6, 0.11), UDim2.fromScale(0.2, 0.2))
toast.Name = "ChallengeToast"
toast.Visible = false
local toastMessage = UI.label(toast, "", UDim2.fromScale(0.94, 0.86), UDim2.fromScale(0.03, 0.07))
toastMessage.Name = "Message"
local toastVersion = 0
local TOAST_SECONDS = 6

local function showToast(text: string)
	toastVersion += 1
	local version = toastVersion
	toastMessage.Text = text
	toast.Visible = true
	task.delay(TOAST_SECONDS, function()
		if version == toastVersion then
			toast.Visible = false
		end
	end)
end

local showCountries: () -> ()
local showChapters: () -> ()

local function renderHud(state: any)
	currentState = state
	if not state or not state.total or state.total == 0 then
		return
	end
	hudText.Text = t("rbx.progress", state.index, state.total)
end

local function beginPlay(state: any, greetingKey: string?)
	chapterPanel.Visible = false
	hud.Visible = true
	renderHud(state)
	if greetingKey then
		showToast(t(greetingKey))
	end
end

function showChapters()
	local state = currentState
	if not state or not state.country then
		return
	end
	hud.Visible = false
	chapterTitle.Text = t("rbx.choose_chapter")
	local rows = {}
	if Packs[state.country] then
		table.insert(rows, {
			text = t("rbx.classic_adventure"),
			action = function()
				local res = selectChapter:InvokeServer(false)
				if res and res.ok then
					beginPlay(res.state)
				end
			end,
		})
	end
	for _, chapter in Catalog.chapters do
		if chapter.country == state.country then
			local status = ""
			if state.completedChapters[chapter.id] then
				status = " (" .. t("rbx.completed") .. ")"
			elseif chapter.prerequisite and not state.completedChapters[chapter.prerequisite] then
				status = " (" .. t("rbx.locked") .. ")"
			end
			table.insert(rows, {
				text = chapter.index .. ". " .. t(chapter.titleKey) .. status,
				action = function()
					local res = selectChapter:InvokeServer(chapter.id)
					if res and res.ok then
						beginPlay(res.state, chapter.greetingKey)
					elseif res and res.reason == "locked" then
						showToast(t("rbx.locked"))
					end
				end,
			})
		end
	end
	table.insert(rows, {
		text = t("rbx.back"),
		action = function()
			chapterPanel.Visible = false
			showCountries()
		end,
	})
	fillList(chapterList, rows)
	chapterPanel.Visible = true
end

function showCountries()
	countryTitle.Text = t("rbx.choose_country")
	local rows = {}
	for _, country in Catalog.countries do
		table.insert(rows, {
			text = t(country.nameKey),
			action = function()
				local res = selectCountry:InvokeServer(country.code)
				if res and res.ok then
					countryPanel.Visible = false
					currentState = res.state
					showChapters()
				end
			end,
		})
	end
	fillList(countryList, rows)
	countryPanel.Visible = true
end

local function applyLocaleText()
	if playBtn then
		playBtn.Text = t("rbx.play_challenge")
		hudBackBtn.Text = t("rbx.back")
		closeBtn.Text = t("rbx.close")
	end
end

languageTitle.Text = t("rbx.choose_language")
do
	local rows = {}
	for _, entry in Catalog.locales do
		table.insert(rows, {
			text = entry.name,
			action = function()
				if setLocale:InvokeServer(entry.id) then
					locale = entry.id
					applyLocaleText()
					languagePanel.Visible = false
					showCountries()
				end
			end,
		})
	end
	fillList(languageList, rows)
end

closeBtn = UI.button(modal, t("rbx.close"), UDim2.fromScale(0.4, 0.2), function()
	modal.Visible = false
	showChapters()
end)
closeBtn.Position = UDim2.fromScale(0.3, 0.72)
closeBtn.ZIndex = 11

playBtn = UI.button(hud, t("rbx.play_challenge"), UDim2.fromScale(0.44, 0.42), function()
	playBtn.Active = false
	local chapterId = currentState and currentState.chapterId
	local res = runChallenge:InvokeServer()
	playBtn.Active = true
	if res and res.state then
		renderHud(res.state)
	end
	if not (res and res.ok) then
		return
	end
	if res.stamp then
		modalTitle.Text = t("rbx.souvenir_stamp")
		modalCode.Text = res.stamp
		modal.Visible = true
	elseif res.chapterComplete and chapterId then
		for _, chapter in Catalog.chapters do
			if chapter.id == chapterId then
				modalTitle.Text = t(chapter.titleKey)
				modalCode.Text = t("rbx.reward", t(chapter.artifactKey))
				showToast(t(chapter.completionKey))
			end
		end
		modal.Visible = true
	end
end)
playBtn.Position = UDim2.fromScale(0.04, 0.52)

hudBackBtn = UI.button(hud, t("rbx.back"), UDim2.fromScale(0.44, 0.42), function()
	showChapters()
end)
hudBackBtn.Position = UDim2.fromScale(0.52, 0.52)

-- The Phoenicia staging build starts in Tyre, so these menus would cover it.
languagePanel.Visible = Workspace:GetAttribute("MV_PHOENICIA") ~= true

-- Challenge goals and feedback from the server.
local challengeRemotes = ReplicatedStorage:WaitForChild("ChallengeRemotes")
local notify = challengeRemotes:WaitForChild("Notify") :: RemoteEvent
notify.OnClientEvent:Connect(function(_challengeId: any, text: any)
	if type(text) == "string" then
		showToast(text)
	end
end)

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
