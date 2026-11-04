-- Trade: player offers required items to the mentor and receives the reward.
local Trade = {}
Trade.__index = Trade

function Trade.start(ctx)
	local self = setmetatable({ ctx = ctx }, Trade)
	local mentor = ctx.pack.mentor or {}
	local part = ctx.newPart("Mentor", Vector3.new(3, 6, 3), ctx.origin() * CFrame.new(0, 3, -10), Color3.fromRGB(240, 200, 150))
	ctx.label(part, mentor.name or "Mentor")
	ctx.click(part, function()
		self:describe()
		-- Convenience: clicking the mentor offers exactly what is needed.
		self:offer(ctx.challenge.needs)
	end)
	return self
end

function Trade:describe()
	local parts = {}
	for _, n in ipairs(self.ctx.challenge.needs or {}) do
		table.insert(parts, n.count .. " x " .. self.ctx.itemName(n.item))
	end
	self.ctx.notify("Needs: " .. table.concat(parts, ", "), "info")
end

function Trade:offer(offered)
	local ctx = self.ctx
	if type(offered) ~= "table" then
		return
	end
	-- Aggregate the offer and compare with requirement exactly.
	local have = {}
	for _, o in ipairs(offered) do
		if type(o) ~= "table" or type(o.item) ~= "string" or type(o.count) ~= "number" or o.count < 1 or o.count % 1 ~= 0 then
			ctx.notify("That offer is not valid.", "error")
			return
		end
		have[o.item] = (have[o.item] or 0) + o.count
	end
	local need = {}
	for _, n in ipairs(ctx.challenge.needs or {}) do
		need[n.item] = (need[n.item] or 0) + n.count
	end
	for item, count in pairs(need) do
		if (have[item] or 0) < count then
			ctx.notify("Not enough " .. ctx.itemName(item) .. ".", "error")
			return
		end
	end
	for item in pairs(have) do
		if not need[item] then
			ctx.notify("The mentor did not ask for " .. ctx.itemName(item) .. ".", "error")
			return
		end
	end
	for item, count in pairs(need) do
		if not ctx.has(item, count) then
			ctx.notify("You do not have " .. ctx.itemName(item) .. " yet.", "error")
			return
		end
	end
	for item, count in pairs(need) do
		ctx.remove(item, count)
	end
	local reward = ctx.challenge.reward
	if reward then
		ctx.grant(reward.item, reward.count)
		ctx.notify("Received " .. reward.count .. " x " .. ctx.itemName(reward.item), "ok")
	end
	ctx.finish(true)
end

function Trade:onAction(action)
	if action.kind == "offer" then
		self:offer(action.items)
	end
end

return Trade
