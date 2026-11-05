-- Trade: player offers required items to the mentor and receives the reward.
local MentorCharacter = require(script.Parent.Parent.Characters.MentorCharacter)

local Trade = {}
Trade.__index = Trade

function Trade.start(ctx)
	local self = setmetatable({ ctx = ctx }, Trade)
	local mentor = ctx.pack.mentor or {}
	local mentorName = mentor.nameKey and ctx.t(mentor.nameKey) or mentor.name or "Mentor"
	local place = ctx.origin() * CFrame.new(0, 3, -10)
	local part = ctx.newPart("Mentor", Vector3.new(3, 6, 3), place, Color3.fromRGB(240, 200, 150))
	part.Transparency = 1
	local colors = ctx.pack.colors or {}
	local function color(hex, fallback)
		local ok, value = pcall(Color3.fromHex, hex)
		return ok and value or fallback
	end
	MentorCharacter.build(
		"MentorCharacter",
		place * CFrame.new(0, -3, 0) * CFrame.Angles(0, math.pi, 0),
		color(colors.primary, Color3.fromRGB(120, 60, 70)),
		color(colors.secondary, Color3.fromRGB(220, 180, 90)),
		ctx.folder,
		ctx.pack.characterStyle
	)
	ctx.label(part, mentorName)
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
	self.ctx.say("rbx.needs", table.concat(parts, ", "))
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
			ctx.say("rbx.offer_invalid")
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
			ctx.say("rbx.not_enough", ctx.itemName(item))
			return
		end
	end
	for item in pairs(have) do
		if not need[item] then
			ctx.say("rbx.not_asked", ctx.itemName(item))
			return
		end
	end
	for item, count in pairs(need) do
		if not ctx.has(item, count) then
			ctx.say("rbx.do_not_have", ctx.itemName(item))
			return
		end
	end
	for item, count in pairs(need) do
		ctx.remove(item, count)
	end
	local reward = ctx.challenge.reward
	if reward then
		ctx.grant(reward.item, reward.count)
		ctx.say("rbx.received", reward.count, ctx.itemName(reward.item))
	end
	ctx.finish(true)
end

function Trade:onAction(action)
	if action.kind == "offer" then
		self:offer(action.items)
	end
end

return Trade
