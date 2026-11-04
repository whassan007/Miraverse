-- Cook: ordered recipe; each input must be added in sequence.
local Cook = {}
Cook.__index = Cook

function Cook.start(ctx)
	local recipe = ctx.challenge.recipe
	local self = setmetatable({ ctx = ctx, inputs = recipe.inputs, output = recipe.output, step = 0 }, Cook)
	local seen, distinct = {}, {}
	for _, id in ipairs(self.inputs) do
		if not seen[id] then
			seen[id] = true
			table.insert(distinct, id)
		end
	end
	local origin = ctx.origin()
	for i, id in ipairs(distinct) do
		local off = (i - (#distinct + 1) / 2) * 5
		local part = ctx.newPart("Station_" .. id, Vector3.new(3, 3, 3), origin * CFrame.new(off, 1.5, -10), ctx.itemColor(id))
		ctx.label(part, ctx.itemName(id))
		ctx.click(part, function()
			self:add(id)
		end)
	end
	ctx.progress({ step = 0, total = #self.inputs })
	return self
end

function Cook:add(id)
	if self.ctx.challenge.recipe == nil or self.step >= #self.inputs then
		return
	end
	if self.inputs[self.step + 1] == id then
		self.step += 1
		self.ctx.notify("Added " .. self.ctx.itemName(id), "ok")
		self.ctx.progress({ step = self.step, total = #self.inputs })
		if self.step == #self.inputs then
			self.ctx.grant(self.output, 1)
			self.ctx.notify("Made " .. self.ctx.itemName(self.output) .. "!", "ok")
			self.ctx.finish(true)
		end
	else
		self.step = 0
		self.ctx.notify("Wrong order! Start again from the first step.", "error")
		self.ctx.progress({ step = 0, total = #self.inputs })
	end
end

function Cook:onAction(action)
	if action.kind == "add" and type(action.item) == "string" then
		self:add(action.item)
	end
end

return Cook
