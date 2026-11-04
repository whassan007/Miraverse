-- Word: three words must be matched in the presented order.
local Word = {}
Word.__index = Word

function Word.start(ctx)
	local self = setmetatable({ ctx = ctx, words = ctx.challenge.words, step = 0 }, Word)
	local origin = ctx.origin()
	for i, w in ipairs(self.words) do
		local off = (i - (#self.words + 1) / 2) * 6
		local part = ctx.newPart("Word_" .. i, Vector3.new(5, 3, 1), origin * CFrame.new(off, 2, -10), Color3.fromRGB(250, 235, 180))
		ctx.label(part, w.word .. " (" .. w.translit .. ")")
		ctx.click(part, function()
			self:pick(i)
		end)
	end
	self:prompt()
	return self
end

function Word:prompt()
	local w = self.words[self.step + 1]
	if w then
		self.ctx.notify("Find the word for: " .. w.en, "info")
		self.ctx.progress({ step = self.step, total = #self.words, ask = w.en })
	end
end

function Word:pick(i)
	if self.step >= #self.words then
		return
	end
	if i == self.step + 1 then
		self.step += 1
		self.ctx.notify(self.words[i].word .. " = " .. self.words[i].en, "ok")
		if self.step == #self.words then
			self.ctx.finish(true)
		else
			self:prompt()
		end
	else
		self.ctx.notify("Not that one. Try again!", "error")
	end
end

function Word:onAction(action)
	if action.kind == "pick" and type(action.index) == "number" and action.index % 1 == 0 then
		self:pick(action.index)
	end
end

return Word
