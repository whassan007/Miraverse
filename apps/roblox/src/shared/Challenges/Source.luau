-- Source check: the player reads where a chapter's story comes from and labels it
-- as tradition, history, folklore, literature or game fiction.
local Source = {}
Source.__index = Source

function Source.start(ctx)
	local self = setmetatable({ ctx = ctx }, Source)
	local challenge = ctx.challenge
	ctx.say(challenge.noteKey)
	local origin = ctx.origin()
	for i, option in ipairs(challenge.options) do
		local offset = (i - (#challenge.options + 1) / 2) * 7
		local part = ctx.newPart("Label_" .. option, Vector3.new(6, 3, 1), origin * CFrame.new(offset, 2, -10), Color3.fromRGB(250, 235, 180))
		ctx.label(part, ctx.t("class." .. option))
		ctx.click(part, function()
			self:pick(option)
		end)
	end
	return self
end

function Source:pick(option)
	if option == self.ctx.challenge.answer then
		self.ctx.say("rbx.source_correct")
		self.ctx.finish(true)
	else
		self.ctx.say("rbx.not_that_one")
	end
end

function Source:onAction(action)
	if action.kind == "pick" and type(action.option) == "string" then
		self:pick(action.option)
	end
end

return Source
